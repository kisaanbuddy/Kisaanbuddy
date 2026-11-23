"""Regression tests: all external responses here are isolated test doubles."""
import hashlib
import json
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from services.chat.knowledge import KnowledgeBase
from services.chat.provenance import read_provenance
from services.chat.live_evidence import weather_evidence
from services.chat.language_detect import detect_language, resolve_language
from services.whatsapp.market_data import normalize_observation
from services.whatsapp.client import WhatsAppClient, WhatsAppAPIError
from services.whatsapp.security import is_safe_media_url


def reviewed_document(tmp_path):
    doc = tmp_path / 'reviewed.md'
    doc.write_text('## Wheat\nWheat observations from a test source.', encoding='utf-8')
    now = datetime.now(timezone.utc)
    metadata = dict(source_url='https://example.gov.in/publication', publisher='Test publisher',
                    title='Test document', publication_date='2025-01-01', geography=['India'],
                    topics=['crop_cultivation'], version='1', reviewed_by='test reviewer',
                    reviewed_at=(now-timedelta(days=1)).isoformat(),
                    review_expires_at=(now+timedelta(days=1)).isoformat(),
                    sha256=hashlib.sha256(doc.read_bytes()).hexdigest(), review_status='approved')
    doc.with_suffix('.source.json').write_text(json.dumps(metadata), encoding='utf-8')
    return doc, metadata


def test_kb_excludes_legacy_and_modified_documents(tmp_path):
    (tmp_path / 'legacy.md').write_text('## Wheat\nUnsupported wheat fertilizer dose.', encoding='utf-8')
    doc, _ = reviewed_document(tmp_path)
    kb = KnowledgeBase()
    kb.load(tmp_path)
    assert len(kb.chunks) == 1
    assert kb.chunks[0].provenance['version'] == '1'
    doc.write_text('tampered wheat', encoding='utf-8')
    kb.load(tmp_path)
    assert kb.chunks == []


def test_kb_excludes_expired_review(tmp_path):
    doc, metadata = reviewed_document(tmp_path)
    metadata['review_expires_at'] = '2020-01-01T00:00:00+00:00'
    doc.with_suffix('.source.json').write_text(json.dumps(metadata))
    assert read_provenance(doc) is None


@pytest.mark.parametrize('url', ['http://lookaside.fbsbx.com/a', 'https://lookaside.fbsbx.com.evil.test/a',
                               'https://user:pass@lookaside.fbsbx.com/a', 'https://lookaside.fbsbx.com:8080/a'])
def test_media_rejects_unsafe_transport(url):
    assert not is_safe_media_url(url)


@pytest.mark.asyncio
async def test_missing_credentials_cannot_simulate_delivery():
    client = WhatsAppClient()
    with patch('services.whatsapp.client.is_whatsapp_configured', return_value=False):
        with pytest.raises(WhatsAppAPIError):
            await client.send_text_message('+919876543210', 'test')
        with pytest.raises(WhatsAppAPIError):
            await client.get_media_metadata('123')
        assert await client.mark_message_as_read('123') is False


def test_weather_uses_nested_real_values_and_rejects_stale():
    now = datetime.now(timezone.utc).isoformat()
    data = dict(provider='weatherapi', location={'name': 'Test district'}, fetched_at=now,
                current={'temp_c': 0, 'humidity': 0, 'observed_at': now})
    result = weather_evidence(data)
    assert result['temp_c'] == 0
    assert result['humidity'] == 0
    assert 'wind_kph' not in result
    data['current']['observed_at'] = '2020-01-01T00:00:00Z'
    assert 'error' in weather_evidence(data)
    data['provider'] = 'demo'
    assert 'error' in weather_evidence(data)


@pytest.mark.parametrize('date,price', [('invalid', '100'), ('2020-01-01', '100'), ('2026-11-22', 'nan')])
def test_market_rejects_missing_stale_and_nonfinite(date, price):
    row = dict(commodity='Wheat', market='Test market', state='Test state', district='Test district',
               arrival_date=date, min_price=price, modal_price=price, max_price=price)
    assert normalize_observation(row, datetime(2026, 11, 22, tzinfo=timezone.utc)) is None


def test_odia_and_explicit_dialect_preference():
    assert detect_language('ମୋ ଫସଲ') == 'or'
    assert resolve_language('mai', 'मेरे गेहूं') == 'mai'


@pytest.mark.asyncio
async def test_followup_uses_same_real_session_and_preserves_fragment():
    from services.whatsapp import conversation
    from services.chat.memory import SessionStore
    store = SessionStore()
    captured = []
    async def chat(req):
        captured.append(req)
        assert await store.get(req.session_id) is not None
        return SimpleNamespace(content='test provider reply')
    with patch.object(conversation, 'sessions', store), \
         patch.object(conversation, 'is_gemini_configured', return_value=True), \
         patch.object(conversation._orchestrator, 'chat_once', side_effect=chat):
        await conversation.answer_agricultural_question('मेरे गेहूं के पत्ते पीले हैं', '+919876543210', 'hi')
        await conversation.answer_agricultural_question('नीचे', '+919876543210', 'hi')
    assert captured[0].session_id == captured[1].session_id
    assert captured[1].message == 'नीचे'
    assert '9876543210' not in captured[0].session_id


@pytest.mark.asyncio
async def test_whatsapp_rejects_unapproved_tools_even_if_model_requests_them():
    from services.chat.chat_service import _execute_gemini_tools
    with patch('services.chat.chat_service.run_tool', new_callable=AsyncMock) as run:
        results = await _execute_gemini_tools([SimpleNamespace(name='post_job', args={})], {'get_weather'})
    assert 'error' in results[0]
    run.assert_not_awaited()


@pytest.fixture
def isolated_db():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from db.session import Base
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine)() as db:
        yield db
    engine.dispose()


def test_inbox_durable_claim_and_ordering(isolated_db):
    from db.models import WhatsAppInboxJob
    from services.whatsapp.inbox import claim_job
    db = isolated_db
    for mid, phone in [('1', 'a'), ('2', 'a'), ('3', 'b')]:
        db.add(WhatsAppInboxJob(message_id=mid, phone_number=phone, payload_json='{}'))
    db.commit()
    first = claim_job(db)
    assert first[0] == 1
    second = claim_job(db)
    assert second[0] == 3  # Same farmer's second turn cannot overlap the first.
    assert claim_job(db) is None
    db.query(WhatsAppInboxJob).filter_by(id=1).update({'status': 'completed'})
    db.commit()
    assert claim_job(db)[0] == 2


def test_inbox_expired_lease_is_not_blindly_replayed(isolated_db):
    from db.models import WhatsAppInboxJob
    from services.whatsapp.inbox import claim_job
    db = isolated_db
    db.add(WhatsAppInboxJob(message_id='1', phone_number='a', payload_json='{}',
                           status='processing', lease_until=datetime.utcnow()-timedelta(seconds=1)))
    db.commit()
    assert claim_job(db) is None
    assert db.query(WhatsAppInboxJob).one().status == 'needs_review'


def test_inbound_audit_and_queue_are_persisted_together(isolated_db):
    from services.whatsapp.service import whatsapp_service, InboundRecordResult
    from db.models import WhatsAppInboxJob, WhatsAppMessage
    msg = {'id': 'inbound-test-1', 'type': 'text', 'text': {'body': 'wheat leaves yellow'}}
    result = whatsapp_service._record_inbound_message(msg, '+919876543210', isolated_db, queue_payload={'msg': msg})
    assert result == InboundRecordResult.RECORDED
    assert isolated_db.query(WhatsAppMessage).count() == 1
    assert isolated_db.query(WhatsAppInboxJob).count() == 1
    assert whatsapp_service._record_inbound_message(msg, '+919876543210', isolated_db, queue_payload={'msg': msg}) == InboundRecordResult.DUPLICATE
    assert isolated_db.query(WhatsAppInboxJob).count() == 1


@pytest.mark.asyncio
async def test_voice_routes_transcript_into_conversation(isolated_db):
    from db.models import WhatsAppUser
    from services.whatsapp.service import whatsapp_service
    db = isolated_db
    phone = '+919876543210'
    db.add(WhatsAppUser(phone_number=phone, language='hi', current_state='AGRICULTURAL_QUESTION'))
    db.commit()
    with patch('services.whatsapp.service.whatsapp_client.download_media', new=AsyncMock(return_value=(b'test audio', 'audio/ogg'))), \
         patch('services.chat.stt_service.transcribe', new=AsyncMock(return_value=SimpleNamespace(transcript='नीचे वाली पत्तियों में', language='hi'))), \
         patch('services.whatsapp.service.answer_agricultural_question', new=AsyncMock(return_value='test reply')) as answer, \
         patch.object(whatsapp_service, '_send_text', new=AsyncMock()):
        await whatsapp_service.process_message_turn(
            {'id': 'voice-test', 'type': 'audio', 'audio': {'id': 'media-test', 'mime_type': 'audio/ogg'}},
            phone, None, db)
    assert answer.await_args.kwargs['question'] == 'नीचे वाली पत्तियों में'


@pytest.mark.asyncio
async def test_numeric_followup_is_not_a_menu_command(isolated_db):
    from db.models import WhatsAppUser
    from services.whatsapp.service import whatsapp_service
    phone = '+919876543210'
    isolated_db.add(WhatsAppUser(phone_number=phone, language='hi', current_state='AGRICULTURAL_QUESTION'))
    isolated_db.commit()
    with patch('services.whatsapp.service.answer_agricultural_question', new=AsyncMock(return_value='test reply')) as answer, \
         patch.object(whatsapp_service, '_send_text', new=AsyncMock()):
        await whatsapp_service.process_message_turn(
            {'id': 'followup-test', 'type': 'text', 'text': {'body': '3'}}, phone, None, isolated_db)
    assert answer.await_args.kwargs['question'] == '3'


@pytest.mark.asyncio
async def test_conversation_restores_after_memory_loss(isolated_db):
    from db.models import WhatsAppUser
    from schemas.chatbot import Message
    from services.whatsapp import conversation
    from services.chat.memory import SessionStore
    phone = '+919876543210'
    isolated_db.add(WhatsAppUser(phone_number=phone, language='en', current_state='AGRICULTURAL_QUESTION'))
    isolated_db.commit()
    store = SessionStore()
    seen = []
    async def chat(req):
        seen.append([m.content for m in (await store.get(req.session_id)).messages])
        await store.append(req.session_id, Message(id='test', role='user', content=req.message, created_at=datetime.now(timezone.utc)))
        return SimpleNamespace(content='test reply')
    with patch.object(conversation, 'sessions', store), \
         patch.object(conversation, 'is_gemini_configured', return_value=True), \
         patch.object(conversation._orchestrator, 'chat_once', side_effect=chat):
        await conversation.answer_agricultural_question('yellow wheat leaves', phone, db=isolated_db)
        await store.delete(conversation.session_key(phone))
        await conversation.answer_agricultural_question('lower ones', phone, db=isolated_db)
    assert seen[1] == ['yellow wheat leaves']


def test_new_inbox_migration_upgrade_and_downgrade(tmp_path):
    import importlib.util
    from pathlib import Path
    from sqlalchemy import create_engine, inspect
    from alembic.migration import MigrationContext
    from alembic.operations import Operations
    migration_path = Path(__file__).parents[1] / 'alembic/versions/009_whatsapp_durable_inbox.py'
    spec = importlib.util.spec_from_file_location('inbox_migration', migration_path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = create_engine('sqlite:///' + (tmp_path / 'migration.sqlite').as_posix())
    with engine.begin() as connection:
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
            migration.upgrade()  # Safe if create_all already initialized it.
            assert 'whatsapp_inbox_jobs' in inspect(connection).get_table_names()
            migration.downgrade()
            assert 'whatsapp_inbox_jobs' not in inspect(connection).get_table_names()
    engine.dispose()


@pytest.mark.asyncio
async def test_media_hash_mismatch_is_rejected():
    import httpx
    transport = httpx.MockTransport(lambda request: httpx.Response(200, content=b'changed data'))
    client = WhatsAppClient()
    async with httpx.AsyncClient(transport=transport) as http:
        with patch.object(client, 'get_media_metadata', new=AsyncMock(return_value={
            'url': 'https://lookaside.fbsbx.com/media', 'mime_type': 'audio/ogg',
            'sha256': hashlib.sha256(b'original data').hexdigest(),
        })), patch.object(client, '_get_client', new=AsyncMock(return_value=http)), \
             patch('services.whatsapp.client.is_whatsapp_configured', return_value=True):
            with pytest.raises(WhatsAppAPIError, match='integrity'):
                await client.download_media('123')


@pytest.mark.asyncio
async def test_read_timeout_is_not_retried():
    import httpx
    client = WhatsAppClient()
    http = SimpleNamespace(post=AsyncMock(side_effect=httpx.ReadTimeout('test timeout')))
    with patch.object(client, '_get_client', new=AsyncMock(return_value=http)):
        with pytest.raises(WhatsAppAPIError) as error:
            await client._post_with_retry('https://graph.facebook.com/test', {}, headers={})
    assert http.post.await_count == 1
    assert error.value.details['delivery_uncertain']


@pytest.mark.asyncio
async def test_summary_preserves_recent_turns_and_is_generated_by_provider():
    from services.whatsapp.conversation import compact_conversation
    session = SimpleNamespace(summary=None, messages=[SimpleNamespace(role='user', content=str(i)) for i in range(26)])
    with patch('services.chat.gemini_service.generate_with_retry', new=AsyncMock(
        return_value=(SimpleNamespace(text='Farmer reports wheat yellowing; age unknown.'), 'test-provider')
    )) as generate:
        await compact_conversation(session)
    assert len(session.messages) == 12
    assert session.messages[0].content == '14'
    assert session.summary == 'Farmer reports wheat yellowing; age unknown.'
    assert generate.await_args.kwargs['feature'] == 'whatsapp_summary'


def test_signature_bypass_cannot_disable_production_security():
    from core.config import settings
    from services.whatsapp.security import verify_webhook_signature
    with patch.object(settings, 'DEBUG', False), patch.object(settings, 'WHATSAPP_SIGNATURE_VERIFICATION', False):
        assert not verify_webhook_signature(b'{}', None)


@pytest.mark.asyncio
@pytest.mark.parametrize('review_fails', [False, True])
async def test_only_reviewed_reply_is_returned_and_remembered(review_fails):
    from schemas.chatbot import AssistantRequest, Message
    from services.chat.memory import SessionStore, _MemoryBackend
    from services.chat.chat_service import ChatOrchestrator, ChatError
    store = SessionStore(backend=_MemoryBackend())
    state = await store.create(language='en')
    await store.append(state.id, Message(id='u', role='user', content='yellow leaves', created_at=datetime.now(timezone.utc)))
    await store.append(state.id, Message(id='a', role='assistant', content='unsupported draft', created_at=datetime.now(timezone.utc)))
    orch = ChatOrchestrator(channel_instruction='grounded', session_store=store)
    async def stream(*args, **kwargs):
        yield {'event': 'session', 'data': {'session_id': state.id}}
        yield {'event': 'grounding_evidence', 'data': {'reference': 'No reviewed guidance'}}
        yield {'event': 'token', 'data': {'text': 'unsupported draft'}}
        yield {'event': 'done', 'data': {'session_id': state.id, 'message_id': 'a'}}
    guard = AsyncMock(side_effect=ValueError('test review failure')) if review_fails else AsyncMock(return_value='How old is the crop?')
    with patch.object(orch, 'stream_chat', stream), patch('services.chat.grounding_review.review_grounded_reply', guard):
        if review_fails:
            with pytest.raises(ChatError):
                await orch.chat_once(AssistantRequest(message='yellow leaves', session_id=state.id))
        else:
            reply = await orch.chat_once(AssistantRequest(message='yellow leaves', session_id=state.id))
            assert reply.content == 'How old is the crop?'
    saved = await store.get(state.id)
    assert all(m.content != 'unsupported draft' for m in saved.messages)
