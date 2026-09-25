# FORM — 3D Product Viewer

An Arabic-first, bilingual 3D door configurator that connects industrial product specifications with an interactive browser experience.

## Overview

FORM explores how lightweight 3D visualization can improve early manufacturing and sales conversations before a production quotation, CAD approval, product-information system, or order-management workflow is implemented.

## Tech Stack

- React 19 and JavaScript
- Three.js and WebGL
- Vite 8
- Modern CSS
- ESLint 10

## Key Features

- Procedural Three.js door model with no external 3D assets
- Interactive dimensions, finishes, hardware, hinge direction, and opening angle
- Exploded component view and accessible live specification summary
- Complete Arabic/English RTL/LTR interface
- Responsive mouse, touch, keyboard, and form controls
- WebGL fallback and reduced-motion support
- Local-only language preference with no tracking or data submission

## Project Structure

- `src/App.jsx` owns the controls, specification summary, localization, and lazy 3D loading.
- `src/ProductViewer.jsx` constructs and disposes the procedural Three.js model.
- `src/content.js` contains the Arabic and English product descriptions.

On low-resource devices the renderer caps pixel density and shadow resolution. If WebGL cannot start or the graphics context is lost, the viewer displays a text fallback; the product controls and specification summary remain available.

## Setup

```bash
git clone https://github.com/azizkza99/bezi-product-viewer.git
cd bezi-product-viewer
npm ci
npm run dev
```

## Quality Checks

```bash
npm run check
npm audit --audit-level=high
```

## Scope

The displayed values are illustrative. This portfolio concept is not a manufacturing drawing, engineering approval, availability statement, order, or commercial quotation.

## License

[MIT](./LICENSE)
