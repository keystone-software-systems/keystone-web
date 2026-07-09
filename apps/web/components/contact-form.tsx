"use client";

import { useState, type FormEvent } from "react";
import { solutions } from "@/app/solutions/content";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-slate/20 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-blueprint-navy">Message sent</h2>
        <p className="mt-2 text-sm text-blueprint-navy/70">
          Thanks for reaching out. We&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-blueprint-navy">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-blueprint-navy">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="company" className="text-sm font-medium text-blueprint-navy">
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service" className="text-sm font-medium text-blueprint-navy">
            Service interest
          </label>
          <select
            id="service"
            name="service"
            defaultValue=""
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
          >
            <option value="" disabled>
              Select one
            </option>
            {solutions.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
            <option value="other">Not sure / other</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-blueprint-navy">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-blueprint-navy px-6 py-3 text-sm font-medium text-white hover:bg-technical-blue disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
