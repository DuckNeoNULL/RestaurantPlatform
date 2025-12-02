import db from "./db.js";

db.query("SELECT 1", (err, rows) => {
    if (err) console.log("❌ ERROR:", err);
    else console.log("Query OK:", rows);
});
