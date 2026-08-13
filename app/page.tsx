"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section id="home" className="relative flex min-h-[100vh] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')",
            transform: `translateY(${offset}px)`,
          }}
        />
        <div className="absolute inset-0 bg-sky-950/70" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center text-white font-mono">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">
            Trusted support for every home
          </p>
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Welcome to Leadership Domestic Workers Service Center
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-sky-100 sm:text-xl">
            Reliable staffing, professional support, and dependable service for homes,
            families, and growing communities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-md bg-white px-6 py-3 font-semibold text-sky-900 transition hover:bg-sky-100"
            >
              Get Started
            </Link>
            <Link
              href="#"
              className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      <section id="about" className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-sky-950 py-20 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-sky-950/75" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center font-mono">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            About Us
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl">
            Leadership Domestic Workers Service Center is dedicated to providing reliable staffing solutions and professional support for homes, families, and communities. Our mission is to ensure that every household has access to skilled domestic workers who can help maintain a safe and comfortable living environment.
          </p>
          <Link
            href="#"
            className="rounded-md bg-white px-6 py-3 font-semibold text-sky-900 transition hover:bg-sky-100"
          >
            Learn More
          </Link>
        </div>
      </section>
      <section id="services" className="flex min-h-[100vh] items-center justify-center bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6 text-center border-b-2 border-sky-950 pb-10">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl font-mono border-b-2 border-sky-950 inline-block pb-2">
            Our Services
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl">
            We offer a range of services to meet the needs of our clients, including domestic worker staffing, training, and support. Our team is committed to providing high-quality service and ensuring that our clients are satisfied with the assistance they receive.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold">Domestic Worker Staffing</h3>
              <p>
                We connect households with skilled domestic workers who can assist with various tasks, ensuring a comfortable and well-maintained home environment.
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold">Training Programs</h3>
              <p>
                Our training programs equip domestic workers with the necessary skills and knowledge to provide exceptional service and support to households.
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold">Support Services</h3>
              <p>
                We offer ongoing support to both domestic workers and households, ensuring a positive and productive working relationship.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-sky-950 py-20 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-sky-950/80" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl font-mono">
            Contact Us
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl">
            If you have any questions or would like to learn more about our services, please do not hesitate to reach out. We are here to help and look forward to assisting you.
          </p>
          <Link
            href="#"
            className="rounded-md bg-white px-6 py-3 font-semibold text-sky-900 transition hover:bg-sky-100 font-mono"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}