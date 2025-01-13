import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  className?: string;
}

export function TypewriterText({ text, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText("");
    
    let currentIndex = 0;
    // Calculate typing speed based on text length to complete in 3 seconds
    const typingSpeed = Math.max(5, (3000 / text.length));
    
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={className}
      >
        {displayedText}
        {isTyping && <span className="animate-pulse">|</span>}
      </motion.div>
    </AnimatePresence>
  );
}