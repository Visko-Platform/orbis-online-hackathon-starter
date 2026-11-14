function alpha(cutoff: number, seconds: number) {
  const rate = 2 * Math.PI * cutoff * seconds;
  return rate / (1 + rate);
}

// A One Euro filter smooths small movements more than fast intentional motion.
export function motionFilter(minCutoff: number, beta: number) {
  let previous: number[] | undefined;
  let filtered: number[] = [];
  let speed: number[] = [];
  let lastTime = 0;
  return (values: number[], time: number) => {
    const seconds = (time - lastTime) / 1000;
    lastTime = time;
    if (!previous || seconds <= 0 || seconds > 0.25) {
      previous = values;
      filtered = values.slice();
      speed = values.map(() => 0);
      return filtered;
    }
    const last = previous;
    const derivativeAlpha = alpha(1, seconds);
    for (let i = 0; i < values.length; i++) {
      const derivative = (values[i] - last[i]) / seconds;
      speed[i] += derivativeAlpha * (derivative - speed[i]);
      const weight = alpha(minCutoff + beta * Math.abs(speed[i]), seconds);
      filtered[i] += weight * (values[i] - filtered[i]);
    }
    previous = values;
    return filtered;
  };
}
