# Worthwhile

Worthwhile is a Vue and TypeScript web app for evaluating big purchases, moving-home costs, and six-month emergency-fund plans.

All calculations run in the browser. Saved plans are kept in browser `localStorage`; no backend or account is required. The app includes a browser print view so users can choose **Save as PDF**.

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

The development server is available at the URL shown by Vite.

## Verification

Run the unit and integration tests:

```bash
npm test
```

Run the Chromium and WebKit browser checks:

```bash
npx playwright install chromium webkit   # first run only
npm run test:e2e
```

Create a production build:

```bash
npm run build
```

## Deployment and security

The build output is in `dist/`. The `public/_headers` file is copied into the build and configures CSP, `nosniff`, referrer, permissions, and HSTS headers for hosts that support the `_headers` format, including Cloudflare Pages and Netlify-style deployments.

Deploy the site over HTTPS and configure the hosting provider to redirect HTTP to HTTPS before enabling HSTS. HSTS is already declared in `_headers` and should only be used when HTTPS is enforced for the domain and its subdomains.

The CSP currently allows only same-origin scripts, styles, fonts, images, and connections. Fonts use local/system fallbacks and do not require an external Google Fonts request.

## Privacy

Income, expenses, purchase details, savings, and saved plans are stored only in the current browser. They are not uploaded to a server. Users can remove the saved plan with **Clear saved data** in the sidebar. Clearing browser site data or using a different browser/device will remove or omit the local plan.

The score and affordability outputs are estimates based on entered figures and are not financial advice.
