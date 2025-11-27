import { useEffect, useState } from "react";
import api from "../api";

function AvatarBadge({ user }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.username} avatar`}
        className="h-10 w-10 rounded-2xl object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-sm font-semibold text-purple-600">
      {user.username.charAt(0).toUpperCase()}
    </div>
  );
}

export default function UserList({ currentUser, onSelectUser, activeUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("accounts/users/")
      .then((res) => {
        if (mounted) {
          setUsers(res.data);
          setError("");
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) {
          setError("Unable to load users");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Members
          </p>
          <h3 className="text-xl font-semibold text-slate-900">All users</h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          {Math.max(users.length - 1, 0)} online
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-14 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          users
            .filter((user) => user.username !== currentUser.username)
            .map((user) => {
              const isActive = activeUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-purple-400 bg-purple-50 text-purple-900 shadow-sm"
                      : "border-slate-100 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AvatarBadge user={user} />
                    <div>
                      <p className="text-sm font-semibold">{user.username}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-purple-500" : "bg-emerald-400"
                    }`}
                  />
                </button>
              );
            })
        )}
      </div>
    </div>
  );
}
