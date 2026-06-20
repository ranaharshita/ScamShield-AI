# ScamShield AI

**Detect scams before they detect you.**

Built for Elevate 2026 — Cybersecurity + Artificial Intelligence theme.

## What it does

ScamShield AI analyzes text messages, URLs, and screenshots to detect scams,
phishing attempts, fake job offers, and fraudulent payment requests. It combines
fast rule-based heuristics with LLM-based reasoning (Claude) to return a scam
score, category, risk level, and human-readable reasons.

## Architecture

```
User Input (Next.js Frontend)
        |
        v
Express Backend (routing, validation, OCR upload handling)
        |
        v
FastAPI AI Service (rule-based engine + Claude LLM analysis)
        |
        v
JSON result -> back to frontend
```

## Services

| Service              | Stack                  | Port  |
|----------------------|-------------------------|-------|
| scamshield-frontend   | Next.js (App Router) + Tailwind | 3000 |
| scamshield-backend    | Node.js + Express        | 5000 |
| scamshield-ai         | Python + FastAPI         | 8000 |

## Local Development

Each service runs independently. Start all three in separate terminals:

```bash
# Terminal 1 — AI service
cd scamshield-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd scamshield-backend
npm install
npm run dev

# Terminal 3 — Frontend
cd scamshield-frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

### ⚠️ System dependency: Tesseract OCR

The screenshot analysis feature shells out to the **system Tesseract binary**
(via Node's `execFile`, not a vulnerable npm wrapper — see
`scamshield-backend/services/ocrService.js` for why). This means Tesseract
must be installed on whatever machine runs `scamshield-backend`:

```bash
# Ubuntu / Debian (including most Render runtimes)
sudo apt-get update && sudo apt-get install -y tesseract-ocr

# macOS
brew install tesseract
```

**On Render specifically:** add a build command that installs `tesseract-ocr`
before `npm install`, or use a Docker-based Render service with Tesseract
baked into the image. Without this, `/api/analyze-screenshot` will return a
502 error ("Tesseract OCR is not installed on this server").

## Environment Variables

See `.env.example` in each service folder.

## Build Phases

1. Frontend UI structure
2. Text analysis API
3. URL analysis API
4. Screenshot OCR pipeline
5. Reports page
6. Learn page

## Deployment

- Frontend → Vercel
- Backend → Render
- AI service → Render
