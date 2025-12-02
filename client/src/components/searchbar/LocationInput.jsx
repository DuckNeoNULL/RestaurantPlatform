import React, { useState, useEffect } from "react";
import { Form, ListGroup } from "react-bootstrap";
import { MapPin } from "lucide-react";
import { useSearchForm } from "../../hooks/useSearchForm";
import { useSelector, useDispatch } from "react-redux";
import { fetchWards } from "../../redux/slices/wardSlice";

export default function LocationInput() {
  const { state, setField } = useSearchForm();
  const dispatch = useDispatch();
  const { list: wards = [] } = useSelector((state) => state.wards || {});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load wards từ API khi component mount
  useEffect(() => {
    if (wards.length === 0) {
      dispatch(fetchWards());
    }
  }, [dispatch, wards.length]);

  // Lấy danh sách tên wards từ API
  const LOCATIONS = wards.map(ward => ward.name);

  const filteredLocations = state.location
    ? LOCATIONS.filter((loc) => loc.toLowerCase().includes(state.location.toLowerCase())).slice(0, 8)
    : [];

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredLocations.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredLocations.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          setField("location", filteredLocations[selectedIndex]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="position-relative">
      <Form.Label>
        <MapPin className="me-1" style={{ color: '#E11D48' }} size={18} />
        Địa điểm
      </Form.Label>
      <Form.Control
        type="text"
        placeholder="Nhập địa điểm..."
        value={state.location}
        onChange={(e) => {
          setField("location", e.target.value);
          setSelectedIndex(-1);
          setShowSuggestions(e.target.value.trim().length > 0);
        }}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          if (state.location) setShowSuggestions(true);
        }}
        onBlur={(e) => {
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        className="custom-form-input"
      />
      {showSuggestions && filteredLocations.length > 0 && (
        <ListGroup className="position-absolute w-100 z-50" style={{ maxHeight: 180, overflowY: "auto" }}>
          {filteredLocations.map((loc, i) => (
            <ListGroup.Item
              key={i}
              active={i === selectedIndex}
              action
              onMouseDown={() => {
                setField("location", loc);
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {loc}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
