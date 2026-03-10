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
}

export function CommentsPanel({
  comments,
  selectedCommentId,
  draftPin,
  onCreateComment,
  onReply,
  onResolve,
  onSelectComment
}: CommentsPanelProps) {
  const [newCommentBody, setNewCommentBody] = useState("");
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});

  return (
    <aside className="card flex h-[80vh] flex-col p-4">
      <h3 className="text-lg font-semibold">Comentarios</h3>
      {draftPin ? (
        <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="text-xs text-brand-700">Nuevo pin en X: {draftPin.x}% · Y: {draftPin.y}%</p>
          <textarea
            className="mt-2 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            rows={3}
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            placeholder="Describe el cambio solicitado"
          />
          <button
            className="mt-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white"
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
        <p className="mt-3 text-sm text-slate-500">Selecciona una zona del creativo para comentar.</p>
      )}

      <div className="mt-4 flex-1 space-y-3 overflow-auto">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-lg border p-3 ${selectedCommentId === comment.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"}`}
            onClick={() => onSelectComment(comment.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm">{comment.body}</p>
              <button
                className={`rounded-md px-2 py-1 text-xs font-medium ${comment.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                onClick={async (e) => {
                  e.stopPropagation();
                  await onResolve(comment.id, !comment.isResolved);
                }}
              >
                {comment.isResolved ? "Resuelto" : "Pendiente"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Pin ({comment.x.toFixed(1)}%, {comment.y.toFixed(1)}%)
            </p>
            <div className="mt-2 space-y-2">
              {comment.replies?.map((reply) => (
                <p key={reply.id} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700">
                  {reply.body}
                </p>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                placeholder="Responder hilo"
                value={replyBodies[comment.id] || ""}
                onChange={(e) => setReplyBodies((prev) => ({ ...prev, [comment.id]: e.target.value }))}
              />
              <button
                className="rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white"
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
