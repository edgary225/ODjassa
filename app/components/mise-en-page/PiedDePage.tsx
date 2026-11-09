import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";

const liensExplorer = [
  { nom: "Accueil", lien: "/" },
  { nom: "Rechercher", lien: "/recherche" },
  { nom: "Recherche avancée", lien: "/recherche?mode=ia" },
];

const anneeCopyright = 2026;

export default function PiedDePage() {
  return (
    <footer className="bg-[#10243A] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/logo.png"
                alt="ODJASSA"
                width={160}
                height={55}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Trouvez des produits, comparez les offres et découvrez des
              commerces et services près de vous, en Côte d&apos;Ivoire.
            </p>
            <Link
              href="/comment-ca-marche"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#F39A27] transition hover:text-orange-300"
            >
              Découvrir ODJASSA
              <ArrowRight size={16} />
            </Link>
          </div>

          <nav aria-label="Explorer ODJASSA">
            <h2 className="mb-5 text-sm font-bold">Explorer</h2>
            <ul className="space-y-4">
              {liensExplorer.map((item) => (
                <li key={item.nom}>
                  <Link
                    href={item.lien}
                    className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-[#F39A27]"
                  >
                    {item.nom === "Recherche avancée" ? (
                      <Sparkles size={15} />
                    ) : (
                      <Search size={15} />
                    )}
                    {item.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-5 text-sm font-bold">Comment ça marche</h2>
            <p className="text-sm leading-6 text-slate-300">
              Lancez une recherche, consultez les fiches des établissements et
              explorez les offres disponibles.
            </p>
            <Link
              href="/comment-ca-marche"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-[#F39A27]"
            >
              Voir les étapes
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {anneeCopyright} ODJASSA. Tous droits réservés.</p>
          <p className="inline-flex items-center gap-2">
            <MapPin size={14} className="text-[#F39A27]" />
            Pensé pour vos recherches en Côte d&apos;Ivoire.
          </p>
        </div>
      </div>
    </footer>
  );
}
