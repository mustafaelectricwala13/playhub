import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameRegistryItem, UserStats } from './types/game';
import { gamesService } from './data/games';
import { storageService } from './services/storage';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/ui/SearchModal';

import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { AllGamesPage } from './pages/AllGamesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const [games, setGames] = useState<GameRegistryItem[]>(() => gamesService.getAllGames());
  const [stats, setStats] = useState<UserStats>(() => storageService.getUserStats());
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const refreshGames = () => {
    setGames([...gamesService.getAllGames()]);
  };

  const handleToggleFavorite = (slug: string) => {
    storageService.toggleFavorite(slug);
    setStats(storageService.getUserStats());
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-display selection:bg-indigo-600 selection:text-white">
        {/* Global Navbar */}
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          favoritesCount={stats.favorites.length}
          totalCoins={stats.totalCoins}
          nickname={stats.nickname}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  games={games.filter((g) => g.published)}
                  favorites={stats.favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            <Route
              path="/games"
              element={
                <AllGamesPage
                  games={games.filter((g) => g.published)}
                  favorites={stats.favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            <Route
              path="/games/:slug"
              element={
                <GameDetailPage
                  games={games.filter((g) => g.published)}
                  favorites={stats.favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            <Route
              path="/leaderboard"
              element={
                <LeaderboardPage
                  games={games.filter((g) => g.published)}
                  currentUserNickname={stats.nickname}
                />
              }
            />

            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  games={games.filter((g) => g.published)}
                  favorites={stats.favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <ProfilePage
                  stats={stats}
                  games={games.filter((g) => g.published)}
                  onStatsChange={(newStats) => setStats(newStats)}
                />
              }
            />

            <Route
              path="/admin"
              element={
                <AdminPage
                  games={games}
                  onGamesUpdated={refreshGames}
                />
              }
            />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global Instant Search Modal */}
        <SearchModal
          games={games.filter((g) => g.published)}
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;

