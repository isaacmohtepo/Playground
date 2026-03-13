"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, getStoredToken } from "../../../../../lib/api";
import { CommentsPanel } from "../../../../../components/comments-panel";
import { CreativeViewer } from "../../../../../components/creative-viewer";

export default function AssetVersionReviewPage() {
  const params = useParams<{ id: string; versionId: string }>();
  const [token] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string>();

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
    await apiPost(`/comments/version/${params.versionId}`, { body, x: draftPin.x, y: draftPin.y }, token);
    setDraftPin(null);
    await refetchComments();
  }

  async function reply(commentId: string, body: string) {
    await apiPost(`/comments/${commentId}/reply`, { body }, token);
    await refetchComments();
  }

  async function resolve(commentId: string, isResolved: boolean) {
    await apiPost(`/comments/${commentId}/resolve`, { isResolved }, token, "PATCH");
    await refetchComments();
  }

  async function changeApprovalState(state: "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED") {
    await apiPost(`/assets/${params.id}/versions/${params.versionId}/approve`, { state }, token);
    await refetchVersion();
  }

  if (!token) {
    return (
      <div className="container-page">
        <p className="card p-5">Inicia sesion desde Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="card p-5">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">{versionData?.asset?.title}</h2>
          <p className="mt-1 text-sm muted">
            v{versionData?.versionNum} - Estado: {versionData?.state}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-soft !text-xs" onClick={() => changeApprovalState("PENDING_REVIEW")}>
              Marcar pendiente
            </button>
            <button className="btn !bg-amber-500 !text-xs !text-white hover:brightness-105" onClick={() => changeApprovalState("CHANGES_REQUESTED")}>
              Solicitar cambios
            </button>
            <button className="btn !bg-emerald-600 !text-xs !text-white hover:brightness-105" onClick={() => changeApprovalState("APPROVED")}>
              Aprobar version
            </button>
          </div>
        </div>

        {versionData?.asset?.versions?.length > 1 ? (
          <div className="card p-5">
            <h3 className="font-[var(--font-display)] text-xl font-semibold">Historial de versiones</h3>
            <div className="mt-3 grid gap-2">
              {versionData.asset.versions.map((version: any) => (
                <div key={version.id} className="rounded-xl border border-slate-200 bg-white/75 p-3 text-sm">
                  v{version.versionNum} - {version.state}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {versionData?.fileUrl ? (
          <CreativeViewer
            fileUrl={versionData.fileUrl}
            comments={comments}
            onCreateComment={(pin) => setDraftPin(pin)}
            onSelectComment={setSelectedCommentId}
            selectedCommentId={selectedCommentId}
          />
        ) : null}
      </section>

      <CommentsPanel
        comments={comments}
        selectedCommentId={selectedCommentId}
        draftPin={draftPin}
        onCreateComment={createComment}
        onReply={reply}
        onResolve={resolve}
        onSelectComment={setSelectedCommentId}
      />
    </div>
  );
}
