'use strict';
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token,timezone');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/status', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    statusCode: 1,
    message: 'Server is running!',
    mongo: states[mongoose.connection.readyState] || 'unknown',
  });
});

// Same mount point as BACKEND-FULL: POST /core/<router>/<action>
app.use('/core', require('./Core/index'));

app.use((req, res) => {
  res.status(404).json({ statusCode: 0, message: `Not found: ${req.originalUrl}` });
});

module.exports = app;
