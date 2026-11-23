"""Read-only AGMARKNET observations; no seeded prices or inferred reporting dates."""
from datetime import datetime, timezone, timedelta
import math
import httpx
from core.config import settings

SOURCE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'


def normalize_observation(row, now=None):
    now = now or datetime.now(timezone.utc)
    observed = None
    for fmt in ('%d/%m/%Y', '%Y-%m-%d'):
        try:
            observed = datetime.strptime(row.get('arrival_date', ''), fmt).date()
            break
        except (ValueError, TypeError):
            pass
    today = (now + timedelta(hours=5, minutes=30)).date()
    if observed is None or not 0 <= (today - observed).days <= 7:
        return None
    if not all(row.get(k) for k in ('commodity', 'market', 'state', 'district')):
        return None
    try:
        low, modal, high = (float(row[k]) for k in ('min_price', 'modal_price', 'max_price'))
    except (KeyError, TypeError, ValueError):
        return None
    if not all(math.isfinite(v) for v in (low, modal, high)) or not 0 <= low <= modal <= high:
        return None
    return {
        'commodity': row['commodity'], 'market': row['market'], 'state': row['state'],
        'district': row['district'], 'variety': row.get('variety'),
        'min_price': low, 'modal_price': modal, 'max_price': high, 'unit': 'INR/quintal',
        'arrival_date': observed.isoformat(), 'source_url': SOURCE_URL,
        'retrieved_at': now.isoformat(), 'age_days': (today - observed).days,
    }


async def get_market_observations(crop=None, state=None, market=None):
    if not crop or not (state or market):
        return {'error': 'Please specify the commodity and state or market.'}
    key = settings.DATA_GOV_API_KEY
    if not key:
        return {'error': 'Live AGMARKNET access is not configured; current prices are unavailable.'}
    params = {'api-key': key, 'format': 'json', 'limit': 20}
    for name, value in (('commodity', crop), ('state', state), ('market', market)):
        if value:
            params[f'filters[{name}]'] = str(value)[:100]
    try:
        async with httpx.AsyncClient(timeout=12, follow_redirects=False) as client:
            response = await client.get(SOURCE_URL, params=params)
            response.raise_for_status()
            rows = response.json().get('records') or []
        records = []
        for row in rows[:20]:
            if not isinstance(row, dict):
                continue
            if any(value and str(row.get(name, '')).casefold() != str(value).casefold()
                   for name, value in (('commodity', crop), ('state', state), ('market', market))):
                continue
            item = normalize_observation(row)
            if item:
                records.append(item)
        return {'source_url': SOURCE_URL, 'records': records,
                'note': 'Reported market observations, not seller offers or guaranteed transaction prices. Dates may precede today.',
                'error': 'No recent, dated matching observations available.'} if not records else {
                    'source_url': SOURCE_URL, 'records': records,
                    'note': 'Reported market observations, not seller offers. Read each reporting date; not necessarily today.'}
    except (httpx.HTTPError, ValueError, TypeError, AttributeError):
        # Do not log request URLs containing API credentials.
        return {'error': 'AGMARKNET is unavailable. No price can be quoted right now.'}
