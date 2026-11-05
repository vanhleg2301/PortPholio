import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const SITE_URL = 'https://port-pholio-frontend.vercel.app'

interface RouteMeta {
  route: string
  title: string
  description: string
  image: string
}

// Link previews (Zalo, Messenger, LinkedIn…) read the HTML before any JS runs, so each
// shareable route gets its own copy of index.html with its own title and thumbnail.
// Vercel serves these static files before the SPA rewrite.
const ROUTE_META: RouteMeta[] = [
  {
    route: 'roadmap',
    title: 'Road to Big Tech · Study plan',
    description: 'Daily study plan: DSA, CS fundamentals, system design and AI engineering — Nov 2026 to Oct 2027.',
    image: '/og-image.png',
  },
  {
    route: 'journey',
    title: 'Road to Big Tech · Hoang Cao Viet Anh',
    description: 'Learning in public: NeetCode progress, study hours, streaks and milestones, updated daily.',
    image: '/og-image.png',
  },
]

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function routeMetaPages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'route-meta-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const base = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8')
      for (const meta of ROUTE_META) {
        const title = escapeHtml(meta.title)
        const description = escapeHtml(meta.description)
        const image = `${SITE_URL}${meta.image}`
        const html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*"/, `$1${description}"`)
          .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
          .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${description}"`)
          .replace(/<meta name="twitter:card" content="[^"]*" \/>/, '<meta name="twitter:card" content="summary_large_image" />')
          .replace(
            '</head>',
            `  <meta property="og:url" content="${SITE_URL}/${meta.route}" />\n` +
              `    <meta property="og:image" content="${image}" />\n` +
              `    <meta property="og:image:width" content="1200" />\n` +
              `    <meta property="og:image:height" content="630" />\n` +
              `    <meta name="twitter:image" content="${image}" />\n  </head>`
          )
        const dir = path.join(outDir, meta.route)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), routeMetaPages()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
