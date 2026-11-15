// PptxGenJS 4 allocates media IDs from relationship ordinals, while text uses
// object ordinals. Validate every generated slide before writing the final deck.
export function assertUniqueDrawingIds(xml, part) {
  const seen = new Set()
  for (const match of xml.matchAll(/<p:cNvPr\b[^>]*\bid="(\d+)"/g)) {
    if (seen.has(match[1])) throw new Error(`${part}: duplicate non-visual drawing ID ${match[1]}`)
    seen.add(match[1])
  }
  if (!seen.size) throw new Error(`${part}: no non-visual drawing IDs found`)
}
