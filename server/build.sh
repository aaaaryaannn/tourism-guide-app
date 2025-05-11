#!/bin/bash

# Clean install of dependencies
rm -rf node_modules package-lock.json

# Install dependencies with specific focus on zod
npm install
npm install --save zod@3.22.4

# Run TypeScript compilation
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
else
    echo "Build failed!"
    exit 1
fi 