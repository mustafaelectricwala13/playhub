import { GameRegistryItem } from '../types/game';
import { storageService } from '../services/storage';

export const INITIAL_GAMES: GameRegistryItem[] = [
  {
    id: 'perfect-stack',
    title: 'Perfect Stack',
    slug: 'perfect-stack',
    category: 'Arcade',
    description: 'Stack moving 3D blocks with razor-sharp precision. Cut off overhangs and reach the clouds!',
    longDescription: 'Test your timing and spatial perception in Perfect Stack. Tap to drop moving 3D blocks directly onto your growing skyscraper. Perfectly align blocks to trigger combo crescendo sounds, expand your tower base, and climb the global leaderboards!',
    thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%236366F1"/><stop offset="100%" stop-color="%23EC4899"/></linearGradient><linearGradient id="b1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%23F43F5E"/><stop offset="100%" stop-color="%23FB7185"/></linearGradient><linearGradient id="b2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23FBBF24"/></linearGradient><linearGradient id="b3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%2334D399"/></linearGradient><linearGradient id="b4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%2306B6D4"/><stop offset="100%" stop-color="%2338BDF8"/></linearGradient></defs><rect width="400" height="300" fill="url(%23bg)"/><g transform="translate(140, 70)"><polygon points="60,0 120,30 60,60 0,30" fill="url(%23b4)"/><polygon points="0,30 60,60 60,95 0,65" fill="%230284C7"/><polygon points="60,60 120,30 120,65 60,95" fill="%230369A1"/><g transform="translate(0, 35)"><polygon points="60,0 120,30 60,60 0,30" fill="url(%23b3)"/><polygon points="0,30 60,60 60,95 0,65" fill="%23059669"/><polygon points="60,60 120,30 120,65 60,95" fill="%23047857"/></g><g transform="translate(0, 70)"><polygon points="60,0 120,30 60,60 0,30" fill="url(%23b2)"/><polygon points="0,30 60,60 60,95 0,65" fill="%23D97706"/><polygon points="60,60 120,30 120,65 60,95" fill="%23B45309"/></g><g transform="translate(0, 105)"><polygon points="60,0 120,30 60,60 0,30" fill="url(%23b1)"/><polygon points="0,30 60,60 60,95 0,65" fill="%23E11D48"/><polygon points="60,60 120,30 120,65 60,95" fill="%23BE123C"/></g></g></svg>',
    badge: 'HOT',
    plays: 14820,
    rating: 4.9,
    componentName: 'PerfectStack',
    published: true,
    featured: true,
    controls: [
      { action: 'Drop Block', key: 'Tap / Click / Spacebar' },
      { action: 'Pause Game', key: 'P / Escape' }
    ],
    dateAdded: '2026-11-01'
  },
  {
    id: 'one-more-try',
    title: 'One More Try!',
    slug: 'one-more-try',
    category: 'Arcade',
    description: 'Fast-paced neon arcade survival. Dodge moving lasers, graze obstacles, and challenge friends!',
    longDescription: 'Control a glowing hyper-orb through an infinite corridor of procedurally generated sliding gates and spinning laser bars. Collect gems, unlock power-ups, and enjoy instant 0ms restarts in this addictive reflex survival game.',
    thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23080811"/><stop offset="100%" stop-color="%231E1B4B"/></linearGradient><linearGradient id="orb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23FFFFFF"/><stop offset="50%" stop-color="%2300F0FF"/><stop offset="100%" stop-color="%230055FF"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="300" fill="url(%23bg2)"/><line x1="80" y1="0" x2="80" y2="300" stroke="%2300F0FF" stroke-opacity="0.3" stroke-width="3"/><line x1="320" y1="0" x2="320" y2="300" stroke="%2300F0FF" stroke-opacity="0.3" stroke-width="3"/><rect x="80" y="70" width="100" height="20" rx="6" fill="%23FF0055" filter="url(%23glow)"/><rect x="230" y="70" width="90" height="20" rx="6" fill="%23FF0055" filter="url(%23glow)"/><rect x="140" y="160" width="130" height="18" rx="6" fill="%23FFE600" filter="url(%23glow)"/><circle cx="200" cy="230" r="22" fill="url(%23orb)" filter="url(%23glow)"/></svg>',
    badge: 'POPULAR',
    plays: 28450,
    rating: 4.95,
    componentName: 'OneMoreTry',
    published: true,
    featured: true,
    controls: [
      { action: 'Change Direction', key: 'Tap / Click / Spacebar' },
      { action: 'Direct Steer', key: 'Arrow Keys / A, D' }
    ],
    dateAdded: '2026-10-31'
  },
  {
    id: 'brain-trap',
    title: 'Brain Trap: Reflex',
    slug: 'brain-trap',
    category: 'Puzzle',
    description: 'Rapid-fire color & cognitive reaction challenge. Keep your brain focused under timer pressure!',
    longDescription: 'Can you trust your eyes? When the word "BLUE" is written in bright red, which button do you click? Brain Trap tests your reaction speed and Stroop effect cognitive agility.',
    thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231E1B4B"/><stop offset="100%" stop-color="%23312E81"/></linearGradient></defs><rect width="400" height="300" fill="url(%23bg3)"/><circle cx="200" cy="130" r="65" fill="%234338CA"/><text x="200" y="145" font-family="sans-serif" font-weight="900" font-size="36" fill="%23F43F5E" text-anchor="middle">BLUE?</text><rect x="100" y="215" width="85" height="40" rx="12" fill="%23F43F5E"/><rect x="215" y="215" width="85" height="40" rx="12" fill="%2338BDF8"/></svg>',
    badge: 'NEW',
    plays: 9120,
    rating: 4.7,
    componentName: 'External',
    iframeUrl: 'about:blank',
    published: true,
    featured: false,
    controls: [
      { action: 'Choose Answer', key: 'Tap / Click Colors' }
    ],
    dateAdded: '2026-11-01'
  },
  {
    id: 'retro-glide',
    title: 'Retro Glide 2048',
    slug: 'retro-glide',
    category: 'Casual',
    description: 'Satisfying sliding numbers with synthwave aesthetic and chill beats.',
    longDescription: 'Merge geometric neon cubes in this modern take on the classic sliding puzzle with dynamic ambient soundscapes.',
    thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230F172A"/><stop offset="100%" stop-color="%231E293B"/></linearGradient></defs><rect width="400" height="300" fill="url(%23bg4)"/><g transform="translate(110, 60)"><rect x="0" y="0" width="80" height="80" rx="16" fill="%23EC4899"/><text x="40" y="50" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">512</text><rect x="100" y="0" width="80" height="80" rx="16" fill="%238B5CF6"/><text x="140" y="50" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">1024</text><rect x="0" y="100" width="80" height="80" rx="16" fill="%2306B6D4"/><text x="40" y="150" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">2048</text><rect x="100" y="100" width="80" height="80" rx="16" fill="%2310B981"/><text x="140" y="150" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">4096</text></g></svg>',
    plays: 12400,
    rating: 4.8,
    componentName: 'External',
    iframeUrl: 'about:blank',
    published: true,
    featured: false,
    controls: [
      { action: 'Slide Grid', key: 'Swipe / Arrow Keys' }
    ],
    dateAdded: '2026-10-28'
  },
  {
    id: 'orbital-dash',
    title: 'Orbital Dash',
    slug: 'orbital-dash',
    category: 'Skill',
    description: 'Slingshot between gravity rings while avoiding incoming space anomalies.',
    longDescription: 'Use momentum and precision timing to slingshot your spacecraft from one gravitational orbit to the next.',
    thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="bg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23030712"/><stop offset="100%" stop-color="%23111827"/></linearGradient></defs><rect width="400" height="300" fill="url(%23bg5)"/><circle cx="130" cy="150" r="50" stroke="%2338BDF8" stroke-dasharray="6,6" stroke-width="2" fill="none"/><circle cx="130" cy="150" r="16" fill="%2338BDF8"/><circle cx="270" cy="150" r="60" stroke="%23F43F5E" stroke-dasharray="6,6" stroke-width="2" fill="none"/><circle cx="270" cy="150" r="22" fill="%23F43F5E"/><circle cx="170" cy="115" r="7" fill="%23FBBF24"/></svg>',
    plays: 7850,
    rating: 4.65,
    componentName: 'External',
    iframeUrl: 'about:blank',
    published: true,
    featured: false,
    controls: [
      { action: 'Jump Orbit', key: 'Tap / Click / Spacebar' }
    ],
    dateAdded: '2026-10-25'
  }
];

export const gamesService = {
  getAllGames(): GameRegistryItem[] {
    const custom = storageService.getAdminGames();
    return custom || INITIAL_GAMES;
  },

  getPublishedGames(): GameRegistryItem[] {
    return this.getAllGames().filter(g => g.published);
  },

  getGameBySlug(slug: string): GameRegistryItem | undefined {
    return this.getAllGames().find(g => g.slug === slug);
  },

  getFeaturedGames(): GameRegistryItem[] {
    return this.getPublishedGames().filter(g => g.featured);
  },

  getGamesByCategory(category: string): GameRegistryItem[] {
    if (!category || category === 'All') {
      return this.getPublishedGames();
    }
    return this.getPublishedGames().filter(g => g.category.toLowerCase() === category.toLowerCase());
  },

  updateGame(updated: GameRegistryItem) {
    const list = this.getAllGames();
    const idx = list.findIndex(g => g.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    storageService.saveAdminGames(list);
  },

  deleteGame(id: string) {
    const list = this.getAllGames().filter(g => g.id !== id);
    storageService.saveAdminGames(list);
  }
};

