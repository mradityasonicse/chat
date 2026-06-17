#!/bin/bash

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start the server
npm run dev
