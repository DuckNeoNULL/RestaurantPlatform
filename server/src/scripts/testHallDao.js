import HallDAO from "../dao/HallDAO.js";
import db from "../config/db.js";

(async () => {
  try {
    // Kết nối Sequelize (verify)
    await db.sequelize.authenticate();
    console.log('Sequelize connected');
    const hallData = {
        restaurantID: 1,
        name: "Grand Ballroom",
        description: "A spacious hall suitable for large weddings.",
        capacity: 300, // legacy field
        minTable: 20,
        area: 500,
        price: 1500.00,
        status: true
    };
    const newHall = await HallDAO.createHall(hallData);
    console.log('New Hall created:', JSON.stringify(newHall, null, 2));
    } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Đóng kết nối (nếu cần)
    await db.sequelize.close();
    process.exit(0);
  }
})();