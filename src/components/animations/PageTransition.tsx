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
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      >
        <div className="flex gap-4">
          <BallAnimation type="goalball" animation="roll" />
          <BallAnimation type="torball" animation="roll" />
        </div>
      </motion.div>
      {children}
    </motion.div>
  );
};

export default PageTransition;