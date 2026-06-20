import api from './axios';

export const auth = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const restaurants = {
  list: (keyword = '') => api.get('/api/restaurants', { params: { keyword } }),
  get: (id) => api.get(`/api/restaurants/${id}`),
  create: (data) => api.post('/api/restaurants', data),
};

export const reviews = {
  list: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/reviews`),
  create: (restaurantId, data) => api.post(`/api/restaurants/${restaurantId}/reviews`, data),
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

export const upload = {
  image: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
