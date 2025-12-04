# NovaTrix AI Chatbot - Quick Start Guide

## 🚀 One-Command Start

**Double-click this file:**
```
start-novatrix-ai.bat
```

This will open 3 terminal windows:
1. Ollama Server
2. Backend Server
3. Frontend

Then open: **http://localhost:5173**

---

## 📝 Manual Start (3 Terminals)

### Terminal 1: Ollama
```bash
set OLLAMA_MODELS=D:\ollama-models
ollama serve
```

### Terminal 2: Backend
```bash
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend
npm run dev
```

### Terminal 3: Frontend
```bash
cd D:\Hilmi\Coding\skripsi\NovaTrix\frontend
npm run dev
```

---

## ✅ Verify Everything is Running

**Check Ollama:**
```bash
curl http://localhost:11434/api/tags
```

**Check Backend:**
```bash
curl http://localhost:5000/health
```

**Check Frontend:**
Open browser → http://localhost:5173

---

## 🔍 Monitor AI Logs

**Backend Terminal** shows:
- 🤖 User messages
- ⚙️ AI processing
- ✅ AI responses
- ❌ Errors

**Log Files:**
```bash
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend

# View all logs
type logs\ai-interactions.log

# View errors only
type logs\ai-errors.log

# Watch in real-time (PowerShell)
Get-Content logs\ai-interactions.log -Wait -Tail 20
```

---

## 🎯 Common Ollama Commands

```bash
# Always set model path first
set OLLAMA_MODELS=D:\ollama-models

# List models
ollama list

# Test model
ollama run saki007ster/CybersecurityRiskAnalyst "What is ISO 27001?"

# Pull model (if needed)
ollama pull saki007ster/CybersecurityRiskAnalyst

# Start server
ollama serve

# Check version
ollama --version
```

---

## 🛠️ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **"AI service is offline"** | Run `ollama serve` in Terminal 1 |
| **"Model not found"** | Run `set OLLAMA_MODELS=D:\ollama-models && ollama list` |
| **"Request timeout"** | Wait 60s (first request loads model) |
| **Backend won't start** | Check port 5000 is free: `netstat -ano \| findstr :5000` |
| **Frontend won't start** | Check port 5173 is free: `netstat -ano \| findstr :5173` |

---

## 📊 Test the Chatbot

1. Open http://localhost:5173
2. Login to NovaTrix
3. Click **"AI Assistant"** (top-right)
4. Try: "What is ISO 27001?"
5. Watch backend terminal for logs

**Expected Response Time:**
- First request: 10-60 seconds (model loading)
- After warmup: 1-5 seconds

---

## 📚 Full Documentation

See: `backend/README-AI-CHATBOT.md`

---

## 🎉 You're Ready!

Everything should be running:
- ✅ Ollama at http://localhost:11434
- ✅ Backend at http://localhost:5000
- ✅ Frontend at http://localhost:5173

**Happy chatting with your AI assistant!** 🤖
