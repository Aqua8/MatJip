import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';
import { reviews as reviewsApi } from '../api';
import { toast } from '../store/toastStore';

export default function ReviewForm({ restaurantId, onSuccess, initialData, reviewId, onCancel }) {
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [content, setContent] = useState(initialData?.content ?? '');
  const [existingImageUrls, setExistingImageUrls] = useState(initialData?.imageUrls ?? []);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const previewsRef = useRef(previews);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeExistingImage = (url) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast('별점을 선택해주세요.');
    if (!content.trim()) return toast('내용을 입력해주세요.');
    setSubmitting(true);
    try {
      const data = { rating, content, existingImageUrls, images: newImages };
      if (reviewId) {
        await reviewsApi.update(reviewId, data);
      } else {
        await reviewsApi.create(restaurantId, data);
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
        {existingImageUrls.map((url) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="w-10 h-10 object-cover" />
            <button
              type="button"
              onClick={() => removeExistingImage(url)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {previews.map((url, i) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="w-10 h-10 object-cover" />
            <button
              type="button"
              onClick={() => removeNewImage(i)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <label className="text-xs text-gray-400 cursor-pointer hover:text-black transition-colors">
          + 사진 추가
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
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
