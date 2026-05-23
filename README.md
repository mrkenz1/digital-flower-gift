# Digital Flower Gift

Premium romantic single-page web experience with a password gate, cinematic loading screen, and an interactive frozen botanical island gallery for Rose, Tulip, and Lily.

Built with React, Vite, Three.js, @react-three/fiber, @react-three/drei, Tailwind CSS, and Framer Motion. It is designed to deploy as a static GitHub Pages site and open from a QR code.

## Live Site

Open the hosted gift here:

```text
https://mrkenz1.github.io/digital-flower-gift/
```

The in-app QR button is pinned to this live GitHub Pages URL, so it stays shareable even when you run the project locally.

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite.

## Change The Password

Open `src/components/PasswordGate.jsx` and edit:

This is a simple client-side password gate for a romantic gift website, not a high-security login system.

## Change Flower Texts

Open `src/data/flowers.js`.

You can edit the Mongolian titles, meanings, romantic interpretations, descriptions, and the shared section titled:

```js
export const whyTheseFlowers = {
  title: "Яагаад энэ 3 цэцгийг сонгосон бэ?",
  text: "...",
};
```

## Adjust The 3D Scene

The rotating 3D island and flowers are built procedurally in:

```text
src/components/FlowerScene.jsx
```

You can tune flower placement in `FLOWER_POSITIONS`, and adjust the rock, crystals, icicles, petals, colors, and lighting inside the same file.

## Day And Night Mode

The gallery has a day/night switch in the top-left corner.

- Day mode keeps the soft pastel cloudy background.
- Night mode changes the scene to a deep starry sky with moving stars, a blue Milky Way glow, and shooting star animations.

You can adjust the switch UI and night sky animation in:

```text
src/components/ThemeSwitch.jsx
src/index.css
```

## Replace Or Disable Background Music

Background music is optional. The current music control uses this YouTube link:

```text
https://youtu.be/9Zq79uu_o5E?si=Hz82hsTr6S12CYf0
```

To change the song, open `src/components/BackgroundMusic.jsx` and edit:

```js
const YOUTUBE_MUSIC_URL = "https://youtu.be/9Zq79uu_o5E?si=Hz82hsTr6S12CYf0";
```

The YouTube player starts muted by default because browsers often block sound autoplay. Use the music buttons in the gallery to play, pause, mute, or unmute.

To disable music completely:

```js
const ENABLE_BACKGROUND_MUSIC = false;
```

To use a local audio file instead, place your audio file here:

```text
public/audio/ambient.mp3
```

Then edit:

```js
const MUSIC_SOURCE = "audio";
const BACKGROUND_MUSIC_URL = "/audio/ambient.mp3";
```

## Build

```bash
npm run build
```

The production files are created in `dist/`.

## Deploy To GitHub Pages

This project is configured for a GitHub repository named:

```text
digital-flower-gift
```

The Vite base path is set in `vite.config.js`:

```js
base: command === "build" ? "/digital-flower-gift/" : "/",
```

If your GitHub repository has a different name, replace `/digital-flower-gift/` with `/<your-repository-name>/`.

Then deploy:

```bash
npm run deploy
```

The current live URL is:

```text
https://mrkenz1.github.io/digital-flower-gift/
```

For another account, your deployed URL will look like:

```text
https://your-username.github.io/digital-flower-gift/
```

You can also deploy manually by running `npm run build` and publishing the `dist/` folder with your preferred GitHub Pages workflow.

## Create A QR Code

Do not hardcode a QR image into the website.

The gallery includes a `QR` button that opens a QR code for the live GitHub Pages URL:

```text
https://mrkenz1.github.io/digital-flower-gift/
```

To share it:

1. Open the deployed site and click `QR`.
2. Click `QR татах` to download the QR code as a PNG image.
3. You can also click `Линк хуулах` to copy the live URL.
4. Print or share the downloaded QR image.
5. When someone scans it, it opens this website.

Example URL:

```text
https://your-username.github.io/digital-flower-gift/
```
