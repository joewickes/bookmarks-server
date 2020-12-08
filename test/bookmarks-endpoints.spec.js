const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const fixtures = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    app.set('db', db);
  });

  const testBookmarks = fixtures.makeBookmarksArray();

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks_table').truncate());

  afterEach('cleanup', () => db('bookmarks_table').truncate());

  describe('GET /api/bookmarks', () => {

    context('Given no bookmarks', () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/bookmarks')
          .expect(200, [])
        ;
      });
    });

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousBookmark, expectedBookmark } = fixtures.makeMaliciousBookmark()

      beforeEach('insert malicious bookmark', () => {
        return db
          .into('bookmarks_table')
          .insert([maliciousBookmark])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bookmarks`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedBookmark.title)
            expect(res.body[0].description).to.eql(expectedBookmark.description)
          })
      })
    })

    context('Given there are bookmarks in the db', () => {

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks_table')
          .insert(testBookmarks);
      });

      it('GET /api/bookmarks responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .expect(200, testBookmarks)
      });

    });

  });

  describe('GET /api/bookmarks/:bookmark_id', () => {

    context('Given no bookmarks', () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
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

      it('GET /api/bookmarks/:bookmark_id responds with 200 and the specified article', () => {
        const bookmarkId = 2
        const expectedBookmark = testBookmarks[bookmarkId - 1]
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .expect(200, expectedBookmark)
        ;
      });
    });

  });

  describe('POST /api/bookmarks', () => {

    it('responds with 400 error with invalid rating', () => {
      const badBookmark = {
        title: 'Test new bookmark',
        url: 'https://www.google.com',
        description: 'Google bookmark test',
        rating: 'wrongRating' 
      }

      return supertest(app)
        .post('/api/bookmarks')
        .send(badBookmark)
        .expect(400, { error: { message: `Must submit valid rating` } })
    });

    // Retries based on issues with response timing in ms
    it(`creates an bookmark, responding with 201 and the new bookmark`, function() {
      this.retries(3);

      const newBookmark = {
        title: 'Test new bookmark',
        url: 'https://www.google.com',
        description: 'Google bookmark test',
        rating: '4' 
      }

      return supertest(app)
          .post('/api/bookmarks')
          .send(newBookmark)
          .expect(res => {
            expect(res.body.title).to.eql(newBookmark.title)
            expect(res.body.url).to.eql(newBookmark.url)
            expect(res.body.description).to.eql(newBookmark.description)
            expect(res.body.rating).to.eql(newBookmark.rating)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
          })
          .then(postRes => {
            return supertest(app)
              .get(`/api/bookmarks/${postRes.body.id}`)
              .expect(postRes.body)
          })
        ;
      });
  });

  describe(`DELETE /api/bookmarks/:bookmark_id`, () => {
    context('Given there are bookmarks in the database', () => {
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks_table')
          .insert(testBookmarks)
      })

      it('responds with 204 and removes the bookmark', () => {
        const id = 2;
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== id);
        return supertest(app)
          .delete(`/api/bookmarks/${id}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/bookmarks`)
              .expect(expectedBookmarks)
          })
      })

      context(`Given no bookmarks`, () => {
        it(`responds with 404`, () => {
          const bookmarkId = 123456;
          return supertest(app)
            .delete(`/api/bookmarks/${bookmarkId}`)
            .expect(404, { error: { message: `Bookmark doesn't exist` } })
        });
      });
    })
  })

  describe('PATCH /api/bookmarks/:bookmarks_id', () => {
    context('Given the bookmark exists', () => {
      
      // Insert test bookmarks
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks_table')
          .insert(testBookmarks)
      })
      
      it('responds with 400 with no updates', () => {
        const bookmarkId = 1;

        const updatedBookmarkFields = {};

        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .send(updatedBookmarkFields)
          .expect(400, { error: { message: 'No updates given' } })
      })

      it('responds with 204 and no content with successful update', () => {
        const bookmarkId = 1;

        const updatedBookmarkFields = {
          title: 'Bookmark 1 Updated'
        }

        const expectedBookmark = {
          id: 1,
          title: 'Bookmark 1 Updated',
          url: "https://www.google.com",
          description: 'A Bookmark description',
          rating: '1'
        }

        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .send(updatedBookmarkFields)
          .expect(204)
            .then((res) => {
              return supertest(app)
                .get(`/api/bookmarks/${bookmarkId}`)
                .expect(expectedBookmark)
            })
      })
    })

    context('Given the bookmark doesn\'t exist', () => {
      it('responds with a 404', () => {
        const bookmarkId = 123456;
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } })
      })
    })
  })
});