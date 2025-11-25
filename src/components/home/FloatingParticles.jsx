import { motion } from "framer-motion";

const FloatingParticles = ({
  count = 30,
  color = "bg-teal-500 dark:bg-teal-300",
  size = "w-1.5 h-1.5",
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.span
          key={i}
          className={`absolute block rounded-full blur-[1px] opacity-40 ${size} ${color}`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight + 200,
            scale: 0,
          }}
          animate={{
            y: -100,
            opacity: [0, 1, 0],
            scale: 1,
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            repeat: Infinity,
            delay: Math.random(),
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
