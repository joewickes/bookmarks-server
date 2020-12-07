const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing text"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Bookmarks Proj @ "/"');
  });
});