const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
};

// returns the URLs where the userID is equal to the id of the currently logged in user.
const urlsForUser = function(id,urlDatabase) {
  let urls = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

const generateRandomString = function() {
  let shortenedURL = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz';
  for (let i = 0; i < 6; i++) {
    shortenedURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortenedURL;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };