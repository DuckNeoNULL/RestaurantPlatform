import PayOS from "payos-sdk-nodejs";

dotenv.config();

export default new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY);