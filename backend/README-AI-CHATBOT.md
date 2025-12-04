# NovaTrix AI Chatbot - Setup & Usage Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Ollama Setup](#ollama-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Monitoring AI Interactions](#monitoring-ai-interactions)
- [API Endpoints](#api-endpoints)
- [Log Files](#log-files)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The NovaTrix AI Chatbot is powered by Ollama running the **CybersecurityRiskAnalyst** model locally. It provides:
- ISO 27001 compliance guidance
- Context-aware assistance based on user documents and gaps
- Real-time chat with conversation history
- Comprehensive logging and monitoring

**Architecture:**
```
Frontend (React) → Backend (Express) → Ollama API → AI Model
```

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Ollama installed** (v0.13.1 or higher)
   - Download from: https://ollama.com/download
   - Already installed at your system

2. **Node.js** (v16 or higher)
   - Check: `node --version`

3. **NPM** (v7 or higher)
   - Check: `npm --version`

4. **Disk Space**
   - At least 5 GB free on D:\ drive (for model storage)

5. **RAM**
   - Minimum 8 GB (model requires ~4-5 GB when loaded)

---

## 🚀 Ollama Setup

### Step 1: Verify Ollama Installation

```bash
# Check Ollama version
ollama --version
```

**Expected output:**
```
ollama version is 0.13.1
```

### Step 2: Set Model Storage Location

**Windows Command Prompt (CMD):**
```bash
# Set environment variable (permanent)
setx OLLAMA_MODELS "D:\ollama-models"
```

**Windows PowerShell:**
```powershell
# Set environment variable (permanent)
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "D:\ollama-models", "User")
```

**For Current Session Only (CMD):**
```bash
set OLLAMA_MODELS=D:\ollama-models
```

**For Current Session Only (PowerShell):**
```powershell
$env:OLLAMA_MODELS="D:\ollama-models"
```

### Step 3: Verify Model is Downloaded

```bash
# Set model path (if not set permanently)
set OLLAMA_MODELS=D:\ollama-models

# List installed models
ollama list
```

**Expected output:**
```
NAME                                           ID              SIZE      MODIFIED
saki007ster/CybersecurityRiskAnalyst:latest    9f4725163115    4.7 GB    5 hours ago
```

**If model is not installed:**
```bash
# Pull the model (this downloads 4.7 GB)
set OLLAMA_MODELS=D:\ollama-models
ollama pull saki007ster/CybersecurityRiskAnalyst
```

### Step 4: Run Ollama Service

**Option A: Run in Background (Service Mode)**

On Windows, Ollama typically runs as a background service automatically after installation.

**Verify it's running:**
```bash
# Test Ollama API
curl http://localhost:11434/api/tags
```

**Option B: Run in Terminal (Debugging Mode - Recommended for Development)**

Open a **separate terminal window** and run:

```bash
# Set model path
set OLLAMA_MODELS=D:\ollama-models

# Start Ollama server
ollama serve
```

**What you'll see:**
```
time=2025-12-04T... level=INFO source=server.go:105 msg="Ollama server starting"
time=2025-12-04T... level=INFO source=server.go:106 msg="Listening on 0.0.0.0:11434"
```

**Keep this terminal open** - you'll see incoming requests here.

### Step 5: Test Ollama with Simple Chat

```bash
# Test the model (in a new terminal)
set OLLAMA_MODELS=D:\ollama-models
ollama run saki007ster/CybersecurityRiskAnalyst "What is ISO 27001?"
```

**Expected:** Model should respond with information about ISO 27001 (may take 10-30 seconds on first run).

---

## 📦 Installation

### Backend Setup

```bash
# Navigate to backend directory
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend

# Install dependencies (if not already installed)
npm install

# Verify .env file has Ollama configuration
type .env
```

**Verify `.env` contains:**
```env
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=saki007ster/CybersecurityRiskAnalyst
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd D:\Hilmi\Coding\skripsi\NovaTrix\frontend

# Install dependencies (if not already installed)
npm install
```

---

## 🏃 Running the Application

### Recommended Terminal Layout

**Use 3 separate terminal windows:**

#### Terminal 1: Ollama (Optional, for debugging)

```bash
# Set model path
set OLLAMA_MODELS=D:\ollama-models

# Start Ollama server
ollama serve
```

**Keep this running** - you'll see AI requests here.

#### Terminal 2: Backend

```bash
# Navigate to backend
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend

# Start backend server
npm run dev
```

**Expected output:**
```
🚀 NovaTrix Backend Server running on port 5000
📍 Environment: development
🌐 CORS enabled for: http://localhost:5173-5183

✅ Server ready to accept requests
🔥 Warming up Ollama model...
✅ Model warmed up in 15.3s - ready for requests
```

#### Terminal 3: Frontend

```bash
# Navigate to frontend
cd D:\Hilmi\Coding\skripsi\NovaTrix\frontend

# Start development server
npm run dev
```

**Expected output:**
```
VITE v7.2.4  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Quick Start Commands (All-in-One)

**Create a batch file: `start-novatrix-ai.bat`**

```batch
@echo off
echo Starting NovaTrix with AI Chatbot...

REM Set Ollama model path
set OLLAMA_MODELS=D:\ollama-models

REM Start Ollama in new window
start "Ollama Server" cmd /k "set OLLAMA_MODELS=D:\ollama-models && ollama serve"

REM Wait 3 seconds for Ollama to start
timeout /t 3

REM Start Backend in new window
start "NovaTrix Backend" cmd /k "cd /d D:\Hilmi\Coding\skripsi\NovaTrix\backend && npm run dev"

REM Wait 5 seconds for backend to start
timeout /t 5

REM Start Frontend in new window
start "NovaTrix Frontend" cmd /k "cd /d D:\Hilmi\Coding\skripsi\NovaTrix\frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo Terminals opened:
echo - Ollama Server (http://localhost:11434)
echo - Backend Server (http://localhost:5000)
echo - Frontend (http://localhost:5173)
echo.
echo Press any key to exit this window...
pause
```

**Run it:**
```bash
start-novatrix-ai.bat
```

---

## 🔍 Monitoring AI Interactions

### Backend Terminal Logs

When a user sends a message, you'll see:

```
================================================================================
🤖 [AI REQUEST] 2025-12-04T16:30:15.123Z
   User ID: 1
   Session: 1-1733328615123
   Message: "What is ISO 27001?"
   Context: {"hasHistory":false,"historyCount":0,"includeContext":false}
================================================================================
⚙️  [PROCESSING] Ollama model "saki007ster/CybersecurityRiskAnalyst" is generating response...
✅ [AI RESPONSE] Generated in 3.45s
   Response length: 523 characters
   Preview: "ISO 27001 is an international standard for information security..."
================================================================================
```

### Ollama Terminal Logs

If running `ollama serve`, you'll see:

```
time=2025-12-04T16:30:15 level=INFO source=routes.go msg="POST /api/chat"
time=2025-12-04T16:30:15 level=INFO source=server.go msg="loading model saki007ster/CybersecurityRiskAnalyst"
time=2025-12-04T16:30:18 level=INFO source=server.go msg="model loaded"
```

---

## 🌐 API Endpoints

### Chat Endpoints

**1. Send Message to AI**
```http
POST http://localhost:5000/api/ai/chat
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "message": "What is ISO 27001?",
  "sessionId": "optional-session-id",
  "history": [],
  "includeContext": false
}
```

**Response:**
```json
{
  "message": "ISO 27001 is an international standard...",
  "sessionId": "1-1733328615123",
  "model": "saki007ster/CybersecurityRiskAnalyst",
  "processingTime": 3450
}
```

**2. Check AI Service Status**
```http
GET http://localhost:5000/api/ai/status
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "status": "online",
  "modelLoaded": true,
  "availableModels": ["saki007ster/CybersecurityRiskAnalyst:latest"]
}
```

**3. Get AI Interaction Statistics**
```http
GET http://localhost:5000/api/ai/logs/stats
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "totalInteractions": 15,
  "totalResponses": 14,
  "totalErrors": 1,
  "averageProcessingTime": "4.2",
  "activeSessions": 2,
  "timestamp": "2025-12-04T..."
}
```

**4. Clear Chat Session**
```http
DELETE http://localhost:5000/api/ai/session/:sessionId
Authorization: Bearer <JWT_TOKEN>
```

---

## 📄 Log Files

### Location

```
D:\Hilmi\Coding\skripsi\NovaTrix\backend\logs\
├── ai-interactions.log    (All AI interactions)
└── ai-errors.log          (Error logs only)
```

### View Logs

**View entire log:**
```bash
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend
type logs\ai-interactions.log
```

**View last 50 lines:**
```bash
# PowerShell
Get-Content logs\ai-interactions.log -Tail 50

# CMD (requires tail from Git Bash or WSL)
tail -n 50 logs\ai-interactions.log
```

**Watch log in real-time:**
```powershell
# PowerShell
Get-Content logs\ai-interactions.log -Wait -Tail 20
```

### Log Format

Each line is a JSON object:

```json
{"timestamp":"2025-12-04T16:30:15.123Z","type":"AI_REQUEST","userId":1,"sessionId":"1-1733328615123","messageLength":18,"message":"What is ISO 27001?"}
{"timestamp":"2025-12-04T16:30:15.125Z","type":"OLLAMA_PROCESSING","sessionId":"1-1733328615123","model":"saki007ster/CybersecurityRiskAnalyst"}
{"timestamp":"2025-12-04T16:30:18.573Z","type":"AI_RESPONSE","userId":1,"responseLength":523,"processingTimeSec":"3.45"}
```

**Log Types:**
- `AI_REQUEST` - User sent a message
- `CONVERSATION_HISTORY` - Chat history being sent
- `OLLAMA_PROCESSING` - AI is generating response
- `AI_RESPONSE` - AI responded
- `AI_ERROR` - Error occurred
- `DOCUMENT_PROCESSING` - Analyzing documents
- `SESSION_EVENT` - Session created/cleared/expired
- `MODEL_WARMUP` - Model warmup attempt

---

## 🛠️ Troubleshooting

### Issue 1: "AI service is offline"

**Cause:** Ollama is not running or not accessible.

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If no response, start Ollama
set OLLAMA_MODELS=D:\ollama-models
ollama serve
```

### Issue 2: "Model not found"

**Cause:** Model not downloaded or wrong path.

**Solution:**
```bash
# Set model path
set OLLAMA_MODELS=D:\ollama-models

# List models
ollama list

# If not listed, pull the model
ollama pull saki007ster/CybersecurityRiskAnalyst
```

### Issue 3: "Request timeout"

**Cause:** Model is loading into memory (first request).

**Solution:**
- Wait 60 seconds and retry
- Model warmup on backend start should prevent this
- Check system has enough RAM (8GB minimum)

**Restart backend to trigger warmup:**
```bash
# In backend terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

### Issue 4: "Port 11434 already in use"

**Cause:** Another Ollama instance is running.

**Solution:**
```bash
# Find process using port 11434
netstat -ano | findstr :11434

# Kill the process (use PID from above)
taskkill /PID <PID> /F

# Restart Ollama
ollama serve
```

### Issue 5: Model runs out of memory

**Cause:** Not enough RAM available.

**Solution:**
- Close other applications
- Ensure at least 8GB RAM available
- Model requires ~4-5 GB when loaded

**Check memory usage:**
```powershell
# PowerShell
Get-Process ollama | Select-Object Name, CPU, @{Name="Memory(MB)";Expression={[math]::Round($_.WS / 1MB, 2)}}
```

### Issue 6: Slow AI responses

**Possible causes:**
1. First request after startup (model loading)
2. CPU-only inference (no GPU)
3. Low system resources

**Solutions:**
- Wait for model warmup to complete
- Ensure backend warmup succeeds (check logs)
- Close resource-heavy applications

### Issue 7: Ollama service not starting

**Solution:**
```bash
# Check Ollama installation
ollama --version

# Reinstall if needed from: https://ollama.com/download

# Check if running as Windows service
sc query ollama

# Start Windows service
sc start ollama
```

---

## 📚 Useful Commands Reference

### Ollama Commands

```bash
# Check version
ollama --version

# List installed models
set OLLAMA_MODELS=D:\ollama-models
ollama list

# Pull a model
ollama pull saki007ster/CybersecurityRiskAnalyst

# Run interactive chat
ollama run saki007ster/CybersecurityRiskAnalyst

# Delete a model
ollama rm saki007ster/CybersecurityRiskAnalyst

# Show model info
ollama show saki007ster/CybersecurityRiskAnalyst

# Start Ollama server
ollama serve
```

### Backend Commands

```bash
# Navigate to backend
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# View logs
type logs\ai-interactions.log
type logs\ai-errors.log
```

### Testing Commands

```bash
# Test Ollama API directly
curl http://localhost:11434/api/tags

# Test backend health
curl http://localhost:5000/health

# Test AI status (requires JWT token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/ai/status
```

---

## 🎯 Testing the Chatbot

1. **Start all services** (Ollama, Backend, Frontend)

2. **Open browser:** http://localhost:5173

3. **Login to NovaTrix**

4. **Click "AI Assistant" button** (top-right header)

5. **Test with these questions:**
   - "What is ISO 27001?"
   - "Explain Annex A control A.5.1"
   - "What are the main requirements for an ISMS?"
   - "How do I conduct a risk assessment?"

6. **Monitor logs** in Backend terminal

7. **Check persistence:**
   - Send a message
   - Navigate to another page (e.g., Documents)
   - Chatbot should stay open with history intact

---

## 📞 Support

**Issues or Questions?**
- Check logs: `backend/logs/ai-interactions.log`
- Check backend terminal for errors
- Check Ollama terminal for model issues
- Verify all services are running

**Common Questions:**

**Q: How long does the first request take?**
A: 10-60 seconds (model loading). Subsequent requests: 1-5 seconds.

**Q: Can I use a different AI model?**
A: Yes, update `OLLAMA_MODEL` in `.env` and pull the new model.

**Q: How do I clear chat history?**
A: Click minimize → maximize or refresh the page.

**Q: Where are models stored?**
A: `D:\ollama-models` (set via `OLLAMA_MODELS` env var).

---

## 🎉 Success Criteria

✅ Ollama serving on http://localhost:11434
✅ Backend showing model warmup success
✅ Frontend chatbot opens when clicking "AI Assistant"
✅ Messages send and receive responses
✅ Logs appear in backend terminal
✅ Chat persists across page navigation

---

**Last Updated:** December 4, 2025
**NovaTrix Version:** 1.0.0
**Ollama Version:** 0.13.1
**Model:** saki007ster/CybersecurityRiskAnalyst (4.7 GB)
