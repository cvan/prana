/**
 * storage.js - Simple namespaced browser storage.
 *
 * Creates a window.Storage function that gives you an easy API to access
 * localStorage, with fallback to cookie storage. Each Storage object is
 * namespaced:
 *
 *   var foo = Storage('foo'),
 *       bar = Storage('bar');
 *   foo.set('test', 'A');
 *   bar.set('test', 'B');
 *   foo.get('test');    // 'A'
 *   bar.remove('test');
 *   foo.get('test');    // still 'A'
 *
 */
window.Storage = (function() {
    if (!p.capabilities.localStorage) {
        throw 'localStorage required';
    }
    return function(namespace) {
        namespace = namespace ? namespace + '-' : '';
        return {
            get: function(key) {
                return localStorage.getItem(namespace + key);
            },
            set: function(key, value) {
                return localStorage.setItem(namespace + key, value);
            },
            remove: function(key) {
                return localStorage.removeItem(namespace + key);
            }
        };
    };
})();
