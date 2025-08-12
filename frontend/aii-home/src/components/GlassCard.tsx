import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`backdrop-blur-2xl bg-gradient-to-br from-blue-200/40 via-purple-200/50 via-blue-200/40 via-cyan-200/50 to-blue-300/40 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl border border-white/30 ${className}`}
  >
    {children}
  </motion.div>
);