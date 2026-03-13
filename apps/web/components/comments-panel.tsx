"use client";

import { useState } from "react";

type CommentRow = {
  id: string;
  body: string;
  x: number;
  y: number;
  isResolved: boolean;
  authorName?: string;
  authorEmail?: string;
  replies?: Array<{ id: string; body: string; authorName?: string; authorEmail?: string }>;
};

interface CommentsPanelProps {
  comments: CommentRow[];
  selectedCommentId?: string;
  draftPin?: { x: number; y: number } | null;
  onCreateComment: (body: string) => Promise<void>;
  onReply: (commentId: string, body: string) => Promise<void>;
  onResolve: (commentId: string, isResolved: boolean) => Promise<void>;
  onSelectComment: (id: string) => void;
  showResolveToggle?: boolean;
}

export function CommentsPanel({
  comments,
  selectedCommentId,
  draftPin,
  onCreateComment,
  onReply,
  onResolve,
  onSelectComment,
  showResolveToggle = true
}: CommentsPanelProps) {
  const [newCommentBody, setNewCommentBody] = useState("");
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});

  return (
    <aside className="card flex h-[80vh] flex-col p-4">
      <h3 className="font-[var(--font-display)] text-xl font-semibold">Comentarios</h3>
      {draftPin ? (
        <div className="mt-3 rounded-2xl border border-brand-200 bg-brand-50 p-3">
          <p className="text-xs text-brand-700">
            Nuevo pin en X: {draftPin.x}% - Y: {draftPin.y}%
          </p>
          <textarea className="input mt-2 min-h-20" rows={3} value={newCommentBody} onChange={(e) => setNewCommentBody(e.target.value)} placeholder="Describe el cambio solicitado" />
          <button
            className="btn-primary mt-2"
            onClick={async () => {
              if (!newCommentBody.trim()) {
                return;
              }
              await onCreateComment(newCommentBody);
              setNewCommentBody("");
            }}
          >
            Guardar comentario
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm muted">Selecciona una zona del creativo para comentar.</p>
      )}

      <div className="mt-4 flex-1 space-y-3 overflow-auto">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-2xl border p-3 transition ${
              selectedCommentId === comment.id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white"
            }`}
            onClick={() => onSelectComment(comment.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-slate-800">{comment.body}</p>
              {showResolveToggle ? (
                <button
                  className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                    comment.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await onResolve(comment.id, !comment.isResolved);
                  }}
                >
                  {comment.isResolved ? "Resuelto" : "Pendiente"}
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs muted">
              Pin ({comment.x.toFixed(1)}%, {comment.y.toFixed(1)}%)
            </p>
            <div className="mt-2 space-y-2">
              {comment.replies?.map((reply) => (
                <p key={reply.id} className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700">
                  {reply.body}
                </p>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="input !px-2 !py-1 text-xs"
                placeholder="Responder hilo"
                value={replyBodies[comment.id] || ""}
                onChange={(e) => setReplyBodies((prev) => ({ ...prev, [comment.id]: e.target.value }))}
              />
              <button
                className="btn-dark !px-3 !py-1.5 !text-xs"
                onClick={async (e) => {
                  e.stopPropagation();
                  const body = replyBodies[comment.id]?.trim();
                  if (!body) {
                    return;
                  }
                  await onReply(comment.id, body);
                  setReplyBodies((prev) => ({ ...prev, [comment.id]: "" }));
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
