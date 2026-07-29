# ATENX — Gym Website

A one-page site for ATENX: services, pricing, and a daily offer banner you can update
yourself from your phone or laptop — no coding needed after setup.

- `index.html` — the public website
- `admin.html` — your private update panel (linked at the very bottom of the site as "Staff Login")
- `data.json` — the pricing/offers content. The site reads this file; the admin panel writes to it.
- `style.css`, `script.js`, `admin.js` — site code, you shouldn't need to touch these.

**How the "only I can change it" part works:** anyone can *open* `admin.html`, but nothing
can be saved without a GitHub access token that only you will have. That token is what
proves it's really you — treat it like a password.

---

## Part 1 — Put the site online (one-time setup, ~10 minutes)

### Step 1: Push these files to your GitHub repo
If you already have the `atenx` repo cloned:
```bash
cd path/to/atenx
# copy all the files from this folder into the repo root
git add .
git commit -m "Add ATENX website"
git push
```
If you're starting fresh, clone your repo first: `git clone https://github.com/sahilsankeshware/atenx.git`,
then copy the files in and run the commands above.

### Step 2: Turn on GitHub Pages
1. On GitHub, open your repo → **Settings** → **Pages** (left sidebar).
2. Under "Build and deployment", set **Source** to `Deploy from a branch`.
3. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
4. Wait about a minute, then refresh — GitHub will show your live URL, something like:
   `https://sahilsankeshware.github.io/atenx/`

That URL is what you share with walk-ins — print it, put it in your Google/Instagram bio,
or generate a QR code for it (any free QR generator, e.g. qr-code-generator.com).

### Step 3: Create your personal access token (this is your "password")
1. Go to **github.com/settings/personal-access-tokens/new** (you must be signed into your GitHub account).
2. Give it a name like `atenx-admin`.
3. Under "Repository access", choose **Only select repositories** → pick `atenx`.
4. Under "Permissions" → "Repository permissions", set **Contents** to **Read and write**.
5. Generate the token and **copy it immediately** — GitHub only shows it once. Save it
   somewhere safe (a notes app, a password manager). If you lose it, just generate a new one.

### Step 4: Connect the admin panel
1. Open `https://sahilsankeshware.github.io/atenx/admin.html`
2. Paste your token in, check "Remember on this device" if this is your own phone/laptop,
   and click **Connect & load current content**.
3. You're in — edit today's offer, the ticker, pricing, or your hours, then hit
   **Publish changes to the live site**.
4. Give the site a minute, then refresh `index.html` to see it live.

Only do "Remember on this device" on devices you trust (your own phone/laptop) — not a
shared front-desk computer, since anyone using that device afterward could publish changes.

---

## Part 2 — Your everyday routine

Each morning (or whenever the offer changes):
1. Open `admin.html` (bookmark it on your phone home screen for one tap).
2. Update **Today's offer** and the **ticker** lines.
3. Click **Publish changes to the live site**.

That's it — walk-ins scanning your QR code or visiting the link always see the latest
pricing and offer, and nobody else can change it without your token.

---

## Customizing further
- **Colors/fonts/copy**: edit `style.css` and `index.html` directly, then commit and push.
- **Services/zones**: the 8 floor zones are written directly in `index.html` (search for `id="zones"`) since they change rarely — edit the text there if a class changes.
- **Repo renamed or forked**: update the `owner/repo` field on the admin login screen to match.

## If something goes wrong
- **"Token rejected"** — the token may have expired, lack Contents: Read & write, or be scoped to the wrong repo. Generate a new one (Step 3).
- **Changes not showing** — GitHub Pages can take 1–2 minutes to rebuild; hard-refresh the page (Ctrl/Cmd+Shift+R).
- **Forgot to save your token** — no problem, just create a new one (old ones can be revoked from the same GitHub settings page).
