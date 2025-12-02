import fs from 'fs/promises';
import path from 'path';
import BookingDAO from '../dao/BookingDAO.js';
import ContractDAO, { ContractStatus } from '../dao/ContractDAO.js';
import cloudinary from '../config/cloudinary.js';

const CONTRACTS_DIR = path.resolve(process.cwd(), 'server', 'uploads', 'contracts');

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMoney(val) {
  if (val == null || val === '') return '';
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} tháng ${month} năm ${year}, lúc ${hours}:${minutes}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatVNDMoney(val) {
  if (val == null || val === '') return '0';
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  return new Intl.NumberFormat('vi-VN').format(n);
}

function generateContractHtml(booking) {
  const customer = booking.customer || {};
  const customerUser = customer.user || {};
  const hall = booking.hall || {};
  const restaurant = hall.restaurant || {};
  const restaurantAddress = restaurant.address || {};
  const menu = booking.menu || {};
  const services = Array.isArray(booking.bookingservices) ? booking.bookingservices : [];
  const promotions = Array.isArray(booking.bookingpromotions) ? booking.bookingpromotions : [];
  const dishes = Array.isArray(booking.bookingdishes) ? booking.bookingdishes : [];
  const partner = restaurant.partner || hall.restaurant?.restaurantPartner || booking.partner || {};
  // Lưu ý: Association giữa RestaurantPartner và User là "owner", không phải "user"
  const partnerUser = partner.owner || partner.user || {};

  // Format thông tin khách hàng (không cần CMND/CCCD, địa chỉ)
  const customerName = escapeHtml(customer.fullName || customerUser.fullName || customerUser.name || customer.email || '');
  const customerPhone = escapeHtml(customer.phone || customerUser.phone || customer.mobile || '');
  const customerEmail = escapeHtml(customer.email || customerUser.email || '');

  // Format thông tin nhà hàng
  const restaurantName = escapeHtml(restaurant.name || '');
  const restaurantFullAddress = escapeHtml(restaurantAddress.fullAddress || restaurant.address || restaurantAddress.street || '');
  const restaurantPhone = escapeHtml(restaurant.phone || '');
  // Đại diện nhà hàng: lấy từ restaurant partner owner (user.fullName)
  const restaurantRepresentative = escapeHtml(partnerUser.fullName || partner.fullName || partnerUser.name || partner.name || 'Người đại diện nhà hàng');
  // Chức vụ: mặc định "Người đại diện nhà hàng"
  const restaurantRepresentativePosition = escapeHtml(restaurant.representativePosition || restaurant.position || 'Người đại diện nhà hàng');
  // Email nhà hàng: lấy từ restaurant partner owner (user.email)
  const restaurantEmail = escapeHtml(partnerUser.email || restaurant.email || '');

  const hallName = escapeHtml(hall.name || '');
  const menuName = escapeHtml(menu.name || '');
  const eventType = escapeHtml(booking.eventType?.name || booking.eventTypeName || 'Tiệc cưới');
  const eventDate = booking.eventDate ? formatDateShort(booking.eventDate) : '';
  const startTime = escapeHtml(booking.startTime || '');
  const endTime = escapeHtml(booking.endTime || '');
  const tableCount = booking.tableCount || booking.tables || 0;

  const servicesList = services.map(s => {
    const name = escapeHtml(s.service?.name || s.serviceName || '');
    return name;
  }).filter(Boolean).join(', ') || 'Không có';

  const contractNumber = `HĐ-${String(booking.bookingID).padStart(6, '0')}/HĐ-TC`;
  const contractDate = formatDateVN(new Date());

  // Tính toán giá trị
  const totalAmount = booking.totalAmount || booking.originalPrice || 0;
  const depositPercent = 30; // 30% đặt cọc mặc định
  const depositAmount = Math.round(totalAmount * depositPercent / 100);
  const remainingAmount = totalAmount - depositAmount;

  const servicesHtml = services.map(s => {
    const name = escapeHtml(s.service?.name || s.serviceName || '');
    const qty = s.quantity || 1;
    const price = s.appliedPrice != null ? formatVNDMoney(s.appliedPrice) : '0';
    return `<tr><td>${name}</td><td style="text-align:center">${qty}</td><td style="text-align:right">${price} VNĐ</td></tr>`;
  }).join('\n');

  const contractHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hợp đồng dịch vụ tổ chức tiệc - ${contractNumber}</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      font-size: 13pt; 
      color: #000; 
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .container { 
      max-width: 210mm; 
      margin: 0 auto; 
      padding: 20mm; 
      background: white;
    }
    h1 { 
      font-size: 16pt; 
      font-weight: bold; 
      text-align: center;
      text-transform: uppercase;
      margin-bottom: 10pt;
    }
    .contract-number {
      font-size: 12pt;
      text-align: center;
      margin-bottom: 15pt;
    }
    .intro {
      text-align: center;
      margin-bottom: 15pt;
    }
    h2 {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 15pt;
      margin-bottom: 8pt;
      text-transform: uppercase;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    .party-info {
      margin-bottom: 10pt;
    }
    .party-info p {
      margin: 4pt 0;
    }
    .blank {
      border-bottom: 1px solid #000;
      display: inline-block;
      min-width: 200pt;
      height: 1.2em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 8pt;
    }
    th, td {
      border: 1px solid #000;
      padding: 6pt;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 30pt;
      display: flex;
      justify-content: space-around;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .underline {
      border-top: 1px solid #000;
      display: inline-block;
      min-width: 150pt;
      margin-top: 40pt;
    }
    .clause {
      margin: 8pt 0;
      text-align: justify;
    }
    .clause-number {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>HỢP ĐỒNG DỊCH VỤ TỔ CHỨC TIỆC</h1>
    <div class="contract-number">(Số: ${contractNumber})</div>
    
    <div class="intro">
      <p>Hôm nay, ngày ${contractDate.split(' lúc ')[0]}, tại ${restaurantFullAddress || 'Đà Nẵng'}, chúng tôi gồm có:</p>
    </div>

    <h2>I. THÔNG TIN CÁC BÊN</h2>
    
    <div class="party-info">
      <h3>1. Bên A – Khách hàng</h3>
      <p>Họ và tên: <span class="blank">${customerName}</span></p>
      <p>Số điện thoại: <span class="blank">${customerPhone}</span> Email: <span class="blank">${customerEmail || '....................................'}</span></p>
      <p>(Sau đây gọi là "Bên A")</p>
    </div>

    <div class="party-info">
      <h3>2. Bên B – Nhà hàng / Đơn vị tổ chức tiệc</h3>
      <p>Tên nhà hàng: <span class="blank">${restaurantName}</span></p>
      <p>Người đại diện nhà hàng: <span class="blank">${restaurantRepresentative}</span></p>
      <p>Chức vụ: <span class="blank">${restaurantRepresentativePosition}</span></p>
      <p>Địa chỉ: <span class="blank">${restaurantFullAddress}</span></p>
      <p>Số điện thoại: <span class="blank">${restaurantPhone}</span> Email: <span class="blank">${restaurantEmail || '.............................................'}</span></p>
      <p>(Sau đây gọi là "Bên B")</p>
    </div>

    <p>Hai bên thống nhất ký kết <strong>Hợp đồng dịch vụ tổ chức tiệc</strong> với các điều khoản sau:</p>

    <h2>II. NỘI DUNG DỊCH VỤ</h2>
    
    <div class="party-info">
      <p class="clause"><span class="clause-number">Điều 1.</span> Thông tin buổi tiệc</p>
      <p>Loại sự kiện: <span class="blank">${eventType}</span></p>
      <p>Ngày tổ chức: <span class="blank">${eventDate}</span> Giờ bắt đầu: <span class="blank">${startTime}</span> Giờ kết thúc: <span class="blank">${endTime}</span></p>
      <p>Sảnh/Hội trường: <span class="blank">${hallName}</span></p>
      <p>Số lượng bàn dự kiến: <span class="blank">${tableCount}</span> bàn</p>
      <p>Thực đơn đã chọn (Menu): <span class="blank">${menuName}</span></p>
      <p>Các dịch vụ kèm theo (nếu có): <span class="blank">${servicesList}</span></p>
    </div>

    <h2>III. TRÁCH NHIỆM & CAM KẾT CỦA BÊN B (NHÀ HÀNG)</h2>
    
    <div class="clause">
      <p>1. Cung cấp đúng sảnh, không gian và các dịch vụ đã thỏa thuận trong hợp đồng.</p>
      <p>2. Đảm bảo chất lượng món ăn đúng menu đã thống nhất; thực phẩm sạch, rõ nguồn gốc, an toàn theo quy định vệ sinh ATTP.</p>
      <p>3. Chuẩn bị đầy đủ bàn ghế, dụng cụ, trang trí và trang thiết bị theo thỏa thuận.</p>
      <p>4. Bố trí nhân viên phục vụ đầy đủ, đúng nghiệp vụ.</p>
      <p>5. Đảm bảo hệ thống âm thanh – ánh sáng hoạt động tốt (nếu trong gói dịch vụ).</p>
      <p>6. Đảm bảo an ninh và an toàn trong khu vực tổ chức.</p>
      <p>7. Thực hiện các yêu cầu hợp lý từ Bên A trong phạm vi khả năng và thỏa thuận.</p>
      <p>8. Xuất hóa đơn hợp lệ theo quy định pháp luật khi Bên A yêu cầu.</p>
      <p>9. Chịu trách nhiệm bồi thường khi:</p>
      <p style="margin-left: 20pt;">- Giao sai món, kém chất lượng.</p>
      <p style="margin-left: 20pt;">- Sự cố dịch vụ ảnh hưởng trực tiếp đến Bên A (trừ trường hợp bất khả kháng).</p>
    </div>

    <h2>IV. TRÁCH NHIỆM & CAM KẾT CỦA BÊN A (KHÁCH HÀNG)</h2>
    
    <div class="clause">
      <p>1. Cung cấp đầy đủ thông tin đặt tiệc và xác nhận số lượng bàn trước ngày diễn ra tối thiểu <span class="blank">7</span> ngày.</p>
      <p>2. Thanh toán đúng hạn theo điều khoản tại Điều 5.</p>
      <p>3. Không mang thức ăn hoặc đồ uống từ bên ngoài vào (trừ khi có thỏa thuận trước).</p>
      <p>4. Giữ gìn tài sản của nhà hàng; bồi thường nếu gây thiệt hại ngoài ý muốn.</p>
      <p>5. Thông báo trước cho Bên B nếu có thay đổi chương trình, số lượng bàn, thời gian hoặc yêu cầu khác.</p>
      <p>6. Chịu trách nhiệm về tài sản cá nhân của khách mời, trừ khi sai sót thuộc về Bên B.</p>
    </div>

    <h2>V. GIÁ TRỊ HỢP ĐỒNG & PHƯƠNG THỨC THANH TOÁN</h2>
    
    <div class="party-info">
      <p>Tổng giá trị hợp đồng: <span class="blank">${formatVNDMoney(totalAmount)} VNĐ</span></p>
      <p>Phương thức thanh toán:</p>
      <p>1. Đặt cọc: <span class="blank">${depositPercent}%</span> giá trị hợp đồng = <span class="blank">${formatVNDMoney(depositAmount)} VNĐ</span> (thanh toán khi ký hợp đồng).</p>
      <p>2. Thanh toán phần còn lại sau khi kết thúc buổi tiệc: <span class="blank">${formatVNDMoney(remainingAmount)} VNĐ</span></p>
      <p>Hình thức thanh toán: Tiền mặt / Chuyển khoản / Quẹt thẻ</p>
      <p><strong>Lưu ý:</strong> Tiền đặt cọc không hoàn lại nếu Bên A tự ý hủy tiệc, trừ trường hợp bất khả kháng được pháp luật công nhận.</p>
    </div>

    <h2>VI. THAY ĐỔI – HỦY HỢP ĐỒNG</h2>
    
    <div class="clause">
      <p>1. Bên A có quyền thay đổi số lượng bàn tối thiểu trước ngày tổ chức <span class="blank">7</span> ngày.</p>
      <p>2. Bên A hủy tiệc trong vòng:</p>
      <p style="margin-left: 20pt;">- Trên <span class="blank">7</span> ngày: Mất <span class="blank">30%</span> tiền cọc</p>
      <p style="margin-left: 20pt;">- Trong <span class="blank">7</span> ngày: Mất 100% tiền cọc</p>
      <p>3. Nếu Bên B hủy dịch vụ hoặc không đảm bảo địa điểm:</p>
      <p style="margin-left: 20pt;">- Hoàn lại toàn bộ tiền cọc</p>
      <p style="margin-left: 20pt;">- Bồi thường thêm <span class="blank">10%</span> giá trị hợp đồng (nếu có thỏa thuận)</p>
    </div>

    <h2>VII. ĐIỀU KHOẢN CHUNG</h2>
    
    <div class="clause">
      <p>1. Hai bên cam kết cung cấp thông tin trung thực; hiểu và đồng ý với toàn bộ nội dung hợp đồng.</p>
      <p>2. Mọi tranh chấp phát sinh sẽ được thương lượng; nếu không giải quyết được, sẽ đưa ra Tòa án có thẩm quyền.</p>
      <p>3. Hợp đồng có hiệu lực từ ngày ký và được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.</p>
    </div>

    <h2>VIII. CHỮ KÝ XÁC NHẬN</h2>
    
    <div class="signature-section">
      <div class="signature-box">
        <p><strong>BÊN A (Khách hàng)</strong></p>
        <p>Ký, ghi rõ họ tên</p>
        <div class="underline"></div>
      </div>
      <div class="signature-box">
        <p><strong>BÊN B (Nhà hàng)</strong></p>
        <p>Ký, đóng dấu, ghi rõ họ tên</p>
        <div class="underline"></div>
      </div>
    </div>

    <hr style="margin-top: 30pt;"/>
    <p style="text-align: center; font-size: 10pt; color: #666; margin-top: 10pt;">
      Hợp đồng được tạo tự động vào ${contractDate}
    </p>
  </div>
</body>
</html>`;

  return contractHtml;
}

async function ensureContractsDir() {
  try {
    await fs.mkdir(CONTRACTS_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function createContractFromBooking(bookingID) {
  if (!bookingID) throw new Error('Missing bookingID');
  const booking = await BookingDAO.getBookingDetails(bookingID);
  if (!booking) throw new Error('Booking not found');

  const html = generateContractHtml(booking);
  await ensureContractsDir();

  const timestamp = Date.now();
  const filename = `contract-${bookingID}-${timestamp}`;
  const filepath = path.join(CONTRACTS_DIR, `${filename}.html`);
  
  // Write HTML to temporary file
  await fs.writeFile(filepath, html, 'utf8');
  console.log(`📝 [ContractServices] Created temporary HTML file: ${filepath}`);

  // Try to convert to PDF if puppeteer is available (optional dependency)
  let fileToUpload = filepath;
  let fileExtension = 'html';
  let fileMimeType = 'text/html';
  
  try {
    const puppeteer = await import('puppeteer');
    console.log('🔧 [ContractServices] Converting HTML to PDF using Puppeteer...');
    const browser = await puppeteer.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfPath = filepath.replace(/\.html?$/i, '.pdf');
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();
    fileToUpload = pdfPath;
    fileExtension = 'pdf';
    fileMimeType = 'application/pdf';
    console.log(`✅ [ContractServices] PDF generated successfully: ${pdfPath}`);
  } catch (e) {
    // Puppeteer not installed or failed, fall back to HTML file
    console.warn('⚠️ [ContractServices] PDF generation skipped or failed:', e?.message || e);
    console.log('📄 [ContractServices] Will upload HTML file instead');
  }

  // Upload to Cloudinary
  let contractUrl;
  try {
    console.log(`☁️ [ContractServices] Uploading ${fileExtension.toUpperCase()} file to Cloudinary...`);
    
    // Prepare upload options for Cloudinary
    const uploadOptions = {
      folder: 'contracts',
      resource_type: 'raw', // HTML and PDF are raw files
      use_filename: false,
      unique_filename: true,
      overwrite: false,
    };

    // Set public_id with proper extension
    const publicId = `contracts/contract-${bookingID}-${timestamp}.${fileExtension}`;
    uploadOptions.public_id = publicId;

    console.log(`📤 [ContractServices] Uploading file: ${fileToUpload}`);
    console.log(`📝 [ContractServices] Public ID: ${publicId}`);
    console.log(`📋 [ContractServices] Resource type: raw`);

    const uploaded = await cloudinary.uploader.upload(fileToUpload, uploadOptions);

    contractUrl = uploaded.secure_url || uploaded.url;
    console.log(`✅ [ContractServices] Successfully uploaded to Cloudinary: ${contractUrl}`);
    console.log(`📊 [ContractServices] Upload details:`, {
      secure_url: uploaded.secure_url,
      resource_type: uploaded.resource_type,
      format: uploaded.format,
      public_id: uploaded.public_id,
      bytes: uploaded.bytes,
    });

  } catch (uploadError) {
    console.error('❌ [ContractServices] Cloudinary upload failed:', uploadError);
    // Fallback: keep local file and use relative path (for backward compatibility)
    console.warn('⚠️ [ContractServices] Falling back to local file storage');
    const contractsDir = path.resolve(process.cwd(), 'server', 'uploads', 'contracts');
    if (fileToUpload.startsWith(contractsDir)) {
      const relativePath = fileToUpload.replace(contractsDir, '').replace(/\\/g, '/');
      contractUrl = `/uploads/contracts${relativePath}`;
    } else {
      contractUrl = fileToUpload;
    }
  }

  // Clean up temporary files after successful Cloudinary upload
  if (contractUrl && (contractUrl.startsWith('http://') || contractUrl.startsWith('https://'))) {
    try {
      console.log(`🧹 [ContractServices] Cleaning up temporary files...`);
      
      // Delete the uploaded file (PDF or HTML)
      if (fileToUpload && await fs.access(fileToUpload).then(() => true).catch(() => false)) {
        await fs.unlink(fileToUpload);
        console.log(`✅ [ContractServices] Deleted temporary file: ${fileToUpload}`);
      }
      
      // If PDF was created, also delete the original HTML file
      if (fileToUpload !== filepath && filepath.endsWith('.html')) {
        if (await fs.access(filepath).then(() => true).catch(() => false)) {
          await fs.unlink(filepath);
          console.log(`✅ [ContractServices] Deleted original HTML file: ${filepath}`);
        }
      }
      
      console.log(`✅ [ContractServices] Cleanup completed successfully`);
    } catch (cleanupError) {
      console.warn('⚠️ [ContractServices] Failed to cleanup temporary files:', cleanupError?.message || cleanupError);
      // Don't throw error, just warn - file is already uploaded to Cloudinary
    }
  } else {
    console.log(`ℹ️ [ContractServices] Keeping temporary files (local storage mode)`);
  }

  // Persist contract record in DB
  const restaurantID = booking.hall?.restaurant?.restaurantID || booking.restaurantID || null;
  console.log(`💾 [ContractServices] Saving contract with URL: ${contractUrl}`);
  const rel = await ContractDAO.addContract(bookingID, restaurantID, contractUrl, null, ContractStatus.PENDING);
  return { file: fileToUpload, contract: rel, cloudinaryUrl: contractUrl };
}

export default {
  generateContractHtml,
  createContractFromBooking,
};

