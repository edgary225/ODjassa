import Entete from "./components/mise-en-page/Entete";
import SectionRecherche from "./components/acceuil/SectionRecherche";
import PiedDePage from "./components/mise-en-page/PiedDePage";
export default function Accueil() {
  return (
    <main className="min-h-screen bg-white">
      <Entete />
      <SectionRecherche />
      <PiedDePage />
    </main>
  );
}
