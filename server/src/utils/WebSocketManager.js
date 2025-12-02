// webSocketManager.js (Đây là một lớp MỚI bạn cần xây dựng)

class WebSocketManager {
    // map userId (string) -> Set of websocket connections (support multi-device per user)
    userSocketMap = new Map();

    // Đăng ký socket khi người dùng kết nối
    register(userId, socket) {
        if (!userId || !socket) return;
        const uid = userId.toString();
        let set = this.userSocketMap.get(uid);
        if (!set) {
            set = new Set();
            this.userSocketMap.set(uid, set);
        }
        set.add(socket);
    }

    // Hủy đăng ký theo userId (xóa tất cả sockets của user)
    unregister(userId) {
        if (!userId) return;
        this.userSocketMap.delete(userId.toString());
    }

    // Hủy đăng ký theo socket (khi connection close) — tìm và xóa socket khỏi set
    unregisterSocket(socket) {
        if (!socket) return;
        for (const [uid, set] of this.userSocketMap.entries()) {
            if (set.has(socket)) {
                set.delete(socket);
                if (set.size === 0) this.userSocketMap.delete(uid);
                break;
            }
        }
    }

    // Lấy tất cả sockets theo userId
    getSockets(userId) {
        if (!userId) return new Set();
        return this.userSocketMap.get(userId.toString()) || new Set();
    }

    // Gửi event/data tới user cụ thể (nếu online). Trả về số sockets đã gửi thành công.
    sendToUser(userId, event, data) {
        const sockets = this.getSockets(userId);
        if (!sockets || sockets.size === 0) return 0;
        let sent = 0;
        for (const socket of sockets) {
            try {
                if (socket && socket.readyState === 1 && typeof socket.send === 'function') {
                    socket.send(JSON.stringify({ event, data }));
                    sent++;
                }
            } catch (err) {
                // ignore per-socket failure
            }
        }
        return sent;
    }

    // Gửi tới tất cả kết nối của mọi user
    broadcast(event, data) {
        for (const set of this.userSocketMap.values()) {
            for (const socket of set) {
                try {
                    if (socket && socket.readyState === 1 && typeof socket.send === 'function') {
                        socket.send(JSON.stringify({ event, data }));
                    }
                } catch (err) {
                    // ignore per-socket failures
                }
            }
        }
    }
}

import { WebSocketServer } from 'ws';

export const wsManager = new WebSocketManager();

/**
 * Initialize a WebSocket server bound to an existing HTTP server.
 * Clients should connect using: ws://host:port/ws?userId=<USER_ID>
 */
export function initWebSocket(httpServer, options = {}) {
    if (!httpServer) throw new Error('HTTP server is required to attach WebSocket server');

    const wss = new WebSocketServer({ server: httpServer, path: options.path || '/ws' });

    wss.on('connection', (ws, req) => {
        try {
            // extract userId from query string
            const url = req.url || '';
            const parsed = new URL(url, `http://${req.headers.host || 'localhost'}`);
            const userId = parsed.searchParams.get('userId');

            if (userId) {
                wsManager.register(userId, ws);
            }

            ws.on('message', (raw) => {
                // For now we accept JSON messages from client; apps can implement their own protocol
                let msg = raw;
                try { msg = JSON.parse(raw.toString()); } catch (e) { /* ignore non-json */ }
                // Possible message shape: { event: 'register', userId } to register explicitly
                if (msg && msg.event === 'register' && msg.userId) {
                    wsManager.register(msg.userId, ws);
                }
            });

            ws.on('close', () => {
                // Remove this socket from any user set it belongs to
                wsManager.unregisterSocket(ws);
            });
        } catch (err) {
            // ignore connection handling errors
            console.error('WebSocket connection error:', err?.message || err);
        }
    });

    return wss;
}