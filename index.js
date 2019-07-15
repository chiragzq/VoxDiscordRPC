const RPC = require("discord-rpc");
const config = require("./config.json")
const uploadAlbum = require("./albumArt");
const http = require("http");
const urllib = require("url");
const fs = require("fs")
const { exec } = require('child_process');

exec("./ScriptingBridge/VoxDiscordBridge/Build/Products/Debug/VoxDiscordBridge", (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  
    // the *entire* stdout and stderr (buffered)
  });

const client = new RPC.Client({transport: "ipc"}); 

if (!fs.existsSync("./albumArt")){
    fs.mkdirSync("./albumArt");
}

client.on("ready", () => {
    console.log("Discord RPC Initialized");
});

client.login({clientId: config.clientId}).catch(console.error);

// server to listen for updates from scripting bridge
http.createServer((req, res) => {
    const url = urllib.parse(req.url, true);
    if(url.pathname != "/") {
        res.writeHead(404);
        res.end("Not found")
    }
    update(url.query.title, url.query.artist, url.query.album, url.query.length, req, res);
}).listen(38787);

function getKey(artist, album) {
    return `${artist}-${album}`.substring(0, 32).replace(/ /g, "_").replace(/\$/g, "").toLowerCase();
}

function update(title, artist, album, length, req, res) {
    console.log(`Now playing ${title} from ${album} by ${artist}`)
    if(config.albumArt.enabled) {
        fs.access(`./albumArt/${artist}/${album}.png`, (err) => {
            if(err) {
                console.log("Downloading album cover for " + album);
                if (!fs.existsSync(`./albumArt/${artist}`)){
                    fs.mkdirSync(`./albumArt/${artist}`);
                }
                let body = "";
                req.on("data", (data) => {
                    body += data;
                });
                req.on("end", () => {
                    fs.writeFile(`./albumArt/${artist}/${album}.png`, body, 'base64', (err) => {
                        if(err) throw err;
                        uploadAlbum(`./albumArt/${artist}/${album}.png`, getKey(artist, album))
                        .then(() => {
                            client.setActivity({
                                details: `${title} (${parseInt(length / 60)}:${pad(length % 60)})`,
                                state: "by " + artist,
                                largeImageKey: getKey(artist, album),
                                largeImageText: album,
                                startTimestamp: Date.now(),
                            });
                            res.end("updated")
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                    });
                });
            } else {
                client.setActivity({
                    details: `${title} (${parseInt(length / 60)}:${pad(length % 60)})`,
                    state: "by " + artist,
                    largeImageKey: getKey(artist, album),
                    largeImageText: album,
                    startTimestamp: Date.now(),
                });
                res.end("updated")
            }
        });
    } else {
        client.setActivity({
            details: `${title} (${parseInt(length / 60)}:${pad(length % 60)})`,
            state: "by " + artist,
            largeImageText: album,
            startTimestamp: Date.now(),
        });
        res.end("updated")
    }
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}