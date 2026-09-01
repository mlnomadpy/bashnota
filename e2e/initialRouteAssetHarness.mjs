import { existsSync, statSync } from 'node:fs'
import { extname, isAbsolute, normalize, resolve, sep } from 'node:path'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function contentType(pathname) {
  return mimeTypes[extname(pathname).toLowerCase()] ?? 'application/octet-stream'
}

function notFound(pathname) {
  return {
    body: 'not found\n',
    contentType: contentType(pathname),
    filePath: null,
    isShell: false,
    status: 404,
  }
}

export function resolveRouteAssetRequest({
  accept = '',
  appBase,
  distDirectory,
  method = 'GET',
  requestPath,
}) {
  const basePrefix = appBase.endsWith('/') ? appBase : `${appBase}/`
  if (requestPath !== appBase && !requestPath.startsWith(basePrefix)) return notFound(requestPath)

  let relativePath
  try {
    relativePath = decodeURIComponent(requestPath.slice(appBase.length)).replace(/^\/+/, '')
  } catch {
    return notFound(requestPath)
  }

  const normalizedPath = normalize(relativePath || 'index.html')
  if (isAbsolute(normalizedPath) || normalizedPath === '..' || normalizedPath.startsWith(`..${sep}`)) {
    return notFound(requestPath)
  }

  const distRoot = resolve(distDirectory)
  const candidate = resolve(distRoot, normalizedPath)
  const insideDist = candidate === distRoot || candidate.startsWith(`${distRoot}${sep}`)
  if (insideDist && existsSync(candidate) && statSync(candidate).isFile()) {
    return {
      contentType: contentType(candidate),
      filePath: candidate,
      isShell: normalizedPath === 'index.html',
      status: 200,
    }
  }

  const acceptsHtml = accept.split(',').some((value) => value.trim().startsWith('text/html'))
  const looksLikeAsset = relativePath.startsWith('assets/') || extname(relativePath) !== ''
  if ((method === 'GET' || method === 'HEAD') && acceptsHtml && !looksLikeAsset) {
    const shell = resolve(distRoot, 'index.html')
    if (existsSync(shell) && statSync(shell).isFile()) {
      return {
        contentType: contentType(shell),
        filePath: shell,
        isShell: true,
        status: 200,
      }
    }
  }

  return notFound(requestPath)
}

export function buildRouteReadinessProbe({ readySelector, readyText = '', quietWindowMs = 200 }) {
  const selector = JSON.stringify(readySelector)
  const text = JSON.stringify(readyText)
  return `<script>(()=>{
    const readySelector=${selector};
    const readyText=${text};
    const quietWindowMs=${quietWindowMs};
    let lastResourceAt=performance.now();
    const resources=()=>performance.getEntriesByType('resource').map((entry)=>new URL(entry.name).pathname);
    const rendered=()=>Boolean(document.querySelector(readySelector))&&(!readyText||document.body.innerText.includes(readyText));
    const fail=(reason)=>{document.body.dataset.routeError=String(reason||'unknown route error')};
    new PerformanceObserver(()=>{lastResourceAt=performance.now()}).observe({type:'resource',buffered:true});
    window.addEventListener('error',(event)=>fail(event.message||event.target?.src||event.target?.href));
    window.addEventListener('unhandledrejection',(event)=>fail(event.reason?.message||event.reason));
    const check=()=>{
      if(document.body.dataset.routeError)return;
      if(rendered()&&performance.now()-lastResourceAt>=quietWindowMs){
        document.body.dataset.routeAssets=resources().join('|');
        document.body.dataset.routeReady='true';
        return;
      }
      window.setTimeout(check,50);
    };
    check();
  })()</script>`
}
