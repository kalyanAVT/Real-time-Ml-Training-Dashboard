# 🚀 ML Training Dashboard Project

A modern, full-stack machine learning training dashboard for real-time model monitoring, built with a FastAPI backend and a Next.js/React frontend.

---

## 🌟 Why This Project?

**ML Training Dashboard** provides a seamless, interactive experience for managing and visualizing machine learning model training. It is designed for:
- **Data scientists** who want instant feedback and control over training jobs
- **ML engineers** who need robust, real-time monitoring and error handling
- **Teams** who value transparency, collaboration, and a beautiful UI

---

## 🗂️ Project Structure

- **backend/** — FastAPI backend for training control, dataset management, and real-time metrics/agent tips (WebSocket)
- **training-dashboard/** — Next.js/React frontend for user interaction and dashboard UI
- **MLTrain/** — Python virtual environment (not tracked by git)

---

## ⚡ Quick Start

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

---

## ✨ Features

- 
- 🚦 Start, stop, and restart model training
- 📊 Real-time training metrics and agent tips (WebSocket)
- 📝 Agent log viewer for all training events, warnings, and errors (this Update will be SOON)
- 🟢 Sidebar highlights only important events (e.g., training completed, model saved, exceptions) (this Update will be SOON)
- ⚙️ Configurable training parameters
- 🔒 Robust error handling and clear status indicators
- 🧑‍💻 Clean, responsive, and modern UI

---

## 📚 Directory READMEs

- See [backend/README.md](backend/README.md) for backend details
- See [training-dashboard/README.md](training-dashboard/README.md) for frontend details

---

## 🛡️ .gitignore

- Project includes `.gitignore` files in the root, backend, and training-dashboard directories
- Common ignores: `node_modules/`, `.env`, `__pycache__/`, `.next/`, `*.log`, `*.pyc`, `*.pkl`, `*.h5`, `*.pt`, `*.onnx`, `mlruns/`, `*.db`, `*.sqlite3`, `*.egg-info/`, `.vscode/`, `.idea/`, `.DS_Store`, `Thumbs.db`, `package-lock.json`, etc.

---

## 📝 Notes

- Backend and frontend must be started separately
- Backend must have access to the dataset file path sent from the frontend
- All training logic is in [backend/trainer.py](backend/trainer.py)

---

## 🚀 How to Use the Dashboard

1. **Edit Training Parameters:**
   - Click the config/settings icon in the dashboard to edit model and training parameters before starting.
2. **Add Your Dataset:**
   - Place your dataset file in the [`dataset/` directory](./dataset/).
   - Supported formats: CSV, etc.
3. **Start Training:**
   - Click the "Start Training" button in the dashboard UI.
   - Monitor real-time metrics and important agent tips in the sidebar.
4. **Download the Trained Model:**
   - After training completes, the saved model will be automatically downloaded to your computer's Downloads folder.

---

## 💡 Contributing & License

Contributions are welcome! Please open issues or pull requests for improvements. See individual directory READMEs for more details.

This project is managed with git. Please see the `.gitignore` files for details on what is excluded from version control.
