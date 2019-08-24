const RPC = require("discord-rpc");
const config = require("./config.json")
const uploadAlbum = require("./albumArt");
const http = require("http");
const urllib = require("url");
const fs = require("fs")
const { spawn } = require('child_process');

const scriptingBridge = spawn("./ScriptingBridge/VoxDiscordBridge/Build/Products/Debug/VoxDiscordBridge")

scriptingBridge.stdout.on("data", (data) => {
    console.log("[SCRIPTING BRIDGE] " + data);
});

scriptingBridge.stderr.on("data", (data) => {
    console.error("[SCRIPTING BRIDGE] " + data);
});

scriptingBridge.on("close", () => {
    throw new Error("Scripting bridge process ended");
});

const client = new RPC.Client({transport: "ipc"}); 

if (!fs.existsSync("./albumArt")){
    fs.mkdirSync("./albumArt");
}

client.on("ready", () => {
    console.log("Discord RPC Initialized");
});

client.login({clientId: config.clientId}).catch(console.error);

let paused = false;
// server to listen for updates from scripting bridge
http.createServer((req, res) => {
    const url = urllib.parse(req.url, true);
    if(url.pathname == "/") {
        update(url.query.title, url.query.artist, url.query.album, url.query.length, req, res);
        if(paused) {
            pauseActivity();
        }
        return;
    }
    if(url.pathname == "/pause") {
        pauseActivity();
        paused = true;
        res.end("pausing");
        console.log("Pause")
        return;
    }
    if(url.pathname == "/play") {
        console.log("Play")
        paused = false;
        restartActivity();
        res.end("playing");
        return;
    }
    res.writeHead(404);
    res.end("Not found")
}).listen(38787);

function getKey(artist, album) {
    return `${artist}-${album}`.substring(0, 32).replace(/[ \(\)]/g, "_").toLowerCase().replace(/[^a-z_-]/g, "");
}

function update(title, artist, album, length, req, res) {
    album = album.replace(/ \((.*?)\)/g, "");
    console.log(`Now playing ${title} from ${album} by ${artist}`)
    if(config.albumArt.enabled) {
        fs.access(`./albumArt/${artist}/${album}.png`, (err) => {
            if(err) {
                console.log("Uploading album cover for " + album);
                if (!fs.existsSync(`./albumArt/${artist}`)){
                    fs.mkdirSync(`./albumArt/${artist}`);
                }
                let body = "";
                req.on("data", (data) => {
                    body += data;
                });
                req.on("end", () => {
                    console.log(getKey(artist, album))
                    fs.writeFile(`./albumArt/${artist}/${album}.png`, body, 'base64', (err) => {
                        if(err) throw err;
                        uploadAlbum(`./albumArt/${artist}/${album}.png`, getKey(artist, album))
                        .then(() => {
                            setActivity(title, length, artist, album);
                            res.end("updated")
                        })
                        .catch((err) => {
                            console.error(err.response.statusText);
                        })
                    });
                });
            } else {
                setActivity(title, length, artist, album);
                res.end("updated")
            }
        });
    } else {
        setActivity(title, length, artist);
        res.end("updated")
    }
}

let lastActivityObject = {};
let pauseTime;
function setActivity(title, length, artist, album) {
    pauseTime = 0;
    lastActivityObject = {
        details: `${title} (${parseInt(length / 60)}:${pad(length % 60)})`,
        state: "by " + artist,
        startTimestamp: Date.now()
    }
    if(album) {
        lastActivityObject.largeImageKey = getKey(artist, album);
        lastActivityObject.largeImageText = album;
    }
    restartActivity();
}

function restartActivity() {
    if(pauseTime)
        lastActivityObject.startTimestamp = Date.now() - (pauseTime - lastActivityObject.startTimestamp);
    client.setActivity(lastActivityObject);
}

function pauseActivity() {
    pauseTime = Date.now();
    client.clearActivity();
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}