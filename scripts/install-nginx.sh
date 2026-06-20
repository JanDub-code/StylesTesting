#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="styles-testing-survey"
APP_PORT="${APP_PORT:-3000}"
DOMAIN="${DOMAIN:-${1:-}}"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="/etc/nginx/sites-available/${APP_NAME}.conf"
ENABLED="/etc/nginx/sites-enabled/${APP_NAME}.conf"

if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 example.com" >&2
  echo "   or: DOMAIN=example.com $0" >&2
  exit 1
fi
if [[ ! "$DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "Invalid domain: $DOMAIN" >&2
  exit 1
fi
if [[ ! "$APP_PORT" =~ ^[0-9]+$ ]]; then
  echo "Invalid APP_PORT: $APP_PORT" >&2
  exit 1
fi

SUDO="sudo"
if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
fi

run_sudo() {
  if [[ -n "$SUDO" ]]; then
    $SUDO "$@"
  else
    "$@"
  fi
}

escape_sed() {
  printf '%s' "$1" | sed -e 's/[\/&]/\\&/g'
}

if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" && -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ]]; then
  TEMPLATE="$SOURCE_DIR/deploy/nginx/${APP_NAME}-https.conf.template"
  MODE="https"
else
  TEMPLATE="$SOURCE_DIR/deploy/nginx/${APP_NAME}-http.conf.template"
  MODE="http"
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

sed \
  -e "s/__DOMAIN__/$(escape_sed "$DOMAIN")/g" \
  -e "s/__APP_PORT__/$(escape_sed "$APP_PORT")/g" \
  "$TEMPLATE" > "$TMP_FILE"

run_sudo install -d /etc/nginx/sites-available /etc/nginx/sites-enabled
run_sudo install -m 0644 "$TMP_FILE" "$TARGET"
run_sudo ln -sfn "$TARGET" "$ENABLED"
run_sudo nginx -t
run_sudo systemctl reload nginx

if [[ "$MODE" == "https" ]]; then
  echo "Installed hardened HTTPS nginx config for $DOMAIN."
else
  cat <<MSG
Installed HTTP nginx config for $DOMAIN because Let's Encrypt certificates were not found.
Next steps:
  1) Issue a certificate, for example: sudo certbot --nginx -d $DOMAIN
  2) Re-run this script to install the HTTPS redirect + HSTS config.
MSG
fi
