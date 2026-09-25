import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Brand } from '@/constants/brand';
import { PricePoint } from '@/lib/coingecko';

type Props = { points: PricePoint[]; height?: number };

/**
 * Line chart drawn with SVG: each price becomes a point, and the points
 * are joined into one line. Green if the price went up over the period, red if down.
 */
export function PriceChart({ points, height = 200 }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (points.length < 2 || width === 0) {
    return <View style={[styles.box, { height }]} onLayout={onLayout} />;
  }

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padding = 8;

  // Convert each price into x/y coordinates inside the drawing area
  const coords = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = padding + (1 - (price - min) / range) * (height - 2 * padding);
    return [x, y];
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const color = prices[prices.length - 1] >= prices[0] ? Brand.success : Brand.danger;

  return (
    <View style={[styles.box, { height }]} onLayout={onLayout}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#fill)" />
        <Path d={line} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%' },
});
