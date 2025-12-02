// ContractTab.jsx
import React, { useState } from "react";
import { Row, Col, Card, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFilePdf,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

const PRIMARY = "#D81C45";

const SAMPLE_PDF_URL =
  "https://pdflink.to/26bb5043/";

export default function ContractTab({ booking }) {
  const isCustomer = true;

  const initialPdfUrl =
    booking?.contract?.pdfUrl ||
    booking?.contract?.contractUrl ||
    SAMPLE_PDF_URL;

  const [pdfUrl] = useState(initialPdfUrl);
  const [pdfName] = useState(booking?.contract?.pdfName || "HopDong.pdf");

  const canDownload = booking?.status === 4;

  const handleDownload = () => {
    if (!canDownload) {
      alert("Bạn cần đặt cọc trước khi tải hợp đồng!");
      return;
    }
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfName;
    link.click();
  };

  const handleGoToPayment = () => {
    window.location.href = `/payment/${booking?.bookingID}`;
  };

  return (
    <Card className="custom-contract-card" style={{ border: "none" }}>
      <Card.Header
        className="d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: "#f8f9fa",
          borderBottom: "2px solid #D81C45",
        }}
      >
        <h5 className="mb-0" style={{ color: PRIMARY }}>
          <FontAwesomeIcon icon={faFilePdf} className="me-2" />
          Hợp đồng đặt tiệc
        </h5>
      </Card.Header>

      <Card.Body>
        <Row>
          {/* PDF VIEW */}
          <Col lg={8}>
            <div
              style={{
                height: "600px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <iframe
                src={pdfUrl}
                title="Hợp đồng PDF"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              ></iframe>
            </div>
          </Col>

          {/* ACTION PANEL – đã remove border + shadow */}
          <Col lg={4}>
            <Card
              className="h-100"
              style={{
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            >
              <Card.Body className="d-flex flex-column align-items-center">

                {/* =================== CHƯA ĐẶT CỌC =================== */}
                {!canDownload && (
                  <>
                    <Alert variant="warning" className="w-100 text-center">
                      <strong>Chưa đặt cọc</strong>
                      <br />
                      Bạn cần đặt cọc để tải hợp đồng.
                    </Alert>

                    <Button
                      className="w-100 mb-3 py-3"
                      style={{
                        backgroundColor: PRIMARY,
                        border: "none",
                        borderRadius: "20px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#fff",
                        letterSpacing: "0.3px",
                      }}
                      onClick={handleGoToPayment}
                    >
                      <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                      Đặt cọc ngay
                    </Button>
                  </>
                )}

                {/* =================== ĐÃ ĐẶT CỌC – CÓ THỂ TẢI =================== */}
                {canDownload && (
                  <Button
                    className="w-100 mb-3 py-3"
                    style={{
                      backgroundColor: PRIMARY,
                      border: "none",
                      borderRadius: "20px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#fff",
                      letterSpacing: "0.3px",
                    }}
                    onClick={handleDownload}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Tải xuống hợp đồng
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
