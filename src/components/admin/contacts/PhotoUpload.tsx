import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";

interface PhotoUploadProps {
  onChange: (file: File | null) => void;
}

const PhotoUpload = ({ onChange }: PhotoUploadProps) => {
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onChange(file || null);
  };

  return (
    <div>
      <FormLabel className="text-white block mb-2">Photo</FormLabel>
      <Input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
    </div>
  );
};

export default PhotoUpload;