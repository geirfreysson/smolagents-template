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
        "message": "What's the weather like?",
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