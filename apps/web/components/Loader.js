'use client';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
      style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(97,234,188,.7)', margin: '2rem auto' }} />
  );
}
