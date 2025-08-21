// Cloudflare Pages Worker для Next.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Если это статический файл, пропускаем
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.includes('.')) {
    return context.next();
  }
  
  // Для всех остальных запросов возвращаем index.html
  try {
    const response = await context.next();
    return response;
  } catch (error) {
    // Если файл не найден, возвращаем index.html
    return context.next();
  }
}
