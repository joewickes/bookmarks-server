function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Bookmark 1',
      url: "https://www.google.com",
      description: 'A Bookmark description',
      rating: '1'
    },
    {
      id: 2,
      title: 'Bookmark 2',
      url: "https://www.google.com",
      description: 'A Bookmark description',
      rating: '2'
    },
    {
      id: 3,
      title: 'Bookmark 3',
      url: "https://www.google.com",
      description: 'A Bookmark description',
      rating: '3'
    },
    {
      id: 4,
      title: 'Bookmark 4',
      url: "https://www.google.com",
      description: 'A Bookmark description',
      rating: '4'
    },
    {
      id: 5,
      title: 'Bookmark 5',
      url: "https://www.google.com",
      description: 'A Bookmark description',
      rating: '5'
    }
  ]
}

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    url: 'https://www.hackers.com',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating: 1,
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousBookmark,
    expectedBookmark,
  }
}

module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark,
}