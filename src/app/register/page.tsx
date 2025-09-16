"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | string[]>("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Si el error es un array de issues de Zod, extrae los mensajes
      if (Array.isArray(data.error)) {
        setError(data.error.map((issue: unknown) => {
          if (typeof issue === 'object' && issue !== null && 'message' in issue) {
            return (issue as { message: string }).message;
          }
          return '';
        }));
      } else {
        setError(data.error || "Error en el registro");
      }
    } else {
      setSuccess("Registro exitoso, redirigiendo...");
      setTimeout(() => router.push("/login"), 1500);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Registro</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button type="submit" className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors shadow">Registrarse</button>
        </form>
        {error && Array.isArray(error) ? (
          <ul className="mt-4 text-center text-red-600 font-medium">
            {error.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        ) : error ? (
          <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
        ) : null}
        {success && <p className="mt-4 text-center text-green-600 font-medium">{success}</p>}
      </div>
    </div>
  );
}
