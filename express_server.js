const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', function (req, res) {
  res.cookie("username", req.body.username);
  console.log('Cookies: ', req.cookies)
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]], // passing in username
    urls: urlDatabase };

  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]] // passing in username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]], // passing in username
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// a get /register endpoint, which returns the urls_register template
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

// get redirected to urls after pressing delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// redirect to Edit page after pressing edit on urls page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.url;
  res.redirect(`/urls/${shortURL}`);
});

// redirect to url after pressing submit
app.post("/urls/:shortURL/Submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  let string = generateRandomString();
  urlDatabase[string] = req.body.longURL;
  res.redirect(`/urls/${string}`);
});

// redirects to urls after login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

// redirects to urls after logout and clears cookie
app.post("/logout", (req, res) =>  {
  res.clearCookie("username");
  res.redirect(`/urls`);
});

// redirects to urls page after registering
app.post("/register" , (req, res) => {
  if (!req.body.email || !req.body.password || checkEmail(users, req.body.email)) {
    res.status(400);
    res.send(`Email already exists`);
  } else {
    let randUserID = generateRandomString();
    users[randUserID] = {
      id: randUserID, 
      email: req.body.email, 
      password: req.body.password
    };
    res.cookie("user_id", randUserID);
    res.redirect(`/urls`);
  }
});

function generateRandomString() {
  let shortenedURL = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz'
  for (let i = 0; i < 6; i++) {
    shortenedURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortenedURL;
}

// checks if entered email already exits
const checkEmail = function (users, eMail) {
  for (let user in users) {
    if (users[user].email === eMail) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}