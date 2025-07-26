from fastapi import FastAPI, Request as FastAPIRequest
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from agents import create_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContentPart(BaseModel):
    type: str
    text: str
    status: Dict[str, Any] = {}

class ChatMessage(BaseModel):
    role: str
    content: List[ContentPart]

class ChatRequest(BaseModel):
    message: List[ContentPart]
    conversation_history: List[ChatMessage] = []
    context: Dict[str, Any] = {}

@app.post("/api/chat")
async def chat_endpoint(raw_request: FastAPIRequest):
    """Chat endpoint that streams responses from smolagents ToolCallingAgent."""
    body = await raw_request.body()
    print(f"Raw request body: {body}")
    
    try:
        request_data = await raw_request.json()
        print(f"Parsed JSON: {request_data}")
        request = ChatRequest(**request_data)
        print(f"Validated request: {request}")
    except Exception as e:
        print(f"Validation error: {e}")
        return {"error": str(e)}
    
    def generate_response():
        try:
            # Create agent
            agent = create_agent()
            
            # Extract text from message format
            user_message = " ".join([part.text for part in request.message if part.type == "text"])
            
            # Run agent with the user message
            response = agent.run(user_message)
            
            # Stream the response
            yield f"0:{json.dumps(response)}\n"
            yield "d:\n"
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            yield f"0:{json.dumps(error_msg)}\n"
            yield "d:\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )