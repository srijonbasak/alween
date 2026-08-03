# Alween

Alween — a Next.js + TypeScript starter application and frontend scaffold.

This repository contains a modern Next.js (App Router) + TypeScript frontend scaffolded with create-next-app. The primary application lives in the `client/` directory and is ready for local development and production builds.

Status
- Language: TypeScript
- Default branch: `main`
- License: MIT

Highlights
- Next.js (App Router) + TypeScript
- Opinionated project layout with the application under `client/`
- Ready for local development, production build and deployment on Vercel or similar platforms

Features
- Type-safe React components with TypeScript
- File-system routing via Next.js App Router
- Example pages and components included by create-next-app

Quick start
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

3. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 in your browser.

Notes
- `package.json` scripts for the app are located in `client/package.json`. Run commands from inside `client/` unless you add root-level scripts.
- The project targets Node.js LTS (18.x or 20.x). Use the package manager you prefer (pnpm / npm / yarn).

Build for production

```bash
cd client
npm run build
npm start
```

Testing & linting
- Add or verify test scripts in `client/package.json` (e.g., Jest, Vitest).
- Consider adding ESLint and Prettier for consistent linting and formatting; see `client/` for config files if present.

Environment variables
- If your app requires runtime configuration, create a `.env.local` in `client/` and add keys there. Do NOT commit secrets to the repository.

Deployment
- Vercel is recommended for Next.js apps (automatic builds & previews).
- Any platform that supports Node.js can run the production build. Configure your host to run `npm run build` and `npm start` from `client/`.

Contributing
Contributions are welcome. Suggested flow:
1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and test locally
4. Open a pull request with a description of your change

Please add tests and update documentation where relevant.

License
This project is licensed under the MIT License — see the `LICENSE` file for details.

Author
srijonbasak — https://github.com/srijonbasak
