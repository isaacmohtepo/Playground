"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../../lib/api";
import { CommentsPanel } from "../../../components/comments-panel";
import { CreativeViewer } from "../../../components/creative-viewer";
import { useToast } from "../../../components/toast-provider";

export default function PublicReviewPage() {
  const params = useParams<{ token: string }>();
  const [draftPin, setDraftPin] = useState<{ x: number; y: number; timestampSec?: number } | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string>();
  const [name, setName] = useState("Cliente");
  const [email, setEmail] = useState("cliente@example.com");
  const { showToast } = useToast();

  const { data, refetch } = useQuery({
    queryKey: ["public-review", params.token],
    queryFn: () => apiGet<any>(`/review/${params.token}`)
  });

  async function createComment(body: string) {
    if (!draftPin) return;
    try {
      await apiPost(`/review/${params.token}/comments`, {
        name,
        email,
        body,
        x: draftPin.x,
        y: draftPin.y,
        timestampSec: draftPin.timestampSec
      });
      setDraftPin(null);
      await refetch();
      showToast("Comentario enviado", "success");
    } catch {
      showToast("No fue posible enviar comentario", "error");
    }
  }

  async function reply(commentId: string, body: string) {
    try {
      await apiPost(`/review/${params.token}/comments/${commentId}/reply`, {
        name,
        email,
        body
      });
      await refetch();
      showToast("Respuesta enviada", "success");
    } catch {
      showToast("No fue posible responder", "error");
    }
  }

  async function resolve() {
    return;
  }

  async function approve(state: "CHANGES_REQUESTED" | "APPROVED") {
    try {
      await apiPost(`/review/${params.token}/approve`, {
        name,
        email,
        state
      });
      await refetch();
      showToast(state === "APPROVED" ? "Pieza aprobada" : "Cambios solicitados", "success");
    } catch {
      showToast("No fue posible registrar decision", "error");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-3 pb-8 text-slate-100 md:px-4">
      <section className="mb-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Revision de pieza</h2>
            <p className="mt-1 text-sm text-slate-300">
              {data?.asset?.title} - v{data?.latestVersion?.versionNum}
            </p>
          </div>
          <div className="grid w-full max-w-md gap-2 md:grid-cols-2">
            <input
              className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-brand-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
            <input
              className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-brand-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:brightness-105" onClick={() => approve("CHANGES_REQUESTED")}>
            Solicitar cambios
          </button>
          <button className="btn rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-105" onClick={() => approve("APPROVED")}>
            Aprobar pieza
          </button>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        {data?.latestVersion?.fileUrl ? (
          <CreativeViewer
            fileUrl={data.latestVersion.fileUrl}
            assetKind={data?.asset?.kind}
            comments={data.comments || []}
            onCreateComment={setDraftPin}
            onSelectComment={setSelectedCommentId}
            selectedCommentId={selectedCommentId}
            studioMode
          />
        ) : (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-sm text-slate-300">No hay version disponible para revision.</div>
        )}

        <CommentsPanel
          comments={data?.comments || []}
          selectedCommentId={selectedCommentId}
          draftPin={draftPin}
          onCreateComment={createComment}
          onReply={reply}
          onResolve={resolve}
          onSelectComment={setSelectedCommentId}
          showResolveToggle={false}
          studioMode
        />
      </section>
    </main>
  );
}
