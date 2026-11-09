"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { suivreInteraction } from "@/app/analytics";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Star,
  LoaderCircle,
} from "lucide-react";

type ProduitGoogle = {
  product_id?: string;
  title: string;
  link: string;
  source: string;
  price: string;
  extracted_price?: number;
  thumbnail: string;
  rating?: number;
  reviews?: number;
  delivery?: string;
};

type ReponseRecherche = {
  produits?: ProduitGoogle[];
  erreur?: string;
};

export default function ClientProduit() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const searchParams = useSearchParams();
  const recherche = searchParams.get("q")?.trim() ?? "";

  const [produit, setProduit] = useState<ProduitGoogle | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const rechercheManquante = !recherche;

  useEffect(() => {
    if (!recherche) return;

    const controleur = new AbortController();

    async function chargerProduit() {
      try {
        const reponse = await fetch(
          `/api/recherche?q=${encodeURIComponent(recherche)}`,
          {
            cache: "no-store",
            signal: controleur.signal,
          },
        );

        const donnees: ReponseRecherche = await reponse.json();

        if (!reponse.ok) {
          throw new Error(
            donnees.erreur ?? "Impossible de récupérer ce produit.",
          );
        }

        const resultat = donnees.produits?.find(
          (element) => element.product_id === id,
        );

        if (!resultat) {
          throw new Error(
            "Ce produit n&apos;est plus disponible dans les résultats actuels.",
          );
        }

        suivreInteraction("product_viewed", {
          product_source: resultat.source,
        });
        setProduit(resultat);
      } catch (error) {
        if (controleur.signal.aborted) return;

        setErreur(
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue.",
        );
      } finally {
        if (!controleur.signal.aborted) {
          setChargement(false);
        }
      }
    }

    chargerProduit();

    return () => controleur.abort();
  }, [id, recherche]);

  if (chargement && !rechercheManquante) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F5F7FA]">
        <LoaderCircle size={35} className="animate-spin text-[#F39A27]" />

        <p className="mt-4 font-semibold text-[#10243A]">
          Chargement du produit...
        </p>
      </main>
    );
  }

  if (rechercheManquante || erreur || !produit) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F5F7FA] px-5 text-center">
        <Globe size={40} className="mb-4 text-slate-300" />

        <h1 className="text-xl font-extrabold text-[#10243A]">
          Produit introuvable
        </h1>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {rechercheManquante
            ? "La recherche d&apos;origine est introuvable."
            : erreur || "Impossible de retrouver ce produit."}
        </p>

        <Link
          href="/"
          className="mt-6 rounded-lg bg-[#10243A] px-5 py-3 text-sm font-bold text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/recherche?q=${encodeURIComponent(recherche)}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#10243A]"
        >
          <ArrowLeft size={17} />
          Retour aux résultats
        </Link>

        <div className="grid gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-slate-50 p-6 md:min-h-[420px]">
            {produit.thumbnail ? (
              <img
                src={produit.thumbnail}
                alt={produit.title}
                className="max-h-[380px] w-full object-contain"
              />
            ) : (
              <Globe size={64} className="text-slate-300" />
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F39A27]">
              {produit.source}
            </p>

            <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#10243A] md:text-3xl">
              {produit.title}
            </h1>

            <p className="mt-6 text-2xl font-extrabold text-[#10243A]">
              {produit.price}
            </p>

            {produit.rating !== undefined && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Star size={17} className="fill-[#F39A27] text-[#F39A27]" />

                <span className="font-semibold">{produit.rating}</span>

                {produit.reviews !== undefined && (
                  <span>({produit.reviews.toLocaleString("fr-FR")} avis)</span>
                )}
              </div>
            )}

            {produit.delivery && (
              <div className="mt-5 rounded-lg bg-[#F5F7FA] p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Livraison
                </p>

                <p className="mt-1 text-sm text-[#10243A]">
                  {produit.delivery}
                </p>
              </div>
            )}

            <div className="mt-8">
              {produit.link ? (
                <a
                  href={produit.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    suivreInteraction("external_offer_clicked", {
                      product_source: produit.source,
                    })
                  }
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F39A27] px-6 py-3 text-sm font-extrabold text-[#10243A] transition hover:bg-orange-400"
                >
                  Voir l&apos;offre
                  <ExternalLink size={17} />
                </a>
              ) : (
                <p className="text-sm text-slate-500">
                  Aucun lien marchand disponible pour ce produit.
                </p>
              )}
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Les informations et le prix sont fournis par Google Shopping.
              Consultez le vendeur pour vérifier les conditions de vente.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
