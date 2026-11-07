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
