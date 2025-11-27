import { useEffect, useMemo, useState } from "react";
import api from "../api";

const initialProfile = {
  username: "",
  email: "",
  bio: "",
  avatar_url: "",
};

export default function ProfileModal({ open, onClose, onProfileUpdated }) {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const previewUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return profile.avatar_url || "";
  }, [avatarFile, profile.avatar_url]);

  useEffect(() => {
    if (open) {
      fetchProfile();
    } else {
      setAvatarFile(null);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(avatarFile);
      }
    };
  }, [avatarFile]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("accounts/profile/");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    } else {
      setAvatarFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("email", profile.email);
      formData.append("bio", profile.bio || "");
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const res = await api.put("accounts/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      setAvatarFile(null);
      onProfileUpdated?.();
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.username ||
        err.response?.data?.email ||
        "Unable to save profile.";
      setError(Array.isArray(detail) ? detail.join(" ") : detail);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500 hover:text-purple-600"
        >
          Close
        </button>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex w-full flex-col items-center gap-4 lg:w-1/3">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-purple-100 bg-slate-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-purple-400">
                  {profile.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <label className="w-full text-center text-sm font-semibold text-purple-600">
              <span className="cursor-pointer rounded-full border border-purple-200 px-4 py-2">
                Upload photo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-center text-xs text-slate-500">
              PNG, JPG up to 5MB.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-4 lg:w-2/3"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Manage account
              </p>
              <h3 className="text-2xl font-semibold text-slate-900">
                Profile settings
              </h3>
              <p className="text-sm text-slate-500">
                Update your display information and keep your Block Me profile
                fresh.
              </p>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading profile...</p>
            ) : (
              <>
                {error && (
                  <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Username
                    <input
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </label>
                </div>
                <label className="text-sm text-slate-600">
                  Bio
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    className="mt-1 h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Add a short status or role..."
                  />
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
