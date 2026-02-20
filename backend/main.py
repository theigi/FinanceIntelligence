import json
import asyncio
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from graph_agent import graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For initial testing, you can use ["*"]. For better security, use your specific frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/analyze")
async def analyze_finance(
    task: str = Form(...),
    competitors: str = Form(...),
    max_revisions: int = Form(...),
    file: UploadFile = File(...)
):
    csv_content = (await file.read()).decode("utf-8")
    
    initial_state = {
        "task": task,
        "competitors": [c.strip() for c in competitors.split(",") if c.strip()],
        "csv_file": csv_content,
        "max_revisions": max_revisions,
        "revision_number": 1,
        "content": [],
        "financial_data": "",
        "analysis": "",
        "comparison": "",
        "feedback": "",
        "report": "",
    }

    async def event_generator():
        try:
            # astream yields updates as each node completes
            async for event in graph.astream(initial_state):
                # We send the node name and a snippet of the data
                yield f"data: {json.dumps(event)}\n\n"
                await asyncio.sleep(0.1) # Small delay for stability
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    import os
    # Get port from environment variable or default to 8000 for local dev
    port = int(os.environ.get("PORT", 8000)) 
    uvicorn.run(app, host="0.0.0.0", port=port)