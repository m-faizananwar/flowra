#!/bin/bash
# ============================================================
#  Flowra Monorepo — Local Development Bootstrap
# ============================================================

MONOREPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENGINE_PORT=3005
WEB_PORT=3000

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

pids=()

cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${RESET}"
    for pid in "${pids[@]}"; do
        kill "$pid" 2>/dev/null
    done
    wait
    echo -e "${GREEN}All services stopped.${RESET}"
    exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${CYAN}=====================================${RESET}"
echo -e "${CYAN}   Flowra Monorepo — Dev Environment ${RESET}"
echo -e "${CYAN}=====================================${RESET}"
echo ""

echo -e "${YELLOW}Checking dependencies...${RESET}"
(cd "$MONOREPO_DIR" && pnpm install --frozen-lockfile 2>/dev/null || pnpm install) &
wait $!

echo -e "${GREEN}✓ Dependencies ready${RESET}"
echo ""

echo -e "${CYAN}[web]${RESET} Starting Next.js on port ${WEB_PORT}..."
(cd "$MONOREPO_DIR" && pnpm --filter @flowra/web dev) &
pids+=($!)

echo -e "${CYAN}[engine]${RESET} Starting engine on port ${ENGINE_PORT}..."
(cd "$MONOREPO_DIR" && pnpm --filter @flowra/engine dev) &
pids+=($!)

echo -e "${CYAN}[ngrok]${RESET} Starting ngrok tunnel for port ${ENGINE_PORT}..."
ngrok http --domain=uncontrastable-teri-honouredly.ngrok-free.dev ${ENGINE_PORT} &>/dev/null &
pids+=($!)

sleep 3

echo ""
echo -e "${GREEN}=====================================${RESET}"
echo -e "${GREEN}  All services started successfully  ${RESET}"
echo -e "${GREEN}=====================================${RESET}"
echo ""
echo -e "  ${CYAN}Web App:${RESET}      http://localhost:${WEB_PORT}"
echo -e "  ${CYAN}Engine:${RESET}       http://localhost:${ENGINE_PORT}"
echo -e "  ${CYAN}Webhook URL:${RESET}  https://uncontrastable-teri-honouredly.ngrok-free.dev/api/webhooks/github"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${RESET}"
echo ""

wait
