#!/bin/sh
set -e

# Volume mounted at /app/data is root-owned at first boot.
# Fix ownership so the nextjs user can write to it.
chown -R nextjs:nodejs /app/data 2>/dev/null || true

# Drop privileges and start the Next.js server
exec su-exec nextjs:nodejs node /app/server.js
