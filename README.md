# 🛡️ ClauseGuard — Plain-Language Legal Intelligence & Risk Audit

<div align="center">

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Groq Llama 3.3](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F05032.svg?style=flat)](https://groq.com)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero_Knowledge_Redaction-A855F7.svg?style=flat)](#-privacy--zero-knowledge-architecture)

**ClauseGuard** transforms confusing legal agreements into plain-language summaries, real financial affordability math, and actionable negotiation advice.

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Disclaimer](#-disclaimer)

</div>

---

## 🌟 Why ClauseGuard?

Contracts are written by lawyers for lawyers. When an everyday person signs a **rental agreement**, **home loan**, or **employment contract**, they are often unaware of unfair penalty clauses, unreasonable lock-in periods, or one-sided liability terms.

ClauseGuard reads your contract, extracts key figures, checks against established legal principles, and tells you:
1. **What each clause actually means in simple English or Indian languages.**
2. **Whether you can afford it based on your actual income and location.**
3. **What essential protective clauses were completely omitted (Omission Radar).**
4. **Specific red flags and copy-paste counter-clauses to push back with.**

---

## ✨ Key Features

### 1. 🎯 Number-Driven Financial Affordability
- **Document-Specific Extraction**: Instead of generic advice, ClauseGuard extracts exact numbers (EMI, rent, deposit, lock-in months, penalty percentages) and evaluates them against your monthly income.
- **Deterministic Math**: Calculates debt-to-income ratios and net disposable income buffers to flag real default risks without arithmetic hallucinations.

### 2. 🚨 AI Red Flags & Contract Bias Meter
- **Top Red Flags**: Identifies the most one-sided clauses and pairs each with an actionable negotiation recommendation.
- **Contract Bias Slider**: Visual score from **-100 (Heavily Against You)** to **+100 (In Your Favour)**.
- **Overall Verdict**: Color-coded guidance (*Safe to Sign*, *Proceed with Caution*, or *Do Not Sign Without Changes*).

### 3. 🔍 "What's Missing?" Trap Detector (Omission Radar)
- Standard LLMs only analyze what is written in the text. ClauseGuard's Omission Radar audits what was **deliberately left out** (e.g. missing landlord repair covenants, missing statutory refund timelines, missing data erasure rights).
- Generates 1-click **ready-to-insert counter-clauses**.

### 4. 🧠 Grounded Semantic Clause Matching
- Uses vector embeddings (`all-MiniLM-L6-v2`) and statutory grounding to ensure answers are strictly factual, preventing legal hallucinations.

### 5. 🔒 Zero-Knowledge Privacy & PII Redaction
- Automatic client-side/in-memory regex stripping of Aadhaar numbers, PAN, phone numbers, emails, and names before any AI processing.
- Original files are discarded immediately; only privacy-cleaned text is stored in the local encrypted vault.

### 6. 🗣️ Multilingual Regional Translations
- Translate clauses and plain summaries into Indian vernacular languages: **Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, and Gujarati**.

### 7. 📄 Downloadable PDF Reports & Side-by-Side Comparator
- Generate professional PDF reports with risk cards, scores, and plain-language breakdowns.
- Compare two document drafts side-by-side with visual semantic difference highlighting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Vanilla CSS Design Tokens (Midnight Navy & Cyber Violet Web3 Theme)
- **Animations**: Framer Motion (Page transitions + GPU ambient background)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **LLM Engine**: Groq API (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`)
- **Semantic Search**: Sentence-Transformers (`all-MiniLM-L6-v2`) + ChromaDB
- **Database**: SQLite3 with AES-256 encrypted fields
- **PDF Engine**: PyMuPDF (`fitz`) + ReportLab PDF Generator

---

## 📁 Project Structure

```
ClauseGuard/
├── backend/
│   ├── main.py                  # FastAPI router and API endpoints
│   ├── smart_context.py         # Dynamic question & affordability engine
│   ├── insights.py              # AI Red flags & contract bias meter
│   ├── analyzer.py              # Clause analysis & plain-summary generator
│   ├── omissions.py             # Statutory omission & missing clause detector
│   ├── embeddings.py            # Sentence vector similarity engine
│   ├── indian_law.py            # Backend statutory benchmark knowledge base
│   ├── privacy.py               # PII & sensitive data redaction engine
│   ├── database_local.py        # SQLite schema & encrypted persistence
│   ├── rag_engine.py            # ChromaDB vector store for contract chat
│   ├── parser.py                # PDF, DOCX, and TXT segmenter
│   ├── report_generator.py      # Downloadable PDF report builder
│   ├── users.py                 # JWT authentication & 4-digit Vault PIN
│   └── samples/                 # Sample rental, loan, and commercial contracts
├── frontend/
│   ├── src/
│   │   ├── pages/               # Auth, Dashboard, Analyze, SmartContext, Analysis, Report, Vault
│   │   ├── components/          # AppShell, AmbientBackground, OmissionRadar, ClauseGuardLogo
│   │   ├── App.jsx              # Router & smooth page transitions (AnimatePresence)
│   │   └── index.css            # Midnight Navy & Cyber Violet theme
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Groq API Key ([Get one free at console.groq.com](https://console.groq.com))

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

ClauseGuard is an educational reading aid designed for awareness and understanding. It is **not** a law firm and does not provide formal legal advice. Always consult a licensed legal advocate for binding legal matters.

---

<div align="center">
Built with ❤️ for everyday citizens navigating complex contracts.
</div>
