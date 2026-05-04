import { Download } from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const experience = [
  {
    role: 'Chief Technology Officer (CTO)',
    company: 'NullifyMatter',
    period: '2024 – Present',
    location: 'Singapore / Remote',
    bullets: [
      'Lead full-stack development and product architecture for the NullifyMatter platform and all sub-products',
      'Built and shipped nullifymatter.com.sg, gatewayoftalent.com, and client.gatewayofasia.com to production',
      'Designed Supabase database schemas, RLS security policies, and REST APIs with Hono & Drizzle ORM',
      'Primary tool: lovable.dev — enabling rapid, high-quality product delivery from design to deployment',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Personal Projects & Self-study',
    period: '2023 – 2024',
    location: 'Ho Chi Minh City, Vietnam',
    bullets: [
      'Built SPAs with React + TypeScript, integrated Tailwind CSS and Framer Motion for polished UIs',
      'Studied React ecosystem in depth: React Query, Zustand, React Router, Zod schema validation',
      'Practiced Docker, CI/CD with GitHub Actions, deployed to Vercel and Railway',
    ],
  },
]

const projects = [
  {
    name: 'nullifymatter.com.sg',
    stack: 'lovable.dev · React · TypeScript · Supabase · Tailwind CSS',
    link: 'nullifymatter.com.sg',
    bullets: [
      'Official company website for NullifyMatter — a Singapore-based tech company',
      'Full-stack architecture with Supabase Auth, PostgreSQL database, and Row Level Security',
      'Responsive, SEO-optimized, production-deployed and live',
    ],
  },
  {
    name: 'gatewayoftalent.com',
    stack: 'lovable.dev · React · TypeScript · Supabase · Tailwind CSS',
    link: 'gatewayoftalent.com',
    bullets: [
      'Talent discovery platform matching businesses with qualified candidates',
      'Real users, live on production — built as part of the NullifyMatter product suite',
      'Supabase backend with secure authentication and data policies',
    ],
  },
  {
    name: 'client.gatewayofasia.com',
    stack: 'lovable.dev · React · TypeScript · Supabase · Tailwind CSS',
    link: 'client.gatewayofasia.com',
    bullets: [
      'Asia-focused web platform bridging regional business and recruitment opportunities',
      'Full-stack web app with Supabase Auth, dynamic content management, deployed to production',
    ],
  },
]

const skills = [
  { label: 'Frontend', items: 'React, TypeScript, Next.js, Tailwind CSS, Framer Motion, HTML/CSS' },
  { label: 'Backend', items: 'Node.js, Hono, REST API, Zod, JWT, Drizzle ORM' },
  { label: 'Database', items: 'PostgreSQL, Supabase, Row Level Security (RLS), Redis' },
  { label: 'Tools', items: 'lovable.dev, Docker, GitHub Actions, Vercel, Railway, Vite' },
]

export default function ResumePage() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1.2cm 1.5cm; size: A4; }
        }
        @media screen {
          body { background: #f0f0f0; }
        }
      `}</style>

      {/* Floating actions */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex gap-3">
        <a
          href="/"
          className="flex items-center gap-2 rounded-xl border border-black/20 bg-white px-4 py-2.5 text-sm font-medium text-black shadow-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </a>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-black/80 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      {/* A4 Resume */}
      <div
        className="mx-auto my-8 bg-white shadow-xl"
        style={{
          width: 'min(794px, 100vw)',
          minHeight: '1123px',
          padding: 'clamp(28px, 4vw, 52px) clamp(20px, 5vw, 56px)',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#111',
          fontSize: '13px',
          lineHeight: '1.55',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Header ── */}
        <header style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', margin: 0, lineHeight: 1.1 }}>
                Hoang Cao Viet Anh
              </h1>
              <p style={{ margin: '4px 0 2px', fontSize: '14px', color: '#555', fontWeight: 500 }}>
                Chief Technology Officer (CTO) · NullifyMatter
              </p>
              <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#888' }}>
                Mentored by Dũng —{' '}
                <a href="mailto:dungcaond@gmail.com" style={{ color: '#555', textDecoration: 'none' }}>
                  dungcaond@gmail.com
                </a>
              </p>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '999px', padding: '4px 12px',
              fontSize: '12px', fontWeight: 600, color: '#16a34a',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Available for hire
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px', color: '#444' }}>
            <span>📍 Ho Chi Minh City, Vietnam</span>
            <a href="mailto:vanhleg2301@gmail.com" style={{ color: '#111', textDecoration: 'none' }}>
              vanhleg2301@gmail.com
            </a>
            <a href="https://nullifymatter.com.sg" style={{ color: '#111', textDecoration: 'none' }}>
              nullifymatter.com.sg
            </a>
            <a href="https://gatewayoftalent.com" style={{ color: '#111', textDecoration: 'none' }}>
              gatewayoftalent.com
            </a>
            <a href="https://client.gatewayofasia.com" style={{ color: '#111', textDecoration: 'none' }}>
              client.gatewayofasia.com
            </a>
            <a href="https://github.com" style={{ color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GithubIcon className="h-3.5 w-3.5" /> github.com/vieta-nh
            </a>
            <a href="https://linkedin.com" style={{ color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LinkedinIcon className="h-3.5 w-3.5" /> linkedin.com/in/vieta-nh
            </a>
          </div>
        </header>

        <hr style={{ border: 'none', borderTop: '1.5px solid #111', margin: '0 0 20px' }} />

        {/* ── Summary ── */}
        <Section title="Summary">
          <p style={{ color: '#333', margin: 0 }}>
            Full Stack Developer and CTO at NullifyMatter, a Singapore-based tech company. I have built and
            shipped three production web platforms — <strong>nullifymatter.com.sg</strong>,{' '}
            <strong>gatewayoftalent.com</strong>, and <strong>client.gatewayofasia.com</strong> — using
            lovable.dev as my primary development tool, backed by Supabase, React, and TypeScript.
            I own the full product lifecycle: architecture, database design, API, UI, and deployment.
            Actively seeking the next opportunity to drive meaningful impact.
          </p>
        </Section>

        {/* ── Experience ── */}
        <Section title="Experience">
          {experience.map((exp) => (
            <div key={exp.role} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{exp.role}</span>
                <span style={{ color: '#666', fontSize: '12px' }}>{exp.period}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#444', fontWeight: 500 }}>{exp.company}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{exp.location}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {exp.bullets.map((b, i) => (
                  <li key={i} style={{ color: '#333', marginBottom: '3px' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* ── Projects ── */}
        <Section title="Projects">
          {projects.map((p) => (
            <div key={p.name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{p.name}</span>
                <span style={{ color: '#666', fontSize: '11.5px' }}>{p.link}</span>
              </div>
              <p style={{ color: '#555', fontStyle: 'italic', margin: '2px 0 6px', fontSize: '12px' }}>{p.stack}</p>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {p.bullets.map((b, i) => (
                  <li key={i} style={{ color: '#333', marginBottom: '3px' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* ── Education ── */}
        <Section title="Education">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '13.5px' }}>Information Technology</span>
              <span style={{ color: '#444', fontWeight: 500, marginLeft: '10px' }}>University (in progress)</span>
            </div>
            <span style={{ color: '#666', fontSize: '12px' }}>2021 – 2025</span>
          </div>
          <p style={{ color: '#555', margin: '4px 0 0', fontSize: '12.5px' }}>
            Relevant coursework: Web Programming, Database Systems, Computer Networks, Operating Systems
          </p>
        </Section>

        {/* ── Skills ── */}
        <Section title="Technical Skills">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {skills.map((s) => (
                <tr key={s.label}>
                  <td style={{ fontWeight: 600, paddingRight: '16px', paddingBottom: '5px', whiteSpace: 'nowrap', verticalAlign: 'top', width: '90px', color: '#111' }}>
                    {s.label}
                  </td>
                  <td style={{ color: '#333', paddingBottom: '5px' }}>{s.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* ── Mentor ── */}
        <Section title="Acknowledgements">
          <p style={{ color: '#333', margin: 0 }}>
            Principal mentor: <strong>Dũng</strong> (
            <a href="mailto:dungcaond@gmail.com" style={{ color: '#444', textDecoration: 'none' }}>
              dungcaond@gmail.com
            </a>
            ) — whose guidance has been essential to my growth as a developer and technical leader.
          </p>
        </Section>
      </div>

      <div className="no-print h-16" />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '22px' }}>
      <h2 style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#111',
        margin: '0 0 10px',
        paddingBottom: '4px',
        borderBottom: '1px solid #ddd',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
