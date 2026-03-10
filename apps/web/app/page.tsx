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
      { label: "Campañas", value: campaigns?.length ?? 0 },
      { label: "Piezas", value: assets?.length ?? 0 }
    ],
    [assets?.length, campaigns?.length, clients?.length]
  );

  return (
    <div className="container-page space-y-6">
      <AuthPanel onLogin={setToken} />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Acciones rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/clients" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">
            Gestionar clientes
          </Link>
          <Link href="/review/demo-review-token" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Demo revisión pública
          </Link>
        </div>
      </section>
    </div>
  );
}
