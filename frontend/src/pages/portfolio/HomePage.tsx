import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Mail, Download, MapPin, Code2, Database, Server, Layers, ExternalLink, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </motion.p>
  )
}

const skills = [
  {
    icon: <Code2 className="h-5 w-5" />,
    label: 'Frontend',
    items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    icon: <Server className="h-5 w-5" />,
    label: 'Backend',
    items: ['Node.js', 'Hono', 'REST API', 'Zod', 'JWT'],
  },
  {
    icon: <Database className="h-5 w-5" />,
    label: 'Database',
    items: ['PostgreSQL', 'Supabase', 'Drizzle ORM', 'Redis'],
  },
  {
    icon: <Layers className="h-5 w-5" />,
    label: 'Tools & DevOps',
    items: ['lovable.dev', 'Docker', 'GitHub Actions', 'Vercel', 'Railway'],
  },
]

const projects = [
  {
    title: 'NullifyMatter',
    desc: 'Company website for NullifyMatter — a Singapore-based tech company. Led full-stack development and system architecture as CTO.',
    tags: ['lovable.dev', 'Supabase', 'React', 'TypeScript'],
    link: 'https://nullifymatter.com.sg',
    live: true,
    year: '2025',
  },
  {
    title: 'Gateway of Talent',
    desc: 'Talent discovery platform connecting businesses with the right candidates. Built and shipped as part of the NullifyMatter product suite.',
    tags: ['lovable.dev', 'Supabase', 'React', 'TypeScript'],
    link: 'https://gatewayoftalent.com',
    live: true,
    year: '2025',
  },
  {
    title: 'Gateway of Asia',
    desc: 'Asia-focused platform bridging business and recruitment opportunities across the region. Available at client.gatewayofasia.com.',
    tags: ['lovable.dev', 'Supabase', 'React', 'TypeScript'],
    link: 'https://client.gatewayofasia.com',
    live: true,
    year: '2025',
  },
]

function Avatar() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="h-20 w-20 rounded-2xl bg-foreground flex items-center justify-center text-background font-bold text-xl ring-2 ring-border select-none">
        HV
      </div>
    )
  }
  return (
    <img
      src="/avatar.jpg"
      alt="Hoang Cao Viet Anh"
      className="h-20 w-20 rounded-2xl object-cover ring-2 ring-border"
      onError={() => setErr(true)}
    />
  )
}

export default function HomePage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 40])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-24">

      {/* ── Hero ── */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col gap-8"
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="relative shrink-0"
            >
              <Avatar />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 ring-2 ring-background" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
            >
              <h1 className="text-2xl font-bold tracking-tight">Hoang Cao Viet Anh</h1>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                CTO · NullifyMatter
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Ho Chi Minh City, Vietnam
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Available for hire
              </span>
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease }}
          >
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Full Stack Developer{' '}
              <span className="text-muted-foreground">
                shipping real products.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              CTO at <span className="text-foreground font-medium">NullifyMatter</span> — building and launching
              production-grade web platforms with lovable.dev and Supabase.
              I cover the full stack, from database design to polished UI.
            </p>
          </motion.div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease }}
            className="flex flex-wrap items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-85 transition-opacity"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Hire Me Now
            </motion.button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/resume"
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
              >
                View Resume <Download className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap items-center gap-5 text-muted-foreground"
          >
            {[
              { icon: <GithubIcon className="h-4 w-4" />, label: 'GitHub', href: 'https://github.com' },
              { icon: <LinkedinIcon className="h-4 w-4" />, label: 'LinkedIn', href: 'https://linkedin.com' },
              { icon: <Globe className="h-4 w-4" />, label: 'NullifyMatter', href: 'https://nullifymatter.com.sg' },
              { icon: <Mail className="h-4 w-4" />, label: 'Email', href: 'mailto:vanhleg2301@gmail.com' },
            ].map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {s.icon} {s.label}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── About ── */}
      <Section id="about">
        <motion.div variants={fadeUp} className="flex flex-col gap-5">
          <Label>About</Label>
          <p className="text-muted-foreground leading-relaxed">
            I'm a Full Stack Developer and CTO at{' '}
            <a href="https://nullifymatter.com.sg" target="_blank" rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-2 hover:underline">
              NullifyMatter
            </a>
            , a Singapore-based tech company. I lead the development of web platforms and web apps — from
            product architecture to shipping production features. My primary tool is{' '}
            <span className="text-foreground font-medium">lovable.dev</span>, which lets me move fast
            without sacrificing quality.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            I have shipped three live products:{' '}
            <a href="https://nullifymatter.com.sg" target="_blank" rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-2 hover:underline">nullifymatter.com.sg</a>,{' '}
            <a href="https://gatewayoftalent.com" target="_blank" rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-2 hover:underline">gatewayoftalent.com</a>, and{' '}
            <a href="https://client.gatewayofasia.com" target="_blank" rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-2 hover:underline">client.gatewayofasia.com</a>.
            I'm grateful to be mentored by{' '}
            <a href="mailto:dungcaond@gmail.com"
              className="text-foreground font-medium underline-offset-2 hover:underline">
              Dũng
            </a>
            , who has been my principal guide throughout this journey.
          </p>
        </motion.div>
      </Section>

      {/* ── Skills ── */}
      <Section id="skills">
        <motion.div variants={fadeUp} className="flex flex-col gap-5">
          <Label>Skills</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((skill) => (
              <motion.div
                key={skill.label}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-foreground">
                  {skill.icon}
                  <span className="text-sm font-semibold">{skill.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item, i) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── Projects ── */}
      <Section id="projects">
        <motion.div variants={fadeUp} className="flex flex-col gap-5">
          <Label>Projects @ NullifyMatter</Label>
          <div className="flex flex-col gap-3">
            {projects.map((project, i) => (
              <motion.a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp}
                custom={i}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 hover:border-foreground/30 hover:bg-accent/30 transition-colors"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold group-hover:text-primary transition-colors">{project.title}</span>
                    {project.live && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        <span className="h-1 w-1 rounded-full bg-green-500" />
                        Live
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{project.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-secondary px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── Contact ── */}
      <Section id="contact">
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-5 text-center items-center"
        >
          <div>
            <h3 className="text-2xl font-bold">Let's work together</h3>
            <p className="mt-2 text-muted-foreground text-sm max-w-sm leading-relaxed">
              Open to full-time roles, freelance projects, and exciting collaborations.
              I typically reply within 24 hours.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <motion.a
              href="mailto:vanhleg2301@gmail.com"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-85 transition-opacity"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Hire Me Now
            </motion.a>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/resume"
                className="flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
              >
                Download Resume <Download className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground pt-1">
            <a href="mailto:vanhleg2301@gmail.com" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> vanhleg2301@gmail.com
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <GithubIcon className="h-3.5 w-3.5" /> GitHub
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </motion.div>
      </Section>

    </div>
  )
}
