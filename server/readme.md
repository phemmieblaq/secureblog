# Express.js Application Setup

This guide explains how to set up and run the Express.js application using an environment file for configuration settings.

## Prerequisites

Before you start, make sure you have the following installed:
- Node.js (Download from [Node.js official website](https://nodejs.org/))
- npm (Comes with Node.js)

## Installation

Follow these steps to get your development environment running:

1. **Clone the repository**

   ```bash
   git clone https://github.com/phemmieblaq/secureblog  //it is private on github after submission it would be public so it can be accessed 


2. **Install dependencies**
    npm install

3. **Setting Up the .env File**
    create a file named .env in your server root folder

4.DB_USER=<user>
DB_PASSWORD=<password>
DB_HOST=<host>
DB_PORT=<port>
DB_DATABASE=<database>


DEFAULT_DB_SCHEMA=<your schema name>


ACCESS_TOKEN_SECRET =<accessToken>
REFRESH_TOKEN_SECRET=<refresh Token>

MAIL_USERNAME= <email address>
MAIL_PASSWORD= <app password>




SECRET_SESSION_KEY=<session key>

4. **Loading up .env file**
The application uses the dotenv package to load the environment variables from the .env file. Ensure your main app file (usually app.js or index.js) includes the following line at the top:
require('dotenv').config();


5.  **Running the application**
    cd to the server (cd server)
    then type npm start



 