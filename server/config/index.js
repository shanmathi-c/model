import mysql from "mysql2";
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "shanmathi",
});
connection.connect((err) => {
  if (err) {
    console.log(err, 3306);
  } else console.log("successfully");
});
export default connection;
