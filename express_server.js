const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const checkEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};

// returns the URLs where the userID is equal to the id of the currently logged in user.
const urlsForUser = function(id) {
  let urls = {};
  for (let url in urlDatabase)
  if (id === urlDatabase[url].userID) {
    urls[url] = urlDatabase[url];
  }
  return urls;
}

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
  // if (!req.cookies["user_id"]) {
  //   res.redirect("/login");
  // } else {
    let templateVars = { 
      user: users[req.cookies["user_id"]], // passing in user-id
      urls: urlsForUser(req.cookies["user_id"]) };
      console.log(urlDatabase);
    res.render("urls_index", templateVars);
  // }
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// get redirected to login page if not logged-in
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]] // passing in user-id
  };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]], // passing in user-id
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = "http://"+urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// a get /register endpoint, which returns the urls_register template
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

// get redirected to urls after pressing delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    res.send(`Unable to delete urls`);
  } else {
    delete urlDatabase[req.params.shortURL].userID;
    res.redirect(`/urls`);
  }
});

// redirect to Edit page after pressing edit on urls page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.cookies["user_id"] !== urlDatabase[shortURL].userID) {
    res.send(`Unable to perform action`);
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

// redirect to url after pressing submit
app.post("/urls/:shortURL/Submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`);
});

// redirects to urls/random string
app.post("/urls", (req, res) => {
  let string = generateRandomString();
  const user_Id = req.cookies["user_id"];
  urlDatabase[string] = {longURL: req.body.longURL, id: user_Id};
  res.redirect(`/urls/${string}`);
});

// redirects to urls after login
app.post("/login", (req, res) => {

  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (!checkEmail(req.body.email)) {
    res.status(403).send(`Please enter valid credentials.`);
  } else if (!bcrypt.compareSync(checkEmail(req.body.email).password, hashedPassword)) {
    res.status(403).send(`Wrong password`);
  } else {
    const userId = checkEmail(req.body.email)["id"];
    res.cookie("user_id", userId);
    res.redirect(`/urls`);
  }
});

// redirects to urls after logout and clears cookie
app.post("/logout", (req, res) =>  {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

// redirects to urls page after registering
app.post("/register" , (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === '') {
    res.status(400).send(`Please enter an email address.`);
  } else if (req.body.password === '') {
    res.status(400).send(`Please enter a password.`);
  } else if (checkEmail(req.body.email)) {
    res.status(400).send(`Email already exists`);
  } else {
    let randUserID = generateRandomString();
    users[randUserID] = {
      id: randUserID, 
      email: req.body.email,
      password: hashedPassword
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