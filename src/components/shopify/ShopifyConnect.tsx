import { useState } from "react";
import { hasShopifyCredentials } from "@/services/shopify";
import ConnectDialog from "./ConnectDialog";
import ConnectedStatus from "./ConnectedStatus";

interface ShopifyConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const ShopifyConnect = ({ onConnect, onDisconnect }: ShopifyConnectProps) => {
  const [isConnected, setIsConnected] = useState(hasShopifyCredentials());

  const handleConnect = () => {
    setIsConnected(true);
    if (onConnect) onConnect();
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    if (onDisconnect) onDisconnect();
  };

  return (
    <div>
      {!isConnected ? (
        <ConnectDialog onConnect={handleConnect} />
      ) : (
        <ConnectedStatus onDisconnect={handleDisconnect} />
      )}
    </div>
  );
};

export default ShopifyConnect;
