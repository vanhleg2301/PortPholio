// English → Vietnamese translation for selected text.
// 1. Chrome's built-in on-device Translator (desktop Chrome 138+): free, private, no limit.
// 2. Otherwise the free MyMemory API (about 5,000 characters a day per user, 500 bytes per request).
// Results are cached in memory and localStorage, so the same text is never translated twice.

export interface Translation {
  text: string
  engine: 'Chrome (on-device)' | 'MyMemory'
}

interface ChromeTranslator {
  translate: (text: string) => Promise<string>
}
interface ChromeTranslatorFactory {
  availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>
  create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<ChromeTranslator>
}

const CACHE_KEY = 'roadmap:translations'
const CACHE_LIMIT = 300
const MYMEMORY_CHUNK = 450

let memory: Map<string, string> | null = null
let chromeTranslator: Promise<ChromeTranslator | null> | null = null

function loadCache(): Map<string, string> {
  if (memory) return memory
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    memory = new Map(raw ? (JSON.parse(raw) as Array<[string, string]>) : [])
  } catch {
    memory = new Map()
  }
  return memory
}

function saveCache(cache: Map<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...cache].slice(-CACHE_LIMIT)))
  } catch {
    // Storage can be full or blocked; the in-memory cache still works.
  }
}

function getChromeTranslator(): Promise<ChromeTranslator | null> {
  if (chromeTranslator) return chromeTranslator
  const factory = (globalThis as { Translator?: ChromeTranslatorFactory }).Translator
  chromeTranslator = (async () => {
    if (!factory) return null
    try {
      const options = { sourceLanguage: 'en', targetLanguage: 'vi' }
      if ((await factory.availability(options)) === 'unavailable') return null
      return await factory.create(options)
    } catch {
      return null
    }
  })()
  return chromeTranslator
}

// MyMemory takes at most ~500 bytes per request, so long text is sent sentence by sentence.
function splitForApi(text: string): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text]
  const chunks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if ((current + sentence).length > MYMEMORY_CHUNK && current) {
      chunks.push(current)
      current = ''
    }
    current += sentence.length > MYMEMORY_CHUNK ? sentence.slice(0, MYMEMORY_CHUNK) : sentence
  }
  if (current.trim()) chunks.push(current)
  return chunks
}

async function translateWithMyMemory(text: string): Promise<string> {
  const parts: string[] = []
  for (const chunk of splitForApi(text)) {
    const url = `https://api.mymemory.translated.net/get?langpair=en%7Cvi&q=${encodeURIComponent(chunk.trim())}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Translation service error (${response.status})`)
    const data = (await response.json()) as { responseStatus: number | string; responseData?: { translatedText?: string }; quotaFinished?: boolean }
    if (data.quotaFinished || Number(data.responseStatus) === 429) {
      throw new Error('The free translation limit for today is used up. It resets tomorrow.')
    }
    if (Number(data.responseStatus) !== 200 || !data.responseData?.translatedText) throw new Error('Could not translate this text.')
    parts.push(data.responseData.translatedText)
  }
  return parts.join(' ')
}

export async function translateToVietnamese(raw: string): Promise<Translation> {
  const text = raw.replace(/\s+/g, ' ').trim()
  const cache = loadCache()
  const cached = cache.get(text)
  if (cached) return JSON.parse(cached) as Translation

  const chrome = await getChromeTranslator()
  let result: Translation | null = null
  if (chrome) {
    try {
      result = { text: await chrome.translate(text), engine: 'Chrome (on-device)' }
    } catch {
      result = null
    }
  }
  result ??= { text: await translateWithMyMemory(text), engine: 'MyMemory' }

  cache.set(text, JSON.stringify(result))
  saveCache(cache)
  return result
}
