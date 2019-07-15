# VoxDiscordRPC
Displays current track info from VOX Music Player in the Discord game activity menu.

## Overview
It's nice to see what music your friends are listening to by looking at their current status on discord. However, I'm not a fan of spotify, so I decided to write an app to mimic Spotify's Discord rich prescense. One problem that arises is that a lot of the useful elements of Spotify's rich prescense (the current/total track time, custom images, links, and titles) are exclusive to Spotify. Also, VOX does not have any extension/scripting APIs, meaning that I had to use Apple's (poorly designed) Scripting Bridge to retrieve track info from VOX.


## Installation
1.  First, clone the repository, then install all the needed dependencies.
```bash
$ git clone https://github.com/chiragzq/VoxDiscordRPC.git
$ cd VoxDiscordRPC
$ npm install
```
2. Create a new Discord Developer project.
  * Navigate to [the Discord developers page](https://discordapp.com/developers/applications/).
  * Create a new project. Name is something like "Music", as it will displayed as `Playing <App Name>`.
  * Copy the client ID of your application. This will be important later.
3. Create a new file called `config.json` in the root directory of the repository. Copy the contents of `configtemplate.json` into it.
  * Paste your client ID into the configuration file. The `albumArt` property can be left untouched for now.
4. Run `node index.js`. Provided VOX and your discord client are open, you will see the current track info as your current game status.
  
![screenshot of discord status](https://i.imgur.com/t8xI7rm.png)

## Where is the album art!
Discord doesn't provide a way to upload images for use in the game activity status other than using the developer console. In order to prevent you from having to manually uploading all the needed album covers, the app uses your Discord authorization token to upload images to the the application when needed.  
  
Follow [this guide](https://discordhelp.net/discord-token) to get your authorization token, then modify the config to enable album art.
* Change the `albumArt.enabled` property to `true`
* Paste your authorization token into the `albumArt.authToken` field.

Now the application will upload art upon finding a song from a new album.

## Caveats
* Because of Discord's 15 second rate limiting of activity updates, scrubbing audio is not supported. The app will only listen for when the song changes and update the status when it occurs.
* Upon encountering a new album, it takes a few seconds to upload the image to the Discord developer console, making the current play time slightly behind.
* Discord has a limit of 1500 images, so if you listen to a variety of music (unlike me) you may encounter that limit.
* Half the project is written in Swift.
