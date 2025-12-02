import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Utensils } from "lucide-react";
import { useSearchForm } from "../../hooks/useSearchForm";
import { useEventType } from "../../hooks/useEventType";

export default function EventTypeSelectHall({ restaurantID }) {
  const { state, setField } = useSearchForm();
  const { loadByRestaurant } = useEventType();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (restaurantID) {
      setLoading(true);
      setError(null);
      loadByRestaurant(restaurantID)
        .then((data) => {
          setEventTypes(data);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [restaurantID, loadByRestaurant]);

  return (
    <div>
      <Form.Label>
        <Utensils className="me-1" style={{ color: '#E11D48'}} size={18}/>
        Loại sự kiện
      </Form.Label>
      <Form.Select
        value={state.eventType ? state.eventType : (eventTypes.length > 0 ? eventTypes[0].eventTypeID : "")}
        onChange={(e) => setField("eventType", e.target.value)}
        className="custom-form-select"
        disabled={loading}
      >
        {loading ? (
          <option>Loading...</option>
        ) : error ? (
          <option>Error loading event types</option>
        ) : (
          eventTypes.map((eventType) => (
            <option key={eventType.eventTypeID} value={eventType.eventTypeID}>
              {eventType.name}
            </option>
          ))
        )}
      </Form.Select>
      {error && <div className="text-danger mt-1">Error: {error}</div>}
    </div>
  );
}
