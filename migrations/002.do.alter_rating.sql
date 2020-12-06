CREATE TYPE rating_param AS ENUM (
    '1',
    '2',
    '3',
    '4',
    '5'
);

ALTER TABLE bookmarks_table
  ADD COLUMN
    rating rating_param NOT NULL;