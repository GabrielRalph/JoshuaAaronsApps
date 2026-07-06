# Memory Mart!

A local recreation of the shopping-list memory cycle described for the Wonjo Kids game: preview the list, choose items from the shelf, pack the purple bag, check the remembered items, then press the green tick when ready to advance from 2 items up to 5.

The start screen lets players choose Birthday Party, Picnic, Breakfast, Fruit Shop, or Treat Day. Each theme has its own category-only item pool for both shopping lists and shelves, plus generated sound effects with a mute control, item and bag animations, round reward stickers, and a final earned-sticker collection with the correct-item score on the Great job screen.

## Squidly integration

The folder includes the Squidly-required `index.html` and `info.json` files. When `window.SquidlyAPI` is available, the game writes one primitive JSON string to `game/state` with the current screen, theme, generated round lists, shelf order, basket, review status, stickers, score, and sound setting. Remote clients listen to that path and replay the same state, so host and participant actions stay synced while still running locally when the API is not present.

Interactive controls support normal `click` and Squidly-style `access-click` activation, and each control is tagged with `access-group` and `access-order` metadata.

## Run

Serve the workspace root so the game can import `../squidly-utils.js` as an ES module:

```powershell
python -m http.server 5173
```

Then open:

```text
http://localhost:5173/shopping-list-memory-game/
```

For Squidly-style local testing, serve the workspace root with CORS enabled, for example:

```powershell
npx http-server -p 5501 --cors
```