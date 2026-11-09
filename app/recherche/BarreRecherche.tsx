"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { suivreInteraction } from "@/app/analytics";

type Props = {
  recherche: string;
};

export default function BarreRecherche({ recherche }: Props) {
  const router = useRouter();

  function lancerRecherche(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valeur = new FormData(event.currentTarget).get("q")?.toString().trim();
    if (!valeur) return;

    suivreInteraction("search_submitted", {
      source: "search_results",
      query_length: valeur.length,
    });
    router.push(`/recherche?${new URLSearchParams({ q: valeur }).toString()}`);
  }

  return (
    <div>
      <form
        onSubmit={lancerRecherche}
        className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-[#F39A27]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
          <Search size={21} className="shrink-0 text-[#F39A27]" />

          <input
            type="search"
            name="q"
            defaultValue={recherche}
            placeholder="Ex. : iPhone à Abobo, Samsung à Cocody..."
            aria-label="Rechercher un produit et une localisation"
            required
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#10243A] outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          aria-label="Rechercher"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#10243A] text-white transition hover:bg-[#1c3c5d]"
        >
          <Search size={18} />
        </button>
      </form>

      <Link
        href="/recherche?mode=ia"
        onClick={() =>
          suivreInteraction("assistant_search_started", {
            source: "search_results",
          })
        }
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-[#10243A] transition hover:border-[#F39A27] hover:bg-orange-100"
      >
        <Sparkles size={17} className="text-[#D97706]" />
        Recherche avancée
        <span className="hidden text-xs font-medium text-slate-500 sm:inline">
          Parlez-nous de votre besoin
        </span>
        <ArrowRight size={16} className="text-[#D97706]" />
      </Link>
    </div>
  );
}
