# LegalAssist – AI-Assisted Case Analysis Platform

LegalAssist is a full-stack AI-powered legal case management platform designed to assist lawyers in analyzing cases efficiently and generating structured, lawyer-ready reports.

It enables clients to submit case details, upload supporting evidence, answer AI-generated follow-up questions, and allows lawyers to review AI-driven risk analysis before generating a final structured PDF report.

## Features

### Client Side
- Case intake form submission
- Auto-extraction of legal claims
- Evidence upload per claim
- AI-generated follow-up questions
- Risk & gap analysis preview
- Case progress tracking
- Lawyer assignment system

###  Lawyer Side
- View assigned cases
- Full case review dashboard
- AI-powered claim & risk analysis
- Approve & run full AI pipeline
- Generate structured lawyer-ready PDF report
- Case status management

##  AI Pipeline

The system uses an AI-based analysis flow:

1. Intake Processing
2. Claim Extraction
3. Evidence Gap Detection
4. Follow-up Question Generation
5. Risk & Loophole Analysis
6. Final Structured Report Generation

##  Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router

### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- Role-Based Access Control

### AI Integration
- LLM Service Layer
- Structured JSON Output Processing

### PDF Generation
- ReportLab

### Database
- PostgreSQL
- Managed using pgAdmin 4

##  Project Structure
LegalAssist/
│
├── backend/
│ ├── api/
│ ├── database/
│ ├── auth/
│ ├── pdf/
│ ├── ai/
│ └── main.py
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ └── api/
│ └── vite.config.js
│
└── README.md

##  Authentication & Roles

- Client Role
- Lawyer Role
- JWT-based authentication
- Protected routes (frontend & backend)


##  Final Output

The system generates a professionally formatted PDF containing:

- Case Intake Summary
- Extracted Legal Claims
- Evidence Status
- Follow-up Q&A
- Risk & Loophole Analysis

##  How To Run Locally

### Backend

cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend

cd frontend
npm install
npm run dev