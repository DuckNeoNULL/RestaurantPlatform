import express from "express";
import dotenv from "dotenv";
import db from "../config/db.js";
dotenv.config();

const router = express.Router();
const { sequelize } = db;

// 🧠 Danh sách từ khóa "không phải tìm nhà hàng"
const casualKeywords = {
  greetings: ["hello", "hi", "chào", "yo", "hey", "alo"],
  thanks: ["thank", "thanks", "cảm ơn", "thank you"],
  bye: ["bye", "tạm biệt", "bái bai", "goodbye", "see you"],
  who: ["bạn là ai", "who are you", "ai vậy"],
  joke: ["haha", "hihi", "kkk", "vui", "đùa"],
  ok: ["ok", "okay", "ừ", "ờ", "uh", "yeah", "okie"],
};

// 🧩 Xác định ý định người dùng (intent)
function detectIntent(message) {
  const msg = message.toLowerCase();
  if (casualKeywords.greetings.some((k) => msg.includes(k))) return "greeting";
  if (casualKeywords.thanks.some((k) => msg.includes(k))) return "thanks";
  if (casualKeywords.bye.some((k) => msg.includes(k))) return "bye";
  if (casualKeywords.who.some((k) => msg.includes(k))) return "who";
  if (casualKeywords.joke.some((k) => msg.includes(k))) return "joke";
  if (casualKeywords.ok.some((k) => msg.includes(k))) return "ok";
  return "restaurant_query";
}

// 🧠 Gọi Gemini để phân tích câu hỏi nhà hàng
async function analyzeUserRequest(message) {
  let result = {};

  try {
    const prompt = `
Bạn là công cụ phân tích câu hỏi người dùng về việc tìm nhà hàng tổ chức tiệc tại Đà Nẵng.
Chỉ trả về JSON hợp lệ duy nhất:
{
  "eventType": "Tên loại tiệc (vd: Tiệc cưới, Tiệc sinh nhật, ...)",
  "keywords": ["sang trọng", "lãng mạn", "view đẹp", "gia đình", ...],
  "district": "Tên quận ở Đà Nẵng (vd: Hải Châu, Sơn Trà, Cẩm Lệ, Thanh Khê, Liên Chiểu, Ngũ Hành Sơn)"
}

Người dùng: "${message}"
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    const match = raw.match(/{[\s\S]*}/);
    if (match) {
      try {
        result = JSON.parse(match[0]);
      } catch {}
    }
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini:", err);
  }

  // Nếu Gemini không hiểu, fallback tiếng Việt
  if (!result || Object.keys(result).length === 0) {
    const msg = message.toLowerCase();
    const districts = [
      "hải châu",
      "sơn trà",
      "thanh khê",
      "liên chiểu",
      "cẩm lệ",
      "ngũ hành sơn",
    ];
    const events = [
      "cưới",
      "sinh nhật",
      "công ty",
      "tất niên",
      "liên hoan",
      "kỷ niệm",
    ];
    const keywords = [
      "sang trọng",
      "lãng mạn",
      "view đẹp",
      "gia đình",
      "ấm cúng",
      "cao cấp",
    ];

    const district = districts.find((d) => msg.includes(d)) || "";
    const event = events.find((e) => msg.includes(e)) || "";
    const matchedKeywords = keywords.filter((k) => msg.includes(k));

    result = {
      eventType: event ? `Tiệc ${event}` : "",
      keywords: matchedKeywords,
      district: district
        ? district
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "",
    };
  }

  return result;
}

// ⚙️ Route chính: /api/ai/suggest
router.post("/suggest", async (req, res) => {
  const { message } = req.body;

  // 🧩 1️⃣ Nhận diện intent (ý định người dùng)
  const intent = detectIntent(message);
  if (intent !== "restaurant_query") {
    const responses = {
      greeting: [
        "Xin chào! 👋 Tôi có thể giúp bạn tìm nhà hàng tiệc cưới ở Đà Nẵng nhé!",
        "Chào bạn! ❤️ Bạn đang muốn tìm nhà hàng ở khu vực nào ạ?",
      ],
      thanks: [
        "Không có gì đâu ạ! 💐 Rất vui được giúp bạn.",
        "Cảm ơn bạn, chúc bạn có một ngày vui vẻ nhé 🌸",
      ],
      bye: [
        "Tạm biệt! 👋 Hẹn gặp lại bạn sớm nhé.",
        "Cảm ơn bạn đã trò chuyện cùng tôi! 🌷",
      ],
      who: [
        "Tôi là AI Assistant 💬 — người giúp bạn tìm nhà hàng tiệc cưới hoàn hảo ở Đà Nẵng 💒",
        "Tôi là trợ lý ảo của hệ thống, giúp bạn gợi ý nhà hàng phù hợp 🌟",
      ],
      joke: [
        "Haha 😄 bạn vui tính thật đấy!",
        "😂 Tôi cũng đang mỉm cười đây!",
      ],
      ok: ["Dạ vâng ạ 👍", "Okay bạn! Bạn cần tìm nhà hàng khu vực nào ạ?"],
    };

    const replyList = responses[intent] || [
      "Tôi có thể giúp bạn tìm nhà hàng tổ chức tiệc tại Đà Nẵng nhé! 🎉",
    ];
    const reply = replyList[Math.floor(Math.random() * replyList.length)];

    return res.json({ reply });
  }

  // 🧩 2️⃣ Nếu là tìm nhà hàng → gọi Gemini
  try {
    const filters = await analyzeUserRequest(message);
    if (!filters || Object.keys(filters).length === 0) {
      console.log("⚠️ Gemini không hiểu, fallback tìm keyword trực tiếp...");

      // Fallback đơn giản bằng cách đọc text người dùng
      const msg = message.toLowerCase();

      // Tự tìm các từ khóa chính
      const possibleDistricts = [
        "hải châu",
        "sơn trà",
        "thanh khê",
        "liên chiểu",
        "cẩm lệ",
        "ngũ hành sơn",
      ];

      const possibleKeywords = [
        "sang trọng",
        "lãng mạn",
        "view đẹp",
        "ấm cúng",
        "cao cấp",
        "rộng rãi",
      ];

      const district = possibleDistricts.find((d) => msg.includes(d)) || "";
      const keywords = possibleKeywords.filter((k) => msg.includes(k));

      // Nếu có district hoặc keyword thì fallback sang truy vấn DB luôn
      if (district || keywords.length) {
        filters = {
          eventType: "",
          district,
          keywords,
        };
        console.log("🤖 Fallback hiểu:", filters);
      } else {
        return res.json({
          reply: `Xin lỗi, mình chưa hiểu rõ ý bạn 🥺  
Bạn có thể thử lại với cú pháp ví dụ:

👉 "Tôi cần nhà hàng tổ chức tiệc cưới sang trọng ở Hải Châu"  
👉 "Gợi ý nhà hàng có view đẹp ở Sơn Trà"  
👉 "Tìm nhà hàng có sảnh lớn ở Ngũ Hành Sơn"`,
        });
      }
    }

    const { eventType, keywords = [], district = "" } = filters;
    const cleanDistrict = district.trim().toLowerCase();

    let query = `
      SELECT 
        r.restaurantID,
        r.name,
        r.description,
        r.avgRating,
        r.totalReviews,
        r.thumbnailURL,
        a.fullAddress,
        a.ward
      FROM Restaurant r
      JOIN Address a ON r.addressID = a.addressID
      WHERE r.status = 1
    `;

    if (eventType) {
      const [eventTypes] = await sequelize.query(
        `SELECT eventTypeID FROM EventType WHERE name LIKE :name AND status = 1 LIMIT 1`,
        { replacements: { name: `%${eventType}%` } }
      );
      if (eventTypes.length > 0) {
        query += ` AND r.restaurantID IN (
          SELECT restaurantID FROM RestaurantEventType WHERE eventTypeID = ${eventTypes[0].eventTypeID}
        )`;
      }
    }

    if (keywords.length) {
      const kw = keywords
        .map(
          (k) =>
            `(r.name LIKE '%${k}%' OR r.description LIKE '%${k}%' OR a.fullAddress LIKE '%${k}%')`
        )
        .join(" OR ");
      query += ` AND (${kw})`;
    }

    query += " ORDER BY r.avgRating DESC LIMIT 15";
    const [rawResults] = await sequelize.query(query);

    // ✅ Lọc lại đúng quận trong JS
    let restaurants = rawResults;
    if (cleanDistrict) {
      const regex = new RegExp(`\\b${cleanDistrict}\\b`, "i");
      restaurants = rawResults.filter((r) => {
        const addr = (r.fullAddress || "").toLowerCase();
        const ward = (r.ward || "").toLowerCase();
        return regex.test(addr) || regex.test(ward);
      });
    }

    if (!restaurants.length) {
      return res.json({
        reply: `Hiện tôi chưa tìm thấy nhà hàng phù hợp 🕵️‍♂️ 
Có thể bạn mô tả giúp mình rõ hơn được không?  
Ví dụ, bạn có thể thử nói:

👉 "Tôi cần nhà hàng tổ chức tiệc cưới sang trọng ở Hải Châu"  
👉 "Gợi ý nhà hàng có view đẹp ở Sơn Trà"  
👉 "Tìm nhà hàng có khuyến mãi tại Đà Nẵng"`,
      });
    }

    const listText = restaurants
      .slice(0, 5)
      .map(
        (r, i) =>
          `🏠 ${i + 1}. **${r.name}** (${r.avgRating ?? "N/A"}⭐ – ${
            r.totalReviews ?? 0
          } đánh giá)\n📍 ${r.fullAddress}\n💬 ${r.description}`
      )
      .join("\n\n");

    res.json({
      reply: `Dưới đây là một số nhà hàng phù hợp ở Đà Nẵng:\n\n${listText}`,
      data: restaurants.slice(0, 5),
    });
  } catch (error) {
    console.error("❌ Lỗi /api/ai/suggest:", error);
    res.status(500).json({
      reply: "Có lỗi xảy ra khi xử lý yêu cầu tìm nhà hàng.",
    });
  }
});

export default router;
