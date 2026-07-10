const CX = 220;
const CY = 230;
const R_OUT = 170;
const R_IN = 115;
const R_OUT_KEYSTONE = 188;
const PIER_BASE_Y = 300;
const SEGMENTS = 5;
const KEYSTONE_INDEX = 2;
const ANGLE_STEP = 180 / SEGMENTS;

// Matches the path in public/brand/keystone-icon-navy.svg (viewBox 0 0 200 190).
const LOGO_PATH =
  "M30,20 L170,20 Q180,20 177.9,29.8 L150.1,160.2 Q148,170 138,170 L62,170 Q52,170 49.9,160.2 L22.1,29.8 Q20,20 30,20 Z";

function polar(r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function wedgePath(rOuter: number, rInner: number, phi1: number, phi2: number) {
  const o1 = polar(rOuter, phi1);
  const o2 = polar(rOuter, phi2);
  const i2 = polar(rInner, phi2);
  const i1 = polar(rInner, phi1);
  return [
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 0 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

const voussoirs = Array.from({ length: SEGMENTS }, (_, i) => {
  const phi1 = 180 + i * ANGLE_STEP;
  const phi2 = 180 + (i + 1) * ANGLE_STEP;
  const isKeystone = i === KEYSTONE_INDEX;
  return {
    index: i,
    isKeystone,
    d: wedgePath(isKeystone ? R_OUT_KEYSTONE : R_OUT, R_IN, phi1, phi2),
  };
});

const leftPier = `M ${CX - R_OUT} ${CY} L ${CX - R_IN} ${CY} L ${CX - R_IN} ${PIER_BASE_Y} L ${CX - R_OUT} ${PIER_BASE_Y} Z`;
const rightPier = `M ${CX + R_IN} ${CY} L ${CX + R_OUT} ${CY} L ${CX + R_OUT} ${PIER_BASE_Y} L ${CX + R_IN} ${PIER_BASE_Y} Z`;

// The resting/final state: the real logo mark, large and centered. Also what
// reduced-motion users see immediately, since it's the plain SVG attribute.
const LOGO_FINAL_TRANSFORM = "translate(80, 17) scale(1.4)";

export function ArchDiagram() {
  return (
    <svg
      viewBox="0 0 440 320"
      role="img"
      aria-label="Keystone Systems mark, formed by the keystone locking an arch"
      className="h-auto w-full max-w-md"
    >
      <path d={leftPier} className="arch-piece" fill="none" stroke="var(--color-blueprint-navy)" strokeWidth="1.5" />
      <path d={rightPier} className="arch-piece" fill="none" stroke="var(--color-blueprint-navy)" strokeWidth="1.5" />

      {voussoirs.map((v) =>
        v.isKeystone ? null : (
          <path
            key={v.index}
            className="arch-piece"
            style={{
              animationDelay: `${(v.index < KEYSTONE_INDEX ? v.index : SEGMENTS - 1 - v.index) * 120}ms`,
            }}
            d={v.d}
            fill="var(--color-off-white)"
            stroke="var(--color-blueprint-navy)"
            strokeWidth="1.5"
          />
        ),
      )}

      {voussoirs
        .filter((v) => v.isKeystone)
        .map((v) => (
          <path
            key={v.index}
            className="arch-keystone-wedge"
            d={v.d}
            fill="var(--color-technical-blue)"
            stroke="var(--color-blueprint-navy)"
            strokeWidth="1.5"
          />
        ))}

      <path
        className="arch-logo-reveal"
        d={LOGO_PATH}
        transform={LOGO_FINAL_TRANSFORM}
        fill="var(--color-blueprint-navy)"
      />
    </svg>
  );
}
