import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from websocket_manager import WebSocketManager
from trainer import train_model
from fastapi import Request, Body
from fastapi.responses import JSONResponse, FileResponse
from agent.agent import TrainingAgent  # Import the rule-based agent
from agent.agent_chat import router as agent_chat_router
from schemas import TrainingMetric
import os

app = FastAPI()
ws_manager = WebSocketManager()
app.include_router(agent_chat_router)
# Include the router for agent chat

# CORS for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory config for demonstration (replace with persistent storage as needed)
CONFIG = {
    "learningRate": 0.001,
    "batchSize": 32,
    "epochs": 100,
    "optimizer": "adam",
    "modelName": "default",
    "dataset": None  # Add dataset field to config
}

TRAINING_RUNNING = False
TRAINING_TASK = None

@app.websocket("/ws/train")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Keep the connection alive and wait for incoming messages
        await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    print("Backend ready. Waiting for training to be started via /start-training.")

@app.post("/start-training")
async def start_training_endpoint():
    global TRAINING_RUNNING, TRAINING_TASK
    if not TRAINING_RUNNING:
        TRAINING_RUNNING = True
        if TRAINING_TASK is None or TRAINING_TASK.done():
            TRAINING_TASK = asyncio.create_task(train_model(ws_manager))
        return {"success": True, "message": "Training started."}
    return {"success": False, "message": "Training already running."}

@app.post("/stop-training")
async def stop_training_endpoint():
    global TRAINING_RUNNING, TRAINING_TASK
    TRAINING_RUNNING = False
    if TRAINING_TASK and not TRAINING_TASK.done():
        TRAINING_TASK.cancel()
        TRAINING_TASK = None
    return {"success": True, "message": "Training stopped."}

@app.post("/restart-training")
async def restart_training_endpoint():
    global TRAINING_RUNNING, TRAINING_TASK
    TRAINING_RUNNING = True
    if TRAINING_TASK and not TRAINING_TASK.done():
        TRAINING_TASK.cancel()
    TRAINING_TASK = asyncio.create_task(train_model(ws_manager))
    return {"success": True, "message": "Training restarted."}

@app.get("/")
def root():
    return {"message": "AI Training Dashboard Backend Running"}

@app.post("/agent-chat")
async def agent_chat(request: Request):
    data = await request.json()
    user_input = data.get("message", "")
    print(f"Received message: {user_input}")
    response = TrainingAgent.handle_query(user_input)
    print(f"Agent response: {response}")
    return {"response": response}

@app.get("/config")
async def get_config():
    return CONFIG

@app.put("/config")
async def update_config(config: dict = Body(...)):
    CONFIG.update(config)
    return {"success": True, "config": CONFIG}

@app.websocket("/ws/agent")
async def agent_chat_ws(websocket: WebSocket):
    await websocket.accept()
    agent = TrainingAgent()
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting {"content": "...">
            import json
            try:
                msg = json.loads(data)
                user_message = msg.get("content", "")
            except Exception:
                user_message = data
            response = agent.handle_query(user_message)
            # Send as chat message format
            await websocket.send_json({
                "id": str(int(asyncio.get_event_loop().time() * 1000)),
                "sender": "agent",
                "content": response,
                "timestamp": str(asyncio.get_event_loop().time())
            })
    except WebSocketDisconnect:
        print("Agent WebSocket disconnected")
    finally:
        pass

@app.get("/download-model")
def download_model(format: str = "pytorch"):
    config = CONFIG
    model_type = config.get("modelType", "custom")
    model_name = config.get("modelName", "model")
    # Only serve the file, do not save to Downloads anymore (frontend chooses location)
    if format == "onnx":
        filename = f"trained_model_{model_type if model_type != 'custom' else model_name}.onnx"
    elif format == "tensorflow":
        filename = f"trained_model_{model_type if model_type != 'custom' else model_name}.h5"
    else:
        filename = f"trained_model_{model_type if model_type != 'custom' else model_name}.pt"
    # Save location: backend working directory
    model_path = os.path.join(os.getcwd(), filename)
    if not os.path.exists(model_path):
        return JSONResponse(status_code=404, content={"error": f"Model file not found for format '{format}'. Please train and export the model first."})
    return FileResponse(model_path, filename=filename, media_type="application/octet-stream")

@app.post("/dataset-location")
async def dataset_location(data: dict = Body(...)):
    file_path = data.get("path")
    name = data.get("name")
    size = data.get("size")
    file_type = data.get("type")
    # If the file is not an absolute path, always resolve it relative to backend working directory
    if file_path and not os.path.isabs(file_path):
        abs_path = os.path.abspath(os.path.join(os.getcwd(), file_path))
        file_path = abs_path
    CONFIG["dataset"] = {
        "name": name or os.path.basename(file_path),
        "path": file_path,
        "type": file_type or "custom",
        "size": size,
        "format": file_type,
    }
    return {"path": file_path}

@app.get("/health")
def health():
    return {"status": "ok"}
