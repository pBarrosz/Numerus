// zigzag n mark — tapered tail, triangle head
type Props = { size?: number; fill?: string; stroke?: number };

export default function Mark({ size = 40, fill = "var(--nm-green)", stroke = 6 }: Props) {
  return (
    <svg aria-hidden="true" viewBox="0 4 124 108" width={size} height={(size * 108) / 124}>
      <polygon
        points="119.7,50.3 120,12 84.8,27 95.6,34.2 71.5,70.4 41.3,32.2 4,106 42.7,59.8 72.5,97.6 108.9,43.1"
        fill={fill}
        stroke="var(--nm-black)"
        strokeWidth={stroke}
        strokeLinejoin="miter"
      />
    </svg>
  );
}
