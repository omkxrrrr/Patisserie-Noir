import { motion } from 'framer-motion';

export default function CakeHeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <motion.svg
        viewBox="0 0 360 360"
        className="h-full w-full"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* soft backdrop blob */}
        <ellipse cx="180" cy="190" rx="150" ry="140" fill="#F3E7DA" />

        {/* plate */}
        <ellipse cx="180" cy="300" rx="120" ry="14" fill="#E8DCD0" />

        {/* bottom tier */}
        <rect x="70" y="230" width="220" height="64" rx="14" fill="#8C2F4B" />
        <rect x="70" y="230" width="220" height="14" rx="7" fill="#A8486A" />

        {/* middle tier */}
        <rect x="95" y="172" width="170" height="58" rx="12" fill="#C9952B" />
        <rect x="95" y="172" width="170" height="12" rx="6" fill="#DDB85A" />

        {/* top tier */}
        <rect x="120" y="120" width="120" height="52" rx="10" fill="#FBEEF1" />
        <rect x="120" y="120" width="120" height="10" rx="5" fill="#FFFFFF" />

        {/* drips */}
        <motion.g
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <path d="M120 130 q6 14 0 24 q-6 -10 0 -24" fill="#8C2F4B" />
          <path d="M160 128 q6 16 0 26 q-6 -12 0 -26" fill="#8C2F4B" />
          <path d="M200 130 q6 14 0 24 q-6 -10 0 -24" fill="#8C2F4B" />
          <path d="M235 128 q6 16 0 26 q-6 -12 0 -26" fill="#8C2F4B" />
        </motion.g>

        {/* sprinkles */}
        {[
          [110, 200], [260, 245], [150, 250], [210, 200], [90, 250], [270, 200]
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r="3.5"
            fill={i % 2 === 0 ? '#C9952B' : '#FBEEF1'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.06 }}
          />
        ))}

        {/* candle */}
        <rect x="174" y="92" width="10" height="28" rx="3" fill="#DDB85A" />
        <motion.path
          d="M179 78 C184 84 184 90 179 94 C174 90 174 84 179 78 Z"
          fill="#C9952B"
          style={{ transformOrigin: '179px 94px' }}
          animate={{ scaleY: [1, 0.92, 1.04, 1], rotate: [-2, 2, -1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
}
