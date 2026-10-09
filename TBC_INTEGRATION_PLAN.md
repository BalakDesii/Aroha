# Integration plan grounded in the uploaded export and TBC docs

## Documented by the supplied TBC PDF
- `libs.Webhook.getUrlFor(command, user_id=None, chat_id=None, bot_id=None, api_key=None, **options)` returns a signed webhook URL.
- Webhook request data can be received in TPY through `options.json` or `options.data`.
- Global `HTTP` provides `get`, `post`, `put`, `delete`, `head`, `options`, and `patch`.
- `Bot.getData` / `Bot.saveData` provide persistent bot-scoped named storage.
- The Bot API method catalogue includes `answer_web_app_query` and `set_chat_menu_button`.

## Not established by the docs
The supplied PDF does not establish CORS behavior for browser fetches to TBC webhooks, response JSON semantics, whether webhook responses can be used as a REST API, or a tested TPY snippet for sending a Web App keyboard button. Do not assume these capabilities.

## Recommended integration sequence
1. Host this static app on GitHub Pages (free).
2. Add a Telegram Web App button using a documented/verified TBC method.
3. Add a minimal TBC receiver for Telegram's `web_app_data` update, but test the actual TPY-normalized update structure first.
4. Validate `type == "aroha_miniapp_checkin_v1"`, allow only canonical task IDs from `task_list` and the active challenge level, validate quantity/unit ranges, and identify the user from Telegram update context.
5. Reuse existing activity storage and challenge reward logic. Do not accept XP from the client or write to a parallel scoring schema.
6. Initially reply in Telegram that the payload was received; only say saved after storage/scoring completes.
7. Build a read-only dashboard data path using a verified method. Never expose a bot token, global API key, or bearer webhook URL in browser code.
8. Verify one real check-in against `/ci`, `/daily`, `/history`, and `/scoreboard` before enabling for users.

## Export review
The JSON export includes 35 command definitions, including `/start`, `/challenge`, `/checkin`, `/ci`, `/daily`, `/history`, `/overall`, `/scoreboard`, `/seedtasks`, `/seedwinterarc`, and a large universal `*` handler. Existing storage names are used by the challenge/check-in commands; keep them canonical.
