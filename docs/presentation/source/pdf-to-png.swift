// Rasterizes every page of a PDF to PNG with PDFKit.  usage: swift pdf-to-png.swift deck.pdf outDir [width]
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  FileHandle.standardError.write("usage: swift pdf-to-png.swift deck.pdf outDir [width]\n".data(using: .utf8)!)
  exit(1)
}
let outDir = URL(fileURLWithPath: args[2])
let width = args.count > 3 ? Double(args[3]) ?? 1920 : 1920
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
for index in 0..<doc.pageCount {
  guard let page = doc.page(at: index) else { continue }
  let bounds = page.bounds(for: .mediaBox)
  let scale = width / bounds.width
  let size = NSSize(width: (bounds.width * scale).rounded(), height: (bounds.height * scale).rounded())
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size.width), pixelsHigh: Int(size.height), bitsPerSample: 8,
                             samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  let context = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.current = context
  context.cgContext.setFillColor(NSColor.white.cgColor)
  context.cgContext.fill(CGRect(origin: .zero, size: size))
  context.cgContext.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: context.cgContext)
  NSGraphicsContext.restoreGraphicsState()
  let name = String(format: "Slide_%02d.png", index + 1)
  try rep.representation(using: .png, properties: [:])!.write(to: outDir.appendingPathComponent(name))
  print(name)
}
