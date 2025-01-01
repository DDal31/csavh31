import { Facebook, Instagram, Twitter } from "lucide-react";
import { SocialMediaLinks } from "@/types/settings";

interface FooterSocialProps {
  socialMedia: SocialMediaLinks;
}

export const FooterSocial = ({ socialMedia }: FooterSocialProps) => {
  return (
    <div>
      <h4 className="font-semibold text-white mb-4">Suivez-nous</h4>
      <div className="flex space-x-4">
        {socialMedia.twitter.is_active && (
          <a href={socialMedia.twitter.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Twitter size={20} />
          </a>
        )}
        {socialMedia.facebook.is_active && (
          <a href={socialMedia.facebook.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Facebook size={20} />
          </a>
        )}
        {socialMedia.instagram.is_active && (
          <a href={socialMedia.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Instagram size={20} />
          </a>
        )}
      </div>
    </div>
  );
};