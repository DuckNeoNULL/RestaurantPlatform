import ChatBoxServices from "../services/ChatBoxServices.js";
class ChatBoxController {
    static async getChatBox(req, res) {
        try {
            const { userId1, userId2 } = req.query;
            if (!userId1 || !userId2) {
                return res.status(400).json({ error: 'Both user IDs are required' });
            }
            const conversation = await ChatBoxServices.fetchMessagesBetweenUsers(userId1, userId2);
            res.json({ conversation });
        } catch (error) {
            console.error('Get chat box error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async sendMessage(req, res) {
        try {
            const { userId1, userId2, senderId, text } = req.body;
            if (!userId1 || !userId2 || !senderId || !text) {
                return res.status(400).json({ error: 'All fields are required' });
            }
            const messageId = await ChatBoxServices.sendMessage(userId1, userId2, senderId, text);
            res.json({ message: 'Message sent successfully', messageId });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default ChatBoxController;