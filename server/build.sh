#!/bin/bash

# Clean install of dependencies
rm -rf node_modules package-lock.json
rm -rf ../node_modules ../package-lock.json

# Create root package.json if it doesn't exist
if [ ! -f "../package.json" ]; then
    cat > "../package.json" << EOF
{
  "name": "tourism-guide-app-root",
  "private": true,
  "dependencies": {
    "zod": "^3.22.4"
  }
}
EOF
fi

# Install dependencies in root directory for shared code
cd ..
npm install
cd server

# Install dependencies with specific focus on zod in server directory
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