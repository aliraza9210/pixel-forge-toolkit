# Security Policy — PixelForge

PixelForge takes security, document confidentiality, and user privacy seriously. This document outlines our security architecture, vulnerability reporting procedures, security controls, and known limitations.

---

## 1. Security Architecture & Controls

### 1.1 Private File Isolation & Storage
* **Ephemeral Storage:** All user uploads and processed outputs are stored in temporary, non-public directories (`uploads/` and `processed/`).
* **Random Cryptographic Tokens:** Files are indexed by UUIDv4 tokens. Original user filenames and physical server paths are never exposed in URLs or client responses.
* **No Direct File Access:** Direct directory traversal or URL guessing is prevented. Files are streamed only through authenticated download endpoints with strict token matching and expiration checks.
* **Automatic Expiration & Cleanup:**
  * In-memory token expiration (default: 60 minutes).
  * Recurring background sweep job running every 30 minutes removing expired files.
  * User-initiated immediate cleanup (`DELETE /api/process/cleanup/:token`).
  * MongoDB TTL index on `ProcessingJob` documents (auto-expires in 24 hours).
* **No Raw File Database Storage:** Documents and image binary contents are never stored in MongoDB.

### 1.2 Upload Security & Input Validation
* **Extension & MIME Validation:** Multer middleware validates incoming files against a strict whitelist of allowed extensions and MIME types. Executable extensions (`.exe`, `.sh`, `.bat`, etc.) are unconditionally rejected.
* **Path Traversal Defense:** Uploaded filenames are stripped of path components and control characters (`../`, `\0`) using `sanitizeOriginalName`.
* **Resource Limits:**
  * Maximum individual file size: 35 MB.
  * Maximum files per batch request: 20 files.
  * Request JSON body limit: 10 MB.

### 1.3 AI Intelligence Security & Anti-Prompt-Injection
* **Text Length Bounds:** Document text processed through AI is strictly limited to 50,000 characters to prevent denial-of-service and context overflow.
* **Prompt Injection Neutralization:** Input text is scanned and sanitized for adversarial patterns (e.g. `ignore all previous instructions`, `you are now in developer mode`, system prompt override attempts).
* **Air-Gapped Local Intelligence Engine:** If no external AI provider (`OPENAI_API_KEY`) is configured, PixelForge runs an internal local heuristic analyzer that requires no external network calls, keeping document content strictly local.

### 1.4 Network & HTTP Security Headers
* **Helmet:** Configures HTTP security headers including X-Content-Type-Options, Frameguard (clickjacking defense), and DNS prefetch controls.
* **CORS:** Restricted to configured trusted origins (`CLIENT_URL`).
* **Rate Limiting:**
  * General API: 200 requests per 15 minutes.
  * Authentication Endpoints: 20 attempts per 15 minutes to mitigate brute-force attacks.
* **Cookie Security:** Auth tokens are stored in `HttpOnly` cookies with `SameSite=lax` (or `strict` in production) and `secure=true` when running on HTTPS.

---

## 2. Supported Versions

| Version | Supported | Status |
|---|---|---|
| 1.x (Current) | Yes | Active maintenance & security patches |
| < 1.0 | No | End of Life |

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability or privacy concern within PixelForge:

1. **Do Not Open a Public Issue:** To protect our users, please do not post vulnerability details in public issue trackers or forums.
2. **Contact:** Submit details to our security team via email at `security@pixelforge.dev` (or via private GitHub Security Advisory).
3. **Include Details:**
   * Step-by-step reproduction instructions or Proof of Concept (PoC).
   * Impact assessment and affected components.
   * Suggested mitigation if known.
4. **Response Timeline:** We commit to acknowledging reports within 48 hours and providing progress updates during remediation.

---

## 4. Credential & Secret Rotation Instructions

If any credential or API secret (e.g., `JWT_SECRET`, `MONGO_URI`, `OPENAI_API_KEY`) is compromised or accidentally committed:

1. **Immediate Revocation:** Revoke the compromised API key or change the database password immediately at the provider dashboard.
2. **Generate New Cryptographic Secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Update Server Environment:** Update `.env` with the new keys.
4. **Invalidate Active Sessions:** Restart the backend server. Existing user JWT tokens signed with the old secret will become invalid automatically.
5. **Git History Scrubbing:** If a secret was committed to git history, use `git filter-repo` or BFG Repo-Cleaner to purge it before pushing to any public remote.

---

## 5. Known Limitations & Residual Risks

1. **Self-Hosted OCR & Heavy Office Conversion:** PixelForge currently implements pure-JavaScript document transformations via Sharp, pdf-lib, and pdf-parse. Full vector conversion of complex Word (.docx) or PowerPoint (.pptx) layouts requires an external LibreOffice container, which is marked as "Coming Soon" in the UI to prevent inaccurate outputs.
2. **Visual Signatures vs. Cryptographic Signatures:** Visual signatures added via canvas or image insertion represent visual endorsements, not legally binding X.509 PKI cryptographic digital certificates.
3. **Local In-Memory Cache:** In multi-instance cluster deployments behind a load balancer without sticky sessions, use Redis or centralized object storage (AWS S3 / GCP Cloud Storage) for temporary files rather than single-node filesystem storage.
