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
  for (let url in urlDatabase)
  if (id === urlDatabase[url].userID) {
    urls[url] = urlDatabase[url];
  }
  return urls;
}

module.exports = { getUserByEmail, urlsForUser };