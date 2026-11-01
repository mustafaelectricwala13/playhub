import React, { useState } from 'react';
import { GameRegistryItem, GameCategory } from '../types/game';
import { gamesService } from '../data/games';
import { soundManager } from '../audio/soundManager';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Star, 
  Check, 
  X,
  Layers,
  Save
} from 'lucide-react';

interface AdminPageProps {
  games: GameRegistryItem[];
  onGamesUpdated: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  games,
  onGamesUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Modal State for Add / Edit
  const [editingGame, setEditingGame] = useState<GameRegistryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<GameRegistryItem>>({
    title: '',
    slug: '',
    category: 'Arcade',
    description: '',
    longDescription: '',
    thumbnail: '',
    badge: 'NEW',
    componentName: 'External',
    iframeUrl: '',
    published: true,
    featured: false
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passcode: admin123
    if (password === 'admin123' || password === 'playhub2026') {
      setIsAuthenticated(true);
      setError('');
      soundManager.playPerfect();
    } else {
      setError('Invalid admin credentials. (Hint: admin123)');
      soundManager.playGameOver();
    }
  };

  const handleOpenAdd = () => {
    setEditingGame(null);
    setForm({
      id: `game-${Date.now()}`,
      title: '',
      slug: '',
      category: 'Arcade',
      description: '',
      longDescription: '',
      thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%234F46E5"/><text x="200" y="160" font-family="sans-serif" font-weight="900" font-size="28" fill="%23FFF" text-anchor="middle">NEW GAME</text></svg>',
      badge: 'NEW',
      plays: 100,
      rating: 5.0,
      componentName: 'External',
      iframeUrl: 'https://example.com',
      published: true,
      featured: false,
      controls: [{ action: 'Action', key: 'Tap / Click' }],
      dateAdded: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (game: GameRegistryItem) => {
    setEditingGame(game);
    setForm({ ...game });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) return;

    const gameToSave: GameRegistryItem = {
      id: form.id || `game-${Date.now()}`,
      title: form.title!,
      slug: form.slug!.toLowerCase().replace(/\s+/g, '-'),
      category: (form.category as GameCategory) || 'Arcade',
      description: form.description || '',
      longDescription: form.longDescription || '',
      thumbnail: form.thumbnail || '',
      badge: form.badge,
      plays: form.plays || 100,
      rating: form.rating || 5.0,
      componentName: form.componentName || 'External',
      iframeUrl: form.iframeUrl,
      published: form.published ?? true,
      featured: form.featured ?? false,
      controls: form.controls || [{ action: 'Play', key: 'Tap' }],
      dateAdded: form.dateAdded || new Date().toISOString().split('T')[0]
    };

    gamesService.updateGame(gameToSave);
    onGamesUpdated();
    setIsModalOpen(false);
    soundManager.playCoin();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      gamesService.deleteGame(id);
      onGamesUpdated();
      soundManager.playClick();
    }
  };

  const togglePublished = (game: GameRegistryItem) => {
    gamesService.updateGame({ ...game, published: !game.published });
    onGamesUpdated();
  };

  const toggleFeatured = (game: GameRegistryItem) => {
    gamesService.updateGame({ ...game, featured: !game.featured });
    onGamesUpdated();
  };

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="py-20 flex flex-col items-center justify-center animate-fade-in">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-arcade text-2xl font-black text-white">ADMIN PORTAL</h1>
            <p className="text-slate-400 text-xs font-display mt-1">
              Enter admin passcode to manage games registry.
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <input
              type="password"
              placeholder="Admin passcode (e.g. admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 text-center tracking-widest"
            />
            {error && <span className="text-xs text-rose-400 font-display">{error}</span>}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-arcade text-xs font-bold transition-all active:scale-95 shadow-lg"
            >
              UNLOCK DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in max-w-5xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="font-arcade text-2xl sm:text-3xl font-black text-white">
              ADMIN GAME MANAGER
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-display mt-0.5">
            Register, edit, publish, or feature mini-games on PLAYHUB without rebuilding code!
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-arcade text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW GAME</span>
        </button>
      </div>

      {/* Games Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-display">
            <thead className="bg-slate-950/80 text-slate-400 font-arcade text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="p-4">Game</th>
                <th className="p-4">Category</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                        <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-arcade text-sm font-bold text-white block">{g.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">/games/{g.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-arcade text-[10px] font-bold">
                      {g.category}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {g.componentName === 'External' ? 'Iframe / URL' : 'Native Component'}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => togglePublished(g)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-arcade font-bold transition-all ${
                        g.published
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {g.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{g.published ? 'LIVE' : 'DRAFT'}</span>
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleFeatured(g)}
                      className={`p-1.5 rounded-lg transition-all ${
                        g.featured ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={g.featured ? 'Featured on homepage' : 'Not featured'}
                    >
                      <Star className={`w-4 h-4 ${g.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Edit Game"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400"
                        title="Delete Game"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Game */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-arcade text-lg font-black text-white">
                {editingGame ? 'EDIT GAME' : 'ADD NEW GAME TO REGISTRY'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs font-display">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-arcade text-[10px] block mb-1">GAME TITLE</label>
                  <input
                    type="text"
                    required
                    value={form.title || ''}
                    onChange={(e) => {
                      const t = e.target.value;
                      setForm({
                        ...form,
                        title: t,
                        slug: form.slug || t.toLowerCase().replace(/[^a-z0-9]/g, '-')
                      });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-arcade text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-arcade text-[10px] block mb-1">SLUG (URL PATH)</label>
                  <input
                    type="text"
                    required
                    value={form.slug || ''}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-arcade text-[10px] block mb-1">CATEGORY</label>
                  <select
                    value={form.category || 'Arcade'}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-arcade text-xs focus:outline-none"
                  >
                    <option value="Arcade">Arcade</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Casual">Casual</option>
                    <option value="Skill">Skill</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-arcade text-[10px] block mb-1">BADGE (OPTIONAL)</label>
                  <select
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-arcade text-xs focus:outline-none"
                  >
                    <option value="">None</option>
                    <option value="HOT">HOT</option>
                    <option value="NEW">NEW</option>
                    <option value="POPULAR">POPULAR</option>
                    <option value="FEATURED">FEATURED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-arcade text-[10px] block mb-1">SHORT DESCRIPTION</label>
                <input
                  type="text"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-arcade text-[10px] block mb-1">
                  COMPONENT TYPE
                </label>
                <select
                  value={form.componentName || 'External'}
                  onChange={(e) => setForm({ ...form, componentName: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="PerfectStack">Native: Perfect Stack 3D</option>
                  <option value="OneMoreTry">Native: One More Try</option>
                  <option value="External">External Iframe Game</option>
                </select>
              </div>

              {form.componentName === 'External' && (
                <div>
                  <label className="text-slate-400 font-arcade text-[10px] block mb-1">IFRAME URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.iframeUrl || ''}
                    onChange={(e) => setForm({ ...form, iframeUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-arcade text-xs text-white">
                  <input
                    type="checkbox"
                    checked={form.published ?? true}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>PUBLISHED</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-arcade text-xs text-white">
                  <input
                    type="checkbox"
                    checked={form.featured ?? false}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>FEATURED ON HOMEPAGE</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-arcade text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-arcade text-xs font-bold"
                >
                  SAVE GAME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

