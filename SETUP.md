# UPI CryptoConnect - Setup Guide

This guide will help you set up the UPI CryptoConnect application for development.

## Prerequisites

- Node.js (v14 or newer)
- MongoDB (v4.4 or newer)
- npm or yarn

## Setting Up the Project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd upi-cryptoconnect
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..

# Install smart-contract dependencies
cd smart-contracts
npm install
cd ..
```

### 3. Set Up MongoDB

#### Install MongoDB

If you haven't already installed MongoDB, follow the official MongoDB installation guide for your operating system: https://docs.mongodb.com/manual/installation/

#### Start MongoDB

```bash
# Start MongoDB service
mongod --dbpath=/data/db
```

#### Create the Database

MongoDB will automatically create the database when you first connect to it.

### 4. Configure Environment Variables

Create a `.env` file in the server directory with the following contents:

