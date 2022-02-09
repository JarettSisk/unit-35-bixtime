/** Database setup for BizTime. */
const { Client } = require("pg");



let DB_URI;

// Change the URI if we are testing or not
if (process.env.NODE_ENV === "test") {
    DB_URI = "postgresql:///biztime_test";
}
else {
    DB_URI = "postgresql:///biztime";
}

// giving the uri to the client to connect to
let db = new Client({ 
    connectionString: DB_URI
});

// Start the database connection
db.connect();

// Export the db to run queries etc in our app
module.exports = db;

