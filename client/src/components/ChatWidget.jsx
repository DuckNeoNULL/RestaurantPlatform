import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = {
        role: "ai",
        text: `🌸 Xin chào bạn, mình là AI Assistant — trợ lý ảo của hệ thống Wedding Restaurant Management 💍

Mình có thể giúp bạn:
- 🔍 Gợi ý nhà hàng tiệc cưới phù hợp theo khu vực hoặc phong cách  
- 💡 Tư vấn sảnh, menu, khuyến mãi nổi bật  
- 💬 Trả lời các thắc mắc nhanh về đặt tiệc  

Ví dụ, bạn có thể thử nói:
👉 "Tôi cần nhà hàng tổ chức tiệc cưới sang trọng ở Hải Châu"
👉 "Gợi ý nhà hàng có khuyến mãi tại Đà Nẵng"`,
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const lowerInput = input.trim().toLowerCase();
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 🧠 1️⃣ Trường hợp input "vô nghĩa" hoặc quá ngắn
      if (
        lowerInput.length < 2 || // chỉ 1 ký tự
        /^[^a-zA-Z0-9\u00C0-\u1EF9]+$/.test(lowerInput) // toàn ký tự đặc biệt
      ) {
        const aiMessage = {
          role: "ai",
          text: "Mình chưa hiểu ý bạn lắm 😅 Bạn có thể nói rõ hơn được không?\nVí dụ:\n👉 'Tôi cần nhà hàng tổ chức tiệc cưới sang trọng ở Hải Châu'\n👉 'Gợi ý nhà hàng có view đẹp ở Sơn Trà'",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setLoading(false);
        return;
      }

      // 🧠 2️⃣ Phân loại input: casual / restaurant / general
      const casualWords = [
        "hello",
        "hi",
        "chào",
        "cảm ơn",
        "thanks",
        "bye",
        "tạm biệt",
        "ok",
        "okay",
        "uhm",
        "ờ",
        "haha",
        "hihi",
        "who",
        "bạn là ai",
      ];
      const restaurantWords = [
        "nhà hàng",
        "quán",
        "tiệc",
        "cưới",
        "wedding",
        "restaurant",
        "sảnh",
        "view",
      ];

      const isCasual = casualWords.some((w) => lowerInput.includes(w));
      const isRestaurant = restaurantWords.some((w) => lowerInput.includes(w));

      const endpoint =
        isCasual || isRestaurant
          ? "http://localhost:5000/api/ai/suggest"
          : "http://localhost:5000/api/chat";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const aiMessage = { role: "ai", text: data.reply, data: data.data || [] };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Xin lỗi, hiện tại tôi đang bận 🥺 bạn thử lại chút nhé!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = (id) => {
    setIsOpen(false);
    navigate(`/restaurant/${id}`);
  };

  return (
    <div style={styles.container}>
      {!isOpen && (
        <button style={styles.toggleButton} onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <span style={{ fontWeight: "600" }}>AI Assistant</span>
            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.messageWrapper,
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor:
                      msg.role === "user" ? "#D81C45" : "#f6f6f6",
                    color: msg.role === "user" ? "white" : "black",
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                  {/* Nếu AI trả về danh sách nhà hàng */}
                  {msg.role === "ai" && msg.data?.length > 0 && (
                    <div style={styles.cardContainer}>
                      {msg.data.map((r, index) => (
                        <div
                          key={index}
                          style={styles.restaurantCard}
                          onClick={() => handleRestaurantClick(r.restaurantID)}
                        >
                          <img
                            src={r.thumbnailURL}
                            alt={r.name}
                            style={styles.thumbnail}
                          />
                          <div>
                            <div style={styles.cardTitle}>{r.name}</div>
                            <div style={styles.cardSub}>
                              ⭐ {r.avgRating ?? "N/A"} | {r.totalReviews ?? 0}{" "}
                              đánh giá
                            </div>
                            <div style={styles.cardDesc}>{r.description}</div>
                            <div style={styles.cardAddr}>{r.fullAddress}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  ...styles.messageWrapper,
                  justifyContent: "flex-start",
                }}
              >
                <div style={styles.loadingBubble}>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div style={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} style={styles.sendButton}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 9999,
  },
  toggleButton: {
    backgroundColor: "#D81C45",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    fontSize: "26px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(216, 28, 69, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  chatBox: {
    width: "360px",
    height: "500px",
    backgroundColor: "#fff",
    borderRadius: "18px",
    boxShadow: "0 8px 25px rgba(216, 28, 69, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#D81C45",
    color: "white",
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "bold",
    letterSpacing: "0.3px",
  },
  closeButton: {
    background: "none",
    color: "white",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
  },
  messageWrapper: { display: "flex", width: "100%" },
  messageBubble: {
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "15px",
    lineHeight: "1.4",
    maxWidth: "80%",
    wordWrap: "break-word",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  cardContainer: {
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  restaurantCard: {
    display: "flex",
    gap: "10px",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  cardTitle: { fontWeight: "bold", fontSize: "14px", color: "#D81C45" },
  cardSub: { fontSize: "12px", color: "#777" },
  cardDesc: { fontSize: "13px", color: "#333" },
  cardAddr: { fontSize: "12px", color: "#777" },
  inputArea: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  sendButton: {
    marginLeft: "8px",
    backgroundColor: "#D81C45",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0 14px",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 3px 6px rgba(216, 28, 69, 0.3)",
  },
  loadingBubble: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#f1f0f0",
    borderRadius: "15px",
    padding: "8px 12px",
    alignItems: "center",
  },
  dot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#999",
    borderRadius: "50%",
    animation: "blink 1.4s infinite both",
  },
};
