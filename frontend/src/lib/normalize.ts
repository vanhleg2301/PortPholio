// Lower case, accents removed, punctuation turned into spaces: the form all search matching uses.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9+#.\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Words that only make a query a question ("what is", "how does … work", "… là gì"). They are
// dropped so "What is Big O notation?" searches for "big o notation".
const QUESTION_WORDS = new Set(
  (
    'what whats which who whom whose why when where how is are was were be been am do does did ' +
    'the a an of in on at to for from with by into about and or vs versus between difference differences ' +
    'can could should would will shall may might must i me my we you your it its this that these those there ' +
    'explain explained explanation mean means meaning define definition tell please give show know ' +
    'use used using work works working way ways example examples need want called so s ' +
    'la gi nhu the nao tai sao vi cach lam co khong va cua mot nghia hieu giai thich'
  ).split(' ')
)

// The search words of a query: normalised, without question words (unless nothing else is left).
export function getQueryTokens(query: string): string[] {
  const tokens = normalize(query)
    .split(' ')
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((t) => /[a-z0-9+#]/.test(t))
  const kept = tokens.filter((t) => !QUESTION_WORDS.has(t))
  return kept.length > 0 ? kept : tokens
}

export const getSearchPhrase = (query: string) => getQueryTokens(query).join(' ')
