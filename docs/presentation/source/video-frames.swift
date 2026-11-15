// Prints a video's duration, size, and codec, and saves frames at the given times for inspection.
// usage: swift video-frames.swift video.mp4 outDir [seconds ...]
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { fatalError("usage: swift video-frames.swift video.mp4 outDir [seconds ...]") }
let asset = AVURLAsset(url: URL(fileURLWithPath: args[1]))
let outDir = URL(fileURLWithPath: args[2])
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let semaphore = DispatchSemaphore(value: 0)
Task {
  let duration = try await asset.load(.duration).seconds
  let track = try await asset.loadTracks(withMediaType: .video).first!
  let size = try await track.load(.naturalSize)
  let formats = try await track.load(.formatDescriptions)
  let codec = formats.first.map { CMFormatDescriptionGetMediaSubType($0) }.map { code in
    String(bytes: [24, 16, 8, 0].map { UInt8((code >> $0) & 0xff) }, encoding: .ascii) ?? "?"
  } ?? "?"
  let rate = try await track.load(.nominalFrameRate)
  print(String(format: "duration %.2f s · %dx%d · %@ · %.0f fps", duration, Int(size.width), Int(size.height), codec, rate))
  let generator = AVAssetImageGenerator(asset: asset)
  generator.requestedTimeToleranceBefore = .zero
  generator.requestedTimeToleranceAfter = .zero
  for value in args.dropFirst(3) {
    guard let seconds = Double(value) else { continue }
    let (image, _) = try await generator.image(at: CMTime(seconds: seconds, preferredTimescale: 600))
    let rep = NSBitmapImageRep(cgImage: image)
    let file = outDir.appendingPathComponent(String(format: "frame-%06.2f.png", seconds))
    try rep.representation(using: .png, properties: [:])!.write(to: file)
    print(file.lastPathComponent)
  }
  semaphore.signal()
}
semaphore.wait()
