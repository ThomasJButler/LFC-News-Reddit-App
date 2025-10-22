/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Web Vitals performance monitoring integration for Core Web Vitals metrics.
 */

/**
 * @param {Function} [onPerfEntry] - Callback to receive performance metrics
 */
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
