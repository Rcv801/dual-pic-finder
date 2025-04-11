
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
  helpText: ReactNode;
  isPassword?: boolean;
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
  isPassword = false,
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword && !showPassword ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={isPassword ? "pr-10" : ""}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
      <div className="text-xs text-gray-500 space-y-1">{helpText}</div>
    </div>
  );
};

export default FormField;
