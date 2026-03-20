# Future Authentication Improvements

This document tracks authentication improvements that were identified during the January 2026 auth review but were not implemented in the initial iteration.

---

## High Priority (Security)

### 1. Implement Token Refresh Mechanism

**Current State**: JWT tokens expire without any refresh mechanism. Users are logged out abruptly when their token expires.

**Proposed Solution**:

- Add refresh token flow with `/api/auth/refresh` endpoint
- Implement silent token renewal before expiry
- Store refresh token securely (consider httpOnly cookie)
- Add token refresh interceptor in API client

**Backend Requirements**:

- `/api/auth/refresh` endpoint that accepts refresh token
- Returns new access token (and optionally new refresh token)
- Refresh token invalidation on logout

**Implementation Notes**:

```typescript
// Proposed API client addition
async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
  // Call refresh endpoint
  // Update stored tokens
  // Schedule next refresh before expiry
}
```

---

### 2. Use httpOnly Cookies for Token Storage

**Current State**: JWT tokens are stored in localStorage, which is vulnerable to XSS attacks.

**Proposed Solution**:

- Move token storage to httpOnly cookies (set by backend)
- Frontend no longer handles raw tokens
- Cookies automatically sent with requests

**Trade-offs**:

- More secure against XSS
- Requires backend changes
- CSRF protection becomes critical
- May complicate cross-origin requests

**Backend Requirements**:

- Set httpOnly, Secure, SameSite cookies on login
- Clear cookies on logout
- Validate cookies on each request

---

### 3. Complete CSRF Protection Implementation

**Current State**: Frontend CSRF structure is in place but backend endpoint not available.

**Proposed Solution**:

- Backend implements `/api/auth/csrf` endpoint
- Returns CSRF token on request
- Validates token on state-changing requests

**Frontend Changes Required**:

- Update `apiClient.fetchCsrfToken()` to make actual request
- Call on app initialization
- Handle CSRF token expiry/refresh

---

## Medium Priority (UX)

### 4. Remember Me Option

**Current State**: Sessions always persist to localStorage (persistent).

**Proposed Solution**:

- Add "Remember me" checkbox to login form
- When unchecked: use sessionStorage instead of localStorage
- When checked: use localStorage (current behavior)

**Implementation**:

```typescript
// In auth-context.tsx
const storage = rememberMe ? localStorage : sessionStorage
storage.setItem(AUTH_STORAGE_KEYS.TOKEN, token)
```

---

### 5. Password Reset Flow

**Current State**: No password reset functionality exists.

**Proposed Solution**:

- Add `/forgot-password` page
- User enters email
- Backend sends password reset email with token
- Add `/reset-password` page that accepts token
- Allow user to set new password

**Pages Required**:

- `app/(public)/forgot-password/page.tsx`
- `app/(public)/reset-password/page.tsx`

**Backend Requirements**:

- `POST /api/auth/forgot-password` - send reset email
- `POST /api/auth/reset-password` - reset password with token

---

### 6. User Registration Flow

**Current State**: No user registration functionality exists. Users must be created by admin.

**Proposed Solution**:

- Add `/register` page (if public registration is desired)
- Or add admin-created user invite flow
- Email verification for new accounts

**Considerations**:

- Depends on business requirements (open registration vs invite-only)
- May require email verification system
- Consider rate limiting on registration

---

### 7. Rate Limiting Handling

**Current State**: No frontend handling for rate-limited login attempts.

**Proposed Solution**:

- Detect 429 (Too Many Requests) responses
- Display user-friendly message
- Show countdown or retry-after time
- Implement exponential backoff on frontend

**Implementation**:

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After')
  throw new AuthError(
    AuthErrorCode.RATE_LIMITED,
    `Too many attempts. Please try again in ${retryAfter} seconds.`
  )
}
```

---

## Lower Priority (Polish)

### 8. Email Verification Flow

**Proposed Solution**:

- Require email verification for new accounts
- Add verification email on registration
- Add `/verify-email` page
- Resend verification email option

---

### 9. Session Management UI

**Proposed Solution**:

- Add settings page section to view active sessions
- Allow users to revoke sessions on other devices
- Show session details (device, location, last active)

**Backend Requirements**:

- Track sessions with metadata
- `GET /api/auth/sessions` - list sessions
- `DELETE /api/auth/sessions/:id` - revoke session

---

### 10. Two-Factor Authentication (2FA)

**Proposed Solution**:

- Add optional 2FA for users
- Support TOTP (authenticator app)
- Consider SMS/email backup codes

**Complexity**: High - requires significant backend work

---

## Implementation Notes

### Priority Order (if implementing)

1. Token refresh mechanism (critical for UX)
2. Complete CSRF protection (when backend ready)
3. Password reset flow (common user requirement)
4. Rate limiting handling (security)
5. Remember me option (quick win)
6. httpOnly cookies (security hardening)
7. Other items as needed

### Testing Checklist for Future Implementations

- [ ] Token refresh works before expiry
- [ ] Refresh token rotation works
- [ ] Password reset email is sent
- [ ] Password can be reset with valid token
- [ ] Invalid/expired reset tokens are rejected
- [ ] Rate limiting shows appropriate message
- [ ] Remember me uses correct storage
- [ ] CSRF tokens are validated
- [ ] Sessions can be listed and revoked
- [ ] 2FA enrollment works
- [ ] 2FA verification works

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
