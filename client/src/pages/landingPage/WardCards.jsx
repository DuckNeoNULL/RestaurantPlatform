import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchWards } from "../../redux/slices/wardSlice"
import { MapPin } from "lucide-react"
import { Container, Row, Col, Card, Spinner } from "react-bootstrap"

const GRADIENTS = [
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-sky-500",
    "from-emerald-500 to-lime-500",
    "from-amber-500 to-orange-500",
    "from-violet-500 to-purple-600",
    "from-teal-500 to-cyan-500",
    "from-fuchsia-500 to-pink-600",
    "from-green-400 to-emerald-500",
    "from-blue-400 to-indigo-500",
    "from-red-400 to-pink-400",
]

export default function WardCards() {
    const dispatch = useDispatch();
    const { list = [], status = 'idle', error = null } = useSelector((state) => state.wards || {});

    useEffect(() => {
        if (status === "idle") dispatch(fetchWards())
    }, [status, dispatch])

    // Debug logs
    useEffect(() => {
        console.log('WardCards - Status:', status);
        console.log('WardCards - List:', list);
        console.log('WardCards - Error:', error);
    }, [status, list, error])

    const handleClick = (slug) => {
        // Navigate đến searchresult với location parameter
        window.location.href = `/searchresult?location=${slug}`
    }

    if (status === "loading") {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="danger" />
            </div>
        )
    }

    if (status === "failed") {
        return (
            <div className="text-center text-danger py-5">
                <p>{error || "Không thể tải danh sách địa điểm"}</p>
            </div>
        )
    }

    if (status === "succeeded" && (!list || list.length === 0)) {
        return (
            <section className="py-5">
                <Container>
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <MapPin size={24} />
                        <h3 className="fw-bold text-danger mb-0">Tìm kiếm theo địa điểm</h3>
                    </div>
                    <div className="text-center text-muted py-5">
                        <p>Chưa có địa điểm nào</p>
                    </div>
                </Container>
            </section>
        )
    }

    return (
        <section className="py-5">
            <Container>
                <div className="d-flex align-items-center gap-2 mb-4">
                    <MapPin size={24} />
                    <h3 className="fw-bold text-danger mb-0">Tìm kiếm theo địa điểm</h3>
                </div>

                <Row className="g-4">
                    {list && list.length > 0 && list.map((ward, index) => {
                        // Sử dụng index để đảm bảo màu sắc nhất quán
                        const colorIndex = index % GRADIENTS.length;
                        const color = GRADIENTS[colorIndex];
                        
                        // Tạo gradient colors từ class name
                        const gradientColors = {
                            "from-pink-500 to-rose-500": { from: "#ec4899", to: "#f43f5e" },
                            "from-indigo-500 to-sky-500": { from: "#6366f1", to: "#0ea5e9" },
                            "from-emerald-500 to-lime-500": { from: "#10b981", to: "#84cc16" },
                            "from-amber-500 to-orange-500": { from: "#f59e0b", to: "#f97316" },
                            "from-violet-500 to-purple-600": { from: "#8b5cf6", to: "#9333ea" },
                            "from-teal-500 to-cyan-500": { from: "#14b8a6", to: "#06b6d4" },
                            "from-fuchsia-500 to-pink-600": { from: "#d946ef", to: "#db2777" },
                            "from-green-400 to-emerald-500": { from: "#4ade80", to: "#10b981" },
                            "from-blue-400 to-indigo-500": { from: "#60a5fa", to: "#6366f1" },
                            "from-red-400 to-pink-400": { from: "#f87171", to: "#f472b6" },
                        };
                        
                        const colors = gradientColors[color] || gradientColors["from-pink-500 to-rose-500"];
                        
                        return (
                            <Col key={ward.slug} xs={12} sm={6} md={4} lg={3}>
                                <Card
                                    onClick={() => handleClick(ward.slug)}
                                    className="border-0 text-white text-center overflow-hidden shadow"
                                    style={{ 
                                        cursor: "pointer",
                                        borderRadius: "1rem",
                                        transition: "transform 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <div
                                        style={{
                                            background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
                                            height: "192px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "1rem"
                                        }}
                                    >
                                        <h5 className="fw-bold mb-1" style={{ color: "white", marginBottom: "0.25rem" }}>
                                            {ward.name}
                                        </h5>
                                        <p className="mb-0 small" style={{ color: "white", fontSize: "0.875rem", margin: 0 }}>
                                            {ward.count} nhà hàng
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            </Container>
        </section>
    )
}