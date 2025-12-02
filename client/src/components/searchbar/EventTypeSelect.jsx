import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { Utensils } from "lucide-react";
import { useSearchForm } from "../../hooks/useSearchForm";
import { useEventType } from "../../hooks/useEventType";

export default function EventTypeSelect() {
  const { state, setField } = useSearchForm();
  const { items, loadAll, loading, error } = useEventType();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div>
      <Form.Label>
        <Utensils className="me-1" style={{ color: '#E11D48'}} size={18}/>
        Loại sự kiện
      </Form.Label>
      <Form.Select
        value={state.eventType ? state.eventType : (items.length > 0 ? items[0].eventTypeID : "")}
        onChange={(e) => setField("eventType", e.target.value)}
        className="custom-form-select"
        disabled={loading}
      >
        {loading ? (
          <option>Loading...</option>
        ) : (
          items.map((eventType) => (
            <option key={eventType.eventTypeID} value={eventType.eventTypeID}>
              {eventType.name}
            </option>
          ))
        )}
      </Form.Select>
      {error && <div className="text-danger mt-1">Error loading event types</div>}
    </div>
  );
}
