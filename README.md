# Bhanuprasad L — Interactive 3D Product Portfolio

An editorial, scroll-driven 3D portfolio built with **React**, **React Three Fiber**, **GSAP ScrollTrigger**, **Lenis**, and **Framer Motion**. Instead of static case-study cards, the site unfolds as a continuous architectural passage leading to three interactive iPhone product worlds.

## Highlights

- **Continuous 3D Passage (`CorridorScene` & `ProductWorldScene`)**: Scroll-linked spline camera choreography with subtle roll banking, FOV breathing, and dynamic doorway lighting, backed by a graceful CSS 3D fallback when WebGL is unavailable or `prefers-reduced-motion` is enabled.
- **Desktop Scroll-Linked Portrait Morph (`HeroAboutPortrait`)**: Smoothly transitions between the Hero and About portraits at their natural aspect ratios without cropping or artificial borders.
- **Interactive iPhone Product Showcases**:
  - **StayEase** (`/products/stayease`) — Hospitality & stay booking ecosystem spanning boutique hotels, PGs, homestays, apartments, studios, and owner occupancy controls.
  - **StockPilot** (`/products/stockpilot`) — Mobile-first retail POS, barcode/SKU lookup, live shelf stock sync, and low-stock restocking workflows.
  - **Splitfin** (`/products/splitfin`) — Unified personal finance & shared group expense ledger with cent-exact split math, settlements, and category budgets (`14` unit tests in `frontend/src/lib/splitfinLedger.test.js`).
- **In-Page Resume Viewer**: Opens an interactive PDF preview modal with optional download instead of forcing an immediate file download.
- **Analytics & Contact Delivery**: Built-in route/event telemetry (`frontend/src/lib/analytics.js`) with optional Google Analytics 4 (`ga4MeasurementId`) and zero-backend Formspree / Web3Forms contact delivery (`frontend/src/data/siteConfig.js`).

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Framer Motion, GSAP (`ScrollTrigger`), Lenis, `@react-three/fiber`, `@react-three/drei`, Three.js, Lucide React
- **Tooling & Tests**: CRACO, Node.js test suite (`splitfinLedger.test.js`)

## Local Development

```bash
# Install dependencies
npm --prefix frontend install

# Start development server
npm --prefix frontend start

# Run Splitfin ledger unit tests
npm test

# Build production bundle
npm run build
```

## Configuration

Edit `frontend/src/data/siteConfig.js` to configure:
- `ANALYTICS_CONFIG.ga4MeasurementId` — Google Analytics 4 Measurement ID (`G-...`)
- `CONTACT_CONFIG.formEndpoint` or `CONTACT_CONFIG.web3formsAccessKey` — Direct inbox delivery for the contact form (falls back to `mailto:` and clipboard copy when unset)
- `RESUME_CONFIG.googleDriveFileUrl` — Optional Google Drive PDF link (falls back to `/assets/Bhanuprasad_L_Resume.pdf`)

## License

MIT © [Bhanuprasad L](https://github.com/bhanurx100)
