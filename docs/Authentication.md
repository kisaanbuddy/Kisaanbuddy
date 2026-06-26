# Authentication and Session Security

This document outlines the authentication protocols and session security measures implemented in KisaanBuddy.

---

## Authentication Methods

KisaanBuddy supports two authentication models:
1. **Password-based Auth:** Traditional email and password flow. Passwords are salted and hashed using `bcrypt` before storage.
2. **OTP-based Auth (Indian Mobile Numbers):** Passwordless mobile entry. Generates a 6-digit one-time PIN (OTP), hashes it with SHA-256, and sends it via an integrated SMS provider (Console, Twilio, or 2Factor).

---

## Session Management

Sessions are managed using secure, HTTP-only cookies to mitigate cross-site scripting (XSS) risks.

```
+----------------+              +-----------------+              +----------------+
|  User Browser  |              | FastAPI Server  |              |   SQLite DB    |
+----------------+              +-----------------+              +----------------+
        |                                |                               |
        |---- Login request ------------>|                               |
        |                                |---- Create session ---------->|
        |                                |<--- Return session id --------|
        |<--- Set HTTP-only Cookie ------|                               |
        |     (token + session ID)       |                               |
```

### Security Tokens
- **`kisaanbuddy_session`:** An Access Token cookie valid for 15 minutes, containing JWT signatures mapping the user ID, role, session ID (`sid`), and phone number.
- **`kisaanbuddy_refresh_session`:** A Refresh Token cookie valid for 30 days, containing a random secure token.
- **Multi-Device Revocation:** The system limits active user sessions to a maximum of 3 concurrent devices. Logging in on a 4th device automatically revokes the oldest session in the database.
- **Lockout Mechanism:** Five failed OTP or password attempts triggers a temporary 15-minute account lockout managed via the `UserSecurityState` database model.
