"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

type Filtres = {
  prixMin: string;
  prixMax: string;
  tri: string;
};

type Props = {
  onFiltrer: (filtres: Filtres) => void;
};

export default function FiltresRecherche({ onFiltrer }: Props) {
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [tri, setTri] = useState("pertinence");

  function appliquerFiltres() {
    onFiltrer({ prixMin, prixMax, tri });
  }

  function reinitialiser() {
    setPrixMin("");
    setPrixMax("");
    setTri("pertinence");

    onFiltrer({
      prixMin: "",
      prixMax: "",
      tri: "pertinence",
    });
  }

  return (
    <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-[#F39A27]" />
          <h2 className="font-bold text-[#10243A]">Filtres</h2>
        </div>

        <button
          type="button"
          onClick={reinitialiser}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-[#F39A27]"
        >
          <RotateCcw size={13} />
          Réinitialiser
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-bold text-[#10243A]">
            Fourchette de prix
          </label>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              placeholder="Minimum"
              value={prixMin}
              onChange={(e) => setPrixMin(e.target.value)}
              className="min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#F39A27]"
            />

            <input
              type="number"
              min="0"
              placeholder="Maximum"
              value={prixMax}
              onChange={(e) => setPrixMax(e.target.value)}
              className="min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#F39A27]"
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Les montants sont comparés dans la devise des prix affichés.
          </p>
        </div>

        <div>
          <label className="mb-3 block text-sm font-bold text-[#10243A]">
            Trier par
          </label>

          <select
            value={tri}
            onChange={(e) => setTri(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 outline-none focus:border-[#F39A27]"
          >
            <option value="pertinence">Pertinence</option>
            <option value="prix-croissant">Prix croissant</option>
            <option value="prix-decroissant">Prix décroissant</option>
          </select>
        </div>

        <button
          type="button"
          onClick={appliquerFiltres}
          className="w-full rounded-xl bg-[#10243A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1c3c5d] active:scale-[0.98]"
        >
          Appliquer les filtres
        </button>
      </div>
    </aside>
  );
}
