import asyncio
import random
import os
import sys
from typing import List
import pandas as pd  # Example: for CSV dataset loading
from schemas import TrainingMetric
from websocket_manager import WebSocketManager
import main
from torchvision.models import resnet50
from transformers import BertForSequenceClassification, GPT2LMHeadModel, ViTForImageClassification
import torch
import torch.nn as nn
import torch.optim as optim
sys.path.append(os.path.abspath('..'))

class TrainingAgent:
    def __init__(self):
        self.metric_history: List[TrainingMetric] = []
        self.last_action: str = ""

    def observe(self, metric: TrainingMetric, epoch: int):
        self.metric_history.append(metric)
        if len(self.metric_history) > 20:
            self.metric_history.pop(0)  # Keep history manageable

    @staticmethod
    def severity_label(score: float) -> str:
        if score >= 0.8:
            return "info"
        elif score >= 0.5:
            return "warning"
        else:
            return "critical"

    def process_metric(self, metric: TrainingMetric) -> dict:
        tips = []
        severity = "info"

        # Retrieve recent metric history if available
        history = self.metric_history

        # 1. Loss increasing trend (check last 3 losses)
        if len(history) >= 4:
            recent_losses = [m.loss for m in history[-4:]]
            if recent_losses[-1] > recent_losses[-2] > recent_losses[-3]:
                tips.append("Loss has been consistently increasing. Consider reducing the learning rate.")
                severity = "warning"

        # 2. Accuracy stagnation (check last 5 epochs)
        if len(history) >= 5:
            recent_accuracies = [m.accuracy for m in history[-5:]]
            if max(recent_accuracies) - min(recent_accuracies) < 0.1:
                tips.append("Accuracy has stagnated. Try changing optimizer or model capacity.")
                severity = "info"

        # 3. Poor performance despite multiple epochs
        if metric.epoch > 10 and metric.accuracy < 0.8:
            tips.append("Model is underperforming. You may need better features or more training data.")
            severity = "critical"

        # 4. Recovery suggestion after loss drop
        if len(history) >= 3:
            prev_losses = [m.loss for m in history[-3:]]
            if prev_losses[-1] < prev_losses[-2] < prev_losses[-3]:
                tips.append("Loss is decreasing steadily. Keep current settings consistent.")
                severity = "info"

        if tips:
            self.last_action = tips[-1]  # Save most recent action
            import time
            return {
                "type": "tip",
                "severity": severity,
                "content": tips[-1],
                "id": str(int(time.time() * 1000)),
                "message": tips[-1],
                "timestamp": str(time.time()),
            }

        return None

# Initialize and attach a persistent instance
TrainingAgent.instance = TrainingAgent()

# Example model architectures
class SimpleMLP(nn.Module):
    def __init__(self, input_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, output_dim)
        )
    def forward(self, x):
        return self.net(x)

class SimpleCNN(nn.Module):
    def __init__(self, input_channels, num_classes):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(input_channels, 8, 3, 1),
            nn.ReLU(),
            nn.Flatten()
        )
        self.fc = nn.Linear(8*26*26, num_classes)  # assuming 28x28 input
    def forward(self, x):
        x = self.conv(x)
        return self.fc(x)

class LogisticRegression(nn.Module):
    def __init__(self, input_dim, output_dim):
        super().__init__()
        self.linear = nn.Linear(input_dim, output_dim)
    def forward(self, x):
        return self.linear(x)

class TinyResNet(nn.Module):
    def __init__(self, input_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, 32)
        self.fc2 = nn.Linear(32, output_dim)
    def forward(self, x):
        out = torch.relu(self.fc1(x))
        out = self.fc2(out) + self.fc1(x)  # simple residual
        return out

async def train_model(ws_manager: WebSocketManager):
    """Train a model using the dataset path from config and send metrics to WebSocket clients."""
    print("Starting training...")
    config = getattr(main, 'CONFIG', {})
    # List all required config keys
    required_keys = [
        ('dataset', 'object with a path field'),
        ('epochs', 'int'),
        ('batchSize', 'int'),
        ('learningRate', 'float'),
        ('optimizer', 'str'),
        ('modelType', 'str'),  # modelType is now required
    ]
    missing = []
    for key, desc in required_keys:
        if key not in config or (key == 'dataset' and (not config['dataset'] or not config['dataset'].get('path'))):
            missing.append(f"{key} ({desc})")
    # If modelType is 'custom', require modelName
    if config.get('modelType') == 'custom' and not config.get('modelName'):
        missing.append('modelName (str, required if modelType is "custom")')
    if missing:
        print(f"ERROR: Missing required config values: {', '.join(missing)}. Please update /config to include these.")
        return
    dataset_filename = config['dataset']['path']
    dataset_path = os.path.normpath(os.path.join("../", dataset_filename))
    print(f"Loading dataset from: {dataset_path}")
    # Example: Load CSV dataset (customize for your data type)
    try:
        data = pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return
    epochs = int(config.get('epochs', 10))
    batch_size = int(config.get('batchSize', 32))
    learning_rate = float(config.get('learningRate', 0.001))
    optimizer = config.get('optimizer', 'adam')
    model_type = config.get('modelType')
    model_name = config.get('modelName', None)
    print(f"Model type: {model_type}")
    if model_type == 'custom':
        print(f"Custom model name: {model_name}")
    # Model selection logic matching dropdown
    input_dim = data.shape[1] - 1  # last column is label
    output_dim = len(set(data.iloc[:, -1]))
    if model_type == 'resnet50':
        model = resnet50(num_classes=output_dim)
    elif model_type == 'bert-base-uncased':
        model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=output_dim)
    elif model_type == 'gpt2':
        model = GPT2LMHeadModel.from_pretrained('gpt2')
    elif model_type == 'vit-base':
        model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224', num_labels=output_dim)
    elif model_type == 'custom':
        # === USER CUSTOM MODEL CODE GOES HERE ===
        print("""
[Custom Model Selected]
To add your custom model logic, edit the following block in backend/trainer.py:

    elif model_type == 'custom':
        # Example:
        # from my_custom_models import MyCustomModel
        # model = MyCustomModel(input_dim, output_dim, ...)
        # Optionally, use model_name for experiment tracking or logic:
        # if model_name == 'model-11':
        #     ... # your custom logic here

Your provided model name: '{}'
""".format(model_name))
        return
    else:
        print(f"Unknown modelType: {model_type}. Aborting training.")
        return
    print(f"Selected model: {model.__class__.__name__}")

    for epoch in range(1, epochs + 1):
        if not getattr(main, 'TRAINING_RUNNING', True):
            print("Training stopped by user.")
            break
        # Dummy metric calculation (replace with your model's logic)
        loss = max(0, 0.5 - (epoch / (2 * epochs)) + random.uniform(-0.05, 0.05))
        accuracy = min(1, (epoch / epochs) + random.uniform(-0.05, 0.05))
        metric = TrainingMetric(epoch=epoch, loss=loss, accuracy=accuracy)
        print(f"Epoch {epoch}: Loss = {loss:.4f}, Accuracy = {accuracy:.4f}")
        await ws_manager.send_metric(metric)
        print(f"Sent metric: {metric}")
        TrainingAgent.instance.observe(metric, epoch)
        tip = TrainingAgent.instance.process_metric(metric)
        if tip:
            await ws_manager.send_agent_tip(tip["content"])
            print(f"Sent tip: {tip['content']}")
        await asyncio.sleep(0.5)  # Simulate training time
    print("Training complete!")
    # === Save model to Downloads folder ===
    downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    os.makedirs(downloads_dir, exist_ok=True)
    model_save_path = os.path.join(downloads_dir, f"trained_model_{model_type if model_type != 'custom' else model_name}.pt")
    try:
        torch.save(model.state_dict(), model_save_path)
        print(f"Model saved to: {model_save_path}")
    except Exception as e:
        print(f"Failed to save model: {e}")
