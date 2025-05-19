import asyncio
from typing import List
from fastapi.websockets import WebSocket
from schemas import TrainingMetric

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and add a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        print("New connection established!")

    async def disconnect(self, websocket: WebSocket, force: bool = False):
        """Remove a WebSocket connection and optionally close it."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            if force:
                try:
                    await websocket.close()
                except Exception:
                    pass
            print("Connection closed!")

    async def broadcast(self, message: dict):
        """Broadcast a message to all active WebSocket connections."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message to {getattr(connection, 'client', 'unknown')}: {e}")
                disconnected.append(connection)
        for connection in disconnected:
            # Only remove, do not call close again
            await self.disconnect(connection, force=False)

    async def send_metric(self, metric: TrainingMetric):
        """Send training metrics to all active WebSocket connections."""
        print(f"Sending metric: {metric}")
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json({
                    "type": "metrics",
                    "payload": metric.model_dump() if hasattr(metric, 'model_dump') else metric.dict()
                })
            except Exception as e:
                print(f"Error sending metric to {getattr(connection, 'client', 'unknown')}: {e}")
                disconnected.append(connection)
        for connection in disconnected:
            # Only remove, do not call close again
            await self.disconnect(connection, force=False)

    async def send_agent_tip(self, tip: dict):
        """Send an agent tip to all active WebSocket connections."""
        message = {"type": "tip", "payload": tip}
        print(f"Sending agent tip: {tip}")
        await self.broadcast(message)
