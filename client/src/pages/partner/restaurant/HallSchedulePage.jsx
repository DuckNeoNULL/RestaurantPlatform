import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Row, Col, Form } from "react-bootstrap";
import PartnerLayout from "../../../layouts/PartnerLayout";
import { useParams } from "react-router-dom";
import { useHall } from "../../../hooks/useHall";
import useAuth from "../../../hooks/useAuth";
import { useRestaurant } from "../../../hooks/useRestaurant";
import api from "../../../api/axios";

const TIME_SLOTS = [
  { label: "Buổi trưa (10:30 - 14:00)", startTime: "10:30", endTime: "14:00" },
  { label: "Buổi tối (17:30 - 21:00)", startTime: "17:30", endTime: "21:00" },
];

export default function HallSchedulePage() {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const initialFromRoute = useMemo(
    () => Number(paramRestaurantID || paramId) || undefined,
    [paramId, paramRestaurantID]
  );

  const { list: hallsFromHook, loadByRestaurant, status, updateStatus } = useHall();
  const { user } = useAuth();
  const { list: restaurants, status: restaurantsStatus, loadAllPartner } = useRestaurant();

  const [selectedRestaurantID, setSelectedRestaurantID] = useState(initialFromRoute || null);

  const today = new Date().toISOString().slice(0, 10);
  const initialSlot = TIME_SLOTS[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [startTime, setStartTime] = useState(initialSlot.startTime);
  const [endTime, setEndTime] = useState(initialSlot.endTime);
  const [bookings, setBookings] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({}); // { [hallID]: boolean }

  // fetch partner restaurants when user is ready
  useEffect(() => {
    if (!user) return;
    const partnerID = user?.userID || null;
    if (!partnerID) return;
    if (!restaurants || restaurants.length === 0) {
      loadAllPartner(partnerID).catch(() => {});
    }
  }, [user, restaurants, loadAllPartner]);

  // default selected restaurant (route wins, else first in list)
  useEffect(() => {
    if (selectedRestaurantID) return; // already selected (from route or prior)
    if (Array.isArray(restaurants) && restaurants.length > 0) {
      setSelectedRestaurantID(restaurants[0].restaurantID);
    }
  }, [selectedRestaurantID, restaurants]);

  // fetch halls whenever selected restaurant changes
  useEffect(() => {
    if (selectedRestaurantID) {
      loadByRestaurant(selectedRestaurantID).catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("Load halls failed:", e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurantID]);

  const halls = hallsFromHook || [];

  // Fetch availability for current date/time across all halls
  const refreshAvailability = useCallback(async () => {
    if (!selectedDate || !startTime || !endTime || !Array.isArray(halls) || halls.length === 0) {
      setAvailabilityMap({});
      return;
    }
    try {
      const entries = await Promise.all(
        halls.map(async (hall) => {
          try {
            const res = await api.get(`/halls/${hall.hallID}/availability`, {
              params: { date: selectedDate, startTime, endTime },
            });
            const available = !!(res?.data?.available);
            return [hall.hallID, available];
          } catch (e) {
            // On error, assume available to avoid false busy states
            return [hall.hallID, true];
          }
        })
      );
      setAvailabilityMap(Object.fromEntries(entries));
    } catch (_) {
      setAvailabilityMap({});
    }
  }, [halls, selectedDate, startTime, endTime]);

  const [displayHalls, setDisplayHalls] = useState([]);

  const computeOccupied = useCallback(
    (date, sTime, eTime) =>
      halls.map((hall) => {
        // Backend says not available -> occupied
        const notAvailable = availabilityMap[hall.hallID] === false;
        // Local manual booking made in this session (fallback)
        const locallyBlocked = bookings.some(
          (b) =>
            b.hallID === hall.hallID &&
            b.eventDate === date &&
            b.startTime === sTime &&
            b.endTime === eTime &&
            b.status === 1
        );
        const occupied = notAvailable || locallyBlocked;
        return { ...hall, occupied };
      }),
    [halls, bookings, availabilityMap]
  );

  // Init / update display halls when dependencies change
  useEffect(() => {
    setDisplayHalls(computeOccupied(selectedDate, startTime, endTime));
  }, [computeOccupied, selectedDate, startTime, endTime]);

  // Refresh availability whenever halls or filters change
  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  const handleSearch = async () => {
    await refreshAvailability();
    setDisplayHalls(computeOccupied(selectedDate, startTime, endTime));
  };

  const handleSetOccupied = async (hallID) => {
    try {
      // Create manual booking to block the hall slot
      const payload = {
        hallID,
        eventDate: selectedDate,
        startTime,
        endTime,
        tableCount: 1,
        specialRequest: "Manual block via schedule",
      };
      const res = await api.post(`/bookings/manual`, payload);
      const created = res?.data?.data || null;
      const bookingID = created?.bookingID || Date.now();
      const newBooking = {
        bookingID,
        hallID,
        eventDate: selectedDate,
        status: 1, // local flag to mark occupied in this UI
        customerID: null,
        menuID: null,
        startTime,
        endTime,
      };
      setBookings((prev) => [...prev, newBooking]);
      setDisplayHalls((prev) =>
        prev.map((h) => (h.hallID === hallID ? { ...h, occupied: true } : h))
      );
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Không thể đánh dấu bận. Vui lòng thử lại.");
    }
  };

  const handleSetAvailable = (hallID) => {
    setBookings((prev) =>
      prev.filter(
        (b) =>
          !(
            b.hallID === hallID &&
            b.eventDate === selectedDate &&
            b.startTime === startTime &&
            b.endTime === endTime
          )
      )
    );
    setDisplayHalls((prev) =>
      prev.map((h) => (h.hallID === hallID ? { ...h, occupied: false } : h))
    );
  };

  // change timeslot -> update start/end
  const handleSlotChange = (e) => {
    const label = e.target.value;
    const slot = TIME_SLOTS.find((s) => s.label === label);
    if (slot) {
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
    }
  };

  const currentLabel =
    TIME_SLOTS.find((slot) => slot.startTime === startTime && slot.endTime === endTime)
      ?.label || TIME_SLOTS[0].label;

  return (
    <PartnerLayout>
      <div className="p-3">
        <h3>Lịch sử sử dụng sảnh</h3>

        <Row className="mb-3 g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Chọn nhà hàng:</Form.Label>
              <Form.Select
                value={selectedRestaurantID ?? ""}
                onChange={(e) => setSelectedRestaurantID(Number(e.target.value) || null)}
                disabled={restaurantsStatus === 'loading'}
              >
                {Array.isArray(restaurants) && restaurants.length > 0 ? (
                  restaurants.map((r) => (
                    <option key={r.restaurantID} value={r.restaurantID}>
                      {r.name}
                    </option>
                  ))
                ) : (
                  <option value="">{restaurantsStatus === 'loading' ? "Đang tải..." : "Không có nhà hàng"}</option>
                )}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>Chọn ngày:</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Khung giờ</Form.Label>
              <Form.Select value={currentLabel} onChange={handleSlotChange}>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.label} value={slot.label}>
                    {slot.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </Col>
        </Row>

        <Table bordered hover>
          <thead>
            <tr>
              <th>Sảnh</th>
              <th>Đang sử dụng</th>
              <th>Trạng thái hoạt động</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayHalls.map((hall) => (
              <tr key={hall.hallID}>
                <td>{hall.name}</td>
                <td>
                  {hall.occupied ? (
                    <span className="badge bg-danger">Đang sử dụng</span>
                  ) : (
                    <span className="badge bg-success">Sẵn sàng</span>
                  )}
                </td>
                <td>
                  {hall.status ? (
                    <span className="badge bg-success">Hoạt động</span>
                  ) : (
                    <span className="badge bg-secondary">Ngừng</span>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {hall.occupied ? (
                      <Button
                        size="sm"
                        variant="success"
                        className="text-white"
                        onClick={() => handleSetAvailable(hall.hallID)}
                      >
                        Đánh dấu trống
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        className="text-white"
                        onClick={() => handleSetOccupied(hall.hallID)}
                      >
                        Đánh dấu bận
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={hall.status ? "secondary" : "primary"}
                      onClick={() => {
                        const next = !hall.status;
                        updateStatus({ id: hall.hallID, status: next }).catch((e) => {
                          // eslint-disable-next-line no-console
                          console.warn("Toggle hall status failed:", e);
                        });
                      }}
                    >
                      {hall.status ? "Ngừng" : "Kích hoạt"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </PartnerLayout>
  );
}