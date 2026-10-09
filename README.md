# Aroha Mini App — V1 starter

A mobile-first cream-and-sage Telegram Mini App UI for the existing Aroha / ChallengeV2 bot.

## What works now
- Responsive home screen, progress ring, task controls, challenge card, navigation, preview state.
- Uses Telegram Web Apps SDK and calls `Telegram.WebApp.sendData()` when launched inside Telegram.
- Sends selected task IDs and values only. The bot must validate the payload and calculate actual rewards server-side.
- No API token, Groq key, webhook secret, or bot credentials are included in these frontend files.

## Important: not yet a fully live integration
Your uploaded TBC docs confirm `libs.Webhook.getUrlFor(...)`, incoming webhook `options`, `HTTP` helpers, and persistent `Bot.getData` / `Bot.saveData`. They do **not** document browser CORS, webhook response-body behavior, or confirm the exact Mini App button support exposed by your current TBC wrapper. This package therefore does not pretend to read live challenge data or claim check-ins are saved just because the UI button was tapped.

The current app sends check-ins through Telegram's Mini App `sendData` channel. TBC needs a receiver that safely reads Telegram's `web_app_data`, validates the user's task IDs/values, and calls/reuses the established check-in/scoring engine. Then a separate verified read path is needed for live challenge status/history. Do not overwrite the existing challenge collections or create a duplicate points database.

## Canonical Aroha data to preserve
- `challenge_presets`
- `challenge_instances`
- `challenge_memberships` (support `instance_id` and legacy `challenge_id`)
- `task_list`
- `checkin_activities`
- Existing `/checkin`, `/ci`, `/daily`, `/history`, `/overall`, `/scoreboard`

## Free static hosting: GitHub Pages
1. Create a GitHub repository called `aroha-miniapp`.
2. Upload the files in this folder to the repository root.
3. Repository Settings → Pages → deploy from branch → `main` → `/ (root)`.
4. Wait for GitHub to show the public HTTPS Pages URL.
5. Keep all secrets out of the repository.

## Telegram opening button
Use a Telegram Web App button (inline keyboard or menu button) pointing to the HTTPS Pages URL. The supplied docs list `set_chat_menu_button` among Bot API methods, but do not provide a TBC-specific example for setting a Web App button; verify the exact method/wrapper in TBC before editing production `/start`.

## Before calling it live
- Add a secure receiver that identifies the Telegram user from the actual Telegram update, not from a JavaScript-supplied user ID.
- Reuse the existing check-in schema and scoring engine; client-supplied XP must never be trusted.
- Read dashboard/challenge/history data only for the authenticated user.
- Test one activity and confirm it agrees with `/ci`, `/daily`, `/history`, and group scoreboard where applicable.
