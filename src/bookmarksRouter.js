const express = require('express');
const { v4: uuid } = require('uuid');

const validation = require('./validation');
const logger = require('./logger');
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

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
  ;

    // const knexInstance = req.app.get('db');
    // BookmarksService.getAllBookmarks(knexInstance)
    //   .then(bookmarks => {
    //     if (!bookmarks) {
    //       logger.error(`Bookmarks not found.`);
    //       return res
    //         .status(404)
    //         .send('Bookmarks not found')
    //       ;
    //     }
  
    //     return res.json(bookmarks || '/BOOKMARKS');
      });
  // })
  // .post((req, res) => {
  //   const { title, url, desc = '', rating = null } = req.body;

  //   if (!title) {
  //     logger.error(`Title required, but not found`)
  //     return res
  //       .status(404)
  //       .send('Title required')
  //     ;
  //   }

  //   if (!url) {
  //     logger.error(`Url required, but not found.`)
  //     return res
  //       .status(404)
  //       .send('Url not found')
  //     ;
  //   }

  //   const id = uuid();

  //   const newObj = {
  //     id,
  //     title,
  //     url,
  //     desc,
  //     rating
  //   }

  //   bookmarks.push(newObj);
  //   res.json(bookmarks);
  // })
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