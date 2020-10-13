module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510871835, function(require, module, exports) {
exports.assert						= require.resolve('assert/');
exports.buffer						= require.resolve('buffer/');
exports.child_process				= null;
exports.cluster						= null;
exports.console						= require.resolve('console-browserify');
exports.constants					= require.resolve('constants-browserify');
exports.crypto						= require.resolve('crypto-browserify');
exports.dgram						= null;
exports.dns							= null;
exports.domain						= require.resolve('domain-browser');
exports.events						= require.resolve('events/');
exports.fs							= null;
exports.http						= require.resolve('stream-http');
exports.https						= require.resolve('https-browserify');
exports.module						= null;
exports.net							= null;
exports.os							= require.resolve('os-browserify/browser.js');
exports.path						= require.resolve('path-browserify');
exports.punycode					= require.resolve('punycode/');
exports.process						= require.resolve('process/browser.js');
exports.querystring					= require.resolve('querystring-es3/');
exports.readline					= null;
exports.repl						= null;
exports.stream						= require.resolve('stream-browserify');
exports._stream_duplex				= require.resolve('readable-stream/duplex.js');
exports._stream_passthrough			= require.resolve('readable-stream/passthrough.js');
exports._stream_readable			= require.resolve('readable-stream/readable.js');
exports._stream_transform			= require.resolve('readable-stream/transform.js');
exports._stream_writable			= require.resolve('readable-stream/writable.js');
exports.string_decoder				= require.resolve('string_decoder/');
exports.sys							= require.resolve('util/util.js');
exports.timers						= require.resolve('timers-browserify');
exports.tls							= null;
exports.tty							= require.resolve('tty-browserify');
exports.url							= require.resolve('url/');
exports.util						= require.resolve('util/util.js');
exports.vm							= require.resolve('vm-browserify');
exports.zlib						= require.resolve('browserify-zlib');

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510871835);
})()
//# sourceMappingURL=index.js.map