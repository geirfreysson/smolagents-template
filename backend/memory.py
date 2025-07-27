from smolagents.models import ChatMessage, MessageRole
from typing import List, Dict, Any


def convert_conversation_to_memory_steps(conversation_history: List[Dict[str, Any]]) -> List:
    """Convert conversation history to smolagents memory steps."""
    memory_steps = []
    for message in conversation_history:
        role = message.get('role', '')
        content_parts = message.get('content', [])
        
        # Extract text content from all parts
        text_content = ""
        for part in content_parts:
            
            # Handle ContentPart objects (they have .text attribute)
            if hasattr(part, 'text'):
                text_content += part.text
            # Handle dictionary format
            elif isinstance(part, dict) and part.get('type') == 'text':
                text_content += part.get('text', '')
            # Handle plain strings
            elif isinstance(part, str):
                text_content += part
        
        if not text_content.strip():
            continue
        
        if role == 'user':
            # For conversation history, create a custom user message without "New task:" prefix
            user_message = ChatMessage(
                role=MessageRole.USER, 
                content=[{"type": "text", "text": text_content.strip()}]
            )
            memory_steps.append(user_message)
        elif role == 'assistant':
            # Clean up assistant content by removing tool call artifacts
            clean_content = text_content.strip()
            # Clean up tool call artifacts and extract the clean answer
            if '__TOOL_CALL__:' in clean_content:
                try:
                    # Extract the answer from the tool call JSON
                    import json
                    import re
                    
                    # Find the tool call JSON
                    tool_call_match = re.search(r'__TOOL_CALL__:({.*?})(?:I\'m|You|Please|The|A|An|\w)', clean_content)
                    if tool_call_match:
                        tool_call_json = tool_call_match.group(1)
                        tool_call_data = json.loads(tool_call_json)
                        if 'arguments' in tool_call_data and 'answer' in tool_call_data['arguments']:
                            clean_content = tool_call_data['arguments']['answer']
                        else:
                            # Fallback: extract text after the JSON
                            clean_content = clean_content.split('}', 1)[-1].strip()
                    else:
                        # Fallback: extract text after the tool call marker
                        clean_content = clean_content.split('}', 1)[-1].strip()
                except (json.JSONDecodeError, IndexError):
                    # Fallback: extract text after the tool call marker
                    clean_content = clean_content.split('}', 1)[-1].strip()
                
                # Remove any remaining duplicated text (common pattern: "answer answer")
                words = clean_content.split()
                if len(words) > 1:
                    # Check if the text is duplicated
                    mid = len(words) // 2
                    first_half = ' '.join(words[:mid])
                    second_half = ' '.join(words[mid:])
                    if first_half == second_half:
                        clean_content = first_half
            
            # For conversation history, create a custom assistant message 
            assistant_message = ChatMessage(
                role=MessageRole.ASSISTANT,
                content=[{"type": "text", "text": clean_content}]
            )
            memory_steps.append(assistant_message)
    
    return memory_steps