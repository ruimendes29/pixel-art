import useInput from "../hooks/use-input";
import { field, FieldKey, validateField } from "./validate";

// A form input checked by the shared rule for `key` (fields.json): the same rule
// the backend applies. Gives the input state plus the message and limits to show.
const useField = (key: FieldKey) => {
  const input = useInput((value: unknown) => validateField(key, value) === null);
  const f = field(key);
  return {
    ...input,
    error: validateField(key, input.enteredValue) ?? undefined,
    label: f.label,
    maxLength: f.maxLength,
  };
};

export default useField;
