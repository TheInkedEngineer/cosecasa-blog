"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif text-primary hover:text-foreground transition-colors">
            cosecasa.it
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/cose" className="text-foreground hover:text-primary transition-colors font-medium">
              cose
            </Link>
            <Link href="/casa" className="text-foreground hover:text-primary transition-colors font-medium">
              casa
            </Link>
            <Link href="/persone" className="text-foreground hover:text-primary transition-colors font-medium">
              persone
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              Chi sono
            </Link>
            <Link href="/search">
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/cose"
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                cose
              </Link>
              <Link
                href="/casa"
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                casa
              </Link>
              <Link
                href="/persone"
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                persone
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Chi sono
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
