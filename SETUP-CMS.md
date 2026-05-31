# Photo CMS — how Jacob manages galleries

The site has a built-in content manager so Jacob can add/remove gallery photos
himself — no code. It's **Sveltia CMS** (free, no watermark).

- Admin page: **/admin** (e.g. `jcwrks.com/admin`)
- He picks a gallery (Basketball, Portraits, etc.), uploads photos, hits publish.
- Publishing saves the photos to the site's GitHub repo, which auto-rebuilds &
  redeploys. Photos appear live in a minute or two.

Galleries are stored in `src/data/galleries/<slug>.json`; uploaded photos go to
`public/galleries/<slug>/`. The site reads these automatically.

---

## ✅ Already done (works now)
- All 11 galleries are wired to the CMS and render real photos with a lightbox.
- Empty galleries show "Photos coming soon."
- `/admin` loads. Config is at `public/admin/config.yml`.
- Verified locally: build passes, galleries render, admin serves.

## 🔧 To make the LOGIN work (needs your accounts — do at launch)
The CMS login uses GitHub, so the site must be on GitHub + deployed first.

1. **Put the project on GitHub**
   - Create a repo (e.g. `jcwrks-portfolio`), push this folder to it.

2. **Deploy** (Netlify or Cloudflare Pages — both free)
   - Connect the GitHub repo; build command `npm run build`, output `dist`.
   - Point his domain at it.

3. **Set the repo in the CMS config**
   - In `public/admin/config.yml`, change `repo: OWNER/REPO` to the real repo
     (e.g. `jasoncombs/jcwrks-portfolio`) and confirm `branch` (main/master).

4. **Turn on GitHub login for Sveltia**
   - Easiest: deploy the tiny **`sveltia-cms-auth`** Cloudflare Worker (free) and
     create a GitHub OAuth App — follow:
     https://github.com/sveltia/sveltia-cms#github-backend
   - Add the Worker URL to config.yml under `backend` as documented there.
   - (If hosting on Netlify, you can instead use Netlify's GitHub OAuth provider.)

5. **Add Jacob as a collaborator** on the GitHub repo so his login can publish.

After that, Jacob goes to `yoursite.com/admin`, clicks "Login with GitHub," and
manages photos.

---

## 🧪 Test the editor locally (optional, before deploy)
You can try the editing experience without GitHub:
```
# terminal 1
npx @sveltia/cms-server      # local backend proxy (or: npx decap-server)
# terminal 2
npm run dev
```
Open http://localhost:4321/admin/ — it uses your local files (the
`local_backend: true` line in config.yml). Add a photo, save, and it writes to
the JSON + public/galleries on disk. **Remove `local_backend: true` is NOT needed**
— it's ignored in production.

---

## Note
- `public/galleries/basketball/test-1.jpg` + `test-2.jpg` are TEST photos I added
  to prove it works. Delete them (or let Jacob replace them) — basketball.json
  points to them.
- Uploaded photos aren't auto-compressed. Tell Jacob to export web-size (long edge
  ~2000px) so the site stays fast.
