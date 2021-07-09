import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

interface FlatpickrProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}

export default function Flatpickr({ value, onChange, id = '' }: FlatpickrProps) {
  const ref = useRef(null);
  const fpRef = useRef(null);
  useEffect(() => {
    fpRef.current = flatpickr(ref.current, {
      defaultDate: value * 1000,
      enableTime: true,
      time_24hr: true,
      disableMobile: true,
      onChange: ([val]) => onChange(Math.floor(val.getTime() / 1000)),
    });
    return () => fpRef.current.destroy();
  }, []);
  useEffect(() => {
    if (!fpRef.current) return;
    fpRef.current.setDate(value * 1000);
  }, [value]);
  return (
    <div id={id} className="row">
      <input className="column" ref={ref} />
      <button
        type="button"
        className="button-clear"
        onClick={() => onChange(Math.floor(Date.now() / 1000))}
      >
        Set to now
      </button>
    </div>
  );
}
Flatpickr.defaultProps = {
  id: '',
};
