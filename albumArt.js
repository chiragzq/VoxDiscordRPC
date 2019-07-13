const fs = require("fs");
const config = require("./config")

function getExtension(path) {
    const parts = path.split(".");
    return parts[parts.length - 1];
}

async function convertImageToBase64(path) {
    fs.readFile(path, 'base64', (err, data) => {
        if(err) {
            throw err;
        }

        return `data:image/${getExtension(path)};base64,${data}`;
    });
}

export default async function upload(path, name) {
    if(!config.albumArt.enabled) {
        throw new Error("Album art uploading is disabled.");
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://discordapp.com/api/v6/oauth2/applications/${config.clientId}/assets`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", config.albumArt.authToken);

        xhr.onload = () => {
            if(xhr.status < 200 || xhr.status >= 300) {
                reject(xhr.statusText);
            }

            resolve(xhr.responseText);
        }

        xhr.send(JSON.stringify({
            image: await convertImageToBase64(path),
            name: name,
            type: 1
        }));
    });
}