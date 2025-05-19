// StopTrainingDialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../components/ui/dialog";

interface StopTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const StopTrainingDialog: React.FC<StopTrainingDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stop Training?</DialogTitle>
          <DialogDescription>
            <span className="text-red-500 font-semibold">Caution:</span> If you
            cancel training, you will have to restart from the beginning.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 mr-2">
              Cancel
            </button>
          </DialogClose>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm Stop
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
