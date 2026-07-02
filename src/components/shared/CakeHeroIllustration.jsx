import { motion } from 'framer-motion';

const spring = (delay, extra = {}) => ({
  type: 'spring', stiffness: 180, damping: 14, delay, ...extra
});

const DRIPS = [
  { x: 120, len: 26 }, { x: 148, len: 34 }, { x: 180, len: 22 },
  { x: 210, len: 32 }, { x: 240, len: 24 }
];

// Alternates between sprinkle dot, tiny star, and berry dot for visual variety.
const DECOR = [
  { cx: 108, cy: 205, kind: 'dot', color: '#C9952B' },
  { cx: 258, cy: 248, kind: 'dot', color: '#8C2F4B' },
  { cx: 150, cy: 254, kind: 'star', color: '#FBEEF1' },
  { cx: 212, cy: 203, kind: 'dot', color: '#DDB85A' },
  { cx: 88, cy: 252, kind: 'star', color: '#C9952B' },
  { cx: 272, cy: 202, kind: 'dot', color: '#8C2F4B' },
  { cx: 135, cy: 210, kind: 'dot', color: '#FBEEF1' },
  { cx: 228, cy: 256, kind: 'star', color: '#DDB85A' }
];

function Star({ cx, cy, color }) {
  return (
    <path
      d={`M${cx} ${cy - 5} L${cx + 1.4} ${cy - 1.4} L${cx + 5} ${cy} L${cx + 1.4} ${cy + 1.4} L${cx} ${cy + 5} L${cx - 1.4} ${cy + 1.4} L${cx - 5} ${cy} L${cx - 1.4} ${cy - 1.4} Z`}
      fill={color}
    />
  );
}

export default function CakeHeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-md">
      <motion.svg
        viewBox="0 0 360 360"
        className="h-full w-full overflow-visible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* soft backdrop blob */}
        <motion.ellipse
          cx="180" cy="190" rx="150" ry="140" fill="#F3E7DA"
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* plate */}
        <motion.ellipse
          cx="180" cy="300" rx="120" ry="14" fill="#E8DCD0"
          initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }}
          style={{ transformOrigin: '180px 300px' }}
          transition={{ duration: 0.45, delay: 0.05 }}
        />

        {/* bottom tier — flies in from the left */}
        <motion.g
          initial={{ x: -260, opacity: 0, rotate: -8 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={spring(0.15)}
        >
          <rect x="70" y="230" width="220" height="64" rx="14" fill="#8C2F4B" />
          <rect x="70" y="230" width="220" height="14" rx="7" fill="#A8486A" />
        </motion.g>

        {/* middle tier — flies in from the right */}
        <motion.g
          initial={{ x: 260, opacity: 0, rotate: 8 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={spring(0.38)}
        >
          <rect x="95" y="172" width="170" height="58" rx="12" fill="#C9952B" />
          <rect x="95" y="172" width="170" height="12" rx="6" fill="#DDB85A" />
        </motion.g>

        {/* top tier — drops in from above */}
        <motion.g
          initial={{ y: -240, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={spring(0.62, { damping: 11 })}
        >
          <rect x="120" y="120" width="120" height="52" rx="10" fill="#FBEEF1" />
        </motion.g>

        {/* cream cap — poured across the top, spreads outward */}
        <motion.rect
          x="120" y="120" width="120" height="10" rx="5" fill="#FFFFFF"
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
          style={{ transformOrigin: '180px 125px' }}
          transition={{ duration: 0.5, delay: 0.95, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* drips — flow down one after another */}
        {DRIPS.map((d, i) => (
          <motion.path
            key={d.x}
            d={`M${d.x} 130 q6 ${d.len / 2} 0 ${d.len} q-6 ${-d.len / 2 + 4} 0 -${d.len}`}
            fill="#8C2F4B"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            style={{ transformOrigin: `${d.x}px 130px` }}
            transition={{ duration: 0.45, delay: 1.15 + i * 0.09, ease: [0.34, 1.2, 0.64, 1] }}
          />
        ))}

        {/* decorations — appear one by one, tossed on with a little spring */}
        {DECOR.map((d, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: -18, scale: 0, rotate: -25 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={spring(1.65 + i * 0.11, { damping: 10 })}
          >
            {d.kind === 'star' ? <Star cx={d.cx} cy={d.cy} color={d.color} /> : <circle cx={d.cx} cy={d.cy} r="3.5" fill={d.color} />}
          </motion.g>
        ))}

        {/* candle — placed last */}
        <motion.g
          initial={{ y: -60, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={spring(2.6, { damping: 9 })}
        >
          <rect x="174" y="92" width="10" height="28" rx="3" fill="#DDB85A" />
          <motion.path
            d="M179 78 C184 84 184 90 179 94 C174 90 174 84 179 78 Z"
            fill="#C9952B"
            style={{ transformOrigin: '179px 94px' }}
            animate={{ scaleY: [1, 0.92, 1.04, 1], rotate: [-2, 2, -1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
        </motion.g>

        {/* ambient floating sparkles for a little extra magic */}
        {[{ x: 70, y: 100 }, { x: 292, y: 150 }].map((p, i) => (
          <motion.g
            key={`sparkle-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [p.y, p.y - 14, p.y - 14, p.y - 22] }}
            transition={{ duration: 3, repeat: Infinity, delay: 3.1 + i * 0.6, ease: 'easeInOut' }}
          >
            <Star cx={p.x} cy={p.y} color="#DDB85A" />
          </motion.g>
        ))}
      </motion.svg>
    </div>
  );
}
