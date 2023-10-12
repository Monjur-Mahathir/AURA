
require('dotenv').config()

var appController = require('./controllers/controller.js');
var mongoose = require('./db/mongoose.js');
var http = require('http');
//var https = require('https');
var express = require('express');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const session = require('cookie-session');


var app = express();

require('./config/passport')(passport);

app.use(expressLayouts);
app.set('view engine','ejs');

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

appController(app);


app.listen(process.env.PORT || 80);
