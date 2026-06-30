import type { Connect, Plugin } from 'vite';

const HTML_PAGES: Record<string, string> = {
  '/signup': '/signup.html',
  '/calendar': '/calendar.html',
};

function isAppShellPath(pathname: string): boolean {
  return (
    pathname === '/dashboard' ||
    pathname === '/people' ||
    pathname === '/profile' ||
    pathname === '/assessments' ||
    pathname.startsWith('/assessments/') ||
    pathname === '/configure' ||
    pathname.startsWith('/configure/') ||
    pathname === '/reports' ||
    pathname === '/settings'
  );
}

function rewriteRequestUrl(req: Connect.IncomingMessage): void {
  const raw = req.url ?? '/';
  const q = raw.indexOf('?');
  const pathname = (q === -1 ? raw : raw.slice(0, q)) || '/';
  const search = q === -1 ? '' : raw.slice(q);

  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    return;
  }

  if (HTML_PAGES[pathname]) {
    req.url = HTML_PAGES[pathname] + search;
    return;
  }

  if (isAppShellPath(pathname)) {
    req.url = '/dashboard.html' + search;
  }
}

function cleanUrlsMiddleware(
  req: Connect.IncomingMessage,
  _res: Connect.ServerResponse,
  next: Connect.NextFunction,
): void {
  rewriteRequestUrl(req);
  next();
}

/** Dev/preview: serve *.html files at clean paths (/dashboard, /people, …). */
export function cleanUrlsPlugin(): Plugin {
  return {
    name: 'speksense-clean-urls',
    configureServer(server) {
      server.middlewares.use(cleanUrlsMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(cleanUrlsMiddleware);
    },
  };
}
