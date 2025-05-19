# Backend

This is the FastAPI backend for the ML Training Dashboard project.

## Features

- Receives dataset file paths from the frontend
- Starts, stops, and restarts model training
- WebSocket endpoints for real-time training metrics and agent chat
- Configuration management

## Setup

1. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```sh
   uvicorn main:app --reload
   ```

## Endpoints

- `POST /dataset-location` — Set dataset file path
- `POST /start-training` — Start model training
- `POST /stop-training` — Stop model training
- `POST /restart-training` — Restart model training
- `GET /config` — Get current config
- `PUT /config` — Update config
- WebSocket: `/ws/train`, `/ws/agent`

## Notes

- Make sure the dataset file path sent from the frontend is accessible to the backend.
- All training logic is in `trainer.py`.
