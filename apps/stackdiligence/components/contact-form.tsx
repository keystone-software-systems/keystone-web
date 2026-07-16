"use client";

import { useState, type FormEvent } from "react";

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
        <h2 className="text-lg font-semibold text-graphite">Message sent</h2>
        <p className="mt-2 text-sm text-graphite/70">
          Thanks for reaching out. We&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-graphite">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-graphite outline-none focus:border-steel"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-graphite">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-graphite outline-none focus:border-steel"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firm" className="text-sm font-medium text-graphite">
            Firm
          </label>
          <input
            id="firm"
            name="firm"
            type="text"
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-graphite outline-none focus:border-steel"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="timeline" className="text-sm font-medium text-graphite">
            Timeline
          </label>
          <input
            id="timeline"
            name="timeline"
            type="text"
            placeholder="e.g. closing in 3 weeks"
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-graphite outline-none focus:border-steel"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-graphite">
          Brief deal description
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-graphite outline-none focus:border-steel"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
