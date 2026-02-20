# Financial Intelligence Agent

## Project Goal
Develop an agentic financial analysis ecosystem that utilizes LangGraph to coordinate multi-step workflows. The system gathers internal company data, performs real-time competitor research, and critiques its own findings to produce high-fidelity investment-grade reports.

## Project Structure
The project is decoupled into a stateful AI backend and a modern React dashboard.

Plaintext
AI-AGENT-FINANCE/
├── backend/
│   ├── data/              # Storage for financials.csv
│   ├── .env               # API Secrets (OpenAI, Tavily)
│   ├── graph_agent.py     # LangGraph node & edge logic
│   ├── main.py            # FastAPI streaming server
│   └── requirements.txt   # AI & Web dependencies
└── frontend/
    ├── src/
    │   ├── App.tsx        # Dashboard with live-stream status logs
    │   └── main.tsx
    ├── package.json       # Build scripts and UI dependencies
    └── vite.config.ts     # API Proxy configuration

## Tools & Technologies

rontend: React 19, Vite, React-Markdown (with GitHub Flavored Markdown), jsPDF for exports.

Backend: Python 3.x, FastAPI (StreamingResponse), LangGraph (Stateful Orchestration).

Agent Intelligence: OpenAI GPT-4o-mini (Reasoning), Tavily AI (Real-time Web Research).

Data Processing: Pandas for CSV parsing and data transformation.


## Steps
State Configuration: Define AgentState to track tasks, analysis, competitor data, and revision counts.

Node Development: Create modular functions for gathering financials, analyzing data, and researching competitors.

Graph Compilation: Use StateGraph to build the execution flow, including conditional edges for the "Critique & Revise" loop.

Streaming API: Implement a FastAPI StreamingResponse to push JSON events to the frontend as each agent node completes.

Reactive Dashboard: Build a React UI that listens to the server-sent events to update an "Execution Pipeline" in real-time.

## Running the Project

# Backend
Bash
cd backend
# Setup environment
python -m venv .venv
source .venv/bin/activate 
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Start Agent Server
python main.py

# Frontend
Bash
cd frontend
npm install
npm run dev

## Insights
Self-Correction: The "Critique & Research" loop significantly improves report accuracy by identifying gaps in initial competitor data.

User Feedback Loop: By streaming node updates, the user remains engaged during complex AI reasoning processes.

Data Portability: Integrated Markdown-to-PDF generation allows analysts to move from raw data to a sharable document in seconds.