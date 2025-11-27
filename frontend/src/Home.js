import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import ProfileModal from "./components/ProfileModal";
import api from "./api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [peerUser, setPeerUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [ctaExpanded, setCtaExpanded] = useState(false);
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("accounts/me/")
      .then((res) => setUser(res.data))
      .catch(() => {
        /* anonymous */
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const refreshCurrentUser = async () => {
    const res = await api.get("accounts/me/");
    setUser(res.data);
  };

  const handleLogout = async () => {
    try {
      await api.post("accounts/logout/");
    } finally {
      setPeerUser(null);
      setUser(null);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const renderDarkSwitch = () => (
    <div className="fixed bottom-6 right-6">
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className={`rounded-full border px-4 py-2 text-xs font-semibold shadow-lg transition hover:scale-105 ${
          darkMode
            ? "border-slate-700 bg-slate-900 text-slate-100"
            : "border-purple-200 bg-white/80 text-purple-700"
        }`}
      >
        {darkMode ? "Light mode" : "Dark mode"}
      </button>
    </div>
  );

  const renderAboutButton = () => (
    <div className="fixed bottom-6 left-6 space-y-2">
      <button
        onClick={() => navigate("/about")}
        className={`rounded-full border px-4 py-2 text-xs font-semibold shadow-lg transition hover:scale-105 ${
          darkMode
            ? "border-slate-700 bg-slate-900 text-slate-100"
            : "border-purple-200 bg-white/80 text-purple-700"
        }`}
      >
        About this app
      </button>
      <p className="text-xs font-semibold text-slate-400">
        © Block Me by Praveena Kurukuladithya
      </p>
    </div>
  );

  if (checkingSession) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center text-slate-600">
          <p className="animate-pulse text-sm tracking-[0.4em] uppercase">
            Connecting...
          </p>
        </div>
        {renderAboutButton()}
        {renderDarkSwitch()}
      </>
    );
  }

  if (!user) {
    return (
      <>
        <main className="min-h-screen px-4 py-16">
          <div className="mx-auto max-w-6xl space-y-12">
            {!ctaExpanded ? (
              <header className="text-center space-y-6">
                <p className="text-xl uppercase tracking-[0.8em] text-purple-500">
                  Elegant web-based chat app
                </p>
                <h1 className="font-hero text-7xl text-purple-950 sm:text-8xl">
                  Block Me
                </h1>
                <p className="mx-auto max-w-3xl text-lg text-slate-500">
                  Modern messaging crafted by
                  <br />
                  <span className="font-bold uppercase text-purple-700">
                    Praveena Kurukuladithya
                  </span>
                  <br />
                  <span className="font-bold uppercase text-purple-700">
                    Computer Science Engineering student
                  </span>
                  <br />
                  Share ideas instantly with real-time sync across every device.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                  <span>✨ Designed for bold conversations.</span>
                  <span>⚙️ Backend: Django, DRF, Channels.</span>
                  <span>🍃 Database: MongoDB.</span>
                  <span>⚛️ Frontend: React + Tailwind.</span>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow">
                    🐍 Python
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow">
                    🌿 Django
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow">
                    🍃 MongoDB
                  </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow">
                  ⚛️ React
                </span>
              </div>
              <button
                onClick={() => setCtaExpanded(true)}
                className="mt-8 inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-500 px-14 py-5 text-xl font-semibold text-white shadow-2xl shadow-purple-200 transition hover:scale-[1.02]"
              >
                Start chatting
              </button>
              <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-sm text-slate-500 shadow-inner">
                <p>
                  🛠️ Tech combo: <strong>Django + DRF + Channels</strong> powering
                  ⚡ real-time sockets, 🍃 <strong>MongoDB</strong> for chat history,
                  and ⚛️ <strong>React + Tailwind</strong> for the polished UI.
                </p>
              </div>
            </header>
            ) : (
              <div className="space-y-8 transition-all duration-500">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
                  <div className="flex-1 space-y-4 text-left">
                    <p className="font-hero text-6xl text-purple-800">Block Me</p>
                    <p className="text-xl text-slate-600">
                      Talk with classmates, teammates, or clients instantly. Built
                      for fast collaboration with a friendly interface.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-500">
                      <li>• Real-time WebSocket messaging</li>
                      <li>• Profile avatars & session auth</li>
                      <li>• MongoDB persistence</li>
                    </ul>
                    <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-xs text-slate-500 shadow-inner">
                      <p>
                        🧪 Built with Django + DRF + Channels • 🍃 MongoDB • ⚛️ React
                        • 🎨 Tailwind CSS
                      </p>
                    </div>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                      <LoginForm onLoggedIn={setUser} />
                      <button className="mt-4 w-full rounded-2xl border border-slate-200 py-2 text-center text-sm font-semibold text-purple-500">
                        Forgotten password?
                      </button>
                    </div>
                    <button
                      onClick={() => setShowRegisterPanel(true)}
                      className="w-full rounded-2xl bg-green-500 py-3 text-center text-lg font-semibold text-white shadow-lg transition hover:bg-green-600"
                    >
                      Create account
                    </button>
                  </div>
                </div>
                {showRegisterPanel && (
                  <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-slate-900">
                        Create a new account
                      </h3>
                      <button
                        className="text-sm text-slate-500 hover:text-purple-500"
                        onClick={() => setShowRegisterPanel(false)}
                      >
                        Close
                      </button>
                    </div>
                    <RegisterForm
                      onRegistered={() => setShowRegisterPanel(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        {renderAboutButton()}
        {renderDarkSwitch()}
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[340px,1fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Signed in as
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {user.username}
                  </h2>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.username} avatar`}
                  className="mt-4 h-20 w-20 rounded-2xl object-cover shadow-inner"
                />
              ) : (
                <div className="mt-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-50 text-2xl font-semibold text-purple-500">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="rounded-2xl border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-600 transition hover:border-purple-400"
                >
                  My Account
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-purple-400 hover:text-purple-600"
                >
                  Logout
                </button>
              </div>
            </div>

            <UserList
              currentUser={user}
              onSelectUser={setPeerUser}
              activeUser={peerUser}
            />
          </aside>

          <section className="rounded-3xl border border-purple-100 bg-white/90 p-4 shadow-2xl shadow-purple-200 lg:h-[80vh]">
            {peerUser ? (
              <ChatWindow currentUser={user} peerUser={peerUser} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-slate-500">
                <p className="text-xl font-semibold text-slate-700">
                  Select a member to begin
                </p>
                <p className="mt-2 max-w-sm text-sm">
                  Choose anyone from the members list to open a private thread and
                  start the conversation.
                </p>
              </div>
            )}
          </section>
        </div>
        <ProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onProfileUpdated={async () => {
            await refreshCurrentUser();
            setProfileModalOpen(false);
          }}
        />
      </main>
      {renderAboutButton()}
      {renderDarkSwitch()}
    </>
  );
}
