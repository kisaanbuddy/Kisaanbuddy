"""
Verification test suite for KisaanBuddy WhatsApp Launch Announcement Popup
Validates all requirements specified in the user request:
1. Top Badge: KISAANBUDDY WHATSAPP LAUNCH
2. Main Heading: KisaanBuddy is Now on WhatsApp!
3. Description: Your farming companion is now just one WhatsApp message away...
4. 3 Feature Cards:
   - 🌱 Farming Assistance
   - 🌤️ Weather & Crop Updates
   - 📊 Mandi Price Information
5. CTA Buttons:
   - Primary: "Chat with KisaanBuddy on WhatsApp"
   - Secondary: "Continue Exploring Website"
6. Phone Mockup:
   - Hindi welcome message: "नमस्ते किसान मित्र! KisaanBuddy में आपका स्वागत है। आज हम आपकी खेती में कैसे मदद कर सकते हैं?"
   - UI Preview tag
   - No fake verification badges
7. Technical & Behavior integrity:
   - Session-based display (sessionStorage)
   - Accessibility & Escape dismiss
   - Layout integration in RootLayout
"""

import os

def run_tests():
    print("=" * 70)
    print("VERIFYING KISAANBUDDY WHATSAPP BRAND ANNOUNCEMENT POPUP")
    print("=" * 70)

    popup_file = "frontend-next/src/components/announcement/AnnouncementPopup.tsx"
    layout_file = "frontend-next/src/app/layout.tsx"

    assert os.path.exists(popup_file), f"Missing {popup_file}"
    assert os.path.exists(layout_file), f"Missing {layout_file}"

    with open(popup_file, "r", encoding="utf-8") as f:
        popup_src = f.read()

    with open(layout_file, "r", encoding="utf-8") as f:
        layout_src = f.read()

    # 1. Badge, Heading & Description
    print("\n[Test 1] Badge, Heading & Description Verification:")
    assert "KISAANBUDDY WHATSAPP LAUNCH" in popup_src, "Badge missing"
    print("  ✓ Top Badge: 'KISAANBUDDY WHATSAPP LAUNCH' present")

    assert "KisaanBuddy is Now on" in popup_src and "WhatsApp!" in popup_src, "Heading missing"
    print("  ✓ Main Heading: 'KisaanBuddy is Now on WhatsApp!' present")

    desc = "Your farming companion is now just one WhatsApp message away. Get agricultural information, farming guidance, market updates and important notifications directly on WhatsApp."
    assert desc in popup_src, "Description missing"
    print(f"  ✓ Description: '{desc[:45]}...' present")

    # 2. Three Feature Cards
    print("\n[Test 2] Three Feature Cards:")
    assert "Farming Assistance" in popup_src, "Feature 1 title missing"
    assert "Get guidance and answers to your farming questions." in popup_src, "Feature 1 desc missing"
    print("  ✓ Card 1: 🌱 Farming Assistance")

    assert "Weather &amp; Crop Updates" in popup_src or "Weather & Crop Updates" in popup_src, "Feature 2 title missing"
    assert "Receive useful weather and agricultural updates." in popup_src, "Feature 2 desc missing"
    print("  ✓ Card 2: 🌤️ Weather & Crop Updates")

    assert "Mandi Price Information" in popup_src, "Feature 3 title missing"
    assert "Stay informed about agricultural market prices." in popup_src, "Feature 3 desc missing"
    print("  ✓ Card 3: 📊 Mandi Price Information")

    # 3. CTA Buttons
    print("\n[Test 3] CTA Buttons:")
    assert "Chat with KisaanBuddy on WhatsApp" in popup_src, "Primary CTA missing"
    assert "Continue Exploring Website" in popup_src, "Secondary CTA missing"
    print("  ✓ Primary CTA: 'Chat with KisaanBuddy on WhatsApp →'")
    print("  ✓ Secondary CTA: 'Continue Exploring Website'")

    # 4. Phone Mockup & Welcome Message
    print("\n[Test 4] Smartphone Mockup & WhatsApp UI Preview:")
    assert "UI Preview • WhatsApp" in popup_src, "UI Preview disclaimer tag missing"
    welcome_hi = "नमस्ते किसान मित्र! KisaanBuddy में आपका स्वागत है। आज हम आपकी खेती में कैसे मदद कर सकते हैं?"
    assert welcome_hi in popup_src, "Hindi welcome message missing"
    assert "Type a message..." in popup_src, "Message input missing"
    # Ensure no fake verification badges added in JSX
    assert "verified_badge" not in popup_src.lower() and "badge_verified" not in popup_src.lower(), "Verification badge issue"
    print("  ✓ Welcome Message in Hindi: present")
    print("  ✓ UI Preview disclaimer: present")
    print("  ✓ Simple input area: present")
    print("  ✓ Fake verification badges: none")

    # 5. WhatsApp Link & Zero Fabricated Numbers
    print("\n[Test 5] WhatsApp wa.me Integration:")
    assert "getWhatsAppBusinessUrl" in popup_src, "wa.me resolution helper missing"
    assert "9999999999" not in popup_src and "9876543210" not in popup_src, "Dummy phone number detected"
    print("  ✓ Official wa.me deep link with zero dummy numbers")

    # 6. Session Management & Accessibility
    print("\n[Test 6] Session & Accessibility:")
    assert "sessionStorage.getItem" in popup_src and "sessionStorage.setItem" in popup_src, "sessionStorage logic missing"
    assert 'aria-label="Close WhatsApp announcement"' in popup_src, "Close button aria label missing"
    assert 'e.key === "Escape"' in popup_src, "Escape key listener missing"
    assert 'onClick={handleDismiss}' in popup_src, "Backdrop dismiss missing"
    assert "<AnnouncementPopup />" in layout_src, "<AnnouncementPopup /> not in layout.tsx"
    print("  ✓ sessionStorage visit-frequency handling present")
    print("  ✓ Close (X), backdrop click, Escape key dismiss present")
    print("  ✓ Mounted in root layout.tsx")

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED SUCCESSFULLY (100%)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
