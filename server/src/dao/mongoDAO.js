// Hàm test: insert OTP và kiểm tra TTL index
import { client } from "../config/db.js";
import { Decimal128 } from 'mongodb';

// Tạo TTL index cho collection otps, tự động xóa OTP sau 15 phút
export async function ensureOtpTTLIndex() {
    const otps = getCollection("otps");
    console.log("thuc hien function");
    // expireAfterSeconds: 60 giây
    // await otps.dropIndex("expiresAt_1");
    await otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 120 });
}


export function getCollection(collectionName, dbName = "userRestaurantsDB") {
    if (!client) {
        throw new Error("MongoDB client is not initialized. Missing MONGO_URI/MONGODB_URI in environment.");
    }
    return client.db(dbName).collection(collectionName);
}

export function deleteOtpByEmail(email) {
    const otps = getCollection("otps");
    return otps.deleteOne({ email });
}
// take otp from collection otps
export async function getOtpByEmail(email) {
    const otps = getCollection("otps");
    return await otps.findOne({ email });
}

// Kiểm tra OTP, xóa nếu hết hạn hoặc sau khi xác thực

export async function insertOtp(email, otp) {
    const otps = getCollection("otps");
    const expiresAt = new Date(Date.now() + 120 * 1000); // 2 phút
    await otps.insertOne({ email, otp, expiresAt });
}
console.log("thuc hien file mongoDAO.js");
// await client.connect();
// await ensureOtpTTLIndex(); //using when start server first time


export async function createConversation(userId1, userId2){
    // if found conversations with both userId1 and userId2 has existed, return that conversation id
    const conversation = getCollection("conversations");
    const participants = [userId1, userId2].sort();
    const existingConversation = await conversation.findOne({
        participants: {
            $all: participants,
            $size: 2
        }
    });
    if (existingConversation) {
        return existingConversation._id;
    }
    // create new conversation
    const now = new Date();
    const result = await conversation.insertOne({
        participants,
        createdAt: now,
        updatedAt: now    
    });
    return result.insertedId;
}


export async function getConversationBetweenUsers(userId1, userId2){
    const conversation_id = await createConversation(userId1, userId2);
    const messages = getCollection("messages");
    const cursor = messages.find({
        conversation_id
    })
    .sort({ timestamp: -1 }) // Tận dụng Compound Index
    .limit(50); 
    
    // Trả về mảng JSON data (các tin nhắn mới nhất)
    return await cursor.toArray();
}
export async function insertMessage(userId1, userId2, senderId, text) {
    
    // BƯỚC 1: TÌM HOẶC TẠO CONVERSATION ID (GIỐNG getConversationBetweenUsers)
    // Đảm bảo cuộc trò chuyện tồn tại và lấy ID của nó một cách an toàn
    const conversation_id = await createConversation(userId1, userId2);

    const messages = getCollection("messages");
    // THÊM: Định nghĩa collection conversations để sử dụng trong updateOne
    const conversations = getCollection("conversations");
    
    const now = new Date();
    
    // 2. INSERT TIN NHẮN MỚI
    const result = await messages.insertOne({
        // Sử dụng conversation_id đã được đảm bảo
        conversation_id, 
        senderId,
        text,
        timestamp: now
    });
    
    // 3. CẬP NHẬT METADATA (QUAN TRỌNG)
    await conversations.updateOne(
        { _id: conversation_id }, // Dùng _id (là conversation_id)
        { $set: { updatedAt: now, last_message_text: text } } 
    );
    
    // Trả về thông tin message mới (id + conversation id + timestamp) để caller có thể gửi realtime
    return {
        insertedId: result.insertedId,
        conversation_id,
        timestamp: now
    };
}


// Thêm function insertNegotiationCommission
export async function insertNegotiationCommission(userID, description, commissionRate, negotiatedAt) {
    const collection = getCollection("negotiationCommission");
    const doc = {
        userID,
        description,
        commissionRate: new Decimal128(commissionRate),
        negotiatedAt: negotiatedAt || new Date()
    };
    return await collection.insertOne(doc);
}

// Thêm function getNegotiationCommissionsByUserID
export async function getNegotiationCommissionsByUserID(userID) {
    const collection = getCollection("negotiationCommission");
    const cursor = collection.find({ userID }).sort({ negotiatedAt: -1 });
    return await cursor.toArray();
}


// GIẢ ĐỊNH CÁC OBJECT ID MẪU (Thay bằng ID thật của bạn)
// async function runChatTest() {
//     console.log("--- 1. BẮT ĐẦU TEST TẠO CONVERSATION ---");
    
//     // Lần 1: Tạo Conversation (hoặc tìm nếu đã có)
//     const convId1 = await createConversation(AliceID, BobID);
//     console.log(`[PASS] Conversation ID Lần 1: ${convId1}`);

//     // Lần 2: Chỉ tìm kiếm (Kiểm tra Index UNIQUE)
//     const convId2 = await createConversation(BobID, AliceID);
//     console.log(`[PASS] Conversation ID Lần 2: ${convId2}`);
    
//     // Kiểm tra tính duy nhất
//     if (convId1.toString() === convId2.toString()) {
//         console.log(`[PASS] Đã xác nhận ID duy nhất: ${convId1}`);
//     } else {
//         console.error("[FAIL] IDs không khớp!");
//         return;
//     }

//     // --- 2. BẮT ĐẦU TEST INSERT MESSAGE ---
//     console.log("\n--- 2. BẮT ĐẦU TEST INSERT MESSAGE ---");
    
//     // Tin nhắn 1 (Alice gửi)
//     await insertMessage(AliceID, BobID, AliceID, "Hi Bob!");
//     console.log("[PASS] Tin nhắn 1 (Alice) đã được chèn và Conversation đã cập nhật.");
    
//     // Đợi 1 chút để đảm bảo timestamp khác nhau
//     await new Promise(resolve => setTimeout(resolve, 100)); 

//     // Tin nhắn 2 (Bob gửi)
//     await insertMessage(AliceID, BobID, BobID, "Hello Alice.");
//     console.log("[PASS] Tin nhắn 2 (Bob) đã được chèn và Conversation đã cập nhật.");

//     // --- 3. BẮT ĐẦU TEST TẢI DỮ LIỆU ---
//     console.log("\n--- 3. BẮT ĐẦU TEST TẢI DỮ LIỆU ---");
    
//     const messages = await getConversationBetweenUsers(AliceID, BobID);
    
//     console.log(`[PASS] Số tin nhắn tìm thấy: ${messages.length}`);
    
//     if (messages.length === 2 && messages[0].text === "Hello Alice." && messages[1].text === "Hi Bob!") {
//         console.log("[PASS] Thao tác Sort và Limit đã thành công (Tin nhắn mới nhất ở vị trí 0).");
//     } else {
//         console.error("[FAIL] Thao tác Sort thất bại hoặc số lượng tin nhắn không đúng.");
//         // Hiển thị kết quả thực tế để debug
//         console.log("Kết quả tải về:", messages.map(m => m.text)); 
//     }
// }
