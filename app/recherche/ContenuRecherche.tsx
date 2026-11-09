"use client";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  Search,
} from "lucide-react";

import BarreRecherche from "./BarreRecherche";
import OffresExternes, { type MagasinGoogle } from "./OffresExternes";
import ModalDetailsCommerce from "./ModalDetailsCommerce";
import { suivreInteraction } from "@/app/analytics";

type Props = {
  rechercheInitiale: string;
  localisationInitiale: string;
};

type ReponseRecherche = {
  recherche?: string;
  total?: number;
  magasins?: MagasinGoogle[];
  erreur?: string;
};
export default function ContenuRecherche({
  rechercheInitiale,
  localisationInitiale,
}: Props) {
  const recherche = rechercheInitiale.trim();
  const localisation = localisationInitiale.trim();

  const [magasins, setMagasins] = useState<MagasinGoogle[]>([]);
  const [erreur, setErreur] = useState("");
  const [rechercheChargee, setRechercheChargee] = useState("");
  const [chargement, setChargement] = useState(false);

  const [magasinSelectionne, setMagasinSelectionne] =
    useState<MagasinGoogle | null>(null);

  useEffect(() => {
    if (!recherche) return;

    const controleur = new AbortController();

    async function rechercherMagasins() {
      setChargement(true);
      setErreur("");
      setMagasins([]);
      setRechercheChargee("");

      try {
        const parametres = new URLSearchParams({ q: recherche });

        const reponse = await fetch(`/api/recherche?${parametres.toString()}`, {
          cache: "no-store",
          signal: controleur.signal,
        });

        const donnees: ReponseRecherche = await reponse.json();

        if (!reponse.ok) {
          throw new Error(
            donnees.erreur ?? "Impossible de récupérer les établissements.",
          );
        }

        setMagasins(Array.isArray(donnees.magasins) ? donnees.magasins : []);

        suivreInteraction("local_search_completed", {
          result_count: Array.isArray(donnees.magasins)
            ? donnees.magasins.length
            : 0,
        });
        setRechercheChargee(recherche);
      } catch (error) {
        if (controleur.signal.aborted) return;

        suivreInteraction("local_search_failed");
        setErreur(
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue.",
        );

        setRechercheChargee(recherche);
      } finally {
        if (!controleur.signal.aborted) {
          setChargement(false);
        }
      }
    }

    rechercherMagasins();

    return () => controleur.abort();
  }, [recherche]);

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#10243A]">
            Résultats de recherche
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Trouvez les commerces et établissements qui correspondent à votre
            recherche.
          </p>

          <div className="mt-6">
            <BarreRecherche recherche={rechercheInitiale} />
          </div>
        </div>

        {recherche && (
          <p className="mb-8 text-sm text-slate-500">
            Résultats pour{" "}
            <span className="font-bold text-[#10243A]">« {recherche} »</span>
            {localisation && (
              <>
                {" "}
                à{" "}
                <span className="font-bold text-[#10243A]">{localisation}</span>
              </>
            )}
          </p>
        )}

        {chargement && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
            <LoaderCircle size={35} className="animate-spin text-[#F39A27]" />

            <p className="font-semibold text-[#10243A]">
              Recherche des commerces en cours...
            </p>

            <p className="text-sm text-slate-500">
              Nous recherchons les établissements correspondants.
            </p>
          </div>
        )}

        {!chargement && erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="shrink-0 text-red-500" size={22} />

              <h2 className="font-bold text-red-700">
                Impossible de charger les résultats
              </h2>
            </div>

            <p className="mt-3 text-sm text-red-600">{erreur}</p>
          </div>
        )}

        {!chargement && !erreur && rechercheChargee === recherche && (
          <div className="min-w-0">
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#10243A]">
                {magasins.length} commerce(s) trouvé(s)
              </p>
            </div>

            {magasins.length > 0 ? (
              <OffresExternes
                magasins={magasins}
                onSelectionner={setMagasinSelectionne}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <Search size={35} className="mx-auto text-slate-300" />

                <h2 className="mt-4 font-bold text-[#10243A]">
                  Aucun commerce trouvé
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Essayez une autre recherche ou une autre catégorie.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {magasinSelectionne && (
        <ModalDetailsCommerce
          key={magasinSelectionne.place_id}
          commerce={magasinSelectionne}
          onClose={() => setMagasinSelectionne(null)}
        />
      )}
    </main>
  );
}
