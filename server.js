
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session")


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const server = express();
const bodyParser = require("body-parser")
// server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(cookieParser())
server.use(session(({
  secret:'12345',
  cookie:{
    maxAge:1000*60*60*24
  },
  resave:false,
  rolling:true,
  saveUninitialized:true,

  //设置有效时间，单位毫秒
  // cookie:{secure:true}
})))

//跨域问题
server.all("*",function (req, res, next) {
    if(!req.get("Origin")) return next()
  res.set("Access-Control-Allow-Origin","*")
  res.set("Access-Control-Allow-Methods","GET")
  // res.set(,"POST")
  res.set("Access-Control-Allow-Headers","X-Requested-With,Content-Type","application/x-www-form-urlencoded")
  if("OPTIONS" === req.method) return res.sendStatus(200)
  next()
})
server.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,params");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});




// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs');

server.use(logger('dev'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, 'public')));

server.use('/', indexRouter);
server.use('/users', usersRouter);

// catch 404 and forward to error handler
server.use(function(req, res, next) {
  next(createError(404));
});

// error handler
server.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = server;
