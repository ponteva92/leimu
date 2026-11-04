import Image from "next/image";
import { CANDLE_FRAMING } from "./candleFraming";

const viewHeight = 2 * CANDLE_FRAMING.cameraZ * Math.tan(CANDLE_FRAMING.fov * Math.PI / 360);

export function CandleFallback() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Image
        src="/images/hero-candle-black.webp"
        alt=""
        width={864}
        height={1184}
        priority
        unoptimized
        className="absolute left-1/2 w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
        style={{
          top: `${50 - CANDLE_FRAMING.centreY / viewHeight * 100}%`,
          height: `${CANDLE_FRAMING.height / viewHeight * 100}%`,
        }}
      />
    </div>
  );
}
