.PHONY: dev frontend backend help

# Default target
dev:
	@echo "Starting both frontend and backend servers..."
	@make -j2 frontend backend

# Run frontend development server
frontend:
	@echo "Starting frontend server..."
	@cd frontend && npm run dev

# Run backend server with uv
backend:
	@echo "Starting backend server..."
	@cd backend && DEBUG=true uv run python main.py

# Show help
help:
	@echo "Available targets:"
	@echo "  dev      - Start both frontend and backend servers (default)"
	@echo "  frontend - Start only the frontend server"
	@echo "  backend  - Start only the backend server"
	@echo "  help     - Show this help message"