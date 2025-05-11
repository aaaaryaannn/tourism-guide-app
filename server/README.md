# Tourism Guide App - Server

This is the backend server for the Tourism Guide Application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Deployment Build

For deployment, use one of the following commands based on your environment:

### Windows (PowerShell):
```powershell
.\build.ps1
```

### Unix/Linux/Mac (Bash):
```bash
./build.sh
```

These scripts will:
1. Clean the existing installation
2. Perform a fresh install of dependencies
3. Ensure Zod is properly installed
4. Run the TypeScript build

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript code
- `npm test`: Run tests

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── index.ts
├── dist/
├── .env
├── package.json
└── tsconfig.json
```

## API Endpoints

- `GET /health`: Health check endpoint
- More endpoints coming soon... 