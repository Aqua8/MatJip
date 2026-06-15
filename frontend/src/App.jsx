import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Bookmarks from './pages/Bookmarks';
import MyPage from './pages/MyPage';

function NavBar() {
  const linkClass = ({ isActive }) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive ? 'text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-700'
    }`;

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
      <NavLink to="/" className="text-base font-bold text-gray-900 tracking-tight">
        맛집 지도
      </NavLink>
      <div className="flex items-center gap-1">
        <NavLink to="/" end className={linkClass}>홈</NavLink>
        <NavLink to="/bookmarks" className={linkClass}>즐겨찾기</NavLink>
        <NavLink to="/mypage" className={linkClass}>마이페이지</NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
