# Alween

A Next.js + TypeScript web application starter.

This repository contains a TypeScript frontend scaffolded with create-next-app. The primary application lives in the `client/` directory (Next.js + TypeScript).

## Project status
- Language: TypeScript
- Default branch: `main`
- No topics set on GitHub

## Features
- Next.js (App Router) + TypeScript
- Ready for local development and production builds
- Boilerplate created with `create-next-app` inside `client/`

## Quick start

1. Clone the repository

```bash
git clone https://github.com/srijonbasak/alween.git
cd alween/client
```

2. Install dependencies

```bash
# npm
npm install

# or yarn
yarn

# or pnpm
pnpm install
```

3. Run development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open http://localhost:3000 in your browser.

> Note: `package.json` scripts for the app are located in `client/package.json`. Run the commands from inside `client/` unless you add root-level scripts.

## Build for production

```bash
cd client
npm run build
npm start
```

## Recommended environment
- Node.js LTS (18.x or 20.x)
- pnpm / npm / yarn (as preferred)
- TypeScript: managed by the project `tsconfig.json`

## Testing & linting
- Add or verify test scripts in `client/package.json` (e.g., Jest, Vitest).
- Consider adding ESLint and Prettier for consistent linting and formatting.

## Deployment
- Vercel is recommended for Next.js apps (automatic builds & previews).
- Any platform that supports Node.js can run the production build.

## Contributing
Contributions are welcome. Suggested flow:

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and test locally
4. Open a pull request with a description of your change

Please add tests and update documentation where relevant.

## License
This project is licensed under the MIT License — see the `LICENSE` file for details.

## Author
srijonbasak — https://github.com/srijonbasak
