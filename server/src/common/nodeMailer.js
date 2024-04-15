const nodemailer = require('nodemailer');
require('dotenv').config()


// Configure Nodemailer

const configuration={
    host: 'smtp.gmail.com', // Use the SMTP server host for your email provider
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }}

    //console.log('config', configuration)

exports.transporter = nodemailer.createTransport(
configuration
    

);

    
