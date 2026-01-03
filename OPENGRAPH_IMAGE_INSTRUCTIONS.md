# OpenGraph Image Setup Instructions

## CRITICAL: Missing Social Media Image

Google and social platforms currently show **NO IMAGE** when CartHost links are shared because the required `opengraph-image.png` file is missing.

## What You Need to Do

### 1. Create the Image File

Create a **1200 × 630 pixel** PNG image with the following specifications:

- **Dimensions**: 1200px wide × 630px tall (required by Facebook/LinkedIn)
- **Format**: PNG (opengraph-image.png)
- **File size**: Under 5MB
- **Content**: Should feature the CartHost brand with messaging like:
  - "Turn every rental into a sealed case file"
  - "Golf cart liability for Airbnb hosts"
  - Include CartHost logo and URL (www.carthost.app)

### 2. Add the File to Your Project

Place the file at this **exact** location:

```
/app/opengraph-image.png
```

**NOT** in `/public` — Next.js automatically discovers this file in `/app` and serves it correctly.

### 3. How Next.js Handles It Automatically

Once you add `opengraph-image.png` to `/app/`, Next.js will:

- Automatically add it to `<meta property="og:image" content="..." />`
- Automatically add it to `<meta name="twitter:image" content="..." />`
- Use the `metadataBase` URL (https://www.carthost.app) to resolve the full path
- Serve it at `https://www.carthost.app/opengraph-image.png`

**You do NOT need to manually reference it in metadata** — it's handled automatically!

### 4. Verify It Works

After deploying, test with:

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

Enter `https://www.carthost.app` and confirm the image appears.

## Design Guidelines

### Recommended Content Layout

```
┌────────────────────────────────────────┐
│  [CartHost Logo]                       │
│                                        │
│  Turn every rental into                │
│  a sealed case file                    │
│                                        │
│  Golf cart liability for Airbnb hosts  │
│                                        │
│  www.carthost.app                      │
└────────────────────────────────────────┘
```

### Brand Colors

Use CartHost's existing brand palette:
- Primary dark backgrounds
- High contrast text
- Professional, evidence-focused aesthetic (matches the "Dossier" theme)

## Why This Matters

Without this image:
- ❌ Google search results show no preview
- ❌ Social media shares look unprofessional
- ❌ Click-through rates decrease by 30-40%
- ❌ Brand recognition suffers

With the image:
- ✅ Professional appearance in search
- ✅ Higher engagement on social media
- ✅ Consistent brand presence
- ✅ Better SEO performance

## Status

- [x] Updated metadata in `app/layout.tsx` with `metadataBase`
- [x] Added comments indicating automatic image handling
- [ ] **ACTION REQUIRED**: Create and add `opengraph-image.png` to `/app/`
- [ ] Deploy and verify with social debugging tools

---

**Next Step**: Create the 1200×630px image and place it at `/app/opengraph-image.png`
