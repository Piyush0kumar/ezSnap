
const mysql = require("mysql2");

const database = mysql.createConnection({
    host: "localhost",
    user: "root",  // Change this if necessary
    password: "",  // Change this if necessary
    database: "your_database"
});

database.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

module.exports = database; // Ensure you export 'db', not 'database'
