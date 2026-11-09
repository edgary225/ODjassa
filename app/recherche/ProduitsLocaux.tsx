import Image from "next/image";
import Link from "next/link";
import { Store, ArrowUpRight } from "lucide-react";

const produits = [
  {
    id: 1,
    nom: "iPhone 15 Pro",
    description: "128 Go · Titane naturel",
    prix: 650000,
    boutique: "Tech Store",
    categorie: "Téléphones et accessoires",
    image: "/images/produits/produit_iphone.jpg",
  },
  {
    id: 2,
    nom: "Ordinateur portable",
    description: "Intel Core i5 · 16 Go RAM",
    prix: 425000,
    boutique: "Digital Shop",
    categorie: "Informatique",
    image: "/images/produits/produit_ordinateur.jpg",
  },
  {
    id: 3,
    nom: "Baskets sport",
    description: "Confort et style au quotidien",
    prix: 35000,
    boutique: "Mode & Style",
    categorie: "Mode et chaussures",
    image: "/images/produits/produit_baskets.jpg",
  },
  {
    id: 4,
    nom: "Montre élégante",
    description: "Design classique",
    prix: 45000,
    boutique: "Time Store",
    categorie: "Montres",
    image: "/images/produits/produit_montre.jpg",
  },
];

type Filtres = {
  categorie: string;
  prixMin: string;
  prixMax: string;
  tri: string;
};

type Props = {
  recherche: string;
  filtres: Filtres;
};

export default function ProduitsLocaux({ recherche, filtres }: Props) {
  const resultat = produits
    .filter((produit) => {
      const correspondRecherche =
        `${produit.nom} ${produit.description} ${produit.categorie} ${produit.boutique}`
          .toLowerCase()
          .includes(recherche.toLowerCase());

      const correspondCategorie =
        filtres.categorie === "Toutes les catégories" ||
        produit.categorie === filtres.categorie;

      const correspondPrixMin =
        !filtres.prixMin || produit.prix >= Number(filtres.prixMin);

      const correspondPrixMax =
        !filtres.prixMax || produit.prix <= Number(filtres.prixMax);

      return (
        correspondRecherche &&
        correspondCategorie &&
        correspondPrixMin &&
        correspondPrixMax
      );
    })
    .sort((a, b) => {
      if (filtres.tri === "prix-croissant") {
        return a.prix - b.prix;
      }

      if (filtres.tri === "prix-decroissant") {
        return b.prix - a.prix;
      }

      return 0;
    });

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Store size={20} className="text-[#F39A27]" />

            <h2 className="text-xl font-extrabold text-[#10243A]">
              Offres de nos vendeurs
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Découvrez les produits disponibles sur ODJASSA.
          </p>
        </div>

        <span className="text-sm font-semibold text-slate-400">
          {resultat.length} résultat(s)
        </span>
      </div>

      {resultat.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resultat.map((produit) => (
            <article
              key={produit.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#F39A27]/40 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <Link href={`/produit/${produit.id}`} className="block">
                <div className="relative aspect-[4/3] max-h-48 overflow-hidden bg-slate-100">
                  <Image
                    src={produit.image}
                    alt={produit.nom}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#F39A27]">
                    {produit.categorie}
                  </span>

                  <h3 className="mt-2 text-base font-bold text-[#10243A]">
                    {produit.nom}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {produit.description}
                  </p>

                  <p className="mt-4 text-base font-extrabold text-[#10243A]">
                    {produit.prix.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Store size={15} className="text-[#F39A27]" />
                  {produit.boutique}
                </div>

                <Link
                  href={`/produit/${produit.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#10243A] transition hover:text-[#F39A27]"
                >
                  Voir
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
          <Store size={32} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-bold text-[#10243A]">
            Aucun produit trouvé
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Essayez de modifier votre recherche ou vos filtres.
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Les produits et les prix affichés sont des données fictives de
        démonstration.
      </p>
    </section>
  );
}
