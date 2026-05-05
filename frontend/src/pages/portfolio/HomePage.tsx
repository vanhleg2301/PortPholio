import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Download, MapPin, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHireModal } from '@/components/HireModal'

// ── Easing ───────────────────────────────
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

// ── Scroll-reveal variants ────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
}

// ── Section wrapper ───────────────────────
function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ── Marquee band ──────────────────────────
const marqueeItems = [
  'Full Stack Developer',
  'CTO at NullifyMatter',
  'React · TypeScript',
  'Supabase · Node.js',
  'Available for Hire',
  'Ha Noi City',
]

function MarqueeBand() {
  const doubled = [...marqueeItems, ...marqueeItems]
  return (
    <div className="overflow-hidden border-y border-border py-4 select-none">
      <div className="animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {item}
            <span className="ml-8 text-muted-foreground/30">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────
const projects = [
  {
    num: '01',
    title: 'NullifyMatter',
    role: 'Company Website & Platform',
    tags: ['React', 'TypeScript', 'Supabase'],
    link: 'https://nullifymatter.com.sg',
    year: '2025',
  },
  {
    num: '02',
    title: 'Gateway of Talent',
    role: 'Talent Discovery Platform',
    tags: ['React', 'TypeScript', 'Supabase'],
    link: 'https://gatewayoftalent.com',
    year: '2025',
  },
  {
    num: '03',
    title: 'Gateway of Asia',
    role: 'Asia Business Platform',
    tags: ['React', 'TypeScript', 'Supabase'],
    link: 'https://client.gatewayofasia.com',
    year: '2025',
  },
]

const stats = [
  { value: '3+', label: 'Products Shipped' },
  { value: '1+', label: 'Year as CTO' },
  { value: '2', label: 'Countries' },
  { value: '20+', label: 'Technologies' },
]

const stack = [
  { cat: 'Frontend', items: 'React · TypeScript · Next.js · Tailwind CSS · Framer Motion' },
  { cat: 'Backend', items: 'Node.js · Hono · REST API · Zod · JWT' },
  { cat: 'Database', items: 'PostgreSQL · Supabase · Drizzle ORM · Redis' },
  { cat: 'Tools', items: 'lovable.dev · Docker · GitHub Actions · Vercel · Railway' },
]

// ── Section header ────────────────────────
function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-end justify-between mb-14 pb-5 border-b border-border"
    >
      <div>
        <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest">{num}</p>
        <h2
          className="font-display font-bold uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(2rem, 6vw, 5.5rem)' }}
        >
          {title}
        </h2>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────
export default function HomePage() {
  const heroRef = useRef(null)
  const { openModal } = useHireModal()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div className="flex flex-col">

      {/* ── Hero ───────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="relative min-h-[100dvh] flex flex-col px-6 md:px-10 max-w-[1400px] mx-auto w-full"
      >
        {/* Top status bar — clears fixed navbar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center justify-between pt-20 md:pt-24 pb-6"
        >
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Available for Hire
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Ha Noi City, Vietnam
          </span>
        </motion.div>

        {/* Large name — fills remaining vertical space */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <motion.div style={{ y: heroY }}>
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.1 }}
              className="font-display font-extrabold uppercase leading-[0.88] tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 13rem)' }}
            >
              HOANG CAO
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
              className="font-display font-extrabold uppercase leading-[0.88] tracking-tight text-muted-foreground"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 13rem)' }}
            >
              VIET ANH
            </motion.h1>
          </motion.div>
        </div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-14"
        >
          <p className="text-sm md:text-base font-medium text-muted-foreground max-w-xs leading-relaxed">
            Full Stack Developer · CTO at{' '}
            <a
              href="https://nullifymatter.com.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:opacity-60 transition-opacity"
            >
              NullifyMatter
            </a>
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-background hover:opacity-80 transition-opacity"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Hire Me
            </motion.button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/resume"
                className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-foreground/40 hover:bg-foreground/5 transition-all"
              >
                Resume <Download className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Marquee ─────────────────────────────────── */}
      <MarqueeBand />

      {/* ── Selected Works ───────────────────────────── */}
      <Section
        id="works"
        className="px-6 md:px-10 py-24 md:py-32 max-w-[1400px] mx-auto w-full"
      >
        <SectionHeader num="01" title="Selected Works" />

        <div className="flex flex-col">
          {projects.map((project) => (
            <motion.a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              whileHover={{ x: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="group flex items-center justify-between gap-6 py-6 md:py-8 border-b border-border hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start gap-6 md:gap-10 min-w-0">
                <span className="shrink-0 text-[10px] font-mono text-muted-foreground pt-2 hidden sm:block">
                  {project.num}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3
                      className="font-display font-bold uppercase tracking-tight group-hover:opacity-60 transition-opacity"
                      style={{ fontSize: 'clamp(1.2rem, 3vw, 2.5rem)' }}
                    >
                      {project.title}
                    </h3>
                    <span className="text-[10px] font-mono text-muted-foreground">{project.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{project.role}</p>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="shrink-0 h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-foreground group-hover:rotate-12 transition-all duration-300" />
            </motion.a>
          ))}
        </div>
      </Section>

      {/* ── About ────────────────────────────────────── */}
      <div className="border-t border-border">
        <Section
          id="about"
          className="px-6 md:px-10 py-24 md:py-32 max-w-[1400px] mx-auto w-full"
        >
          <SectionHeader num="02" title="About Me" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
            {/* Bio */}
            <motion.div variants={fadeUp} className="md:col-span-2 space-y-5">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                I'm a Full Stack Developer and CTO at{' '}
                <a
                  href="https://nullifymatter.com.sg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:opacity-60 transition-opacity"
                >
                  NullifyMatter
                </a>
                , a Singapore-based tech company. I lead product development from architecture to
                production — covering database design, API layer, and polished UI.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                My primary tool is{' '}
                <span className="text-foreground font-medium">lovable.dev</span>, which lets me
                move fast without sacrificing quality. I've shipped three live production platforms,
                all available today.
              </p>
              <p className="text-sm text-muted-foreground">
                Guided by my mentor{' '}
                <a
                  href="mailto:dungcaond@gmail.com"
                  className="text-foreground hover:opacity-60 transition-opacity"
                >
                  Dũng
                </a>{' '}
                throughout this journey.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 content-start">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l-2 border-border pl-4 py-1">
                  <div
                    className="font-display font-bold leading-none"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </Section>
      </div>

      {/* ── Tech Stack ───────────────────────────────── */}
      <div className="border-t border-border">
        <Section
          id="stack"
          className="px-6 md:px-10 py-24 md:py-32 max-w-[1400px] mx-auto w-full"
        >
          <SectionHeader num="03" title="Tech Stack" />

          <div className="flex flex-col">
            {stack.map((row) => (
              <motion.div
                key={row.cat}
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-12 py-5 border-b border-border last:border-0"
              >
                <span className="shrink-0 w-24 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {row.cat}
                </span>
                <span className="text-sm md:text-base text-foreground/80 leading-relaxed">
                  {row.items}
                </span>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Contact / CTA ────────────────────────────── */}
      <div className="border-t border-border">
        <Section
          id="contact"
          className="px-6 md:px-10 py-24 md:py-40 max-w-[1400px] mx-auto w-full"
        >
          <motion.div variants={fadeUp}>
            <p className="text-[10px] font-mono text-muted-foreground mb-6 tracking-widest">04</p>
            <h2
              className="font-display font-extrabold uppercase leading-[0.88] tracking-tight mb-14"
              style={{ fontSize: 'clamp(2.8rem, 9vw, 11rem)' }}
            >
              Let's Work<br />
              <span className="text-muted-foreground">Together</span>
              <span className="text-muted-foreground/40"> →</span>
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
          >
            <a
              href="mailto:vanhleg2301@gmail.com"
              onClick={(e) => { e.stopPropagation(); window.location.href = 'mailto:vanhleg2301@gmail.com' }}
              className="flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-xs md:text-sm font-semibold uppercase tracking-widest text-background hover:opacity-80 transition-opacity active:scale-95"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              vanhleg2301@gmail.com
            </a>

            <div className="flex items-center gap-5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub <ArrowUpRight className="h-3 w-3" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </Section>
      </div>

    </div>
  )
}
