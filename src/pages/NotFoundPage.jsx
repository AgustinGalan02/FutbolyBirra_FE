import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Footer } from "../components";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans flex flex-col">
      <Navbar backTo="/" backLabel="Volver" />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-[#f0ac00]">
            No se encontró la página que estás buscando
          </h1>

          <p className="mt-3 text-zinc-400">
            Revisá la URL o volvé al inicio.
          </p>

          <Link
            to="/"
            className="inline-block mt-6 px-5 py-2 rounded-lg bg-[#f0ac00] text-zinc-900 font-bold hover:bg-[#d99600] transition"
          >
            Volver al inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}