# FinanceIntelligence: Agentic Financial Analysis Ecosystem

**FinanceIntelligence** is a full-stack AI application that leverages **LangGraph** to coordinate multi-step, stateful financial research workflows. The system autonomously analyzes internal CSV data, performs real-time web research on competitors, and self-critiques its findings to produce investment-grade reports.

### 🌐 [Live Dashboard](https://ai-agent-finance-frontend.onrender.com) | 
🛠️ [API Documentation](https://ai-agent-finance-29gh.onrender.com/docs)

---

## Quick Start & Testing
To see the agentic workflow immediately without creating your own data:

Locate the sample data at: backend/data/sample_financials.csv.

Upload this file via the FinanceIntelligence dashboard.

The agent will autonomously parse the headers, perform research, and generate a multi-page report.

---

## System Architecture
The project is decoupled into a stateful AI backend and a reactive modern dashboard to provide a seamless user experience during complex AI reasoning.



* **Backend:** Python 3.x, **FastAPI**, and **LangGraph** for multi-agent orchestration.
* **Frontend:** **React 19**, Vite, and **TypeScript** for a real-time status dashboard.
* **AI Logic:** **OpenAI GPT-4o-mini** for reasoning and **Tavily AI** for real-time web research.
* **Deployment:** Managed via **Render** with CI/CD integration from GitLab.

---

## Key Features
* **Autonomous Pipeline:** Uses a `StateGraph` to manage the flow between gathering data, analyzing, and researching competitors.
* **Real-time Event Streaming:** Implemented via FastAPI `StreamingResponse` using Server-Sent Events (SSE).
* **Execution Pipeline Logs:** A live UI feed that maps the agent's internal reasoning process in real-time.
* **Self-Correction Loop:** Includes a "Critique & Revise" edge where the agent identifies gaps in its own analysis and performs additional research.
* **Export Capabilities:** Integrated Markdown-to-PDF generation for instant portability of findings.

---

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

---
## Technical Insights

Stream Resilience: Developed a custom client-side buffer in React to reassemble fragmented JSON chunks, resolving SyntaxError: Unterminated string issues during high-bandwidth streaming.

Dynamic Routing: Implemented environment-aware API logic to seamlessly switch between local development and production Render environments.

## Project Structure
```plaintext
AI-AGENT-FINANCE/
├── backend/              # FastAPI & LangGraph Logic
│   ├── data/             # Sample financial CSVs
│   ├── graph_agent.py    # Node logic & StateGraph compilation
│   ├── main.py           # Streaming server & API endpoints
│   └── requirements.txt  # Python dependencies
├── frontend/             # React/Vite Dashboard
│   ├── src/App.tsx       # Live status dashboard & streaming logic
│   ├── package.json      # UI dependencies
│   └── vite.config.ts    # Build configuration
└── README.md             # Root project documentation

