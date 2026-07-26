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

    // Ensure width is valid even during fast react mounting/layout transitions
    const initialWidth = container.clientWidth > 0 ? container.clientWidth : 750;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#C3C6D1',
        fontFamily: "'Inter', 'JetBrains Mono', sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(67, 70, 86, 0.25)', style: 1 },
        horzLines: { color: 'rgba(67, 70, 86, 0.25)', style: 1 },
      },
      width: initialWidth,
      height: height,
      timeScale: {
        borderColor: 'rgba(67, 70, 86, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(67, 70, 86, 0.4)',
        autoScale: true,
      },
      crosshair: {
        mode: 0,
      },
    });

    // Chuẩn API v5.x mới của Lightweight Charts: dùng chart.addSeries(CandlestickSeries, options)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E', // Green / Market Up
      downColor: '#EF4444', // Red / Market Down
      borderVisible: true,
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    candlestickSeries.setData(rawData);

    // Chuẩn API v5.x mới cho Volume Overlay: dùng chart.addSeries(HistogramSeries, options)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3B82F6',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // set as overlay on blank price scale ID
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
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
    }));

    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    // ResizeObserver ensures automatic responsiveness when grid layout/modals resize
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
    <div className="w-full relative bg-surface-dim/25 rounded-xl overflow-hidden border border-outline-variant/30 p-1 min-h-[460px]">
      <div ref={chartContainerRef} className="w-full h-full min-h-[450px]" />
      <div className="absolute top-3 left-3 bg-surface-container-high/85 backdrop-blur px-3 py-1.5 rounded-lg border border-outline-variant/40 flex items-center gap-2 pointer-events-none z-10 shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-market-up animate-ping"></span>
        <span className="font-bold text-xs text-primary">{symbol} • {timeframe} • Live TradingView Engine (v5)</span>
      </div>
    </div>
  );
}
