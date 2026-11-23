"""Fail-closed eligibility checks for operator-reviewed knowledge documents.

A sidecar is an audit record, not automatic proof that a URL is authoritative.
Reviewers must check the exact publication and extracted content before approval.
"""
import hashlib
import json
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit


def read_provenance(document: Path):
    try:
        data = json.loads(document.with_suffix('.source.json').read_text(encoding='utf-8'))
        required = ('source_url', 'publisher', 'title',
                    'geography', 'version', 'reviewed_by', 'reviewed_at',
                    'review_expires_at', 'sha256', 'topics')
        if any(not data.get(key) for key in required):
            return None
        if not data.get('publication_date') and data.get('publication_date_status') != 'not_reported':
            return None
        if data.get('publication_date'):
            date.fromisoformat(data['publication_date'])
        if not isinstance(data['geography'], list) or not isinstance(data['topics'], list):
            return None
        url = urlsplit(data['source_url'])
        if url.scheme != 'https' or not url.hostname or url.username or url.password:
            return None
        if data.get('review_status') != 'approved':
            return None
        if hashlib.sha256(document.read_bytes()).hexdigest() != data['sha256']:
            return None
        now = datetime.now(timezone.utc)
        reviewed = datetime.fromisoformat(data['reviewed_at'].replace('Z', '+00:00'))
        expires = datetime.fromisoformat(data['review_expires_at'].replace('Z', '+00:00'))
        if not reviewed.tzinfo or not expires.tzinfo or not reviewed <= now < expires:
            return None
        return data
    except (OSError, ValueError, TypeError, KeyError, AttributeError):
        return None
