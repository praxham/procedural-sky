import { useMemo } from "react";

const CloudSheet = ({
  cloudDensity,
  timeOfDay,
}: {
  cloudDensity: number;
  timeOfDay: number;
}) => {
  const isSunsetOrSunrise =
    (timeOfDay >= 6 && timeOfDay <= 9) || (timeOfDay >= 18 && timeOfDay <= 20);

  const memoizeShadows = useMemo(() => {
    const safeDensity = Math.min(cloudDensity, 30);
    return boxShadows(safeDensity, isSunsetOrSunrise);
  }, [cloudDensity, isSunsetOrSunrise]);
  return (
    <div className="bg-transparent absolute w-screen h-screen z-30">
      <svg width="0" height="0" className="absolute">
        <filter id="filter" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".01"
            numOctaves="10"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="180" />
        </filter>
      </svg>
      <div
        className="fixed -top-1 -left-1 w-1 h-1 bg-white rounded-full shadow-[400px_1000px_60px_150px_#fff] filter-[url(#filter)]"
        style={{
          boxShadow: memoizeShadows,
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
};

export default CloudSheet;

const rn = (from: number, to: number) => {
  return ~~(Math.random() * (to - from + 1)) + from;
};

const rs = (...args: string[]) => {
  return args[rn(1, args.length) - 1];
};

const boxShadows = (max: number, isSunsetOrSunrise: boolean) => {
  let ret = [];
  for (let i = 0; i < max; ++i) {
    ret.push(`
      ${rn(1, 100)}vw ${rn(1, 100)}vh ${rn(20, 40)}vmin ${rn(1, 20)}vmin
      ${isSunsetOrSunrise ? rs("#0385FF", "#53ACFF", "#CCE6FF") : rs("#0385FF00", "#53ACFF", "#CCE6FF", "#FFFFFF")}
    `);
  }
  return ret.join(",");
};
