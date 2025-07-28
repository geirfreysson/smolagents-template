import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_chat_endpoint_streaming():
    """Test that the chat endpoint returns a proper streaming response."""
    payload = {
        "message": [{"type": "text", "text": "What's the weather like?"}],
        "conversation_history": [],
        "context": {}
    }
    
    response = client.post("/api/chat", json=payload)
    
    # Check that we get a successful response
    assert response.status_code == 200
    
    # Check streaming headers
    assert "text/plain" in response.headers.get("content-type", "")
    
    # Check that we get streaming content
    content = response.text
    assert len(content) > 0
    
    # Parse the streaming response to check format
    lines = content.strip().split('\n')
    events = []
    for line in lines:
        if line.startswith('0:'):
            import json
            event_data = json.loads(line[2:])
            events.append(event_data)
    
    # Should have tool_call_start, tool_call_complete, and text events
    tool_start_events = [e for e in events if e.get('type') == 'tool_call_start']
    tool_complete_events = [e for e in events if e.get('type') == 'tool_call_complete']
    text_events = [e for e in events if e.get('type') == 'text']
    final_answer_events = [e for e in events if e.get('type') == 'final_answer']
    final_result_events = [e for e in events if e.get('type') == 'final_result']
    
    assert len(tool_start_events) > 0, "Should have at least one tool_call_start event"
    assert len(tool_complete_events) > 0, "Should have at least one tool_call_complete event"
    assert len(text_events) > 0, "Should have text events for final answer"
    
    # Should NOT have redundant final_answer or final_result events anymore
    assert len(final_answer_events) == 0, f"Should not have final_answer events but got: {final_answer_events}"
    assert len(final_result_events) == 0, f"Should not have final_result events but got: {final_result_events}"
    
    # Check that final answer text doesn't contain TOOL_CALL JSON
    final_text = ''.join([e['content'] for e in text_events])
    
    # Write raw response to file for analysis
    with open("/Users/geirfreysson/Code/smolagents-template/backend/raw_streaming_response.txt", "w") as f:
        f.write("=== RAW STREAMING RESPONSE ===\n")
        f.write(f"Content length: {len(content)} characters\n")
        f.write(f"Number of lines: {len(content.strip().split(chr(10)))}\n\n")
        f.write("Raw content:\n")
        f.write(content)
        f.write("\n\n=== PARSED EVENTS ===\n")
        for i, event in enumerate(events):
            f.write(f"{i:3d}: {event}\n")
        f.write(f"\n=== FINAL TEXT ===\n")
        f.write(f"'{final_text}'\n")
    
    print(f"Raw streaming response written to: raw_streaming_response.txt")
    print(f"Content length: {len(content)} chars, Events: {len(events)}, Final text length: {len(final_text)}")
    
    assert 'TOOL_CALL' not in final_text, f"Final answer should not contain 'TOOL_CALL' but got: {final_text}"
    assert '{"name":"get_weather"' not in final_text, f"Final answer should not contain JSON tool call but got: {final_text}"