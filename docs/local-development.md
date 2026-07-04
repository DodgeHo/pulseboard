# Local Development Notes

## Current Host Findings

Checked on Windows + WSL on 2026-07-01:

- Windows has Node.js, npm, pnpm, Git, and WSL available.
- Windows does not currently expose a Docker CLI in `PATH`.
- WSL Ubuntu is available and has Node.js, Git, Docker CLI, and Docker Compose.
- WSL currently resolves `pnpm` and `corepack` to Windows paths before Linux-native package manager binaries.
- The WSL Docker daemon can run under systemd, but local daemon and DNS configuration must be healthy before `docker compose up` can pull images and build the app.
- On 2026-07-04, the checked-in `packageManager` was corrected from unavailable `pnpm@11.11.0` to published `pnpm@11.9.0` after Corepack returned a registry 404 for 11.11.0.
- On 2026-07-04, Docker startup failed because `/etc/docker/daemon.json` was invalid JSON. After fixing the commas in `registry-mirrors`, `systemctl start docker.service` succeeded.
- On 2026-07-04, WSL networking failed when `.wslconfig` used `networkingMode=mirrored` and fell back to no network. Removing that override restored the default NAT route and generated `/mnt/wsl/resolv.conf`.

## Recommended WSL Fixes

These are local machine setup steps, not application code:

```bash
# Option A: if Docker is installed inside WSL
sudo systemctl start docker.service
docker info

# Validate daemon configuration if Docker exits immediately.
sudo python3 -m json.tool /etc/docker/daemon.json

# Option B: if using Docker Desktop
# Enable Docker Desktop WSL integration for the Ubuntu distro, then reopen WSL.
docker info
```

If WSL reports unknown keys in `/etc/wsl.conf`, use sectioned keys:

```ini
[boot]
systemd=true

[interop]
appendWindowsPath=false

[user]
default=dell
```

If WSL networking reports `networkingMode Mirrored` falling back to `None`, remove `networkingMode=mirrored` from `C:\Users\asdsa\.wslconfig`, then run:

```powershell
wsl --shutdown
```

When Docker Hub or npmjs is slow from the current network, use optional image and registry overrides:

```bash
export NODE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim
export POSTGRES_IMAGE=public.ecr.aws/docker/library/postgres:16-alpine
export REDIS_IMAGE=public.ecr.aws/docker/library/redis:7-alpine
export NPM_REGISTRY=https://registry.npmmirror.com
```

For pnpm inside WSL, prefer a Linux-native pnpm installation:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
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

For the full local smoke path:

```bash
pnpm compose:e2e
pnpm compose:integration
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
pnpm compose:e2e
```
