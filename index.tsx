
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Root element not found in DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("App Render Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #16423C;">حدث خطأ أثناء تشغيل النظام</h2>
        <p style="color: #666;">يرجى مراجعة Console المتصفح (F12) لمزيد من التفاصيل.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #16423C; color: white; border: none; border-radius: 8px; cursor: pointer;">إعادة التحميل</button>
      </div>
    `;
  }
}
