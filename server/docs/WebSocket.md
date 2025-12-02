

## 1\. 🌐 Cơ Chế Gửi Tin Nhắn Đúng Người (Broadcast)

Khi một tin nhắn được gửi (hàm `insertMessage` đã hoàn tất), WebSocket Server thực hiện 3 bước sau để gửi tin nhắn đi:

### Bước 1: Xác định Cuộc trò chuyện và Người tham gia

Ngay sau khi tin nhắn được chèn vào collection `messages`, WebSocket Server cần biết **ai đang tham gia** cuộc trò chuyện này. Nó truy vấn collection `conversations` bằng cách sử dụng `conversation_id` vừa được tạo ra.

  * **Truy vấn:** Lấy document `conversation` dựa trên `_id = conversation_id`.
  * **Kết quả:** Nhận được mảng `participants: [User A, User B]`.

### Bước 2: Xác định Người nhận (Recipients)

Server so sánh danh sách `participants` với `senderId`.

  * **Logic:** Người nhận là **tất cả mọi người trong `participants` trừ `senderId`**.
  * Ví dụ: Nếu `participants` là `[UserA, UserB]` và `senderId` là `UserA`, thì người nhận duy nhất là `UserB`.

### Bước 3: Phát sóng Tin nhắn (Broadcasting)

Server cần biết người nhận (ví dụ: `UserB`) có đang kết nối và mở chat không. Server sẽ duy trì một **Bảng Ánh Xạ (Mapping Table)** trong bộ nhớ (ví dụ: Redis hoặc trong chính server process) để lưu trữ: `User ID` $\rightarrow$ `WebSocket Connection ID`.

  * Server tra cứu Bảng Ánh Xạ để tìm **kết nối WebSocket đang hoạt động** của `UserB`.
  * Server gửi dữ liệu tin nhắn qua kết nối đó.

-----

## 2\. 📝 Logic Delivery (Ví dụ Giả Code)

Đây là cách logic này sẽ được triển khai trong WebSocket Server (hàm này chạy sau khi tin nhắn đã được lưu vào MongoDB):

```javascript
/**
 * Logic chạy trên WebSocket Server để gửi tin nhắn Real-time.
 * @param {ObjectId} conversation_id
 * @param {ObjectId} senderId
 * @param {Object} messageData Dữ liệu tin nhắn đã lưu vào DB
 */
async function deliverMessage(conversation_id, senderId, messageData) {
    // Lấy collection conversations
    const conversationsCollection = getCollection("conversations");
    
    // 1. Lấy danh sách người tham gia
    const conversation = await conversationsCollection.findOne(
        { _id: conversation_id },
        { projection: { participants: 1 } } // Chỉ lấy trường participants
    );

    if (!conversation) return; // Nếu conversation không tồn tại, kết thúc

    // 2. Lọc ra danh sách người nhận (tất cả trừ người gửi)
    const recipients = conversation.participants.filter(
        (id) => id.toString() !== senderId.toString()
    );

    // 3. Gửi tin nhắn qua WebSocket
    recipients.forEach(recipientId => {
        // Hàm giả định để gửi dữ liệu qua WebSocket
        // (Đây là phần cần quản lý kết nối của server bạn)
        sendDataToWebSocket(recipientId, 'new_message', messageData);
    });
}

// Khi hàm insertMessage thành công:
// const insertedId = await insertMessage(userId1, userId2, senderId, text);
// deliverMessage(conversation_id, senderId, { _id: insertedId, senderId, text, timestamp: now });
```

Như vậy, `senderId` và `participants` phối hợp với nhau để đảm bảo rằng tin nhắn **chỉ đến được những người nhận không phải là người gửi**.