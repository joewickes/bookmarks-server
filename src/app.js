require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const BookmarksService = require('./bookmarks-service');

const app = express();

const validation = require('./validation');
const bookmarksRouter = require('./bookmarksRouter');

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// app.use(validation);

app.use(bookmarksRouter);

app.get('/', (req, res, next) => {
  return res.send('Bookmarks Proj @ "/"')
});

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app;