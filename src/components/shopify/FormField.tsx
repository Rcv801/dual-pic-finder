
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
  helpText: ReactNode;
}

const FormField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  helpText,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <div className="text-xs text-gray-500 space-y-1">{helpText}</div>
    </div>
  );
};

export default FormField;
