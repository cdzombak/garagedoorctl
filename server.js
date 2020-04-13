"use strict";

// Based on https://github.com/Howchoo/garage-pi/blob/master/server.js
// but simpler.

const bodyParser = require('body-parser');
const express = require('express');
const rpio = require('rpio');

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const apiKey = process.env.GDCTL_API_KEY || "foobar";
const port = process.env.GDCTL_PORT || 80;
const relayPin = process.env.GDCTL_RELAY_PIN || 11;

rpio.open(relayPin, rpio.OUTPUT, rpio.HIGH);

app.get('/ping', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).end(JSON.stringify({ status: "OK", "message": "API is online." }));
});

app.post('/', function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const providedAPIKey = req.body.api_key;
  if (providedAPIKey != apiKey) {
    res.status(404).end(JSON.stringify({ status: "Error", "message": "Invalid API key." }));
    return;
  }

  rpio.write(relayPin, rpio.LOW);
  setTimeout(function() {
    rpio.write(relayPin, rpio.HIGH);
  }, 500);

  res.status(200).end(JSON.stringify({ status: "OK", "message": "Garage door button clicked!" }));
});

app.listen(port);
console.log('Running on http://localhost:' + port);
