
interface NewProductTabProps {
  customTitle: string;
  setCustomTitle: (title: string) => void;
}

export function NewProductTab({ customTitle, setCustomTitle }: NewProductTabProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Title
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Enter product title"
        />
      </div>
      
      <p className="text-sm text-gray-500">
        This will create a new product in your Shopify store with this image.
      </p>
    </div>
  );
}
