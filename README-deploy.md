# Deploying the chat backend (Vercel, free tier)

This folder is a complete, deployable backend. It's two files: `api/chat.js` (the function that talks to Claude Haiku) and `package.json`. No database, no build step.

## 1. Get an API key

Go to console.anthropic.com (the Claude Developer Platform, separate from your claude.ai login), create an API key. Keep it secret, you'll paste it into Vercel in step 4, never into any file in this folder.

## 2. Get this code onto GitHub

- Create a new GitHub repository (can be private).
- Upload this whole `backend-deploy` folder to it (drag-and-drop on github.com works fine, or `git push` if you're comfortable with git).

## 3. Import into Vercel

- Go to vercel.com, sign up or log in (free tier is enough for this).
- Click "Add New Project," select the GitHub repo you just created.
- Vercel auto-detects `api/chat.js` as a serverless function. You don't need to configure a build command, framework preset, or output directory, leave defaults.
- Click Deploy.

## 4. Add your API key as an environment variable

- In the Vercel project, go to Settings -> Environment Variables.
- Add a variable named exactly `ANTHROPIC_API_KEY`, value = the key from step 1.
- Redeploy (Vercel will prompt you, or go to Deployments -> ... -> Redeploy) so the function picks up the new variable.

## 5. Get your live endpoint URL

After deployment, Vercel gives you a URL like:

```
https://eduinteractai-chat-backend.vercel.app
```

Your working chat endpoint is that URL plus `/api/chat`:

```
https://eduinteractai-chat-backend.vercel.app/api/chat
```

## 6. Lock it down to your domain

Open `api/chat.js` and check this line near the top:

```js
const ALLOWED_ORIGIN = "https://www.eduinteractai.org";
```

Make sure it matches your real live domain exactly (including `www` or not, and `https`). This stops other websites from quietly routing traffic through your API key. Commit and push the change, Vercel redeploys automatically.

## 7. Point the widget at it

In `eduinteractai-chat-widget-standalone.html`, find:

```js
var EAI_ENDPOINT = "/api/chat";
```

Change it to your full Vercel URL from step 5:

```js
var EAI_ENDPOINT = "https://eduinteractai-chat-backend.vercel.app/api/chat";
```

(A relative path like `/api/chat` only works if the widget and the backend are served from the exact same domain. Since your site and this backend are on different domains, use the full URL.)

## 8. Test it

Open your live site, click the chat bubble, ask a question. If it still falls back to the WhatsApp message, check:

- Vercel Deployments tab for a red/failed deploy
- That `ANTHROPIC_API_KEY` is spelled exactly right in Environment Variables
- Your browser's console (F12 -> Console) for the actual error, a CORS error means `ALLOWED_ORIGIN` in `api/chat.js` doesn't match your site's real domain

## Cost note

Vercel's free tier covers this comfortably at normal traffic. The Anthropic API itself is billed per message via your API key, Haiku is Anthropic's lowest-cost current model, but there is no unlimited free tier for API usage. Check current pricing on console.anthropic.com before launch so you know what to expect.
