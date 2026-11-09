import { Suspense } from "react";
import Entete from "../components/mise-en-page/Entete";
import PiedDePage from "../components/mise-en-page/PiedDePage";
import ChatIA from "./ChatIA";
import ContenuRecherche from "./ContenuRecherche";

type Props = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    mode?: string;
  }>;
};

export default function PageRecherche({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F5F7FA] px-5 py-20 text-center">
          Chargement des résultats...
        </main>
      }
    >
      <ResultatsRecherche searchParams={searchParams} />
    </Suspense>
  );
}

async function ResultatsRecherche({ searchParams }: Props) {
  const params = await searchParams;

  const recherche = params.q?.trim() ?? "";
  const localisation = params.location?.trim() ?? "";

  if (params.mode === "ia") {
    return <ChatIA rechercheInitiale={recherche} />;
  }

  return (
    <>
      <Entete />
      <ContenuRecherche
        rechercheInitiale={recherche}
        localisationInitiale={localisation}
      />
      <PiedDePage />
    </>
  );
}
