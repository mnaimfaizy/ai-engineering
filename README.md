# AI Engineering

A 25-lesson course that goes from what the model actually sees (tokens, the context window) to how teams ship agents safely: tools and MCP, harnesses, skills, context engineering, sub-agents, loops, graphs, evals, traces, agent security and the "software factory".

Each lesson has a picture, an interactive lab and a check. Three lessons (0021, 0023, 0024) are TypeScript exercises that run locally against a scripted model. You don't need an API key.

**Start here:** open `index.html`, or go to the live site.

## Taking the course

- Go in order. Every lesson links to the one before and after it.
- Pass the check at the end of a lesson to mark it done, or mark it done yourself.
- Progress and quiz answers are saved in your browser (`localStorage`) and never sent anywhere. To move to another device, use **Download progress** on the home page and then **Load progress file** on the new device.

### Code exercises

You need Node 22 or later, which runs `.ts` files directly, so there's nothing to install.

```bash
git clone https://github.com/mnaimfaizy/ai-engineering.git
cd ai-engineering/code/0021-write-the-loop
node check.ts
```

Each exercise folder has a `solution/` folder. Try the grader before you read it.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Course home: lesson list, progress, cheat sheets |
| `lessons/` | The 25 lessons |
| `reference/` | One-page cheat sheets, plus the map of the era |
| `assets/` | Shared CSS, the labs, images, and `course-data.js` (lesson order) |
| `assets/progress.js` | Progress tracking and prev/next navigation |
| `code/` | TypeScript exercises for 0021, 0023 and 0024 |
| `RESOURCES.md` | Primary sources behind the lessons |
| `MISSION.md`, `NOTES.md`, `learning-records/` | The author's own study notes. These aren't published to the site. |

To add a lesson, add it to `assets/course-data.js`, then add the two script tags at the bottom of the page (`course-data.js`, then `progress.js`).

## Deploying (Cloudflare Pages)

1. Push this repo to GitHub.
2. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: `node scripts/build.mjs`
   - Build output directory: `dist`
4. Under **Custom domains**, add a subdomain such as `ai-engineering.example.com`.

`scripts/build.mjs` copies only the public files into `dist/`. `_headers` serves the `.ts` and `.md` files as plain text, so browsers show them instead of downloading them.

To preview locally, run `node scripts/build.mjs`, then serve `dist/` with any static server, for example `npx serve dist`. You can also open `index.html` directly.
