"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!mounted) return;
        if (!data?.authenticated) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) {
        toast.success("Logged out");
        setTimeout(() => router.push("/"), 700);
        return;
      }
      toast.error("Logout failed");
    } catch {
      toast.error("Logout failed");
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {user ? (
        <div className="space-y-2">
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div className="pt-4">
            <button onClick={handleLogout} className="px-4 py-2 bg-sky-700 text-white rounded-md">Logout</button>
          </div>
        </div>
      ) : (
        <div>Not signed in.</div>
      )}
    </div>
  );
}
