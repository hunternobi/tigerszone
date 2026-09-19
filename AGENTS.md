<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git & Deployment Workflow

This repository is connected to GitHub (`origin` → `https://github.com/hunternobi/tigerszone.git`, branch `main`) and deploys to Vercel via Vercel's GitHub integration. Every push to `main` goes live to real users immediately.

## Local development uses a separate database

- `.env.local` points `MONGODB_URI` at the **dev database `tigerszone-dev`** (a copy of production in the same Atlas cluster), with `RESEND_API_KEY` disabled so no emails are sent from local. Production (`tigerszone`) is only touched by the deployed site.
- Refresh the dev copy from production with `npm run db:clone-dev` (reads production only, refuses to write to any DB not ending in `-dev`). It anonymizes all non-admin users: dummy emails, password `dev123456`, so any user can be logged into locally. Admin accounts keep their real credentials.
- The original production config is backed up in `.env.local.prod-backup` (gitignored). Never point `.env.local` back at the production DB. Actions that must change **production data** on purpose (entering real fixtures, notifications to real users, corrections) need the user's explicit go-ahead first and must run deliberately against production, e.g. `node --env-file=.env.local.prod-backup <script>`.
- Test accounts (`*@tigerszone.test`) and throwaway data belong in the dev DB only; clean them up or just re-run `npm run db:clone-dev`.

## Committing and deploying

- **After every completed change**, run `npx tsc --noEmit`, then commit locally with a concise, descriptive commit message — but **do NOT push**. Tell the user the change is ready to review locally (`npm run dev` → http://localhost:3000, dev database). Push to `origin/main` only after the user explicitly approves (e.g. "push", "deploy", "live stellen"). Approval applies to the changes reviewed, not to later ones.
- Only commit files relevant to the change. Never commit `.env*` files, credentials, or secrets. Do not commit `.claude/settings.local.json` unless the user explicitly asks to.
- Use clear commit messages describing *why*, not just *what* (e.g. "Adjust Tippspiel layout so leaderboard and rules align" rather than "update files").
- Do not force-push, rebase published history, or delete branches without explicit user confirmation — those remain governed by the general safety rules.
- Vercel auto-deploys on every push to `main` (production) and generates preview deployments for other branches/PRs. No extra deploy step is needed once an approved push succeeds.

# Communication Style

Apply the `caveman` skill (`.claude/skills/caveman/SKILL.md`) at **full** intensity from the first message of every session in this project — do not wait for a trigger phrase. Only drop it where the skill itself says to (security warnings, irreversible-action confirmations, ambiguous multi-step sequences), and fully exit it if the user says "normal mode" or "stop caveman".
