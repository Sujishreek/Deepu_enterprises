#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "===================================================================="
echo "  Deepu Enterprises"
echo "  User website : http://localhost:8000/user/"
echo "  Admin panel  : http://localhost:8000/admin/  (login via Admin link in website footer)"
echo "  Demo admin login: admin@deepu.local / Demo@12345"
echo "===================================================================="
python3 -m http.server 8000
