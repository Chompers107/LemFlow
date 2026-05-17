# LemonFlow 🍋

**Simple on the surface. Powerful underneath.**

LemonFlow is a demo DeFi routing interface for LemonChain participation across HEXDEX liquidity pools, validators, and Citron Citadel locks. It dynamically routes participation toward what LemonChain needs most — rewarding ecosystem-positive actions, not just highest APY.

---

## Features

- **HEXDEX Liquidity Routing** — multi-pool split with IL risk awareness
- **Validator Staking** — delegator and validator owner modes, lock duration slider
- **Citron Citadel Locks** — 6-month to 5-year lock tiers with drip rewards
- **Smart Mode** — AI-style ecosystem recommendations
- **Flow Forecast** — 30d / 90d / 1yr / 5yr reward projections
- **Strategy Templates** — 7 preset strategies (Safe Growth, Validator Guardian, etc.)
- **Ecosystem Heatmap** — live health signals across LemonChain systems
- **Lemon Score** — unlimited points across 6 tiers (Contributor → Lemon Legend)
- **Badge System** — 13 achievement badges with celebration animations
- **Seasonal Leaderboard** — ranked by score with projected prize payouts
- **Ecosystem Donation Pool** — optional contributions with season rewards
- **Missions** — time-limited ecosystem challenges
- **Portfolio Overview** — full position and reward summary
- **Flow Identity** — personalised ecosystem participation profile
- **Rewards Tab** — per-flow reward tracking with claim/compound/re-flow
- **Demo Mode** — everything works without real contracts

---

## Run Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Preview the build locally with:

```bash
npm run preview
```

---

## Deploy on Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New → Project**
4. Import your GitHub repository
5. Use these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

6. Click **Deploy**

Vercel will auto-deploy on every push to `main`.

---

## Deploy on Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. **Add new site → Import from Git**
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

---

## Project Structure

```
lemonflow/
├── index.html          # HTML entry point
├── vite.config.js      # Vite config
├── package.json        # Dependencies and scripts
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React root mount
    ├── index.css       # Global reset
    └── App.jsx         # Full LemonFlow application
```

---

## Tech Stack

- **React 18** with hooks (`useState`, `useReducer`, `useMemo`, `useEffect`, `useRef`)
- **Vite 5** for fast dev and optimised production builds
- **Zero external UI libraries** — all styles inline via JS style objects
- **Google Fonts** — DM Sans + DM Mono (loaded via CSS `@import`)

---

## Demo Disclaimer

> This is a simulated demo interface. No real tokens are moved. All rewards, scores, and pool data are for demonstration purposes only. LemonFlow never executes transactions without explicit user confirmation.

---

## License

MIT
