"""
KisaanBuddy — Automated Mandi Price Alert Monitoring Engine
Evaluates active farmer alerts against verified AGMARKNET price observations.
Provides idempotency, duplicate prevention, and detailed execution telemetry.
"""

import logging
from datetime import datetime, date
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.models import MarketPriceRecord, MandiPriceAlert, MandiNotificationLog
from services.notification_service import (
    send_whatsapp_alert,
    send_sms_alert,
    mask_phone_number,
)

log = logging.getLogger("krishiai.mandi_alert_worker")


async def run_price_monitoring_cycle(db: Session) -> Dict[str, Any]:
    """Execute one complete cycle of the Mandi Price Alert Monitoring Engine.
    
    Workflow:
      1. Fetch all active alerts (is_active == True).
      2. Match each alert with latest authentic MarketPriceRecord in the database.
      3. Validate condition (e.g., price >= target_price).
      4. Check idempotency: skip if already notified for this exact observation arrival_date.
      5. Send notification across consented channels (WhatsApp, SMS).
      6. Record notification log with delivery status.
      7. Update alert execution timestamps and trigger count.
    """
    active_alerts = db.query(MandiPriceAlert).filter(MandiPriceAlert.is_active == True).all()

    stats = {
        "cycle_started_at": datetime.utcnow().isoformat() + "Z",
        "active_alerts_count": len(active_alerts),
        "alerts_evaluated": 0,
        "conditions_satisfied": 0,
        "notifications_sent": 0,
        "duplicates_skipped": 0,
        "errors": [],
    }

    if not active_alerts:
        stats["cycle_completed_at"] = datetime.utcnow().isoformat() + "Z"
        return stats

    for alert in active_alerts:
        stats["alerts_evaluated"] += 1
        try:
            alert.last_checked_at = datetime.utcnow()

            # Query latest authentic price observation
            query = db.query(MarketPriceRecord).filter(
                MarketPriceRecord.commodity.ilike(f"%{alert.commodity.strip()}%")
            )

            if alert.state and alert.state.lower() != "all":
                query = query.filter(MarketPriceRecord.state.ilike(f"%{alert.state.strip()}%"))

            if alert.market_center and alert.market_center.lower() != "all":
                query = query.filter(MarketPriceRecord.market_center.ilike(f"%{alert.market_center.strip()}%"))

            latest_obs = query.order_by(desc(MarketPriceRecord.arrival_date)).first()

            if not latest_obs:
                continue

            modal = float(latest_obs.modal_price)
            target = float(alert.target_price)
            arr_date = latest_obs.arrival_date

            # Evaluate alert condition
            condition_met = False
            if alert.condition == "above" and modal >= target:
                condition_met = True
            elif alert.condition == "below" and modal <= target:
                condition_met = True
            elif alert.condition == "exact" and abs(modal - target) <= (target * 0.02):
                condition_met = True

            if not condition_met:
                continue

            stats["conditions_satisfied"] += 1

            # Idempotency check: Has this alert already been notified for this arrival_date?
            existing_log = (
                db.query(MandiNotificationLog)
                .filter(
                    MandiNotificationLog.alert_id == alert.id,
                    MandiNotificationLog.arrival_date == arr_date,
                    MandiNotificationLog.delivery_status.in_(["sent", "delivered", "pending_credentials"]),
                )
                .first()
            )

            if existing_log:
                stats["duplicates_skipped"] += 1
                continue

            # Send through consented channels
            farmer_display_name = alert.farmer_name or "Kisaan"
            obs_date_str = arr_date.isoformat() if arr_date else date.today().isoformat()

            # 1. WhatsApp Channel
            if alert.channel in ("whatsapp", "both") and alert.whatsapp_consent:
                wa_res = await send_whatsapp_alert(
                    recipient_phone=alert.phone_number,
                    farmer_name=farmer_display_name,
                    commodity=latest_obs.commodity,
                    mandi_name=latest_obs.market_center,
                    modal_price=modal,
                    target_price=target,
                    arrival_date=obs_date_str,
                )

                wa_log = MandiNotificationLog(
                    alert_id=alert.id,
                    user_id=alert.user_id,
                    phone_number=alert.phone_number,
                    channel="whatsapp",
                    commodity=latest_obs.commodity,
                    market_center=latest_obs.market_center,
                    triggered_price=modal,
                    target_price=target,
                    arrival_date=arr_date,
                    message_body=wa_res.get("rendered_text") or f"Price alert triggered at ₹{modal}",
                    provider=wa_res.get("provider", "whatsapp_cloud_api"),
                    provider_message_id=wa_res.get("message_id"),
                    delivery_status=wa_res.get("status", "pending"),
                    failure_reason=wa_res.get("error"),
                    sent_at=datetime.utcnow() if wa_res.get("success") else None,
                )
                db.add(wa_log)
                if wa_res.get("success"):
                    stats["notifications_sent"] += 1

            # 2. SMS Channel
            if alert.channel in ("sms", "both") and alert.sms_consent:
                sms_res = await send_sms_alert(
                    recipient_phone=alert.phone_number,
                    farmer_name=farmer_display_name,
                    commodity=latest_obs.commodity,
                    mandi_name=latest_obs.market_center,
                    modal_price=modal,
                    target_price=target,
                    arrival_date=obs_date_str,
                )

                sms_log = MandiNotificationLog(
                    alert_id=alert.id,
                    user_id=alert.user_id,
                    phone_number=alert.phone_number,
                    channel="sms",
                    commodity=latest_obs.commodity,
                    market_center=latest_obs.market_center,
                    triggered_price=modal,
                    target_price=target,
                    arrival_date=arr_date,
                    message_body=sms_res.get("rendered_text") or f"Price alert triggered at ₹{modal}",
                    provider=sms_res.get("provider", "msg91_dlt"),
                    provider_message_id=sms_res.get("message_id"),
                    delivery_status=sms_res.get("status", "pending"),
                    failure_reason=sms_res.get("error"),
                    sent_at=datetime.utcnow() if sms_res.get("success") else None,
                )
                db.add(sms_log)
                if sms_res.get("success"):
                    stats["notifications_sent"] += 1

            # Update alert state
            alert.last_triggered_at = datetime.utcnow()
            alert.last_triggered_price = modal
            alert.trigger_count = (alert.trigger_count or 0) + 1
            db.commit()

        except Exception as alert_err:
            db.rollback()
            log.exception("Error evaluating alert #%s: %s", alert.id, alert_err)
            stats["errors"].append(f"Alert #{alert.id}: {str(alert_err)}")

    db.commit()
    stats["cycle_completed_at"] = datetime.utcnow().isoformat() + "Z"
    return stats
