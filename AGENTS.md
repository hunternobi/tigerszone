<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git & Deployment Workflow

This repository is connected to GitHub (`origin` → `https://github.com/hunternobi/tigerszone.git`, branch `main`) and deploys to Vercel via Vercel's GitHub integration.

- **After every completed change** (a feature, fix, or adjustment the user asked for), commit the change with a concise, descriptive commit message and push it to `origin/main` — do this automatically, without asking for confirmation each time. This standing instruction is the user's explicit, durable authorization for these pushes.
- Only commit files relevant to the change. Never commit `.env*` files, credentials, or secrets. Do not commit `.claude/settings.local.json` unless the user explicitly asks to.
- Use clear commit messages describing *why*, not just *what* (e.g. "Adjust Tippspiel layout so leaderboard and rules align" rather than "update files").
- Do not force-push, rebase published history, or delete branches without explicit user confirmation — those remain governed by the general safety rules.
- Vercel is configured to auto-deploy on every push to `main` (production) and generate preview deployments for other branches/PRs. No extra deploy step is needed once the push succeeds — Vercel picks it up automatically.
