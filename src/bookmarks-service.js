const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks_table');
  },
  getById(knex, id) {
    return knex('bookmarks_table')
      .where('id', id).first()
    ;
  },
  insertBookmark(knex, newBookmark) {
    return knex
      .insert(newBookmark)
      .into('bookmarks_table')
      .returning('*')
      .then(rows => {
        return rows[0];
      })
    ;
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks_table')
      .where('id', id)
      .delete()
    ;
  },
};

module.exports = BookmarksService;