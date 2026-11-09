import Link from "next/link";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";

export default function SectionRecherche() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#10243A]">
      {/* image de fond */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/fond-acceuil.png')",
        }}
      />

      {/* voile pour améliorer la lisibilité */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#10243A]/65 via-[#10243A]/45 to-[#10243A]/70" />

      {/* contenu */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 py-24 text-center sm:px-8">
        {/* indication */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:text-xs">
          <MapPin size={14} className="text-[#F39A27]" />
          Votre guide local en Côte d&pos;Ivoire
        </div>

        {/* titre principal */}
        <h1 className="max-w-5xl text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Tout ce que vous cherchez,
          <span className="mt-2 block text-[#F39A27]">près de vous.</span>
        </h1>

        {/* description */}
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/85 sm:text-base md:text-lg">
          Découvrez les commerces, restaurants, services et lieux utiles autour
          de vous. Les bonnes adresses sont à portée de recherche.
        </p>

        {/* catégories */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {["Commerces", "Restaurants", "Services", "Lieux utiles"].map(
            (categorie) => (
              <span
                key={categorie}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md sm:text-sm"
              >
                {categorie}
              </span>
            ),
          )}
        </div>

        {/* barre de recherche */}
        <div className="mx-auto mt-10 w-full max-w-3xl">
          <form
            action="/recherche"
            method="GET"
            className="flex w-full flex-col gap-2 rounded-2xl border border-white/30 bg-white p-2 shadow-2xl shadow-black/20 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Search size={22} className="shrink-0 text-slate-400" />

              <input
                type="search"
                name="q"
                placeholder="Que recherchez-vous ? Un commerce, un service..."
                aria-label="Que recherchez-vous ?"
                required
                className="h-12 w-full min-w-0 bg-transparent text-sm text-[#10243A] outline-none placeholder:text-slate-400 sm:text-base"
              />
            </div>

            <button
              type="submit"
              aria-label="Rechercher"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F39A27] text-[#10243A] shadow-lg transition hover:bg-orange-400 active:scale-[0.98]"
            >
              <Search size={21} />
            </button>
          </form>

          <Link
            href="/recherche?mode=ia"
            className="mx-auto mt-4 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white px-5 py-3 text-left text-[#10243A] shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-[#D97706]">
              <Sparkles size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold">Recherche avancée</span>
              <span className="block text-xs font-medium text-slate-500">
                Décrivez votre besoin à notre assistant
              </span>
            </span>
            <ArrowRight size={17} className="ml-1 text-[#D97706]" />
          </Link>
        </div>

        {/* texte sous la recherche */}
        <p className="mt-5 text-xs font-medium text-white/75 sm:text-sm">
          Explorez. Découvrez. Trouvez.
        </p>
      </div>
    </section>
  );
}
