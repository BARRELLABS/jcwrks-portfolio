# How photos get onto the live site

Short version: **Jacob edits whenever he likes for free. One click puts it live.**

## Why it works this way

Netlify bills for every production deploy. Sveltia CMS commits each upload and
each save as its own commit, so a single editing session used to fire off dozens
of deploys — 58 of them burned 870 of 1,000 monthly credits, and one afternoon
of uploading basketball photos pushed ~40 more.

Sveltia has no draft mode to batch this with. Its docs are explicit that
`publish_mode: editorial_workflow` is *"not yet supported... will be added
before the 1.0 release"*, so setting it would be silently ignored. The staging
has to happen at the git layer instead.

## The setup

| Branch | What it's for | Does Netlify build it? |
| --- | --- | --- |
| `staging` | Where the CMS writes. Every upload, edit and delete Jacob makes. | No — free |
| `main` | What's actually live at jcwrks.com | Yes — one billed deploy per push |

So Jacob can upload 200 photos across a week and it costs nothing.

## Publishing

Go to **[the Publish action](https://github.com/BARRELLABS/jcwrks-portfolio/actions/workflows/publish.yml)**
→ **Run workflow** → green button.

Everything queued on `staging` merges into `main`, Netlify builds **once**, and
the site is live a minute or two later. Ten photos or a hundred, it's one deploy.

If nothing is waiting, it says so and stops without deploying.

## The moving parts

- **`.github/workflows/publish.yml`** — the button. The only thing that moves `main`.
- **`.github/workflows/sync-staging.yml`** — after anything lands on `main`, brings
  `staging` level again so it never drags stale code back over the live site.
- **`.github/workflows/shrink-photos.yml`** — runs on `staging`, shrinks uploads and
  indexes them into the gallery JSON so they're reorderable in the CMS.
- **`netlify.toml`** `ignore` — refuses to build anything that isn't `main`.
  Fails *open*: if it can't tell what branch it's on it builds anyway, because
  a stuck site is worse than one surplus deploy.

## Gotchas

- **Jacob won't see changes on the live site until you publish.** That's the whole
  point, but it's a change from before — tell him, or he'll think it's broken.
  He can still see his photos inside the CMS.
- **Don't put `[skip ci]` in commits on `staging`.** Publishing fast-forwards `main`
  to the tip of `staging`; if that tip says `[skip ci]`, Netlify skips the one
  build that was supposed to go live.
- **Don't run `npm install --no-save` in this repo.** It reshuffles `node_modules`
  and breaks the Tailwind/Vite build locally (`Missing field tsconfigPaths`).
  `npm ci` puts it right.
