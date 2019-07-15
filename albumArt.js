const fs = require("fs");
const config = require("./config")
const axios = require("axios");

function getExtension(path) {
    const parts = path.split(".");
    return parts[parts.length - 1];
}

async function convertImageToBase64(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, 'base64', (err, data) => {
            if(err) {
                rej(err)
            }
    
            res(`data:image/${getExtension(path)};base64,${data}`);
        });
    })
}

module.exports = async (path, name) => {
    if(!config.albumArt.enabled) {
        throw new Error("Album art uploading is disabled.");
    }

    return new Promise(async (resolve, reject) => {
        axios({
            method: "POST",
            url: `https://discordapp.com/api/v6/oauth2/applications/${config.clientId}/assets`,
            data: {
                image: await convertImageToBase64(path),
                name: name,
                type: 1
            },
            headers: {
                "Authorization": config.albumArt.authToken,
                "Content-Type": "application/json"
            }
        })
        .then((resp) => {
            console.log("resolve")
            resolve(resp)
        })
        .catch(function(err)  {
            console.log(err.response.data)
            reject(err);
        });
    });
}