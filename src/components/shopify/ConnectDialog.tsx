
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveShopifyCredentials } from "@/services/shopify";
import ConnectionForm from "./ConnectionForm";

interface ConnectDialogProps {
  onConnect: () => void;
}

const ConnectDialog = ({ onConnect }: ConnectDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Store className="h-4 w-4" />
          Connect to Shopify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Shopify</DialogTitle>
          <DialogDescription>
            Enter your Shopify store details to connect
          </DialogDescription>
        </DialogHeader>
        
        <ConnectionForm 
          onConnect={onConnect} 
          onClose={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
