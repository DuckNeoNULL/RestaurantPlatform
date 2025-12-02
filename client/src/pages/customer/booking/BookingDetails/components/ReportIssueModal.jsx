import React from "react";

export default function ReportIssueModal({ booking, onClose }) {
    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header" style={{ backgroundColor: "#D81C45", color: "#fff" }}>
                        <h5 className="modal-title">Báo cáo sự cố</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Bạn đang báo cáo sự cố cho đơn đặt tiệc #{booking.bookingID}</p>
                        <textarea className="form-control" placeholder="Mô tả vấn đề..."></textarea>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
                        <button className="btn" style={{ backgroundColor: "#D81C45", color: "#fff" }}>Gửi báo cáo</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
