import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  format as formatDate,
  isValid as isValidDate,
  parse as parseDate
} from "date-fns";
import FocusTrap from "focus-trap-react";
import useOutsideClicks from "hooks/useOutsideClick";
import { ChangeEventHandler, useCallback, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import { DayPicker } from "react-day-picker";
import { usePopper } from "react-popper";

interface DatePickerDialogProps {
  selected: Date | undefined;
  setSelected: (selected: Date | undefined) => void;
  dateFormat: string;
}

const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  selected,
  setSelected,
  dateFormat
}) => {
  const [isPopperOpen, setIsPopperOpen] = useState(false);

  const initialInputValue = selected ? formatDate(selected, dateFormat) : "";
  const [inputValue, setInputValue] = useState<string>(initialInputValue);

  const outerRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const popper = usePopper(popperRef.current, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8]
        }
      }
    ]
  });

  const closePopper = useCallback(() => {
    if (isPopperOpen) {
      setIsPopperOpen(false);
      buttonRef?.current?.focus();
    }
  }, [isPopperOpen, buttonRef]);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setInputValue(e.currentTarget.value);
      const date = parseDate(e.currentTarget.value, dateFormat, new Date());
      if (isValidDate(date)) {
        setSelected(date);
      } else {
        setSelected(undefined);
      }
    },
    [dateFormat, setSelected]
  );

  const handleButtonClick = useCallback(() => {
    setIsPopperOpen((val) => !val);
  }, []);

  const handleDaySelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      setInputValue(formatDate(date, dateFormat));
      closePopper();
    } else {
      setInputValue("");
    }
  };

  useOutsideClicks(closePopper, outerRef);

  return (
    <div ref={outerRef}>
      <div ref={popperRef} className="d-flex align-items-center">
        <InputGroup>
          <FormControl
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button
            ref={buttonRef}
            type="button"
            aria-label="Pick a date"
            onClick={handleButtonClick}
            variant="outline-secondary"
          >
            <FontAwesomeIcon icon="calendar" />
          </Button>
        </InputGroup>
      </div>
      {isPopperOpen && (
        <FocusTrap
          active={true}
          focusTrapOptions={{
            initialFocus: false,
            allowOutsideClick: true
          }}
        >
          <div
            tabIndex={-1}
            style={{
              ...popper.styles.popper,
              zIndex: 99,
              backgroundColor: "white",
              border: "1px solid gray",
              boxShadow: "4px 4px 4px 2px #888"
            }}
            className="dialog-sheet"
            {...popper.attributes.popper}
            ref={setPopperElement}
            role="dialog"
          >
            <DayPicker
              initialFocus={isPopperOpen}
              mode="single"
              selected={selected}
              onSelect={handleDaySelect}
            />
          </div>
        </FocusTrap>
      )}
    </div>
  );
};

export default DatePickerDialog;
