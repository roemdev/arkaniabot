const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Path to the database file
const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

// Read schema from file and initialize tables
const schemaPath = path.resolve(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error("Error initializing database schema:", err);
    } else {
      console.log("Database schema initialized successfully.");
    }
  });
});

module.exports = db;