import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHireModal } from '@/components/HireModal'

const navLinks = [
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
]

function scrollTo(id: string) {
  const el = document.querySelector(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { openModal } = useHireModal()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Section anchors live on the home page; leave other routes first and wait for the page transition.
  function goToSection(id: string) {
    if (pathname === '/') return scrollTo(id)
    navigate('/')
    setTimeout(() => scrollTo(id), 500)
  }

  function goHome() {
    if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' })
    else navigate('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-[env(safe-area-inset-top)]',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-[1400px] flex h-16 md:h-20 items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <button
          onClick={goHome}
          className="flex items-center gap-2.5 font-display font-bold text-sm tracking-widest uppercase hover:opacity-60 transition-opacity"
        >
          <span className="h-7 w-7 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center select-none">
            HV
          </span>
          <span className="hidden sm:inline">Viet Anh</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.button
              key={link.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i + 0.2 }}
              onClick={() => goToSection(link.href)}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </motion.button>
          ))}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * navLinks.length + 0.2 }}
          >
            <Link
              to="/roadmap"
              className={cn(
                'text-xs font-semibold uppercase tracking-widest transition-colors',
                pathname === '/roadmap' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Roadmap
            </Link>
          </motion.div>
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 hover:bg-foreground/10 transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Hire Me */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openModal}
            className="hidden md:flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Hire Me
          </motion.button>

          {/* Mobile toggle */}
          <button
            className="md:hidden rounded-full p-2 hover:bg-foreground/10 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mobileOpen ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <nav className="flex flex-col px-6 py-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { goToSection(link.href); setMobileOpen(false) }}
                  className="text-left py-3.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground border-b border-border/50 last:border-0 transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <Link
                to="/roadmap"
                onClick={() => setMobileOpen(false)}
                className="py-3.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Roadmap
              </Link>
              <button
                onClick={() => { openModal(); setMobileOpen(false) }}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-widest text-background"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Hire Me Now
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
