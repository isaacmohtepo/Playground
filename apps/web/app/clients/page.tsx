"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, getStoredToken } from "../../lib/api";

export default function ClientsPage() {
  const [token] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));
  const [form, setForm] = useState({ name: "", company: "", email: "", logoUrl: "" });

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ["clients-list", token],
    queryFn: () => apiGet<any[]>("/clients", token),
    enabled: !!token
  });

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    await apiPost("/clients", form, token);
    setForm({ name: "", company: "", email: "", logoUrl: "" });
    refetch();
  }

  if (!token) {
    return <div className="container-page"><p className="card p-5">Inicia sesión desde Dashboard para ver clientes.</p></div>;
  }

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="card p-5">
        <h2 className="text-xl font-semibold">Clientes</h2>
        {isLoading ? <p className="mt-4 text-sm text-slate-500">Cargando...</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">Error cargando clientes</p> : null}
        <div className="mt-4 grid gap-3">
          {data?.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="rounded-xl border border-slate-200 p-4 hover:border-brand-500">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-slate-500">{client.company}</p>
              <p className="text-sm text-slate-500">{client.email}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="card p-5">
        <h3 className="text-lg font-semibold">Nuevo cliente</h3>
        <form onSubmit={createClient} className="mt-4 grid gap-3">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Empresa"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Logo URL (opcional)"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />
          <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">Crear cliente</button>
        </form>
      </aside>
    </div>
  );
}
