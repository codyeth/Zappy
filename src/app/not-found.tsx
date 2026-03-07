import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Oops! This level doesn&apos;t exist 🎮
        </h1>
        <p className="text-gray-600">The page you&apos;re looking for couldn&apos;t be found.</p>
        <Link
          href="/"
          className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-red-600"
        >
          Back to lobby
        </Link>
      </div>
    </AppLayout>
  );
}
