const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { generateRandomString } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  // ERIC
  // use real keys in prod
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

app.get("/", (req, res) => {
  // ERIC
  // can use early returns and always return res.redirect and res.render to be safe 
  // and makesure our program doesnt write headers twice
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  } 
  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  // ERIC
  // variable isn't changing... use const
  const newURLs = urlsForUser(req.session["user_id"], urlDatabase)
  let templateVars = { 
    user: users[req.session["user_id"]], // passing in user-id
    urls: newURLs };
  return res.render("urls_index", templateVars);
});

// get redirected to login page if not logged-in
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]] // passing in user-id
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if(!req.session["user_id"]) {
    return res.status(400).send(`Please login to edit the URL.`);
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send(`Requested URL does not exist.`);
  }
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

app.get("/u/:shortURL", (req, res) => {
  // ERIC
  // Don't really need the variable
  // const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// a get /register endpoint, which returns the urls_register template
app.get("/register", (req, res) => {
  return res.render("urls_register");
});

app.get("/login", (req, res) => {
  return res.render("urls_login");
});

// get redirected to urls after pressing delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.send(`Unable to delete urls`);
  }
  delete urlDatabase[req.params.shortURL].userID;
  return res.redirect(`/urls`);
});

// redirect to Edit page after pressing edit on urls page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session["user_id"] !== urlDatabase[shortURL].userID) {
    return res.send(`Unable to perform action`);
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  return res.redirect(`/urls/${shortURL}`);
});

// redirect to url after pressing submit
app.post("/urls/:shortURL/Submit", (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.newURL;
  return res.redirect(`/urls`);
});

// redirects to urls/random string
app.post("/urls", (req, res) => {
  if(!req.session["user_id"]) {
    return res.status(400).send(`Unable to perform action`);
  }
  const string = generateRandomString();
  urlDatabase[string] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  return res.redirect(`/urls/${string}`);
});

// redirects to urls after login
app.post("/login", (req, res) => {

  const realPassword = getUserByEmail(req.body["email"], users);

  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send(`Please enter valid credentials.`);
  }
  if (!bcrypt.compareSync(req.body.password, users[realPassword]["password"])) {
    return res.status(403).send(`Wrong password`);
  }
  req.session.user_id =  getUserByEmail(req.body.email, users);
  return res.redirect(`/urls`);
});

// redirects to urls after logout and clears cookie
app.post("/logout", (req, res) =>  {
  req.session = null;
  return res.redirect(`/urls`);
});

// redirects to urls page after registering
app.post("/register" , (req, res) => {
  if (req.body.email === '') {
    return res.status(400).send(`Please enter an email address.`);
  }
  if (req.body.password === '') {
    return res.status(400).send(`Please enter a password.`);
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send(`Email already exists`);
  }
  let randUserID = generateRandomString();
  users[randUserID] = {
    id: randUserID, 
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session["user_id"] = randUserID;
  return res.redirect(`/urls`);
});