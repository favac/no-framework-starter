# Client-Side Routing

## Overview

This application uses **client-side routing** with the **History API** (pushState) instead of hash-based routing. This provides clean URLs without the `#` symbol.

## URL Structure

### Before (Hash-based)

```
http://localhost:3000/#home
http://localhost:3000/#about
http://localhost:3000/#table
```

### After (History API)

```
http://localhost:3000/
http://localhost:3000/about
http://localhost:3000/table
```

## How It Works

### 1. Route Detection

The router extracts the route from `window.location.pathname`:

```javascript
function getCurrentRoute() {
  const path = window.location.pathname;
  return path === "/" ? "home" : path.slice(1);
}
```

### 2. Navigation

When navigating, the router uses `pushState` instead of hash changes:

```javascript
export function navigateTo(route) {
  const path = route === "home" ? "/" : `/${route}`;
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  }
}
```

### 3. Link Interception

The router automatically intercepts clicks on internal links:

```javascript
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (href && href.startsWith("/")) {
    e.preventDefault();
    const route = href === "/" ? "home" : href.slice(1);
    navigateTo(route);
  }
});
```

### 4. Server Configuration

Vite is configured with `historyApiFallback: true` to redirect all routes to `index.html`:

```javascript
export default defineConfig({
  server: {
    historyApiFallback: true,
  },
});
```

## Usage

### Programmatic Navigation

```javascript
import { navigateTo } from "./router.js";

// Navigate to a route
navigateTo("about");
navigateTo("table");
navigateTo("home"); // or navigateTo('/') for root
```

### Using Links

```javascript
// In your views, use regular anchor tags
h("a", { href: "/about" }, "Go to About");
h("a", { href: "/table" }, "View Table");
h("a", { href: "/" }, "Home");
```

The router will automatically intercept these clicks and handle them client-side.

### Using Buttons

```javascript
// Use navigateTo in event handlers
h(
  "button",
  {
    onclick: () => navigateTo("about"),
  },
  "Go to About"
);
```

## Benefits

1. **Clean URLs**: No `#` in the URL
2. **Better SEO**: Search engines prefer clean URLs
3. **Shareable Links**: URLs look more professional
4. **Browser History**: Back/forward buttons work naturally
5. **Link Interception**: Regular `<a>` tags work automatically

## Production Deployment

When deploying to production, ensure your server is configured to redirect all routes to `index.html`. This is necessary because the routes only exist on the client side.

### Example Configurations

#### Netlify

Create a `_redirects` file:

```
/*    /index.html   200
```

#### Vercel

Create a `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Apache

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Migration from Hash-based Routing

If you're migrating from hash-based routing:

1. **Update Links**: Change `#about` to `/about`
2. **Update Navigation Calls**: `navigateTo` now uses paths instead of hashes
3. **Server Config**: Add SPA fallback configuration
4. **Test**: Verify all routes work with direct URL access

## Troubleshooting

### Issue: 404 on page refresh

**Solution**: Ensure your server has SPA fallback configured (see Production Deployment section)

### Issue: External links are intercepted

**Solution**: The router only intercepts links starting with `/`. External links (http://, https://) are not affected.

### Issue: Hash links still appear

**Solution**: Check that you're not using `#` in your `href` attributes. Use `/route` instead of `#route`.
