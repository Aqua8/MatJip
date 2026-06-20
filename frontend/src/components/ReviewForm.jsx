import { useState } from 'react';
import StarRating from './StarRating';
import { reviews as reviewsApi, upload } from '../api';
import { toast } from '../store/toastStore';

export default function ReviewForm({ restaurantId, onSuccess, initialData, reviewId, onCancel }) {
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [content, setContent] = useState(initialData?.content ?? '');
  const [imageUrls, setImageUrls] = useState(initialData?.imageUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map((f) => upload.image(f)));
      setImageUrls((prev) => [...prev, ...results.map((r) => r.data.url)]);
    } catch {
      toast('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast('별점을 선택해주세요.');
    if (!content.trim()) return toast('내용을 입력해주세요.');
    setSubmitting(true);
    try {
      if (reviewId) {
        await reviewsApi.update(reviewId, { rating, content, imageUrls });
      } else {
        await reviewsApi.create(restaurantId, { rating, content, imageUrls });
      }
      onSuccess?.();
    } catch {
      toast('리뷰 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 p-5 space-y-4 bg-white">
      <p className="text-xs font-semibold text-black tracking-wide">{reviewId ? '리뷰 수정' : '리뷰 작성'}</p>
      <StarRating value={rating} onChange={setRating} size="lg" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="맛집에 대한 솔직한 리뷰를 남겨주세요..."
        rows={4}
        className="w-full border border-gray-200 p-4 text-sm resize-none bg-white outline-none focus:border-black transition-colors"
      />
      <div className="flex items-center gap-3 flex-wrap">
        {imageUrls.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} alt="" className="w-10 h-10 object-cover" />
            <button
              type="button"
              onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <label className="text-xs text-gray-400 cursor-pointer hover:text-black transition-colors">
          {uploading ? '업로드 중...' : '+ 사진 추가'}
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-black text-white text-xs py-3 tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {submitting ? '제출 중...' : reviewId ? '수정 완료' : '리뷰 등록'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs text-gray-400 hover:text-black transition-colors px-4">
            취소
          </button>
        )}
      </div>
    </form>
  );
}
