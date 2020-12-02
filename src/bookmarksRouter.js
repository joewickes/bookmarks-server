const express = require('express');
const { v4: uuid } = require('uuid');

const validation = require('./validation');
const logger = require('./logger');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter.use(validation);
bookmarksRouter.use(bodyParser);

const bookmarks = [
  {
    "id": "8sdfbvbs65sd",
    "title": "Google",
    "url": "http://google.com",
    "desc": "An indie search engine startup",
    "rating": 4
  },
  {
    "id": "87fn36vd9djd",
    "title": "Fluffiest Cats in the World",
    "url": "http://medium.com/bloggerx/fluffiest-cats-334",
    "desc": "The only list of fluffy cats online",
    "rating": 5
  }
]

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {

    if (!bookmarks) {
      logger.error(`Bookmarks not found.`)
      return res
        .status(404)
        .send('Bookmarks not found')
      ;
    }

    return res.json(bookmarks);
  })
  .post((req, res) => {
    const { title, url, desc = '', rating = null } = req.body;

    if (!title) {
      logger.error(`Title required, but not found`)
      return res
        .status(404)
        .send('Title required')
      ;
    }

    if (!url) {
      logger.error(`Url required, but not found.`)
      return res
        .status(404)
        .send('Url not found')
      ;
    }

    const id = uuid();

    const newObj = {
      id,
      title,
      url,
      desc,
      rating
    }

    bookmarks.push(newObj);
    res.json(bookmarks);
  })
;

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id === id);

    if (!bookmark) {
      logger.error(`Bookmark not found.`)
          return res
            .status(404)
            .send('Bookmark not found')
          ;
    }

    return res.json(bookmark);
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