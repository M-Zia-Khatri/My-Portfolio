#!/bin/bash

echo "Stopping database..."
docker compose -f docker-compose.db.yml down

echo "✓ Database stopped"
echo ""
echo "Press Ctrl+C in your terminal windows to stop dev servers"
