//
//  main.swift
//  VoxDiscordBridge
//
//  Created by 22ChiragK on 7/13/19.
//  Copyright © 2019 22ChiragK. All rights reserved.
//
import ScriptingBridge
import Cocoa

@objc enum VoxState : Int {
    case stopped = -1, paused = 0, playing = 1
}

@objc fileprivate protocol VoxApplication {
    // Track properties
    @objc optional var track:        String { get }
    @objc optional var artist:       String { get }
    @objc optional var album:        String { get }
    @objc optional var artworkImage:          NSImage {get}
    
    @objc optional var playerState:  VoxState { get }

    
    @objc optional var totalTime:    Double { get }
    

}

extension SBApplication: VoxApplication { }

//extension NSImage {
//    func bitmapImageRepresentation() -> NSBitmapImageRep? {
//        let width = self.size.width
//        let height = self.size.height
//        let colorSpaceName = NSColorSpaceName.deviceRGB
//
//        if width < 1 || height < 1 {
//            return nil
//        }
//
//        if let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(width), pixelsHigh: Int(height), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: colorSpaceName, bytesPerRow: Int(width) * 4, bitsPerPixel: 32)
//        {
//            let ctx = NSGraphicsContext.init(bitmapImageRep: rep)
//            NSGraphicsContext.saveGraphicsState()
//            NSGraphicsContext.current = ctx
//            self.draw(at: NSZeroPoint, from: NSZeroRect, operation: NSCompositingOperation.copy, fraction: 1.0)
//            ctx?.flushGraphics()
//            NSGraphicsContext.restoreGraphicsState()
//            return rep
//        }
//        return nil
//    }
//}

private let application: VoxApplication? = SBApplication.init(bundleIdentifier: "com.coppertino.Vox")

var previousTitle = ""
var prevPlayState = -100
let timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { (timer) in
    let currentTitle = application!.track ?? "Unknown Title"
    
    if(previousTitle == currentTitle) {
        let state = application?.playerState?.rawValue
        if(prevPlayState != state) {
            prevPlayState = state!
            print((state == 1 ? "play" : "pause"))
            let path = "http://localhost:38787/" + (state == 1 ? "play" : "pause")
            let request = URLRequest(url: URL(string: path)!);
            do {
                let response: AutoreleasingUnsafeMutablePointer<URLResponse?>? = nil
                let data = try NSURLConnection.sendSynchronousRequest(request, returning: response)
            } catch let error as NSError {
                print(error.localizedDescription)
            }
        }
        return;
    }
    
    previousTitle = currentTitle
    
    let image = application?.artworkImage
    let bitmapImage = image?.representations[0] as! NSBitmapImageRep?
    let pngData = bitmapImage?.representation(using: NSBitmapImageRep.FileType.png, properties: [:])?.base64EncodedString()
    
    let path = "http://localhost:38787?" + String(format: "title=%@&artist=%@&length=%.1f&album=%@", currentTitle, application?.artist! ?? "Unknown Artist", application?.totalTime ?? 0.0, application?.album! ?? "Unknown Album").addingPercentEncoding(withAllowedCharacters: CharacterSet.urlQueryAllowed)!
    let url = URL(string: path)!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("text/plain; charset=us-ascii", forHTTPHeaderField: "Content-Type")
    request.httpBody = pngData?.data(using: String.Encoding.ascii)!
    print("Updated song: " + currentTitle)
    do {
        let response: AutoreleasingUnsafeMutablePointer<URLResponse?>? = nil
        let data = try NSURLConnection.sendSynchronousRequest(request, returning: response)
    } catch let error as NSError {
        print(error.localizedDescription)
    }
};

RunLoop.current.add(timer, forMode: RunLoop.Mode.common)
RunLoop.main.run()
