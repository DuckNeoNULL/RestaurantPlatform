import React, { useState } from "react";
import { Modal, Button, Tabs, Tab, Alert } from "react-bootstrap";
import { getPdfViewUrl, getGoogleDocsViewerUrl } from "../utils/cloudinaryHelper";

/**
 * PDF Viewer Component với nhiều options để hiển thị PDF
 */
export default function PdfViewer({ url, show, onHide, title = "Xem tài liệu" }) {
  const [activeTab, setActiveTab] = useState("direct");
  const pdfUrl = getPdfViewUrl(url);
  const googleViewerUrl = getGoogleDocsViewerUrl(url);

  if (!url) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          {/* Tab 1: Direct Link */}
          <Tab eventKey="direct" title="Link trực tiếp">
            <div className="text-center py-4">
              <Alert variant="info" className="mb-3">
                <strong>Mở PDF trong tab mới:</strong>
                <br />
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary mt-2"
                >
                  Mở PDF
                </a>
              </Alert>
              <p className="text-muted small">
                Nếu không mở được, thử các phương án khác bên dưới.
              </p>
            </div>
          </Tab>

          {/* Tab 2: Google Docs Viewer */}
          <Tab eventKey="google" title="Google Viewer">
            <div style={{ minHeight: "500px" }}>
              <iframe
                src={googleViewerUrl}
                width="100%"
                height="500"
                style={{ border: "none", borderRadius: "8px" }}
                title="PDF Viewer"
              />
              <Alert variant="warning" className="mt-2 small">
                Nếu không hiển thị, có thể do Google Docs viewer không hỗ trợ URL này.
                Thử phương án "Link trực tiếp" hoặc "Download".
              </Alert>
            </div>
          </Tab>

          {/* Tab 3: Iframe Direct */}
          <Tab eventKey="iframe" title="Iframe">
            <div style={{ minHeight: "500px" }}>
              <iframe
                src={pdfUrl}
                width="100%"
                height="500"
                style={{ border: "1px solid #dee2e6", borderRadius: "8px" }}
                title="PDF Iframe"
              />
              <Alert variant="warning" className="mt-2 small">
                Nếu không hiển thị, có thể do browser block iframe từ Cloudinary.
                Thử phương án khác.
              </Alert>
            </div>
          </Tab>

          {/* Tab 4: Download */}
          <Tab eventKey="download" title="Tải xuống">
            <div className="text-center py-4">
              <Alert variant="success">
                <strong>Tải file PDF về máy:</strong>
                <br />
                <Button
                  variant="success"
                  className="mt-3"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = pdfUrl;
                    link.download = "license.pdf";
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Tải xuống PDF
                </Button>
              </Alert>
              <p className="text-muted small mt-3">
                Sau khi tải về, bạn có thể mở bằng PDF reader trên máy.
              </p>
            </div>
          </Tab>
        </Tabs>

        {/* URL Info */}
        <div className="mt-3 p-2 bg-light rounded">
          <small className="text-muted">
            <strong>URL:</strong>{" "}
            <code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
              {pdfUrl}
            </code>
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={() => window.open(pdfUrl, "_blank", "noopener,noreferrer")}
        >
          Mở trong tab mới
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

