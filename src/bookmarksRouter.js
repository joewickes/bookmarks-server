const express = require('express');
const { v4: uuid } = require('uuid');

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
        res.json(bookmarks)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description = null, rating } = req.body
    const newBookmark = { title, url, description, rating };

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
          .json(bookmark)
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
        res.json(bookmark)
      })
      .catch(next)
    ;

    // const { bookmark_id } = req.params;
    // const bookmark = bookmarks.find(bookmark => bookmark.id === bookmark_id);

    // if (!bookmark) {
    //   logger.error(`Bookmark not found.`)
    //       return res
    //         .status(404)
    //         .send('Bookmark not found')
    //       ;
    // }

    // return res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id === id);

    if (!bookmark) {
      logger.error(`Bookmark not found.`)
        return res
          .status(404)
          .send('Bookmark not found.')
        ;
    }

    const index = bookmarks.findIndex(bookmark => bookmark.id === id);
    bookmarks.splice(index, 1);
    return res.json(bookmarks);
  })
;

module.exports = bookmarksRouter;