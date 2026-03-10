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
    return <div className="container-page"><p className="card p-5">Inicia sesión desde Dashboard.</p></div>;
  }

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="card p-5">
        <h2 className="text-2xl font-semibold">{data?.company}</h2>
        <p className="text-sm text-slate-500">{data?.name} · {data?.email}</p>
        <h3 className="mt-6 text-lg font-semibold">Campañas</h3>
        <div className="mt-4 grid gap-3">
          {data?.campaigns?.map((campaign: any) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="rounded-xl border border-slate-200 p-4 hover:border-brand-500">
              <p className="font-medium">{campaign.name}</p>
              <p className="text-sm text-slate-500">{campaign.description || "Sin descripción"}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{campaign.state}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="card p-5">
        <h3 className="text-lg font-semibold">Nueva campaña</h3>
        <form onSubmit={createCampaign} className="mt-4 grid gap-3">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Nombre de campaña" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">Crear campaña</button>
        </form>
      </aside>
    </div>
  );
}
