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
Discord doesn't provide a way to upload images for use in the game activity status other than using the developer console. In order to prevent you from having to manually uploading all the needed album covers, the app uses your Discord authorization token to upload images to the the application when needed. Obviously giving an application your authorization token is a security risk, but you can look over the code to see that I only use it to upload album art. If you still don't trust me, feel free to turn off album art.
  
Follow [this guide](https://discordhelp.net/discord-token) to get your authorization token, then modify the config to enable album art.
* Change the `albumArt.enabled` property to `true`
* Paste your authorization token into the `albumArt.authToken` field.

Now the application will upload art upon finding a song from a new album.

## Scripting Bridge
To fetch track info from Vox, I wrote a small command line application in Swift to listen for song and play/pause changes. The node application opens a HTTP server on port 38787 to allow communication with the Swift app. This causes a little bit of lag time when transitioning between songs, so the current play time on the Discord status isn't 100% correct, but it's close enough.

## Play / Pause
The app will also listen for play / pause events and handle them accordingly. When you pause, the app will clear your current game status. On play events, the app will show the game status again, and will set the current track time to the time when the song was paused. This means that if you pause and then move to a different portion of the song, the status will not be accurate, so try not to do that. The app will still listen for song change events even when paused. 

## Warnings
* Because of Discord's 15 second rate limiting of activity updates, scrubbing audio is not supported. It's just not worth it to adjust for audio scrubbing when it takes 15 seconds for it to update (who actually forwards through a song?). The app displays the current song time relative to the time it received the changed song event (obviously accounting for paused time).
* If you listen to the same song on loop, the app never resets the current song time. The solution to this is to not listen to the same song on loop.
* Upon encountering a new album, it takes a few seconds to upload the image to the Discord developer console, making the current play time slightly behind.
* Discord has a limit of 150 images, so if you listen to a variety of music (unlike me) you may encounter that limit. You can avoid this by turning off album art.
* Half the project is written in Swift. (How did Apple manage to make Xcode worse than Android Studio?!?)
