import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getProfileByUsername,
  getRecentScores,
  getProfileStats,
} from "@/lib/supabase/helpers";
import AppLayout from "@/components/layout/AppLayout";
import ProfileClient from "./ProfileClient";

interface Props {
  params: { username: string };
}

export function generateStaticParams() {
  return [];
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient();
  const profile = await getProfileByUsername(supabase, params.username);
  if (!profile) notFound();

  const [recentScores, stats] = await Promise.all([
    getRecentScores(supabase, profile.id, 15),
    getProfileStats(supabase, profile.id),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="hover:text-red-500">Home</Link>
          <span>/</span>
          <span className="text-gray-600">{profile.username}</span>
        </nav>

        <ProfileClient
          profile={profile}
          recentScores={recentScores}
          stats={stats}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </AppLayout>
  );
}
