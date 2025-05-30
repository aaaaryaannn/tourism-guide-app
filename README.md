# Tourism Guide Application (TGA)

A comprehensive tourism guide application that helps tourists explore Maharashtra with features like:
- Interactive map view of attractions
- Guide booking system
- Chat assistance
- Transport booking (Bus & Train)
- Hotel booking
- Trip planning
- Real-time location tracking

## Tech Stack

- Frontend: React with TypeScript, Vite
- Backend: Node.js
- Database: MongoDB
- Maps: Leaflet
- UI Components: Shadcn UI

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd TGA
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add necessary environment variables.

4. Start the development servers:
```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend
npm run client
```

## Features

- **Interactive Map**: Browse attractions with an interactive map interface
- **Guide Booking**: Connect with local guides and book their services
- **Transport Booking**: Book bus and train tickets
- **Hotel Booking**: Search and book hotels
- **Trip Planning**: Create and manage trip itineraries
- **Chat Assistant**: Get instant help with the chat feature
- **Real-time Updates**: Track guides and get real-time location updates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Variables

This project requires the following environment variables:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
MISTRAL_API_KEY=your_mistral_api_key
```

1. Copy `.env.example` to `.env`
2. Fill in your environment variables in `.env`
3. Never commit `.env` file to version control

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This project is configured for deployment on Render. Required environment variables must be set in the Render dashboard.

// Trigger build 