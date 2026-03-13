"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, getStoredToken } from "../../../lib/api";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const [token] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));
  const [form, setForm] = useState({ name: "", description: "", startDate: "" });

  const { data, refetch } = useQuery({
    queryKey: ["client", params.id, token],
    queryFn: () => apiGet<any>(`/clients/${params.id}`, token),
    enabled: !!token && !!params.id
  });

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    await apiPost(
      "/campaigns",
      {
        clientId: params.id,
        name: form.name,
        description: form.description,
        startDate: form.startDate
      },
      token
    );
    setForm({ name: "", description: "", startDate: "" });
    refetch();
  }

  if (!token) {
    return (
      <div className="container-page">
        <p className="card p-5">Inicia sesion desde Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="card p-6">
        <h2 className="font-[var(--font-display)] text-3xl font-semibold">{data?.company}</h2>
        <p className="mt-1 text-sm muted">
          {data?.name} - {data?.email}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-semibold">Campanas</h3>
          <span className="pill bg-slate-100 text-slate-700">{data?.campaigns?.length ?? 0} activas</span>
        </div>
        <div className="mt-4 grid gap-3">
          {data?.campaigns?.map((campaign: any) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="group rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:border-brand-500">
              <p className="font-semibold group-hover:text-brand-700">{campaign.name}</p>
              <p className="text-sm muted">{campaign.description || "Sin descripcion"}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{campaign.state}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="card-strong p-6">
        <h3 className="font-[var(--font-display)] text-2xl font-semibold">Nueva campana</h3>
        <form onSubmit={createCampaign} className="mt-5 grid gap-3">
          <input className="input" placeholder="Nombre de campana" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input min-h-24" placeholder="Descripcion" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <button className="btn-primary">Crear campana</button>
        </form>
      </aside>
    </div>
  );
}
