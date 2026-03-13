"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, getStoredToken } from "../../lib/api";
import { useToast } from "../../components/toast-provider";

export default function ClientsPage() {
  const [token] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));
  const [form, setForm] = useState({ name: "", company: "", email: "", logoUrl: "" });
  const { showToast } = useToast();

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ["clients-list", token],
    queryFn: () => apiGet<any[]>("/clients", token),
    enabled: !!token
  });

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiPost("/clients", form, token);
      setForm({ name: "", company: "", email: "", logoUrl: "" });
      await refetch();
      showToast("Cliente creado", "success");
    } catch {
      showToast("No fue posible crear el cliente", "error");
    }
  }

  if (!token) {
    return (
      <div className="container-page">
        <p className="card p-5">Inicia sesion desde Dashboard para gestionar clientes.</p>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="card reveal p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[var(--font-display)] text-3xl font-semibold">Clientes</h2>
          <span className="pill bg-slate-100 text-slate-700">{data?.length ?? 0} registrados</span>
        </div>
        {isLoading ? <p className="mt-4 text-sm muted">Cargando clientes...</p> : null}
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Error cargando clientes</p> : null}
        <div className="mt-5 grid gap-3">
          {data?.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="group rounded-2xl border border-slate-200 bg-white/75 p-4 transition hover:-translate-y-0.5 hover:border-brand-500">
              <p className="font-semibold group-hover:text-brand-700">{client.name}</p>
              <p className="text-sm muted">{client.company}</p>
              <p className="text-sm muted">{client.email}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="card-strong reveal delay-1 p-6">
        <h3 className="font-[var(--font-display)] text-2xl font-semibold">Nuevo cliente</h3>
        <p className="mt-1 text-sm muted">Agrega la cuenta del cliente para iniciar campanas y revisiones.</p>
        <form onSubmit={createClient} className="mt-5 grid gap-3">
          <input className="input" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Logo URL (opcional)" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <button className="btn-primary">Crear cliente</button>
        </form>
      </aside>
    </div>
  );
}
