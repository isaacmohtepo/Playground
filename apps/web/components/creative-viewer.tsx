"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";

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
  assetKind?: "IMAGE" | "VIDEO" | "PDF" | "LANDING_PAGE" | "SOCIAL";
  comments: CommentItem[];
  onCreateComment: (payload: { x: number; y: number; timestampSec?: number }) => void;
  onSelectComment: (id: string) => void;
  selectedCommentId?: string;
}

function guessKind(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov")) return "VIDEO";
  if (clean.endsWith(".pdf")) return "PDF";
  if (clean.endsWith(".png") || clean.endsWith(".jpg") || clean.endsWith(".jpeg") || clean.endsWith(".webp") || clean.endsWith(".gif")) return "IMAGE";
  return "LANDING_PAGE";
}

export function CreativeViewer({ fileUrl, assetKind, comments, onCreateComment, onSelectComment, selectedCommentId }: CreativeViewerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const effectiveKind = assetKind ?? guessKind(fileUrl);
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
    const payload: { x: number; y: number; timestampSec?: number } = {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    };
    if (effectiveKind === "VIDEO" && videoRef.current) {
      payload.timestampSec = Number(videoRef.current.currentTime.toFixed(2));
    }
    onCreateComment(payload);
  }

  function renderMedia() {
    if (effectiveKind === "VIDEO") {
      return <video ref={videoRef} src={fileUrl} controls playsInline className="h-full w-full object-contain" />;
    }
    if (effectiveKind === "PDF") {
      return <iframe src={fileUrl} title="PDF preview" className="h-full w-full bg-white" />;
    }
    if (effectiveKind === "LANDING_PAGE") {
      return <iframe src={fileUrl} title="Landing preview" className="h-full w-full bg-white" />;
    }
    return <Image src={fileUrl} alt="Creative preview" width={1600} height={900} className="h-full w-full object-contain" unoptimized />;
  }

  return (
    <div className="card p-4">
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white ${effectiveKind === "PDF" || effectiveKind === "LANDING_PAGE" ? "h-[560px]" : "aspect-video"}`}
        onClick={handleClick}
      >
        {renderMedia()}
        {pins.map((pin) => (
          <button
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-white shadow ${
              selectedCommentId === pin.id ? "bg-slate-900" : pin.isResolved ? "bg-emerald-500" : "bg-brand-500"
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
      <p className="mt-3 text-xs muted">
        Haz click en cualquier area del creativo para crear un comentario visual.
        {(effectiveKind === "LANDING_PAGE" || effectiveKind === "PDF") && (
          <>
            {" "}
            Si el embed es bloqueado por el sitio, abre el recurso en{" "}
            <a className="font-semibold underline" href={fileUrl} target="_blank" rel="noreferrer">
              nueva pestana
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}
