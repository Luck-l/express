const mysql = require("mysql")
const conn = mysql.createConnection({
  host:"localhost",//数据库的地址
  user:"root",
  password:"1234",
  database:"pdd"
})
conn.connect()
module.exports = conn