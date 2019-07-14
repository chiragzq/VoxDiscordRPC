const RPC = require("discord-rpc");
const config = require("./config.json")
const uploadAlbum = require("./albumArt");
const http = require("http");
const urllib = require("url");
const fs = require("fs")

const client = new RPC.Client({transport: "ipc"}); 

client.on("ready", () => {
    console.log("Ready");
});

client.login({clientId: config.clientId}).catch(console.error);

// server to listen for updates from scripting bridge
http.createServer((req, res) => {
    const url = urllib.parse(req.url, true);
    if(url.pathname != "/") {
        res.writeHead(404);
        res.end("Not found")
    }
    console.log(url)
    update(url.query.title, url.query.artist, url.query.length);
    res.end("updated")
}).listen(38787);

function update(title, artist, length) {
    client.setActivity({
        details: `${title} (${parseInt(length / 60)}:${pad(length % 60)})`,
        state: artist,
        largeImageKey: "trench",
        largeImageText: "Trench",
        startTimestamp: Date.now(),//parseInt((Date.now() - 1420070400000) / 1000)
    });
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}