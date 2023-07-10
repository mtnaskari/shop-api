# Shop API

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2012.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-%3E%3D%206.0.0-orange.svg)](https://www.npmjs.com/)

## Description

Shop API is a RESTful API that provides endpoints for managing shops. It allows users to perform operations such as creating, updating, and retrieving shop data.

## Features

- Register user
- Login user
- Get List of all products
- ...

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- TypeScript
- JWT

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:mtnaskari/shop-api.git
   ```

2. Navigate to the project directory:

   ```bash
   cd shop-api
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up the environment variables by creating a `.env` file in the project root directory. You can use the `.env.example` file as a template and then run the check env command.

   ```bash
   npm run check:env
   ```

5. To seed the database with categories and products, you can use the following command.

   ```bash
   npm run seed:all
   ```

5. Start the development server:

   ```bash
   npm run start:dev
   ```

## Documentation

The API documentation is available in the [Postman Docs](https://elements.getpostman.com/redirect?entityId=22129578-3916c96e-a848-43f8-8de1-521ef61bec75&entityType=collection).
