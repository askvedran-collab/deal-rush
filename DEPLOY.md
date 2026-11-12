# Deal Rush on Netlify, with a live leaderboard

This folder holds the game (`public/index.html`) and a small leaderboard service (`netlify/functions`) that stores scores in Netlify Blobs. No database or other account is needed.

## Deploy (GitHub, recommended)
1. Create a new GitHub repository and upload everything in this folder.
2. In Netlify choose Add new site, then Import an existing project, and pick the repository.
3. Leave the build command empty. The publish directory (`public`) and functions folder are read from `netlify.toml`.
4. Deploy. When it finishes, open your site. Play a run and check your score appears.

## Deploy (Netlify CLI)
1. Install Node.js, then run `npm install -g netlify-cli`.
2. In this folder run `netlify login`, then `netlify deploy --prod`. Create a new site when asked.

Drag and drop (Netlify Drop) cannot run the leaderboard service. If you only drop `public/index.html`, the game still works but scores stay on each phone.

## The TV dashboard
Open your site address with `#board` on the end, for example `https://your-site.netlify.app/#board`. Press F11 for full screen. It refreshes every 5 seconds and shows the top 10, player count, top score, average, how many players collected all 8 MEDDPICC letters, the latest scores and a scan-to-play QR code.

## Clearing test scores before the event
In Netlify go to Site configuration, Environment variables and add `ADMIN_KEY` with a secret value, then redeploy. To clear every score, run this (replace the address and key):
`curl -X DELETE -H "x-admin-key: YOUR_KEY" https://your-site.netlify.app/api/scores`
To remove one player add `?id=PLAYER_ID` to the address (player ids are visible at `/api/scores`).

## Notes
- Scores are sent from the player's phone, so a determined player could fake one. The service rejects anything above 40,000.
- Names are cut to 14 characters and stripped of angle brackets.
