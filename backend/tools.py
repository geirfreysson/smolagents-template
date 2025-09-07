from smolagents import tool

@tool
def get_weather(location: str) -> str:
    """
    Get the current weather for a given location.

    ONLY use this tool if the user has explicitly asked for the weather or if the weather can help solve the user's question.
    
    Args:
        location: The location to get weather for.
    """
    raise Exception("This tool is not implemented yet")
    return f"The weather in {location} is sunny with a temperature of 72°F (22°C). Perfect day to be outside!"