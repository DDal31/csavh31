import { useState } from "react";
import { CLUB_LOGO_URL, FALLBACK_LOGO_URL } from "@/config/logo";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className = "", alt = "Logo du club" }: LogoProps) => {
  const [currentSrc, setCurrentSrc] = useState(CLUB_LOGO_URL);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.log("Error loading logo from:", currentSrc);
    if (currentSrc !== FALLBACK_LOGO_URL) {
      console.log("Switching to fallback logo");
      setCurrentSrc(FALLBACK_LOGO_URL);
      setHasError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
};