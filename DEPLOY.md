# DEPLOY.md — putting Lesson Planner online (free)

The app is a static website on Cloudflare Pages (free). No server, database or environment
variables are needed. Each teacher enters their own API key in the app.

**Live address:** <https://lesson-planner-8v2.pages.dev>

The project (`lesson-planner`) was created by **direct upload** with Cloudflare's `wrangler` tool.
This means the site does **not** update by itself when code is pushed to GitHub: it must be
uploaded again after changes (see below).

## Update the live site

On the computer with the code:

```
npm run deploy
```

This builds the app and uploads `dist` to Cloudflare. The first time on a new computer, sign in once:

```
npx wrangler@4 login
```

## Check the build before uploading

```
npm run build
npm run preview
```

Open the address it prints (usually <http://localhost:4173>) and try a deep link such as
<http://localhost:4173/history>. It must show the History page, not an error.
Deep links work on Cloudflare because of `public/_redirects`, which contains:

```
/* /index.html 200
```

## If you later want automatic updates from GitHub

Cloudflare cannot switch a direct-upload project to GitHub. Create a second Pages project in the
dashboard (**Workers & Pages** → **Create** → **Pages** → **Connect to Git**, choose
`lesson-planner`, build command `npm run build`, output directory `dist`). It gets a new
`*.pages.dev` address; share that one instead and delete the old project.

## Sharing with other teachers

Send them the link and point them to the Help page. Each teacher's data stays in their own
browser, so nobody can see anyone else's profile, sources or plans.
