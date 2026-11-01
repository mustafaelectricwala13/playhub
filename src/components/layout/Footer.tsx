import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Heart, Github, Twitter, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/10 pt-12 pb-8 mt-16 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="font-arcade text-xl font-black text-white">PLAYHUB</span>
            </div>
            <p className="text-xs text-slate-400 font-display">
              Play free, instant, hyper-addictive 3D & 2D arcade mini-games right in your browser. Zero installs, instant action!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-arcade text-xs font-black text-white tracking-wider mb-3 uppercase">
              Explore
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link to="/games" className="hover:text-white transition-colors">All Mini-Games</Link></li>
              <li><Link to="/games/perfect-stack" className="hover:text-white transition-colors">Perfect Stack 3D</Link></li>
              <li><Link to="/games/one-more-try" className="hover:text-white transition-colors">One More Try!</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors">Global Leaderboard</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-arcade text-xs font-black text-white tracking-wider mb-3 uppercase">
              Categories
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link to="/games?cat=Arcade" className="hover:text-white transition-colors">Arcade Games</Link></li>
              <li><Link to="/games?cat=Puzzle" className="hover:text-white transition-colors">Puzzle & Brain</Link></li>
              <li><Link to="/games?cat=Skill" className="hover:text-white transition-colors">Skill & Reflex</Link></li>
              <li><Link to="/games?cat=Casual" className="hover:text-white transition-colors">Casual Fun</Link></li>
            </ul>
          </div>

          {/* Developer & Community */}
          <div>
            <h4 className="font-arcade text-xs font-black text-white tracking-wider mb-3 uppercase">
              Community & Admin
            </h4>
            <ul className="flex flex-col gap-2 text-xs mb-4">
              <li><Link to="/admin" className="text-indigo-400 hover:text-indigo-300 font-bold">Admin Game Manager</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Player Profile & Stats</Link></li>
            </ul>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/mustafaelectricwala13"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 PLAYHUB Online Arcade Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
            <span>for global gamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
