import os
import pandas as pd
from io import StringIO
from typing import List, TypedDict, Optional
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from tavily import TavilyClient

load_dotenv()

# --- Schema ---
class AgentState(TypedDict):
    task: str
    competitors: List[str]
    csv_file: str
    financial_data: str
    analysis: str
    comparison: str
    feedback: str
    report: str
    content: List[str]
    revision_number: int
    max_revisions: int

class Queries(BaseModel):
    queries: List[str]

# --- Setup ---
llm = ChatOpenAI(model="gpt-4o-mini")
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# Prompts (Keeping your original prompts)
GATHER_FINANCIALS_PROMPT = "You are an expert financial analyst. Gather the financial data..."
ANALYZE_DATA_PROMPT = "You are an expert financial analyst. Analyze the data..."
RESEARCH_COMPETITORS_PROMPT = "Generate search queries to gather competitor info..."
COMPETE_PERFORMANCE_PROMPT = "Compare performance. INCLUDE COMPETITOR NAMES."
FEEDBACK_PROMPT = "Provide critique for the report."
WRITE_REPORT_PROMPT = "Write a comprehensive financial report."
RESEARCH_CRITIQUE_PROMPT = "Generate queries to address the critique."

# --- Nodes ---
def gather_financials_node(state: AgentState):
    df = pd.read_csv(StringIO(state["csv_file"]))
    financial_data_str = df.to_string(index=False)
    messages = [SystemMessage(content=GATHER_FINANCIALS_PROMPT), 
                HumanMessage(content=f"{state['task']}\n\nData:\n{financial_data_str}")]
    return {"financial_data": llm.invoke(messages).content}

def analyze_data_node(state: AgentState):
    messages = [SystemMessage(content=ANALYZE_DATA_PROMPT), HumanMessage(content=state["financial_data"])]
    return {"analysis": llm.invoke(messages).content}

def research_competitors_node(state: AgentState):
    content = state.get("content", [])
    for competitor in state["competitors"]:
        queries = llm.with_structured_output(Queries).invoke([
            SystemMessage(content=RESEARCH_COMPETITORS_PROMPT),
            HumanMessage(content=competitor)
        ])
        for q in queries.queries:
            res = tavily.search(query=q, max_results=2)
            content.extend([r["content"] for r in res["results"]])
    return {"content": content}

def compare_performance_node(state: AgentState):
    messages = [SystemMessage(content=COMPETE_PERFORMANCE_PROMPT), HumanMessage(content=state["analysis"])]
    return {"comparison": llm.invoke(messages).content, "revision_number": state.get("revision_number", 1) + 1}

def collect_feedback_node(state: AgentState):
    messages = [SystemMessage(content=FEEDBACK_PROMPT), HumanMessage(content=state["comparison"])]
    return {"feedback": llm.invoke(messages).content}

def research_critique_node(state: AgentState):
    queries = llm.with_structured_output(Queries).invoke([
        SystemMessage(content=RESEARCH_CRITIQUE_PROMPT),
        HumanMessage(content=state["feedback"])
    ])
    content = state.get("content", [])
    for q in queries.queries:
        res = tavily.search(query=q, max_results=2)
        content.extend([r["content"] for r in res["results"]])
    return {"content": content}

def write_report_node(state: AgentState):
    messages = [SystemMessage(content=WRITE_REPORT_PROMPT), HumanMessage(content=state["comparison"])]
    return {"report": llm.invoke(messages).content}

def should_continue(state):
    return END if state["revision_number"] > state["max_revisions"] else "collect_feedback"

# --- Build Graph ---
builder = StateGraph(AgentState)
builder.add_node("gather_financials", gather_financials_node)
builder.add_node("analyze_data", analyze_data_node)
builder.add_node("research_competitors", research_competitors_node)
builder.add_node("compare_performance", compare_performance_node)
builder.add_node("collect_feedback", collect_feedback_node)
builder.add_node("research_critique", research_critique_node)
builder.add_node("write_report", write_report_node)

builder.set_entry_point("gather_financials")
builder.add_edge("gather_financials", "analyze_data")
builder.add_edge("analyze_data", "research_competitors")
builder.add_edge("research_competitors", "compare_performance")
builder.add_conditional_edges("compare_performance", should_continue, {END: "write_report", "collect_feedback": "collect_feedback"})
builder.add_edge("collect_feedback", "research_critique")
builder.add_edge("research_critique", "compare_performance")
builder.add_edge("write_report", END)

graph = builder.compile()