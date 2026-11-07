#!/usr/bin/env bash
cd "$(dirname "$0")/frontend"
python3 -m http.server 8000 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null' EXIT
sleep 1
if command -v xdg-open >/dev/null; then xdg-open http://localhost:8000/; elif command -v open >/dev/null; then open http://localhost:8000/; fi
wait "$server_pid"
