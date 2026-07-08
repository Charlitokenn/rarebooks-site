# RareBooks vs Frappe Books: What You Get for Going Premium

RareBooks is built as a fork of the excellent open-source Frappe Books project — so this comparison is a little different. We're not knocking Frappe Books; it's a genuinely great free, offline, open-source accounting tool. But if you're deciding between the free upstream version and RareBooks, here's exactly what changes.

## Quick Comparison

| Feature | RareBooks | Frappe Books |
|---|---|---|
| Core double-entry accounting, invoicing, POS, reports | Yes | Yes |
| Cost | One-time / commercial license via AppSumo | Free, open source |
| Licensing & device management | Built-in system with online/offline validation, encrypted cache, device fingerprinting | None (no commercial licensing layer) |
| Default admin setup | Auto-created super admin on first run | Manual first-user setup |
| Expense tracking module | Custom-built, dedicated Expense entity with vendor/account/number series | Uses standard Journal Entry workflow only |
| Client Portal | Yes — license, device, and billing dashboard with mobile money support | No equivalent |
| Support | Commercial support via AppSumo/RareBooks team | Community (Telegram, GitHub Discussions) |
| Update model | Structured releases, fork-safe custom layer | Rolling open-source releases |

## Where RareBooks Adds Real Value

**1. A dedicated Expense module.** Out of the box, Frappe Books handles expenses through general Journal Entries. RareBooks adds a purpose-built Expense schema — vendor, expense account, amount, description, its own numbering series — making day-to-day expense logging faster and more structured for non-accountant users.

**2. Commercial licensing done right.** Frappe Books has no built-in licensing system because it doesn't need one — it's free. RareBooks layers in a hybrid online/offline licensing system (Keymint-based) with device-bound activation, AES-256-GCM encrypted caching, and a 7-day offline grace period, so you get commercial-grade protection without sacrificing the offline-first philosophy that made Frappe Books great in the first place.

**3. Zero-setup onboarding.** RareBooks auto-provisions a default super admin account when you create your first company, removing a manual step that Frappe Books leaves to the user.

**4. A companion web dashboard.** The RareBooks Client Portal gives you license status, device activation history, renewal management, and mobile money payment support (ClickPesa) — a layer of business-side visibility Frappe Books simply doesn't offer, because it isn't a commercial product.

## Where Frappe Books Still Makes Sense

If your priority is $0 cost and you're comfortable with community support, self-hosting your own updates, and manually managing users, Frappe Books is a genuinely excellent choice — it's the same accounting engine underneath.

## Who Should Choose RareBooks

Choose RareBooks if you want the proven Frappe Books accounting core plus a real licensing/support structure, a dedicated expense workflow, guided setup, and a web dashboard with mobile money billing — the pieces a growing business needs that a purely open-source project isn't set up to provide.

**Bottom line:** Same trusted accounting engine, packaged with the commercial support, expense tooling, and billing infrastructure a paying customer expects.
