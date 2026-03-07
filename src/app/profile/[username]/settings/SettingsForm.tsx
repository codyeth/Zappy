"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/supabase/helpers";
import { useAuth } from "@/lib/auth/AuthContext";
import { deleteAccount } from "./actions";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300";

interface SettingsFormProps {
  profile: Profile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const { refreshProfile, signOut } = useAuth();
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const updates: { username?: string; displayName?: string; avatarUrl?: string | null } = {};
      if (username.trim() !== profile.username) updates.username = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
      if (displayName.trim() !== profile.displayName) updates.displayName = displayName.trim().slice(0, 50);

      if (avatarFile && profile.id) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `${profile.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          updates.avatarUrl = urlData.publicUrl;
        }
      }

      const { error } = await updateProfile(supabase, profile.id, updates);
      if (error) {
        setMessage({ type: "err", text: error });
      } else {
        await refreshProfile();
        setAvatarFile(null);
        if (updates.username && updates.username !== profile.username) {
          router.replace(`/profile/${updates.username}/settings`);
        }
        setMessage({ type: "ok", text: "Profile updated." });
      }
    } catch {
      setMessage({ type: "err", text: "Something went wrong." });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    const { error } = await deleteAccount();
    setDeleteLoading(false);
    if (error) {
      setMessage({ type: "err", text: error });
    } else {
      await signOut();
      router.replace("/");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {message && (
          <p
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            )}
          >
            {message.text}
          </p>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={INPUT_CLASS}
            minLength={2}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            title="Letters, numbers, underscore only"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={INPUT_CLASS}
            maxLength={50}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Avatar
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-red-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-red-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
        >
          Save changes
        </button>
      </form>

      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h2 className="text-sm font-bold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-red-700">
          Deleting your account will remove your profile and all scores. This cannot be undone.
        </p>
        {!deleteConfirm ? (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="mt-4 rounded-lg border-2 border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleteLoading ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
