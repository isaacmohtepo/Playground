"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../../lib/api";
import { CommentsPanel } from "../../../components/comments-panel";
import { CreativeViewer } from "../../../components/creative-viewer";

export default function PublicReviewPage() {
  const params = useParams<{ token: string }>();
  const [draftPin, setDraftPin] = useState<{ x: number; y: number; timestampSec?: number } | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string>();
  const [name, setName] = useState("Cliente");
  const [email, setEmail] = useState("cliente@example.com");

  const { data, refetch } = useQuery({
    queryKey: ["public-review", params.token],
    queryFn: () => apiGet<any>(`/review/${params.token}`)
  });

  async function createComment(body: string) {
    if (!draftPin) return;
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
  }

  async function reply(commentId: string, body: string) {
    await apiPost(`/review/${params.token}/comments/${commentId}/reply`, {
      name,
      email,
      body
    });
    await refetch();
  }

  async function resolve() {
    return;
  }

  async function approve(state: "CHANGES_REQUESTED" | "APPROVED") {
    await apiPost(`/review/${params.token}/approve`, {
      name,
      email,
      state
    });
    await refetch();
  }

  return (
    <div className="container-page space-y-6">
      <section className="card-strong p-6">
        <h2 className="font-[var(--font-display)] text-3xl font-semibold">Revision de pieza</h2>
        <p className="mt-1 text-sm muted">
          {data?.asset?.title} - v{data?.latestVersion?.versionNum}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email" />
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn !bg-amber-500 !text-white hover:brightness-105" onClick={() => approve("CHANGES_REQUESTED")}>
            Solicitar cambios
          </button>
          <button className="btn !bg-emerald-600 !text-white hover:brightness-105" onClick={() => approve("APPROVED")}>
            Aprobar pieza
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {data?.latestVersion?.fileUrl ? (
          <CreativeViewer
            fileUrl={data.latestVersion.fileUrl}
            assetKind={data?.asset?.kind}
            comments={data.comments || []}
            onCreateComment={setDraftPin}
            onSelectComment={setSelectedCommentId}
            selectedCommentId={selectedCommentId}
          />
        ) : (
          <div className="card p-6 text-sm muted">No hay version disponible para revision.</div>
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
        />
      </section>
    </div>
  );
}
