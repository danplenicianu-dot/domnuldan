#!/bin/bash
cd "$(dirname "$0")/dist"
URL="file://$PWD/index.html"
echo "Deschid: $URL"
open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || start "" "$URL" 2>/dev/null || true
