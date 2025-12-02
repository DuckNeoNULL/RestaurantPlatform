import {insertMessage, getConversationBetweenUsers, createConversation} from '../dao/mongoDAO.js';
import { wsManager } from '../utils/WebSocketManager.js';

class chatBoxServices {
    async sendMessage(userId1, userId2, senderId, text) {
        // Persist message
        const res = await insertMessage(userId1, userId2, senderId, text);

        // Build message payload to send via websocket
        const message = {
            _id: res.insertedId,
            conversation_id: res.conversation_id,
            senderId,
            text,
            timestamp: res.timestamp
        };

        // Determine recipient (the other user)
        const recipient = senderId.toString() === userId1.toString() ? userId2 : userId1;

        // Send realtime event if recipient online (best-effort)
        try {
            wsManager.sendToUser(recipient, 'new_message', message);
        } catch (err) {
            // ignore websocket errors; message is persisted
            console.error('WebSocket send error:', err?.message || err);
        }

        return res.insertedId;
    }
    async fetchMessagesBetweenUsers(userId1, userId2) {
        return await getConversationBetweenUsers(userId1, userId2);
    }
    async createChatBox(userId1, userId2) {
        // This function can be expanded if needed
        
    }
}

export default new chatBoxServices();


