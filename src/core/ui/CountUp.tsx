import { useEffect, useRef, useState } from 'react';
import type { TextProps } from 'react-native';
import { AppText } from './AppText';

type Props = Omit<TextProps, 'children'> & {
  value: number;
  format: (value: number) => string;
  /** How long a change takes to settle. */
  duration?: number;
  variant?: 'display' | 'title' | 'subtitle' | 'body';
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** A number that counts from its last value to the new one (ease-out); prices tick up instead of jumping. */
export function CountUp({ value, format, duration = 600, variant = 'title', ...text }: Props) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value || duration <= 0) {
      from.current = value;
      setShown(value);
      return;
    }
    let frame = 0;
    const began = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - began) / duration);
      const next = start + (value - start) * easeOut(t);
      setShown(next);
      from.current = next;
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <AppText variant={variant} {...text}>
      {format(Math.round(shown))}
    </AppText>
  );
}
