const RPC = require("discord-rpc");

const clientId = "599134311014203402"

const client = new RPC.Client({transport: "ipc"}); 

client.on("ready", () => {
    console.log("Ready");
    setInterval(()=>{client.setActivity({
        details: "Chlorine (5:24)",
        state: "Twenty One Pilots",
        largeImageKey: "trench",
        largeImageText: "Trench",
        startTimestamp: Date.now(),//parseInt((Date.now() - 1420070400000) / 1000)
    })}, 15000);
});

client.login({clientId}).catch(console.error);