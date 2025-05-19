from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from agent.agent import TrainingAgent  # Use the correct path

router = APIRouter()

@router.post("/agent-chat")
async def agent_chat(request: Request):
    """
    Accepts a user's message and returns a response from the training agent.
    Example JSON: { "message": "Why is the loss high?" }
    """
    try:
        data = await request.json()
        user_input = data.get("message", "").strip()

        if not user_input:
            return {"response": "No message received."}

        # ✅ Create an instance of the agent
        agent = TrainingAgent()
        agent_response = agent.handle_query(user_input)

        return {"response": agent_response}

    except Exception as e:
        return {"response": f"Error processing request: {e}"}


@router.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    agent = TrainingAgent()  # ✅ Instantiate agent once for the session
    try:
        while True:
            data = await websocket.receive_text()
            if data.strip():
                response = agent.handle_query(data)
                await websocket.send_text(response)
            else:
                await websocket.send_text("Empty message received.")
    except WebSocketDisconnect:
        print("WebSocket disconnected")
