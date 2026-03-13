"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthPanel } from "../components/auth-panel";
import { apiGet, getStoredToken } from "../lib/api";

function MiniBars() {
  const bars = [42, 30, 58, 36, 66, 44, 54, 32, 62, 52, 40, 68];
  return (
    <div className="mt-4 flex h-28 items-end gap-1.5">
      {bars.map((height, index) => (
        <div key={index} className="w-2.5 rounded-full bg-gradient-to-t from-[#5d6dff] to-[#da6dff]" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function Donut() {
  return (
    <div className="relative mx-auto mt-3 h-24 w-24 rounded-full bg-[conic-gradient(#4f46e5_0_34%,#e879f9_34_59%,#22c55e_59_80%,#f59e0b_80_100%)] p-3">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600">100%</div>
    </div>
  );
}

function LineGhost() {
  return (
    <div className="mt-4 h-24 rounded-2xl bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-cyan-50 p-3">
      <svg viewBox="0 0 240 80" className="h-full w-full">
        <path d="M0,60 C20,62 24,18 46,22 C62,24 74,66 94,54 C112,43 130,16 152,26 C172,35 188,56 206,44 C220,35 228,20 240,24" fill="none" stroke="#5b6fff" strokeWidth="2.2" />
        <path d="M0,42 C22,34 28,58 48,52 C66,46 80,18 102,24 C126,30 138,62 162,56 C182,51 194,28 214,30 C227,31 234,43 240,47" fill="none" stroke="#df5dff" strokeWidth="2.2" />
      </svg>
    </div>
  );
}

function SideMenu() {
  const items = ["Dashboard", "Clientes", "Campanas", "Piezas", "Aprobaciones", "Reportes"];
  return (
    <aside className="rounded-3xl border border-white/70 bg-gradient-to-b from-white to-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">CreativeFlow</p>
      <h2 className="mt-3 font-[var(--font-display)] text-xl font-semibold text-slate-900">Analytics</h2>
      <div className="mt-5 space-y-1">
        {items.map((item, index) => (
          <div
            key={item}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              index === 0 ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-slate-900 p-3 text-xs text-slate-200">
        Workspace de agencia
        <p className="mt-1 text-slate-400">Version visual premium</p>
      </div>
    </aside>
  );
}

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
      { label: "Total clientes", value: clients?.length ?? 0, hint: "Cuentas activas" },
      { label: "Campanas", value: campaigns?.length ?? 0, hint: "En ejecucion" },
      { label: "Piezas", value: assets?.length ?? 0, hint: "Versionadas" }
    ],
    [assets?.length, campaigns?.length, clients?.length]
  );

  return (
    <div className="container-page space-y-6">
      <section className="card-strong reveal overflow-hidden p-4 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <SideMenu />

          <div className="rounded-3xl border border-white/70 bg-white/80 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm muted">Bienvenido de vuelta</p>
                <h1 className="font-[var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">Panel creativo</h1>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                <span>Search</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">Rendimiento mensual</p>
                  <span className="text-xs text-slate-500">Last month</span>
                </div>
                <MiniBars />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-800">Distribucion de revisiones</p>
                <Donut />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span>Aprobadas 34%</span>
                  <span>Cambios 25%</span>
                  <span>Pendientes 21%</span>
                  <span>Bloqueadas 20%</span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-800">Actividad por cliente</p>
                <LineGhost />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-800">Acciones rapidas</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/clients" className="btn-primary !px-3 !py-2 !text-xs">
                    Gestionar clientes
                  </Link>
                  <Link href="/review/demo-review-token" className="btn-dark !px-3 !py-2 !text-xs">
                    Revision publica
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="reveal delay-1">
        <AuthPanel onLogin={setToken} />
      </div>
    </div>
  );
}
