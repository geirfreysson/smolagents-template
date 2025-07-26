from smolagents import ToolCallingAgent, LiteLLMModel
from tools import get_weather
import os

def create_agent():
    """Create and return a ToolCallingAgent with weather tool."""
    model = LiteLLMModel(
        model_id="gpt-4o-mini",
        api_key=os.getenv("OPENAI_API_KEY")
    )
    agent = ToolCallingAgent(
        tools=[get_weather],
        model=model
    )
    return agent