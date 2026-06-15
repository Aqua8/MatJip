import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { auth, userReviews as userReviewsApi } from '../api';
import { useAuth } from '../store/authStore';

export default function MyPage() {
  const { isLoggedIn, nickname, login, logout } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [loading, setLoading] = useState(false);
  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      userReviewsApi.list().then((res) => setMyReviews(res.data)).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auth.login({ email: form.email, password: form.password });
      login(res.data.token, res.data.nickname);
    } catch {
      alert('로그인 실패. 이메일/비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signup(form);
      alert('회원가입 완료! 로그인해주세요.');
      setMode('login');
    } catch {
      alert('회원가입 실패. 이미 사용 중인 이메일일 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{nickname}</p>
              <p className="text-sm text-gray-400">맛집 탐험가</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="mt-4 w-full border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors"
          >
            로그아웃
          </button>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-3">내 리뷰 ({myReviews.length})</h2>
          {myReviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">작성한 리뷰가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {myReviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <StarRating value={r.rating} />
                    <span className="text-xs text-gray-300">{r.createdAt?.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {mode === 'login' ? '로그인' : '회원가입'}
      </h1>

      <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        {mode === 'signup' && (
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="닉네임"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
          />
        )}
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="이메일"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="비밀번호"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-4">
        {mode === 'login' ? (
          <>계정이 없으신가요?{' '}
            <button onClick={() => setMode('signup')} className="text-gray-700 font-medium">회원가입</button>
          </>
        ) : (
          <>이미 계정이 있으신가요?{' '}
            <button onClick={() => setMode('login')} className="text-gray-700 font-medium">로그인</button>
          </>
        )}
      </p>
    </div>
  );
}
