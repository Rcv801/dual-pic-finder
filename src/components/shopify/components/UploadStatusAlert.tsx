
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadStatusAlertProps {
  uploadStatus: {
    success: boolean;
    message: string;
  } | null;
}

export const UploadStatusAlert = ({ uploadStatus }: UploadStatusAlertProps) => {
  if (!uploadStatus) return null;
  
  return (
    <Alert variant={uploadStatus.success ? "default" : "destructive"}>
      <AlertDescription>
        {uploadStatus.message}
      </AlertDescription>
    </Alert>
  );
};
