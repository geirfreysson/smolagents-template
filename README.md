# AI Agent Template

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
- `lib/` - Utility functions and constants
- `public/` - Static assets
- `styles/` - Global styles
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `package.json` - Project dependencies and scripts

## Installation

### Frontend (Next.js)
```bash
cd frontend
npm install
```

### Backend (Python)
```bash
cd backend
uv sync
```

# Creating a new tool
To create a new tool, add a new function to `backend/tools.py` using the `@tool` decorator. For example:
```python
@tool
def new_tool(arg1: str, arg2: int) -> str:
    """
    Description of the tool.
    """
    return f"Tool called with arg1: {arg1} and arg2: {arg2}"
```

Then add the tool to the tools list in `backend/agents.py`:
```python
from backend.tools import new_tool

agent = ToolCallingAgent(
    model="gpt-4o-mini",
    tools=[new_tool],
    verbose=True,
)
```

When the tool is called, the front end will display the tool name and arguments in the UI. To set what the label for the toolcall is, add it to

`frontend/lib/tool-display-names.ts`

