from trainer import train_model
from websocket_manager import WebSocketManager
from agent import TrainingAgent

import asyncio

# Singleton agent instance (or inject via FastAPI DI in future)
agent = TrainingAgent()

async def restart_training(ws_manager: WebSocketManager):
    """Restart the training process and clear old metrics."""
    agent.reset()
    await train_model(ws_manager, agent)

def update_config(config: dict, key: str, value):
    """Update training configuration (dummy placeholder)."""
    if key in config:
        config[key] = value
        return f"✅ Updated config: {key} = {value}"
    else:
        return f"⚠️ Unknown config key: {key}"
