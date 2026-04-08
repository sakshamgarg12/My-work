# Catalyst CRM

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=0B1221)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](./server/package.json)

A full-stack Customer Relationship Management (CRM) application built with an Express backend and React frontend.

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
- Company management (create, update, delete, filters)
- Contact management
- Lead management and pipeline tracking
- JWT authentication with login/register flow
- Dashboard metrics

## Technologies
- **Backend**: Node.js, Express.js
- **Frontend**: React, React Router
- **Database**: MySQL (Sequelize ORM)
