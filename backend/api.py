from fastapi import FastAPI, Request as FastAPIRequest
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import logging
from agents import create_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    try:
        request_data = await raw_request.json()
        request = ChatRequest(**request_data)
    except Exception as e:
        return {"error": str(e)}
    
    def generate_response():
        try:
            # Create agent with streaming enabled and conversation history
            # Convert conversation_history to the format expected by create_agent
            history_for_agent = []
            for msg in request.conversation_history:
                msg_dict = {
                    'role': msg.role,
                    'content': msg.content
                }
                history_for_agent.append(msg_dict)
            
            agent = create_agent(conversation_history=history_for_agent)
            
            # Extract text from message format
            user_message = " ".join([part.text for part in request.message if part.type == "text"])
            
            # Run agent in streaming mode with reset=False to preserve conversation history
            event_count = 0
            for event in agent.run(user_message, stream=True, reset=False):
                event_count += 1
                event_type = type(event).__name__
                
                # Log detailed information about each event/chunk
                logger.info(f"CHUNK #{event_count}: Event Type: {event_type}")
                logger.info(f"CHUNK #{event_count}: Event Object: {event}")
                
                # Log specific attributes based on event type
                if hasattr(event, 'content'):
                    logger.info(f"CHUNK #{event_count}: Content: {getattr(event, 'content', 'N/A')}")
                if hasattr(event, 'output'):
                    logger.info(f"CHUNK #{event_count}: Output: {getattr(event, 'output', 'N/A')}")
                if hasattr(event, 'name'):
                    logger.info(f"CHUNK #{event_count}: Name: {getattr(event, 'name', 'N/A')}")
                logger.info(f"CHUNK #{event_count}: " + "-"*50)
                
                # Handle different event types for frontend
                if event_type == "ToolCall":
                    # Tool is about to be called
                    tool_call_data = {
                        "type": "tool_call_start",
                        "tool_name": event.name,
                        "tool_arguments": event.arguments,
                        "tool_call_id": event.id
                    }
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
                        yield f"0:{json.dumps(final_data)}\n"
                
                elif event_type == "FinalAnswerStep":
                    # Final result
                    final_data = {
                        "type": "final_result", 
                        "content": str(event.output)
                    }
                    yield f"0:{json.dumps(final_data)}\n"
                
                # Skip ActionStep and other internal events for now
                # as they contain non-serializable objects
            
            # End of stream marker
            yield "d:\n"
            
        except Exception as e:
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