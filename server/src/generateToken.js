import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const token = jwt.sign(
  {
    userID: 1,
    role: 0,
    email: "test@demo.com",
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

console.log("✅ JWT Token:");
console.log(token);
