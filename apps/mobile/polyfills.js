// Polyfill missing Web APIs for Hermes (React Native)
// React Native 0.81+ and various packages reference Web APIs
// that don't exist in the Hermes runtime used by Expo Go.
(function() {
  var g = typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this);

  // Hermes release builds don't have `console` until RN sets it up.
  // Polyfill it early so any module-level code that calls console doesn't crash.
  if (typeof console === 'undefined') {
    var noop = function() {};
    g.console = {
      log: noop, warn: noop, error: noop, info: noop, debug: noop,
      trace: noop, assert: noop, group: noop, groupCollapsed: noop,
      groupEnd: noop, time: noop, timeEnd: noop, timeLog: noop,
      count: noop, countReset: noop, table: noop, dir: noop,
      dirxml: noop, clear: noop,
    };
  }

  // Force light color scheme — userInterfaceStyle in app.json doesn't apply in Expo Go
  try {
    var Appearance = require('react-native').Appearance;
    if (Appearance && Appearance.setColorScheme) {
      Appearance.setColorScheme('light');
    }
  } catch (e) { /* ignore */ }

  // Suppress known Expo Go dev-only warnings that block the UI with LogBox overlays
  var _origError = console.error.bind(console);
  console.error = function() {
    var msg = arguments[0];
    if (typeof msg === 'string' && (
      msg.indexOf('expo-notifications') !== -1 ||
      msg.indexOf('Push notifications') !== -1
    )) return;
    return _origError.apply(console, arguments);
  };

  // Suppress ALL console.warn in dev — prevents LogBox yellow/grey overlay
  // that blocks touch events. Warnings still appear in Metro terminal.
  var _origWarn = console.warn.bind(console);
  console.warn = function() { return; };

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
