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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      >
        <motion.div 
          className="flex gap-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 0 }}
        >
          <BallAnimation 
            type="goalball" 
            animation="roll" 
          />
          <BallAnimation 
            type="torball" 
            animation="roll" 
          />
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  );
};

export default PageTransition;