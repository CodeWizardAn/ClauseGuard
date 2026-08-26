# 🛡️ ClauseGuard — Plain-Language Legal AI for Everyday People

<div align="center">

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Groq Llama 3.3](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F05032.svg?style=flat)](https://groq.com)
[![Indian Law Powered](https://img.shields.io/badge/Legal_DB-28_Indian_Acts-FF9933.svg?style=flat)](#-28-indian-law-acts-covered)

**ClauseGuard** transforms confusing legal jargon into clear, plain-language risk breakdowns, number-driven affordability calculations, and actionable negotiation advice.

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Indian Law DB](#-28-indian-law-acts-covered) • [Architecture](#-architecture)

</div>

---

## 🌟 Why ClauseGuard?

Contracts are written by lawyers for lawyers. When an everyday person signs a **rental agreement**, **home loan**, or **employment contract**, they are often unaware of unfair penalty clauses, unreasonable lock-in periods, or one-sided liability terms.

ClauseGuard reads your contract, extracts key numbers, checks against Indian legal frameworks, and tells you:
1. **What each clause actually means in simple English or Indian languages.**
2. **Whether you can afford it based on your actual income and location.**
3. **What specific red flags exist and exact counter-proposals to push back with.**

---

## ✨ Key Features

### 1. 🎯 Number-Driven Smart Personalization
- **Document-Specific Questions**: Instead of asking generic questions, the AI extracts exact commitments (e.g. *₹1,00,000/mo EMI in Bandra* or *₹45,000/mo rent*) and asks tailored questions (take-home salary, current city, dependents, debts).
- **Real Math & Affordability Rating**: Calculates debt-to-income ratios and net disposable income buffers (e.g., *"₹20,000 salary in Kalyan for a ₹1,00,000 EMI flat is 500% of income — immediate default risk"*).
- **Realistic Local Alternatives**: Suggests realistic areas and price ranges for your situation.

### 2. 🚨 AI Red Flags & Contract Bias Meter
- **Top 3 Red Flags**: Identifies the most dangerous clauses and gives a 💡 **negotiation tip** for each.
- **Contract Bias Slider**: Visual score from **-100 (Heavily Against You)** to **+100 (In Your Favour)**.
- **Overall Verdict**: Color-coded guidance (*Safe to Sign*, *Proceed with Caution*, or *Do Not Sign Without Changes*).

### 3. 🏛️ Indian Law Knowledge Base (28 Key Acts)
- Contextually cites relevant Indian statutes:
  - **Indian Contract Act, 1872** (S.23 Unlawful terms, S.27 Non-compete, S.73 Damages)
  - **Consumer Protection Act, 2019** (S.2(46) Unfair Contracts)
  - **Transfer of Property Act, 1882** & **RERA 2016** (Rental & Real Estate)
  - **Digital Personal Data Protection (DPDP) Act, 2023** (Privacy & Consent)
  - **Negotiable Instruments Act, 1881** (S.138 Cheque bounce liability)
  - **MSMED Act, 2006** (Vendor payment limits)
  - **Arbitration Act 1996**, **Specific Relief Act 1963**, and more.

### 4. 🧠 Real AI Semantic Clause Matching
- Uses vector embeddings (`all-MiniLM-L6-v2`) to compare clauses against pre-labeled risky patterns, returning *why it's risky* and *safe alternative versions*.

### 5. 🔒 Zero-Knowledge Privacy & PII Redaction
- Automatic client-side/in-memory regex stripping of Aadhaar numbers, PAN, phone numbers, emails, and names before any AI processing.
- Original files are discarded immediately; only privacy-cleaned text is stored in the local encrypted vault.

### 6. 🗣️ Multilingual Regional Translation
- Translate clauses and plain summaries into Indian vernacular languages: **Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, and Gujarati**.

### 7. 📄 Downloadable PDF Reports & Side-by-Side Comparator
- Generate professional, client-ready PDF reports with risk cards, scores, and legal citations.
- Compare two document drafts side-by-side with risk diff highlighting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Vanilla CSS Design Tokens
- **Animations**: Framer Motion (Page transitions + Continuous living GPU ambient background)
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
│   ├── embeddings.py            # Sentence vector similarity engine
│   ├── indian_law.py            # Knowledge base of 28 Indian Law Acts
│   ├── privacy.py               # PII & sensitive data redaction engine
│   ├── database_local.py        # SQLite schema & encrypted persistence
│   ├── rag_engine.py            # ChromaDB vector store for contract chat
│   ├── parser.py                # PDF, DOCX, and TXT segmenter
│   ├── report_generator.py      # Downloadable PDF report builder
│   ├── users.py                 # JWT authentication & 4-digit Vault PIN
│   ├── clause_dataset.json      # 22 labeled risky legal clause patterns
│   └── samples/                 # Sample rental, loan, and ToS contracts
├── frontend/
│   ├── src/
│   │   ├── pages/               # Auth, Dashboard, Analyze, SmartContext, Analysis, Report
│   │   ├── components/          # AppShell, AmbientBackground, PersonalizedVerdict, InsightsPanel
│   │   ├── App.jsx              # Router & smooth page transitions (AnimatePresence)
│   │   └── index.css            # Dark gold luxury theme & keyframes
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

# Create .env file
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

## 🏛️ 28 Indian Law Acts Covered

| Category | Acts & Sections Covered |
|---|---|
| **Contracts & Commercial** | Indian Contract Act 1872 (S.23, S.27, S.28, S.56, S.73, S.124), Specific Relief Act 1963 |
| **Consumer Protection** | Consumer Protection Act 2019 (S.2(46) Unfair Contracts, S.49 Mediation) |
| **Real Estate & Rentals** | Transfer of Property Act 1882, Real Estate (Regulation & Development) Act 2016 (RERA) |
| **Data Privacy & Tech** | Digital Personal Data Protection (DPDP) Act 2023, Information Technology Act 2000 (S.43A) |
| **Finance & Payments** | Negotiable Instruments Act 1881 (S.138 PDCs), MSMED Act 2006 (S.15 & 16), RBI Act 1934 |
| **IP & Copyright** | Copyright Act 1957 (S.57 Moral Rights) |
| **Employment** | Payment of Wages Act 1936, State Shops & Commercial Establishments Acts |
| **Dispute Resolution** | Arbitration & Conciliation Act 1996 |
| **Compliance & Stamp** | Indian Stamp Act 1899, Registration Act 1908, GST / CGST Act 2017, IBC 2016, FEMA 1999 |

---

## ⚠️ Disclaimer

ClauseGuard is an educational reading aid designed for awareness and understanding. It is **not** a law firm and does not provide formal legal advice. Always consult a licensed legal advocate for binding legal matters.

---

<div align="center">
Built with ❤️ for everyday citizens navigating complex contracts.
</div>
