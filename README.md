# PixelForge — All-in-One Image & PDF Toolkit

> **Every image. Every document. One powerful workspace.**

A production-oriented full-stack MERN web application for image editing, PDF manipulation, and AI-powered document tools.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (HttpOnly Cookies) |
| Rate limiting | express-rate-limit |
| Security | Helmet, CORS |

---

## Project Structure

```
PixelForge/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Page layout wrappers
│   │   ├── pages/           # Route-level page components
│   │   ├── data/            # Tool registry & static data
│   │   ├── services/        # Axios API client modules
│   │   ├── store/           # Zustand state stores
│   │   └── main.jsx         # App entry point
│   └── public/
└── server/                  # Express.js API
    ├── src/
    │   ├── config/          # DB connection
    │   ├── controllers/     # Route handlers
    │   ├── data/            # Tools registry
    │   ├── middleware/      # Auth, error handling
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # Express routers
    │   └── utils/           # Response helpers
    └── tests/               # Jest test suites
```

---

## Prerequisites

- Node.js v18+ (tested on v24)
- npm v9+
- MongoDB (local or Atlas)

---

## Installation

### 1. Clone and install

```bash
git clone https://github.com/your-org/pixelforge.git
cd pixelforge

# Install all dependencies
npm run install:all
```

### 2. Configure environment variables

**Server** — copy and edit:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pixelforge
JWT_SECRET=your_long_random_secret_minimum_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SECRET=another_long_random_secret
```

**Client** — create if needed:
```bash
# client/.env (optional, Vite proxies /api to backend by default)
VITE_API_URL=http://localhost:5000
```

> ⚠️ **Never commit `.env` files.** They are already gitignored.

---

## Running in Development

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running at http://localhost:5173
```

Or use the root convenience scripts:
```bash
npm run dev:server   # starts server with nodemon
npm run dev:client   # starts Vite dev server
```

---

## Building for Production

```bash
npm run build
# Output: client/dist/
```

Serve the `client/dist` folder with a static web server (Nginx, Vercel, Netlify, etc.) and point `MONGO_URI` and `JWT_SECRET` to production values.

---

## Running Tests

```bash
npm run test:server
```

Tests cover:
- Tools registry integrity (unique IDs, required fields, valid status)
- API middleware (404 handling, CORS headers)

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `CLIENT_URL` | Yes | Frontend origin for CORS |
| `COOKIE_SECRET` | Yes | Cookie signing secret |

---

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/tools` | All Tools Directory |
| `/image-tools` | Image Tools |
| `/pdf-tools` | PDF Tools |
| `/ai-tools` | AI Tools |
| `/tools/:toolId` | Tool Workspace |
| `/pricing` | Pricing |
| `/about` | About |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/contact` | Contact |
| `/signin` | Sign In |
| `/signup` | Sign Up |
| `/dashboard` | User Dashboard (protected) |
| `/settings` | Settings (protected) |

---

## API Endpoints

### Core & Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check & service status |
| POST | `/api/auth/register` | — | Create account (validates email, password strength) |
| POST | `/api/auth/login` | — | Log in (sets HttpOnly session cookie) |
| POST | `/api/auth/logout` | — | Log out (clears session cookie) |
| GET | `/api/auth/me` | ✓ | Current authenticated user profile |
| GET | `/api/user/profile` | ✓ | Get profile information |
| PATCH | `/api/user/profile` | ✓ | Update profile |
| GET | `/api/user/settings` | ✓ | Get user preferences & settings |
| PATCH | `/api/user/settings` | ✓ | Update preferences |
| GET | `/api/tools` | — | List all tools with category & metadata |
| GET | `/api/tools/categories` | — | List tool categories |
| GET | `/api/tools/:id` | — | Get specific tool metadata |

### Real File Processing (`/api/process`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/process/image/:toolId` | Optional | Process image (resize, crop, rotate, convert, watermark, filters, metadata) |
| POST | `/api/process/image/bulk-compress` | Optional | Compress multiple images concurrently into a downloadable ZIP archive |
| POST | `/api/process/pdf/:toolId` | Optional | Process PDF (merge, split, rotate, watermark, page numbers, protect, unlock, extract, compare) |
| POST | `/api/process/ai/:toolId` | Optional | Process document with AI (summarize, Q&A, key points, flashcards, outline, translate) |
| GET | `/api/process/download/:fileToken` | Optional | Securely stream processed file using single-use/ephemeral token |
| DELETE | `/api/process/cleanup/:fileToken` | Optional | Immediate user-initiated file deletion from server disk |

---

## Processing Architecture

### 1. Image Processing Service (`server/src/services/imageService.js`)
- Powered by high-performance native **Sharp** (libvips).
- **Core Operations:**
  - **Resize:** Exact dimensions, bounding boxes, percentage scaling, aspect ratio preservation (`fit: inside | cover | fill`).
  - **Crop:** Absolute pixel bounds with coordinate clamping to prevent image boundary overflow.
  - **Rotate & Flip:** Free-angle rotation with background color fills, horizontal and vertical flips.
  - **Format Conversion:** JPEG, PNG, WebP, AVIF, and TIFF with format-specific tuning.
  - **Compression:** Multi-level compression balancing visual fidelity and payload size.
  - **Watermarking:** Scaled SVG text overlays with configurable font size, opacity, and positioning.
  - **Filters & Effects:** Grayscale, sepia, blur, sharpen, brightness/saturation, and inversion.
  - **Metadata & Palette:** EXIF dimensions, color space, channel format, and dominant color extraction.
  - **Bulk Compression:** Multi-file processing packaged into non-blocking `.zip` streams via `archiver`.

### 2. PDF Processing Service (`server/src/services/pdfService.js`)
- Powered by **pdf-lib** and **pdf-parse** with native zlib fallback stream parsing.
- **Core Operations:**
  - **Merge:** Sequentially combines any number of uploaded PDF files into a single unified document.
  - **Split:** Extracts custom page ranges (e.g. `1-3, 5`) or bursts every page into an individual PDF bundled in a ZIP.
  - **Rotate:** Rotates select pages or the entire document by 90°, 180°, or 270°.
  - **Page Numbering:** Embeds clean Roman or Arabic page counters with custom margins and alignment.
  - **Watermarking:** High-contrast rotated text overlays across all pages.
  - **Protection & Unlock:** AES encryption with user passwords, and credentialed PDF unlocking.
  - **Text Extraction:** Extracts full document text with word, character, and per-page metrics.
  - **Images to PDF:** Compiles multiple raster images into uniform PDF pages.
  - **Document Comparison:** Compares text contents between two revisions and highlights page differences.

### 3. AI Document Service (`server/src/services/aiService.js`)
- Provider-agnostic abstraction supporting **OpenAI**, **Gemini**, **Anthropic**, and a **Local Heuristic** fallback engine.
- **Safety Controls:** Input sanitization strips prompt injection delimiters (`system:`, `<im_start>`, etc.) and enforces a strict 50,000 character context bound.
- **Offline / Zero-Config Engine:** If external API keys are not provided, the local heuristic engine extracts key sentences, computes sentence importance scores, generates outline structures, and produces study flashcards directly without network calls.

### 4. Ephemeral Storage & File Security (`server/src/services/storageService.js`)
- Private, non-public directory structure (`server/uploads` and `server/processed`).
- Files are assigned random UUID tokens; raw file paths are never exposed to clients.
- Path traversal protection sanitizes all filename inputs.
- Automated cleanup sweeper runs every 30 minutes, removing files older than 1 hour.
- Users can trigger immediate file deletion via the UI right after downloading.

---

## Database Models

- **User** — name, email, password (hashed with bcrypt), role, status, plan, emailVerified
- **UserSettings** — theme, outputFormat, notifications, privacy preferences
- **ProcessingJob** — toolId, status, file counts, errors, TTL expiry
- **ToolUsageEvent** — toolId, user, outcome, processing time (capped collection)

---

## Security & Verification

- **Strict Multer Validation:** Extension whitelist (`.jpg, .png, .webp, .pdf, .txt, etc.`) and verified MIME types. Executables and unauthorized binaries are rejected before saving.
- **Path Traversal Defenses:** `path.basename` normalization preventing directory traversal attacks.
- **Authentication:** HttpOnly, Secure, SameSite cookies with JWT signatures.
- **Rate Limiting:** Protects against denial-of-service and brute-force attacks across API routes.
- **Automated Test Suite:** 35 unit and integration tests covering:
  - `imageProcessing.test.js` — Sharp transformations, conversions, and metadata.
  - `pdfProcessing.test.js` — Merging, splitting, watermarking, encryption, and text extraction.
  - `fileSecurity.test.js` — Token verification, stream downloads, immediate cleanup, traversal guards, and heuristic fallback.
  - `auth.test.js` — Validation, password hashing, JWT cookies, duplicate detection, and route protection.
  - `app.test.js` — Tools registry integrity and HTTP middleware.

Run the test suite:
```bash
cd server
npm test
```

---

## Honest Technical Limitations & Future Integrations

1. **Office Document Conversions (`Word to PDF`, `Excel to PDF`):** Full fidelity conversion from `.docx` and `.xlsx` to `.pdf` requires an external headless LibreOffice/UnoConv runtime or a cloud document conversion API (e.g., CloudConvert, Gotenberg). These tools are marked as coming soon in the registry.
2. **OCR for Scanned Raster PDFs:** Text extraction from non-vector image-only PDFs requires Tesseract OCR binaries or cloud vision APIs.
3. **Deep Learning Background Removal:** High-resolution semantic subject cutout without greenscreen/chroma requires an external ONNX/Torch model (such as RMBG-1.4) or a background removal API.
4. **Cloud AI Providers:** For OpenAI, Google Gemini, or Anthropic models, set `AI_PROVIDER` and `AI_API_KEY` in `server/.env`. If omitted, PixelForge uses its built-in local heuristic NLP engine with zero external dependencies.

---

## License

MIT © PixelForge

