const express = require('express');
const svgCaptcha = require("svg-captcha")
const md5 = require("blueimp-md5")
const path = require('path');
const bodyParser = require("body-parser")
const router = express.Router();


const conn = require("../db/db")



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//获取验证码
router.get("/api/loginverify",(req,res) =>{
  let captcha = svgCaptcha.create({
    color:true,
    noise:2,
    ignoreChars:"0o1i",
    size:4
  })
  // console.log(cap.text)
  req.session.captcha = captcha.text.toLocaleLowerCase()
  // res.set("Content-Type","image/svg+xml")
  res.type("svg")
  res.send(captcha.data)

})
//短信登陆
router.post("/api/login_code",(req,res) =>{

  const phone = req.body.phone;
  let sqlStr = "SELECT * FROM login_user WHERE user_phone = '"+phone+"' LIMIT 1";
  conn.query(sqlStr,(error,results,fields) =>{
    if(error){
      res.json({err_code:0,message:"请求数据失败"})
    }else {
      results = JSON.parse(JSON.stringify(results))
      if(results[0]){
        req.session.userId = results[0].id
        res.json({success_code:200,message:{id:results[0].id,name:results[0].user_name,phone:results[0].user_phone}})
      }else{ //新用户
        const addSql = "INSERT INTO login_user(user_name,user_phone) VALUES(?,?)"
        const addSqlParams = [phone,phone]
        conn.query(addSql,addSqlParams,(error,results,fields) =>{
          results = JSON.parse(JSON.stringify(results))
          if(!error){
            req.session.userId = results.insertId
            let sqlStr = "SELECT * FROM login_user WHERE id = '" + results.insertId +"' LIMIT 1";
            conn.query(sqlStr,(error,results,fields) =>{
              if(error){
                res.json({err_code:0,message:"请求数据失败"})
              }else {
                results = JSON.parse(JSON.stringify(results))
                res.json({
                  success_code:200,
                  message:{id:results[0].id,name:results[0].user_name,phone:results[0].user_phone}
                })
              }
            })
          }
        })
      }
    }
  })
})
//密码登陆
router.post("/api/login_pwd",(req,res) =>{
  const name = req.body.name;
  const pwd = md5(req.body.pwd);
  const captcha = req.body.captcha.toLowerCase();

  console.log(captcha,req.session.captcha,pwd,name)
  if(captcha !== req.session.captcha){
    res.json({err_code:0,message:"验证码不正确！"})
    return
  }
  delete req.session.captcha
  const sqlStr = "SELECT * FROM login_user WHERE user_name = '"+name+"' LIMIT 1" ;

  conn.query(sqlStr,(error,results,fields) =>{
    if(error){
      res.json({err_code:0,message:"用户名或密码错误！"})
    }else {
      results = JSON.parse(JSON.stringify(results))
      if(results[0]){
        //验证密码是否正确
        if(results[0].user_pwd !== pwd){
          res.json({err_code:0,message:"密码错误！"})
        }else {
          req.session.userId = results[0].id
          res.json({success_code:200,message:{id:results[0].id,name:results[0].user_name,phone:results[0].user_phone},info:"登陆成功！"})
        }
      }
    else{ //新用户
        const addSql = "INSERT INTO login_user(user_name, user_pwd) VALUES(?,?)"
        const addSqlParams = [name, pwd];
        conn.query(addSql,addSqlParams,(error,results,fields) =>{
          results = JSON.parse(JSON.stringify(results))

          if(!error){
            req.session.userId = results.insertId
            let sqlStr = "SELECT * FROM login_user WHERE id = '" + results.insertId +"'";
            conn.query(sqlStr,(error,results,fields) =>{
              if(error){
                res.json({err_code:0,message:"请求数据失败"})
              }else {
                results = JSON.parse(JSON.stringify(results))
                res.json({
                  success_code:200,
                  message:{id:results[0].id,name:results[0].user_name,phone:results[0].user_phone}
                })
              }
            })
          }
        })
      }
    }
  })
})
//根据session中的用户id获取用户信息
router.get("/api/user_info",(req,res) =>{
  let userId = req.session.userId;
  let sqlStr = "SELECT * FROM login_user WHERE id = '"+ userId +"'LIMIT 1";
  conn.query(sqlStr,(error,results,fields) =>{
    if(error){
      res.json({err_code:0,message:"请求数据失败"})
    }else {
      results = JSON.parse(JSON.stringify(results))
      if(!results[0]){
        delete req.session.userId;
        res.json({
          error_code:1,message:"请先登陆！"
        })
      }else {
        res.json({
            success_code:200,
            message:{id:results[0].id,name:results[0].user_name,phone:results[0].user_phone}
        })
      }
    }
  })
})
//退出登陆
router.get("/api/logout",(req,res) =>{
  delete req.session.userId
  res.json({
    success_code:200,
    message:"退出登陆成功！"
  })
})

// 获取轮播图
router.get("/api/homeswiper",(req,res) =>{
  //获取本地JSON
  // const data = require("../data/homecasual")
  // res.json({success_code:200,message:data})

  //获取数据库
  let sqlStr = "SELECT * FROM homeswiper";
  conn.query(sqlStr,(error,results,fields) =>{
    //测试
    // if(error) throw error
    if(error){
      res.json({err_code:0,message:"请求数据失败"})
    }else {
      res.json({success_code:200,message:results})
    }
  })

})
// 获取首页导航
router.get("/api/homenav",(req,res) =>{
  // const data = require("../data/homenav")
  // res.json({success_code:200,message:data})
  let sqlStr = "SELECT * FROM homenav";
  conn.query(sqlStr,(error,results,fields) =>{
    if(error){
      res.json({err_code:0,message:"请求数据失败"})
    }else {
      res.json({success_code:200,message:results})
    }
  })
})
// 获取首页商品列表
router.get("/api/homeshops",(req,res) =>{
  // setTimeout(function () {
    // const data = require("../data/shopList")
    // res.json({success_code:200,message:data})
  let pageNo = req.query.page || 1
  let pageSize = req.query.count || 10

    let sqlStr = "SELECT * FROM homeshops LIMIT " + (pageNo-1) * pageSize + "," + pageSize;
    conn.query(sqlStr,(error,results,fields) =>{
      if(error){
        res.json({err_code:0,message:"请求数据失败"})
      }else {
        res.json({success_code:200,message:results})
      }
    })
  // },300)
})
// 获取推荐商品列表
router.get("/api/recommendshops",(req,res) =>{
  // setTimeout(function () {
    // const data = require("../data/recommend")
    // res.json({success_code:200,message:data})
    let sqlStr = "SELECT * FROM homeshops";
    conn.query(sqlStr,(error,results,fields) =>{
      if(error){
        res.json({err_code:0,message:"请求数据失败"})
      }else {
        res.json({success_code:200,message:results})
      }
    })
  // },10)
})
// 获取搜索模块左边导航条
router.get("/api/searchnav",(req,res) =>{
    // const data = require("../data/recommend_users")
    // res.json({success_code:200,message:data})
    let sqlStr = "SELECT * FROM searchnav";
    conn.query(sqlStr,(error,results,fields) =>{
      if(error){
        res.json({err_code:0,message:"请求数据失败"})
      }else {
        res.json({success_code:200,message:results})
      }
    })
})
// 获取搜索模块右边商品列表
router.get("/api/searchshops",(req,res) =>{
    // const data = require("../data/search")
    // res.json({success_code:200,message:data})
    let sqlStr = "SELECT * FROM searchshops";
    conn.query(sqlStr,(error,results,fields) =>{
      if(error){
        res.json({err_code:0,message:"请求数据失败"})
      }else {
        res.json({success_code:200,message:results})
      }
    })
})

module.exports = router;
