import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getCollection } from "../dao/mongoDAO.js";
import { userRole } from "../models/enums/UserStatus.js";
//Nếu sài dotenv.config(); thì nó sẽ không truy cập vào được .env dẫn đếN không truy cập được jwt secret
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });


const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT_Secret", JWT_SECRET);

export async function authenticateJWT(req, res, next) {
  // Ưu tiên header Authorization; fallback cookie 'token'
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  
  console.log("authenticateJWT - Token from header:", !!authHeader);
  console.log("authenticateJWT - Token from cookie:", !!req.cookies?.token);
  console.log("authenticateJWT - Token value:", token ? token.substring(0, 20) + "..." : "null");
  
  if (!token) {
    console.log("authenticateJWT - No token provided");
    return res.status(401).json({ error: 'No token provided' });
  }

  // Kiểm tra token trong blacklist
  const blacklist = getCollection('blacklist');
  const blacklisted = await blacklist.findOne({ token });
  if (blacklisted) {
    console.log("authenticateJWT - Token is blacklisted");
    return res.status(401).json({ error: 'Token is blacklisted' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { ...decoded, userId: decoded.userId ?? decoded.sub };
    console.log("authenticateJWT - Decoded user:", { userId: req.user.userId, email: req.user.email, role: req.user.role });
    next();
  } catch (err) {
    console.log("authenticateJWT - Token verification failed:", err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}


export async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token && req.cookies?.token) token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...payload, userId: payload.userId ?? payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid/expired token' });
  }
}

  export async function ensurePartner(req, res, next) {
    const role = req.user?.role;
    if (role !== userRole.owner) {
      return res.status(403).json({ error: "Partner only" });
    }
    return next();
  }
  export async function ensureAdmin(req, res, next) {
    const role = req.user?.role;
    if (role !== userRole.admin) {
      return res.status(403).json({ error: "Admin only" });
    }
    return next();
  }
  export async function ensureCustomer(req, res, next){
    const role = req.user?.role;
    console.log("ensureCustomer - User role:", role, "Expected:", userRole.customer);
    if (role !== userRole.customer) {
      console.log("ensureCustomer - Access denied for role:", role);
      return res.status(403).json({ error: "Customer only" });
    }
    console.log("ensureCustomer - Access granted");
    return next();
  }
