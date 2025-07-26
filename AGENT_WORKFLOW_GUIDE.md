# Agent Development Workflow Guide

This guide explains how to use the upstream repository strategy for developing agents while keeping your template automatically up-to-date.

## Overview

This workflow allows you to:
- ✅ Create independent agent repositories that stay in sync with template updates
- ✅ Keep agent-specific code (tools.py) separate from template code
- ✅ Automatically receive template improvements and bug fixes
- ✅ Manage multiple agents from the same template base

## Repository Structure

```
smolagents-template/          # Main template repository (you maintain this)
├── backend/
│   ├── tools.py             # Template tool (weather example)
│   ├── agents.py            # Template core (don't modify in agents)
│   ├── api.py               # Template core (don't modify in agents)
│   └── main.py              # Template core (don't modify in agents)
└── frontend/                # Template core (don't modify in agents)

my-first-agent/              # Agent repository (forked from template)
├── backend/
│   ├── tools.py             # YOUR agent-specific tools
│   ├── agents.py            # From template (gets updated automatically)
│   ├── api.py               # From template (gets updated automatically)
│   └── main.py              # From template (gets updated automatically)
└── frontend/                # From template (gets updated automatically)
```

## Initial Setup

### Step 1: Create Agent Repository

Since you can't fork your own repository, you have several options:

#### Option A: GitHub CLI (Recommended)

```bash
# Create new repo from template using GitHub CLI
gh repo create weather-assistant --template yourusername/smolagents-template --private

# Clone and navigate
git clone https://github.com/yourusername/weather-assistant.git
cd weather-assistant
```

#### Option B: Manual Repository Creation

1. **Go to GitHub** → Click "New repository"
2. **Name it:** `weather-assistant` (or your agent name)  
3. **Don't initialize** (no README, .gitignore, etc.)
4. **Clone template and push to new repo:**

```bash
# Clone the template
git clone https://github.com/yourusername/smolagents-template.git weather-assistant
cd weather-assistant

# Change the origin to your new repo
git remote set-url origin https://github.com/yourusername/weather-assistant.git

# Push to your new repo
git push -u origin main
```

#### Option C: GitHub Template Feature

1. **In your template repo** → Go to Settings
2. **Check "Template repository"** box  
3. **When creating new repos** → Select your template from "Repository template" dropdown

### Step 2: Add Upstream Remote

Connect your agent repo to the template for automatic updates:

```bash
# Add the template repo as upstream
git remote add upstream https://github.com/yourusername/smolagents-template.git

# Verify remotes
git remote -v
# origin    https://github.com/yourusername/weather-assistant.git (fetch)
# origin    https://github.com/yourusername/weather-assistant.git (push)
# upstream  https://github.com/yourusername/smolagents-template.git (fetch)
# upstream  https://github.com/yourusername/smolagents-template.git (push)
```

### Step 3: Create Agent Branch

Create a dedicated branch for your agent development:

```bash
# Create and switch to agent branch
git checkout -b agent/weather-assistant

# This is where you'll do all your agent-specific work
```

### Step 4: Customize Your Agent

Now modify `backend/tools.py` for your specific agent:

```python
# backend/tools.py
from smolagents import tool
import requests

@tool
def get_weather_forecast(city: str, days: int = 3) -> str:
    """
    Get weather forecast for a city.
    
    Args:
        city: City name to get weather for
        days: Number of days to forecast (1-7)
    """
    # Your actual weather API implementation
    return f"Weather forecast for {city} for {days} days..."

@tool
def get_severe_weather_alerts(location: str) -> str:
    """
    Check for severe weather alerts in a location.
    
    Args:
        location: Location to check for alerts
    """
    # Your alert checking implementation
    return f"No severe weather alerts for {location}"
```

### Step 5: Initial Commit

Commit your agent-specific changes:

```bash
git add backend/tools.py
git commit -m "feat: Add weather forecast and alert tools"
git push origin agent/weather-assistant
```

## Daily Development Workflow

### Working on Your Agent

1. **Always work on your agent branch:**
   ```bash
   git checkout agent/weather-assistant
   ```

2. **Make changes only to agent-specific files:**
   - ✅ `backend/tools.py` - Your tools
   - ✅ `frontend/.env.local` - Your environment variables
   - ✅ Any new files you create
   - ❌ Don't modify: `backend/agents.py`, `backend/api.py`, `backend/main.py`, `frontend/` core files

3. **Test your changes:**
   ```bash
   cd frontend && npm run dev &
   cd backend && python main.py
   ```

4. **Commit your work:**
   ```bash
   git add .
   git commit -m "feat: Add new weather notification tool"
   git push origin agent/weather-assistant
   ```

## Updating Template Changes

### When to Update

Update your agent when:
- You see improvements in the template repository
- Bug fixes are available
- New features are added to the core framework
- Security updates are released

### Update Process

1. **Switch to main branch:**
   ```bash
   git checkout main
   ```

2. **Pull latest template changes:**
   ```bash
   git pull upstream main
   ```

3. **Push updates to your fork:**
   ```bash
   git push origin main
   ```

4. **Switch back to agent branch:**
   ```bash
   git checkout agent/weather-assistant
   ```

5. **Merge or rebase template updates:**

   **Option A: Merge (Recommended for beginners)**
   ```bash
   git merge main
   ```

   **Option B: Rebase (Cleaner history)**
   ```bash
   git rebase main
   ```

6. **Handle any conflicts:**
   - Conflicts should be rare if you only modify `tools.py`
   - If conflicts occur, they'll likely be in files you shouldn't have modified
   - Resolve by keeping template changes for core files

7. **Test everything works:**
   ```bash
   cd frontend && npm run dev &
   cd backend && python main.py
   ```

8. **Push updated agent:**
   ```bash
   git push origin agent/weather-assistant
   ```

## Managing Multiple Agents

### Creating Additional Agents

For each new agent, repeat the repository creation process:

```bash
# Option A: GitHub CLI (recommended)
gh repo create email-assistant --template yourusername/smolagents-template --private
git clone https://github.com/yourusername/email-assistant.git
cd email-assistant

# Option B: Manual creation (if not using GitHub CLI)
git clone https://github.com/yourusername/smolagents-template.git email-assistant
cd email-assistant
git remote set-url origin https://github.com/yourusername/email-assistant.git
git push -u origin main

# Add upstream and create agent branch
git remote add upstream https://github.com/yourusername/smolagents-template.git
git checkout -b agent/email-assistant

# Customize tools.py for email functionality
# Commit and push
```

### Updating All Agents

When you update the template, update all your agents:

```bash
# Update weather-assistant
cd weather-assistant
git checkout main && git pull upstream main && git push origin main
git checkout agent/weather-assistant && git merge main && git push origin agent/weather-assistant

# Update email-assistant  
cd ../email-assistant
git checkout main && git pull upstream main && git push origin main
git checkout agent/email-assistant && git merge main && git push origin agent/email-assistant
```

## File Guidelines

### ✅ Safe to Modify (Agent-Specific)

- `backend/tools.py` - Your agent's tools
- `frontend/.env.local` - Environment variables
- `README.md` - Agent-specific documentation
- Any new files you create

### ❌ Don't Modify (Template Files)

- `backend/agents.py` - Core agent logic
- `backend/api.py` - API routes
- `backend/main.py` - Server startup
- `frontend/app/` - Frontend core
- `frontend/components/` - UI components
- `pyproject.toml` - Dependencies
- `CLAUDE.md` - Template instructions

### 🤔 Think Twice (Shared Files)

- `.gitignore` - Add agent-specific ignores at the bottom
- `package.json` - Only if you need agent-specific dependencies

## Best Practices

### 1. Keep Tools Simple
```python
# Good: Simple, focused tool
@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email to a recipient."""
    # Implementation
    return "Email sent successfully"

# Avoid: Complex tools that do multiple things
@tool  
def handle_email_and_calendar_and_weather(input: str) -> str:
    """Do everything..."""  # Too complex!
```

### 2. Use Environment Variables
```python
# backend/tools.py
import os

@tool
def call_weather_api(city: str) -> str:
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return "Weather API key not configured"
    # Use api_key...
```

### 3. Document Your Tools
```python
@tool
def complex_calculation(data: str, method: str = "standard") -> str:
    """
    Perform complex data analysis.
    
    Args:
        data: JSON string containing the data to analyze
        method: Analysis method ('standard', 'advanced', 'quick')
    
    Returns:
        Analysis results as formatted string
    
    Example:
        complex_calculation('{"values": [1,2,3]}', 'advanced')
    """
```

### 4. Handle Errors Gracefully
```python
@tool
def risky_api_call(param: str) -> str:
    """Make an API call that might fail."""
    try:
        # API call logic
        return "Success result"
    except Exception as e:
        return f"Error: {str(e)}"
```

## Troubleshooting

### Problem: Merge Conflicts

**Symptoms:** Git says there are conflicts when merging/rebasing

**Solution:**
1. Check which files have conflicts: `git status`
2. If conflicts are in template files (agents.py, api.py, etc.):
   - You probably modified files you shouldn't have
   - Accept the template version: `git checkout --theirs filename`
3. If conflicts are in tools.py:
   - Manually resolve - keep your tools plus any template improvements

### Problem: "Your branch is behind"

**Symptoms:** Git says your branch is behind origin

**Solution:**
```bash
git pull origin agent/your-agent-name
```

### Problem: Can't Push to Upstream

**Symptoms:** Permission denied when pushing to upstream

**Solution:**
- You should never push to upstream
- Upstream is read-only for pulling template updates
- Always push to origin (your fork)

### Problem: Lost Changes After Update

**Symptoms:** Your tools.py was overwritten

**Prevention:**
- Always work on agent branch, never on main
- Only modify tools.py and agent-specific files

**Recovery:**
- Check git history: `git log --oneline`
- Restore from previous commit: `git checkout HEAD~1 -- backend/tools.py`

## Advanced Workflows

### Contributing Back to Template

If you make improvements that benefit all agents:

1. **Create feature branch from template main:**
   ```bash
   cd smolagents-template  # Your template repo
   git checkout main
   git checkout -b feature/better-error-handling
   ```

2. **Make improvements to template files:**
   ```bash
   # Improve backend/agents.py, frontend components, etc.
   git commit -m "feat: Add better error handling to agents"
   ```

3. **Create Pull Request to your template repo**

4. **Update all agents** once merged

### Automation Script

Create a script to update all your agents:

```bash
#!/bin/bash
# update-all-agents.sh

AGENTS=("weather-assistant" "email-assistant" "task-manager")

for agent in "${AGENTS[@]}"; do
    echo "Updating $agent..."
    cd "$agent"
    git checkout main
    git pull upstream main
    git push origin main
    git checkout "agent/$agent"
    git merge main
    git push origin "agent/$agent"
    cd ..
done
```

## Summary

This workflow gives you:
- 🔄 **Automatic template updates** via git upstream
- 🛠️ **Clean separation** between template and agent code  
- 📦 **Multiple agents** from one template
- 🔒 **Safe development** with protected agent-specific files
- 🚀 **Easy scaling** as you create more agents

The key is to **only modify `backend/tools.py`** in your agent repositories and let git handle keeping everything else in sync with the template.