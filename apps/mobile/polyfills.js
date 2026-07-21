// Polyfill missing Web APIs for Hermes (React Native)
// React Native 0.81+ and various packages reference Web APIs
// that don't exist in the Hermes runtime used by Expo Go.
(function() {
  var g = typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this);

  // Suppress known Expo Go dev-only warnings that can't be dismissed
  var _origError = console.error.bind(console);
  console.error = function() {
    var msg = arguments[0];
    if (typeof msg === 'string' && (
      msg.indexOf('expo-notifications') !== -1 ||
      msg.indexOf('Push notifications') !== -1
    )) return;
    return _origError.apply(console, arguments);
  };

  // DOMException
  if (!g.DOMException) {
    function DOMExceptionImpl(message, name) {
      this.message = message || '';
      this.name = name || 'Error';
      this.code = 0;
    }
    DOMExceptionImpl.prototype = new Error();
    DOMExceptionImpl.prototype.constructor = DOMExceptionImpl;
    g.DOMException = DOMExceptionImpl;
  }

  // Performance API stubs
  if (!g.PerformanceEntry) {
    function PerformanceEntryImpl(init) {
      this.name = (init && init.name) || '';
      this.entryType = (init && init.entryType) || '';
      this.startTime = (init && init.startTime) || 0;
      this.duration = (init && init.duration) || 0;
    }
    g.PerformanceEntry = PerformanceEntryImpl;
  }

  if (!g.PerformanceMark) {
    function PerformanceMarkImpl(name, options) {
      this.name = name || '';
      this.entryType = 'mark';
      this.startTime = (options && options.startTime) || 0;
      this.duration = 0;
      this.detail = (options && options.detail) || null;
    }
    PerformanceMarkImpl.prototype = new (g.PerformanceEntry)();
    g.PerformanceMark = PerformanceMarkImpl;
  }

  if (!g.PerformanceMeasure) {
    function PerformanceMeasureImpl(name, options) {
      this.name = name || '';
      this.entryType = 'measure';
      this.startTime = (options && options.startTime) || 0;
      this.duration = (options && options.duration) || 0;
      this.detail = (options && options.detail) || null;
    }
    PerformanceMeasureImpl.prototype = new (g.PerformanceEntry)();
    g.PerformanceMeasure = PerformanceMeasureImpl;
  }

  if (!g.PerformanceObserver) {
    function PerformanceObserverImpl() {}
    PerformanceObserverImpl.prototype.observe = function() {};
    PerformanceObserverImpl.prototype.disconnect = function() {};
    PerformanceObserverImpl.prototype.takeRecords = function() { return []; };
    PerformanceObserverImpl.supportedEntryTypes = [];
    g.PerformanceObserver = PerformanceObserverImpl;
  }

  if (!g.PerformanceObserverEntryList) {
    function PerformanceObserverEntryListImpl() {}
    PerformanceObserverEntryListImpl.prototype.getEntries = function() { return []; };
    PerformanceObserverEntryListImpl.prototype.getEntriesByType = function() { return []; };
    PerformanceObserverEntryListImpl.prototype.getEntriesByName = function() { return []; };
    g.PerformanceObserverEntryList = PerformanceObserverEntryListImpl;
  }
})();
