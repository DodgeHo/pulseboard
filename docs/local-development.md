# Local Development Notes

## Current Host Findings

Checked on Windows + WSL on 2026-07-01:

- Windows has Node.js, npm, pnpm, Git, and WSL available.
- Windows does not currently expose a Docker CLI in `PATH`.
- WSL Ubuntu is available and has Node.js, Git, Docker CLI, and Docker Compose.
- WSL currently resolves `pnpm` and `corepack` to Windows paths before Linux-native package manager binaries.
- The WSL Docker daemon is not running. `docker compose config` works, but `docker compose up` cannot start until the daemon is available.

## Recommended WSL Fixes

These are local machine setup steps, not application code:

```bash
# Option A: if Docker is installed inside WSL
sudo service docker start

# Option B: if using Docker Desktop
# Enable Docker Desktop WSL integration for the Ubuntu distro, then reopen WSL.
docker info
```

For pnpm inside WSL, prefer a Linux-native pnpm installation:

```bash
corepack enable
corepack prepare pnpm@11.11.0 --activate
pnpm -v
```

If `corepack` still resolves to a Windows path, move Windows Node paths later in WSL `PATH` or install Node.js through a Linux-native tool such as `nvm`, `fnm`, or the distro package manager.

## Expected Local Commands

```bash
cd /mnt/f/Jobs\ overseas/pulseboard
cp .env.example .env
pnpm install
pnpm doctor
pnpm compose:up
```

When Docker is healthy, the compose stack starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- API on `localhost:4000`
- Worker process connected to BullMQ

## Verification Commands

```bash
pnpm doctor
pnpm db:generate
pnpm db:deploy
pnpm typecheck
pnpm test
docker compose config
curl http://localhost:4000/health/live
curl -H "Authorization: Bearer pb_local_demo_key_change_me" http://localhost:4000/v1/workspaces
pnpm demo:flow
```
