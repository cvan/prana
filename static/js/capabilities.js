var p = {};
p.capabilities = {
    'JSON': window.JSON && typeof JSON.parse == 'function',
    'debug': (('' + document.location).indexOf('dbg') >= 0),
    'debug_in_page': (('' + document.location).indexOf('dbginpage') >= 0),
    'console': window.console && (typeof window.console.log == 'function'),
    'replaceState': typeof history.replaceState === 'function',
    'chromeless': window.locationbar && !window.locationbar.visible,
    'localStorage': false,
    'sessionStorage': false,
    'webApps': !!(navigator.mozApps && navigator.mozApps.install),
    'app_runtime': !!(
        navigator.mozApps &&
        typeof navigator.mozApps.html5Implementation === 'undefined'
    ),
    'fileAPI': !!window.FileReader,
    'desktop': window.matchMedia('(max-width: 1024px)').matches,
    'tablet': window.matchMedia('(max-width: 672px)').matches,
    'mobile': window.matchMedia('(max-width: 600px)').matches,
    'touch': ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    'nativeScroll': (function() {
        return 'WebkitOverflowScrolling' in document.createElement('div').style;
    })(),
    'performance': !!(window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance)
};

try {
    if ('localStorage' in window && window['localStorage'] !== null) {
        p.capabilities.localStorage = true;
    }
} catch (e) {
}

try {
    if ('sessionStorage' in window && window['sessionStorage'] !== null) {
        p.capabilities.sessionStorage = true;
    }
} catch (e) {
}
