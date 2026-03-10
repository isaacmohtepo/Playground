"use client";

import { useMemo } from "react";

type CommentItem = {
  id: string;
  x: number;
  y: number;
  body: string;
  isResolved: boolean;
  replies?: Array<{ id: string; body: string; authorName?: string; authorEmail?: string }>;
};

interface CreativeViewerProps {
  fileUrl: string;
  comments: CommentItem[];
  onCreateComment: (payload: { x: number; y: number }) => void;
  onSelectComment: (id: string) => void;
  selectedCommentId?: string;
}

export function CreativeViewer({ fileUrl, comments, onCreateComment, onSelectComment, selectedCommentId }: CreativeViewerProps) {
  const pins = useMemo(
    () =>
      comments.map((comment, index) => ({
        ...comment,
        number: index + 1
      })),
    [comments]
  );

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onCreateComment({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }

  return (
    <div className="card p-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50" onClick={handleClick}>
        <img src={fileUrl} alt="Creative preview" className="h-auto w-full object-contain" />
        {pins.map((pin) => (
          <button
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-white ${
              selectedCommentId === pin.id ? "bg-brand-700" : pin.isResolved ? "bg-emerald-500" : "bg-brand-500"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComment(pin.id);
            }}
          >
            {pin.number}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">Haz clic sobre cualquier área del creativo para crear un comentario visual.</p>
    </div>
  );
}
