import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);