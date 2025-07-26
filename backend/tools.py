from smolagents import tool

@tool
def get_weather(location: str) -> str:
    """
    Get the current weather for a given location.
    
    Args:
        location: The location to get weather for.
    """
    return f"The weather in {location} is sunny with a temperature of 72°F (22°C). Perfect day to be outside!"