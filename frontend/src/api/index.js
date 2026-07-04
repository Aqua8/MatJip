import api from './axios';

export const auth = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const restaurants = {
  list: (keyword = '') => api.get('/api/restaurants', { params: { keyword } }),
  get: (id) => api.get(`/api/restaurants/${id}`),
  getByKakao: (kakaoPlaceId) => api.get(`/api/restaurants/by-kakao/${kakaoPlaceId}`),
  create: (data) => api.post('/api/restaurants', data),
};

function toReviewFormData({ rating, content, existingImageUrls = [], images = [] }) {
  const form = new FormData();
  form.append('rating', rating);
  form.append('content', content);
  existingImageUrls.forEach((url) => form.append('existingImageUrls', url));
  images.forEach((file) => form.append('images', file));
  return form;
}

export const reviews = {
  list: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/reviews`),
  create: (restaurantId, data) =>
    api.post(`/api/restaurants/${restaurantId}/reviews`, toReviewFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) =>
    api.put(`/api/reviews/${id}`, toReviewFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};

export const likes = {
  toggle: (restaurantId) => api.post(`/api/restaurants/${restaurantId}/likes`),
};

export const bookmarks = {
  list: () => api.get('/api/bookmarks'),
  toggle: (restaurantId) => api.post(`/api/restaurants/${restaurantId}/bookmarks`),
};

export const userReviews = {
  list: () => api.get('/api/users/me/reviews'),
};

export const user = {
  updateNickname: (nickname) => api.put('/api/users/me/nickname', { nickname }),
  updatePassword: (currentPassword, newPassword) => api.put('/api/users/me/password', { currentPassword, newPassword }),
};

