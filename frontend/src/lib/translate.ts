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

const CHROME_TIMEOUT_MS = 3000
const API_TIMEOUT_MS = 10000

let memory: Map<string, string> | null = null
// Ready on-device translator, or null while it is missing / still downloading.
let chromeTranslator: ChromeTranslator | null = null
let isChromeChecked = false

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

// Chrome must download its English→Vietnamese model once (it can take 30 s or more).
// Never wait for that: start the download in the background and use the web API meanwhile;
// later translations use the on-device model once it is ready.
async function getChromeTranslator(): Promise<ChromeTranslator | null> {
  if (chromeTranslator || isChromeChecked) return chromeTranslator
  isChromeChecked = true
  const factory = (globalThis as { Translator?: ChromeTranslatorFactory }).Translator
  if (!factory) return null
  try {
    const options = { sourceLanguage: 'en', targetLanguage: 'vi' }
    const availability = await factory.availability(options)
    if (availability === 'unavailable') return null
    const creating = factory.create(options).then((translator) => {
      chromeTranslator = translator
      return translator
    })
    creating.catch(() => undefined)
    if (availability === 'available') return await withTimeout(creating, CHROME_TIMEOUT_MS)
  } catch {
    // Not supported here; fall back to the web API.
  }
  return null
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
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

async function translateChunk(chunk: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?langpair=en%7Cvi&q=${encodeURIComponent(chunk.trim())}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Translation service error (${response.status})`)
    const data = (await response.json()) as { responseStatus: number | string; responseData?: { translatedText?: string }; quotaFinished?: boolean }
    if (data.quotaFinished || Number(data.responseStatus) === 429) {
      throw new Error('The free translation limit for today is used up. It resets tomorrow.')
    }
    if (Number(data.responseStatus) !== 200 || !data.responseData?.translatedText) throw new Error('Could not translate this text.')
    return data.responseData.translatedText
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw new Error('The translation service is slow right now. Try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// Long text is split into chunks, sent at the same time.
async function translateWithMyMemory(text: string): Promise<string> {
  const parts = await Promise.all(splitForApi(text).map(translateChunk))
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
      result = { text: await withTimeout(chrome.translate(text), CHROME_TIMEOUT_MS), engine: 'Chrome (on-device)' }
    } catch {
      result = null
    }
  }
  result ??= { text: await translateWithMyMemory(text), engine: 'MyMemory' }

  cache.set(text, JSON.stringify(result))
  saveCache(cache)
  return result
}
