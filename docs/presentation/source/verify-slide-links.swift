// Validate the actual Keynote-exported PDF and optionally compare prior renders.
// swift verify-slide-links.swift deck.pdf renderedDir [previousSlidesDir]
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count >= 3, let pdf = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
    fatalError("usage: swift verify-slide-links.swift deck.pdf renderedDir [previousSlidesDir]")
}
precondition(pdf.pageCount == 6, "Expected six PDF pages")
let expected = [
    "https://ammaarrehman.github.io/asset-security-dashboard/",
    "https://github.com/ammaarrehman/asset-security-dashboard"
]
let page = pdf.page(at: 5)!
let links = page.annotations.compactMap { annotation -> [String: Any]? in
    guard let url = annotation.url else { return nil }
    precondition(page.bounds(for: .mediaBox).contains(annotation.bounds), "Link outside slide")
    return ["url": url.absoluteString, "bounds": NSStringFromRect(annotation.bounds)]
}
for url in expected {
    precondition(links.filter { $0["url"] as? String == url }.count >= 2,
                 "Expected clickable label and visible address: \(url)")
    precondition((page.string ?? "").contains(url.replacingOccurrences(of: "https://", with: "")),
                 "Visible address missing or wrapped: \(url)")
}

func pixels(_ path: String) -> Data {
    let image = NSBitmapImageRep(data: try! Data(contentsOf: URL(fileURLWithPath: path)))!
    return Data(bytes: image.bitmapData!, count: image.bytesPerRow * image.pixelsHigh)
}
var unchanged: [Int] = []
if args.count > 3 {
    for index in 1...5 {
        let name = String(format: "/Slide_%02d.png", index)
        precondition(pixels(args[2] + name) == pixels(args[3] + name), "Slide \(index) pixels changed")
        unchanged.append(index)
    }
}
let result: [String: Any] = ["status": "passed", "pdfPages": pdf.pageCount,
    "slide6Links": links, "visibleAddressesUnwrapped": true, "unchangedRenderedSlides": unchanged]
print(String(data: try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys]), encoding: .utf8)!)
