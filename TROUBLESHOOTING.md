# NovaTrix AI Chatbot - Troubleshooting Guide

## 🔍 Pre-Flight Checklist

Before starting, verify:

```bash
# 1. Ollama is installed
ollama --version
# Expected: ollama version is 0.13.1

# 2. Model path is set
echo %OLLAMA_MODELS%
# Expected: D:\ollama-models

# 3. Model is downloaded
set OLLAMA_MODELS=D:\ollama-models && ollama list
# Expected: saki007ster/CybersecurityRiskAnalyst in the list

# 4. Node.js is installed
node --version
# Expected: v16.0.0 or higher

# 5. Dependencies are installed
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend && npm list --depth=0
cd D:\Hilmi\Coding\skripsi\NovaTrix\frontend && npm list --depth=0
```

---

## ❌ Common Errors & Solutions

### Error 1: "AI service is offline"

**What you see in frontend:**
```
AI service is offline. Please ensure Ollama is running.
```

**Diagnosis:**
```bash
# Test if Ollama API is accessible
curl http://localhost:11434/api/tags
```

**If connection refused:**

**Solution A: Start Ollama**
```bash
set OLLAMA_MODELS=D:\ollama-models
ollama serve
```

**Solution B: Check Ollama Windows Service**
```bash
# Check if running as service
sc query ollama

# If not running, start it
sc start ollama
```

**Solution C: Check port 11434**
```bash
# Check what's using port 11434
netstat -ano | findstr :11434

# If blocked, kill the process
taskkill /PID <PID> /F

# Then restart Ollama
ollama serve
```

---

### Error 2: "Model not found"

**Backend log shows:**
```
Model "saki007ster/CybersecurityRiskAnalyst" not found
```

**Diagnosis:**
```bash
set OLLAMA_MODELS=D:\ollama-models
ollama list
```

**If model is missing:**
```bash
# Pull the model (4.7 GB download)
set OLLAMA_MODELS=D:\ollama-models
ollama pull saki007ster/CybersecurityRiskAnalyst
```

**If model shows but still not found:**
```bash
# Check exact model name in backend/.env
type D:\Hilmi\Coding\skripsi\NovaTrix\backend\.env | findstr OLLAMA_MODEL

# Should be: OLLAMA_MODEL=saki007ster/CybersecurityRiskAnalyst

# Restart backend after fixing
```

---

### Error 3: "timeout of 60000ms exceeded"

**What happens:**
- Request sent to AI
- Wait 60 seconds
- Timeout error

**Causes:**
1. First request after Ollama starts (model loading)
2. System running out of memory
3. CPU overloaded

**Solutions:**

**Solution A: Just wait and retry**
```
First request loads model into RAM (10-60s)
Click "Dismiss" on error and send message again
```

**Solution B: Check system resources**
```powershell
# PowerShell - Check RAM usage
Get-Process ollama | Select-Object Name, @{Name="Memory(MB)";Expression={[math]::Round($_.WS / 1MB, 2)}}

# Model needs ~4-5 GB RAM
# Ensure you have 8GB+ total RAM
```

**Solution C: Increase timeout**
Edit `backend/src/services/ollamaService.js`:
```javascript
const OLLAMA_TIMEOUT = 120000; // 2 minutes instead of 1
```

---

### Error 4: Backend won't start

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill that process
taskkill /PID <PID> /F

# Restart backend
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend
npm run dev
```

---

### Error 5: Frontend won't start

**Error message:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
cd D:\Hilmi\Coding\skripsi\NovaTrix\frontend
npm run dev -- --port 5174
```

---

### Error 6: "Warmup failed" on backend start

**Backend shows:**
```
⚠️  Model warmup failed: connect ECONNREFUSED
   First AI request may be slower than usual
```

**Cause:** Ollama not running when backend starts

**Solution:**
```bash
# 1. Start Ollama first
set OLLAMA_MODELS=D:\ollama-models
ollama serve

# 2. Wait 3 seconds

# 3. Then start backend
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend
npm run dev
```

**This is not critical** - first user request will just take longer.

---

### Error 7: AI responses are gibberish

**Cause:** Wrong model or corrupted model

**Solution:**
```bash
# Remove and re-download model
set OLLAMA_MODELS=D:\ollama-models

# Remove model
ollama rm saki007ster/CybersecurityRiskAnalyst

# Re-download
ollama pull saki007ster/CybersecurityRiskAnalyst

# Restart backend
```

---

### Error 8: Chat history doesn't persist

**Problem:** Messages disappear when navigating pages

**Check:**
1. Is chatbot mounted in `Layout.jsx`? (not individual pages)
2. Is chatbot state in Zustand store? (not component state)
3. Browser console for errors (F12 → Console)

**Solution:**
```bash
# Verify files exist
dir D:\Hilmi\Coding\skripsi\NovaTrix\frontend\src\stores\chatStore.js
dir D:\Hilmi\Coding\skripsi\NovaTrix\frontend\src\components\chat\AIChatbot.jsx

# Check Layout.jsx imports AIChatbot
type D:\Hilmi\Coding\skripsi\NovaTrix\frontend\src\components\layout\Layout.jsx | findstr AIChatbot
```

---

### Error 9: "Failed to fetch" in browser

**Browser console shows:**
```
Failed to fetch
```

**Causes:**
1. Backend not running
2. Wrong backend URL
3. CORS issues

**Solutions:**

**Check backend is running:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"healthy",...}
```

**Check frontend API client:**
```javascript
// frontend/src/api/client.js should have:
baseURL: 'http://localhost:5000/api'
```

**Check CORS in backend:**
```javascript
// backend/src/server.js should allow:
origin: http://localhost:5173
```

---

### Error 10: Environment variables not working

**Problem:** OLLAMA_MODELS not recognized

**Windows CMD:**
```bash
# Set for current session
set OLLAMA_MODELS=D:\ollama-models

# Set permanently
setx OLLAMA_MODELS "D:\ollama-models"

# Verify
echo %OLLAMA_MODELS%

# Restart terminal for permanent change
```

**Windows PowerShell:**
```powershell
# Set for current session
$env:OLLAMA_MODELS="D:\ollama-models"

# Set permanently
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "D:\ollama-models", "User")

# Verify
echo $env:OLLAMA_MODELS

# Restart terminal for permanent change
```

---

## 🔧 Complete Reset Procedure

If everything is broken, start fresh:

```bash
# 1. Stop all services
# Close all terminals (Ctrl+C)

# 2. Kill any stuck processes
taskkill /F /IM ollama.exe
taskkill /F /IM node.exe

# 3. Set environment variable
set OLLAMA_MODELS=D:\ollama-models

# 4. Verify model exists
ollama list

# 5. Start Ollama
ollama serve
# (New terminal, keep open)

# 6. Test Ollama
curl http://localhost:11434/api/tags
# Should return JSON with models

# 7. Start backend
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend
npm run dev
# Wait for "Model warmed up" message

# 8. Start frontend
cd D:\Hilmi\Coding\skripsi\NovaTrix\frontend
npm run dev

# 9. Test in browser
# http://localhost:5173
# Login → Click "AI Assistant" → Send message
```

---

## 📊 Diagnostic Commands

**System Check:**
```bash
# Check all services
curl http://localhost:11434/api/tags     # Ollama
curl http://localhost:5000/health        # Backend
curl http://localhost:5173               # Frontend (should return HTML)

# Check processes
tasklist | findstr ollama
tasklist | findstr node

# Check ports
netstat -ano | findstr :11434    # Ollama
netstat -ano | findstr :5000     # Backend
netstat -ano | findstr :5173     # Frontend

# Check disk space (model needs 5GB)
wmic logicaldisk get name,freespace,size

# Check RAM (model needs 8GB)
wmic OS get FreePhysicalMemory,TotalVisibleMemorySize
```

**Log Check:**
```bash
cd D:\Hilmi\Coding\skripsi\NovaTrix\backend

# View last 20 interactions
powershell "Get-Content logs\ai-interactions.log -Tail 20"

# View errors
type logs\ai-errors.log

# Count total interactions
powershell "(Get-Content logs\ai-interactions.log | Measure-Object -Line).Lines"
```

---

## 🆘 Emergency Contacts

**If all else fails:**

1. **Check GitHub Issues:**
   - https://github.com/anthropics/claude-code/issues

2. **Check Ollama Docs:**
   - https://github.com/ollama/ollama

3. **Restart Computer:**
   - Sometimes Windows services need a full restart

4. **Check System Requirements:**
   - Windows 10/11
   - 8GB+ RAM
   - 5GB+ free disk space
   - Node.js v16+
   - Ollama 0.13+

---

## ✅ Verification Steps

After fixing issues, verify:

```bash
# 1. Ollama responds
curl http://localhost:11434/api/tags

# 2. Backend shows warmup success
# Look for: ✅ Model warmed up in X.Xs - ready for requests

# 3. Frontend loads
# Open: http://localhost:5173

# 4. Login works
# Use valid credentials

# 5. AI button appears
# Top-right header: "AI Assistant"

# 6. Chatbot opens
# Click button → window appears

# 7. Message sends
# Type "What is ISO 27001?" → Wait for response

# 8. Logs appear
# Backend terminal shows request/response logs

# 9. Persistence works
# Navigate to Documents page → Chatbot stays open

# 10. Stats work
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/ai/logs/stats
```

---

## 📞 Still Having Issues?

**Collect this info:**
1. Error message (exact text)
2. Backend terminal logs
3. Browser console logs (F12)
4. `ollama list` output
5. `ollama --version` output
6. `node --version` output
7. Operating system version

**Check log files:**
- `backend/logs/ai-interactions.log`
- `backend/logs/ai-errors.log`

---

**Last Updated:** December 4, 2025
