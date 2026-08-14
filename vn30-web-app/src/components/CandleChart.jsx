import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { generateCandleData } from '../data/mockVn30';

export default function CandleChart({ symbol = 'FPT', basePrice = 100, timeframe = '1D', height = 450 }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // Adjust granularity simulation based on timeframe
    let numBars = 90;
    if (timeframe === '15M') numBars = 140;
    if (timeframe === '1H') numBars = 110;
    if (timeframe === '1W') numBars = 60;

    const rawData = generateCandleData(basePrice, numBars);
    const initialWidth = container.clientWidth > 0 ? container.clientWidth : 750;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#64748b',
        fontFamily: "'Inter', 'JetBrains Mono', sans-serif",
      },
      grid: {
        vertLines: { color: '#f1f5f9', style: 1 },
        horzLines: { color: '#f1f5f9', style: 1 },
      },
      width: initialWidth,
      height: height,
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
        autoScale: true,
      },
      crosshair: {
        mode: 0,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a', // Emerald 600
      downColor: '#dc2626', // Red 600
      borderVisible: true,
      borderUpColor: '#16a34a',
      borderDownColor: '#dc2626',
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });

    candlestickSeries.setData(rawData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0.0,
      },
    });

    const volumeData = rawData.map(d => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)',
    }));

    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, basePrice, timeframe, height]);

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
}
