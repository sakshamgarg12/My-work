# CRM Application

A full-stack Customer Relationship Management (CRM) application built with Node.js Express backend and React frontend.

## Project Structure

```
crm-app/
├── client/              # React frontend application
│   └── src/
│       ├── components/  # Reusable React components
│       ├── pages/       # Page components
│       ├── services/    # API service calls
│       └── App.js       # Main App component
│
├── server/              # Express backend application
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/      # Route controllers
│   ├── config/          # Configuration files
│   └── server.js        # Server entry point
│
└── README.md            # Project documentation
```

## Getting Started

### Server Setup
1. Navigate to the server directory
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Client Setup
1. Navigate to the client directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Features
- Customer management
- Sales pipeline tracking
- Contact management
- Activity logging

## Technologies
- **Backend**: Node.js, Express.js
- **Frontend**: React
- **Database**: MongoDB (or your preferred database)
