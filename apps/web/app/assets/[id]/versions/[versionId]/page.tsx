"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, getStoredToken } from "../../../../../lib/api";
import { CommentsPanel } from "../../../../../components/comments-panel";
import { CreativeViewer } from "../../../../../components/creative-viewer";
import { useToast } from "../../../../../components/toast-provider";

export default function AssetVersionReviewPage() {
  const params = useParams<{ id: string; versionId: string }>();
  const [token] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));
  const [draftPin, setDraftPin] = useState<{ x: number; y: number; timestampSec?: number } | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string>();
  const { showToast } = useToast();

  const { data: versionData, refetch: refetchVersion } = useQuery({
    queryKey: ["asset-version", params.id, params.versionId, token],
    queryFn: () => apiGet<any>(`/assets/${params.id}/versions/${params.versionId}`, token),
    enabled: !!token
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["asset-comments", params.versionId, token],
    queryFn: () => apiGet<any[]>(`/comments/version/${params.versionId}`, token),
    enabled: !!token
  });

  async function createComment(body: string) {
    if (!draftPin) return;
    try {
      await apiPost(
        `/comments/version/${params.versionId}`,
        {
          body,
          x: draftPin.x,
          y: draftPin.y,
          timestampSec: draftPin.timestampSec
        },
        token
      );
      setDraftPin(null);
      await refetchComments();
      showToast("Comentario creado", "success");
    } catch {
      showToast("No fue posible crear comentario", "error");
    }
  }

  async function reply(commentId: string, body: string) {
    try {
      await apiPost(`/comments/${commentId}/reply`, { body }, token);
      await refetchComments();
      showToast("Respuesta enviada", "success");
    } catch {
      showToast("No fue posible responder", "error");
    }
  }

  async function resolve(commentId: string, isResolved: boolean) {
    try {
      await apiPost(`/comments/${commentId}/resolve`, { isResolved }, token, "PATCH");
      await refetchComments();
      showToast(isResolved ? "Comentario marcado como resuelto" : "Comentario reabierto", "info");
    } catch {
      showToast("No fue posible actualizar comentario", "error");
    }
  }

  async function changeApprovalState(state: "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED") {
    try {
      await apiPost(`/assets/${params.id}/versions/${params.versionId}/approve`, { state }, token);
      await refetchVersion();
      showToast("Estado de aprobacion actualizado", "success");
    } catch {
      showToast("No fue posible actualizar aprobacion", "error");
    }
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="card p-5">Inicia sesion desde Dashboard.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-3 text-slate-100 md:px-4">
      <div className="mb-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">{versionData?.asset?.title}</h2>
            <p className="mt-1 text-sm text-slate-300">
              v{versionData?.versionNum} - Estado: {versionData?.state}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700" onClick={() => changeApprovalState("PENDING_REVIEW")}>
              Marcar pendiente
            </button>
            <button className="btn rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:brightness-105" onClick={() => changeApprovalState("CHANGES_REQUESTED")}>
              Solicitar cambios
            </button>
            <button className="btn rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-105" onClick={() => changeApprovalState("APPROVED")}>
              Aprobar version
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          {versionData?.asset?.versions?.length > 1 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <h3 className="font-[var(--font-display)] text-lg font-semibold">Historial de versiones</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {versionData.asset.versions.map((version: any) => (
                  <div key={version.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
                    v{version.versionNum} - {version.state}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {versionData?.fileUrl ? (
            <CreativeViewer
              fileUrl={versionData.fileUrl}
              assetKind={versionData?.asset?.kind}
              comments={comments}
              onCreateComment={(pin) => setDraftPin(pin)}
              onSelectComment={setSelectedCommentId}
              selectedCommentId={selectedCommentId}
              studioMode
            />
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 text-sm text-slate-300">No hay archivo para esta version.</div>
          )}
        </section>

        <CommentsPanel
          comments={comments}
          selectedCommentId={selectedCommentId}
          draftPin={draftPin}
          onCreateComment={createComment}
          onReply={reply}
          onResolve={resolve}
          onSelectComment={setSelectedCommentId}
          studioMode
        />
      </div>
    </main>
  );
}
