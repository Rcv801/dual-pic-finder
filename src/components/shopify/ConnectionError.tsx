
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ConnectionErrorProps {
  error: string | null;
}

const ConnectionError = ({ error }: ConnectionErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="py-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-xs">{error}</AlertDescription>
    </Alert>
  );
};

export default ConnectionError;
