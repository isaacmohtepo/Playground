"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, getStoredToken } from "../../../lib/api";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [token] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));
  const [form, setForm] = useState({ title: "", kind: "IMAGE" });
  const [versionForm, setVersionForm] = useState({ assetId: "", versionNum: 1, fileUrl: "" });
  const [reviewLink, setReviewLink] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["campaign", params.id, token],
    queryFn: () => apiGet<any>(`/campaigns/${params.id}`, token),
    enabled: !!token && !!params.id
  });

  async function createAsset(e: React.FormEvent) {
    e.preventDefault();
    await apiPost("/assets", { campaignId: params.id, ...form }, token);
    setForm({ title: "", kind: "IMAGE" });
    refetch();
  }

  async function createVersion(e: React.FormEvent) {
    e.preventDefault();
    await apiPost(`/assets/${versionForm.assetId}/versions`, versionForm, token);
    setVersionForm({ assetId: "", versionNum: 1, fileUrl: "" });
    refetch();
  }

  async function createReviewLink(assetId: string) {
    const response = await apiPost<any>(`/assets/${assetId}/review-links`, {}, token);
    setReviewLink(response.publicUrl);
  }

  if (!token) {
    return <div className="container-page"><p className="card p-5">Inicia sesión desde Dashboard.</p></div>;
  }

  return (
    <div className="container-page space-y-6">
      <section className="card p-5">
        <h2 className="text-2xl font-semibold">{data?.name}</h2>
        <p className="text-sm text-slate-500">{data?.description || "Sin descripción"}</p>
        <div className="mt-4 text-xs uppercase tracking-wide text-slate-400">Estado: {data?.state}</div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-semibold">Nueva pieza</h3>
          <form onSubmit={createAsset} className="mt-4 grid gap-3">
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video</option>
              <option value="PDF">PDF</option>
              <option value="LANDING_PAGE">Landing</option>
              <option value="SOCIAL">Social</option>
            </select>
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">Crear pieza</button>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold">Subir versión</h3>
          <form onSubmit={createVersion} className="mt-4 grid gap-3">
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={versionForm.assetId}
              onChange={(e) => setVersionForm({ ...versionForm, assetId: e.target.value })}
            >
              <option value="">Selecciona pieza</option>
              {data?.assets?.map((asset: any) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="number"
              min={1}
              value={versionForm.versionNum}
              onChange={(e) => setVersionForm({ ...versionForm, versionNum: Number(e.target.value) })}
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="URL del archivo"
              value={versionForm.fileUrl}
              onChange={(e) => setVersionForm({ ...versionForm, fileUrl: e.target.value })}
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Crear versión</button>
          </form>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-lg font-semibold">Piezas creativas</h3>
        <div className="mt-4 grid gap-3">
          {data?.assets?.map((asset: any) => {
            const latestVersion = (asset.versions || []).sort((a: any, b: any) => b.versionNum - a.versionNum)[0];
            return (
              <div key={asset.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{asset.title}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{asset.kind} · {asset.currentState}</p>
                  </div>
                  <div className="flex gap-2">
                    {latestVersion ? (
                      <Link href={`/assets/${asset.id}/versions/${latestVersion.id}`} className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white">
                        Revisar versión actual
                      </Link>
                    ) : null}
                    <button onClick={() => createReviewLink(asset.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">
                      Generar link público
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {reviewLink ? (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            Link generado: <a className="underline" href={reviewLink}>{reviewLink}</a>
          </p>
        ) : null}
      </section>
    </div>
  );
}
