import { motion } from 'framer-motion'

const MARQUEE_TEXT = 'VIET ANH'
const SEPARATOR = '·'

export function Footer() {
  // Enough repeats so the marquee fills more than 2× any viewport width
  const items = Array.from({ length: 12 }, (_, i) => i)

  return (
    <footer className="border-t border-border overflow-hidden">
      {/* Scrolling name marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-6 md:py-8 overflow-hidden"
      >
        <div className="animate-marquee whitespace-nowrap">
          {items.map((i) => (
            <span
              key={i}
              className="inline-flex items-baseline font-display font-extrabold uppercase tracking-tight text-foreground/[0.08] select-none"
              style={{ fontSize: 'clamp(5rem, 14vw, 20rem)', lineHeight: 1 }}
            >
              {MARQUEE_TEXT}
              <span
                className="mx-6 md:mx-10 text-foreground/[0.04]"
                style={{ fontSize: '0.35em' }}
              >
                {SEPARATOR}
              </span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-10 py-5 border-t border-border">
        <p className="text-xs text-muted-foreground text-center sm:text-left uppercase tracking-widest">
          © {new Date().getFullYear()} Hoang Cao Viet Anh · CTO @ NullifyMatter
        </p>
        <div className="flex items-center gap-6">
          {[
            { label: 'GitHub', href: 'https://github.com', external: true },
            { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
            { label: 'Email', href: 'mailto:vanhleg2301@gmail.com', external: false },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={!link.external ? (e) => { e.stopPropagation(); window.location.href = link.href } : undefined}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
