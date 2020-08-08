const mysql = require("mysql")
const conn = mysql.createConnection({
  host:"120.78.179.179",//数据库的地址
  user:"pdd-api",
  password:"123456",
  database:"pdd-api"
})
conn.connect()
module.exports = conn
