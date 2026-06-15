import { useState } from 'react';
import StarRating from './StarRating';
import { reviews as reviewsApi, upload } from '../api';

export default function ReviewForm({ restaurantId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await upload.image(file);
      setImageUrls((prev) => [...prev, res.data.url]);
    } catch {
      alert('이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('별점을 선택해주세요.');
    if (!content.trim()) return alert('내용을 입력해주세요.');
    setSubmitting(true);
    try {
      await reviewsApi.create(restaurantId, { rating, content, imageUrls });
      setRating(0);
      setContent('');
      setImageUrls([]);
      onSuccess?.();
    } catch {
      alert('리뷰 작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-gray-700">리뷰 작성</p>
      <StarRating value={rating} onChange={setRating} size="lg" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="맛집에 대한 솔직한 리뷰를 남겨주세요..."
        rows={3}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-gray-400"
      />
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          {uploading ? '업로드 중...' : '+ 사진 추가'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
        {imageUrls.map((url, i) => (
          <img key={i} src={url} alt="" className="w-10 h-10 rounded object-cover" />
        ))}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-900 text-white text-sm py-2.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {submitting ? '제출 중...' : '리뷰 등록'}
      </button>
    </form>
  );
}
