import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Bookmarks from './pages/Bookmarks';
import MyPage from './pages/MyPage';

function Navbar({ onMenuClick }) {
  return (
    <header className="h-[52px] border-b border-gray-200 flex items-center px-6 bg-white flex-shrink-0">
      <div className="flex-1">
        <button onClick={onMenuClick} className="flex flex-col justify-center gap-[6px]" aria-label="메뉴">
          <span className="w-[22px] h-[1.5px] bg-black block" />
          <span className="w-[22px] h-[1.5px] bg-black block" />
          <span className="w-[22px] h-[1.5px] bg-black block" />
        </button>
      </div>

      <Link to="/" className="text-[13px] font-bold tracking-[0.3em] text-black select-none">
        맛/집
      </Link>

      <div className="flex-1 flex justify-end items-center gap-5">
        <NavLink to="/bookmarks" className={({ isActive }) => isActive ? 'text-black' : 'text-gray-400 hover:text-black transition-colors'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </NavLink>
        <NavLink to="/mypage" className={({ isActive }) => isActive ? 'text-black' : 'text-gray-400 hover:text-black transition-colors'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </NavLink>
      </div>
    </header>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-white">
        <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home sidebarOpen={sidebarOpen} />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
