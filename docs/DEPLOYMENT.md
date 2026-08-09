# Deployment & Domain Setup

Two paths. Read the first one before you build the second — you probably only need the first
today.

---

## The short answer on forwarding

**Yes, forwarding works — but pick the right kind, because two of the three break the app.**

| Approach | Result |
|---|---|
| **Domain mapping** (recommended) | `lyrah.io` *is* the app. Real TLS cert, clean URLs, everything works. ~15 min, no CI needed. |
| **301/302 redirect** | Works, but the browser lands on the Cloud Run URL and *stays there*. Visitors see `lyrah-6050696394.us-east1.run.app` in the address bar for the rest of the session. |
| **Masked / cloaked forwarding** (iframe) | **Do not use.** Google sign-in popups fail inside a cross-origin iframe, Stripe Checkout refuses to render, and the deep links break. This is the one registrars push you toward. |

A plain redirect is a legitimate 5-minute answer if you are truly out of time. Just know the
address bar shows the ugly URL, and you will still have to authorize the domain for sign-in.
Domain mapping costs about ten minutes more and you never revisit it.

### Domain mapping (Cloud Run)

```bash
gcloud beta run domain-mappings create --service lyrah --domain lyrah.io --region us-east1
```

That prints DNS records. Add them at your registrar:

- **Apex** (`lyrah.io`) — four `A` records and four `AAAA` records that the command gives you
- **Subdomain** (`www` or `app`) — a single `CNAME` to `ghs.googlehosted.com`

Certificate provisioning takes roughly 15 minutes to a few hours. `getlyrah.com` can point at
the same service — map it too and pick one as canonical.

> If your registrar cannot do apex `A` records, use `app.lyrah.io` via CNAME instead. Simpler,
> and you avoid the apex limitation entirely.

### Then — three things that will otherwise silently break

1. **Firebase Auth authorized domains.** Firebase Console → Authentication → Settings →
   Authorized domains → add `lyrah.io`. Sign-in fails with `auth/unauthorized-domain` without
   this. This bites on redirect setups too.
2. **`APP_URL`.** Set it to `https://lyrah.io` so self-referential links stop pointing at Cloud Run.
3. **Stripe webhook endpoint.** Update it to `https://lyrah.io/api/webhook/stripe` in the Stripe
   dashboard, then copy the *new* signing secret — it differs per endpoint.

Checkout `success_url` and `cancel_url` are derived from the incoming request, so they follow
the domain automatically. Nothing to change there.

---

## Storing secrets

Two separate stores, and it matters which is which.

### Runtime secrets → Google Secret Manager

These are read by the running container. They must **never** be in the repo, in the image, or in
a GitHub Actions env var that gets echoed into a log.

```bash
printf '%s' 'sk_live_...' | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
printf '%s' 'whsec_...'   | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-
printf '%s' 'AQ...'       | gcloud secrets create GEMINI_API_KEY --data-file=-
printf '%s' 'price_...'   | gcloud secrets create STRIPE_PROD_KEY_1 --data-file=-
printf '%s' 'price_...'   | gcloud secrets create STRIPE_PROD_KEY_2 --data-file=-
```

Grant the Cloud Run runtime service account access:

```bash
gcloud secrets add-iam-policy-binding STRIPE_SECRET_KEY --member="serviceAccount:YOUR_RUNTIME_SA" --role="roles/secretmanager.secretAccessor"
```

Repeat per secret. The workflow wires them in with `--set-secrets`.

### Deploy credentials → GitHub repository secrets

Settings → Secrets and variables → Actions → New repository secret:

| Secret | What it is |
|---|---|
| `GCP_PROJECT_ID` | e.g. `gen-lang-client-0481032669` |
| `GCP_WIF_PROVIDER` | Workload Identity provider resource name |
| `GCP_SERVICE_ACCOUNT` | Deployer service account email |
| `APP_URL` | `https://lyrah.io` |

Workload Identity Federation is keyless — no JSON private key sitting in GitHub. If you have not
set it up, the workflow has a commented `credentials_json` fallback using a `GCP_SA_KEY` secret.
Works, but rotate it.

**Note:** GitHub secrets are for *deploying*. Do not put `STRIPE_SECRET_KEY` there — it belongs in
Secret Manager, where the container reads it directly and CI never sees it.

---

## GitHub Actions

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) runs on every push to `main`:
typecheck, build, then `gcloud run deploy --source .` (Cloud Buildpacks — no Dockerfile needed;
it detects Node, runs `npm run build`, and starts with `npm start`).

The server reads `PORT` from the environment, which is what Cloud Run injects.

### Moving off AI Studio

You are currently deploying from AI Studio, which owns the service. To hand over to CI:

1. Confirm the service name and region: `gcloud run services list`
2. Put `SERVICE` and `REGION` in the workflow's `env:` block to match
3. Push to `main` and watch the run

The first CI deploy replaces the AI Studio revision on the same service, so the URL and any
domain mapping survive. **Deploying from both AI Studio and CI will fight** — whichever ran last
wins. Pick one once CI is green.

---

## Pre-launch checklist

- [ ] Domain mapped, certificate issued
- [ ] `lyrah.io` added to Firebase authorized domains
- [ ] `APP_URL=https://lyrah.io`
- [ ] Stripe webhook re-pointed and its **new** signing secret stored
- [ ] `STRIPE_PROD_KEY_1` / `_2` hold `price_...` ids, not `prod_...`
- [ ] Test a real checkout, then refund it
- [ ] Confirm the Cloud Run URL is no longer advertised anywhere

### One item that is not cosmetic

`main` currently ships an unauthenticated `POST /api/subscribe` that returns
`{ isSubscribed: true }` without taking a payment, and a Stripe webhook that skips signature
verification when the header is absent. Those are survivable on an unadvertised Cloud Run URL.
On a public domain with a live Stripe key, they are a standing invitation.

The fix is already written and reviewed in PR #4. Land it before you point the domain, or
cherry-pick just that commit:

```bash
git cherry-pick 1174df2
```
