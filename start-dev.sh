#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Docker database...${NC}"
docker compose -f docker-compose.db.yml up -d

echo -e "${YELLOW}Waiting for database...${NC}"
sleep 10

echo -e "${GREEN}Database ready!${NC}"
echo ""
echo -e "${YELLOW}Now run these commands in separate terminals:${NC}"
echo -e "  Terminal 1: ${GREEN}cd server && pnpm dev${NC}"
echo -e "  Terminal 2: ${GREEN}cd client && pnpm dev${NC}"
echo ""
echo -e "${YELLOW}Or use these shortcuts:${NC}"
echo -e "  ${GREEN}make server${NC}  (in terminal 1)"
echo -e "  ${GREEN}make client${NC}  (in terminal 2)"
