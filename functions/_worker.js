// Cloudflare Pages Worker для статических файлов Next.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Если это статический файл (_next, favicon, etc.), пропускаем
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.includes('.')) {
    return context.next();
  }
  
  // Для всех остальных запросов (маршруты приложения)
  // пытаемся найти соответствующий HTML файл
  try {
    // Пробуем найти файл с .html расширением
    const htmlPath = url.pathname.endsWith('/') 
      ? url.pathname + 'index.html' 
      : url.pathname + '.html';
    
    const response = await context.next();
    
    // Если файл не найден, возвращаем главную страницу
    if (response.status === 404) {
      return context.next('/index.html');
    }
    
    return response;
  } catch (error) {
    // В случае ошибки возвращаем главную страницу
    return context.next('/index.html');
  }
}
