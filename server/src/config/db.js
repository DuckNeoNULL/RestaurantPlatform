
// import mongodb from "mongoose";
import dotenv from "dotenv";
import { Sequelize } from 'sequelize';
import initModels from '../models/init-models.cjs';
import { ServerApiVersion, MongoClient } from "mongodb";
dotenv.config();


// 1. Cấu hình kết nối
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

// 2. Tải tất cả các model từ thư mục /models
const models = initModels(sequelize);

// 3. Xuất kết nối và các model để sử dụng ở nơi khác
const db = {
  sequelize,
  ...models // Xuất ra tất cả các model: users, products,...
};

export default db;

// // connect to MongoDB

// Accept common env names to reduce configuration friction
const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = uri
  ? new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })
  : null;

async function run() {
  if (!uri) {
    console.warn(
      "[Mongo] Missing MONGO_URI/MONGODB_URI. Mongo features (OTP/blacklist) are disabled until you set the connection string."
    );
    return;
  }
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("[Mongo] Connection error:", err?.message || err);
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(() => {});

