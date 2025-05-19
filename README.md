# ML Training Dashboard Project

This repository contains a full-stack machine learning training dashboard, including a FastAPI backend and a Next.js/React frontend.

## Project Structure

- **backend/** — FastAPI backend for training control, dataset management, and real-time metrics
- **training-dashboard/** — Next.js/React frontend for user interaction and dashboard UI
- **MLTrain/** — Python virtual environment (not tracked by git)

## Quick Start

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd ML-Train-Streamer
```

### 2. Backend Setup

```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup

```sh
cd training-dashboard
npm install  # or yarn install or pnpm install
npm run dev  # or yarn dev or pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Select/upload a dataset (drag-and-drop or file picker)
- Send dataset location to backend for model training
- Start, stop, and restart training
- Real-time training metrics and agent chat (WebSocket)
- Configurable training parameters

## Directory READMEs

- See `[backend/README.md](<backend/README.md>)` for backend details
- See `[training-dashboard/README.md](<training-dashboard/README.md>)` for frontend details

## .gitignore

- Project includes `.gitignore` files in the root, backend, frontend, and training-dashboard directories
- Common ignores: `node_modules/`, `.env`, `__pycache__/`, `.next/`, `*.log`, `*.pyc`, `*.pkl`, `*.h5`, `*.pt`, `*.onnx`, `mlruns/`, `*.db`, `*.sqlite3`, `*.egg-info/`, `.vscode/`, `.idea/`, `.DS_Store`, `Thumbs.db`, `package-lock.json`, etc.

## Notes

- The backend and frontend must be started separately
- The backend must have access to the dataset file path sent from the frontend
- All training logic is in `[backend/trainer.py](<backend/trainer.py>)`

---

This project is managed with git. Please see the `.gitignore` files for details on what is excluded from version control.
