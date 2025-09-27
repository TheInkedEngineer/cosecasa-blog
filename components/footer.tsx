import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/30 py-12 px-4 mt-16">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif text-primary">
            cosecasa.it
          </Link>
          <p className="text-muted-foreground mt-2 text-balance">
            Un diario personale di bellezza, cultura e vita quotidiana
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-medium mb-3 text-foreground">Categorie</h4>
            <div className="space-y-2">
              <Link href="/cose" className="block text-muted-foreground hover:text-primary transition-colors">
                cose
              </Link>
              <Link href="/casa" className="block text-muted-foreground hover:text-primary transition-colors">
                casa
              </Link>
              <Link href="/persone" className="block text-muted-foreground hover:text-primary transition-colors">
                persone
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-foreground">Informazioni</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                Chi sono
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contatti
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-foreground">Seguimi</h4>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Instagram
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Pinterest
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 cosecasa.it. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
