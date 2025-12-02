export function bookingAcceptedTemplate(booking) {
  const { bookingID, eventDate, startTime, endTime } = booking || {};
  const restaurantName =
    booking?.restaurantName ||
    booking?.restaurant?.name ||
    booking?.hall?.restaurant?.name ||
    '';
  const hallName = booking?.hall?.name || booking?.hallName || '';
  const minTable = booking?.hall?.minTable ?? null;
  const maxTable = booking?.hall?.maxTable ?? null;
  const tableCount = booking?.tableCount ?? null;

  // Pricing and details
  const hallPrice = booking?.hall?.price ?? null;
  const menuName = booking?.menu?.name || '';
  const menuPrice = booking?.menu?.price ?? null;
  const bookingServices = Array.isArray(booking?.bookingservices) ? booking.bookingservices : [];
  const promotions = Array.isArray(booking?.bookingpromotions) ? booking.bookingpromotions : [];

  const originalPrice = Number(booking?.originalPrice) || 0;
  const discountAmount = Number(booking?.discountAmount) || 0;
  const VAT = Number(booking?.VAT) || 0;
  const totalAmount = Number(booking?.totalAmount) || 0;

  const vnd = (n) => (Number(n) || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const percentFrom = (v, base) => {
    const value = Number(v) || 0;
    const b = Number(base) || 0;
    if (b <= 0 || value <= 0) return '';
    const pct = Math.round((value / b) * 100);
    return ` (~${pct}%)`;
  };

  const servicesHtml = bookingServices.length
    ? '<h3 style="margin-top:16px;">Dịch vụ kèm theo</h3>' +
      '<ul>' +
      bookingServices.map((s) => {
        const name = s?.service?.name || `Dịch vụ #${s?.serviceID}`;
        const qty = Number(s?.quantity) || 1;
        const price = Number(s?.appliedPrice) || Number(s?.service?.price) || 0;
        const unitTxt = s?.service?.unit ? `/${s.service.unit}` : '';
        const line = vnd(qty * price);
        return `<li>${name} — ${qty} x ${vnd(price)}${unitTxt} = <strong>${line}</strong></li>`;
      }).join('') +
      '</ul>'
    : '';

  const promosHtml = promotions.length
    ? '<h3 style="margin-top:16px;">Ưu đãi áp dụng</h3>' +
      '<ul>' +
      promotions.map((p) => {
        const pr = p?.promotion || {};
        const pv = pr?.discountValue;
        const hasValue = pv !== null && pv !== undefined;
        const valueTxt = hasValue ? `${vnd(pv)} (theo cấu hình)` : 'Miễn phí / Theo mô tả';
        return `<li>${pr?.name || `Ưu đãi #${p?.promotionID}`} — ${valueTxt}</li>`;
      }).join('') +
      '</ul>'
    : '';

  return {
    subject: `Đơn đặt tiệc #${bookingID} đã được chấp nhận${restaurantName ? ` bởi ${restaurantName}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color:#16a34a;">Đơn đặt tiệc đã được chấp nhận</h2>
        <p>Chúc mừng! Đơn đặt tiệc của bạn đã được <strong>CHẤP NHẬN</strong>${restaurantName ? ` bởi <strong>${restaurantName}</strong>` : ''}.</p>
        <ul>
          <li><strong>Mã đơn:</strong> ${bookingID}</li>
          ${restaurantName ? `<li><strong>Nhà hàng:</strong> ${restaurantName}</li>` : ''}
          ${hallName ? `<li><strong>Sảnh:</strong> ${hallName}</li>` : ''}
          ${(minTable !== null && maxTable !== null) ? `<li><strong>Sức chứa (bàn):</strong> ${minTable} - ${maxTable}</li>` : ''}
          ${tableCount ? `<li><strong>Số bàn đặt:</strong> ${tableCount}</li>` : ''}
          <li><strong>Thời gian:</strong> ${eventDate || ''} ${startTime || ''} - ${endTime || ''}</li>
          ${hallPrice ? `<li><strong>Giá sảnh:</strong> ${vnd(hallPrice)}</li>` : ''}
          ${menuName ? `<li><strong>Thực đơn:</strong> ${menuName} ${menuPrice ? `(${vnd(menuPrice)}/bàn)` : ''}</li>` : ''}
          ${menuPrice && tableCount ? `<li><strong>Tổng thực đơn (${tableCount} bàn):</strong> ${vnd(Number(menuPrice) * Number(tableCount))}</li>` : ''}
        </ul>
        ${servicesHtml}
        ${promosHtml}
        <h3 style="margin-top:16px;">Tóm tắt chi phí</h3>
        <ul>
          <li><strong>Giá gốc:</strong> ${vnd(originalPrice)}</li>
          <li><strong>Giảm giá:</strong> -${vnd(discountAmount)}</li>
          <li><strong>VAT:</strong> ${vnd(VAT)}${percentFrom(VAT, originalPrice - discountAmount)}</li>
          <li><strong>Tổng thanh toán:</strong> ${vnd(totalAmount)}</li>
        </ul>
        <p>Chúng tôi sẽ liên hệ nếu cần thêm thông tin. Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ!</p>
      </div>
    `,
    text: [
      `Đơn đặt tiệc đã được chấp nhận`,
      `Mã đơn: ${bookingID}`,
      restaurantName ? `Nhà hàng: ${restaurantName}` : '',
      hallName ? `Sảnh: ${hallName}` : '',
      (minTable !== null && maxTable !== null) ? `Sức chứa (bàn): ${minTable} - ${maxTable}` : '',
      tableCount ? `Số bàn đặt: ${tableCount}` : '',
      hallPrice ? `Giá sảnh: ${vnd(hallPrice)}` : '',
      menuName ? `Thực đơn: ${menuName} ${menuPrice ? `(${vnd(menuPrice)}/bàn)` : ''}` : '',
      (menuPrice && tableCount) ? `Tổng thực đơn (${tableCount} bàn): ${vnd(Number(menuPrice) * Number(tableCount))}` : '',
      `Thời gian: ${eventDate || ''} ${startTime || ''} - ${endTime || ''}`,
      bookingServices.length ? 'Dịch vụ kèm theo:' : '',
      ...bookingServices.map((s) => {
        const name = s?.service?.name || `Dịch vụ #${s?.serviceID}`;
        const qty = Number(s?.quantity) || 1;
        const price = Number(s?.appliedPrice) || Number(s?.service?.price) || 0;
        const line = vnd(qty * price);
        return `- ${name}: ${qty} x ${vnd(price)} = ${line}`;
      }),
      promotions.length ? 'Ưu đãi áp dụng:' : '',
      ...promotions.map((p) => {
        const pr = p?.promotion || {};
        const pv = pr?.discountValue;
        const hasValue = pv !== null && pv !== undefined;
        const valueTxt = hasValue ? vnd(pv) : 'Miễn phí / Theo mô tả';
        return `- ${pr?.name || `Ưu đãi #${p?.promotionID}`}: ${valueTxt}`;
      }),
      'Tóm tắt chi phí:',
      `- Giá gốc: ${vnd(originalPrice)}`,
      `- Giảm giá: -${vnd(discountAmount)}`,
      `- VAT: ${vnd(VAT)}${percentFrom(VAT, originalPrice - discountAmount)}`,
      `- Tổng thanh toán: ${vnd(totalAmount)}`,
      `Chúng tôi sẽ liên hệ nếu cần thêm thông tin. Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ!`
    ].filter(Boolean).join('\n')
  };
}

export function bookingRejectedTemplate(booking, reason) {
  const { bookingID, eventDate, startTime, endTime } = booking || {};
  const restaurantName =
    booking?.restaurantName ||
    booking?.restaurant?.name ||
    booking?.hall?.restaurant?.name ||
    '';
  const hallName = booking?.hall?.name || booking?.hallName || '';
  const minTable = booking?.hall?.minTable ?? null;
  const maxTable = booking?.hall?.maxTable ?? null;
  const tableCount = booking?.tableCount ?? null;

  // Pricing and details
  const hallPrice = booking?.hall?.price ?? null;
  const menuName = booking?.menu?.name || '';
  const menuPrice = booking?.menu?.price ?? null;
  const bookingServices = Array.isArray(booking?.services) ? booking.services : [];
  const promotions = Array.isArray(booking?.promotions) ? booking.promotions : [];

  const originalPrice = Number(booking?.originalPrice) || 0;
  const discountAmount = Number(booking?.discountAmount) || 0;
  const VAT = Number(booking?.VAT) || 0;
  const totalAmount = Number(booking?.totalAmount) || 0;

  const vnd = (n) => (Number(n) || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const percentFrom = (v, base) => {
    const value = Number(v) || 0;
    const b = Number(base) || 0;
    if (b <= 0 || value <= 0) return '';
    const pct = Math.round((value / b) * 100);
    return ` (~${pct}%)`;
  };

  const servicesHtml = bookingServices.length
    ? '<h3 style="margin-top:16px;">Dịch vụ kèm theo</h3>' +
      '<ul>' +
      bookingServices.map((s) => {
        const name = s?.service?.name || `Dịch vụ #${s?.serviceID}`;
        const qty = Number(s?.quantity) || 1;
        const price = Number(s?.appliedPrice) || Number(s?.service?.price) || 0;
        const unitTxt = s?.service?.unit ? `/${s.service.unit}` : '';
        const line = vnd(qty * price);
        return `<li>${name} — ${qty} x ${vnd(price)}${unitTxt} = <strong>${line}</strong></li>`;
      }).join('') +
      '</ul>'
    : '';

  const promosHtml = promotions.length
    ? '<h3 style="margin-top:16px;">Ưu đãi áp dụng</h3>' +
      '<ul>' +
      promotions.map((p) => {
        const pr = p?.promotion || {};
        const pv = pr?.discountValue;
        const hasValue = pv !== null && pv !== undefined;
        const valueTxt = hasValue ? `${vnd(pv)} (theo cấu hình)` : 'Miễn phí / Theo mô tả';
        return `<li>${pr?.name || `Ưu đãi #${p?.promotionID}`} — ${valueTxt}</li>`;
      }).join('') +
      '</ul>'
    : '';

  return {
    subject: `Đơn đặt tiệc #${bookingID} đã bị từ chối${restaurantName ? ` từ ${restaurantName}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color:#dc2626;">Đơn đặt tiệc bị từ chối</h2>
        <p>Rất tiếc, đơn đặt tiệc của bạn đã bị <strong>TỪ CHỐI</strong>${restaurantName ? ` bởi <strong>${restaurantName}</strong>` : ''}.</p>
        <ul>
          <li><strong>Mã đơn:</strong> ${bookingID}</li>
          ${restaurantName ? `<li><strong>Nhà hàng:</strong> ${restaurantName}</li>` : ''}
          ${hallName ? `<li><strong>Sảnh:</strong> ${hallName}</li>` : ''}
          ${(minTable !== null && maxTable !== null) ? `<li><strong>Sức chứa (bàn):</strong> ${minTable} - ${maxTable}</li>` : ''}
          ${tableCount ? `<li><strong>Số bàn đặt:</strong> ${tableCount}</li>` : ''}
          <li><strong>Thời gian:</strong> ${eventDate || ''} ${startTime || ''} - ${endTime || ''}</li>
          ${reason ? `<li><strong>Lý do:</strong> ${reason}</li>` : ''}
          ${hallPrice ? `<li><strong>Giá sảnh:</strong> ${vnd(hallPrice)}</li>` : ''}
          ${menuName ? `<li><strong>Thực đơn:</strong> ${menuName} ${menuPrice ? `(${vnd(menuPrice)}/bàn)` : ''}</li>` : ''}
          ${menuPrice && tableCount ? `<li><strong>Tổng thực đơn (${tableCount} bàn):</strong> ${vnd(Number(menuPrice) * Number(tableCount))}</li>` : ''}
        </ul>
        ${servicesHtml}
        ${promosHtml}
        <h3 style="margin-top:16px;">Tóm tắt chi phí</h3>
        <ul>
          <li><strong>Giá gốc:</strong> ${vnd(originalPrice)}</li>
          <li><strong>Giảm giá:</strong> -${vnd(discountAmount)}</li>
          <li><strong>VAT:</strong> ${vnd(VAT)}${percentFrom(VAT, originalPrice - discountAmount)}</li>
          <li><strong>Tổng thanh toán:</strong> ${vnd(totalAmount)}</li>
        </ul>
        <p>Nếu bạn có câu hỏi, vui lòng phản hồi email này để được hỗ trợ.</p>
      </div>
    `,
    text: [
      `Đơn đặt tiệc bị từ chối`,
      `Mã đơn: ${bookingID}`,
      restaurantName ? `Nhà hàng: ${restaurantName}` : '',
      hallName ? `Sảnh: ${hallName}` : '',
      (minTable !== null && maxTable !== null) ? `Sức chứa (bàn): ${minTable} - ${maxTable}` : '',
      tableCount ? `Số bàn đặt: ${tableCount}` : '',
      hallPrice ? `Giá sảnh: ${vnd(hallPrice)}` : '',
      menuName ? `Thực đơn: ${menuName} ${menuPrice ? `(${vnd(menuPrice)}/bàn)` : ''}` : '',
      (menuPrice && tableCount) ? `Tổng thực đơn (${tableCount} bàn): ${vnd(Number(menuPrice) * Number(tableCount))}` : '',
      `Thời gian: ${eventDate || ''} ${startTime || ''} - ${endTime || ''}`,
      reason ? `Lý do: ${reason}` : '',
      bookingServices.length ? 'Dịch vụ kèm theo:' : '',
      ...bookingServices.map((s) => {
        const name = s?.service?.name || `Dịch vụ #${s?.serviceID}`;
        const qty = Number(s?.quantity) || 1;
        const price = Number(s?.appliedPrice) || Number(s?.service?.price) || 0;
        const line = vnd(qty * price);
        return `- ${name}: ${qty} x ${vnd(price)} = ${line}`;
      }),
      promotions.length ? 'Ưu đãi áp dụng:' : '',
      ...promotions.map((p) => {
        const pr = p?.promotion || {};
        const pv = pr?.discountValue;
        const hasValue = pv !== null && pv !== undefined;
        const valueTxt = hasValue ? vnd(pv) : 'Miễn phí / Theo mô tả';
        return `- ${pr?.name || `Ưu đãi #${p?.promotionID}`}: ${valueTxt}`;
      }),
      'Tóm tắt chi phí:',
      `- Giá gốc: ${vnd(originalPrice)}`,
      `- Giảm giá: -${vnd(discountAmount)}`,
      `- VAT: ${vnd(VAT)}${percentFrom(VAT, originalPrice - discountAmount)}`,
      `- Tổng thanh toán: ${vnd(totalAmount)}`,
      `Nếu bạn có câu hỏi, vui lòng phản hồi email này để được hỗ trợ.`
    ].filter(Boolean).join('\n')
  };
}
