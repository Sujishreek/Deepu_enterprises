#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "===================================================================="
echo "  Deepu Enterprises"
echo "  User website : http://localhost:8000/user/"
echo "  Admin panel  : http://localhost:8000/Admin/Frontend/"
echo "  Admin sign-in uses credentials configured in Apps Script."
echo "===================================================================="
python3 -m http.server 8000
