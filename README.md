# LegalAssist –  AI-Based Interactive Legal Assistance System with Automated Case Intake and Claim–Evidence Consistency Analysis

## Overview

LegalAssist is a full-stack AI-powered legal case management platform designed to assist lawyers in analyzing cases efficiently and generating structured, lawyer-ready reports.

The system enables clients to submit case details, upload supporting evidence, answer AI-generated follow-up questions, and allows lawyers to review AI-driven risk analysis before generating a final structured PDF report.

---

## Features

### Client Side
- Case intake form submission
- Automatic extraction of legal claims
- Evidence upload per claim
- AI-generated follow-up questions
- Risk and gap analysis preview
- Case progress tracking
- Lawyer assignment system

### Lawyer Side
- View assigned cases
- Full case review dashboard
- AI-powered claim and risk analysis
- Approve and execute complete AI pipeline
- Generate structured lawyer-ready PDF report
- Case status management

---

## AI Pipeline

The system follows a structured AI-based workflow:

1. Intake Processing  
2. Claim Extraction  
3. Evidence Gap Detection  
4. Follow-up Question Generation  
5. Risk and Loophole Analysis  
6. Final Structured Report Generation  

Each stage produces structured JSON output that is processed and stored before generating the final PDF.

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router

### Backend
- FastAPI
- SQLAlchemy ORM
- JWT Authentication
- Role-Based Access Control (RBAC)

### Database
- PostgreSQL
- Managed using pgAdmin 4

### AI Integration
- LLM Service Layer
- Structured JSON Output Processing
- Risk and Evidence Analysis Engine

### PDF Generation
- ReportLab (Platypus for structured document generation)

---

## Project Structure

```
LegalAssist/
│
├── backend/
│   ├── api/
│   ├── database/
│   ├── auth/
│   ├── pdf/
│   ├── ai/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── api/
│   └── vite.config.js
│
└── README.md
```

---

## Authentication and Roles

The platform implements secure role-based access control:

- Client Role
- Lawyer Role
- JWT-based Authentication
- Protected routes (Frontend and Backend)
- Secure API authorization headers

---

## Final Output

The system generates a professionally formatted PDF containing:

- Case Intake Summary
- Extracted Legal Claims
- Evidence Status Overview
- Follow-up Questions and Answers
- Risk and Loophole Analysis
- Structured Legal Assessment

The PDF is designed to be lawyer-ready and submission-friendly.

---

## How To Run Locally

### Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at:
```
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## System Workflow

1. Client submits case details  
2. AI extracts legal claims  
3. Client uploads supporting evidence  
4. AI detects gaps and generates follow-up questions  
5. Lawyer reviews AI analysis  
6. Lawyer approves final structured report  
7. System generates downloadable PDF  

---

## Key Objectives

- Reduce manual case analysis time  
- Improve legal claim structuring  
- Detect missing evidence early  
- Provide structured AI-assisted risk analysis  
- Enhance workflow efficiency for law firms  

---

## Author

Developed by Karishma Arivazhagan