import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useSearchForm } from "../../hooks/useSearchForm";
import DateInput from "./DateInput";
import EventTypeSelect from "./EventTypeSelectHall";
import TablesSelect from "./TablesSelection";
import { Search } from "lucide-react";
import TimeSelect from "./TimeSelect";
import "../../styles/SearchBarStyles.css"
import { useNavigate } from "react-router-dom";
export default function SearchSectionHall({ noOverlap = false, onSearch, restaurantID }) {
  const { state } = useSearchForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Pass search data to parent
    if (onSearch) {
      onSearch(state);
    }
  };

  return (
    <section style={{
      position: "relative",
      zIndex: 5,
      marginTop: noOverlap ? "20px" : "-70px",
    }}>
      <Container fluid style={{ padding: "0 50px", maxWidth: "1200px" }}>
        <Form onSubmit={handleSubmit} className="bg-white rounded-3 shadow p-4">
          {/* Hàng input */}
          <Row className="g-1 align-items-end">
            <Col xs={12} md={6} lg={3}>
              <EventTypeSelect restaurantID={restaurantID} />
            </Col>

            <Col xs={12} md={6} lg={2}>
              <TablesSelect />
            </Col>

            <Col xs={12} md={6} lg={3}>
              <DateInput />
            </Col>

            <Col xs={12} md={6} lg={3}>
              <TimeSelect />
            </Col>

            {/* Nút Tìm kiếm cùng hàng */}
            <Col xs={12} md={6} lg={1} className="text-center d-flex justify-content-center">
              <Button
                type="submit"
                variant="danger"
                className="px-4 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: "#E11D48" }}
              >
                <Search size={18} color="white" />
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </section>
  );
}