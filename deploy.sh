#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/openclaw/Cositas-de-Jarvis/mkcosmetics"
LOCK="/tmp/mkcosmetics-deploy.lock"
BRANCH="main"
SERVICE="mkcosmetics.service"
URL="http://127.0.0.1:4000/"
NOTIFY="/home/openclaw/Cositas-de-Jarvis/deploy-tools/telegram-notify.sh"
STEP="starting"
COMMIT="unknown"

notify() {
  "$NOTIFY" "MK Cosmetics" "$1" "$STEP" "$COMMIT" "$BRANCH" "$SERVICE" "$2" "$ROOT/deploy-webhook.log" || true
}
trap 'notify FAILED "Revisa el log del deploy."' ERR

exec 9>"$LOCK"
flock -n 9 || { STEP="lock"; notify SKIPPED "Ya había otro deploy corriendo."; exit 1; }
cd "$ROOT"

if ! git diff --quiet || ! git diff --cached --quiet; then
  STEP="working tree check"
  echo "Refusing deploy: working tree has local changes." >&2
  git status --short
  exit 1
fi

STEP="prepare repo"
git fetch --prune origin
git checkout "$BRANCH"
# The server may contain an operational deploy fix that has not been pushed
# upstream. Integrate remote changes without discarding that local commit.
git merge --no-edit "origin/$BRANCH"
COMMIT="$(git rev-parse HEAD)"

STEP="install dependencies"
npm ci
STEP="build"
npm run build
STEP="refresh runtime"
# Next traces the project under the repository path. Static assets must live
# beside the standalone server, otherwise every CSS/JS request returns 404.
RUNTIME_ROOT="$ROOT/.next/standalone/Cositas-de-Jarvis/mkcosmetics"
rm -rf "$RUNTIME_ROOT/.next/static"
cp -a "$ROOT/.next/static" "$RUNTIME_ROOT/.next/"
# The standalone server does not automatically include the repository's
# public assets; copy them beside the runtime server as well.
rm -rf "$RUNTIME_ROOT/public"
cp -a "$ROOT/public" "$RUNTIME_ROOT/public"
STEP="restart service"
sudo -n systemctl restart "$SERVICE"
sudo -n systemctl is-active --quiet "$SERVICE"
STEP="health check"
for attempt in {1..15}; do
  if curl -fsS -o /dev/null "$URL"; then
    notify SUCCEEDED "La página ya está respondiendo correctamente."
    trap - ERR
    exit 0
  fi
  sleep 2
done
exit 1
