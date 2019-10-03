# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Visit http://localhost:8080/login in google Chrome and register as a new user
- Upon registration, go to 'Create New URL' at the top left region of the header
- Type a new url starting with 'http://' and submit
- The next page will have a 'Short URL' generated for you to use and upon clicking, should redirect you to your desired website
- User may also edit or delete their URLs under 'My URLs' page