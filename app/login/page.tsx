"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        async function checkAuth() {
            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();

                if (!mounted) return;

                if (data?.authenticated) {
                    router.replace("/dashboard");
                    return;
                }
            } catch (err) {
                // ignore errors and allow login form to render
            } finally {
                if (mounted) setCheckingAuth(false);
            }
        }

        checkAuth();

        return () => {
            mounted = false;
        };
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Login failed");
                setLoading(false);
                return;
            }

            // Mark auth as pending so the navbar waits for the new session cookie.
            window.sessionStorage.setItem("authPending", "true");
            window.location.assign("/dashboard");
        } catch (err: any) {
            setError(err?.message || "Network error");
            setLoading(false);
        }
    }

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-sm text-slate-500">Checking authentication...</div>
            </div>
        );
    }

    return (
        <>
            <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-white py-16 text-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-100" />
                <div className="relative z-10 flex w-full max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center md:px-8">
                    <div className="hidden flex-1 flex-col justify-center rounded-[32px] border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/50 md:flex">
                        <div className="mb-6">
                            <p className="text-sm uppercase tracking-[0.25em] text-sky-500">Welcome back</p>
                            <h2 className="mt-4 text-4xl font-semibold text-slate-900">Sign in to your account</h2>
                        </div>
                        <p className="max-w-md text-slate-600">
                            Securely manage your inventory and supplier workflow from one clean dashboard.
                        </p>
                    </div>

                    <Card className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/40">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-3xl text-slate-900">Login</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-4">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Email address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <Button className="w-full rounded-3xl bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-500" type="submit" disabled={loading}>
                                    {loading ? "Logging in..." : "Sign in"}
                                </Button>

                                <p className="text-center text-sm text-slate-500">
                                    New here? <span className="font-medium text-slate-900">Create an account</span>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    );
}