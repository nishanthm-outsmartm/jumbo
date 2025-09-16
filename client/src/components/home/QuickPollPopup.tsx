import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PollOption {
  id: string;
  text: string;
}

interface QuickPollPopupProps {
  open: boolean;
  question: string;
  options: PollOption[];
  onClose: () => void;
  onVote: (optionId: string) => void;
}

export default function QuickPollPopup({ open, question, options, onClose, onVote }: QuickPollPopupProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selected) {
      onVote(selected);
      setSelected(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{question}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left ${
                selected === opt.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!selected}>
            Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
