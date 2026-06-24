import { motion } from 'framer-motion'

interface ProgressRingProps {
  progress: number
  color: string
  size?: number
  strokeWidth?: number
}

export default function ProgressRing({
  progress,
  color,
  size = 96,
  strokeWidth = 7,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E8E0D5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={false}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </svg>
  )
}
