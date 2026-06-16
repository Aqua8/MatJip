import { useState } from 'react';
import StarRating from './StarRating';
import { reviews as reviewsApi, upload } from '../api';
import { toast } from '../store/toastStore';

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
      toast('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast('별점을 선택해주세요.');
    if (!content.trim()) return toast('내용을 입력해주세요.');
    setSubmitting(true);
    try {
      await reviewsApi.create(restaurantId, { rating, content, imageUrls });
      setRating(0);
      setContent('');
      setImageUrls([]);
      onSuccess?.();
    } catch {
      toast('리뷰 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 p-5 space-y-4 bg-white">
      <p className="text-xs font-semibold text-black tracking-wide">리뷰 작성</p>
      <StarRating value={rating} onChange={setRating} size="lg" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="맛집에 대한 솔직한 리뷰를 남겨주세요..."
        rows={4}
        className="w-full border border-gray-200 p-4 text-sm resize-none bg-white outline-none focus:border-black transition-colors"
      />
      <div className="flex items-center gap-4">
        <label className="text-xs text-gray-400 cursor-pointer hover:text-black transition-colors">
          {uploading ? '업로드 중...' : '+ 사진 추가'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
        {imageUrls.map((url, i) => (
          <img key={i} src={url} alt="" className="w-10 h-10 object-cover" />
        ))}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-black text-white text-xs py-3 tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {submitting ? '제출 중...' : '리뷰 등록'}
      </button>
    </form>
  );
}
