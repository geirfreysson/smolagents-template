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
            # Create agent with streaming enabled
            agent = create_agent()
            
            # Extract text from message format
            user_message = " ".join([part.text for part in request.message if part.type == "text"])
            print(f"Processing message: {user_message}")
            
            # Run agent in streaming mode
            event_count = 0
            for event in agent.run(user_message, stream=True):
                event_count += 1
                event_type = type(event).__name__
                
                # Handle different event types for frontend
                if event_type == "ToolCall":
                    # Tool is about to be called
                    tool_call_data = {
                        "type": "tool_call_start",
                        "tool_name": event.name,
                        "tool_arguments": event.arguments,
                        "tool_call_id": event.id
                    }
                    print(f"🔧 Tool call starting: {event.name}")
                    yield f"0:{json.dumps(tool_call_data)}\n"
                
                elif event_type == "ToolOutput":
                    # Tool call completed
                    tool_output_data = {
                        "type": "tool_call_complete" if not event.is_final_answer else "tool_call_final", 
                        "tool_name": event.tool_call.name,
                        "tool_call_id": event.id,
                        "result": event.output,
                        "observation": event.observation,
                        "is_final_answer": event.is_final_answer
                    }
                    print(f"✅ Tool call completed: {event.tool_call.name} -> {str(event.output)[:50]}...")
                    yield f"0:{json.dumps(tool_output_data)}\n"
                
                elif event_type == "ChatMessageStreamDelta":
                    # Stream text content if available
                    if event.content:
                        text_data = {
                            "type": "text",
                            "content": event.content
                        }
                        yield f"0:{json.dumps(text_data)}\n"
                
                elif event_type == "ActionOutput":
                    if event.is_final_answer:
                        # Final answer from the agent
                        final_data = {
                            "type": "final_answer",
                            "content": str(event.output)
                        }
                        print(f"🎯 Final answer: {str(event.output)[:50]}...")
                        yield f"0:{json.dumps(final_data)}\n"
                
                elif event_type == "FinalAnswerStep":
                    # Final result
                    final_data = {
                        "type": "final_result", 
                        "content": str(event.output)
                    }
                    print(f"🏁 Final result: {str(event.output)[:50]}...")
                    yield f"0:{json.dumps(final_data)}\n"
                
                # Skip ActionStep and other internal events for now
                # as they contain non-serializable objects
            
            # End of stream marker
            yield "d:\n"
            print(f"\nCompleted streaming with {event_count} events")
            
        except Exception as e:
            print(f"Error during streaming: {e}")
            import traceback
            traceback.print_exc()
            error_msg = f"Error: {str(e)}"
            yield f"0:{json.dumps({'type': 'error', 'message': error_msg})}\n"
            yield "d:\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )