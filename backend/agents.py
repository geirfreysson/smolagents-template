from smolagents import ToolCallingAgent, LiteLLMModel
from smolagents.memory import TaskStep, ActionStep, SystemPromptStep, Timing
from tools import get_weather
from memory import convert_conversation_to_memory_steps
import os
from typing import List, Dict, Any
import time


def create_agent(conversation_history: List[Dict[str, Any]] = None):
    """Create and return a ToolCallingAgent with weather tool and streaming enabled.
    
    Args:
        conversation_history: Optional list of previous conversation messages
                            to initialize the agent's memory with context
    """
    model = LiteLLMModel(
        model_id="gpt-4o-mini",
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    agent = ToolCallingAgent(
        tools=[get_weather],
        model=model,
        stream_outputs=True  # Enable streaming to get ToolCall/ToolOutput events
    )
    
    # Initialize agent memory with conversation history if provided
    if conversation_history:
        try:
            chat_messages = convert_conversation_to_memory_steps(conversation_history)
            
            # Override the write_memory_to_messages method to include conversation history
            original_write_memory = agent.write_memory_to_messages
            
            def write_memory_with_history(summary_mode=False):
                # Get the original system prompt
                messages = agent.memory.system_prompt.to_messages(summary_mode=summary_mode)
                # Add conversation history messages
                messages.extend(chat_messages)
                # Add any new memory steps from current session
                for memory_step in agent.memory.steps:
                    messages.extend(memory_step.to_messages(summary_mode=summary_mode))
                return messages
            
            # Replace the method
            agent.write_memory_to_messages = write_memory_with_history
                
        except Exception as e:
            # Continue with fresh agent if memory initialization fails
            pass
    
    return agent