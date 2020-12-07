const express = require('express');
const { v4: uuid } = require('uuid');
const xss = require('xss');

const validation = require('./validation');
const logger = require('./logger');
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();
const jsonParser = express.json();

// bookmarksRouter.use(validation);
bookmarksRouter.use(bodyParser);

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks.map(bookmark => {
          return {
            id: bookmark.id,
            title: xss(bookmark.title),
            url: xss(bookmark.url),
            description: xss(bookmark.description),
            rating: xss(bookmark.rating)
          }
        }))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description = null, rating } = req.body
    const newBookmark = { title, url, description, rating };

    // Rating validation
    const vRating = parseInt(rating);
    if (vRating !== 1 && vRating !== 2 && vRating !== 3 && vRating !== 4 && vRating !== 5) {
      return res.status(400).json({
        error: { message: 'Must submit valid rating' }
      })
    }

    for (const [key, value] of Object.entries(newBookmark)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json({
            id: bookmark.id,
            title: xss(bookmark.title),
            url: xss(bookmark.url),
            description: xss(bookmark.description),
            rating: xss(bookmark.rating)
          })
      })
      .catch(next)
  })
;

bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .get((req, res, next) => {

    const knexInstance = req.app.get('db');
    BookmarksService.getById(knexInstance, req.params.bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` }
          });
        }

        return res.json({
          id: bookmark.id,
          title: xss(bookmark.title),
          url: xss(bookmark.url),
          description: xss(bookmark.description),
          rating: xss(bookmark.rating)
        })
      })
      .catch(next)
    ;
  })
  .delete((req, res, next) => {
    BookmarksService.getById(req.app.get('db'), req.params.bookmark_id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: `Bookmark doesn't exist` }
        });
      }

      BookmarksService.deleteBookmark(req.app.get('db'), req.params.bookmark_id)
        .then(() => {
          res.status(204).end();
        })
        .catch(next)

      })
  })
;

module.exports = bookmarksRouter;