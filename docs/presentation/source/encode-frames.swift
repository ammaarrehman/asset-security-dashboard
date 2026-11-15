// Encodes timestamped screencast frames to an H.264 MP4 with AVFoundation (built into macOS, no ffmpeg needed).
// usage: swift encode-frames.swift framesDir out.mp4 [fps] [width height]
// framesDir holds JPEG frames and frames.json: [{ "file": "00000.jpg", "t": <seconds> }, ...] in capture order.
// Frames arrive only when the screen changes, so each output frame shows the latest captured frame at that time.
// Optional zooms.json: [{ "t": <seconds>, "cx": 0-1, "cy": 0-1, "s": scale }, ...]. From each time, the view eases
// over 0.8 s to that scale centered on (cx, cy), kept inside the frame. This only crops and scales the captured frames.
import AVFoundation
import AppKit

struct Stamp: Decodable { let file: String; let t: Double }
struct Zoom: Decodable { let t: Double; let cx: Double; let cy: Double; let s: Double }
let args = CommandLine.arguments
guard args.count >= 3 else { fatalError("usage: swift encode-frames.swift framesDir out.mp4 [fps]") }
let dir = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[2])
let fps = Int32(args.count > 3 ? Int(args[3]) ?? 30 : 30)
let zooms = (try? JSONDecoder().decode([Zoom].self, from: Data(contentsOf: dir.appendingPathComponent("zooms.json")))) ?? []
let stamps = try JSONDecoder().decode([Stamp].self, from: Data(contentsOf: dir.appendingPathComponent("frames.json")))
guard let first = stamps.first, let last = stamps.last else { fatalError("no frames") }

func image(_ index: Int) -> CGImage {
  let source = CGImageSourceCreateWithURL(dir.appendingPathComponent(stamps[index].file) as CFURL, nil)!
  return CGImageSourceCreateImageAtIndex(source, 0, nil)!
}
let probe = image(0)
let width = args.count > 5 ? Int(args[4])! : probe.width, height = args.count > 5 ? Int(args[5])! : probe.height

// The view at each zoom's start time, so every move eases from wherever the previous one had reached.
typealias View = (cx: Double, cy: Double, s: Double)
let ease = { (t: Double) -> Double in t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2 }
let move = 0.8
func blend(_ a: View, _ b: Zoom, _ p: Double) -> View {
  let e = ease(min(1, max(0, p)))
  return (a.cx + (b.cx - a.cx) * e, a.cy + (b.cy - a.cy) * e, a.s + (b.s - a.s) * e)
}
var starts: [View] = []
for (i, z) in zooms.enumerated() {
  starts.append(i == 0 ? (0.5, 0.5, 1) : blend(starts[i - 1], zooms[i - 1], (z.t - zooms[i - 1].t) / move))
}
func view(at time: Double) -> View {
  guard let i = zooms.lastIndex(where: { $0.t <= time }) else { return (0.5, 0.5, 1) }
  return blend(starts[i], zooms[i], (time - zooms[i].t) / move)
}

try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 3_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
  ] as [String: Any],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: width,
  kCVPixelBufferHeightKey as String: height,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let duration = last.t - first.t + 0.5 // hold the final frame briefly
let total = Int((duration * Double(fps)).rounded())
var index = 0
var cached = (index: -1, image: probe)
for frame in 0..<total {
  let time = first.t + Double(frame) / Double(fps)
  while index + 1 < stamps.count && stamps[index + 1].t <= time { index += 1 }
  if cached.index != index { cached = (index, image(index)) }
  var buffer: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buffer)
  let pixels = buffer!
  CVPixelBufferLockBaseAddress(pixels, [])
  let context = CGContext(data: CVPixelBufferGetBaseAddress(pixels), width: width, height: height, bitsPerComponent: 8,
                          bytesPerRow: CVPixelBufferGetBytesPerRow(pixels), space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  context.interpolationQuality = .high
  let v = view(at: time)
  let left = min(max(v.cx - 0.5 / v.s, 0), 1 - 1 / v.s), top = min(max(v.cy - 0.5 / v.s, 0), 1 - 1 / v.s)
  let w = Double(width) * v.s, h = Double(height) * v.s
  context.draw(cached.image, in: CGRect(x: -left * w, y: Double(height) - h * (1 - top), width: w, height: h))
  CVPixelBufferUnlockBaseAddress(pixels, [])
  while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
  adaptor.append(pixels, withPresentationTime: CMTime(value: CMTimeValue(frame), timescale: fps))
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
guard writer.status == .completed else { fatalError("encoding failed: \(String(describing: writer.error))") }
print("Encoded \(total) frames (\(String(format: "%.1f", Double(total) / Double(fps))) s, \(width)x\(height), \(fps) fps) from \(stamps.count) captures")
