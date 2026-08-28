# FORM — 3D Product Viewer Concept

An Arabic-first, bilingual 3D door configurator concept built to connect industrial product specifications with a clear browser-based experience.

The interface lets a user explore illustrative dimensions, finishes, hardware, hinge direction, opening angle, and an exploded component view. It intentionally contains no prices, quotation logic, orders, accounts, analytics, or data submission.

## Why this project exists

FORM demonstrates how a lightweight interactive model can support early manufacturing and sales conversations before a production quotation, CAD, product-information, or order-management system is implemented.

## Highlights

- Procedural Three.js model with no external 3D assets
- Arabic-first UI with complete RTL and English support
- Responsive mouse, touch, and form controls
- Live, accessible specification summary
- WebGL fallback and reduced-motion support
- Local-only language preference; no tracking or network submissions

## Stack

- React 19
- Three.js
- Vite 8
- Modern CSS
- ESLint 10

## Local development

```bash
npm install
npm run dev
```

Run all release checks:

```bash
npm run check
npm audit --audit-level=high
```

## Scope and accuracy

This is a portfolio concept. The displayed values are illustrative and are not manufacturing drawings, engineering approval, availability, or a commercial quotation.

## License

MIT
