import { Helmet } from 'react-helmet-async';

/**
 * Google Analytics 4 组件
 * 
 * 使用方法：
 * 1. 在 Google Analytics 创建账号并获取测量 ID（格式：G-XXXXXXXXXX）
 * 2. 将测量 ID 添加到 .env 文件：VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 3. 在 App.jsx 中导入并使用此组件
 * 
 * @example
 * import GoogleAnalytics from './components/GoogleAnalytics';
 * 
 * function App() {
 *   return (
 *     <>
 *       <GoogleAnalytics />
 *       {/* 其他组件 *\/}
 *     </>
 *   );
 * }
 */
const GoogleAnalytics = () => {
  // 从环境变量获取测量 ID
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  // 如果没有配置测量 ID，不渲染任何内容
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics: 未配置测量 ID，请在 .env 文件中添加 VITE_GA_MEASUREMENT_ID');
    return null;
  }
  
  return (
    <Helmet>
      {/* Google Analytics 脚本 */}
      <script 
        async 
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </script>
    </Helmet>
  );
};

export default GoogleAnalytics;
