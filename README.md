# React + TypeScript + Vite

## Production Deployment

The canonical web application release source is `padlupp/main` at
`https://github.com/padlup001/padlupp.git`, configured in `deployment-source.json`.
The `origin` remote (`pkaylabs/padlupp`) remains a synchronized mirror; pushes
there do not deploy.

`.github/workflows/deploy-production.yml` runs automatically on pushes to the
canonical repository's `main` branch, or manually through `workflow_dispatch`
with `main` selected. The job is restricted to `padlup001/padlupp` and
`refs/heads/main`, uses the `production` environment and a read-only GitHub
token, and queues web production runs without canceling an active deployment.
Automatic delivery requires the environment and server prerequisites below;
adding this workflow alone does not configure or activate the server controller.

The workflow checks out the triggering SHA, creates local `main` at that exact
commit, and configures the canonical `padlupp` remote. It uses Node.js 22 and
Yarn 1.22.22 with a frozen lockfile, runs
`node --experimental-strip-types --test --test-concurrency=1 scripts/*.test.mjs`,
then builds with the existing `yarn release:build` guard. That guard fetches the
canonical source and requires a clean `main` checkout matching its latest
commit. Test failures block delivery. A superseded run is skipped with an
explicit log and job summary, including a second latest-SHA check immediately
before SSH; a failed GitHub ref lookup fails closed.

Configure these production build settings:

- The workflow sets `VITE_API_BASE_URL=https://api.padlupp.com/api-v1` and
  `VITE_WS_BASE_URL=wss://api.padlupp.com`.
- Set the Actions variable `VITE_GOOGLE_OAUTH2_CLIENT_ID` in the canonical
  repository or its `production` environment to the existing public web client
  ID: `674368689981-4lo3fedmr76gqrfftka13vm29htlq1kg.apps.googleusercontent.com`.
  The build rejects a blank or invalid client ID. This is a public browser
  identifier, not a Google client secret; no local `.env` file is uploaded.

Provision these secrets in the canonical repository's `production` environment:

- `PADLUPP_DEPLOY_HOST`: production SSH host, using port 22.
- `PADLUPP_DEPLOY_USER`: dedicated deployment account, not root.
- `PADLUPP_DEPLOY_SSH_KEY`: dedicated web deployment key whose server-side
  forced command binds it to the web target only, with no unrestricted shell.
- `PADLUPP_DEPLOY_KNOWN_HOSTS`: independently verified, pinned SSH host entries.
  The workflow requires strict host-key checking and does not use `ssh-keyscan`.

The bundle is a gzip-compressed tar of `dist`, including
`.deployment-source.json` with the canonical remote, repository, branch and
triggering commit. Its SHA-256 accompanies the fixed SSH command
`deploy <commit> <sha256>`; the archive is streamed on standard input, not
copied into an arbitrary server path. The temporary key and pinned host file
are private to the runner (mode `0600`) and removed on exit.

Hosting continues to serve static releases at `app.padlupp.com` through Nginx.
The active link is `/var/lib/padlupp-deploy/current/web`, with immutable releases
under `/var/lib/padlupp-deploy/releases/web`; older manual releases are retained
under `/var/www/padlupp-releases`. Before enabling delivery, the server controller
must be configured and verified to validate the bundle and source metadata,
serialize deployments with the shared global lock, preserve backups, run
health checks and roll back code on failure. This workflow does not install or
verify that controller. It sends only web build output and has no database or
uploaded-media access; it does not run migrations, reset data or change backend
or marketing deployment configuration. Do not put root keys or database
credentials in GitHub Actions. Server-side retention and recovery remain
controller responsibilities.

For a local production build, use the same three `VITE_*` settings and run
`yarn release:build` from a clean, current `padlupp/main` checkout. Building
locally does not deploy.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
