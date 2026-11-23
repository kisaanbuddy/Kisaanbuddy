"""Normalize real provider payloads without inventing missing observations."""
from datetime import date, datetime, timezone, timedelta
from urllib.parse import urlsplit


def fresh_timestamp(value, max_age_hours):
    try:
        stamp = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
        if stamp.tzinfo is None:
            return False
        age = datetime.now(timezone.utc) - stamp
        return -timedelta(minutes=5) <= age <= timedelta(hours=max_age_hours)
    except (TypeError, ValueError):
        return False


def weather_evidence(data, forecast=False):
    provider = data.get('provider')
    if not provider or any(s in provider.lower() for s in ('demo', 'mock', 'synthetic')):
        return {'error': 'Real weather source unavailable.'}
    if not data.get('location') or not fresh_timestamp(data.get('fetched_at'), 6):
        return {'error': 'Weather location or fresh retrieval timestamp unavailable.'}
    common = {k: data.get(k) for k in ('provider', 'location', 'fetched_at', 'cached')}
    source_urls = {
        'openweathermap': 'https://openweathermap.org/api',
        'weatherapi': 'https://www.weatherapi.com/docs/',
        'tomorrowio': 'https://docs.tomorrow.io/reference/welcome',
        'accuweather': 'https://developer.accuweather.com/apis',
    }
    common['source_url'] = source_urls.get(provider)
    if forecast:
        today = (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).date()
        daily = []
        for item in data.get('daily') or []:
            try:
                if 0 <= (date.fromisoformat(item['date']) - today).days <= 7:
                    daily.append(item)
            except (ValueError, KeyError, TypeError):
                continue
        if not daily:
            return {'error': 'Forecast unavailable.'}
        return {**common, 'daily': daily, 'hourly': (data.get('hourly') or [])[:24]}
    current = data.get('current') or {}
    if not fresh_timestamp(current.get('observed_at'), 6):
        return {'error': 'Weather observation is stale or has no timestamp.'}
    return {**common, **current, 'rainfall_note': 'Rainfall is unavailable unless explicitly supplied by the provider.'}


def official_source(url):
    try:
        parsed = urlsplit(url or '')
        host = parsed.hostname or ''
        return parsed.scheme == 'https' and not parsed.username and not parsed.password and (
            host.endswith('.gov.in') or host.endswith('.nic.in')
        )
    except ValueError:
        return False
