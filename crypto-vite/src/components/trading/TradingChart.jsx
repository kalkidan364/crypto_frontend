import { useEffect, useRef } from 'react';

const TradingChart = ({ 
  symbol = 'BTCUSDT', 
  interval = '1h', 
  theme = 'dark',
  height = '100%'
}) => {
  const chartContainerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current && !widgetRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          widgetRef.current = new window.TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${symbol}`,
            interval: interval,
            timezone: 'Etc/UTC',
            theme: theme,
            style: '1',
            locale: 'en',
            toolbar_bg: '#0f0f1e',
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            container_id: 'tradingview_chart_container',
            backgroundColor: '#0f0f1e',
            gridColor: '#1a1a2e',
            studies: [
              'Volume@tv-basicstudies',
              'RSI@tv-basicstudies',
              'MACD@tv-basicstudies',
              'BB@tv-basicstudies'
            ],
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            withdateranges: true,
            details: true,
            hotlist: true,
            calendar: false,
            studies_overrides: {
              'volume.volume.color.0': '#ff6b6b',
              'volume.volume.color.1': '#00d4aa',
              'volume.volume.transparency': 80,
            },
            overrides: {
              'paneProperties.background': '#0f0f1e',
              'paneProperties.vertGridProperties.color': '#1a1a2e',
              'paneProperties.horzGridProperties.color': '#1a1a2e',
              'symbolWatermarkProperties.transparency': 90,
              'scalesProperties.textColor': '#8892b0',
              'mainSeriesProperties.candleStyle.upColor': '#00d4aa',
              'mainSeriesProperties.candleStyle.downColor': '#ff6b6b',
              'mainSeriesProperties.candleStyle.borderUpColor': '#00d4aa',
              'mainSeriesProperties.candleStyle.borderDownColor': '#ff6b6b',
              'mainSeriesProperties.candleStyle.wickUpColor': '#00d4aa',
              'mainSeriesProperties.candleStyle.wickDownColor': '#ff6b6b',
            }
          });
        }
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  // Update symbol when it changes
  useEffect(() => {
    if (widgetRef.current && widgetRef.current.chart) {
      widgetRef.current.chart().setSymbol(`BINANCE:${symbol}`, () => {
        console.log('Symbol changed to:', symbol);
      });
    }
  }, [symbol]);

  // Update interval when it changes
  useEffect(() => {
    if (widgetRef.current && widgetRef.current.chart) {
      widgetRef.current.chart().setResolution(interval, () => {
        console.log('Interval changed to:', interval);
      });
    }
  }, [interval]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ height, width: '100%', position: 'relative' }}
    >
      <div 
        id="tradingview_chart_container" 
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default TradingChart;