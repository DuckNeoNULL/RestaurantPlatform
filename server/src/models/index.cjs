const sequelize = require("../config/db.js");
const initModels = require("./init-models.cjs");

const models = initModels(sequelize);

module.exports = {
  sequelize,
  ...models,
};
