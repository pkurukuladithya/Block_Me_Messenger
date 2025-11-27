import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("dark-mode");
    return () => document.body.classList.remove("dark-mode");
  }, []);

  return (
    <main className="min-h-screen px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
        <header className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.5em] text-purple-300">
            About
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Block Me – by Praveena Kurukuladithya
          </h1>
          <p className="text-lg text-purple-200">
            Computer Science and Engineering student
          </p>
        </header>

        <section className="space-y-3 text-slate-200">
          <p>
            Block Me is a modern messaging experiment focused on fast, secure
            collaboration. It combines a Django backend with MongoDB for chat
            persistence and a React front-end styled with Tailwind CSS.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>🐍 Python 3.12 with Django 4.2 + Django REST Framework</li>
            <li>🧵 Channels for real-time WebSocket communication</li>
            <li>🍃 MongoDB for message storage, SQLite for auth/session data</li>
            <li>⚛️ React + Tailwind for the UI, Axios for API communication</li>
            <li>🧩 Session-based authentication with CSRF-exempt endpoints</li>
            <li>🖼️ Profile avatars stored via Django’s media pipeline</li>
          </ul>
          <p>
            Built to demonstrate full-stack messaging features: account
            management, WebSocket fallbacks, modern UI theming, and a responsive
            layout that feels like a native chat client.
          </p>
        </section>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl border border-purple-400 px-5 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/20"
          >
            Go back
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-2xl bg-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-90"
          >
            Home
          </button>
        </div>
        <p className="text-center text-xs font-semibold text-slate-500">
          © Block Me by Praveena Kurukuladithya
        </p>
      </div>
    </main>
  );
}
