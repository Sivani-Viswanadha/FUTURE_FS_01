/* ============================================================
   server.js — Tiny Express backend for the portfolio contact form
   ============================================================
   What this file does:
   - Starts a small web server using Express.
   - Exposes ONE API endpoint:  POST /contact
   - When the frontend submits the form, this server takes the
     name/email/message and emails it to YOU using Gmail + Nodemailer.

   How the pieces fit together:
     Browser (script.js)  --fetch POST /contact-->  server.js
       server.js  --nodemailer-->  Gmail SMTP  -->  your inbox
   ============================================================ */

// 1) Load environment variables from the .env file into process.env
//    (so we can read SENDER_EMAIL, SENDER_APP_PASSWORD, etc.)
require('dotenv').config();

console.log('EMAIL:', process.env.SENDER_EMAIL);
console.log('PASSWORD:', process.env.SENDER_APP_PASSWORD);
console.log('RECEIVER:', process.env.RECEIVER_EMAIL);

// 2) Import the libraries we installed via `npm install`
const express = require('express');     // web server framework
const cors = require('cors');           // lets the browser call us from a different origin
const nodemailer = require('nodemailer'); // sends emails over SMTP

// 3) Create the Express app
const app = express();

// 4) Middleware
//    - cors()        : allow the frontend (running on a different port/file) to call this API
//    - express.json(): automatically parse incoming JSON request bodies
app.use(cors());
app.use(express.json());

// 5) A simple health-check route so you can test the server is alive in the browser
app.get('/', (req, res) => {
  res.send('Portfolio backend is running ✅  POST to /contact to send a message.');
});

// 6) Configure Nodemailer with your Gmail account
//    "service: gmail" tells Nodemailer to use Gmail's SMTP servers automatically.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,        // your Gmail address
    pass: process.env.SENDER_APP_PASSWORD, // the 16-char Google App Password
  },
});

// 7) THE CONTACT FORM ENDPOINT
//    The frontend sends: { name, email, message }
//    We validate it, send an email, and reply with success/failure JSON.
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    // --- Basic input validation ---
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and message.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Input too long.',
      });
    }

    // --- Build the email ---
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.SENDER_EMAIL}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email, // so when you hit "Reply", it goes to the visitor
      subject: `New portfolio message from ${name}`,
      text:
        `You received a new message from your portfolio website:\n\n` +
        `Name:    ${name}\n` +
        `Email:   ${email}\n\n` +
        `Message:\n${message}\n`,
    };

    // --- Send it ---
    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (err) {
    // Log the real error in the terminal (useful for debugging),
    // but don't leak details back to the user.
    console.error('Error sending email:', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while sending the email.',
    });
  }
});

// 8) Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
