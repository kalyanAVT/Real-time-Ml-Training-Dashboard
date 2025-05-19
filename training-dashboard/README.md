# Training Dashboard (Frontend)

This is the Next.js/React frontend for the ML Training Dashboard project.

## Features

- Select or drag-and-drop a dataset file for training
- Send dataset location to the backend
- Start, stop, and restart model training
- View real-time training metrics and agent chat
- Configuration modal for training parameters

## Setup

1. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
2. Run the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes

- The backend must be running for full functionality.
- Dataset selection supports both file picker and drag-and-drop.
- All API calls are managed in `src/services/api`.
