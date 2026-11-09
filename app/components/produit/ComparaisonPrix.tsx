import { Store, ExternalLink, TrendingDown } from "lucide-react";

type Offre = {
  id: number;
  boutique: string;
  prix: number;
  ville: string;
  type: "odjassa" | "externe";
  url?: string;
};

type Props = {
  offres: Offre[];
};

export default function ComparaisonPrix({ offres }: Props) {
  const offresTriees = [...offres].sort((a, b) => a.prix - b.prix);

  if (offresTriees.length === 0) {
    return null;
  }

  const meilleurPrix = offresTriees[0].prix;

  return (
    <section className="mt-16">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <TrendingDown size={21} className="text-[#F39A27]" />

          <h2 className="text-2xl font-extrabold text-[#10243A]">
            Comparez les prix
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Découvrez les différentes offres disponibles pour ce produit.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-b border-slate-100 bg-[#F5F7FA] px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400 sm:grid">
          <span>Boutique</span>
          <span>Localisation</span>
          <span>Prix</span>
          <span>Offre</span>
        </div>

        <div className="divide-y divide-slate-100">
          {offresTriees.map((offre, index) => (
            <div
              key={offre.id}
              className="grid grid-cols-1 items-center gap-4 px-5 py-5 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:px-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <Store size={19} className="text-[#F39A27]" />
                </div>

                <div>
                  <p className="font-bold text-[#10243A]">{offre.boutique}</p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {offre.type === "odjassa"
                        ? "Vendeur ODJASSA"
                        : "Offre externe"}
                    </span>

                    {index === 0 && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                        Meilleur prix
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-500">{offre.ville}</div>

              <p className="text-lg font-extrabold text-[#10243A]">
                {offre.prix.toLocaleString("fr-FR")} FCFA
              </p>

              {offre.type === "odjassa" ? (
                <span className="inline-flex w-fit items-center rounded-lg bg-[#10243A] px-4 py-2 text-xs font-bold text-white">
                  Sur ODJASSA
                </span>
              ) : (
                <a
                  href={offre.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-[#10243A] transition hover:border-[#F39A27] hover:text-[#F39A27]"
                >
                  Voir l&apos;offre
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Les prix sont fournis à titre de démonstration. Vérifiez leur
        disponibilité auprès du vendeur.
      </p>

      <p className="mt-2 text-xs text-slate-500">
        Meilleur prix affiché : {meilleurPrix.toLocaleString("fr-FR")} FCFA.
      </p>
    </section>
  );
}
