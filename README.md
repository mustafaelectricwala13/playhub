# 🕹️ PLAYHUB — Multi-Game Online Arcade Platform

> **PLAY. COMPETE. REPEAT.** — A modern, scalable online gaming portal featuring built-in 3D and 2D arcade mini-games, instant guest play, global leaderboards, viral social challenges, and a modular architecture ready for 50+ games.

---

## 🚀 Built-In Featured Games

### 1. 🏗️ **PERFECT STACK (3D Arcade Physics Game)**
- **Three.js 3D Isometric Engine**: Real 3D block stacking with soft shadows and isometric perspective.
- **Real Slicing Math**: Accurate geometry slicing when blocks overlap partially — the overhang falls realistically with physics gravity, tumbling rotation, and fading.
- **Combo Crescendo**:
  - Perfect placements within threshold trigger harmonic musical chimes that ascend up the musical scale as your tower rises!
  - Consecutive combos award bonus points and expand tower width.
- **Speed Progression**: Movement accelerates smoothly as tower height climbs.
- **Viral WhatsApp Sharing**: One-click score challenge link sharing.

### 2. ⚡ **ONE MORE TRY! (Neon Reflex Survival Runner)**
- **60 FPS Canvas Physics**: Control a glowing hyper-orb dodging procedurally generated sliding gates, rotating crosshairs, and pulsing hazard orbs.
- **Near-Miss Graze Mechanic**: Graze obstacles within pixels to earn bonus points and trigger screen shake!
- **Power-Ups**: Shields, Magnets, Slow-Mo Matrix time-dilation, and 2X Multipliers.

---

## 🌟 Platform Features

1. **Central Scalable Game Registry (`src/data/games.ts`)**:
   - Add new games in seconds by registering metadata: `id, title, slug, category, thumbnail, componentName / iframeUrl, published, featured, controls`.
   - Supports both **Native React Game Components** and **External Iframe Embeds**.
2. **Dedicated Game Pages (`/games/:slug`)**:
   - Full theater / fullscreen mode
   - Custom controls reference guide
   - Personal record tracking
   - Social share buttons (WhatsApp, Twitter, Link copy)
   - Related games recommendation carousel
3. **Admin Game Management Dashboard (`/admin`)**:
   - Protected with admin passcode (`admin123`)
   - Add new games to the portal live
   - Edit titles, slugs, categories, descriptions, and thumbnails
   - Toggle "LIVE" (published) or "DRAFT", and feature games on the homepage
4. **Instant Guest Play & Persistence**:
   - Zero forced logins.
   - Favorites bookmarking, match count, coins wallet, and high scores persist via LocalStorage.
5. **Universal Web Audio Synthesizer**:
   - 100% procedural audio via Web Audio API — zero external `.mp3` loading issues or latency!
6. **Monetization Ready**:
   - Non-intrusive AdSense / H5 Games Ads banner placeholders outside gameplay.
   - Rewarded video ad hook for bonus coins / extra lives (disabled until approved).
7. **PWA & Mobile First**:
   - Installable PWA with offline caching service worker.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6 (with `vercel.json` SPA rewrite rules)
- **3D Graphics**: Three.js (WebGL PCF Soft Shadows & Orthographic Camera)
- **Styling**: Tailwind CSS + Custom Arcade Neon Shadows
- **Icons**: Lucide React
- **Celebration**: Canvas-Confetti
- **Backend / Leaderboard**: Supabase Client with graceful offline fallback

---

## 📦 How to Add a New Game in 30 Seconds

Open `src/data/games.ts` and add an entry:

```typescript
{
  id: "your-game-id",
  title: "Your Game Title",
  slug: "your-game-title",
  category: "Arcade", // 'Arcade' | 'Puzzle' | 'Casual' | 'Skill'
  description: "Short game teaser",
  thumbnail: "/thumbnail.png", // or SVG data URI
  componentName: "YourComponent", // or 'External' with iframeUrl
  published: true,
  featured: true,
  controls: [{ action: "Jump", key: "Space" }],
  dateAdded: "2026-11-01"
}
```

Or simply log into `/admin` and click **"ADD NEW GAME"** from the web UI!

---

## 🏁 Quickstart & Deployment

### Local Development:
```bash
cd playhub
npm run dev
```

### Production Build:
```bash
npm run build
```

### Deploy to Vercel:
1. Push to GitHub.
2. Import repository in [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Vite** (auto-detected).
4. Click **Deploy**!

