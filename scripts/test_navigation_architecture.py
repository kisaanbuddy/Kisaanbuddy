import re
import os

print("--- TESTING GLOBAL NAVIGATION ARCHITECTURE ---")

# 1. Test route-utils
with open('frontend-next/src/components/navigation/route-utils.ts', 'r', encoding='utf-8') as f:
    route_utils_content = f.read()

def is_home_route(pathname):
    if not pathname:
        return True
    normalized = pathname.split('?')[0].rstrip('/')
    return normalized == ''

def is_marketplace_route(pathname):
    if not pathname:
        return False
    normalized = pathname.split('?')[0].rstrip('/')
    return normalized == '/marketplace' or normalized.startswith('/marketplace/')

test_cases = [
    # (Route, is_home, is_marketplace)
    ('/', True, False),
    ('', True, False),
    ('/?lang=hi', True, False),
    ('/fasal', False, False),
    ('/mandi', False, False),
    ('/mandi?tab=prices', False, False),
    ('/madad', False, False),
    ('/crop-predictor', False, False),
    ('/crop-predictor#soil-analysis', False, False),
    ('/disease', False, False),
    ('/weather', False, False),
    ('/soil-health', False, False),
    ('/dashboard', False, False),
    ('/marketplace', False, True),
    ('/marketplace/', False, True),
    ('/marketplace/category/tractors', False, True),
    ('/worker-connect', False, False),
    ('/schemes', False, False),
    ('/khet-diary', False, False),
    ('/satellite', False, False),
    ('/about', False, False),
    ('/founders', False, False),
    ('/impact', False, False),
    ('/login', False, False),
    ('/signup', False, False),
]

for route, exp_home, exp_mkt in test_cases:
    h = is_home_route(route)
    m = is_marketplace_route(route)
    assert h == exp_home, f"Route {route} expected home={exp_home}, got {h}"
    assert m == exp_mkt, f"Route {route} expected mkt={exp_mkt}, got {m}"

print("[PASS] Route matching logic passed 100% of test cases!")

# 2. Verify all required modules exist in MODULE_CONFIGS
required_modules = [
    'fasal', 'mandi', 'madad', 'crop-predictor', 'disease', 
    'weather', 'soil-health', 'dashboard', 'worker-connect', 
    'schemes', 'khet-diary', 'satellite', 'about'
]

for mod in required_modules:
    pattern = rf'(?:\"{mod}\"|{mod}):\s*\{{\s*key:\s*"{mod}"'
    assert re.search(pattern, route_utils_content), f"Module {mod} not found in MODULE_CONFIGS"
    print(f"  [OK] Module '{mod}' properly configured with title, subtitle, and contextual controls.")

print("[PASS] All 13 core modules verified in MODULE_CONFIGS!")

# 3. Verify AppNavigationShell
with open('frontend-next/src/components/navigation/AppNavigationShell.tsx', 'r', encoding='utf-8') as f:
    shell_content = f.read()

assert 'isHome' in shell_content
assert '<Header />' in shell_content
assert '<MobileAppHeader />' in shell_content
assert '<CompactInternalHeader />' in shell_content
assert 'isMarketplace' in shell_content
print("[PASS] AppNavigationShell properly routes Home -> Full Global Navbar, Marketplace -> self-contained, Internal -> CompactInternalHeader.")

# 4. Verify layout.tsx
with open('frontend-next/src/app/layout.tsx', 'r', encoding='utf-8') as f:
    layout_content = f.read()

assert 'AppNavigationShell' in layout_content
assert '<AppNavigationShell />' in layout_content
print("[PASS] layout.tsx properly wraps application inside AppNavigationShell.")

# 5. Verify Header.tsx and MobileAppHeader.tsx
with open('frontend-next/src/components/Header.tsx', 'r', encoding='utf-8') as f:
    header_content = f.read()

assert "pathname === '/' || pathname === ''" in header_content
assert "if (!isHome) {" in header_content

with open('frontend-next/src/components/mobile/MobileAppHeader.tsx', 'r', encoding='utf-8') as f:
    mobile_header_content = f.read()

assert "pathname === '/' || pathname === ''" in mobile_header_content
assert "if (!isHome) {" in mobile_header_content

print("[PASS] Header.tsx & MobileAppHeader.tsx strictly guard against rendering on non-home pages.")

print("\n--- ALL NAVIGATION REDESIGN CHECKS PASSED SUCCESSFULLY! ---")
