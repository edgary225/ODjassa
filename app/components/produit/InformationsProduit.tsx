"use client";

import Link from "next/link";
import {
  Store,
  MessageCircle,
  ShieldCheck,
  Truck,
  MapPin,
  ArrowLeft,
  Tag,
  FileText,
} from "lucide-react";

type Props = {
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  boutique: string;
  ville: string;
  reference: string;
};

export default function InformationsProduit({
  nom,
  description,
  prix,
  categorie,
  boutique,
  ville,
  reference,
}: Props) {
  const prixFormate = new Intl.NumberFormat("fr-FR").format(prix);

  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par le produit ${nom} affiché sur ODJASSA. Est-il disponible ?`,
  );

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* ombre de la fiche */}
      <div className="absolute inset-2 top-3 rounded-2xl bg-slate-200/70" />

      {/* carte principale */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        {/* en-tête fixe */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-lg font-black tracking-tight text-[#10243A]">
              ODJASSA<span className="text-[#F39A27]">.</span>
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              La référence de l&apos;achat
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-[#F39A27]"
          >
            <ArrowLeft size={15} />
            Retour
          </Link>
        </div>

        {/* contenu horizontal */}
        <div className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* PARTIE 1 : PRODUIT */}
          <section className="w-full shrink-0 snap-center p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#F39A27]">
                01 — Le produit
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                Disponible
              </span>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Tag size={15} className="text-[#F39A27]" />

              <span className="text-xs font-bold text-slate-400">
                {categorie}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight text-[#10243A]">
              {nom}
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {description}
            </p>

            {/* prix */}
            <div className="mt-7 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prix affiché
              </p>

              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-[#10243A] sm:text-4xl">
                  {prixFormate}
                </span>

                <span className="text-lg font-bold text-[#F39A27]">FCFA</span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Prix indicatif de démonstration
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Faites glisser pour découvrir le prestataire →
            </p>
          </section>

          {/* PARTIE 2 : PRESTATAIRE */}
          <section className="w-full shrink-0 snap-center p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#F39A27]">
                02 — Le prestataire
              </span>

              <Store size={19} className="text-slate-300" />
            </div>

            <div className="space-y-6">
              {/* boutique */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#10243A]">
                  <Store size={20} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Nom de la boutique
                  </p>

                  <p className="mt-1 font-bold text-[#10243A]">{boutique}</p>
                </div>
              </div>

              {/* localisation */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#10243A]">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Localisation
                  </p>

                  <p className="mt-1 font-bold text-[#10243A]">{ville}</p>
                </div>
              </div>

              {/* référence */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#10243A]">
                  <FileText size={20} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Référence du produit
                  </p>

                  <p className="mt-1 font-bold text-[#10243A]">{reference}</p>
                </div>
              </div>
            </div>

            {/* contact WhatsApp */}
            <a
              href={`https://wa.me/?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#10243A] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#10243A]/15 transition hover:-translate-y-0.5 hover:bg-[#1c3c5d]"
            >
              <MessageCircle size={19} />
              Contacter le prestataire
            </a>

            {/* informations complémentaires */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={17} className="shrink-0 text-green-600" />
                <span>Boutique sur ODJASSA</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Truck size={17} className="shrink-0 text-[#F39A27]" />
                <span>Livraison à confirmer</span>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              ← Faites glisser pour revenir au produit
            </p>
          </section>
        </div>

        {/* pied de carte fixe */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            ODJASSA — La référence de l&apos;achat
          </p>
        </div>
      </div>
    </div>
  );
}
