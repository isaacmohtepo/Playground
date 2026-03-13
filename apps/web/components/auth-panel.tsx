"use client";

import { useState } from "react";
import { apiPost, getStoredToken } from "../lib/api";

export function AuthPanel({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("admin@creativeflow.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenExists = typeof window !== "undefined" && getStoredToken();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<{ accessToken: string }>("/auth/login", { email, password });
      localStorage.setItem("creativeflow_token", data.accessToken);
      onLogin(data.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("creativeflow_token");
    onLogin("");
  }

  return (
    <div className="card-strong p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="pill bg-brand-100 text-brand-900">Workspace de agencia</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold">Acceso seguro</h2>
          <p className="mt-1 text-sm muted">Gestiona clientes, campanas y aprobaciones en un solo flujo.</p>
        </div>
      </div>

      {tokenExists ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Sesion activa con JWT almacenado localmente.</p>
          <button className="btn-dark" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="mt-5 grid gap-3">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Ingresando..." : "Iniciar sesion"}
          </button>
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
