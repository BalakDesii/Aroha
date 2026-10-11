# Aroha genuine live dashboard — integration package

This package adds a secure read API to the existing GitHub Pages Mini App. It does **not** replace the TBC bot database or the existing `/daily` scoring engine.

## What it will show once connected
- Real check-in activity from the existing `checkin_activities` collection.
- Today’s activities and recent history.
- The user’s active challenge, day, level and challenge progress.
- Today’s points computed from the synced preset rules using the rule types in the exported `/daily` command.

## Architecture
- GitHub Pages serves the frontend only.
- A Cloudflare Worker provides the read API and stores user-filtered snapshots in Cloudflare KV.
- The Worker validates Telegram Mini App `initData` with a server-side bot-token secret. The browser never receives the bot token or sync secret.
- TBC posts only the current user’s activity/membership/challenge snapshot to `/sync` using a server-side shared secret.
- TBC remains the source of truth. No client-supplied XP is saved.

## 1. Deploy the Worker (free tier)
1. In Cloudflare dashboard, create a Worker named `aroha-dashboard-api`.
2. Paste `cloudflare-worker.js` as the Worker code and deploy.
3. Create a KV namespace named `AROHA_DATA`; bind it to the Worker under the variable name `AROHA_DATA`.
4. In Worker Settings → Variables and Secrets, add these **secrets**:
   - `BOT_TOKEN`: your Telegram bot token (secret, server-side only).
   - `SYNC_SECRET`: a long random secret you create (at least 32 random characters).
5. Add variable `ALLOWED_ORIGIN` = `https://balakdesii.github.io`.
6. Copy the Worker URL, e.g. `https://aroha-dashboard-api.<your-subdomain>.workers.dev`.
7. Open `https://YOUR-WORKER-URL/health`; it should return `{"ok":true,"service":"aroha-dashboard-api"}`.

Do not paste either secret into `api-config.js`, GitHub Pages, or any public repository.

## 2. Configure the frontend
Open `api-config.js`, replace `PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE` with the deployed Worker URL, then upload the updated app files to the root of the existing `balakdesii.github.io/Aroha` GitHub Pages repository. Keep the Worker file out of the public site only if you prefer; it contains no secrets, but it belongs in the Worker editor.

## 3. Add the TBC sync block
Open `TBC_LIVE_SYNC_BLOCK.txt`. Replace the two placeholders. For the first import of existing data, add `AROHA_SYNC_COMMAND.py.txt` as a `/aroha_sync` command, replacing its placeholders too, and run `/aroha_sync` in Telegram once:
- Worker URL
- same `SYNC_SECRET` value configured in Cloudflare

Paste the block **after successful storage writes** in these places:
1. In the `*` universal command’s existing `web_app_data` receiver, immediately after `Bot.saveData("checkin_activities", activities)` and after the duplicate-submission key is saved.
2. In `/ci`, after a check-in activity has been saved to `checkin_activities`.
3. In `*`, at the end of the `if update_type == "callback_query":` branch, so challenge create/join/leave actions refresh the snapshot. The callback branch already defines `user_id` as a string.

If your `/ci` code uses a different local variable name than `user_id`, set `user_id = str(message.from_user.id)` immediately before the pasted block. Do not replace the existing scoring logic or other command code.

The sync block filters records to the current Telegram user before sending them. A sync failure is swallowed so the normal bot commands keep working.

## 4. Publish and test
1. Upload the updated frontend files to GitHub Pages.
2. Open `/app` from inside Telegram (not a normal browser tab).
3. The status should change to `Connected · Live data from your Aroha bot` after the Worker has a snapshot for that user.
4. Add the included `AROHA_SYNC_COMMAND.py.txt` as a temporary `/aroha_sync` TBC command and run it once to seed your existing data. Keep the automatic sync blocks installed for future check-ins/challenge changes.
5. Compare today’s points with `/daily`. If a custom rule type exists beyond `linear_floor`, `unit_threshold`, `threshold`, `boolean`, and `efficiency_bracket`, extend the Worker scorer to match it before relying on the dashboard score.

## Important limitations
- I cannot deploy to your Cloudflare or GitHub accounts from this chat, and I have not claimed this is live until you deploy the Worker and paste the TBC sync blocks.
- The supplied TBC PDF documents webhook generation and HTTP helpers but does not document a browser-readable JSON response contract for TBC webhooks. This package uses a separate Worker rather than assuming that undocumented behavior.
- Snapshots refresh when the sync block runs. Install it in the listed write paths; otherwise the dashboard will be stale.
