import cron from 'node-cron';
import BookingDAO from '../dao/BookingDAO.js';
import { notifyByStatusById } from './Booking/BookingNotificationService.js';

/**
 * Thiết lập Cron Job để kiểm tra các booking đã hết hạn.
 * Chạy tác vụ này mỗi 1 giờ (vào phút 0 của mỗi giờ: 00:00, 01:00, 02:00, ...)
 */
export function setupExpirationChecker({ days = 3 } = {}) {
    // Cron string '0 * * * *': phút (0), giờ (*), ngày trong tháng (*), tháng (*), ngày trong tuần (*)
    cron.schedule('0 * * * *', async () => {
        const jobStartTime = new Date();
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        console.log(`--- CRON JOB: Bắt đầu kiểm tra hết hạn lúc ${jobStartTime.toLocaleTimeString()} | cutoff=${cutoff.toISOString()} ---`);

        try {
            // Quét theo batch để tận dụng index và gửi mail cho partner với từng booking đã hết hạn
            let total = 0;
            const batchSize = 1000;
            while (true) {
                const ids = await BookingDAO.findConfirmedIdsOlderThan(cutoff, batchSize);
                if (!ids.length) break;
                const affected = await BookingDAO.expireByIds(ids, { setChecked: true });
                total += affected;
                // Partner emails are disabled; no per-booking notification will be sent here.
                // If in future we want to notify customers for EXPIRED, call notifyByStatusById here.
                if (ids.length < batchSize) break;
            }
            console.log(`Hoàn thành. Đã cập nhật ${total} booking (CONFIRMED -> EXPIRED) và gửi thông báo.`);
        } catch (error) {
            console.error('LỖI trong quá trình chạy Cron Job:', error);
        }
        
        console.log('--- CRON JOB: Kết thúc ---');
    });
    console.log('Cron Job kiểm tra hết hạn đã được thiết lập (chạy mỗi 1 giờ).');
}

// BẠN CẦN GỌI HÀM NÀY KHI SERVER KHỞI ĐỘNG
// setupExpirationChecker();