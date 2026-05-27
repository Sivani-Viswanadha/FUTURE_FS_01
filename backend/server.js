/* ============================================================
   server.js — Tiny Express backend for portfolio contact form
   ============================================================ */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

/* ============================================================
   1. Middleware
============================================================ */
app.use(cors({
  origin: "*"
}));

app.use(express.json());

/* ============================================================
   2. Startup Debug Logs
============================================================ */
console.log('================ SERVER START ================');
console.log('EMAIL:', process.env.SENDER_EMAIL || 'MISSING');
console.log(
  'PASSWORD:',
  process.env.SENDER_APP_PASSWORD
    ? 'LOADED ✅'
    : 'MISSING ❌'
);
console.log('RECEIVER:', process.env.RECEIVER_EMAIL || 'MISSING');
console.log('==============================================');

/* ============================================================
   3. Health Route
============================================================ */
app.get('/', (req, res) => {
  res.send(
    'Portfolio backend is running ✅ POST to /contact to send a message.'
  );
});

/* ============================================================
   4. Nodemailer Transport
============================================================ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_APP_PASSWORD,
  },
});

/* ============================================================
   5. Verify transporter on startup
============================================================ */
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail transporter verification failed');
    console.error(error);
  } else {
    console.log('✅ Gmail transporter ready');
  }
});

/* ============================================================
   6. Contact Route
============================================================ */
app.post('/contact', async (req, res) => {
  console.log('📩 Incoming contact request');

  try {
    const { name, email, message } = req.body || {};

    console.log('Request body:', {
      name,
      email,
      messageLength: message?.length || 0,
    });

    /* ---------- Validation ---------- */
    if (!name || !email || !message) {
      console.log('❌ Validation failed: Missing fields');

      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and message.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: Invalid email');

      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    if (
      name.length > 100 ||
      email.length > 255 ||
      message.length > 2000
    ) {
      console.log('❌ Validation failed: Input too long');

      return res.status(400).json({
        success: false,
        error: 'Input too long.',
      });
    }

    /* ---------- Build email ---------- */
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.SENDER_EMAIL}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text:
        `You received a new portfolio message\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}`,
    };

    console.log('📨 Sending email...');

    /* ---------- Send email ---------- */
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully');
    console.log('Message ID:', info.messageId);

    return res.json({
      success: true,
      message: 'Email sent successfully.',
    });

  } catch (err) {
    console.error('❌ CONTACT ERROR');
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
});

/* ============================================================
   7. Start Server
============================================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});