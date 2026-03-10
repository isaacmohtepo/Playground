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
      setError(err instanceof Error ? err.message : "No fue posible iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("creativeflow_token");
    onLogin("");
  }

  return (
    <div className="card p-5">
      <h2 className="text-lg font-semibold">Acceso de agencia</h2>
      {tokenExists ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">Sesión activa con JWT guardado localmente.</p>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="mt-4 grid gap-3">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button disabled={loading} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
