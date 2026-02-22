# FinanceIntelligence – Agentic AI Financial Analysis System

🎯 **Purpose**  
FinanceIntelligence is an AI-powered system that autonomously analyzes financial data and market competitors to generate investment-grade reports.

🚀 **Why this project matters**
- Demonstrates advanced agentic AI workflows
- Showcases multi-step reasoning with self-correction
- Combines AI, backend APIs, and modern frontend
- Fully deployed with CI/CD on Render using GitLab

🔗 **Live Demo**
- 🌐 Frontend Dashboard: https://ai-agent-finance-frontend.onrender.com
- 🛠️ API Documentation: https://ai-agent-finance-29gh.onrender.com/docs

🧠 **Key Skills Demonstrated**
- Agentic AI (LangGraph, multi-node state machines)
- Backend APIs (FastAPI, SSE streaming)
- Frontend (React, TypeScript, real-time UI)
- LLM Integration (OpenAI, Tavily)
- Deployment & CI/CD (GitLab + Render)

---

## Evaluation Notes 
This project demonstrates:
- Advanced agentic AI system design
- Real-time streaming architectures
- Autonomous reasoning with self-improvement
- Production-ready deployment and CI/CD

---

## Project Overview
FinanceIntelligence coordinates autonomous AI agents to:
- Parse internal CSV financial data
- Perform live web research on competitors
- Critique and refine its own analysis
- Produce structured, exportable financial reports

---

## Key Features
- **Autonomous Agent Pipeline** using LangGraph `StateGraph`
- **Real-time Event Streaming** via FastAPI `StreamingResponse` (SSE)
- **Self-Correction Loop** (Critique & Revise)
- **Execution Logs UI** visualizing agent reasoning steps
- **Markdown → PDF Export** for reports

---

## Architecture Overview
- **Frontend**: React 19 + TypeScript dashboard for live monitoring
- **Backend**: FastAPI server orchestrating LangGraph agents
- **AI Layer**: OpenAI GPT-4o-mini for reasoning, Tavily for web research
- **Deployment**: Render with GitLab CI/CD

---

## Quick Start (Demo without setup)
1. Locate sample data: `backend/data/sample_financials.csv`
2. Upload via the FinanceIntelligence dashboard
3. Observe autonomous analysis and report generation

---

## Project Structure
```text
AI-AGENT-FINANCE/
├── backend/
│   ├── data/             # Sample financial CSVs
│   ├── graph_agent.py    # LangGraph node logic & StateGraph
│   ├── main.py           # Streaming API server
│   └── requirements.txt
├── frontend/
│   ├── src/App.tsx       # Live dashboard & streaming client
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Vite

**Backend**
- Python 3.x
- FastAPI
- LangGraph

**AI & Data**
- OpenAI GPT-4o-mini
- Tavily AI
- Pandas

**DevOps**
- GitLab CI/CD
- Render

---

## Running the Project Locally

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Technical Insights
- **Stream Resilience**: Custom client-side buffer reassembles fragmented JSON chunks to prevent SSE parsing errors.
- **Dynamic Routing**: Environment-aware API switching between local and Render deployments.

---