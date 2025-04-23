"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 mt-12">
      <h1 className="text-2xl font-bold mb-6">Anmelden</h1>
      {success ? (
        <p className="text-green-600">
          Check dein E-Mail-Postfach für den Login-Link.
        </p>
      ) : (
        <>
          <input
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleLogin}
          >
            Magic Link senden
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </main>
  );
}
