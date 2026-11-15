import { describe, expect, it } from 'vitest'
import { assertUniqueDrawingIds } from './drawing-ids.mjs'

describe('PowerPoint drawing identity', () => {
  it('rejects the audited text/video collision rather than silently repairing XML', () => {
    const xml = '<p:sp><p:cNvPr id="3" name="Read-aloud text"/></p:sp>' +
      '<p:pic><p:cNvPr id="3" name="Recorded demo"/></p:pic>'
    expect(() => assertUniqueDrawingIds(xml, 'slide5.xml')).toThrow(/slide5.xml: duplicate.*3/)
  })
  it('scopes identity to each slide and does not confuse relationship IDs with drawing IDs', () => {
    const xml = '<p:cNvPr id="1"/><p:cNvPr id="2"/><p:cNvPr id="3"/><p:cNvPr id="4"/><a:blip r:embed="rId3"/>'
    for (const slide of ['slide1.xml', 'slide5.xml']) expect(() => assertUniqueDrawingIds(xml, slide)).not.toThrow()
  })
})
