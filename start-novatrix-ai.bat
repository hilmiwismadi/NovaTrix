@echo off
title NovaTrix AI Chatbot - Startup Script
color 0A

echo.
echo ========================================
echo   NovaTrix AI Chatbot - Quick Start
echo ========================================
echo.

REM Set Ollama model path
set OLLAMA_MODELS=D:\ollama-models
echo [1/4] Setting Ollama model path: D:\ollama-models

REM Start Ollama in new window
echo [2/4] Starting Ollama Server...
start "Ollama Server" cmd /k "set OLLAMA_MODELS=D:\ollama-models && echo Starting Ollama Server... && ollama serve"

REM Wait 3 seconds for Ollama to start
timeout /t 3 /nobreak >nul

REM Start Backend in new window
echo [3/4] Starting Backend Server...
start "NovaTrix Backend" cmd /k "cd /d D:\Hilmi\Coding\skripsi\NovaTrix\backend && echo Starting NovaTrix Backend... && npm run dev"

REM Wait 5 seconds for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend in new window
echo [4/4] Starting Frontend...
start "NovaTrix Frontend" cmd /k "cd /d D:\Hilmi\Coding\skripsi\NovaTrix\frontend && echo Starting NovaTrix Frontend... && npm run dev"

echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Terminals opened:
echo   [1] Ollama Server  - http://localhost:11434
echo   [2] Backend Server - http://localhost:5000
echo   [3] Frontend       - http://localhost:5173
echo.
echo To access NovaTrix:
echo   1. Open browser: http://localhost:5173
echo   2. Login to your account
echo   3. Click "AI Assistant" button (top-right)
echo.
echo To stop all services:
echo   - Close each terminal window
echo   - Or press Ctrl+C in each terminal
echo.
echo ========================================
echo.
pause
