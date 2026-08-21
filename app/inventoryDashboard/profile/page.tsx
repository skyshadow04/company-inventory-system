"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, Check, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  image_link: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
        setName(data.user.name);
        setEmail(data.user.email);
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

  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (selectedImage) formData.append("profile_image", selectedImage);

      const res = await fetch("/api/auth/me", { method: "PATCH", body: formData, credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Unable to update profile.");
        return;
      }

      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setPassword("");
      setSelectedImage(null);
      setPreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      toast.success("Profile updated");
    } catch {
      toast.error("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

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

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-12 text-sm text-slate-500">Loading your profile...</div>;

  return (
    <div className="mx-auto max-w-5xl px-2 py-4 sm:px-4 sm:py-8">
      {user ? (
        <>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Account center</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Your profile</h1>
              <p className="mt-2 text-sm text-slate-500">Keep your personal details current across the inventory workspace.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {user.isActive ? "Account active" : "Account inactive"}</div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex items-start justify-between"><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200">{user.role}</span><ShieldCheck className="size-5 text-sky-300" /></div>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="group relative mx-auto mt-10 block size-36 overflow-hidden rounded-full border-4 border-white/15 bg-sky-500/20" aria-label="Change profile photo">
                {preview || user.image_link ? <Image src={preview || user.image_link} alt="Profile" fill unoptimized={Boolean(preview)} className="object-cover" /> : <UserRound className="absolute inset-0 m-auto size-16 text-sky-200" />}
                <span className="absolute inset-x-0 bottom-0 flex translate-y-1 items-center justify-center gap-1 bg-slate-950/80 py-2 text-xs opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"><Camera className="size-3.5" /> Change</span>
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="mt-6 text-center"><h2 className="text-xl font-semibold">{user.name}</h2><p className="mt-1 truncate text-sm text-slate-400">{user.email}</p></div>
              <div className="mt-10 border-t border-white/10 pt-5 text-xs text-slate-400"><p>Member since</p><p className="mt-1 text-sm text-slate-200">{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(user.createdAt))}</p></div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-5"><h2 className="text-lg font-semibold text-slate-950">Personal details</h2><p className="mt-1 text-sm text-slate-500">Update the information used to identify you.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-slate-700"><UserRound className="size-4 text-sky-600" /> Full name</span><Input value={name} onChange={(event) => setName(event.target.value)} required /></label>
                <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Mail className="size-4 text-sky-600" /> Email address</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              </div>
              <div className="mt-8 border-t border-slate-100 pt-6"><div className="flex items-center gap-2"><KeyRound className="size-4 text-sky-600" /><h2 className="text-base font-semibold text-slate-950">Change password</h2></div><p className="mt-1 text-sm text-slate-500">Leave blank to keep your current password.</p><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={password ? 8 : undefined} className="mt-4 max-w-md" /></div>
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={handleLogout}>Log out</Button><Button type="submit" disabled={saving} className="gap-2 bg-sky-600 text-white hover:bg-sky-700"><Check className="size-4" />{saving ? "Saving..." : "Save changes"}</Button></div>
            </section>
          </form>
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Not signed in.</div>
      )}
    </div>
  );
}
