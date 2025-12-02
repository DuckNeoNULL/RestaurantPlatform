import db from "../config/db.js";
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { bankaccount, sequelize } = db;
class BankAccountDAO {
    static async getByID(accountID) {
        const r = await bankaccount.findByPk(accountID, {
            attributes: ['accountID', 'accountNumber', 'bankName', 'accountHolderName', 'ifscCode']
        });
        return toDTO(r);
    }
    static async addBankAccount(accountNumber, bankName, accountHolderName, ifscCode) {
        const ba = await bankaccount.create({ accountNumber, bankName, accountHolderName, ifscCode });
        return toDTO(ba);
    }
    static async updateBankAccount(accountID, bankAccountData) {
        const [count] = await bankaccount.update(bankAccountData, { where: { accountID } });
        return count > 0;
    }
    static async deleteBankAccount(accountID) {
        const count = await bankaccount.destroy({ where: { accountID } });
        return count > 0;
    }
}
export default BankAccountDAO;