# Job Application Tracker

A full-stack app for tracking job applications through a status pipeline
(Applied -> OA -> Interview -> Offer / Rejected).

Built as a learning project: the frontend and backend are two separate
servers talking over HTTP, so the network boundary between them is visible
rather than hidden by a framework.

## Architecture

```
browser  --HTTP-->  client   (Vite dev server, port 5173)   serves HTML/JS
browser  --HTTP-->  server   (Express API,     port 4000)   serves JSON
                       |
                       +--TCP/TLS-->  Neon Postgres (cloud)
```

| Piece    | Stack                                                        | Deploys to |
| -------- | ------------------------------------------------------------ | ---------- |
| `client` | React, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query   | Vercel     |
| `server` | Node.js, Express, TypeScript, Zod, Prisma                      | Railway    |
| database | PostgreSQL                                                     | Neon       |

## Repository layout

This is one git repository containing two independent npm projects. They are
NOT npm workspaces — each has its own `package.json` and its own
`node_modules`, because they run in two different places (Node.js on a server
vs. a stranger's browser) and must not share a dependency tree.

```
.
├── server/          Express API
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── client/          React app (scaffolded with Vite in step 6)
    └── .env.example
```

## Local setup

Each side needs its own terminal.

```bash
# Terminal 1 — API
cd server
cp .env.example .env      # then fill in the real values
npm install
npm run dev               # http://localhost:4000

# Terminal 2 — web app (available from step 6 onward)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Database

The schema lives in `server/prisma/schema.prisma` and is the single source of
truth. Migrations in `server/prisma/migrations/` are committed to git — that
directory is the database's version history, and it replays in order on any
environment.

```bash
cd server
npm run db:migrate     # after editing schema.prisma: create + apply a migration
npm run db:generate    # regenerate the typed client only
npm run db:studio      # browse the data in a GUI
npm run db:reset       # DESTRUCTIVE: drop everything and replay all migrations
```

Development uses a local PostgreSQL database. Production uses Neon, and gets
the exact same migration files applied via `npm run db:deploy` during the
Railway build. `prisma generate` also runs on `postinstall` and before every
build, so the generated client is never stale and never committed.

## Environment variables

Never commit real values. `.env` is gitignored; `.env.example` documents the
keys and is committed.

Anything in `client/.env` is compiled into the browser bundle and is
therefore **public**. Secrets belong only in `server/.env`.

## Build progress

- [x] 1. Repo structure, package setup, Git, .gitignore, env files
- [x] 2. Prisma schema + first migration
- [x] 3. Express server skeleton, health route, CORS, error middleware
- [ ] 4. Auth: register, login, logout, session check
- [ ] 5. Applications CRUD API with Zod validation
- [ ] 6. Frontend scaffold: Vite, Tailwind, shadcn, routing
- [ ] 7. Auth UI + protected routes + TanStack Query
- [ ] 8. Applications list, filters, create/edit forms
- [ ] 9. Dashboard with stats
- [ ] 10. Deploy all three pieces
- [ ] 11. Polish: loading states, empty states, error handling
