import React from "react";
import { Card } from "react-bootstrap";

const PRIMARY = "#D81C45";

const CountdownTimer = ({ timeLeft }) => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="mb-4 shadow-sm text-center">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-center gap-3">
          <i className="fas fa-clock" style={{ color: PRIMARY }}></i>
          <div>
            <div className="small text-muted">Thời gian còn lại</div>
            <div className="fs-4 fw-semibold">{formatTime(timeLeft)}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CountdownTimer;
