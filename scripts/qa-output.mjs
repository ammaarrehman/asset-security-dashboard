import path from 'node:path'

// Review runs are disposable by default. Only an explicit flag authorizes writes to docs/.
export function qaOutputPaths(root, { output, updateGallery = false, engine = 'chromium' } = {}) {
  const docs = path.resolve(root, 'docs')
  const target = path.resolve(output || path.join(root,
    updateGallery ? 'docs/verification/visual-overhaul' : 'test-results/browser-qa', engine))
  if (!updateGallery && (target === docs || target.startsWith(docs + path.sep))) {
    throw new Error('Writing QA output under docs/ requires --update-gallery. Choose a temporary output folder for review.')
  }
  return {
    output: target,
    comparison: path.join(target, 'app-review.png'),
    gallery: updateGallery ? path.join(root, 'docs/screenshots') : null,
    publishedComparison: updateGallery ? path.join(docs, 'verification/visual-overhaul/app-review.png') : null,
  }
}
