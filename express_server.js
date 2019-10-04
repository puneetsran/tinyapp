const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { generateRandomString } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const users = {
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
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

// will redirect to login (if no user is logged in) or urls (if user is logged in)
app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

// will renter the urls_index page when on urls
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]], // passing in user-id
    urls: urlsForUser(req.session["user_id"], urlDatabase) };
  return res.render("urls_index", templateVars);
});

// will render urls new, unless user is not logged in
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  if (!templateVars.user) {
    return res.redirect("/login"); // redirects to login if user not logged in
  }
  return res.render("urls_new", templateVars);
});

// renders the urls/shortURL page
app.get("/urls/:shortURL", (req, res) => {

  // if no user is logged in, page is not rendered
  if (!req.session["user_id"]) {
    return res.status(400).send(`Please login to edit the URL.`);
  }

  // if url does not match an existing shortURL
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send(`Requested URL does not exist.`);
  }

  // if a user is logged in but is trying to edit another users shortURL
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.status(400).send(`Permission to edit URL not granted.`);
  }
  let templateVars = {
    user: users[req.session["user_id"]], // passing in user-id
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  return res.render("urls_show", templateVars);
});

// will redirect to website to which the shortURL corresponds to
app.get("/u/:shortURL", (req, res) => {
  return res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// a get /register endpoint, which returns the urls_register template
app.get("/register", (req, res) => {
  return res.render("urls_register");
});

// a get /login endpoint, which returns the urls_login template
app.get("/login", (req, res) => {
  return res.render("urls_login");
});

// a post /urls endpoint
app.post("/urls", (req, res) => {

  // if user if not not logged in, acess will be denied
  if (!req.session["user_id"]) {
    return res.status(400).send(`Unable to perform action`);
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  return res.redirect(`/urls/${shortURL}`);
});

// a post /urls/shortURL endpoint
app.post("/urls/:shortURL", (req, res) => {

  // if user to which the shortURL belongs to, is not logged in
  const shortURL = req.params.shortURL;
  if (req.session["user_id"] !== urlDatabase[shortURL].userID) {
    return res.send(`Unable to perform action`);
  }
  
  // redirect to Edit page after pressing edit on urls page
  urlDatabase[shortURL].longURL = req.body.longURL;
  return res.redirect(`/urls/${shortURL}`);
});

// redirect to url after pressing submit
app.post("/urls/:shortURL/Submit", (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.newURL;
  return res.redirect(`/urls`);
});

// get redirected to urls after pressing delete
app.post("/urls/:shortURL/delete", (req, res) => {

  // prevents any other user from trying to delete shortURL
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.send(`Unable to delete urls`);
  }
  delete urlDatabase[req.params.shortURL].userID;
  return res.redirect(`/urls`);
});

// redirects to urls page after registering
app.post("/register" , (req, res) => {

  // if email box is left empty
  if (!req.body.email) {
    return res.status(400).send(`Please enter an email address.`);
  }

  // if password box is left empty
  if (!req.body.password) {
    return res.status(400).send(`Please enter a password.`);
  }

  // if an existing user tries to register
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send(`Email already exists`);
  }
  const randUserID = generateRandomString();
  users[randUserID] = {
    id: randUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session["user_id"] = randUserID;
  return res.redirect(`/urls`);
});

// redirects to urls after login
app.post("/login", (req, res) => {

  const realPassword = getUserByEmail(req.body["email"], users);

  // if email address is incorrect
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send(`Please enter valid credentials.`);
  }

  // if password entered is incorrect
  if (!bcrypt.compareSync(req.body.password, users[realPassword]["password"])) {
    return res.status(403).send(`Wrong password`);
  }
  req.session["user_id"] =  getUserByEmail(req.body.email, users);
  return res.redirect(`/urls`);
});

// redirects to urls after logout and clears cookie
app.post("/logout", (req, res) =>  {
  req.session = null;
  return res.redirect(`/urls`);
});