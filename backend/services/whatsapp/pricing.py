"""Meta WhatsApp Business Platform pricing calculations and usage tracking for India.

Based on official Meta Cloud API conversation-based pricing (India market - INR):
- Service Conversations (User-initiated, 24-hour window): ₹0.29
- Utility Conversations (Transaction, advisory updates): ₹0.12
- Authentication Conversations (OTP verification): ₹0.12
- Marketing Conversations (Promotions, campaigns): ₹0.73
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional
from core.config import settings

log = logging.getLogger(__name__)

# Official Meta India conversation rates in INR
META_RATES_INR = {
    "service": 0.29,         # User-initiated, 24h customer service window
    "utility": 0.12,         # Business-initiated updates
    "authentication": 0.12,  # OTP/logins
    "marketing": 0.73,       # Broadcasts/promotions
}


@dataclass
class CostEvaluation:
    category: str
    is_chargeable: bool
    rate_inr: float
    estimated_cost_inr: float


def evaluate_message_cost(
    direction: str,
    category: str = "service",
    is_session_start: bool = False,
    pricing_model_meta: Optional[str] = None,
) -> CostEvaluation:
    """Calculates the applicable rate and estimated cost for a WhatsApp message/conversation turn.

    In Meta's conversation pricing:
    - Inbound messages from farmers are not directly charged to the business.
    - An outbound reply that opens or extends a 24-hour conversation window is chargeable.
    - Subsequent messages within the active 24-hour customer service window do not incur additional conversation fees.
    """
    cat = category.lower()
    if cat not in META_RATES_INR:
        cat = "service"

    rate = META_RATES_INR[cat]

    if direction == "inbound":
        # Inbound messages do not incur direct Meta fee
        return CostEvaluation(
            category=cat,
            is_chargeable=False,
            rate_inr=0.0,
            estimated_cost_inr=0.0,
        )

    # Outbound message:
    # If starting a new billable 24-hour conversation window or if flagged by Meta
    if is_session_start or pricing_model_meta == "CBP":
        return CostEvaluation(
            category=cat,
            is_chargeable=True,
            rate_inr=rate,
            estimated_cost_inr=rate,
        )

    # Standard reply inside an existing 24h session window
    return CostEvaluation(
        category=cat,
        is_chargeable=False,
        rate_inr=rate,
        estimated_cost_inr=0.0,
    )


def check_budget_limit(total_spent_inr: float) -> dict:
    """Verifies whether total monthly spending is within the configured internal threshold."""
    budget = float(settings.WHATSAPP_MONTHLY_BUDGET_INR or 5000.0)
    percent_used = round((total_spent_inr / budget) * 100, 1) if budget > 0 else 0.0
    exceeded = total_spent_inr >= budget
    warning = total_spent_inr >= (budget * 0.8)

    if exceeded:
        log.warning("WhatsApp budget EXCEEDED: ₹%.2f / ₹%.2f (%.1f%%)", total_spent_inr, budget, percent_used)
    elif warning:
        log.info("WhatsApp budget WARNING: ₹%.2f / ₹%.2f (%.1f%%)", total_spent_inr, budget, percent_used)

    return {
        "monthly_budget_inr": budget,
        "total_spent_inr": round(total_spent_inr, 2),
        "percentage_used": percent_used,
        "is_warning": warning,
        "is_exceeded": exceeded,
    }
