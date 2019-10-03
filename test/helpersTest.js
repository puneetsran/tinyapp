const { assert } = require('chai');
const { getUserByEmail, urlsForUser, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  option1: { longURL: "https://www.youtube.com", userID: "userRandomID" },
  option2: { longURL: "https://www.facebook.com", userID: "userRandomID" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

});

describe('urlsForUser', function() {
  it('should return a url where userID is equal to the id of the currently logged in user', function() {
    const urls = urlsForUser("userRandomID", urlDatabase);
    const expectedOutput = {
      option1: { longURL: "https://www.youtube.com", userID: "userRandomID" },
      option2: { longURL: "https://www.facebook.com", userID: "userRandomID" }
    };
    assert.deepEqual(urls, expectedOutput);
  });
  it('should return an empty object if no urls exist', function() {
    const urls = urlsForUser("user2RandomID", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should generate a random string of 6 characters', function() {
    const string = generateRandomString();
    urlDatabase[string] = {longURL: "https://www.youtube.com", userID: "userRandomID"};
    const expectedOutput = 6;
    assert.equal(string.length, expectedOutput);
  });
});