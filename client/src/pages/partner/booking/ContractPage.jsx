import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Form, Alert, Spinner } from "react-bootstrap";
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  Send,
  Upload,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PartnerLayout from "../../../layouts/PartnerLayout";

export default function ContractPage() {
  const navigate = useNavigate();
  const { id: bookingID } = useParams(); // Get bookingID from URL params

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmSign, setConfirmSign] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [infoMsg, setInfoMsg] = useState("");
  const [contractHtml, setContractHtml] = useState(null); // Store fetched HTML content for Cloudinary files

  // Helper function to get status text
  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 0:
        return "Chưa ký";
      case 1:
        return "Nhà hàng đã ký";
      case 2:
        return "Khách hàng đã ký";
      case 3:
        return "Đã hủy";
      case 4:
        return "Đã thay thế";
      default:
        return "Chưa ký";
    }
  };

  // Fetch contract data from API
  useEffect(() => {
    const fetchContract = async () => {
      if (!bookingID) {
        setError("Booking ID không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching contract for bookingID:', bookingID);
        
        const response = await fetch(`/api/contracts/booking/${bookingID}`, {
          credentials: "include",
        });
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (!response.ok || !data.success) {
          const errorMsg = data.message || "Không thể tải hợp đồng";
          console.error('❌ API Error:', errorMsg);
          
          // Special handling for 404 - contract not found
          if (response.status === 404) {
            throw new Error(`Hợp đồng chưa được tạo cho booking này. Vui lòng đợi partner chấp nhận booking hoặc tạo contract thủ công qua API test endpoint.`);
          }
          
          throw new Error(errorMsg);
        }

        const contractData = data.contract;
        console.log('📄 Contract data:', contractData);
        console.log('📄 Contract fileOriginalUrl:', contractData.fileOriginalUrl);
        
        // Build full URL for contract file
        let contractUrl = contractData.fileOriginalUrl || contractData.contractUrl;
        if (contractUrl && !contractUrl.startsWith('http')) {
          // If it's a relative path starting with /uploads, add backend URL
          if (contractUrl.startsWith('/uploads')) {
            // Use full URL if needed (for iframe)
            contractUrl = `http://localhost:5000${contractUrl}`;
          }
        }
        
        console.log('🔗 Final contractUrl:', contractUrl);
        
        // Map contract data to component state
        setContract({
          contractID: contractData.contractID,
          bookingID: contractData.bookingID,
          contractName: `Hợp đồng dịch vụ - Booking #${contractData.bookingID}`,
          contractUrl: contractUrl,
          signedOwnerUrl: contractData.filePartnerSignedUrl || null,
          signedByOwner: contractData.filePartnerSignedUrl != null,
          signedByCustomer: contractData.fileCustomerSignedUrl != null,
          createdAt: contractData.createdAt || new Date().toISOString(),
          status: getStatusText(contractData.status),
          statusCode: contractData.status,
        });
        
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [bookingID]);

  // Fetch HTML content for Cloudinary HTML files
  useEffect(() => {
    // Reset HTML content when contract URL changes
    setContractHtml(null);
    
    if (!contract?.contractUrl) return;

    const contractUrl = contract.contractUrl;
    const isCloudinaryHtml = contractUrl && 
      (contractUrl.startsWith('https://res.cloudinary.com') || contractUrl.startsWith('http://res.cloudinary.com')) &&
      (contractUrl.endsWith('.html') || contractUrl.includes('.html'));

    if (isCloudinaryHtml) {
      console.log('☁️ [ContractPage] Fetching HTML content from Cloudinary...');
      fetch(contractUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then(html => {
          setContractHtml(html);
          console.log('✅ [ContractPage] HTML content fetched successfully');
        })
        .catch(err => {
          console.error('❌ [ContractPage] Failed to fetch HTML content:', err);
          // If fetch fails, user can still use "Open original" or "Download" buttons
        });
    }
  }, [contract?.contractUrl]); // Only depend on contract URL

  const formatDate = (s) =>
    new Date(s).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Get iframe src - use direct URL if local, or Google Docs viewer for external
  const getIframeSrc = (url) => {
    if (!url) return null;
    // If it's a local file (starts with /uploads), use directly
    if (url.startsWith("/uploads") || url.startsWith("http://localhost")) {
      // For HTML files, we can embed directly
      if (url.endsWith(".html")) {
        return url;
      }
      // For PDF, use Google Docs viewer or direct embed
      return url;
    }
    // For external URLs, use Google Docs viewer
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  };

  const handleOpenOriginal = () => {
    if (!contract?.contractUrl) {
      console.error('❌ Cannot open: missing contractUrl', contract);
      alert('Không thể mở hợp đồng. Vui lòng thử lại.');
      return;
    }
    
    console.log('🔗 Opening contract URL:', contract.contractUrl);
    
    // Ensure full URL for local files
    let url = contract.contractUrl;
    if (url.startsWith("/uploads")) {
      url = `http://localhost:5000${url}`;
    }
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    if (!contract?.contractID || !contract?.contractUrl) {
      console.error('❌ Cannot download: missing contractID or contractUrl', contract);
      alert('Không thể tải xuống hợp đồng. Vui lòng thử lại.');
      return;
    }
    
    console.log('⬇️ Downloading contract:', contract.contractID);
    
    // If it's a local file, use the download endpoint
    if (contract.contractUrl.startsWith("/uploads") || contract.contractUrl.includes("localhost")) {
      // Use the API endpoint for download
      const downloadUrl = `http://localhost:5000/api/contracts/${contract.contractID}/file?download=true`;
      console.log('🔗 Download URL:', downloadUrl);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } else {
      // For external URLs, open in new tab
      console.log('🔗 External URL:', contract.contractUrl);
      window.open(contract.contractUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleConfirmSigned = () => {
    setConfirmSign(true);
    setInfoMsg("Bạn đã xác nhận đã ký. Hãy chọn file PDF bản đã ký để tải lên.");
    setTimeout(() => setInfoMsg(""), 2500);
  };

  // Khi người dùng chọn file (chưa xác nhận)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setInfoMsg(`Đã chọn file: ${file.name}. Bấm 'Xác nhận tải lên' để hoàn tất.`);
    }
  };

  // Khi người dùng bấm xác nhận tải file đã chọn
  const handleConfirmUpload = () => {
    if (!pendingFile) {
      alert("Vui lòng chọn file trước.");
      return;
    }

    setInfoMsg("Đang tải lên (mock)...");
    setTimeout(() => {
      const fakeUrl =
        "https://res.cloudinary.com/dszkninft/raw/upload/v1759654063/kyhoc8b9x9rfp9vfbrvl.html";
      setContract((prev) => ({
        ...prev,
        signedByOwner: true,
        signedOwnerUrl: fakeUrl,
        status: "Nhà hàng đã ký",
      }));
      setPendingFile(null);
      setConfirmSign(false);
      setInfoMsg("Đã xác nhận tải lên bản hợp đồng đã ký (mock).");
      setTimeout(() => setInfoMsg(""), 2500);
    }, 1200);
  };

  const handleSendToAdmin = () => {
    if (!contract.signedOwnerUrl) {
      alert("Chưa có bản ký — không thể gửi admin.");
      return;
    }
    if (!window.confirm("Gửi hợp đồng này cho admin xác nhận?")) return;
    setContract((prev) => ({ ...prev, status: "Đang chờ admin xác nhận" }));
    alert("Đã gửi admin (mock).");
  };

  if (loading) {
    return (
      <PartnerLayout>
        <div className="p-3 d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang tải hợp đồng...</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  if (error || !contract) {
    return (
      <PartnerLayout>
        <div className="p-3">
          <Button
            variant="primary"
            className="text-decoration-none text-dark mb-3 d-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Quay lại
          </Button>
          <Card className="shadow-sm rounded-4 border-0 p-4">
            <Alert variant="danger">
              <strong>Lỗi:</strong> {error || "Không tìm thấy hợp đồng"}
            </Alert>
          </Card>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="p-3">
        {/* Nút quay lại */}
        <Button
          variant="primary"
          className="text-decoration-none text-dark mb-3 d-flex align-items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Quay lại
        </Button>

        <Card className="shadow-sm rounded-4 border-0 p-4">
          <Row className="mb-3 align-items-center">
            <Col>
              <h4 className="fw-bold text-primary d-flex align-items-center gap-2">
                <FileText size={20} />
                {contract.contractName}
              </h4>
              <div className="text-muted small">
                Ngày tạo: <strong>{formatDate(contract.createdAt)}</strong>
              </div>
            </Col>
          </Row>

          <Row>
            {/* Left: iframe */}
            <Col md={8} className="mb-3">
              <Card className="h-100 border-0 shadow-sm rounded-3">
                <Card.Body className="p-3">
                  <h6 className="text-primary fw-semibold">Nội dung hợp đồng</h6>
                  {contract.contractUrl ? (
                    <div style={{ minHeight: 520 }}>
                      {(() => {
                        const contractUrl = contract.contractUrl;
                        const isCloudinaryUrl = contractUrl.startsWith('https://res.cloudinary.com') || contractUrl.startsWith('http://res.cloudinary.com');
                        const isHtml = contractUrl.endsWith('.html') || contractUrl.includes('.html');
                        
                        console.log('🖼️ Contract URL:', contractUrl);
                        console.log('☁️ Is Cloudinary:', isCloudinaryUrl);
                        console.log('📄 Is HTML:', isHtml);
                        
                        // For Cloudinary HTML files, use fetched HTML content with srcdoc
                        if (isCloudinaryUrl && isHtml) {
                          console.log('☁️ [ContractPage] Rendering Cloudinary HTML file');
                          
                          if (contractHtml) {
                            // HTML content is available, use srcdoc to inject directly
                            return (
                              <iframe
                                title="contract-viewer"
                                srcDoc={contractHtml}
                                width="100%"
                                height="560"
                                style={{ border: "none", borderRadius: 8 }}
                                onLoad={() => console.log('✅ [ContractPage] Iframe loaded with HTML content')}
                                onError={(e) => {
                                  console.error('❌ [ContractPage] Iframe load error:', e);
                                  alert('Không thể tải hợp đồng. Vui lòng sử dụng "Mở hợp đồng gốc" hoặc "Tải xuống".');
                                }}
                              />
                            );
                          } else {
                            // HTML content is still loading
                            return (
                              <div className="d-flex justify-content-center align-items-center" style={{ height: '560px' }}>
                                <div className="text-center">
                                  <Spinner animation="border" variant="primary" />
                                  <p className="mt-3 text-muted">Đang tải nội dung hợp đồng...</p>
                                </div>
                              </div>
                            );
                          }
                        }
                        
                        // For local HTML files
                        if (contractUrl.endsWith(".html")) {
                          let iframeSrc = contractUrl;
                          if (iframeSrc.startsWith("/uploads")) {
                            iframeSrc = `http://localhost:5000${iframeSrc}`;
                          }
                          console.log('🔗 Local HTML URL:', iframeSrc);
                          
                          return (
                            <iframe
                              title="contract-viewer"
                              src={iframeSrc}
                              width="100%"
                              height="560"
                              style={{ border: "none", borderRadius: 8 }}
                              onLoad={() => console.log('✅ Iframe loaded successfully')}
                              onError={(e) => {
                                console.error('❌ Iframe load error:', e);
                                alert('Không thể tải hợp đồng trong iframe. Vui lòng sử dụng "Mở hợp đồng gốc" hoặc "Tải xuống".');
                              }}
                            />
                          );
                        }
                        
                        // For PDF files
                        let iframeSrc = contractUrl;
                        if (iframeSrc.startsWith("/uploads")) {
                          iframeSrc = `http://localhost:5000${iframeSrc}`;
                        }
                        
                        return (
                          <iframe
                            title="contract-viewer"
                            src={getIframeSrc(iframeSrc)}
                            width="100%"
                            height="560"
                            style={{ border: "none", borderRadius: 8 }}
                            onLoad={() => console.log('✅ Iframe loaded successfully')}
                            onError={(e) => {
                              console.error('❌ Iframe load error:', e);
                              alert('Không thể tải hợp đồng trong iframe. Vui lòng sử dụng "Mở hợp đồng gốc" hoặc "Tải xuống".');
                            }}
                          />
                        );
                      })()}
                      <div className="mt-2 text-muted small">
                        Nếu không hiển thị, bấm "Mở hợp đồng gốc" hoặc "Tải xuống".
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted fst-italic">
                      Chưa có file hợp đồng.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Right: hành động */}
            <Col md={4} className="mb-3">
              <Card className="p-3 shadow-sm rounded-3">
                <h6 className="fw-semibold mb-2">Trạng thái & hành động</h6>

                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {contract.signedByOwner ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="red" />
                    )}
                    <div>
                      <div className="small text-muted">Nhà hàng</div>
                      <div className="fw-semibold">
                        {contract.signedByOwner ? "Đã ký" : "Chưa ký"}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {contract.signedByCustomer ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="red" />
                    )}
                    <div>
                      <div className="small text-muted">Khách hàng</div>
                      <div className="fw-semibold">
                        {contract.signedByCustomer ? "Đã ký" : "Chưa ký"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <Button
                    variant="outline-primary"
                    className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleDownload}
                  >
                    <Download size={16} /> Tải xuống hợp đồng
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleOpenOriginal}
                  >
                    <FileText size={16} /> Mở hợp đồng gốc
                  </Button>

                  {/* Bấm xác nhận ký */}
                  {!contract.signedByOwner && !confirmSign && (
                    <Button
                      variant="primary"
                      className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={handleConfirmSigned}
                    >
                      <ClipboardCheck size={16} /> Xác nhận đã ký xong
                    </Button>
                  )}

                  {/* Chọn file & xác nhận upload */}
                  {confirmSign && !contract.signedByOwner && (
                    <>
                      <Form.Group controlId="uploadSignedFile" className="mb-2">
                        <Form.Label className="small text-muted">
                          Tải lên bản PDF đã ký
                        </Form.Label>
                        <Form.Control
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                        />
                      </Form.Group>

                      {pendingFile && (
                        <Button
                          variant="success"
                          className="w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={handleConfirmUpload}
                        >
                          <Upload size={16} /> Xác nhận tải lên
                        </Button>
                      )}
                    </>
                  )}

                  {/* Sau upload */}
                  {contract.signedByOwner && contract.signedOwnerUrl && (
                    <>
                      <Button
                        variant="outline-success"
                        className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                        onClick={() =>
                          window.open(
                            contract.signedOwnerUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <Download size={16} /> Xem bản đã ký
                      </Button>

                      <Button
                        variant="success"
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleSendToAdmin}
                      >
                        <Send size={16} /> Gửi admin xác nhận
                      </Button>
                    </>
                  )}
                </div>

                {infoMsg && (
                  <Alert variant="info" className="py-2 small">
                    {infoMsg}
                  </Alert>
                )}

                <div className="mt-3 small text-muted">
                  Trạng thái hiện tại:{" "}
                  <strong className="ms-1">{contract.status}</strong>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </PartnerLayout>
  );
}