import { useState } from "react";
import api from "../api";

export default function LoginForm({ onLoggedIn }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await api.post("accounts/login/", form);
      onLoggedIn?.(response.data);
      setForm({ username: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200 before:absolute before:-left-3 before:-top-3 before:h-[calc(100%+24px)] before:w-[calc(100%+24px)] before:rounded-[36px] before:border before:border-slate-200/60 before:opacity-70 before:content-[''] before:pointer-events-none after:absolute after:left-3 after:top-3 after:h-[calc(100%-24px)] after:w-[calc(100%-24px)] after:rounded-[28px] after:border after:border-white/40 after:opacity-50 after:content-[''] after:pointer-events-none"
    >
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gradient-to-r from-slate-200/60 to-purple-200/60 blur-3xl" />
      <div className="relative space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 text-lg">
            🔑
          </span>
          Welcome back
        </div>
        <h2 className="text-3xl font-semibold text-slate-900">Sign in</h2>
        <p className="text-sm text-slate-500">
          Continue the conversation with secure, session-based authentication.
        </p>
      </div>

      {error && (
        <p className="relative rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2 text-sm text-red-600 shadow-inner">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <label className="block text-sm text-slate-500">
          Username
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
            <span className="text-lg text-slate-500">@</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="hannah"
              required
            />
          </div>
        </label>
        <label className="block text-sm text-slate-500">
          Password
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
            <span className="text-lg text-slate-500">🔒</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="********"
              required
            />
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        <span>remembered</span>
        <span className="text-purple-500">secure login</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
