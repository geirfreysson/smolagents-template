from smolagents import ToolCallingAgent, LiteLLMModel
from tools import get_weather
import os

def create_agent():
    """Create and return a ToolCallingAgent with weather tool and streaming enabled."""
    model = LiteLLMModel(
        model_id="gpt-4o-mini",
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    agent = ToolCallingAgent(
        tools=[get_weather],
        model=model,
        stream_outputs=True  # Enable streaming to get ToolCall/ToolOutput events
    )
    return agent