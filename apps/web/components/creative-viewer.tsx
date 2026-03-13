"use client";

import { useMemo, useRef, useState } from "react";
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
  studioMode?: boolean;
}

function guessKind(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov")) return "VIDEO";
  if (clean.endsWith(".pdf")) return "PDF";
  if (clean.endsWith(".png") || clean.endsWith(".jpg") || clean.endsWith(".jpeg") || clean.endsWith(".webp") || clean.endsWith(".gif")) return "IMAGE";
  return "LANDING_PAGE";
}

export function CreativeViewer({ fileUrl, assetKind, comments, onCreateComment, onSelectComment, selectedCommentId, studioMode = false }: CreativeViewerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const effectiveKind = assetKind ?? guessKind(fileUrl);
  const prefersNavigateByDefault = effectiveKind === "LANDING_PAGE" || effectiveKind === "PDF";
  const [pinMode, setPinMode] = useState(!prefersNavigateByDefault);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);
  const pins = useMemo(
    () =>
      comments.map((comment, index) => ({
        ...comment,
        number: index + 1
      })),
    [comments]
  );

  function handleCreatePin(e: React.MouseEvent<HTMLDivElement>) {
    if (!pinMode) {
      return;
    }
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
    <div className={`${studioMode ? "rounded-2xl border border-slate-700 bg-slate-900/80 p-3" : "card p-4"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className={`text-xs ${studioMode ? "text-slate-300" : "muted"}`}>
          {pinMode ? "Modo comentar activo: haz click para crear un pin." : "Modo navegar activo: puedes interactuar con la pieza."}
        </p>
        <div className="flex rounded-xl border border-slate-600/60 bg-slate-900/60 p-1 text-xs">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${pinMode ? "bg-brand-500 text-white" : "text-slate-300 hover:bg-slate-700/60"}`}
            onClick={() => setPinMode(true)}
          >
            Comentar
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${!pinMode ? "bg-slate-200 text-slate-900" : "text-slate-300 hover:bg-slate-700/60"}`}
            onClick={() => setPinMode(false)}
          >
            Navegar
          </button>
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-2xl ${
          studioMode ? "h-[70vh] min-h-[460px] border border-slate-700 bg-slate-950" : "border border-slate-200 bg-white"
        } ${!studioMode && (effectiveKind === "PDF" || effectiveKind === "LANDING_PAGE") ? "h-[560px]" : !studioMode ? "aspect-video" : ""}`}
      >
        {renderMedia()}
        <div
          className={`absolute inset-0 z-10 transition ${pinMode ? "cursor-crosshair bg-transparent" : "pointer-events-none bg-transparent"}`}
          onClick={handleCreatePin}
          onMouseMove={(e) => {
            if (!pinMode) {
              return;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setHoverPoint({ x, y });
          }}
          onMouseLeave={() => setHoverPoint(null)}
        />
        {pinMode && hoverPoint ? (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-300/80 bg-brand-500/20"
            style={{ left: `${hoverPoint.x}%`, top: `${hoverPoint.y}%`, width: 22, height: 22 }}
          />
        ) : null}
        {pins.map((pin) => (
          <button
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-white shadow transition hover:scale-105 ${
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
      <p className={`mt-3 text-xs ${studioMode ? "text-slate-300" : "muted"}`}>
        Activa Comentar para colocar pins. Activa Navegar para interactuar con landing, video o PDF.
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
