export interface PostMetadata {
  title: string
  excerpt: string
  date: string
  category: "cose" | "casa" | "persone"
  subcategory: string
  tags: string[]
  image?: string
  author?: string
  featured?: boolean
}

export interface Post {
  slug: string
  metadata: PostMetadata
  content: string
}

// Static mock data for the blog
const mockPosts: Post[] = [
  {
    slug: "bellezza-mercati-pulci",
    metadata: {
      title: "La Bellezza Nascosta dei Mercati delle Pulci",
      excerpt:
        "Scoprire tesori dimenticati tra le bancarelle dei mercati delle pulci italiani, dove ogni oggetto racconta una storia.",
      date: "2024-01-15",
      category: "cose",
      subcategory: "antiquariato",
      tags: ["mercati", "antiquariato", "vintage", "tesori"],
      image: "/elegant-art-gallery.png",
      author: "Cosecasa",
      featured: true,
    },
    content: `<p>I mercati delle pulci sono luoghi magici dove il tempo sembra essersi fermato. Tra le bancarelle polverose si nascondono tesori dimenticati che aspettano solo di essere scoperti da occhi attenti e cuori sensibili.</p>

<h2>L'Arte del Cercare</h2>
<p>Camminare tra i mercati delle pulci richiede pazienza e intuito. Non si tratta solo di trovare oggetti belli, ma di riconoscere quelli che hanno un'anima, una storia da raccontare.</p>

<h3>Cosa Cercare</h3>
<ul>
<li><strong>Ceramiche antiche</strong> con piccole imperfezioni che ne raccontano l'uso</li>
<li><strong>Libri ingialliti</strong> con dediche scritte a mano</li>
<li><strong>Gioielli vintage</strong> che portano con sé ricordi di altre epoche</li>
<li><strong>Tessuti pregiati</strong> che mostrano la maestria artigianale del passato</li>
</ul>

<h2>I Miei Mercati del Cuore</h2>

<h3>Mercato di Sant'Ambrogio, Milano</h3>
<p>Un piccolo gioiello nascosto nel cuore di Milano, dove i venditori conoscono la storia di ogni pezzo.</p>

<h3>Mercato delle Pulci di Porta Portese, Roma</h3>
<p>Il più famoso d'Italia, un labirinto di bancarelle dove perdersi è un piacere.</p>

<p>La bellezza dei mercati delle pulci sta nella loro capacità di farci viaggiare nel tempo, di farci toccare con mano la storia e di regalarci emozioni inaspettate.</p>`,
  },
  {
    slug: "ristrutturare-bagno-perfetto",
    metadata: {
      title: "Come Ristrutturare il Bagno Perfetto",
      excerpt:
        "Guida completa per trasformare il vostro bagno in un'oasi di benessere, combinando funzionalità ed eleganza.",
      date: "2024-01-10",
      category: "casa",
      subcategory: "ristrutturazione",
      tags: ["bagno", "ristrutturazione", "design", "benessere"],
      image: "/placeholder-u6csp.png",
      author: "Cosecasa",
      featured: true,
    },
    content: `<p>Il bagno è diventato molto più di un semplice spazio funzionale: è il nostro rifugio quotidiano, il luogo dove iniziamo e concludiamo le nostre giornate. Ristrutturarlo richiede attenzione ai dettagli e una visione d'insieme.</p>

<h2>Pianificazione: Il Primo Passo</h2>
<p>Prima di iniziare qualsiasi lavoro, è fondamentale avere un progetto chiaro. Considerate:</p>
<ul>
<li><strong>Lo spazio disponibile</strong> e come ottimizzarlo</li>
<li><strong>Le vostre abitudini</strong> quotidiane</li>
<li><strong>Il budget</strong> a disposizione</li>
<li><strong>Lo stile</strong> che desiderate</li>
</ul>

<h2>Elementi Chiave del Design</h2>

<h3>Illuminazione</h3>
<p>Una buona illuminazione trasforma completamente l'ambiente. Combinate:</p>
<ul>
<li>Luce generale per l'illuminazione d'ambiente</li>
<li>Luce funzionale per lo specchio</li>
<li>Luce d'accento per creare atmosfera</li>
</ul>

<h3>Materiali</h3>
<p>Scegliete materiali che uniscano bellezza e praticità:</p>
<ul>
<li><strong>Ceramica</strong> per pavimenti e rivestimenti</li>
<li><strong>Pietra naturale</strong> per un tocco di eleganza</li>
<li><strong>Legno trattato</strong> per calore e naturalezza</li>
</ul>

<p>Ricordate: un bagno ben progettato non solo aumenta il valore della casa, ma migliora significativamente la qualità della vita quotidiana.</p>`,
  },
  {
    slug: "incontri-firenze",
    metadata: {
      title: "Incontri Speciali nelle Strade di Firenze",
      excerpt:
        "Le persone che rendono Firenze unica: artigiani, artisti e custodi di tradizioni che mantengono viva l'anima della città.",
      date: "2024-01-05",
      category: "persone",
      subcategory: "ritratti",
      tags: ["Firenze", "artigiani", "tradizioni", "incontri"],
      image: "/elegant-italian-woman-portrait.jpg",
      author: "Cosecasa",
      featured: true,
    },
    content: `<p>Firenze non è solo monumenti e musei. È soprattutto le persone che la abitano, che la mantengono viva con le loro storie, le loro passioni, i loro mestieri tramandati di generazione in generazione.</p>

<h2>Maestro Giuliano, Restauratore di Libri Antichi</h2>
<p>Nel suo piccolo laboratorio in Oltrarno, Maestro Giuliano lavora con la stessa dedizione dei suoi predecessori rinascimentali. Le sue mani, macchiate d'inchiostro e colla, ridanno vita a volumi che sembravano perduti per sempre.</p>

<p><em>"Ogni libro ha la sua storia"</em>, mi dice mentre accarezza delicatamente le pagine di un manoscritto del '600. <em>"Il mio compito è permettere a quella storia di continuare."</em></p>

<h2>Signora Elena, Fioraia di Santo Spirito</h2>
<p>Da quarant'anni, ogni mattina alle sei, la Signora Elena apre il suo piccolo negozio di fiori in Piazza Santo Spirito. Conosce tutti nel quartiere, ricorda i compleanni, le ricorrenze, i momenti importanti di ogni famiglia.</p>

<p>I suoi bouquet non sono solo composizioni floreali, sono piccole opere d'arte che parlano il linguaggio del cuore.</p>

<h2>Marco, Giovane Orafo</h2>
<p>A soli trent'anni, Marco ha già conquistato una clientela internazionale con i suoi gioielli unici. Ha imparato l'arte orafa dal nonno e oggi la reinterpreta con sensibilità contemporanea.</p>

<p>Camminando per le sue strade, non dimenticate di alzare lo sguardo dai monumenti: le persone che incontrerete vi regaleranno le emozioni più autentiche.</p>`,
  },
  {
    slug: "design-cucina-italiana",
    metadata: {
      title: "Il Design della Cucina Italiana Contemporanea",
      excerpt:
        "Come creare una cucina che unisce tradizione italiana e modernità, dove funzionalità e bellezza si incontrano.",
      date: "2024-01-20",
      category: "casa",
      subcategory: "design",
      tags: ["cucina", "design", "italiano", "contemporaneo"],
      image: "/placeholder-u6csp.png",
      author: "Cosecasa",
      featured: false,
    },
    content: `<p>La cucina italiana contemporanea rappresenta l'evoluzione naturale della tradizione culinaria del nostro paese, trasformandosi in spazi che celebrano sia l'arte del cucinare che quella del vivere insieme.</p>

<h2>I Principi del Design Italiano</h2>

<h3>Funzionalità Prima di Tutto</h3>
<p>Una cucina italiana deve essere prima di tutto funzionale. Ogni elemento deve avere uno scopo preciso e contribuire all'efficienza del lavoro culinario.</p>

<h3>Materiali Naturali</h3>
<ul>
<li><strong>Marmo</strong> per i piani di lavoro</li>
<li><strong>Legno massello</strong> per mobili e dettagli</li>
<li><strong>Acciaio inox</strong> per elettrodomestici e finiture</li>
<li><strong>Ceramica artigianale</strong> per rivestimenti</li>
</ul>

<p>La cucina italiana contemporanea non è solo un luogo dove si prepara il cibo, ma il cuore pulsante della casa, dove si creano ricordi e si mantengono vive le tradizioni.</p>`,
  },
  {
    slug: "arte-ceramica-italiana",
    metadata: {
      title: "L'Arte della Ceramica Italiana: Tradizione e Innovazione",
      excerpt:
        "Un viaggio attraverso le tradizioni ceramiche italiane, dalle antiche tecniche agli artisti contemporanei.",
      date: "2024-01-25",
      category: "cose",
      subcategory: "arte",
      tags: ["ceramica", "arte", "tradizione", "artigianato"],
      image: "/elegant-art-gallery.png",
      author: "Cosecasa",
      featured: false,
    },
    content: `<p>L'Italia vanta una delle tradizioni ceramiche più ricche e variegate al mondo. Dalle maioliche rinascimentali alle creazioni contemporanee, la ceramica italiana continua a evolversi mantenendo vive le sue radici storiche.</p>

<h2>Le Grandi Tradizioni Regionali</h2>

<h3>Faenza - La Culla della Maiolica</h3>
<p>Faenza ha dato il nome alla faience francese e continua a essere un centro di eccellenza ceramica. Le sue maioliche sono caratterizzate da:</p>
<ul>
<li>Decorazioni raffinate</li>
<li>Colori vivaci e duraturi</li>
<li>Tecniche tramandate da secoli</li>
</ul>

<h3>Deruta - L'Arte Umbra</h3>
<p>Le ceramiche di Deruta sono riconoscibili per:</p>
<ul>
<li>Il caratteristico blu cobalto</li>
<li>Decorazioni geometriche e floreali</li>
<li>La lucentezza particolare dello smalto</li>
</ul>

<p>La ceramica italiana rappresenta un ponte perfetto tra passato e presente, dove l'antica sapienza artigianale incontra la creatività contemporanea.</p>`,
  },
]

export async function getPostBySlug(category: string, slug: string): Promise<Post | null> {
  const post = mockPosts.find((p) => p.metadata.category === category && p.slug === slug)
  return post || null
}

export function getAllPosts(): Post[] {
  return mockPosts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
}

export function getPostsByCategory(category: string): Post[] {
  return mockPosts.filter((post) => post.metadata.category === category)
}

export function getPostsBySubcategory(category: string, subcategory: string): Post[] {
  return mockPosts.filter((post) => post.metadata.category === category && post.metadata.subcategory === subcategory)
}

export function getFeaturedPosts(limit = 6): Post[] {
  return mockPosts.filter((post) => post.metadata.featured).slice(0, limit)
}

export function getRelatedPosts(currentPost: Post, limit = 3): Post[] {
  const otherPosts = mockPosts.filter((post) => post.slug !== currentPost.slug)

  // Find posts with matching tags or same subcategory
  const relatedPosts = otherPosts.filter((post) => {
    const hasMatchingTags = post.metadata.tags.some((tag) => currentPost.metadata.tags.includes(tag))
    const sameSubcategory = post.metadata.subcategory === currentPost.metadata.subcategory

    return hasMatchingTags || sameSubcategory
  })

  // If not enough related posts, fill with posts from same category
  if (relatedPosts.length < limit) {
    const categoryPosts = otherPosts.filter(
      (post) => post.metadata.category === currentPost.metadata.category && !relatedPosts.includes(post),
    )
    relatedPosts.push(...categoryPosts.slice(0, limit - relatedPosts.length))
  }

  return relatedPosts.slice(0, limit)
}

export function getSubcategories(category: string): string[] {
  const posts = getPostsByCategory(category)
  const subcategories = [...new Set(posts.map((post) => post.metadata.subcategory))]
  return subcategories.sort()
}

export function getAllTags(): string[] {
  const tags = mockPosts.flatMap((post) => post.metadata.tags)
  return [...new Set(tags)].sort()
}

export function getPostsByTag(tag: string): Post[] {
  return mockPosts.filter((post) => post.metadata.tags.includes(tag))
}
