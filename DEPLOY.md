# DEPLOY.md — putting Lesson Planner online (free)

The app is a static website: Cloudflare Pages builds it from GitHub and serves it for free.
No server, database or environment variables are needed. Each teacher enters their own API key in the app.

## Before you start

- The code is on GitHub (repository `abbaswaseer/lesson-planner`).
- You have a free Cloudflare account: <https://dash.cloudflare.com/sign-up>.
- Nothing secret is in the repository: no API keys, no textbook files (`.gitignore` covers `.env*`, `dist`, `node_modules`).

## Check the build on your computer

```
npm install
npm run build
npm run preview
```

Open the address it prints (usually <http://localhost:4173>) and try a deep link such as
<http://localhost:4173/history>. It must show the History page, not an error.
Deep links work on Cloudflare because of `public/_redirects`, which contains:

```
/* /index.html 200
```

## Create the Cloudflare Pages project (once)

1. Open the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Allow Cloudflare to read your GitHub account, then choose the `lesson-planner` repository.
3. Build settings:
   - Framework preset: **None** (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: none
4. Press **Save and Deploy**. After a minute or two the app is live at `https://<project-name>.pages.dev`.

## Updating the app

Every push to the `main` branch on GitHub rebuilds and redeploys the site automatically.
Check the **Deployments** tab in Cloudflare if a change does not appear.

## Sharing with other teachers

Send them the `*.pages.dev` link and point them to the Help page. Each teacher's data stays in
their own browser, so nobody can see anyone else's profile, sources or plans.
