import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Title } from "@/components/ui/title"
import { spacing, typography } from "@/lib/design-system"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className={spacing.section}>
          <div className={cn(spacing.containerNarrow)}>
            <div className="text-center mb-12">
              <Title as="h1" align="center" margin="sm">
                Chi sono
              </Title>
              <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden">
                <img
                  src="/elegant-italian-woman-portrait.jpg"
                  alt="Maria - Autrice del blog"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none mx-auto
              prose-headings:font-serif prose-headings:text-foreground
              prose-p:text-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            >
              <p className={cn(typography.sectionSubtitle, 'text-center mb-8 text-balance')}>
                Ciao, sono Maria. Benvenuti nel mio piccolo angolo di internet dove condivido le mie passioni per la
                bellezza, l'arte e la vita quotidiana.
              </p>

              <h2>La mia storia</h2>
              <p>
                A cinquant'anni, ho imparato che la bellezza si trova nei dettagli più semplici: in un raggio di sole
                che filtra attraverso le persiane, nel profumo del caffè del mattino, nella texture di un tessuto antico
                trovato al mercato delle pulci.
              </p>

              <p>
                Questo blog nasce dal desiderio di condividere queste piccole scoperte quotidiane, di raccontare storie
                di oggetti, luoghi e persone che hanno catturato la mia attenzione e il mio cuore.
              </p>

              <h2>Le mie passioni</h2>
              <p>
                <strong>Cose:</strong> Amo gli oggetti che raccontano storie. Che si tratti di un pezzo d'antiquariato,
                di un libro d'arte o di un semplice vaso di ceramica, ogni oggetto ha un'anima e una storia da
                raccontare.
              </p>

              <p>
                <strong>Casa:</strong> La casa è il nostro rifugio, il luogo dove esprimiamo la nostra personalità. Mi
                appassiona il design d'interni, l'architettura, e tutto ciò che può trasformare uno spazio in un luogo
                dell'anima.
              </p>

              <p>
                <strong>Persone:</strong> I viaggi mi hanno insegnato che le persone sono il vero tesoro di ogni
                esperienza. Ogni incontro è un'opportunità di crescita, ogni conversazione un ponte verso nuove
                prospettive.
              </p>

              <h2>La mia filosofia</h2>
              <p>
                Credo che la bellezza non sia un lusso, ma una necessità. Non serve spendere fortune per circondarsi di
                cose belle: basta saper guardare con occhi curiosi e cuore aperto.
              </p>

              <p>
                In un mondo che corre sempre più veloce, questo blog vuole essere un invito a rallentare, a osservare, a
                gustare i piccoli piaceri della vita quotidiana.
              </p>

              <div className="text-center mt-12 p-8 bg-muted/30 rounded-lg">
                <p className="text-lg italic text-muted-foreground">
                  "La bellezza salverà il mondo, ma solo se sapremo riconoscerla nelle piccole cose di ogni giorno."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export const metadata = {
  title: "Chi sono - cosecasa.it",
  description:
    "Scopri la storia di Maria, l'autrice di cosecasa.it, e la sua passione per la bellezza, l'arte e la vita quotidiana.",
}
