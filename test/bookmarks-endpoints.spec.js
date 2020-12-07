const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmarks Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    app.set('db', db);
  });

  const testBookmarks = makeBookmarksArray();

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks_table').truncate());

  afterEach('cleanup', () => db('bookmarks_table').truncate());

  describe('GET /bookmarks', () => {

    context('Given no bookmarks', () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, [])
        ;
      });
    });

    context('Given there are bookmarks in the db', () => {

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks_table')
          .insert(testBookmarks);
      });

      it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, testBookmarks)
      });

    });

  });

  describe('GET /bookmarks/:bookmark_id', () => {

    context('Given no bookmarks', () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
        ;
      });
    });

    context('Given there are bookmarks in the db', () => {
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks_table')
          .insert(testBookmarks)
        ;
      });

      it('GET /bookmarks/:bookmark_id responds with 200 and the specified article', () => {
        const bookmarkId = 2
        const expectedBookmark = testBookmarks[bookmarkId - 1]
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(200, expectedBookmark)
        ;
      });
    });

  });

  describe.only('POST /bookmarks', () => {
    // Retries based on issues with response timing in ms
    it(`creates an bookmark, responding with 201 and the new bookmark`, function() {
      this.retries(3)
    ;

    const newBookmark = {
      title: 'Test new bookmark',
      url: 'https://www.google.com',
      description: 'Google bookmark test',
      rating: '4' 
    }

    return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
        )
      ;
    });
  });

});