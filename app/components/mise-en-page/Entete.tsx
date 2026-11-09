import Link from "next/link";
import Image from "next/image";

export default function Entete() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="ODJASSA - La référence de l'achat"
            width={900}
            height={155}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link
            href="/"
            className="text-[#10243A] transition hover:text-[#F39A27]"
          >
            Accueil
          </Link>

          <Link
            href="/comment-ca-marche"
            className="transition hover:text-[#F39A27]"
          >
            Comment ça marche
          </Link>

          <Link href="/contact" className="transition hover:text-[#F39A27]">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
