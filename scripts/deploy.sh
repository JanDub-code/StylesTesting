#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="styles-testing-survey"
APP_USER="styles-survey"
APP_DIR="/opt/styles-testing-survey"
NOLOGIN_SHELL="/usr/sbin/nologin"
if [[ ! -x "$NOLOGIN_SHELL" && -x "/sbin/nologin" ]]; then
  NOLOGIN_SHELL="/sbin/nologin"
fi
RELEASE_DIR="$APP_DIR/current"
ENV_FILE="/etc/${APP_NAME}.env"
SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SUDO="sudo"
if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
fi

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

run_sudo() {
  if [[ -n "$SUDO" ]]; then
    $SUDO "$@"
  else
    "$@"
  fi
}

run_as_app() {
  if [[ -n "$SUDO" ]]; then
    $SUDO -u "$APP_USER" "$@"
  else
    runuser -u "$APP_USER" -- "$@"
  fi
}

need node
need npm
need rsync
need systemctl
if [[ -z "$SUDO" ]]; then
  need runuser
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  run_sudo useradd --system --home "$APP_DIR" --shell "$NOLOGIN_SHELL" "$APP_USER"
fi

run_sudo mkdir -p "$RELEASE_DIR"

SOURCE_REAL="$(realpath "$SOURCE_DIR")"
RELEASE_REAL="$(realpath -m "$RELEASE_DIR")"
if [[ "$SOURCE_REAL" != "$RELEASE_REAL" ]]; then
  run_sudo rsync -a --delete \
    --exclude ".git/" \
    --exclude "node_modules/" \
    --include ".env.example" \
    --exclude ".env" \
    --exclude ".env.*" \
    "$SOURCE_DIR/" "$RELEASE_DIR/"
fi

run_sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  run_sudo install -m 0600 -o root -g root "$RELEASE_DIR/.env.example" "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example. Fill DATABASE_URL, distinct ADMIN_TOKEN and SURVEY_COOKIE_SECRET values, and ALLOWED_HOSTS, then run this script again." >&2
  exit 1
fi

cd "$RELEASE_DIR"
run_as_app npm ci --omit=dev
run_as_app npm run check
run_as_app npm test

run_sudo install -m 0644 "$RELEASE_DIR/deploy/systemd/${APP_NAME}.service" "$SERVICE_FILE"
run_sudo systemctl daemon-reload
run_sudo systemctl enable "$APP_NAME"
run_sudo systemctl restart "$APP_NAME"
run_sudo systemctl --no-pager --lines=20 status "$APP_NAME"

echo "Deploy done. App service: $APP_NAME"
