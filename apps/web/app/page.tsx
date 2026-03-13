"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthPanel } from "../components/auth-panel";
import { apiGet, getStoredToken } from "../lib/api";

export default function DashboardPage() {
  const [token, setToken] = useState<string>(() => (typeof window !== "undefined" ? getStoredToken() : ""));

  const { data: clients } = useQuery({
    queryKey: ["clients", token],
    queryFn: () => apiGet<any[]>("/clients", token),
    enabled: !!token
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns", token],
    queryFn: () => apiGet<any[]>("/campaigns", token),
    enabled: !!token
  });

  const { data: assets } = useQuery({
    queryKey: ["assets", token],
    queryFn: () => apiGet<any[]>("/assets", token),
    enabled: !!token
  });

  const stats = useMemo(
    () => [
      { label: "Clientes", value: clients?.length ?? 0 },
      { label: "Campanas", value: campaigns?.length ?? 0 },
      { label: "Piezas", value: assets?.length ?? 0 }
    ],
    [assets?.length, campaigns?.length, clients?.length]
  );

  return (
    <div className="container-page space-y-6">
      <section className="card-strong overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-end">
          <div>
            <p className="pill bg-brand-100 text-brand-900">CreativeOps para agencias</p>
            <h2 className="headline mt-4 font-[var(--font-display)]">Revisa, comenta y aprueba creativos sin caos operativo.</h2>
            <p className="mt-3 max-w-2xl text-sm muted md:text-base">
              CreativeFlow unifica feedback visual, control de versiones y aprobacion de piezas en una experiencia pensada para equipos y clientes.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-sky-50 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado del workspace</p>
            <p className="mt-2 text-3xl font-semibold">{token ? "Conectado" : "Sin sesion"}</p>
            <p className="mt-1 text-sm muted">Accede para desbloquear paneles de gestion y revision.</p>
          </div>
        </div>
      </section>

      <AuthPanel onLogin={setToken} />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm muted">{item.label}</p>
            <p className="mt-2 text-4xl font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <h2 className="font-[var(--font-display)] text-2xl font-semibold">Acciones rapidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/clients" className="btn-primary">
            Gestionar clientes
          </Link>
          <Link href="/review/demo-review-token" className="btn-dark">
            Demo revision publica
          </Link>
        </div>
      </section>
    </div>
  );
}
