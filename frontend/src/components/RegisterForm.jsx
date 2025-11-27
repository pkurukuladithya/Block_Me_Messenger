import { useState } from "react";
import api from "../api";

const buildErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) {
    return "Registration failed";
  }
  if (typeof data === "string") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.join(" ");
  }
  if (data.detail) {
    return data.detail;
  }
  const [firstKey] = Object.keys(data);
  if (!firstKey) {
    return "Registration failed";
  }
  const value = data[firstKey];
  if (Array.isArray(value)) {
    return `${firstKey}: ${value.join(" ")}`;
  }
  if (typeof value === "string") {
    return `${firstKey}: ${value}`;
  }
  return "Registration failed";
};

export default function RegisterForm({ onRegistered }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ error: "", success: "" });
    setSubmitting(true);
    try {
      await api.post("accounts/register/", form);
      setForm({ username: "", email: "", password: "" });
      setFeedback({
        error: "",
        success: "Account created! You can sign in now.",
      });
      onRegistered?.();
    } catch (error) {
      console.error(error);
      setFeedback({
        error: buildErrorMessage(error),
        success: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[32px] border border-purple-100 bg-white/90 p-6 shadow-xl shadow-purple-200 before:pointer-events-none before:absolute before:-left-3 before:-top-3 before:h-[calc(100%+24px)] before:w-[calc(100%+24px)] before:rounded-[36px] before:border before:border-purple-200/50 before:opacity-70 before:content-[''] after:pointer-events-none after:absolute after:left-3 after:top-3 after:h-[calc(100%-24px)] after:w-[calc(100%-24px)] after:rounded-[28px] after:border after:border-white/40 after:opacity-50 after:content-['']"
    >
      <div className="pointer-events-none absolute -top-20 -right-10 h-32 w-32 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-3xl" />
      <div className="relative space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-purple-400">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-100 text-lg">
            ✨
          </span>
          Create account
        </div>
        <h2 className="text-3xl font-semibold text-slate-900">
          Join Block Me
        </h2>
        <p className="text-sm text-slate-500">
          Seamless onboarding with secure credentials and personalized avatars.
        </p>
      </div>

      {feedback.error && (
        <p className="relative rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2 text-sm text-red-600 shadow-inner">
          {feedback.error}
        </p>
      )}

      {feedback.success && (
        <p className="relative rounded-2xl border border-emerald-100 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-600 shadow-inner">
          {feedback.success}
        </p>
      )}

      <div className="space-y-4">
        <label className="block text-sm text-slate-500">
          Username
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
            <span className="text-lg text-purple-500">@</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="e.g. hannah"
              required
            />
          </div>
        </label>
        <label className="block text-sm text-slate-500">
          Email
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
            <span className="text-lg text-purple-500">✉️</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="you@example.com"
              required
            />
          </div>
        </label>
        <label className="block text-sm text-slate-500">
          Password
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
            <span className="text-lg text-purple-500">🔒</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="********"
              minLength={6}
              required
            />
          </div>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        <span className="rounded-full border border-slate-200 px-3 py-1">
          secure
        </span>
        <span className="rounded-full border border-slate-200 px-3 py-1">
          instant access
        </span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
