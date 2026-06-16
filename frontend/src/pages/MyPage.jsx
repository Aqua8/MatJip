import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { auth, userReviews as userReviewsApi, user as userApi } from '../api';
import { useAuth } from '../store/authStore';

export default function MyPage() {
  const { isLoggedIn, nickname, login, logout, updateNickname } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [loading, setLoading] = useState(false);
  const [myReviews, setMyReviews] = useState([]);

  // 닉네임 변경
  const [nicknameEdit, setNicknameEdit] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [nicknameSaving, setNicknameSaving] = useState(false);

  // 비밀번호 변경
  const [pwEdit, setPwEdit] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      userReviewsApi.list().then((res) => setMyReviews(res.data)).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleNicknameSave = async () => {
    if (!newNickname.trim()) return;
    setNicknameSaving(true);
    try {
      const res = await userApi.updateNickname(newNickname.trim());
      updateNickname(res.data.nickname);
      setNicknameEdit(false);
      setNewNickname('');
    } catch {
      alert('닉네임 변경에 실패했습니다.');
    } finally {
      setNicknameSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return alert('새 비밀번호가 일치하지 않습니다.');
    setPwSaving(true);
    try {
      await userApi.updatePassword(pwForm.currentPassword, pwForm.newPassword);
      alert('비밀번호가 변경되었습니다.');
      setPwEdit(false);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwSaving(false);
    }
  };

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

  const inputClass = "w-full border-b border-gray-300 py-2.5 text-sm bg-transparent outline-none placeholder-gray-400 focus:border-black transition-colors";

  if (isLoggedIn) {
    return (
      <div className="h-full overflow-y-auto bg-white">
        <div className="max-w-md mx-auto px-4 md:px-8 py-8">
          {/* 프로필 */}
          <div className="border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-base text-black">{nickname}</p>
                <p className="text-xs text-gray-400 mt-0.5">맛집 탐험가</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-xs border border-gray-300 px-4 py-2 hover:border-black transition-colors tracking-wide"
              >
                로그아웃
              </button>
            </div>

            {/* 닉네임 변경 */}
            <div className="border-t border-gray-100 pt-4">
              {nicknameEdit ? (
                <div className="flex gap-2 items-center">
                  <input
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="새 닉네임"
                    className="flex-1 border-b border-gray-300 py-1.5 text-sm bg-transparent outline-none focus:border-black transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleNicknameSave}
                    disabled={nicknameSaving || !newNickname.trim()}
                    className="text-xs px-3 py-1.5 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    {nicknameSaving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => { setNicknameEdit(false); setNewNickname(''); }}
                    className="text-xs text-gray-400 hover:text-black transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setNicknameEdit(true); setNewNickname(nickname); }}
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  닉네임 변경
                </button>
              )}
            </div>

            {/* 비밀번호 변경 */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              {pwEdit ? (
                <form onSubmit={handlePasswordSave} className="space-y-3">
                  <input
                    type="password"
                    placeholder="현재 비밀번호"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    required
                    className="w-full border-b border-gray-300 py-1.5 text-sm bg-transparent outline-none focus:border-black transition-colors"
                    autoFocus
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 (6자 이상)"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                    required
                    className="w-full border-b border-gray-300 py-1.5 text-sm bg-transparent outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                    required
                    className="w-full border-b border-gray-300 py-1.5 text-sm bg-transparent outline-none focus:border-black transition-colors"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={pwSaving}
                      className="text-xs px-3 py-1.5 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
                    >
                      {pwSaving ? '변경 중...' : '변경'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPwEdit(false); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); }}
                      className="text-xs text-gray-400 hover:text-black transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setPwEdit(true)}
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  비밀번호 변경
                </button>
              )}
            </div>
          </div>

          <div className="mb-8" />

          {/* 내 리뷰 */}
          <div className="flex items-baseline gap-3 mb-5">
            <h2 className="text-sm font-semibold text-black">내 리뷰</h2>
            <span className="text-sm text-gray-400">{myReviews.length}</span>
          </div>

          {myReviews.length === 0 ? (
            <div className="border border-gray-200 py-14 text-center">
              <p className="text-xs text-gray-400 mb-4">작성한 리뷰가 없습니다</p>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-black underline hover:no-underline"
              >
                맛집 둘러보기
              </button>
            </div>
          ) : (
            <div className="space-y-px">
              {myReviews.map((r) => (
                <div key={r.id} className="border border-gray-200 p-5">
                  <div className="flex justify-between items-center mb-3">
                    <StarRating value={r.rating} />
                    <span className="text-xs text-gray-300">{r.createdAt?.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-10">
          <p className="text-2xl font-bold tracking-[0.25em] text-black mb-3">맛/집</p>
          <p className="text-xs text-gray-400">
            {mode === 'login' ? '계정에 로그인하세요' : '계정을 만들어 맛집을 탐험하세요'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-5">
          {mode === 'signup' && (
            <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="닉네임" required className={inputClass} />
          )}
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="이메일" required className={inputClass} />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="비밀번호" required className={inputClass} />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 text-xs font-medium tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {mode === 'login' ? (
            <>계정이 없으신가요?{' '}
              <button onClick={() => setMode('signup')} className="text-black underline hover:no-underline">회원가입</button>
            </>
          ) : (
            <>이미 계정이 있으신가요?{' '}
              <button onClick={() => setMode('login')} className="text-black underline hover:no-underline">로그인</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
