# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack AI assistant application template using the assistant-ui library. It consists of:

- **Frontend**: Next.js 15 application with React 19, TypeScript, and Tailwind CSS
- **Backend**: Python backend (separate service) that handles AI chat processing
- **Architecture**: Frontend serves as a proxy to the Python backend via `/api/chat` route

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (Python)
```bash
cd backend
python main.py       # Start FastAPI server on port 8000
pytest tests/        # Run backend tests
```

### Environment Setup
Create `frontend/.env.local` with:
```
OPENAI_API_KEY=sk-your-key-here
BACKEND_URL=http://localhost:8000  # Optional, defaults to localhost:8000
```

For the backend, set the environment variable:
```bash
export OPENAI_API_KEY=sk-your-key-here
```

## Architecture

### Frontend Structure
- `app/page.tsx` - Main entry point, renders Assistant component
- `app/assistant.tsx` - Main assistant interface using assistant-ui
- `app/api/chat/route.ts` - API proxy that forwards requests to Python backend
- `components/assistant-ui/` - Custom assistant-ui components
- `components/ui/` - Reusable UI components using Radix UI primitives

### Backend Structure
- `main.py` - Entry point, starts uvicorn server on port 8000
- `api.py` - FastAPI application with CORS middleware and `/api/chat` endpoint
- `agents.py` - Creates ToolCallingAgent using smolagents library
- `tools.py` - Defines custom tools for the agent (e.g., weather tool)
- `tests/` - Backend test suite

### Backend Integration
- Frontend makes POST requests to `/api/chat`
- Route handler forwards messages to Python backend at `$BACKEND_URL/api/chat`
- Backend uses smolagents ToolCallingAgent with LiteLLM model (gpt-4o-mini)
- Returns streaming responses in assistant-ui compatible format
- Conversation history is maintained and passed to backend

### Key Dependencies

#### Frontend
- `@assistant-ui/react` - Core assistant UI framework
- `@ai-sdk/openai` - OpenAI integration
- `@radix-ui/*` - UI primitives
- `tailwindcss` - Styling framework
- `lucide-react` - Icons

#### Backend
- `fastapi` - Modern Python web framework
- `smolagents` - AI agent framework with tool calling capabilities
- `litellm` - Unified LLM API interface
- `uvicorn` - ASGI server for FastAPI
- `httpx` - HTTP client for async requests

## Development Notes

### Backend Implementation
- Backend uses smolagents ToolCallingAgent with configurable tools
- Default includes a weather tool that returns mock data
- Agent responses are streamed using FastAPI's StreamingResponse
- CORS is configured to allow requests from frontend (localhost:3000)
- Request/response format is compatible with assistant-ui expectations

### Integration Flow
1. Frontend sends user messages via `/api/chat` route
2. Next.js API route forwards to Python backend at `/api/chat`
3. Backend creates agent instance and processes message
4. Agent can call tools (like weather lookup) during processing
5. Response is streamed back through the frontend proxy
6. Frontend renders streaming response in assistant-ui interface

### Adding New Tools
To extend the backend with new capabilities:
1. Define new tool functions in `tools.py` using `@tool` decorator
2. Import and add to tools list in `agents.py`
3. Agent will automatically have access to new tools

- Frontend expects backend to be running on port 8000
- All API communication flows through the Next.js API route for proper CORS handling
- Error handling includes fallback error streams for assistant-ui compatibility

## Installing packages
The project uses uv as a package manager. To install packages, run:
```bash
uv add <package_name>
```

