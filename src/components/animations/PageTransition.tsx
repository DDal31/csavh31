import { motion } from "framer-motion";
import { ReactNode } from "react";
import { BallAnimation } from "./BallAnimation";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 3, ease: "easeInOut" }}
      className="relative"
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 3, duration: 0 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      >
        <motion.div 
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 0 }}
        >
          <motion.img
            src="https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/club-logo.png"
            alt="Logo CSAVH31"
            className="w-48 h-48 object-contain"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="flex gap-4">
            <BallAnimation 
              type="goalball" 
              animation="roll" 
            />
            <BallAnimation 
              type="torball" 
              animation="roll" 
            />
          </div>
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  );
};

export default PageTransition;