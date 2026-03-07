import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername } from "@/lib/supabase/helpers";
import AppLayout from "@/components/layout/AppLayout";
import SettingsForm from "./SettingsForm";

interface Props {
  params: { username: string };
}

export function generateStaticParams() {
  return [];
}

export default async function ProfileSettingsPage({ params }: Props) {
  const supabase = createClient();
  const profile = await getProfileByUsername(supabase, params.username);
  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== profile.id) notFound();

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="hover:text-red-500">Home</Link>
          <span>/</span>
          <Link href={`/profile/${profile.username}`} className="hover:text-red-500">
            {profile.username}
          </Link>
          <span>/</span>
          <span className="text-gray-600">Settings</span>
        </nav>

        <h1 className="text-xl font-bold text-gray-900">Settings</h1>

        <SettingsForm profile={profile} />
      </div>
    </AppLayout>
  );
}
