"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const navLinks = [
  { label: "Fleet", href: "/dashboard" },
  { label: "History", href: "/dashboard/history" },
];

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r border-gray-200 p-6">
      <h1 className="mb-8 text-2xl font-semibold">CartHost</h1>
      <nav className="mb-8 space-y-4">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block text-lg text-blue-600">
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
      >
        Logout
      </button>
    </aside>
  );
}
