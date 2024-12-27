import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  preview?: string;
}

export const ImageUpload = ({ label, onChange, preview }: ImageUploadProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file || null);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-white">
        {label}
      </label>
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 
                 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      {preview && (
        <img
          src={preview}
          alt="Aperçu de l'image"
          className="mt-2 max-h-48 rounded"
        />
      )}
    </div>
  );
};