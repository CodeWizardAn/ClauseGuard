# 🛡️ ClauseGuard — Plain-Language Legal Intelligence & Risk Audit

<div align="center">

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Groq Llama 3.3](https://img.shields.io/badge/LLM-Groq_Llama_3.3_%26_Qwen-F05032.svg?style=flat)](https://groq.com)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero_Knowledge_Redaction-A855F7.svg?style=flat)](#-privacy--zero-knowledge-architecture)
[![Indian Law](https://img.shields.io/badge/Grounding-49%2B_Indian_Statutes-00C853.svg?style=flat)](#-comprehensive-indian-statutory-grounding)

**ClauseGuard** transforms complex legal agreements into plain-language summaries, exact financial affordability math, and actionable negotiation advice powered by Indian statutory benchmarks.

[Key Features](#-key-features) • [Indian Law Database](#-comprehensive-indian-statutory-grounding) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Disclaimer](#-disclaimer)

</div>

---

## 🌟 Why ClauseGuard?

Contracts are written by lawyers for lawyers. When an everyday person signs a **rental agreement**, **home loan**, **freelance contract**, or **employment agreement**, they are often unaware of unfair penalty clauses, unreasonable lock-in periods, or one-sided liability terms.

ClauseGuard reads your contract, extracts key figures, checks against established legal principles, and tells you:
1. **What each clause actually means in simple English or Indian languages.**
2. **Whether you can afford it with an exact mathematical score based on your real income and location.**
3. **Interactive 4-tier Risk Spectrum (Red, Orange, Yellow, Green) with 1-click filtering.**
4. **What essential protective clauses were completely omitted (Omission Radar).**
5. **Specific red flags and copy-paste counter-clauses to negotiate effectively.**

---

## ✨ Key Features

### 1. 📊 Interactive 4-Tier Risk Breakdown Spectrum
- **Mutually Exclusive Color Coding**:
  - 🔴 **Red (Risky / Severe)**: One-sided terms, unfair forfeitures, unvetted liability (`Critical / Score >= 75`).
  - 🟠 **Orange (Moderate Risk)**: Elevated notice obligations, conditional lock-in (`High / Score 55-74`).
  - 🟡 **Yellow (Above Normal)**: Standard procedural duties, minor warnings (`Medium / Score 35-54`).
  - 🟢 **Green (Normal / Safe)**: Fair mutual terms, clean statutory protections (`Clean/Low / Score < 35`).
- **Interactive SVG Donut & Slices**: Proportional visualization with hover glows.
- **1-Click Severity Filtering**: Click any card or segment to instantly focus on specific risk categories.

### 2. 🧮 Continuous Exact-Accuracy Mathematical Affordability Engine
- **Non-Bucketed Deterministic Scoring**: Computes exact 0-100 affordability scores (e.g. `82`, `74`, `64`, `92`, `43`, `3`) instead of fixed bucket approximations.
- **Continuous DTI Curve**: Mathematically scales debt-to-income ratios from 0% to 100%.
- **City Living Cost & Dependents Buffering**: Factors in Tier 1/2/3 local living costs and essential living buffers to predict real-world monthly cash flow.
- **Standalone Affordability Calculator (`/calculator`)**: Instant financial stress-tester for rent, home loan EMI, vehicle loan, or personal loan without uploading any document.

### 3. 🏛️ Comprehensive Indian Statutory Grounding (49+ Benchmarks)
Clause analysis is strictly grounded in codified Indian laws and Supreme Court precedents:
- **Indian Contract Act 1872**: Sec 27 (Post-employment non-compete void), Sec 28 (Bar on legal proceedings void), Sec 70 (*Quantum Meruit*), Sec 73 (*Hadley v Baxendale* unliquidated damages), Sec 74 (*Kailash Nath* liquidated damages vs penalty).
- **Property & Tenancy**: Transfer of Property Act 1882 (Sec 108, 111, 114 lease forfeiture), Model Tenancy Act (Sec 20 ban on essential utility cutoff, 2-month deposit cap), RERA 2016 (Sec 2(k) carpet area mandate, Sec 14 5-year structural defect liability).
- **Banking & Lending**: RBI 2024 Fair Lending Circular (Ban on penal interest compounding), Mandatory Key Fact Statement (KFS & APR), SARFAESI Act 2002 (Sec 13, 14 demand notices), NI Act Sec 138 (Blank security cheque abuse).
- **Labor & Workplace**: Industrial Disputes Act Sec 25F (Retrenchment compensation), POSH Act 2013, Maternity Benefit Act (26 weeks paid leave), Gratuity & EPF Acts.
- **Commercial & Insolvency**: MSMED Act 2006 (Sec 15, 16 45-day payment ceiling & 3x RBI compound interest), IBC 2016 (*Gujarat Urja* ban on *Ipso Facto* bankruptcy terminations), Arbitration Act Sec 12(5) (*Perkins Eastman* ban on unilateral sole arbitrators), Indian Stamp Act Sec 35 (*NN Global*).
- **Data Privacy & Tech**: DPDP Act 2023 (Sec 6, 8, 12 data fiduciary duties & right to erasure), IT Act 2000 (Sec 43A, 72A, 10A electronic contracts).

### 4. 🔍 "What's Missing?" Trap Detector (Omission Radar)
- Standard AI only reads what is present. ClauseGuard's Omission Radar audits what was **deliberately left out** across 8 contract types (Rental, Loan, Employment, Vendor/Service, SaaS ToS, Commercial, Real Estate Purchase, Freelance).
- Generates 1-click **ready-to-insert counter-clauses**.

### 5. 📖 Plain-Language Legal Glossary (30+ Terms)
- Instant plain-language explanations and real-world analogies for complex Latin maxims, banking acronyms, and contract terms (*Quantum Meruit, Ipso Facto, Subrogation, Pari Passu, Estoppel, Caveat Emptor, Res Judicata, Key Fact Statement, Carpet Area*).

### 6. 🔒 Zero-Knowledge Privacy & AES-256 Encrypted PIN Vault
- **Client-Side PII Stripping**: Aadhaar, PAN, phone numbers, emails, and names are sanitized before LLM transmission.
- **PIN-Protected Vault (`/vault`)**: Reports are stored locally encrypted with AES-256-GCM derived from the user's secret 4-digit PIN.

### 7. 🗣️ Multilingual Regional Translations
- Translates clauses, risk cards, and summaries into **Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, and Gujarati**.

### 8. 📄 Downloadable PDF Reports & Document Comparator
- Full executive PDF export with risk breakdown, statutory citations, and action checklists.
- Side-by-side contract difference visualizer (`/compare`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Vanilla CSS Tokens (Iridescent Obsidian, Electric Cyan & Ultraviolet Theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **LLM Engine**: Groq API with automatic 429 rate-limit backoff and multi-model fallback pool (`qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`)
- **Semantic Search**: Sentence-Transformers (`all-MiniLM-L6-v2`) + ChromaDB
- **Database**: SQLite3 with AES-256 encrypted fields
- **PDF Engine**: PyMuPDF (`fitz`) + ReportLab

---

## 📁 Project Structure

```
ClauseGuard/
├── backend/
│   ├── main.py                  # FastAPI router and API endpoints
│   ├── smart_context.py         # Exact continuous affordability & situational math
│   ├── insights.py              # AI Red flags & contract bias meter
│   ├── analyzer.py              # Clause risk analyzer with rate-limit fallback pool
│   ├── omissions.py             # Statutory omission & missing clause detector
│   ├── indian_law.py            # 49+ Indian statutory provisions & landmark precedents
│   ├── glossary.py              # 30+ plain-language legal definitions & analogies
│   ├── privacy.py               # Zero-knowledge PII redaction engine
│   ├── crypto_util.py           # AES-256-GCM encryption & PBKDF2 PIN derivation
│   ├── database_local.py        # SQLite schema & encrypted persistence
│   ├── rag_engine.py            # ChromaDB vector store for contract chat
│   ├── parser.py                # PDF, DOCX, and TXT segmenter
│   └── report_generator.py      # Downloadable PDF report builder
├── frontend/
│   ├── src/
│   │   ├── pages/               # Auth, Dashboard, Analyze, Analysis, Report, Calculator, Comparison, Glossary, Profile, Vault
│   │   ├── components/          # RiskDistributionChart, AppShell, AmbientBackground, OmissionRadar, InsightsPanel
│   │   ├── App.jsx              # Router & smooth page transitions
│   │   └── index.css            # Obsidian, Cyan & Ultraviolet Design System
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key ([console.groq.com](https://console.groq.com))

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_secret_jwt_key_here
```

```bash
# Start backend server
uvicorn main:app --reload --port 8000
```
*Backend runs at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)*

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## ⚠️ Disclaimer

ClauseGuard is an educational reading aid designed for awareness and understanding. It is **not** a law firm and does not provide formal legal advice. Always consult a licensed advocate for binding legal matters.


---



