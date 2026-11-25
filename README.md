# BOM Formula Management System

A full-stack Bill of Material (BOM) Formula Management application built with Angular, Node.js, Express, and MongoDB.

## Tech Stack

### Frontend
- Angular 15
- TypeScript
- Angular Material

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure

```text
bill-of-material/
├── backend/
│   ├── Core/
│   │   ├── controllers/
│   │   ├── functions/
│   │   └── models/
│   ├── app.local.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── angular.json
│   └── package.json
│
└── README.md
```

## Features

- Create BOM formulas with product and material rows.
- View formula details.
- Update existing formulas.
- Soft-delete formulas.
- Search and filter formulas.
- Paginated formula listing.
- Automatic formula number generation.
- Input validation for required fields and quantities.
- Duplicate SKU validation within product and material rows.

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB (local installation or Docker)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nandaiser/bill-of-material.git
cd bill-of-material
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/bom_test
```

Make sure MongoDB is running before starting the backend.

Start the development server:

```bash
npm run dev
```

The backend API will be available at:

```text
http://localhost:3000
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Angular development server:

```bash
npm start
```

The frontend will be available at:

```text
http://localhost:4200
```

## API Response Format

The API uses a consistent JSON response structure:

```json
{
  "statusCode": 1,
  "message": "Request successful",
  "data": {}
}
```

A failed request returns:

```json
{
  "statusCode": 0,
  "message": "Error description"
}
```

## Notes

- Ensure MongoDB is running before starting the backend.
- Keep environment variables in `.env`; do not commit credentials or secrets.
- Backend and frontend run independently and communicate through the API.

## Author

Developed as a Full Stack Developer technical assessment.
