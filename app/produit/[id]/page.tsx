import { Suspense } from "react";
import Entete from "@/app/components/mise-en-page/Entete";
import PiedDePage from "@/app/components/mise-en-page/PiedDePage";
import ClientProduit from "./ClientProduit";

export default function PageProduit() {
  return (
    <>
      <Entete />

      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
            Chargement du produit...
          </main>
        }
      >
        <ClientProduit />
      </Suspense>

      <PiedDePage />
    </>
  );
}
