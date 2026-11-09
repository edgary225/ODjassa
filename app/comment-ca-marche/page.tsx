import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Search,
  Store,
  Tags,
} from "lucide-react";
import Entete from "../components/mise-en-page/Entete";
import PiedDePage from "../components/mise-en-page/PiedDePage";

const etapes = [
  {
    numero: "01",
    titre: "Décrivez ce que vous cherchez",
    description:
      "Recherchez directement un produit ou un commerce. Pour une demande plus précise, expliquez votre besoin à l’assistant de recherche avancée.",
    Icone: Search,
  },
  {
    numero: "02",
    titre: "Explorez les résultats",
    description:
      "Parcourez les produits et les commerces trouvés. Ouvrez une fiche pour consulter les informations disponibles sur l’établissement ou le produit.",
    Icone: Store,
  },
  {
    numero: "03",
    titre: "Comparez et prenez contact",
    description:
      "Comparez les offres lorsqu’elles sont disponibles, puis contactez le vendeur ou consultez l’établissement pour vérifier les détails pratiques.",
    Icone: Tags,
  },
];

export default function CommentCaMarchePage() {
  return (
    <>
      <Entete />
      <main className="min-h-screen bg-[#F5F7FA]">
        <section className="bg-[#10243A] px-5 py-16 text-center text-white sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#F39A27]">
            Simple et pratique
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Comment fonctionne ODJASSA ?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Un point de départ pour trouver des produits, comparer les offres
            et découvrir des adresses en Côte d&apos;Ivoire.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {etapes.map(({ numero, titre, description, Icone }) => (
              <article
                key={numero}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-orange-50 text-[#D97706]">
                    <Icone size={22} />
                  </span>
                  <span className="text-sm font-extrabold tracking-widest text-slate-300">
                    {numero}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-extrabold text-[#10243A]">
                  {titre}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#10243A] text-white">
                <MessageCircle size={20} />
              </span>
              <div>
                <h2 className="font-bold text-[#10243A]">
                  Besoin d&apos;aide pour formuler votre recherche ?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  L&apos;assistant peut vous aider à préciser le commerce ou le
                  service que vous cherchez.
                </p>
              </div>
            </div>
            <Link
              href="/recherche?mode=ia"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F39A27] px-5 py-3 text-sm font-bold text-[#10243A] transition hover:bg-orange-400"
            >
              Essayer la recherche avancée
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
