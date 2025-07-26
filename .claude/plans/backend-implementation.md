# Backend Implementation Plan

## Goal
Create a FastAPI backend with smolagents integration that's compatible with the existing frontend.

## Analysis of Frontend Requirements
- Frontend sends POST to `/api/chat` with `{ messages }` 
- Backend expects request at `/api/chat` with `{ message, conversation_history, context }`
- Backend should return streaming text response
- Frontend expects plain text stream format

## Implementation Structure

### 1. tools.py
- Mock weather tool that returns "it is sunny"
- Follow smolagents tool interface

### 2. agents.py  
- Create ToolCallingAgent instance
- Configure with the weather tool
- Handle conversation flow

### 3. api.py
- FastAPI app with `/api/chat` endpoint
- Accept message and conversation_history
- Use agents.py to process request
- Stream response back to frontend

## Key Requirements
- Stream responses for real-time display
- Compatible with frontend's request/response format
- Simple implementation with minimal dependencies
- Use smolagents ToolCallingAgent pattern