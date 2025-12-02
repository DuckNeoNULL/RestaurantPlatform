import db from '../config/db.js';
import UserDAO from '../dao/userDao.js';

(async () => {
  try {
    // Kết nối Sequelize (verify)
    await db.sequelize.authenticate();
    console.log('Sequelize connected');

    const users = await UserDAO.getOwners();
    console.log('users:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Đóng kết nối (nếu cần)
    await db.sequelize.close();
    process.exit(0);
  }
})();