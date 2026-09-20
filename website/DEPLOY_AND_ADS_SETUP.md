# Timing Orbit — Website, Domain, app-ads.txt & Ad Network Setup

This is the step-by-step for the 4 things you asked for: a live website with
app-ads.txt on your own domain, banner ads (done, see below), and adding
Meta / InMobi / ironSource as ad networks.

I can't create accounts, buy a domain, or enter payment info for you — those
steps are marked **[YOU DO THIS]**. Everything else is already done in the
code/repo.

---

## 1. The website (already built)

Location in the repo: `website/` — 4 static files, no build step needed:
- `index.html` — landing page
- `privacy.html` — privacy policy (updated to disclose the ad SDKs — see note below)
- `support.html` — support/contact page
- `app-ads.txt` — template, needs real network IDs pasted in (see §3)

### [YOU DO THIS] Buy a domain
Any registrar works: Cloudflare Registrar (cheapest, no markup), Namecheap,
or Google Domains' successor (Squarespace Domains). Something like
`timingorbitgame.com` or `.app` is fine. This is a purchase, so it has to be
you.

### [YOU DO THIS] Host the website (free)
Easiest option — **Cloudflare Pages** (free, fast, simplest DNS if you also
bought the domain through Cloudflare):
1. Create a free Cloudflare account.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets.
3. Upload everything inside the `website/` folder (drag the 4 files in — not
   the folder itself).
4. Once deployed, go to your Pages project → Custom domains → add your
   domain, and follow the DNS instructions it gives you.

Alternative: **GitHub Pages** — push the `website/` folder's contents to a
repo, enable Pages in repo Settings → Pages, point your domain's DNS at
GitHub Pages per their custom-domain docs.

Once live, `app-ads.txt` must be reachable at exactly:
`https://your-domain.com/app-ads.txt` (site root, not a subfolder).

### [YOU DO THIS] Point App Store Connect at the domain
App Store Connect → your app → App Information:
- **Marketing URL**: `https://your-domain.com`
- **Support URL**: `https://your-domain.com/support.html`
- (Privacy Policy URL field, if separate): `https://your-domain.com/privacy.html`

This is what lets AdMob (and other networks) crawl and verify your
app-ads.txt against your App Store listing.

---

## 2. Banner ads — done

Implemented end-to-end (native Swift plugin + TS service + UI wiring):
banner shows on the main menu only (hidden behind Settings/Unlocks/How-To-
Play/Privacy modals), via Unity Ads.

### [YOU DO THIS] One thing needed for it to actually show ads
In the Unity Ads dashboard → Monetization → Placements → Add Placement,
create a **Banner** placement with the exact ID `Banner_iOS` (this exact
string is already wired into the code). Until that placement exists, the
banner code silently does nothing — no crash, it just won't load, which is
expected.

---

## 3. Adding Meta, InMobi, and ironSource

The cleanest way to add all three without re-doing the ad integration is
**Unity LevelPlay mediation** — it plugs additional networks in as "demand
sources" behind the Unity Ads SDK you already have installed, rather than
needing 3 separate native SDKs.

### [YOU DO THIS] Accounts + IDs you need to create
1. **Meta Audience Network** — developers.facebook.com → create an app →
   Monetization Manager → add your iOS app → get a **Placement ID**.
2. **InMobi** — inmobi.com → publisher account → add app → get an **App ID**
   / placement ID.
3. **ironSource / LevelPlay** — this is the same Unity dashboard you already
   use for Unity Ads (Unity acquired ironSource; it's the "LevelPlay"
   mediation panel) — Monetize → Mediation → enable ironSource as a network,
   plus enable Meta and InMobi as mediated networks in the same panel if you
   want Unity to manage all three centrally instead of separate SDKs.
4. In the LevelPlay mediation dashboard, add each network's App ID/API key
   you got in steps 1–2 as a "mediated network."

### What I'll do once you have those IDs
Send me the App IDs / placement IDs (not API secrets/payment info) for
whichever networks you've set up, and I'll wire the mediation config into
`src/services/unityAds.ts` and the native plugin so all networks compete for
each ad request automatically — no other code changes needed.

### Then, once ads are actually serving from each network
Each network's dashboard gives you its own `app-ads.txt` line (see the
comments already in `website/app-ads.txt`) — paste each one in and
redeploy the site.

---

## 4. Quick checklist

- [ ] Buy domain **[YOU DO THIS]**
- [ ] Deploy `website/` to Cloudflare Pages or GitHub Pages **[YOU DO THIS]**
- [ ] Point domain DNS at host **[YOU DO THIS]**
- [ ] Set Marketing URL / Support URL in App Store Connect **[YOU DO THIS]**
- [x] Banner ads implemented
- [ ] Create `Banner_iOS` placement in Unity dashboard **[YOU DO THIS]**
- [ ] Create Meta / InMobi accounts + get IDs **[YOU DO THIS]**
- [ ] Enable ironSource + Meta + InMobi in LevelPlay mediation panel **[YOU DO THIS]**
- [ ] Send me the IDs so I can wire mediation config
- [ ] Fill in real lines in `app-ads.txt` per network, redeploy site
