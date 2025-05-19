from typing import List
from schemas import TrainingMetric
import time

class TrainingAgent:
    def __init__(self):
        pass

    def __init__(self):
        self.last_action: str = ""
        self.metrics: List[TrainingMetric] = []
        self.start_time: float = time.time()

    def observe(self, metric: TrainingMetric):
        """Store new metric and perform reasoning."""
        self.metrics.append(metric)

    def analyze(self) -> str:
        """Perform basic rule-based analysis on recent metrics."""
        if len(self.metrics) < 5:
            return "Not enough data to evaluate training yet."

        recent = self.metrics[-5:]
        losses = [m.loss for m in recent]
        accuracies = [m.accuracy for m in recent]

        # Check for loss plateau
        if max(losses) - min(losses) < 0.01:
            return "⚠️ Loss has plateaued. You may want to restart training or lower learning rate."

        # Check for accuracy stagnation
        if max(accuracies) - min(accuracies) < 0.01:
            return "⚠️ Accuracy hasn't improved recently. Consider reviewing your data or model."

        # Check for high final loss
        if losses[-1] > 0.4:
            return "⚠️ Final loss is still high. Try more training epochs or a smaller learning rate."

        return "✅ Training progressing normally."

    def get_summary(self) -> dict:
        """Returns the latest metrics and status."""
        status = self.analyze()
        latest = self.metrics[-1] if self.metrics else None
        return {
            "latest": latest.model_dump() if latest else None,
            "status": status,
            "total_epochs": len(self.metrics)
        }

    def reset(self):
        """Clear all stored training metrics."""
        self.metrics.clear()
        print("Training metrics reset.")

    def handle_query(self, message: str) -> str:
        if "accuracy" in message.lower():
            return "Accuracy issues may relate to model complexity or dataset imbalance."
        elif "loss" in message.lower():
            return "The loss may be high due to learning rate or insufficient training."
        elif "restart" in message.lower():
            self.last_action = "restart_requested"
            return "Agent recommends restarting training due to poor performance."
        else:
            return f"Training Agent received: {message}"
        
