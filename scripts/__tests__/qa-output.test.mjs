import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { qaOutputPaths } from '../qa-output.mjs'

describe('QA artifact isolation', () => {
  const root = '/tmp/qa-fixture'
  it('keeps custom-output review images out of tracked galleries', () => {
    const paths = qaOutputPaths(root, { output: '/tmp/independent-review' })
    expect(paths.comparison).toBe('/tmp/independent-review/app-review.png')
    expect(paths.gallery).toBeNull()
    expect(paths.publishedComparison).toBeNull()
  })
  it('defaults to ignored test output rather than the committed gallery', () => {
    expect(qaOutputPaths(root).output).toBe(path.join(root, 'test-results/browser-qa/chromium'))
  })
  it('rejects accidental tracked destinations, including normalized paths', () => {
    for (const output of ['docs/screenshots', 'docs/verification/visual-overhaul/chromium', 'test-results/../docs']) {
      expect(() => qaOutputPaths(root, { output: path.join(root, output) })).toThrow(/--update-gallery/)
    }
  })
  it('requires explicit opt-in for both kinds of published image', () => {
    const paths = qaOutputPaths(root, { output: '/tmp/review', updateGallery: true })
    expect(paths.gallery).toBe(path.join(root, 'docs/screenshots'))
    expect(paths.publishedComparison).toBe(path.join(root, 'docs/verification/visual-overhaul/app-review.png'))
  })
})
