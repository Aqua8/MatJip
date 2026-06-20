import { useState, useEffect } from 'react';

const STORAGE_KEY = 'matjip_welcome_hidden_until';

export default function WelcomeDialog() {
  const [visible, setVisible] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (!hiddenUntil || Date.now() > Number(hiddenUntil)) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm p-8">
        <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mb-5">Portfolio Project</p>
        <h2 className="text-2xl font-bold text-black tracking-[0.15em] mb-4">맛/집</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          이 웹사이트는 <span className="text-black font-medium">포트폴리오용으로 제작된 맛집 리뷰 플랫폼</span>입니다.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          카카오맵 기반 식당 검색, 리뷰 작성, 좋아요 및 즐겨찾기 기능을 체험해보실 수 있습니다.
          회원가입 후 직접 맛집을 등록하고 리뷰를 남겨보세요.
        </p>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-3.5 h-3.5 accent-black"
            />
            <span className="text-xs text-gray-400">오늘 하루 안보기</span>
          </label>
          <button
            onClick={handleClose}
            className="text-xs bg-black text-white px-6 py-2.5 hover:bg-gray-800 transition-colors tracking-widest"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
