// Creates a separate 73-second alternate from the reviewed 94-second recording.
// Native AVFoundation passthrough retains the recorded H.264 video samples.
// Usage: swift trim-demo.swift original.mp4 alternate.mp4
import Foundation
import AVFoundation
import CryptoKit

let args = CommandLine.arguments
guard args.count == 3 else { fatalError("usage: swift trim-demo.swift original.mp4 alternate.mp4") }
let inputURL = URL(fileURLWithPath: args[1]).standardizedFileURL
let outputURL = URL(fileURLWithPath: args[2]).standardizedFileURL
guard inputURL != outputURL, !FileManager.default.fileExists(atPath: outputURL.path) else {
  fatalError("Output must be a new file, separate from the original")
}
let expected = "1954b55777deb9dad3d5d8c9e5cade487e25cb2dc3285d0da51c60fa5bcacb11"
guard SHA256.hash(data: try Data(contentsOf: inputURL)).map({ String(format: "%02x", $0) }).joined() == expected else {
  fatalError("Input differs from the reviewed final recording")
}
let done = DispatchSemaphore(value: 0)
Task.detached {
  do {
    let asset = AVURLAsset(url: inputURL)
    let source = try await asset.loadTracks(withMediaType: .video)[0]
    let composition = AVMutableComposition()
    let track = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
    var at = CMTime.zero
    // Inclusive start, exclusive end, using source frames at 30 fps.
    for (start, end) in [(0, 240), (870, 2820)] {
      let range = CMTimeRange(start: CMTime(value: Int64(start), timescale: 30), duration: CMTime(value: Int64(end - start), timescale: 30))
      try track.insertTimeRange(range, of: source, at: at)
      at = CMTimeAdd(at, range.duration)
    }
    track.preferredTransform = try await source.load(.preferredTransform)
    guard let session = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetPassthrough) else {
      fatalError("Passthrough export unavailable")
    }
    session.shouldOptimizeForNetworkUse = true
    try await session.export(to: outputURL, as: .mp4)
    print("Exported 73.0 seconds: original [0,8) + [29,94), no speed change, no new screens")
  } catch {
    print("ERROR: \(error)")
    exit(1)
  }
  done.signal()
}
done.wait()
