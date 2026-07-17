"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { login, type StatoLogin } from "./actions";
import { Monogramma } from "@/components/Monogramma";

const STATO_INIZIALE: StatoLogin = {};

function Bottone() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-oro w-full disabled:opacity-60">
      {pending ? "Accesso…" : "Entra"}
    </button>
  );
}

function Form() {
  const [stato, formAction] = useFormState(login, STATO_INIZIALE);
  const next = useSearchParams().get("next") ?? "/app";

  return (
    <form action={formAction} className="w-full max-w-sm rounded-2xl border border-nero/10 bg-carta p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Monogramma className="h-11 w-11 text-oro" />
        <h1 className="mt-3 font-display text-2xl font-semibold">Casa Base</h1>
        <p className="mt-1 text-sm text-testo-chiaro/55">Accesso riservato</p>
      </div>

      <input type="hidden" name="next" value={next} />

      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2.5 focus:border-oro focus:outline-none"
        />
      </label>
      <label className="mt-4 block text-sm">
        <span className="font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2.5 focus:border-oro focus:outline-none"
        />
      </label>

      {stato.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{stato.error}</p>
      )}

      <div className="mt-6">
        <Bottone />
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-avorio px-4">
      <Suspense>
        <Form />
      </Suspense>
    </div>
  );
}
