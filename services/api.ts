
import axios from 'axios';

// الرابط المفترض للـ API
const BASE_URL = 'https://api.rostech-erp.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // تقليل المهلة الزمنية لسرعة التحويل للبيانات الوهمية
});

// إضافة التوكن للطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rostech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا كان الخطأ هو Network Error أو Timeout، سنقوم بتسجيله فقط في الكونسول
    if (!error.response) {
      console.warn('Network Error detected: Switching to Mock Data mode.');
    }
    return Promise.reject(error);
  }
);

export default api;
