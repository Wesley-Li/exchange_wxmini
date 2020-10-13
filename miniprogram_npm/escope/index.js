module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510871638, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ScopeManager = exports.Scope = exports.Variable = exports.Reference = exports.version = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                    Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                    Copyright (C) 2013 Alex Seville <hi@alexanderseville.com>
                                                                                                                                                                                                                                                    Copyright (C) 2014 Thiago de Arruda <tpadilha84@gmail.com>
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                    Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                    modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                      * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                        notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                      * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                        notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                        documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                  */

/**
 * Escope (<a href="http://github.com/estools/escope">escope</a>) is an <a
 * href="http://www.ecma-international.org/publications/standards/Ecma-262.htm">ECMAScript</a>
 * scope analyzer extracted from the <a
 * href="http://github.com/estools/esmangle">esmangle project</a/>.
 * <p>
 * <em>escope</em> finds lexical scopes in a source program, i.e. areas of that
 * program where different occurrences of the same identifier refer to the same
 * variable. With each scope the contained variables are collected, and each
 * identifier reference in code is linked to its corresponding variable (if
 * possible).
 * <p>
 * <em>escope</em> works on a syntax tree of the parsed source code which has
 * to adhere to the <a
 * href="https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API">
 * Mozilla Parser API</a>. E.g. <a href="http://esprima.org">esprima</a> is a parser
 * that produces such syntax trees.
 * <p>
 * The main interface is the {@link analyze} function.
 * @module escope
 */

/*jslint bitwise:true */

exports.analyze = analyze;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _scopeManager = require('./scope-manager');

var _scopeManager2 = _interopRequireDefault(_scopeManager);

var _referencer = require('./referencer');

var _referencer2 = _interopRequireDefault(_referencer);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _variable = require('./variable');

var _variable2 = _interopRequireDefault(_variable);

var _scope = require('./scope');

var _scope2 = _interopRequireDefault(_scope);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultOptions() {
    return {
        optimistic: false,
        directive: false,
        nodejsScope: false,
        impliedStrict: false,
        sourceType: 'script', // one of ['script', 'module']
        ecmaVersion: 5,
        childVisitorKeys: null,
        fallback: 'iteration'
    };
}

function updateDeeply(target, override) {
    var key, val;

    function isHashObject(target) {
        return (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Object && !(target instanceof Array) && !(target instanceof RegExp);
    }

    for (key in override) {
        if (override.hasOwnProperty(key)) {
            val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) {
                    updateDeeply(target[key], val);
                } else {
                    target[key] = updateDeeply({}, val);
                }
            } else {
                target[key] = val;
            }
        }
    }
    return target;
}

/**
 * Main interface function. Takes an Esprima syntax tree and returns the
 * analyzed scopes.
 * @function analyze
 * @param {esprima.Tree} tree
 * @param {Object} providedOptions - Options that tailor the scope analysis
 * @param {boolean} [providedOptions.optimistic=false] - the optimistic flag
 * @param {boolean} [providedOptions.directive=false]- the directive flag
 * @param {boolean} [providedOptions.ignoreEval=false]- whether to check 'eval()' calls
 * @param {boolean} [providedOptions.nodejsScope=false]- whether the whole
 * script is executed under node.js environment. When enabled, escope adds
 * a function scope immediately following the global scope.
 * @param {boolean} [providedOptions.impliedStrict=false]- implied strict mode
 * (if ecmaVersion >= 5).
 * @param {string} [providedOptions.sourceType='script']- the source type of the script. one of 'script' and 'module'
 * @param {number} [providedOptions.ecmaVersion=5]- which ECMAScript version is considered
 * @param {Object} [providedOptions.childVisitorKeys=null] - Additional known visitor keys. See [esrecurse](https://github.com/estools/esrecurse)'s the `childVisitorKeys` option.
 * @param {string} [providedOptions.fallback='iteration'] - A kind of the fallback in order to encounter with unknown node. See [esrecurse](https://github.com/estools/esrecurse)'s the `fallback` option.
 * @return {ScopeManager}
 */
function analyze(tree, providedOptions) {
    var scopeManager, referencer, options;

    options = updateDeeply(defaultOptions(), providedOptions);

    scopeManager = new _scopeManager2.default(options);

    referencer = new _referencer2.default(options, scopeManager);
    referencer.visit(tree);

    (0, _assert2.default)(scopeManager.__currentScope === null, 'currentScope should be null.');

    return scopeManager;
}

exports.
/** @name module:escope.version */
version = _package.version;
exports.
/** @name module:escope.Reference */
Reference = _reference2.default;
exports.
/** @name module:escope.Variable */
Variable = _variable2.default;
exports.
/** @name module:escope.Scope */
Scope = _scope2.default;
exports.
/** @name module:escope.ScopeManager */
ScopeManager = _scopeManager2.default;

/* vim: set sw=4 ts=4 et tw=80 : */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQW9IZ0I7O0FBbEVoQjs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBLFNBQVMsY0FBVCxHQUEwQjtBQUN0QixXQUFPO0FBQ0gsb0JBQVksS0FBWjtBQUNBLG1CQUFXLEtBQVg7QUFDQSxxQkFBYSxLQUFiO0FBQ0EsdUJBQWUsS0FBZjtBQUNBLG9CQUFZLFFBQVo7QUFDQSxxQkFBYSxDQUFiO0FBQ0EsMEJBQWtCLElBQWxCO0FBQ0Esa0JBQVUsV0FBVjtLQVJKLENBRHNCO0NBQTFCOztBQWFBLFNBQVMsWUFBVCxDQUFzQixNQUF0QixFQUE4QixRQUE5QixFQUF3QztBQUNwQyxRQUFJLEdBQUosRUFBUyxHQUFULENBRG9DOztBQUdwQyxhQUFTLFlBQVQsQ0FBc0IsTUFBdEIsRUFBOEI7QUFDMUIsZUFBTyxRQUFPLHVEQUFQLEtBQWtCLFFBQWxCLElBQThCLGtCQUFrQixNQUFsQixJQUE0QixFQUFFLGtCQUFrQixLQUFsQixDQUFGLElBQThCLEVBQUUsa0JBQWtCLE1BQWxCLENBQUYsQ0FEckU7S0FBOUI7O0FBSUEsU0FBSyxHQUFMLElBQVksUUFBWixFQUFzQjtBQUNsQixZQUFJLFNBQVMsY0FBVCxDQUF3QixHQUF4QixDQUFKLEVBQWtDO0FBQzlCLGtCQUFNLFNBQVMsR0FBVCxDQUFOLENBRDhCO0FBRTlCLGdCQUFJLGFBQWEsR0FBYixDQUFKLEVBQXVCO0FBQ25CLG9CQUFJLGFBQWEsT0FBTyxHQUFQLENBQWIsQ0FBSixFQUErQjtBQUMzQixpQ0FBYSxPQUFPLEdBQVAsQ0FBYixFQUEwQixHQUExQixFQUQyQjtpQkFBL0IsTUFFTztBQUNILDJCQUFPLEdBQVAsSUFBYyxhQUFhLEVBQWIsRUFBaUIsR0FBakIsQ0FBZCxDQURHO2lCQUZQO2FBREosTUFNTztBQUNILHVCQUFPLEdBQVAsSUFBYyxHQUFkLENBREc7YUFOUDtTQUZKO0tBREo7QUFjQSxXQUFPLE1BQVAsQ0FyQm9DO0NBQXhDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNENPLFNBQVMsT0FBVCxDQUFpQixJQUFqQixFQUF1QixlQUF2QixFQUF3QztBQUMzQyxRQUFJLFlBQUosRUFBa0IsVUFBbEIsRUFBOEIsT0FBOUIsQ0FEMkM7O0FBRzNDLGNBQVUsYUFBYSxnQkFBYixFQUErQixlQUEvQixDQUFWLENBSDJDOztBQUszQyxtQkFBZSwyQkFBaUIsT0FBakIsQ0FBZixDQUwyQzs7QUFPM0MsaUJBQWEseUJBQWUsT0FBZixFQUF3QixZQUF4QixDQUFiLENBUDJDO0FBUTNDLGVBQVcsS0FBWCxDQUFpQixJQUFqQixFQVIyQzs7QUFVM0MsMEJBQU8sYUFBYSxjQUFiLEtBQWdDLElBQWhDLEVBQXNDLDhCQUE3QyxFQVYyQzs7QUFZM0MsV0FBTyxZQUFQLENBWjJDO0NBQXhDOzs7O0FBaUJIOzs7QUFFQTs7O0FBRUE7OztBQUVBOzs7QUFFQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gIENvcHlyaWdodCAoQykgMjAxMi0yMDE0IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cbiAgQ29weXJpZ2h0IChDKSAyMDEzIEFsZXggU2V2aWxsZSA8aGlAYWxleGFuZGVyc2V2aWxsZS5jb20+XG4gIENvcHlyaWdodCAoQykgMjAxNCBUaGlhZ28gZGUgQXJydWRhIDx0cGFkaWxoYTg0QGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG4vKipcbiAqIEVzY29wZSAoPGEgaHJlZj1cImh0dHA6Ly9naXRodWIuY29tL2VzdG9vbHMvZXNjb3BlXCI+ZXNjb3BlPC9hPikgaXMgYW4gPGFcbiAqIGhyZWY9XCJodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvcHVibGljYXRpb25zL3N0YW5kYXJkcy9FY21hLTI2Mi5odG1cIj5FQ01BU2NyaXB0PC9hPlxuICogc2NvcGUgYW5hbHl6ZXIgZXh0cmFjdGVkIGZyb20gdGhlIDxhXG4gKiBocmVmPVwiaHR0cDovL2dpdGh1Yi5jb20vZXN0b29scy9lc21hbmdsZVwiPmVzbWFuZ2xlIHByb2plY3Q8L2EvPi5cbiAqIDxwPlxuICogPGVtPmVzY29wZTwvZW0+IGZpbmRzIGxleGljYWwgc2NvcGVzIGluIGEgc291cmNlIHByb2dyYW0sIGkuZS4gYXJlYXMgb2YgdGhhdFxuICogcHJvZ3JhbSB3aGVyZSBkaWZmZXJlbnQgb2NjdXJyZW5jZXMgb2YgdGhlIHNhbWUgaWRlbnRpZmllciByZWZlciB0byB0aGUgc2FtZVxuICogdmFyaWFibGUuIFdpdGggZWFjaCBzY29wZSB0aGUgY29udGFpbmVkIHZhcmlhYmxlcyBhcmUgY29sbGVjdGVkLCBhbmQgZWFjaFxuICogaWRlbnRpZmllciByZWZlcmVuY2UgaW4gY29kZSBpcyBsaW5rZWQgdG8gaXRzIGNvcnJlc3BvbmRpbmcgdmFyaWFibGUgKGlmXG4gKiBwb3NzaWJsZSkuXG4gKiA8cD5cbiAqIDxlbT5lc2NvcGU8L2VtPiB3b3JrcyBvbiBhIHN5bnRheCB0cmVlIG9mIHRoZSBwYXJzZWQgc291cmNlIGNvZGUgd2hpY2ggaGFzXG4gKiB0byBhZGhlcmUgdG8gdGhlIDxhXG4gKiBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9TcGlkZXJNb25rZXkvUGFyc2VyX0FQSVwiPlxuICogTW96aWxsYSBQYXJzZXIgQVBJPC9hPi4gRS5nLiA8YSBocmVmPVwiaHR0cDovL2VzcHJpbWEub3JnXCI+ZXNwcmltYTwvYT4gaXMgYSBwYXJzZXJcbiAqIHRoYXQgcHJvZHVjZXMgc3VjaCBzeW50YXggdHJlZXMuXG4gKiA8cD5cbiAqIFRoZSBtYWluIGludGVyZmFjZSBpcyB0aGUge0BsaW5rIGFuYWx5emV9IGZ1bmN0aW9uLlxuICogQG1vZHVsZSBlc2NvcGVcbiAqL1xuXG4vKmpzbGludCBiaXR3aXNlOnRydWUgKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgU2NvcGVNYW5hZ2VyIGZyb20gJy4vc2NvcGUtbWFuYWdlcic7XG5pbXBvcnQgUmVmZXJlbmNlciBmcm9tICcuL3JlZmVyZW5jZXInO1xuaW1wb3J0IFJlZmVyZW5jZSBmcm9tICcuL3JlZmVyZW5jZSc7XG5pbXBvcnQgVmFyaWFibGUgZnJvbSAnLi92YXJpYWJsZSc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9zY29wZSc7XG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuZnVuY3Rpb24gZGVmYXVsdE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb3B0aW1pc3RpYzogZmFsc2UsXG4gICAgICAgIGRpcmVjdGl2ZTogZmFsc2UsXG4gICAgICAgIG5vZGVqc1Njb3BlOiBmYWxzZSxcbiAgICAgICAgaW1wbGllZFN0cmljdDogZmFsc2UsXG4gICAgICAgIHNvdXJjZVR5cGU6ICdzY3JpcHQnLCAgLy8gb25lIG9mIFsnc2NyaXB0JywgJ21vZHVsZSddXG4gICAgICAgIGVjbWFWZXJzaW9uOiA1LFxuICAgICAgICBjaGlsZFZpc2l0b3JLZXlzOiBudWxsLFxuICAgICAgICBmYWxsYmFjazogJ2l0ZXJhdGlvbidcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVEZWVwbHkodGFyZ2V0LCBvdmVycmlkZSkge1xuICAgIHZhciBrZXksIHZhbDtcblxuICAgIGZ1bmN0aW9uIGlzSGFzaE9iamVjdCh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCBpbnN0YW5jZW9mIE9iamVjdCAmJiAhKHRhcmdldCBpbnN0YW5jZW9mIEFycmF5KSAmJiAhKHRhcmdldCBpbnN0YW5jZW9mIFJlZ0V4cCk7XG4gICAgfVxuXG4gICAgZm9yIChrZXkgaW4gb3ZlcnJpZGUpIHtcbiAgICAgICAgaWYgKG92ZXJyaWRlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHZhbCA9IG92ZXJyaWRlW2tleV07XG4gICAgICAgICAgICBpZiAoaXNIYXNoT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNIYXNoT2JqZWN0KHRhcmdldFtrZXldKSkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVEZWVwbHkodGFyZ2V0W2tleV0sIHZhbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB1cGRhdGVEZWVwbHkoe30sIHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vKipcbiAqIE1haW4gaW50ZXJmYWNlIGZ1bmN0aW9uLiBUYWtlcyBhbiBFc3ByaW1hIHN5bnRheCB0cmVlIGFuZCByZXR1cm5zIHRoZVxuICogYW5hbHl6ZWQgc2NvcGVzLlxuICogQGZ1bmN0aW9uIGFuYWx5emVcbiAqIEBwYXJhbSB7ZXNwcmltYS5UcmVlfSB0cmVlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdmlkZWRPcHRpb25zIC0gT3B0aW9ucyB0aGF0IHRhaWxvciB0aGUgc2NvcGUgYW5hbHlzaXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Byb3ZpZGVkT3B0aW9ucy5vcHRpbWlzdGljPWZhbHNlXSAtIHRoZSBvcHRpbWlzdGljIGZsYWdcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Byb3ZpZGVkT3B0aW9ucy5kaXJlY3RpdmU9ZmFsc2VdLSB0aGUgZGlyZWN0aXZlIGZsYWdcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Byb3ZpZGVkT3B0aW9ucy5pZ25vcmVFdmFsPWZhbHNlXS0gd2hldGhlciB0byBjaGVjayAnZXZhbCgpJyBjYWxsc1xuICogQHBhcmFtIHtib29sZWFufSBbcHJvdmlkZWRPcHRpb25zLm5vZGVqc1Njb3BlPWZhbHNlXS0gd2hldGhlciB0aGUgd2hvbGVcbiAqIHNjcmlwdCBpcyBleGVjdXRlZCB1bmRlciBub2RlLmpzIGVudmlyb25tZW50LiBXaGVuIGVuYWJsZWQsIGVzY29wZSBhZGRzXG4gKiBhIGZ1bmN0aW9uIHNjb3BlIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgZ2xvYmFsIHNjb3BlLlxuICogQHBhcmFtIHtib29sZWFufSBbcHJvdmlkZWRPcHRpb25zLmltcGxpZWRTdHJpY3Q9ZmFsc2VdLSBpbXBsaWVkIHN0cmljdCBtb2RlXG4gKiAoaWYgZWNtYVZlcnNpb24gPj0gNSkuXG4gKiBAcGFyYW0ge3N0cmluZ30gW3Byb3ZpZGVkT3B0aW9ucy5zb3VyY2VUeXBlPSdzY3JpcHQnXS0gdGhlIHNvdXJjZSB0eXBlIG9mIHRoZSBzY3JpcHQuIG9uZSBvZiAnc2NyaXB0JyBhbmQgJ21vZHVsZSdcbiAqIEBwYXJhbSB7bnVtYmVyfSBbcHJvdmlkZWRPcHRpb25zLmVjbWFWZXJzaW9uPTVdLSB3aGljaCBFQ01BU2NyaXB0IHZlcnNpb24gaXMgY29uc2lkZXJlZFxuICogQHBhcmFtIHtPYmplY3R9IFtwcm92aWRlZE9wdGlvbnMuY2hpbGRWaXNpdG9yS2V5cz1udWxsXSAtIEFkZGl0aW9uYWwga25vd24gdmlzaXRvciBrZXlzLiBTZWUgW2VzcmVjdXJzZV0oaHR0cHM6Ly9naXRodWIuY29tL2VzdG9vbHMvZXNyZWN1cnNlKSdzIHRoZSBgY2hpbGRWaXNpdG9yS2V5c2Agb3B0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IFtwcm92aWRlZE9wdGlvbnMuZmFsbGJhY2s9J2l0ZXJhdGlvbiddIC0gQSBraW5kIG9mIHRoZSBmYWxsYmFjayBpbiBvcmRlciB0byBlbmNvdW50ZXIgd2l0aCB1bmtub3duIG5vZGUuIFNlZSBbZXNyZWN1cnNlXShodHRwczovL2dpdGh1Yi5jb20vZXN0b29scy9lc3JlY3Vyc2UpJ3MgdGhlIGBmYWxsYmFja2Agb3B0aW9uLlxuICogQHJldHVybiB7U2NvcGVNYW5hZ2VyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZSh0cmVlLCBwcm92aWRlZE9wdGlvbnMpIHtcbiAgICB2YXIgc2NvcGVNYW5hZ2VyLCByZWZlcmVuY2VyLCBvcHRpb25zO1xuXG4gICAgb3B0aW9ucyA9IHVwZGF0ZURlZXBseShkZWZhdWx0T3B0aW9ucygpLCBwcm92aWRlZE9wdGlvbnMpO1xuXG4gICAgc2NvcGVNYW5hZ2VyID0gbmV3IFNjb3BlTWFuYWdlcihvcHRpb25zKTtcblxuICAgIHJlZmVyZW5jZXIgPSBuZXcgUmVmZXJlbmNlcihvcHRpb25zLCBzY29wZU1hbmFnZXIpO1xuICAgIHJlZmVyZW5jZXIudmlzaXQodHJlZSk7XG5cbiAgICBhc3NlcnQoc2NvcGVNYW5hZ2VyLl9fY3VycmVudFNjb3BlID09PSBudWxsLCAnY3VycmVudFNjb3BlIHNob3VsZCBiZSBudWxsLicpO1xuXG4gICAgcmV0dXJuIHNjb3BlTWFuYWdlcjtcbn1cblxuZXhwb3J0IHtcbiAgICAvKiogQG5hbWUgbW9kdWxlOmVzY29wZS52ZXJzaW9uICovXG4gICAgdmVyc2lvbixcbiAgICAvKiogQG5hbWUgbW9kdWxlOmVzY29wZS5SZWZlcmVuY2UgKi9cbiAgICBSZWZlcmVuY2UsXG4gICAgLyoqIEBuYW1lIG1vZHVsZTplc2NvcGUuVmFyaWFibGUgKi9cbiAgICBWYXJpYWJsZSxcbiAgICAvKiogQG5hbWUgbW9kdWxlOmVzY29wZS5TY29wZSAqL1xuICAgIFNjb3BlLFxuICAgIC8qKiBAbmFtZSBtb2R1bGU6ZXNjb3BlLlNjb3BlTWFuYWdlciAqL1xuICAgIFNjb3BlTWFuYWdlclxufTtcblxuXG4vKiB2aW06IHNldCBzdz00IHRzPTQgZXQgdHc9ODAgOiAqL1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

}, function(modId) {var map = {"./scope-manager":1602510871639,"./referencer":1602510871644,"./reference":1602510871641,"./variable":1602510871642,"./scope":1602510871640,"../package.json":1602510871646}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871639, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _es6WeakMap = require('es6-weak-map');

var _es6WeakMap2 = _interopRequireDefault(_es6WeakMap);

var _scope = require('./scope');

var _scope2 = _interopRequireDefault(_scope);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class ScopeManager
 */

var ScopeManager = function () {
    function ScopeManager(options) {
        _classCallCheck(this, ScopeManager);

        this.scopes = [];
        this.globalScope = null;
        this.__nodeToScope = new _es6WeakMap2.default();
        this.__currentScope = null;
        this.__options = options;
        this.__declaredVariables = new _es6WeakMap2.default();
    }

    _createClass(ScopeManager, [{
        key: '__useDirective',
        value: function __useDirective() {
            return this.__options.directive;
        }
    }, {
        key: '__isOptimistic',
        value: function __isOptimistic() {
            return this.__options.optimistic;
        }
    }, {
        key: '__ignoreEval',
        value: function __ignoreEval() {
            return this.__options.ignoreEval;
        }
    }, {
        key: '__isNodejsScope',
        value: function __isNodejsScope() {
            return this.__options.nodejsScope;
        }
    }, {
        key: 'isModule',
        value: function isModule() {
            return this.__options.sourceType === 'module';
        }
    }, {
        key: 'isImpliedStrict',
        value: function isImpliedStrict() {
            return this.__options.impliedStrict;
        }
    }, {
        key: 'isStrictModeSupported',
        value: function isStrictModeSupported() {
            return this.__options.ecmaVersion >= 5;
        }

        // Returns appropriate scope for this node.

    }, {
        key: '__get',
        value: function __get(node) {
            return this.__nodeToScope.get(node);
        }

        /**
         * Get variables that are declared by the node.
         *
         * "are declared by the node" means the node is same as `Variable.defs[].node` or `Variable.defs[].parent`.
         * If the node declares nothing, this method returns an empty array.
         * CAUTION: This API is experimental. See https://github.com/estools/escope/pull/69 for more details.
         *
         * @param {Esprima.Node} node - a node to get.
         * @returns {Variable[]} variables that declared by the node.
         */

    }, {
        key: 'getDeclaredVariables',
        value: function getDeclaredVariables(node) {
            return this.__declaredVariables.get(node) || [];
        }

        /**
         * acquire scope from node.
         * @method ScopeManager#acquire
         * @param {Esprima.Node} node - node for the acquired scope.
         * @param {boolean=} inner - look up the most inner scope, default value is false.
         * @return {Scope?}
         */

    }, {
        key: 'acquire',
        value: function acquire(node, inner) {
            var scopes, scope, i, iz;

            function predicate(scope) {
                if (scope.type === 'function' && scope.functionExpressionScope) {
                    return false;
                }
                if (scope.type === 'TDZ') {
                    return false;
                }
                return true;
            }

            scopes = this.__get(node);
            if (!scopes || scopes.length === 0) {
                return null;
            }

            // Heuristic selection from all scopes.
            // If you would like to get all scopes, please use ScopeManager#acquireAll.
            if (scopes.length === 1) {
                return scopes[0];
            }

            if (inner) {
                for (i = scopes.length - 1; i >= 0; --i) {
                    scope = scopes[i];
                    if (predicate(scope)) {
                        return scope;
                    }
                }
            } else {
                for (i = 0, iz = scopes.length; i < iz; ++i) {
                    scope = scopes[i];
                    if (predicate(scope)) {
                        return scope;
                    }
                }
            }

            return null;
        }

        /**
         * acquire all scopes from node.
         * @method ScopeManager#acquireAll
         * @param {Esprima.Node} node - node for the acquired scope.
         * @return {Scope[]?}
         */

    }, {
        key: 'acquireAll',
        value: function acquireAll(node) {
            return this.__get(node);
        }

        /**
         * release the node.
         * @method ScopeManager#release
         * @param {Esprima.Node} node - releasing node.
         * @param {boolean=} inner - look up the most inner scope, default value is false.
         * @return {Scope?} upper scope for the node.
         */

    }, {
        key: 'release',
        value: function release(node, inner) {
            var scopes, scope;
            scopes = this.__get(node);
            if (scopes && scopes.length) {
                scope = scopes[0].upper;
                if (!scope) {
                    return null;
                }
                return this.acquire(scope.block, inner);
            }
            return null;
        }
    }, {
        key: 'attach',
        value: function attach() {}
    }, {
        key: 'detach',
        value: function detach() {}
    }, {
        key: '__nestScope',
        value: function __nestScope(scope) {
            if (scope instanceof _scope.GlobalScope) {
                (0, _assert2.default)(this.__currentScope === null);
                this.globalScope = scope;
            }
            this.__currentScope = scope;
            return scope;
        }
    }, {
        key: '__nestGlobalScope',
        value: function __nestGlobalScope(node) {
            return this.__nestScope(new _scope.GlobalScope(this, node));
        }
    }, {
        key: '__nestBlockScope',
        value: function __nestBlockScope(node, isMethodDefinition) {
            return this.__nestScope(new _scope.BlockScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestFunctionScope',
        value: function __nestFunctionScope(node, isMethodDefinition) {
            return this.__nestScope(new _scope.FunctionScope(this, this.__currentScope, node, isMethodDefinition));
        }
    }, {
        key: '__nestForScope',
        value: function __nestForScope(node) {
            return this.__nestScope(new _scope.ForScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestCatchScope',
        value: function __nestCatchScope(node) {
            return this.__nestScope(new _scope.CatchScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestWithScope',
        value: function __nestWithScope(node) {
            return this.__nestScope(new _scope.WithScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestClassScope',
        value: function __nestClassScope(node) {
            return this.__nestScope(new _scope.ClassScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestSwitchScope',
        value: function __nestSwitchScope(node) {
            return this.__nestScope(new _scope.SwitchScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestModuleScope',
        value: function __nestModuleScope(node) {
            return this.__nestScope(new _scope.ModuleScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestTDZScope',
        value: function __nestTDZScope(node) {
            return this.__nestScope(new _scope.TDZScope(this, this.__currentScope, node));
        }
    }, {
        key: '__nestFunctionExpressionNameScope',
        value: function __nestFunctionExpressionNameScope(node) {
            return this.__nestScope(new _scope.FunctionExpressionNameScope(this, this.__currentScope, node));
        }
    }, {
        key: '__isES6',
        value: function __isES6() {
            return this.__options.ecmaVersion >= 6;
        }
    }]);

    return ScopeManager;
}();

/* vim: set sw=4 ts=4 et tw=80 : */


exports.default = ScopeManager;
//# sourceMappingURL=data:application/json;base64,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b3VyY2VzQ29udGVudCI6WyIvKlxuICBDb3B5cmlnaHQgKEMpIDIwMTUgWXVzdWtlIFN1enVraSA8dXRhdGFuZS50ZWFAZ21haWwuY29tPlxuXG4gIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4gICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiXG4gIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0VcbiAgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIDxDT1BZUklHSFQgSE9MREVSPiBCRSBMSUFCTEUgRk9SIEFOWVxuICBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuICAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gIExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORFxuICBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0ZcbiAgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiovXG5cbmltcG9ydCBXZWFrTWFwIGZyb20gJ2VzNi13ZWFrLW1hcCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9zY29wZSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7XG4gICAgR2xvYmFsU2NvcGUsXG4gICAgQ2F0Y2hTY29wZSxcbiAgICBXaXRoU2NvcGUsXG4gICAgTW9kdWxlU2NvcGUsXG4gICAgQ2xhc3NTY29wZSxcbiAgICBTd2l0Y2hTY29wZSxcbiAgICBGdW5jdGlvblNjb3BlLFxuICAgIEZvclNjb3BlLFxuICAgIFREWlNjb3BlLFxuICAgIEZ1bmN0aW9uRXhwcmVzc2lvbk5hbWVTY29wZSxcbiAgICBCbG9ja1Njb3BlXG59IGZyb20gJy4vc2NvcGUnO1xuXG4vKipcbiAqIEBjbGFzcyBTY29wZU1hbmFnZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcGVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc2NvcGVzID0gW107XG4gICAgICAgIHRoaXMuZ2xvYmFsU2NvcGUgPSBudWxsO1xuICAgICAgICB0aGlzLl9fbm9kZVRvU2NvcGUgPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzLl9fY3VycmVudFNjb3BlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fX29wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9fZGVjbGFyZWRWYXJpYWJsZXMgPSBuZXcgV2Vha01hcCgpO1xuICAgIH1cblxuICAgIF9fdXNlRGlyZWN0aXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX29wdGlvbnMuZGlyZWN0aXZlO1xuICAgIH1cblxuICAgIF9faXNPcHRpbWlzdGljKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX29wdGlvbnMub3B0aW1pc3RpYztcbiAgICB9XG5cbiAgICBfX2lnbm9yZUV2YWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fb3B0aW9ucy5pZ25vcmVFdmFsO1xuICAgIH1cblxuICAgIF9faXNOb2RlanNTY29wZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19vcHRpb25zLm5vZGVqc1Njb3BlO1xuICAgIH1cblxuICAgIGlzTW9kdWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX29wdGlvbnMuc291cmNlVHlwZSA9PT0gJ21vZHVsZSc7XG4gICAgfVxuXG4gICAgaXNJbXBsaWVkU3RyaWN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX29wdGlvbnMuaW1wbGllZFN0cmljdDtcbiAgICB9XG5cbiAgICBpc1N0cmljdE1vZGVTdXBwb3J0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fb3B0aW9ucy5lY21hVmVyc2lvbiA+PSA1O1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgYXBwcm9wcmlhdGUgc2NvcGUgZm9yIHRoaXMgbm9kZS5cbiAgICBfX2dldChub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbm9kZVRvU2NvcGUuZ2V0KG5vZGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB2YXJpYWJsZXMgdGhhdCBhcmUgZGVjbGFyZWQgYnkgdGhlIG5vZGUuXG4gICAgICpcbiAgICAgKiBcImFyZSBkZWNsYXJlZCBieSB0aGUgbm9kZVwiIG1lYW5zIHRoZSBub2RlIGlzIHNhbWUgYXMgYFZhcmlhYmxlLmRlZnNbXS5ub2RlYCBvciBgVmFyaWFibGUuZGVmc1tdLnBhcmVudGAuXG4gICAgICogSWYgdGhlIG5vZGUgZGVjbGFyZXMgbm90aGluZywgdGhpcyBtZXRob2QgcmV0dXJucyBhbiBlbXB0eSBhcnJheS5cbiAgICAgKiBDQVVUSU9OOiBUaGlzIEFQSSBpcyBleHBlcmltZW50YWwuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZXN0b29scy9lc2NvcGUvcHVsbC82OSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFc3ByaW1hLk5vZGV9IG5vZGUgLSBhIG5vZGUgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIHtWYXJpYWJsZVtdfSB2YXJpYWJsZXMgdGhhdCBkZWNsYXJlZCBieSB0aGUgbm9kZS5cbiAgICAgKi9cbiAgICBnZXREZWNsYXJlZFZhcmlhYmxlcyhub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZGVjbGFyZWRWYXJpYWJsZXMuZ2V0KG5vZGUpIHx8IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGFjcXVpcmUgc2NvcGUgZnJvbSBub2RlLlxuICAgICAqIEBtZXRob2QgU2NvcGVNYW5hZ2VyI2FjcXVpcmVcbiAgICAgKiBAcGFyYW0ge0VzcHJpbWEuTm9kZX0gbm9kZSAtIG5vZGUgZm9yIHRoZSBhY3F1aXJlZCBzY29wZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBpbm5lciAtIGxvb2sgdXAgdGhlIG1vc3QgaW5uZXIgc2NvcGUsIGRlZmF1bHQgdmFsdWUgaXMgZmFsc2UuXG4gICAgICogQHJldHVybiB7U2NvcGU/fVxuICAgICAqL1xuICAgIGFjcXVpcmUobm9kZSwgaW5uZXIpIHtcbiAgICAgICAgdmFyIHNjb3Blcywgc2NvcGUsIGksIGl6O1xuXG4gICAgICAgIGZ1bmN0aW9uIHByZWRpY2F0ZShzY29wZSkge1xuICAgICAgICAgICAgaWYgKHNjb3BlLnR5cGUgPT09ICdmdW5jdGlvbicgJiYgc2NvcGUuZnVuY3Rpb25FeHByZXNzaW9uU2NvcGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2NvcGUudHlwZSA9PT0gJ1REWicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlcyA9IHRoaXMuX19nZXQobm9kZSk7XG4gICAgICAgIGlmICghc2NvcGVzIHx8IHNjb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGV1cmlzdGljIHNlbGVjdGlvbiBmcm9tIGFsbCBzY29wZXMuXG4gICAgICAgIC8vIElmIHlvdSB3b3VsZCBsaWtlIHRvIGdldCBhbGwgc2NvcGVzLCBwbGVhc2UgdXNlIFNjb3BlTWFuYWdlciNhY3F1aXJlQWxsLlxuICAgICAgICBpZiAoc2NvcGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3Blc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbm5lcikge1xuICAgICAgICAgICAgZm9yIChpID0gc2NvcGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUgPSBzY29wZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShzY29wZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGl6ID0gc2NvcGVzLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgICAgICBzY29wZSA9IHNjb3Blc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlKHNjb3BlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogYWNxdWlyZSBhbGwgc2NvcGVzIGZyb20gbm9kZS5cbiAgICAgKiBAbWV0aG9kIFNjb3BlTWFuYWdlciNhY3F1aXJlQWxsXG4gICAgICogQHBhcmFtIHtFc3ByaW1hLk5vZGV9IG5vZGUgLSBub2RlIGZvciB0aGUgYWNxdWlyZWQgc2NvcGUuXG4gICAgICogQHJldHVybiB7U2NvcGVbXT99XG4gICAgICovXG4gICAgYWNxdWlyZUFsbChub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZ2V0KG5vZGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJlbGVhc2UgdGhlIG5vZGUuXG4gICAgICogQG1ldGhvZCBTY29wZU1hbmFnZXIjcmVsZWFzZVxuICAgICAqIEBwYXJhbSB7RXNwcmltYS5Ob2RlfSBub2RlIC0gcmVsZWFzaW5nIG5vZGUuXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gaW5uZXIgLSBsb29rIHVwIHRoZSBtb3N0IGlubmVyIHNjb3BlLCBkZWZhdWx0IHZhbHVlIGlzIGZhbHNlLlxuICAgICAqIEByZXR1cm4ge1Njb3BlP30gdXBwZXIgc2NvcGUgZm9yIHRoZSBub2RlLlxuICAgICAqL1xuICAgIHJlbGVhc2Uobm9kZSwgaW5uZXIpIHtcbiAgICAgICAgdmFyIHNjb3Blcywgc2NvcGU7XG4gICAgICAgIHNjb3BlcyA9IHRoaXMuX19nZXQobm9kZSk7XG4gICAgICAgIGlmIChzY29wZXMgJiYgc2NvcGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc2NvcGUgPSBzY29wZXNbMF0udXBwZXI7XG4gICAgICAgICAgICBpZiAoIXNjb3BlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3F1aXJlKHNjb3BlLmJsb2NrLCBpbm5lcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgYXR0YWNoKCkgeyB9XG5cbiAgICBkZXRhY2goKSB7IH1cblxuICAgIF9fbmVzdFNjb3BlKHNjb3BlKSB7XG4gICAgICAgIGlmIChzY29wZSBpbnN0YW5jZW9mIEdsb2JhbFNjb3BlKSB7XG4gICAgICAgICAgICBhc3NlcnQodGhpcy5fX2N1cnJlbnRTY29wZSA9PT0gbnVsbCk7XG4gICAgICAgICAgICB0aGlzLmdsb2JhbFNjb3BlID0gc2NvcGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2N1cnJlbnRTY29wZSA9IHNjb3BlO1xuICAgICAgICByZXR1cm4gc2NvcGU7XG4gICAgfVxuXG4gICAgX19uZXN0R2xvYmFsU2NvcGUobm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX25lc3RTY29wZShuZXcgR2xvYmFsU2NvcGUodGhpcywgbm9kZSkpO1xuICAgIH1cblxuICAgIF9fbmVzdEJsb2NrU2NvcGUobm9kZSwgaXNNZXRob2REZWZpbml0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbmVzdFNjb3BlKG5ldyBCbG9ja1Njb3BlKHRoaXMsIHRoaXMuX19jdXJyZW50U2NvcGUsIG5vZGUpKTtcbiAgICB9XG5cbiAgICBfX25lc3RGdW5jdGlvblNjb3BlKG5vZGUsIGlzTWV0aG9kRGVmaW5pdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5fX25lc3RTY29wZShuZXcgRnVuY3Rpb25TY29wZSh0aGlzLCB0aGlzLl9fY3VycmVudFNjb3BlLCBub2RlLCBpc01ldGhvZERlZmluaXRpb24pKTtcbiAgICB9XG5cbiAgICBfX25lc3RGb3JTY29wZShub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbmVzdFNjb3BlKG5ldyBGb3JTY29wZSh0aGlzLCB0aGlzLl9fY3VycmVudFNjb3BlLCBub2RlKSk7XG4gICAgfVxuXG4gICAgX19uZXN0Q2F0Y2hTY29wZShub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbmVzdFNjb3BlKG5ldyBDYXRjaFNjb3BlKHRoaXMsIHRoaXMuX19jdXJyZW50U2NvcGUsIG5vZGUpKTtcbiAgICB9XG5cbiAgICBfX25lc3RXaXRoU2NvcGUobm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX25lc3RTY29wZShuZXcgV2l0aFNjb3BlKHRoaXMsIHRoaXMuX19jdXJyZW50U2NvcGUsIG5vZGUpKTtcbiAgICB9XG5cbiAgICBfX25lc3RDbGFzc1Njb3BlKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19uZXN0U2NvcGUobmV3IENsYXNzU2NvcGUodGhpcywgdGhpcy5fX2N1cnJlbnRTY29wZSwgbm9kZSkpO1xuICAgIH1cblxuICAgIF9fbmVzdFN3aXRjaFNjb3BlKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19uZXN0U2NvcGUobmV3IFN3aXRjaFNjb3BlKHRoaXMsIHRoaXMuX19jdXJyZW50U2NvcGUsIG5vZGUpKTtcbiAgICB9XG5cbiAgICBfX25lc3RNb2R1bGVTY29wZShub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbmVzdFNjb3BlKG5ldyBNb2R1bGVTY29wZSh0aGlzLCB0aGlzLl9fY3VycmVudFNjb3BlLCBub2RlKSk7XG4gICAgfVxuXG4gICAgX19uZXN0VERaU2NvcGUobm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX25lc3RTY29wZShuZXcgVERaU2NvcGUodGhpcywgdGhpcy5fX2N1cnJlbnRTY29wZSwgbm9kZSkpO1xuICAgIH1cblxuICAgIF9fbmVzdEZ1bmN0aW9uRXhwcmVzc2lvbk5hbWVTY29wZShub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbmVzdFNjb3BlKG5ldyBGdW5jdGlvbkV4cHJlc3Npb25OYW1lU2NvcGUodGhpcywgdGhpcy5fX2N1cnJlbnRTY29wZSwgbm9kZSkpO1xuICAgIH1cblxuICAgIF9faXNFUzYoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fb3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2O1xuICAgIH1cbn1cblxuLyogdmltOiBzZXQgc3c9NCB0cz00IGV0IHR3PTgwIDogKi9cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

}, function(modId) { var map = {"./scope":1602510871640}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871640, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ClassScope = exports.ForScope = exports.FunctionScope = exports.SwitchScope = exports.BlockScope = exports.TDZScope = exports.WithScope = exports.CatchScope = exports.FunctionExpressionNameScope = exports.ModuleScope = exports.GlobalScope = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _estraverse = require('estraverse');

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _variable = require('./variable');

var _variable2 = _interopRequireDefault(_variable);

var _definition = require('./definition');

var _definition2 = _interopRequireDefault(_definition);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isStrictScope(scope, block, isMethodDefinition, useDirective) {
    var body, i, iz, stmt, expr;

    // When upper scope is exists and strict, inner scope is also strict.
    if (scope.upper && scope.upper.isStrict) {
        return true;
    }

    // ArrowFunctionExpression's scope is always strict scope.
    if (block.type === _estraverse.Syntax.ArrowFunctionExpression) {
        return true;
    }

    if (isMethodDefinition) {
        return true;
    }

    if (scope.type === 'class' || scope.type === 'module') {
        return true;
    }

    if (scope.type === 'block' || scope.type === 'switch') {
        return false;
    }

    if (scope.type === 'function') {
        if (block.type === _estraverse.Syntax.Program) {
            body = block;
        } else {
            body = block.body;
        }
    } else if (scope.type === 'global') {
        body = block;
    } else {
        return false;
    }

    // Search 'use strict' directive.
    if (useDirective) {
        for (i = 0, iz = body.body.length; i < iz; ++i) {
            stmt = body.body[i];
            if (stmt.type !== _estraverse.Syntax.DirectiveStatement) {
                break;
            }
            if (stmt.raw === '"use strict"' || stmt.raw === '\'use strict\'') {
                return true;
            }
        }
    } else {
        for (i = 0, iz = body.body.length; i < iz; ++i) {
            stmt = body.body[i];
            if (stmt.type !== _estraverse.Syntax.ExpressionStatement) {
                break;
            }
            expr = stmt.expression;
            if (expr.type !== _estraverse.Syntax.Literal || typeof expr.value !== 'string') {
                break;
            }
            if (expr.raw != null) {
                if (expr.raw === '"use strict"' || expr.raw === '\'use strict\'') {
                    return true;
                }
            } else {
                if (expr.value === 'use strict') {
                    return true;
                }
            }
        }
    }
    return false;
}

function registerScope(scopeManager, scope) {
    var scopes;

    scopeManager.scopes.push(scope);

    scopes = scopeManager.__nodeToScope.get(scope.block);
    if (scopes) {
        scopes.push(scope);
    } else {
        scopeManager.__nodeToScope.set(scope.block, [scope]);
    }
}

function shouldBeStatically(def) {
    return def.type === _variable2.default.ClassName || def.type === _variable2.default.Variable && def.parent.kind !== 'var';
}

/**
 * @class Scope
 */

var Scope = function () {
    function Scope(scopeManager, type, upperScope, block, isMethodDefinition) {
        _classCallCheck(this, Scope);

        /**
         * One of 'TDZ', 'module', 'block', 'switch', 'function', 'catch', 'with', 'function', 'class', 'global'.
         * @member {String} Scope#type
         */
        this.type = type;
        /**
        * The scoped {@link Variable}s of this scope, as <code>{ Variable.name
        * : Variable }</code>.
        * @member {Map} Scope#set
        */
        this.set = new _es6Map2.default();
        /**
         * The tainted variables of this scope, as <code>{ Variable.name :
         * boolean }</code>.
         * @member {Map} Scope#taints */
        this.taints = new _es6Map2.default();
        /**
         * Generally, through the lexical scoping of JS you can always know
         * which variable an identifier in the source code refers to. There are
         * a few exceptions to this rule. With 'global' and 'with' scopes you
         * can only decide at runtime which variable a reference refers to.
         * Moreover, if 'eval()' is used in a scope, it might introduce new
         * bindings in this or its parent scopes.
         * All those scopes are considered 'dynamic'.
         * @member {boolean} Scope#dynamic
         */
        this.dynamic = this.type === 'global' || this.type === 'with';
        /**
         * A reference to the scope-defining syntax node.
         * @member {esprima.Node} Scope#block
         */
        this.block = block;
        /**
        * The {@link Reference|references} that are not resolved with this scope.
        * @member {Reference[]} Scope#through
        */
        this.through = [];
        /**
        * The scoped {@link Variable}s of this scope. In the case of a
        * 'function' scope this includes the automatic argument <em>arguments</em> as
        * its first element, as well as all further formal arguments.
        * @member {Variable[]} Scope#variables
        */
        this.variables = [];
        /**
        * Any variable {@link Reference|reference} found in this scope. This
        * includes occurrences of local variables as well as variables from
        * parent scopes (including the global scope). For local variables
        * this also includes defining occurrences (like in a 'var' statement).
        * In a 'function' scope this does not include the occurrences of the
        * formal parameter in the parameter list.
        * @member {Reference[]} Scope#references
        */
        this.references = [];

        /**
        * For 'global' and 'function' scopes, this is a self-reference. For
        * other scope types this is the <em>variableScope</em> value of the
        * parent scope.
        * @member {Scope} Scope#variableScope
        */
        this.variableScope = this.type === 'global' || this.type === 'function' || this.type === 'module' ? this : upperScope.variableScope;
        /**
        * Whether this scope is created by a FunctionExpression.
        * @member {boolean} Scope#functionExpressionScope
        */
        this.functionExpressionScope = false;
        /**
        * Whether this is a scope that contains an 'eval()' invocation.
        * @member {boolean} Scope#directCallToEvalScope
        */
        this.directCallToEvalScope = false;
        /**
        * @member {boolean} Scope#thisFound
        */
        this.thisFound = false;

        this.__left = [];

        /**
        * Reference to the parent {@link Scope|scope}.
        * @member {Scope} Scope#upper
        */
        this.upper = upperScope;
        /**
        * Whether 'use strict' is in effect in this scope.
        * @member {boolean} Scope#isStrict
        */
        this.isStrict = isStrictScope(this, block, isMethodDefinition, scopeManager.__useDirective());

        /**
        * List of nested {@link Scope}s.
        * @member {Scope[]} Scope#childScopes
        */
        this.childScopes = [];
        if (this.upper) {
            this.upper.childScopes.push(this);
        }

        this.__declaredVariables = scopeManager.__declaredVariables;

        registerScope(scopeManager, this);
    }

    _createClass(Scope, [{
        key: '__shouldStaticallyClose',
        value: function __shouldStaticallyClose(scopeManager) {
            return !this.dynamic || scopeManager.__isOptimistic();
        }
    }, {
        key: '__shouldStaticallyCloseForGlobal',
        value: function __shouldStaticallyCloseForGlobal(ref) {
            // On global scope, let/const/class declarations should be resolved statically.
            var name = ref.identifier.name;
            if (!this.set.has(name)) {
                return false;
            }

            var variable = this.set.get(name);
            var defs = variable.defs;
            return defs.length > 0 && defs.every(shouldBeStatically);
        }
    }, {
        key: '__staticCloseRef',
        value: function __staticCloseRef(ref) {
            if (!this.__resolve(ref)) {
                this.__delegateToUpperScope(ref);
            }
        }
    }, {
        key: '__dynamicCloseRef',
        value: function __dynamicCloseRef(ref) {
            // notify all names are through to global
            var current = this;
            do {
                current.through.push(ref);
                current = current.upper;
            } while (current);
        }
    }, {
        key: '__globalCloseRef',
        value: function __globalCloseRef(ref) {
            // let/const/class declarations should be resolved statically.
            // others should be resolved dynamically.
            if (this.__shouldStaticallyCloseForGlobal(ref)) {
                this.__staticCloseRef(ref);
            } else {
                this.__dynamicCloseRef(ref);
            }
        }
    }, {
        key: '__close',
        value: function __close(scopeManager) {
            var closeRef;
            if (this.__shouldStaticallyClose(scopeManager)) {
                closeRef = this.__staticCloseRef;
            } else if (this.type !== 'global') {
                closeRef = this.__dynamicCloseRef;
            } else {
                closeRef = this.__globalCloseRef;
            }

            // Try Resolving all references in this scope.
            for (var i = 0, iz = this.__left.length; i < iz; ++i) {
                var ref = this.__left[i];
                closeRef.call(this, ref);
            }
            this.__left = null;

            return this.upper;
        }
    }, {
        key: '__resolve',
        value: function __resolve(ref) {
            var variable, name;
            name = ref.identifier.name;
            if (this.set.has(name)) {
                variable = this.set.get(name);
                variable.references.push(ref);
                variable.stack = variable.stack && ref.from.variableScope === this.variableScope;
                if (ref.tainted) {
                    variable.tainted = true;
                    this.taints.set(variable.name, true);
                }
                ref.resolved = variable;
                return true;
            }
            return false;
        }
    }, {
        key: '__delegateToUpperScope',
        value: function __delegateToUpperScope(ref) {
            if (this.upper) {
                this.upper.__left.push(ref);
            }
            this.through.push(ref);
        }
    }, {
        key: '__addDeclaredVariablesOfNode',
        value: function __addDeclaredVariablesOfNode(variable, node) {
            if (node == null) {
                return;
            }

            var variables = this.__declaredVariables.get(node);
            if (variables == null) {
                variables = [];
                this.__declaredVariables.set(node, variables);
            }
            if (variables.indexOf(variable) === -1) {
                variables.push(variable);
            }
        }
    }, {
        key: '__defineGeneric',
        value: function __defineGeneric(name, set, variables, node, def) {
            var variable;

            variable = set.get(name);
            if (!variable) {
                variable = new _variable2.default(name, this);
                set.set(name, variable);
                variables.push(variable);
            }

            if (def) {
                variable.defs.push(def);
                if (def.type !== _variable2.default.TDZ) {
                    this.__addDeclaredVariablesOfNode(variable, def.node);
                    this.__addDeclaredVariablesOfNode(variable, def.parent);
                }
            }
            if (node) {
                variable.identifiers.push(node);
            }
        }
    }, {
        key: '__define',
        value: function __define(node, def) {
            if (node && node.type === _estraverse.Syntax.Identifier) {
                this.__defineGeneric(node.name, this.set, this.variables, node, def);
            }
        }
    }, {
        key: '__referencing',
        value: function __referencing(node, assign, writeExpr, maybeImplicitGlobal, partial, init) {
            // because Array element may be null
            if (!node || node.type !== _estraverse.Syntax.Identifier) {
                return;
            }

            // Specially handle like `this`.
            if (node.name === 'super') {
                return;
            }

            var ref = new _reference2.default(node, this, assign || _reference2.default.READ, writeExpr, maybeImplicitGlobal, !!partial, !!init);
            this.references.push(ref);
            this.__left.push(ref);
        }
    }, {
        key: '__detectEval',
        value: function __detectEval() {
            var current;
            current = this;
            this.directCallToEvalScope = true;
            do {
                current.dynamic = true;
                current = current.upper;
            } while (current);
        }
    }, {
        key: '__detectThis',
        value: function __detectThis() {
            this.thisFound = true;
        }
    }, {
        key: '__isClosed',
        value: function __isClosed() {
            return this.__left === null;
        }

        /**
         * returns resolved {Reference}
         * @method Scope#resolve
         * @param {Esprima.Identifier} ident - identifier to be resolved.
         * @return {Reference}
         */

    }, {
        key: 'resolve',
        value: function resolve(ident) {
            var ref, i, iz;
            (0, _assert2.default)(this.__isClosed(), 'Scope should be closed.');
            (0, _assert2.default)(ident.type === _estraverse.Syntax.Identifier, 'Target should be identifier.');
            for (i = 0, iz = this.references.length; i < iz; ++i) {
                ref = this.references[i];
                if (ref.identifier === ident) {
                    return ref;
                }
            }
            return null;
        }

        /**
         * returns this scope is static
         * @method Scope#isStatic
         * @return {boolean}
         */

    }, {
        key: 'isStatic',
        value: function isStatic() {
            return !this.dynamic;
        }

        /**
         * returns this scope has materialized arguments
         * @method Scope#isArgumentsMaterialized
         * @return {boolean}
         */

    }, {
        key: 'isArgumentsMaterialized',
        value: function isArgumentsMaterialized() {
            return true;
        }

        /**
         * returns this scope has materialized `this` reference
         * @method Scope#isThisMaterialized
         * @return {boolean}
         */

    }, {
        key: 'isThisMaterialized',
        value: function isThisMaterialized() {
            return true;
        }
    }, {
        key: 'isUsedName',
        value: function isUsedName(name) {
            if (this.set.has(name)) {
                return true;
            }
            for (var i = 0, iz = this.through.length; i < iz; ++i) {
                if (this.through[i].identifier.name === name) {
                    return true;
                }
            }
            return false;
        }
    }]);

    return Scope;
}();

exports.default = Scope;

var GlobalScope = exports.GlobalScope = function (_Scope) {
    _inherits(GlobalScope, _Scope);

    function GlobalScope(scopeManager, block) {
        _classCallCheck(this, GlobalScope);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GlobalScope).call(this, scopeManager, 'global', null, block, false));

        _this.implicit = {
            set: new _es6Map2.default(),
            variables: [],
            /**
            * List of {@link Reference}s that are left to be resolved (i.e. which
            * need to be linked to the variable they refer to).
            * @member {Reference[]} Scope#implicit#left
            */
            left: []
        };
        return _this;
    }

    _createClass(GlobalScope, [{
        key: '__close',
        value: function __close(scopeManager) {
            var implicit = [];
            for (var i = 0, iz = this.__left.length; i < iz; ++i) {
                var ref = this.__left[i];
                if (ref.__maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
                    implicit.push(ref.__maybeImplicitGlobal);
                }
            }

            // create an implicit global variable from assignment expression
            for (var _i = 0, _iz = implicit.length; _i < _iz; ++_i) {
                var info = implicit[_i];
                this.__defineImplicit(info.pattern, new _definition2.default(_variable2.default.ImplicitGlobalVariable, info.pattern, info.node, null, null, null));
            }

            this.implicit.left = this.__left;

            return _get(Object.getPrototypeOf(GlobalScope.prototype), '__close', this).call(this, scopeManager);
        }
    }, {
        key: '__defineImplicit',
        value: function __defineImplicit(node, def) {
            if (node && node.type === _estraverse.Syntax.Identifier) {
                this.__defineGeneric(node.name, this.implicit.set, this.implicit.variables, node, def);
            }
        }
    }]);

    return GlobalScope;
}(Scope);

var ModuleScope = exports.ModuleScope = function (_Scope2) {
    _inherits(ModuleScope, _Scope2);

    function ModuleScope(scopeManager, upperScope, block) {
        _classCallCheck(this, ModuleScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ModuleScope).call(this, scopeManager, 'module', upperScope, block, false));
    }

    return ModuleScope;
}(Scope);

var FunctionExpressionNameScope = exports.FunctionExpressionNameScope = function (_Scope3) {
    _inherits(FunctionExpressionNameScope, _Scope3);

    function FunctionExpressionNameScope(scopeManager, upperScope, block) {
        _classCallCheck(this, FunctionExpressionNameScope);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionExpressionNameScope).call(this, scopeManager, 'function-expression-name', upperScope, block, false));

        _this3.__define(block.id, new _definition2.default(_variable2.default.FunctionName, block.id, block, null, null, null));
        _this3.functionExpressionScope = true;
        return _this3;
    }

    return FunctionExpressionNameScope;
}(Scope);

var CatchScope = exports.CatchScope = function (_Scope4) {
    _inherits(CatchScope, _Scope4);

    function CatchScope(scopeManager, upperScope, block) {
        _classCallCheck(this, CatchScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CatchScope).call(this, scopeManager, 'catch', upperScope, block, false));
    }

    return CatchScope;
}(Scope);

var WithScope = exports.WithScope = function (_Scope5) {
    _inherits(WithScope, _Scope5);

    function WithScope(scopeManager, upperScope, block) {
        _classCallCheck(this, WithScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(WithScope).call(this, scopeManager, 'with', upperScope, block, false));
    }

    _createClass(WithScope, [{
        key: '__close',
        value: function __close(scopeManager) {
            if (this.__shouldStaticallyClose(scopeManager)) {
                return _get(Object.getPrototypeOf(WithScope.prototype), '__close', this).call(this, scopeManager);
            }

            for (var i = 0, iz = this.__left.length; i < iz; ++i) {
                var ref = this.__left[i];
                ref.tainted = true;
                this.__delegateToUpperScope(ref);
            }
            this.__left = null;

            return this.upper;
        }
    }]);

    return WithScope;
}(Scope);

var TDZScope = exports.TDZScope = function (_Scope6) {
    _inherits(TDZScope, _Scope6);

    function TDZScope(scopeManager, upperScope, block) {
        _classCallCheck(this, TDZScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TDZScope).call(this, scopeManager, 'TDZ', upperScope, block, false));
    }

    return TDZScope;
}(Scope);

var BlockScope = exports.BlockScope = function (_Scope7) {
    _inherits(BlockScope, _Scope7);

    function BlockScope(scopeManager, upperScope, block) {
        _classCallCheck(this, BlockScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(BlockScope).call(this, scopeManager, 'block', upperScope, block, false));
    }

    return BlockScope;
}(Scope);

var SwitchScope = exports.SwitchScope = function (_Scope8) {
    _inherits(SwitchScope, _Scope8);

    function SwitchScope(scopeManager, upperScope, block) {
        _classCallCheck(this, SwitchScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SwitchScope).call(this, scopeManager, 'switch', upperScope, block, false));
    }

    return SwitchScope;
}(Scope);

var FunctionScope = exports.FunctionScope = function (_Scope9) {
    _inherits(FunctionScope, _Scope9);

    function FunctionScope(scopeManager, upperScope, block, isMethodDefinition) {
        _classCallCheck(this, FunctionScope);

        // section 9.2.13, FunctionDeclarationInstantiation.
        // NOTE Arrow functions never have an arguments objects.

        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionScope).call(this, scopeManager, 'function', upperScope, block, isMethodDefinition));

        if (_this9.block.type !== _estraverse.Syntax.ArrowFunctionExpression) {
            _this9.__defineArguments();
        }
        return _this9;
    }

    _createClass(FunctionScope, [{
        key: 'isArgumentsMaterialized',
        value: function isArgumentsMaterialized() {
            // TODO(Constellation)
            // We can more aggressive on this condition like this.
            //
            // function t() {
            //     // arguments of t is always hidden.
            //     function arguments() {
            //     }
            // }
            if (this.block.type === _estraverse.Syntax.ArrowFunctionExpression) {
                return false;
            }

            if (!this.isStatic()) {
                return true;
            }

            var variable = this.set.get('arguments');
            (0, _assert2.default)(variable, 'Always have arguments variable.');
            return variable.tainted || variable.references.length !== 0;
        }
    }, {
        key: 'isThisMaterialized',
        value: function isThisMaterialized() {
            if (!this.isStatic()) {
                return true;
            }
            return this.thisFound;
        }
    }, {
        key: '__defineArguments',
        value: function __defineArguments() {
            this.__defineGeneric('arguments', this.set, this.variables, null, null);
            this.taints.set('arguments', true);
        }
    }]);

    return FunctionScope;
}(Scope);

var ForScope = exports.ForScope = function (_Scope10) {
    _inherits(ForScope, _Scope10);

    function ForScope(scopeManager, upperScope, block) {
        _classCallCheck(this, ForScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ForScope).call(this, scopeManager, 'for', upperScope, block, false));
    }

    return ForScope;
}(Scope);

var ClassScope = exports.ClassScope = function (_Scope11) {
    _inherits(ClassScope, _Scope11);

    function ClassScope(scopeManager, upperScope, block) {
        _classCallCheck(this, ClassScope);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ClassScope).call(this, scopeManager, 'class', upperScope, block, false));
    }

    return ClassScope;
}(Scope);

/* vim: set sw=4 ts=4 et tw=80 : */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQTs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsS0FBOUIsRUFBcUMsa0JBQXJDLEVBQXlELFlBQXpELEVBQXVFO0FBQ25FLFFBQUksSUFBSixFQUFVLENBQVYsRUFBYSxFQUFiLEVBQWlCLElBQWpCLEVBQXVCLElBQXZCOzs7QUFEbUUsUUFJL0QsTUFBTSxLQUFOLElBQWUsTUFBTSxLQUFOLENBQVksUUFBWixFQUFzQjtBQUNyQyxlQUFPLElBQVAsQ0FEcUM7S0FBekM7OztBQUptRSxRQVMvRCxNQUFNLElBQU4sS0FBZSxtQkFBTyx1QkFBUCxFQUFnQztBQUMvQyxlQUFPLElBQVAsQ0FEK0M7S0FBbkQ7O0FBSUEsUUFBSSxrQkFBSixFQUF3QjtBQUNwQixlQUFPLElBQVAsQ0FEb0I7S0FBeEI7O0FBSUEsUUFBSSxNQUFNLElBQU4sS0FBZSxPQUFmLElBQTBCLE1BQU0sSUFBTixLQUFlLFFBQWYsRUFBeUI7QUFDbkQsZUFBTyxJQUFQLENBRG1EO0tBQXZEOztBQUlBLFFBQUksTUFBTSxJQUFOLEtBQWUsT0FBZixJQUEwQixNQUFNLElBQU4sS0FBZSxRQUFmLEVBQXlCO0FBQ25ELGVBQU8sS0FBUCxDQURtRDtLQUF2RDs7QUFJQSxRQUFJLE1BQU0sSUFBTixLQUFlLFVBQWYsRUFBMkI7QUFDM0IsWUFBSSxNQUFNLElBQU4sS0FBZSxtQkFBTyxPQUFQLEVBQWdCO0FBQy9CLG1CQUFPLEtBQVAsQ0FEK0I7U0FBbkMsTUFFTztBQUNILG1CQUFPLE1BQU0sSUFBTixDQURKO1NBRlA7S0FESixNQU1PLElBQUksTUFBTSxJQUFOLEtBQWUsUUFBZixFQUF5QjtBQUNoQyxlQUFPLEtBQVAsQ0FEZ0M7S0FBN0IsTUFFQTtBQUNILGVBQU8sS0FBUCxDQURHO0tBRkE7OztBQS9CNEQsUUFzQy9ELFlBQUosRUFBa0I7QUFDZCxhQUFLLElBQUksQ0FBSixFQUFPLEtBQUssS0FBSyxJQUFMLENBQVUsTUFBVixFQUFrQixJQUFJLEVBQUosRUFBUSxFQUFFLENBQUYsRUFBSztBQUM1QyxtQkFBTyxLQUFLLElBQUwsQ0FBVSxDQUFWLENBQVAsQ0FENEM7QUFFNUMsZ0JBQUksS0FBSyxJQUFMLEtBQWMsbUJBQU8sa0JBQVAsRUFBMkI7QUFDekMsc0JBRHlDO2FBQTdDO0FBR0EsZ0JBQUksS0FBSyxHQUFMLEtBQWEsY0FBYixJQUErQixLQUFLLEdBQUwsS0FBYSxnQkFBYixFQUErQjtBQUM5RCx1QkFBTyxJQUFQLENBRDhEO2FBQWxFO1NBTEo7S0FESixNQVVPO0FBQ0gsYUFBSyxJQUFJLENBQUosRUFBTyxLQUFLLEtBQUssSUFBTCxDQUFVLE1BQVYsRUFBa0IsSUFBSSxFQUFKLEVBQVEsRUFBRSxDQUFGLEVBQUs7QUFDNUMsbUJBQU8sS0FBSyxJQUFMLENBQVUsQ0FBVixDQUFQLENBRDRDO0FBRTVDLGdCQUFJLEtBQUssSUFBTCxLQUFjLG1CQUFPLG1CQUFQLEVBQTRCO0FBQzFDLHNCQUQwQzthQUE5QztBQUdBLG1CQUFPLEtBQUssVUFBTCxDQUxxQztBQU01QyxnQkFBSSxLQUFLLElBQUwsS0FBYyxtQkFBTyxPQUFQLElBQWtCLE9BQU8sS0FBSyxLQUFMLEtBQWUsUUFBdEIsRUFBZ0M7QUFDaEUsc0JBRGdFO2FBQXBFO0FBR0EsZ0JBQUksS0FBSyxHQUFMLElBQVksSUFBWixFQUFrQjtBQUNsQixvQkFBSSxLQUFLLEdBQUwsS0FBYSxjQUFiLElBQStCLEtBQUssR0FBTCxLQUFhLGdCQUFiLEVBQStCO0FBQzlELDJCQUFPLElBQVAsQ0FEOEQ7aUJBQWxFO2FBREosTUFJTztBQUNILG9CQUFJLEtBQUssS0FBTCxLQUFlLFlBQWYsRUFBNkI7QUFDN0IsMkJBQU8sSUFBUCxDQUQ2QjtpQkFBakM7YUFMSjtTQVRKO0tBWEo7QUErQkEsV0FBTyxLQUFQLENBckVtRTtDQUF2RTs7QUF3RUEsU0FBUyxhQUFULENBQXVCLFlBQXZCLEVBQXFDLEtBQXJDLEVBQTRDO0FBQ3hDLFFBQUksTUFBSixDQUR3Qzs7QUFHeEMsaUJBQWEsTUFBYixDQUFvQixJQUFwQixDQUF5QixLQUF6QixFQUh3Qzs7QUFLeEMsYUFBUyxhQUFhLGFBQWIsQ0FBMkIsR0FBM0IsQ0FBK0IsTUFBTSxLQUFOLENBQXhDLENBTHdDO0FBTXhDLFFBQUksTUFBSixFQUFZO0FBQ1IsZUFBTyxJQUFQLENBQVksS0FBWixFQURRO0tBQVosTUFFTztBQUNILHFCQUFhLGFBQWIsQ0FBMkIsR0FBM0IsQ0FBK0IsTUFBTSxLQUFOLEVBQWEsQ0FBRSxLQUFGLENBQTVDLEVBREc7S0FGUDtDQU5KOztBQWFBLFNBQVMsa0JBQVQsQ0FBNEIsR0FBNUIsRUFBaUM7QUFDN0IsV0FDSSxHQUFDLENBQUksSUFBSixLQUFhLG1CQUFTLFNBQVQsSUFDYixJQUFJLElBQUosS0FBYSxtQkFBUyxRQUFULElBQXFCLElBQUksTUFBSixDQUFXLElBQVgsS0FBb0IsS0FBcEIsQ0FIVjtDQUFqQzs7Ozs7O0lBVXFCO0FBQ2pCLGFBRGlCLEtBQ2pCLENBQVksWUFBWixFQUEwQixJQUExQixFQUFnQyxVQUFoQyxFQUE0QyxLQUE1QyxFQUFtRCxrQkFBbkQsRUFBdUU7OEJBRHRELE9BQ3NEOzs7Ozs7QUFLbkUsYUFBSyxJQUFMLEdBQVksSUFBWjs7Ozs7O0FBTG1FLFlBV25FLENBQUssR0FBTCxHQUFXLHNCQUFYOzs7OztBQVhtRSxZQWdCbkUsQ0FBSyxNQUFMLEdBQWMsc0JBQWQ7Ozs7Ozs7Ozs7O0FBaEJtRSxZQTJCbkUsQ0FBSyxPQUFMLEdBQWUsS0FBSyxJQUFMLEtBQWMsUUFBZCxJQUEwQixLQUFLLElBQUwsS0FBYyxNQUFkOzs7OztBQTNCMEIsWUFnQ25FLENBQUssS0FBTCxHQUFhLEtBQWI7Ozs7O0FBaENtRSxZQXFDbkUsQ0FBSyxPQUFMLEdBQWUsRUFBZjs7Ozs7OztBQXJDbUUsWUE0Q25FLENBQUssU0FBTCxHQUFpQixFQUFqQjs7Ozs7Ozs7OztBQTVDbUUsWUFzRG5FLENBQUssVUFBTCxHQUFrQixFQUFsQjs7Ozs7Ozs7QUF0RG1FLFlBOERuRSxDQUFLLGFBQUwsR0FDSSxJQUFDLENBQUssSUFBTCxLQUFjLFFBQWQsSUFBMEIsS0FBSyxJQUFMLEtBQWMsVUFBZCxJQUE0QixLQUFLLElBQUwsS0FBYyxRQUFkLEdBQTBCLElBQWpGLEdBQXdGLFdBQVcsYUFBWDs7Ozs7QUEvRHpCLFlBb0VuRSxDQUFLLHVCQUFMLEdBQStCLEtBQS9COzs7OztBQXBFbUUsWUF5RW5FLENBQUsscUJBQUwsR0FBNkIsS0FBN0I7Ozs7QUF6RW1FLFlBNkVuRSxDQUFLLFNBQUwsR0FBaUIsS0FBakIsQ0E3RW1FOztBQStFbkUsYUFBSyxNQUFMLEdBQWMsRUFBZDs7Ozs7O0FBL0VtRSxZQXFGbkUsQ0FBSyxLQUFMLEdBQWEsVUFBYjs7Ozs7QUFyRm1FLFlBMEZuRSxDQUFLLFFBQUwsR0FBZ0IsY0FBYyxJQUFkLEVBQW9CLEtBQXBCLEVBQTJCLGtCQUEzQixFQUErQyxhQUFhLGNBQWIsRUFBL0MsQ0FBaEI7Ozs7OztBQTFGbUUsWUFnR25FLENBQUssV0FBTCxHQUFtQixFQUFuQixDQWhHbUU7QUFpR25FLFlBQUksS0FBSyxLQUFMLEVBQVk7QUFDWixpQkFBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixJQUF2QixDQUE0QixJQUE1QixFQURZO1NBQWhCOztBQUlBLGFBQUssbUJBQUwsR0FBMkIsYUFBYSxtQkFBYixDQXJHd0M7O0FBdUduRSxzQkFBYyxZQUFkLEVBQTRCLElBQTVCLEVBdkdtRTtLQUF2RTs7aUJBRGlCOztnREEyR08sY0FBYztBQUNsQyxtQkFBUSxDQUFDLEtBQUssT0FBTCxJQUFnQixhQUFhLGNBQWIsRUFBakIsQ0FEMEI7Ozs7eURBSUwsS0FBSzs7QUFFbEMsZ0JBQUksT0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFmLENBRnVCO0FBR2xDLGdCQUFJLENBQUMsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLElBQWIsQ0FBRCxFQUFxQjtBQUNyQix1QkFBTyxLQUFQLENBRHFCO2FBQXpCOztBQUlBLGdCQUFJLFdBQVcsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLElBQWIsQ0FBWCxDQVA4QjtBQVFsQyxnQkFBSSxPQUFPLFNBQVMsSUFBVCxDQVJ1QjtBQVNsQyxtQkFBTyxLQUFLLE1BQUwsR0FBYyxDQUFkLElBQW1CLEtBQUssS0FBTCxDQUFXLGtCQUFYLENBQW5CLENBVDJCOzs7O3lDQVlyQixLQUFLO0FBQ2xCLGdCQUFJLENBQUMsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFELEVBQXNCO0FBQ3RCLHFCQUFLLHNCQUFMLENBQTRCLEdBQTVCLEVBRHNCO2FBQTFCOzs7OzBDQUtjLEtBQUs7O0FBRW5CLGdCQUFJLFVBQVUsSUFBVixDQUZlO0FBR25CLGVBQUc7QUFDQyx3QkFBUSxPQUFSLENBQWdCLElBQWhCLENBQXFCLEdBQXJCLEVBREQ7QUFFQywwQkFBVSxRQUFRLEtBQVIsQ0FGWDthQUFILFFBR1MsT0FIVCxFQUhtQjs7Ozt5Q0FTTixLQUFLOzs7QUFHbEIsZ0JBQUksS0FBSyxnQ0FBTCxDQUFzQyxHQUF0QyxDQUFKLEVBQWdEO0FBQzVDLHFCQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBRDRDO2FBQWhELE1BRU87QUFDSCxxQkFBSyxpQkFBTCxDQUF1QixHQUF2QixFQURHO2FBRlA7Ozs7Z0NBT0ksY0FBYztBQUNsQixnQkFBSSxRQUFKLENBRGtCO0FBRWxCLGdCQUFJLEtBQUssdUJBQUwsQ0FBNkIsWUFBN0IsQ0FBSixFQUFnRDtBQUM1QywyQkFBVyxLQUFLLGdCQUFMLENBRGlDO2FBQWhELE1BRU8sSUFBSSxLQUFLLElBQUwsS0FBYyxRQUFkLEVBQXdCO0FBQy9CLDJCQUFXLEtBQUssaUJBQUwsQ0FEb0I7YUFBNUIsTUFFQTtBQUNILDJCQUFXLEtBQUssZ0JBQUwsQ0FEUjthQUZBOzs7QUFKVyxpQkFXYixJQUFJLElBQUksQ0FBSixFQUFPLEtBQUssS0FBSyxNQUFMLENBQVksTUFBWixFQUFvQixJQUFJLEVBQUosRUFBUSxFQUFFLENBQUYsRUFBSztBQUNsRCxvQkFBSSxNQUFNLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBTixDQUQ4QztBQUVsRCx5QkFBUyxJQUFULENBQWMsSUFBZCxFQUFvQixHQUFwQixFQUZrRDthQUF0RDtBQUlBLGlCQUFLLE1BQUwsR0FBYyxJQUFkLENBZmtCOztBQWlCbEIsbUJBQU8sS0FBSyxLQUFMLENBakJXOzs7O2tDQW9CWixLQUFLO0FBQ1gsZ0JBQUksUUFBSixFQUFjLElBQWQsQ0FEVztBQUVYLG1CQUFPLElBQUksVUFBSixDQUFlLElBQWYsQ0FGSTtBQUdYLGdCQUFJLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxJQUFiLENBQUosRUFBd0I7QUFDcEIsMkJBQVcsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLElBQWIsQ0FBWCxDQURvQjtBQUVwQix5QkFBUyxVQUFULENBQW9CLElBQXBCLENBQXlCLEdBQXpCLEVBRm9CO0FBR3BCLHlCQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULElBQWtCLElBQUksSUFBSixDQUFTLGFBQVQsS0FBMkIsS0FBSyxhQUFMLENBSDFDO0FBSXBCLG9CQUFJLElBQUksT0FBSixFQUFhO0FBQ2IsNkJBQVMsT0FBVCxHQUFtQixJQUFuQixDQURhO0FBRWIseUJBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsU0FBUyxJQUFULEVBQWUsSUFBL0IsRUFGYTtpQkFBakI7QUFJQSxvQkFBSSxRQUFKLEdBQWUsUUFBZixDQVJvQjtBQVNwQix1QkFBTyxJQUFQLENBVG9CO2FBQXhCO0FBV0EsbUJBQU8sS0FBUCxDQWRXOzs7OytDQWlCUSxLQUFLO0FBQ3hCLGdCQUFJLEtBQUssS0FBTCxFQUFZO0FBQ1oscUJBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBdUIsR0FBdkIsRUFEWTthQUFoQjtBQUdBLGlCQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLEdBQWxCLEVBSndCOzs7O3FEQU9DLFVBQVUsTUFBTTtBQUN6QyxnQkFBSSxRQUFRLElBQVIsRUFBYztBQUNkLHVCQURjO2FBQWxCOztBQUlBLGdCQUFJLFlBQVksS0FBSyxtQkFBTCxDQUF5QixHQUF6QixDQUE2QixJQUE3QixDQUFaLENBTHFDO0FBTXpDLGdCQUFJLGFBQWEsSUFBYixFQUFtQjtBQUNuQiw0QkFBWSxFQUFaLENBRG1CO0FBRW5CLHFCQUFLLG1CQUFMLENBQXlCLEdBQXpCLENBQTZCLElBQTdCLEVBQW1DLFNBQW5DLEVBRm1CO2FBQXZCO0FBSUEsZ0JBQUksVUFBVSxPQUFWLENBQWtCLFFBQWxCLE1BQWdDLENBQUMsQ0FBRCxFQUFJO0FBQ3BDLDBCQUFVLElBQVYsQ0FBZSxRQUFmLEVBRG9DO2FBQXhDOzs7O3dDQUtZLE1BQU0sS0FBSyxXQUFXLE1BQU0sS0FBSztBQUM3QyxnQkFBSSxRQUFKLENBRDZDOztBQUc3Qyx1QkFBVyxJQUFJLEdBQUosQ0FBUSxJQUFSLENBQVgsQ0FINkM7QUFJN0MsZ0JBQUksQ0FBQyxRQUFELEVBQVc7QUFDWCwyQkFBVyx1QkFBYSxJQUFiLEVBQW1CLElBQW5CLENBQVgsQ0FEVztBQUVYLG9CQUFJLEdBQUosQ0FBUSxJQUFSLEVBQWMsUUFBZCxFQUZXO0FBR1gsMEJBQVUsSUFBVixDQUFlLFFBQWYsRUFIVzthQUFmOztBQU1BLGdCQUFJLEdBQUosRUFBUztBQUNMLHlCQUFTLElBQVQsQ0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBREs7QUFFTCxvQkFBSSxJQUFJLElBQUosS0FBYSxtQkFBUyxHQUFULEVBQWM7QUFDM0IseUJBQUssNEJBQUwsQ0FBa0MsUUFBbEMsRUFBNEMsSUFBSSxJQUFKLENBQTVDLENBRDJCO0FBRTNCLHlCQUFLLDRCQUFMLENBQWtDLFFBQWxDLEVBQTRDLElBQUksTUFBSixDQUE1QyxDQUYyQjtpQkFBL0I7YUFGSjtBQU9BLGdCQUFJLElBQUosRUFBVTtBQUNOLHlCQUFTLFdBQVQsQ0FBcUIsSUFBckIsQ0FBMEIsSUFBMUIsRUFETTthQUFWOzs7O2lDQUtLLE1BQU0sS0FBSztBQUNoQixnQkFBSSxRQUFRLEtBQUssSUFBTCxLQUFjLG1CQUFPLFVBQVAsRUFBbUI7QUFDekMscUJBQUssZUFBTCxDQUNRLEtBQUssSUFBTCxFQUNBLEtBQUssR0FBTCxFQUNBLEtBQUssU0FBTCxFQUNBLElBSlIsRUFLUSxHQUxSLEVBRHlDO2FBQTdDOzs7O3NDQVVVLE1BQU0sUUFBUSxXQUFXLHFCQUFxQixTQUFTLE1BQU07O0FBRXZFLGdCQUFJLENBQUMsSUFBRCxJQUFTLEtBQUssSUFBTCxLQUFjLG1CQUFPLFVBQVAsRUFBbUI7QUFDMUMsdUJBRDBDO2FBQTlDOzs7QUFGdUUsZ0JBT25FLEtBQUssSUFBTCxLQUFjLE9BQWQsRUFBdUI7QUFDdkIsdUJBRHVCO2FBQTNCOztBQUlBLGdCQUFJLE1BQU0sd0JBQWMsSUFBZCxFQUFvQixJQUFwQixFQUEwQixVQUFVLG9CQUFVLElBQVYsRUFBZ0IsU0FBcEQsRUFBK0QsbUJBQS9ELEVBQW9GLENBQUMsQ0FBQyxPQUFELEVBQVUsQ0FBQyxDQUFDLElBQUQsQ0FBdEcsQ0FYbUU7QUFZdkUsaUJBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixHQUFyQixFQVp1RTtBQWF2RSxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixHQUFqQixFQWJ1RTs7Ozt1Q0FnQjVEO0FBQ1gsZ0JBQUksT0FBSixDQURXO0FBRVgsc0JBQVUsSUFBVixDQUZXO0FBR1gsaUJBQUsscUJBQUwsR0FBNkIsSUFBN0IsQ0FIVztBQUlYLGVBQUc7QUFDQyx3QkFBUSxPQUFSLEdBQWtCLElBQWxCLENBREQ7QUFFQywwQkFBVSxRQUFRLEtBQVIsQ0FGWDthQUFILFFBR1MsT0FIVCxFQUpXOzs7O3VDQVVBO0FBQ1gsaUJBQUssU0FBTCxHQUFpQixJQUFqQixDQURXOzs7O3FDQUlGO0FBQ1QsbUJBQU8sS0FBSyxNQUFMLEtBQWdCLElBQWhCLENBREU7Ozs7Ozs7Ozs7OztnQ0FVTCxPQUFPO0FBQ1gsZ0JBQUksR0FBSixFQUFTLENBQVQsRUFBWSxFQUFaLENBRFc7QUFFWCxrQ0FBTyxLQUFLLFVBQUwsRUFBUCxFQUEwQix5QkFBMUIsRUFGVztBQUdYLGtDQUFPLE1BQU0sSUFBTixLQUFlLG1CQUFPLFVBQVAsRUFBbUIsOEJBQXpDLEVBSFc7QUFJWCxpQkFBSyxJQUFJLENBQUosRUFBTyxLQUFLLEtBQUssVUFBTCxDQUFnQixNQUFoQixFQUF3QixJQUFJLEVBQUosRUFBUSxFQUFFLENBQUYsRUFBSztBQUNsRCxzQkFBTSxLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FBTixDQURrRDtBQUVsRCxvQkFBSSxJQUFJLFVBQUosS0FBbUIsS0FBbkIsRUFBMEI7QUFDMUIsMkJBQU8sR0FBUCxDQUQwQjtpQkFBOUI7YUFGSjtBQU1BLG1CQUFPLElBQVAsQ0FWVzs7Ozs7Ozs7Ozs7bUNBa0JKO0FBQ1AsbUJBQU8sQ0FBQyxLQUFLLE9BQUwsQ0FERDs7Ozs7Ozs7Ozs7a0RBU2U7QUFDdEIsbUJBQU8sSUFBUCxDQURzQjs7Ozs7Ozs7Ozs7NkNBU0w7QUFDakIsbUJBQU8sSUFBUCxDQURpQjs7OzttQ0FJVixNQUFNO0FBQ2IsZ0JBQUksS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLElBQWIsQ0FBSixFQUF3QjtBQUNwQix1QkFBTyxJQUFQLENBRG9CO2FBQXhCO0FBR0EsaUJBQUssSUFBSSxJQUFJLENBQUosRUFBTyxLQUFLLEtBQUssT0FBTCxDQUFhLE1BQWIsRUFBcUIsSUFBSSxFQUFKLEVBQVEsRUFBRSxDQUFGLEVBQUs7QUFDbkQsb0JBQUksS0FBSyxPQUFMLENBQWEsQ0FBYixFQUFnQixVQUFoQixDQUEyQixJQUEzQixLQUFvQyxJQUFwQyxFQUEwQztBQUMxQywyQkFBTyxJQUFQLENBRDBDO2lCQUE5QzthQURKO0FBS0EsbUJBQU8sS0FBUCxDQVRhOzs7O1dBaFVBOzs7OztJQTZVUjs7O0FBQ1QsYUFEUyxXQUNULENBQVksWUFBWixFQUEwQixLQUExQixFQUFpQzs4QkFEeEIsYUFDd0I7OzJFQUR4Qix3QkFFQyxjQUFjLFVBQVUsTUFBTSxPQUFPLFFBRGQ7O0FBRTdCLGNBQUssUUFBTCxHQUFnQjtBQUNaLGlCQUFLLHNCQUFMO0FBQ0EsdUJBQVcsRUFBWDs7Ozs7O0FBTUEsa0JBQU0sRUFBTjtTQVJKLENBRjZCOztLQUFqQzs7aUJBRFM7O2dDQWVELGNBQWM7QUFDbEIsZ0JBQUksV0FBVyxFQUFYLENBRGM7QUFFbEIsaUJBQUssSUFBSSxJQUFJLENBQUosRUFBTyxLQUFLLEtBQUssTUFBTCxDQUFZLE1BQVosRUFBb0IsSUFBSSxFQUFKLEVBQVEsRUFBRSxDQUFGLEVBQUs7QUFDbEQsb0JBQUksTUFBTSxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQU4sQ0FEOEM7QUFFbEQsb0JBQUksSUFBSSxxQkFBSixJQUE2QixDQUFDLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxJQUFJLFVBQUosQ0FBZSxJQUFmLENBQWQsRUFBb0M7QUFDakUsNkJBQVMsSUFBVCxDQUFjLElBQUkscUJBQUosQ0FBZCxDQURpRTtpQkFBckU7YUFGSjs7O0FBRmtCLGlCQVViLElBQUksS0FBSSxDQUFKLEVBQU8sTUFBSyxTQUFTLE1BQVQsRUFBaUIsS0FBSSxHQUFKLEVBQVEsRUFBRSxFQUFGLEVBQUs7QUFDL0Msb0JBQUksT0FBTyxTQUFTLEVBQVQsQ0FBUCxDQUQyQztBQUUvQyxxQkFBSyxnQkFBTCxDQUFzQixLQUFLLE9BQUwsRUFDZCx5QkFDSSxtQkFBUyxzQkFBVCxFQUNBLEtBQUssT0FBTCxFQUNBLEtBQUssSUFBTCxFQUNBLElBSkosRUFLSSxJQUxKLEVBTUksSUFOSixDQURSLEVBRitDO2FBQW5EOztBQWNBLGlCQUFLLFFBQUwsQ0FBYyxJQUFkLEdBQXFCLEtBQUssTUFBTCxDQXhCSDs7QUEwQmxCLDhDQXpDSyxvREF5Q2dCLGFBQXJCLENBMUJrQjs7Ozt5Q0E2QkwsTUFBTSxLQUFLO0FBQ3hCLGdCQUFJLFFBQVEsS0FBSyxJQUFMLEtBQWMsbUJBQU8sVUFBUCxFQUFtQjtBQUN6QyxxQkFBSyxlQUFMLENBQ1EsS0FBSyxJQUFMLEVBQ0EsS0FBSyxRQUFMLENBQWMsR0FBZCxFQUNBLEtBQUssUUFBTCxDQUFjLFNBQWQsRUFDQSxJQUpSLEVBS1EsR0FMUixFQUR5QzthQUE3Qzs7OztXQTdDSztFQUFvQjs7SUF3RHBCOzs7QUFDVCxhQURTLFdBQ1QsQ0FBWSxZQUFaLEVBQTBCLFVBQTFCLEVBQXNDLEtBQXRDLEVBQTZDOzhCQURwQyxhQUNvQzs7c0VBRHBDLHdCQUVDLGNBQWMsVUFBVSxZQUFZLE9BQU8sUUFEUjtLQUE3Qzs7V0FEUztFQUFvQjs7SUFNcEI7OztBQUNULGFBRFMsMkJBQ1QsQ0FBWSxZQUFaLEVBQTBCLFVBQTFCLEVBQXNDLEtBQXRDLEVBQTZDOzhCQURwQyw2QkFDb0M7OzRFQURwQyx3Q0FFQyxjQUFjLDRCQUE0QixZQUFZLE9BQU8sUUFEMUI7O0FBRXpDLGVBQUssUUFBTCxDQUFjLE1BQU0sRUFBTixFQUNOLHlCQUNJLG1CQUFTLFlBQVQsRUFDQSxNQUFNLEVBQU4sRUFDQSxLQUhKLEVBSUksSUFKSixFQUtJLElBTEosRUFNSSxJQU5KLENBRFIsRUFGeUM7QUFXekMsZUFBSyx1QkFBTCxHQUErQixJQUEvQixDQVh5Qzs7S0FBN0M7O1dBRFM7RUFBb0M7O0lBZ0JwQzs7O0FBQ1QsYUFEUyxVQUNULENBQVksWUFBWixFQUEwQixVQUExQixFQUFzQyxLQUF0QyxFQUE2Qzs4QkFEcEMsWUFDb0M7O3NFQURwQyx1QkFFQyxjQUFjLFNBQVMsWUFBWSxPQUFPLFFBRFA7S0FBN0M7O1dBRFM7RUFBbUI7O0lBTW5COzs7QUFDVCxhQURTLFNBQ1QsQ0FBWSxZQUFaLEVBQTBCLFVBQTFCLEVBQXNDLEtBQXRDLEVBQTZDOzhCQURwQyxXQUNvQzs7c0VBRHBDLHNCQUVDLGNBQWMsUUFBUSxZQUFZLE9BQU8sUUFETjtLQUE3Qzs7aUJBRFM7O2dDQUtELGNBQWM7QUFDbEIsZ0JBQUksS0FBSyx1QkFBTCxDQUE2QixZQUE3QixDQUFKLEVBQWdEO0FBQzVDLGtEQVBDLGtEQU9vQixhQUFyQixDQUQ0QzthQUFoRDs7QUFJQSxpQkFBSyxJQUFJLElBQUksQ0FBSixFQUFPLEtBQUssS0FBSyxNQUFMLENBQVksTUFBWixFQUFvQixJQUFJLEVBQUosRUFBUSxFQUFFLENBQUYsRUFBSztBQUNsRCxvQkFBSSxNQUFNLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBTixDQUQ4QztBQUVsRCxvQkFBSSxPQUFKLEdBQWMsSUFBZCxDQUZrRDtBQUdsRCxxQkFBSyxzQkFBTCxDQUE0QixHQUE1QixFQUhrRDthQUF0RDtBQUtBLGlCQUFLLE1BQUwsR0FBYyxJQUFkLENBVmtCOztBQVlsQixtQkFBTyxLQUFLLEtBQUwsQ0FaVzs7OztXQUxiO0VBQWtCOztJQXFCbEI7OztBQUNULGFBRFMsUUFDVCxDQUFZLFlBQVosRUFBMEIsVUFBMUIsRUFBc0MsS0FBdEMsRUFBNkM7OEJBRHBDLFVBQ29DOztzRUFEcEMscUJBRUMsY0FBYyxPQUFPLFlBQVksT0FBTyxRQURMO0tBQTdDOztXQURTO0VBQWlCOztJQU1qQjs7O0FBQ1QsYUFEUyxVQUNULENBQVksWUFBWixFQUEwQixVQUExQixFQUFzQyxLQUF0QyxFQUE2Qzs4QkFEcEMsWUFDb0M7O3NFQURwQyx1QkFFQyxjQUFjLFNBQVMsWUFBWSxPQUFPLFFBRFA7S0FBN0M7O1dBRFM7RUFBbUI7O0lBTW5COzs7QUFDVCxhQURTLFdBQ1QsQ0FBWSxZQUFaLEVBQTBCLFVBQTFCLEVBQXNDLEtBQXRDLEVBQTZDOzhCQURwQyxhQUNvQzs7c0VBRHBDLHdCQUVDLGNBQWMsVUFBVSxZQUFZLE9BQU8sUUFEUjtLQUE3Qzs7V0FEUztFQUFvQjs7SUFNcEI7OztBQUNULGFBRFMsYUFDVCxDQUFZLFlBQVosRUFBMEIsVUFBMUIsRUFBc0MsS0FBdEMsRUFBNkMsa0JBQTdDLEVBQWlFOzhCQUR4RCxlQUN3RDs7Ozs7NEVBRHhELDBCQUVDLGNBQWMsWUFBWSxZQUFZLE9BQU8scUJBRFU7O0FBSzdELFlBQUksT0FBSyxLQUFMLENBQVcsSUFBWCxLQUFvQixtQkFBTyx1QkFBUCxFQUFnQztBQUNwRCxtQkFBSyxpQkFBTCxHQURvRDtTQUF4RDtzQkFMNkQ7S0FBakU7O2lCQURTOztrREFXaUI7Ozs7Ozs7OztBQVN0QixnQkFBSSxLQUFLLEtBQUwsQ0FBVyxJQUFYLEtBQW9CLG1CQUFPLHVCQUFQLEVBQWdDO0FBQ3BELHVCQUFPLEtBQVAsQ0FEb0Q7YUFBeEQ7O0FBSUEsZ0JBQUksQ0FBQyxLQUFLLFFBQUwsRUFBRCxFQUFrQjtBQUNsQix1QkFBTyxJQUFQLENBRGtCO2FBQXRCOztBQUlBLGdCQUFJLFdBQVcsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLFdBQWIsQ0FBWCxDQWpCa0I7QUFrQnRCLGtDQUFPLFFBQVAsRUFBaUIsaUNBQWpCLEVBbEJzQjtBQW1CdEIsbUJBQU8sU0FBUyxPQUFULElBQW9CLFNBQVMsVUFBVCxDQUFvQixNQUFwQixLQUFnQyxDQUFoQyxDQW5CTDs7Ozs2Q0FzQkw7QUFDakIsZ0JBQUksQ0FBQyxLQUFLLFFBQUwsRUFBRCxFQUFrQjtBQUNsQix1QkFBTyxJQUFQLENBRGtCO2FBQXRCO0FBR0EsbUJBQU8sS0FBSyxTQUFMLENBSlU7Ozs7NENBT0Q7QUFDaEIsaUJBQUssZUFBTCxDQUNRLFdBRFIsRUFFUSxLQUFLLEdBQUwsRUFDQSxLQUFLLFNBQUwsRUFDQSxJQUpSLEVBS1EsSUFMUixFQURnQjtBQU9oQixpQkFBSyxNQUFMLENBQVksR0FBWixDQUFnQixXQUFoQixFQUE2QixJQUE3QixFQVBnQjs7OztXQXhDWDtFQUFzQjs7SUFtRHRCOzs7QUFDVCxhQURTLFFBQ1QsQ0FBWSxZQUFaLEVBQTBCLFVBQTFCLEVBQXNDLEtBQXRDLEVBQTZDOzhCQURwQyxVQUNvQzs7c0VBRHBDLHFCQUVDLGNBQWMsT0FBTyxZQUFZLE9BQU8sUUFETDtLQUE3Qzs7V0FEUztFQUFpQjs7SUFNakI7OztBQUNULGFBRFMsVUFDVCxDQUFZLFlBQVosRUFBMEIsVUFBMUIsRUFBc0MsS0FBdEMsRUFBNkM7OEJBRHBDLFlBQ29DOztzRUFEcEMsdUJBRUMsY0FBYyxTQUFTLFlBQVksT0FBTyxRQURQO0tBQTdDOztXQURTO0VBQW1CIiwiZmlsZSI6InNjb3BlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgQ29weXJpZ2h0IChDKSAyMDE1IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG5pbXBvcnQgeyBTeW50YXggfSBmcm9tICdlc3RyYXZlcnNlJztcbmltcG9ydCBNYXAgZnJvbSAnZXM2LW1hcCc7XG5cbmltcG9ydCBSZWZlcmVuY2UgZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IFZhcmlhYmxlIGZyb20gJy4vdmFyaWFibGUnO1xuaW1wb3J0IERlZmluaXRpb24gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuZnVuY3Rpb24gaXNTdHJpY3RTY29wZShzY29wZSwgYmxvY2ssIGlzTWV0aG9kRGVmaW5pdGlvbiwgdXNlRGlyZWN0aXZlKSB7XG4gICAgdmFyIGJvZHksIGksIGl6LCBzdG10LCBleHByO1xuXG4gICAgLy8gV2hlbiB1cHBlciBzY29wZSBpcyBleGlzdHMgYW5kIHN0cmljdCwgaW5uZXIgc2NvcGUgaXMgYWxzbyBzdHJpY3QuXG4gICAgaWYgKHNjb3BlLnVwcGVyICYmIHNjb3BlLnVwcGVyLmlzU3RyaWN0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFycm93RnVuY3Rpb25FeHByZXNzaW9uJ3Mgc2NvcGUgaXMgYWx3YXlzIHN0cmljdCBzY29wZS5cbiAgICBpZiAoYmxvY2sudHlwZSA9PT0gU3ludGF4LkFycm93RnVuY3Rpb25FeHByZXNzaW9uKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChpc01ldGhvZERlZmluaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLnR5cGUgPT09ICdjbGFzcycgfHwgc2NvcGUudHlwZSA9PT0gJ21vZHVsZScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLnR5cGUgPT09ICdibG9jaycgfHwgc2NvcGUudHlwZSA9PT0gJ3N3aXRjaCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzY29wZS50eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChibG9jay50eXBlID09PSBTeW50YXguUHJvZ3JhbSkge1xuICAgICAgICAgICAgYm9keSA9IGJsb2NrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IGJsb2NrLmJvZHk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNjb3BlLnR5cGUgPT09ICdnbG9iYWwnKSB7XG4gICAgICAgIGJvZHkgPSBibG9jaztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoICd1c2Ugc3RyaWN0JyBkaXJlY3RpdmUuXG4gICAgaWYgKHVzZURpcmVjdGl2ZSkge1xuICAgICAgICBmb3IgKGkgPSAwLCBpeiA9IGJvZHkuYm9keS5sZW5ndGg7IGkgPCBpejsgKytpKSB7XG4gICAgICAgICAgICBzdG10ID0gYm9keS5ib2R5W2ldO1xuICAgICAgICAgICAgaWYgKHN0bXQudHlwZSAhPT0gU3ludGF4LkRpcmVjdGl2ZVN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0bXQucmF3ID09PSAnXCJ1c2Ugc3RyaWN0XCInIHx8IHN0bXQucmF3ID09PSAnXFwndXNlIHN0cmljdFxcJycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDAsIGl6ID0gYm9keS5ib2R5Lmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIHN0bXQgPSBib2R5LmJvZHlbaV07XG4gICAgICAgICAgICBpZiAoc3RtdC50eXBlICE9PSBTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhwciA9IHN0bXQuZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIGlmIChleHByLnR5cGUgIT09IFN5bnRheC5MaXRlcmFsIHx8IHR5cGVvZiBleHByLnZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4cHIucmF3ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXhwci5yYXcgPT09ICdcInVzZSBzdHJpY3RcIicgfHwgZXhwci5yYXcgPT09ICdcXCd1c2Ugc3RyaWN0XFwnJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChleHByLnZhbHVlID09PSAndXNlIHN0cmljdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTY29wZShzY29wZU1hbmFnZXIsIHNjb3BlKSB7XG4gICAgdmFyIHNjb3BlcztcblxuICAgIHNjb3BlTWFuYWdlci5zY29wZXMucHVzaChzY29wZSk7XG5cbiAgICBzY29wZXMgPSBzY29wZU1hbmFnZXIuX19ub2RlVG9TY29wZS5nZXQoc2NvcGUuYmxvY2spO1xuICAgIGlmIChzY29wZXMpIHtcbiAgICAgICAgc2NvcGVzLnB1c2goc2NvcGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNjb3BlTWFuYWdlci5fX25vZGVUb1Njb3BlLnNldChzY29wZS5ibG9jaywgWyBzY29wZSBdKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZEJlU3RhdGljYWxseShkZWYpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAoZGVmLnR5cGUgPT09IFZhcmlhYmxlLkNsYXNzTmFtZSkgfHxcbiAgICAgICAgKGRlZi50eXBlID09PSBWYXJpYWJsZS5WYXJpYWJsZSAmJiBkZWYucGFyZW50LmtpbmQgIT09ICd2YXInKVxuICAgICk7XG59XG5cbi8qKlxuICogQGNsYXNzIFNjb3BlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZU1hbmFnZXIsIHR5cGUsIHVwcGVyU2NvcGUsIGJsb2NrLCBpc01ldGhvZERlZmluaXRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9uZSBvZiAnVERaJywgJ21vZHVsZScsICdibG9jaycsICdzd2l0Y2gnLCAnZnVuY3Rpb24nLCAnY2F0Y2gnLCAnd2l0aCcsICdmdW5jdGlvbicsICdjbGFzcycsICdnbG9iYWwnLlxuICAgICAgICAgKiBAbWVtYmVyIHtTdHJpbmd9IFNjb3BlI3R5cGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHNjb3BlZCB7QGxpbmsgVmFyaWFibGV9cyBvZiB0aGlzIHNjb3BlLCBhcyA8Y29kZT57IFZhcmlhYmxlLm5hbWVcbiAgICAgICAgICogOiBWYXJpYWJsZSB9PC9jb2RlPi5cbiAgICAgICAgICogQG1lbWJlciB7TWFwfSBTY29wZSNzZXRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0ID0gbmV3IE1hcCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHRhaW50ZWQgdmFyaWFibGVzIG9mIHRoaXMgc2NvcGUsIGFzIDxjb2RlPnsgVmFyaWFibGUubmFtZSA6XG4gICAgICAgICAqIGJvb2xlYW4gfTwvY29kZT4uXG4gICAgICAgICAqIEBtZW1iZXIge01hcH0gU2NvcGUjdGFpbnRzICovXG4gICAgICAgIHRoaXMudGFpbnRzID0gbmV3IE1hcCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhbGx5LCB0aHJvdWdoIHRoZSBsZXhpY2FsIHNjb3Bpbmcgb2YgSlMgeW91IGNhbiBhbHdheXMga25vd1xuICAgICAgICAgKiB3aGljaCB2YXJpYWJsZSBhbiBpZGVudGlmaWVyIGluIHRoZSBzb3VyY2UgY29kZSByZWZlcnMgdG8uIFRoZXJlIGFyZVxuICAgICAgICAgKiBhIGZldyBleGNlcHRpb25zIHRvIHRoaXMgcnVsZS4gV2l0aCAnZ2xvYmFsJyBhbmQgJ3dpdGgnIHNjb3BlcyB5b3VcbiAgICAgICAgICogY2FuIG9ubHkgZGVjaWRlIGF0IHJ1bnRpbWUgd2hpY2ggdmFyaWFibGUgYSByZWZlcmVuY2UgcmVmZXJzIHRvLlxuICAgICAgICAgKiBNb3Jlb3ZlciwgaWYgJ2V2YWwoKScgaXMgdXNlZCBpbiBhIHNjb3BlLCBpdCBtaWdodCBpbnRyb2R1Y2UgbmV3XG4gICAgICAgICAqIGJpbmRpbmdzIGluIHRoaXMgb3IgaXRzIHBhcmVudCBzY29wZXMuXG4gICAgICAgICAqIEFsbCB0aG9zZSBzY29wZXMgYXJlIGNvbnNpZGVyZWQgJ2R5bmFtaWMnLlxuICAgICAgICAgKiBAbWVtYmVyIHtib29sZWFufSBTY29wZSNkeW5hbWljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmR5bmFtaWMgPSB0aGlzLnR5cGUgPT09ICdnbG9iYWwnIHx8IHRoaXMudHlwZSA9PT0gJ3dpdGgnO1xuICAgICAgICAvKipcbiAgICAgICAgICogQSByZWZlcmVuY2UgdG8gdGhlIHNjb3BlLWRlZmluaW5nIHN5bnRheCBub2RlLlxuICAgICAgICAgKiBAbWVtYmVyIHtlc3ByaW1hLk5vZGV9IFNjb3BlI2Jsb2NrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrID0gYmxvY2s7XG4gICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHtAbGluayBSZWZlcmVuY2V8cmVmZXJlbmNlc30gdGhhdCBhcmUgbm90IHJlc29sdmVkIHdpdGggdGhpcyBzY29wZS5cbiAgICAgICAgICogQG1lbWJlciB7UmVmZXJlbmNlW119IFNjb3BlI3Rocm91Z2hcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGhyb3VnaCA9IFtdO1xuICAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBzY29wZWQge0BsaW5rIFZhcmlhYmxlfXMgb2YgdGhpcyBzY29wZS4gSW4gdGhlIGNhc2Ugb2YgYVxuICAgICAgICAgKiAnZnVuY3Rpb24nIHNjb3BlIHRoaXMgaW5jbHVkZXMgdGhlIGF1dG9tYXRpYyBhcmd1bWVudCA8ZW0+YXJndW1lbnRzPC9lbT4gYXNcbiAgICAgICAgICogaXRzIGZpcnN0IGVsZW1lbnQsIGFzIHdlbGwgYXMgYWxsIGZ1cnRoZXIgZm9ybWFsIGFyZ3VtZW50cy5cbiAgICAgICAgICogQG1lbWJlciB7VmFyaWFibGVbXX0gU2NvcGUjdmFyaWFibGVzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IFtdO1xuICAgICAgICAgLyoqXG4gICAgICAgICAqIEFueSB2YXJpYWJsZSB7QGxpbmsgUmVmZXJlbmNlfHJlZmVyZW5jZX0gZm91bmQgaW4gdGhpcyBzY29wZS4gVGhpc1xuICAgICAgICAgKiBpbmNsdWRlcyBvY2N1cnJlbmNlcyBvZiBsb2NhbCB2YXJpYWJsZXMgYXMgd2VsbCBhcyB2YXJpYWJsZXMgZnJvbVxuICAgICAgICAgKiBwYXJlbnQgc2NvcGVzIChpbmNsdWRpbmcgdGhlIGdsb2JhbCBzY29wZSkuIEZvciBsb2NhbCB2YXJpYWJsZXNcbiAgICAgICAgICogdGhpcyBhbHNvIGluY2x1ZGVzIGRlZmluaW5nIG9jY3VycmVuY2VzIChsaWtlIGluIGEgJ3Zhcicgc3RhdGVtZW50KS5cbiAgICAgICAgICogSW4gYSAnZnVuY3Rpb24nIHNjb3BlIHRoaXMgZG9lcyBub3QgaW5jbHVkZSB0aGUgb2NjdXJyZW5jZXMgb2YgdGhlXG4gICAgICAgICAqIGZvcm1hbCBwYXJhbWV0ZXIgaW4gdGhlIHBhcmFtZXRlciBsaXN0LlxuICAgICAgICAgKiBAbWVtYmVyIHtSZWZlcmVuY2VbXX0gU2NvcGUjcmVmZXJlbmNlc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWZlcmVuY2VzID0gW107XG5cbiAgICAgICAgIC8qKlxuICAgICAgICAgKiBGb3IgJ2dsb2JhbCcgYW5kICdmdW5jdGlvbicgc2NvcGVzLCB0aGlzIGlzIGEgc2VsZi1yZWZlcmVuY2UuIEZvclxuICAgICAgICAgKiBvdGhlciBzY29wZSB0eXBlcyB0aGlzIGlzIHRoZSA8ZW0+dmFyaWFibGVTY29wZTwvZW0+IHZhbHVlIG9mIHRoZVxuICAgICAgICAgKiBwYXJlbnQgc2NvcGUuXG4gICAgICAgICAqIEBtZW1iZXIge1Njb3BlfSBTY29wZSN2YXJpYWJsZVNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnZhcmlhYmxlU2NvcGUgPVxuICAgICAgICAgICAgKHRoaXMudHlwZSA9PT0gJ2dsb2JhbCcgfHwgdGhpcy50eXBlID09PSAnZnVuY3Rpb24nIHx8IHRoaXMudHlwZSA9PT0gJ21vZHVsZScpID8gdGhpcyA6IHVwcGVyU2NvcGUudmFyaWFibGVTY29wZTtcbiAgICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHRoaXMgc2NvcGUgaXMgY3JlYXRlZCBieSBhIEZ1bmN0aW9uRXhwcmVzc2lvbi5cbiAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gU2NvcGUjZnVuY3Rpb25FeHByZXNzaW9uU2NvcGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZnVuY3Rpb25FeHByZXNzaW9uU2NvcGUgPSBmYWxzZTtcbiAgICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHRoaXMgaXMgYSBzY29wZSB0aGF0IGNvbnRhaW5zIGFuICdldmFsKCknIGludm9jYXRpb24uXG4gICAgICAgICAqIEBtZW1iZXIge2Jvb2xlYW59IFNjb3BlI2RpcmVjdENhbGxUb0V2YWxTY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXJlY3RDYWxsVG9FdmFsU2NvcGUgPSBmYWxzZTtcbiAgICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtib29sZWFufSBTY29wZSN0aGlzRm91bmRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGhpc0ZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fX2xlZnQgPSBbXTtcblxuICAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZmVyZW5jZSB0byB0aGUgcGFyZW50IHtAbGluayBTY29wZXxzY29wZX0uXG4gICAgICAgICAqIEBtZW1iZXIge1Njb3BlfSBTY29wZSN1cHBlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51cHBlciA9IHVwcGVyU2NvcGU7XG4gICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciAndXNlIHN0cmljdCcgaXMgaW4gZWZmZWN0IGluIHRoaXMgc2NvcGUuXG4gICAgICAgICAqIEBtZW1iZXIge2Jvb2xlYW59IFNjb3BlI2lzU3RyaWN0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzU3RyaWN0ID0gaXNTdHJpY3RTY29wZSh0aGlzLCBibG9jaywgaXNNZXRob2REZWZpbml0aW9uLCBzY29wZU1hbmFnZXIuX191c2VEaXJlY3RpdmUoKSk7XG5cbiAgICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0IG9mIG5lc3RlZCB7QGxpbmsgU2NvcGV9cy5cbiAgICAgICAgICogQG1lbWJlciB7U2NvcGVbXX0gU2NvcGUjY2hpbGRTY29wZXNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hpbGRTY29wZXMgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMudXBwZXIpIHtcbiAgICAgICAgICAgIHRoaXMudXBwZXIuY2hpbGRTY29wZXMucHVzaCh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX19kZWNsYXJlZFZhcmlhYmxlcyA9IHNjb3BlTWFuYWdlci5fX2RlY2xhcmVkVmFyaWFibGVzO1xuXG4gICAgICAgIHJlZ2lzdGVyU2NvcGUoc2NvcGVNYW5hZ2VyLCB0aGlzKTtcbiAgICB9XG5cbiAgICBfX3Nob3VsZFN0YXRpY2FsbHlDbG9zZShzY29wZU1hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuICghdGhpcy5keW5hbWljIHx8IHNjb3BlTWFuYWdlci5fX2lzT3B0aW1pc3RpYygpKTtcbiAgICB9XG5cbiAgICBfX3Nob3VsZFN0YXRpY2FsbHlDbG9zZUZvckdsb2JhbChyZWYpIHtcbiAgICAgICAgLy8gT24gZ2xvYmFsIHNjb3BlLCBsZXQvY29uc3QvY2xhc3MgZGVjbGFyYXRpb25zIHNob3VsZCBiZSByZXNvbHZlZCBzdGF0aWNhbGx5LlxuICAgICAgICB2YXIgbmFtZSA9IHJlZi5pZGVudGlmaWVyLm5hbWU7XG4gICAgICAgIGlmICghdGhpcy5zZXQuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdmFyaWFibGUgPSB0aGlzLnNldC5nZXQobmFtZSk7XG4gICAgICAgIHZhciBkZWZzID0gdmFyaWFibGUuZGVmcztcbiAgICAgICAgcmV0dXJuIGRlZnMubGVuZ3RoID4gMCAmJiBkZWZzLmV2ZXJ5KHNob3VsZEJlU3RhdGljYWxseSk7XG4gICAgfVxuXG4gICAgX19zdGF0aWNDbG9zZVJlZihyZWYpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9fcmVzb2x2ZShyZWYpKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGVsZWdhdGVUb1VwcGVyU2NvcGUocmVmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9fZHluYW1pY0Nsb3NlUmVmKHJlZikge1xuICAgICAgICAvLyBub3RpZnkgYWxsIG5hbWVzIGFyZSB0aHJvdWdoIHRvIGdsb2JhbFxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXM7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGN1cnJlbnQudGhyb3VnaC5wdXNoKHJlZik7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC51cHBlcjtcbiAgICAgICAgfSB3aGlsZSAoY3VycmVudCk7XG4gICAgfVxuXG4gICAgX19nbG9iYWxDbG9zZVJlZihyZWYpIHtcbiAgICAgICAgLy8gbGV0L2NvbnN0L2NsYXNzIGRlY2xhcmF0aW9ucyBzaG91bGQgYmUgcmVzb2x2ZWQgc3RhdGljYWxseS5cbiAgICAgICAgLy8gb3RoZXJzIHNob3VsZCBiZSByZXNvbHZlZCBkeW5hbWljYWxseS5cbiAgICAgICAgaWYgKHRoaXMuX19zaG91bGRTdGF0aWNhbGx5Q2xvc2VGb3JHbG9iYWwocmVmKSkge1xuICAgICAgICAgICAgdGhpcy5fX3N0YXRpY0Nsb3NlUmVmKHJlZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9fZHluYW1pY0Nsb3NlUmVmKHJlZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfX2Nsb3NlKHNjb3BlTWFuYWdlcikge1xuICAgICAgICB2YXIgY2xvc2VSZWY7XG4gICAgICAgIGlmICh0aGlzLl9fc2hvdWxkU3RhdGljYWxseUNsb3NlKHNjb3BlTWFuYWdlcikpIHtcbiAgICAgICAgICAgIGNsb3NlUmVmID0gdGhpcy5fX3N0YXRpY0Nsb3NlUmVmO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSAhPT0gJ2dsb2JhbCcpIHtcbiAgICAgICAgICAgIGNsb3NlUmVmID0gdGhpcy5fX2R5bmFtaWNDbG9zZVJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb3NlUmVmID0gdGhpcy5fX2dsb2JhbENsb3NlUmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJ5IFJlc29sdmluZyBhbGwgcmVmZXJlbmNlcyBpbiB0aGlzIHNjb3BlLlxuICAgICAgICBmb3IgKGxldCBpID0gMCwgaXogPSB0aGlzLl9fbGVmdC5sZW5ndGg7IGkgPCBpejsgKytpKSB7XG4gICAgICAgICAgICBsZXQgcmVmID0gdGhpcy5fX2xlZnRbaV07XG4gICAgICAgICAgICBjbG9zZVJlZi5jYWxsKHRoaXMsIHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2xlZnQgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnVwcGVyO1xuICAgIH1cblxuICAgIF9fcmVzb2x2ZShyZWYpIHtcbiAgICAgICAgdmFyIHZhcmlhYmxlLCBuYW1lO1xuICAgICAgICBuYW1lID0gcmVmLmlkZW50aWZpZXIubmFtZTtcbiAgICAgICAgaWYgKHRoaXMuc2V0LmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgdmFyaWFibGUgPSB0aGlzLnNldC5nZXQobmFtZSk7XG4gICAgICAgICAgICB2YXJpYWJsZS5yZWZlcmVuY2VzLnB1c2gocmVmKTtcbiAgICAgICAgICAgIHZhcmlhYmxlLnN0YWNrID0gdmFyaWFibGUuc3RhY2sgJiYgcmVmLmZyb20udmFyaWFibGVTY29wZSA9PT0gdGhpcy52YXJpYWJsZVNjb3BlO1xuICAgICAgICAgICAgaWYgKHJlZi50YWludGVkKSB7XG4gICAgICAgICAgICAgICAgdmFyaWFibGUudGFpbnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50YWludHMuc2V0KHZhcmlhYmxlLm5hbWUsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmLnJlc29sdmVkID0gdmFyaWFibGU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX19kZWxlZ2F0ZVRvVXBwZXJTY29wZShyZWYpIHtcbiAgICAgICAgaWYgKHRoaXMudXBwZXIpIHtcbiAgICAgICAgICAgIHRoaXMudXBwZXIuX19sZWZ0LnB1c2gocmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRocm91Z2gucHVzaChyZWYpO1xuICAgIH1cblxuICAgIF9fYWRkRGVjbGFyZWRWYXJpYWJsZXNPZk5vZGUodmFyaWFibGUsIG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZhcmlhYmxlcyA9IHRoaXMuX19kZWNsYXJlZFZhcmlhYmxlcy5nZXQobm9kZSk7XG4gICAgICAgIGlmICh2YXJpYWJsZXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyaWFibGVzID0gW107XG4gICAgICAgICAgICB0aGlzLl9fZGVjbGFyZWRWYXJpYWJsZXMuc2V0KG5vZGUsIHZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhcmlhYmxlcy5pbmRleE9mKHZhcmlhYmxlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlcy5wdXNoKHZhcmlhYmxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9fZGVmaW5lR2VuZXJpYyhuYW1lLCBzZXQsIHZhcmlhYmxlcywgbm9kZSwgZGVmKSB7XG4gICAgICAgIHZhciB2YXJpYWJsZTtcblxuICAgICAgICB2YXJpYWJsZSA9IHNldC5nZXQobmFtZSk7XG4gICAgICAgIGlmICghdmFyaWFibGUpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlID0gbmV3IFZhcmlhYmxlKG5hbWUsIHRoaXMpO1xuICAgICAgICAgICAgc2V0LnNldChuYW1lLCB2YXJpYWJsZSk7XG4gICAgICAgICAgICB2YXJpYWJsZXMucHVzaCh2YXJpYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICB2YXJpYWJsZS5kZWZzLnB1c2goZGVmKTtcbiAgICAgICAgICAgIGlmIChkZWYudHlwZSAhPT0gVmFyaWFibGUuVERaKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2FkZERlY2xhcmVkVmFyaWFibGVzT2ZOb2RlKHZhcmlhYmxlLCBkZWYubm9kZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2FkZERlY2xhcmVkVmFyaWFibGVzT2ZOb2RlKHZhcmlhYmxlLCBkZWYucGFyZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgdmFyaWFibGUuaWRlbnRpZmllcnMucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9fZGVmaW5lKG5vZGUsIGRlZikge1xuICAgICAgICBpZiAobm9kZSAmJiBub2RlLnR5cGUgPT09IFN5bnRheC5JZGVudGlmaWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGVmaW5lR2VuZXJpYyhcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YXJpYWJsZXMsXG4gICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGRlZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfX3JlZmVyZW5jaW5nKG5vZGUsIGFzc2lnbiwgd3JpdGVFeHByLCBtYXliZUltcGxpY2l0R2xvYmFsLCBwYXJ0aWFsLCBpbml0KSB7XG4gICAgICAgIC8vIGJlY2F1c2UgQXJyYXkgZWxlbWVudCBtYXkgYmUgbnVsbFxuICAgICAgICBpZiAoIW5vZGUgfHwgbm9kZS50eXBlICE9PSBTeW50YXguSWRlbnRpZmllcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BlY2lhbGx5IGhhbmRsZSBsaWtlIGB0aGlzYC5cbiAgICAgICAgaWYgKG5vZGUubmFtZSA9PT0gJ3N1cGVyJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlZiA9IG5ldyBSZWZlcmVuY2Uobm9kZSwgdGhpcywgYXNzaWduIHx8IFJlZmVyZW5jZS5SRUFELCB3cml0ZUV4cHIsIG1heWJlSW1wbGljaXRHbG9iYWwsICEhcGFydGlhbCwgISFpbml0KTtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2VzLnB1c2gocmVmKTtcbiAgICAgICAgdGhpcy5fX2xlZnQucHVzaChyZWYpO1xuICAgIH1cblxuICAgIF9fZGV0ZWN0RXZhbCgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQ7XG4gICAgICAgIGN1cnJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLmRpcmVjdENhbGxUb0V2YWxTY29wZSA9IHRydWU7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGN1cnJlbnQuZHluYW1pYyA9IHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC51cHBlcjtcbiAgICAgICAgfSB3aGlsZSAoY3VycmVudCk7XG4gICAgfVxuXG4gICAgX19kZXRlY3RUaGlzKCkge1xuICAgICAgICB0aGlzLnRoaXNGb3VuZCA9IHRydWU7XG4gICAgfVxuXG4gICAgX19pc0Nsb3NlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sZWZ0ID09PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgcmVzb2x2ZWQge1JlZmVyZW5jZX1cbiAgICAgKiBAbWV0aG9kIFNjb3BlI3Jlc29sdmVcbiAgICAgKiBAcGFyYW0ge0VzcHJpbWEuSWRlbnRpZmllcn0gaWRlbnQgLSBpZGVudGlmaWVyIHRvIGJlIHJlc29sdmVkLlxuICAgICAqIEByZXR1cm4ge1JlZmVyZW5jZX1cbiAgICAgKi9cbiAgICByZXNvbHZlKGlkZW50KSB7XG4gICAgICAgIHZhciByZWYsIGksIGl6O1xuICAgICAgICBhc3NlcnQodGhpcy5fX2lzQ2xvc2VkKCksICdTY29wZSBzaG91bGQgYmUgY2xvc2VkLicpO1xuICAgICAgICBhc3NlcnQoaWRlbnQudHlwZSA9PT0gU3ludGF4LklkZW50aWZpZXIsICdUYXJnZXQgc2hvdWxkIGJlIGlkZW50aWZpZXIuJyk7XG4gICAgICAgIGZvciAoaSA9IDAsIGl6ID0gdGhpcy5yZWZlcmVuY2VzLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIHJlZiA9IHRoaXMucmVmZXJlbmNlc1tpXTtcbiAgICAgICAgICAgIGlmIChyZWYuaWRlbnRpZmllciA9PT0gaWRlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdGhpcyBzY29wZSBpcyBzdGF0aWNcbiAgICAgKiBAbWV0aG9kIFNjb3BlI2lzU3RhdGljXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1N0YXRpYygpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmR5bmFtaWM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGlzIHNjb3BlIGhhcyBtYXRlcmlhbGl6ZWQgYXJndW1lbnRzXG4gICAgICogQG1ldGhvZCBTY29wZSNpc0FyZ3VtZW50c01hdGVyaWFsaXplZFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNBcmd1bWVudHNNYXRlcmlhbGl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdGhpcyBzY29wZSBoYXMgbWF0ZXJpYWxpemVkIGB0aGlzYCByZWZlcmVuY2VcbiAgICAgKiBAbWV0aG9kIFNjb3BlI2lzVGhpc01hdGVyaWFsaXplZFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNUaGlzTWF0ZXJpYWxpemVkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpc1VzZWROYW1lKG5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0LmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGl6ID0gdGhpcy50aHJvdWdoLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRocm91Z2hbaV0uaWRlbnRpZmllci5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdsb2JhbFNjb3BlIGV4dGVuZHMgU2NvcGUge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlTWFuYWdlciwgYmxvY2spIHtcbiAgICAgICAgc3VwZXIoc2NvcGVNYW5hZ2VyLCAnZ2xvYmFsJywgbnVsbCwgYmxvY2ssIGZhbHNlKTtcbiAgICAgICAgdGhpcy5pbXBsaWNpdCA9IHtcbiAgICAgICAgICAgIHNldDogbmV3IE1hcCgpLFxuICAgICAgICAgICAgdmFyaWFibGVzOiBbXSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0IG9mIHtAbGluayBSZWZlcmVuY2V9cyB0aGF0IGFyZSBsZWZ0IHRvIGJlIHJlc29sdmVkIChpLmUuIHdoaWNoXG4gICAgICAgICAgICAqIG5lZWQgdG8gYmUgbGlua2VkIHRvIHRoZSB2YXJpYWJsZSB0aGV5IHJlZmVyIHRvKS5cbiAgICAgICAgICAgICogQG1lbWJlciB7UmVmZXJlbmNlW119IFNjb3BlI2ltcGxpY2l0I2xlZnRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZWZ0OiBbXVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9fY2xvc2Uoc2NvcGVNYW5hZ2VyKSB7XG4gICAgICAgIGxldCBpbXBsaWNpdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgaXogPSB0aGlzLl9fbGVmdC5sZW5ndGg7IGkgPCBpejsgKytpKSB7XG4gICAgICAgICAgICBsZXQgcmVmID0gdGhpcy5fX2xlZnRbaV07XG4gICAgICAgICAgICBpZiAocmVmLl9fbWF5YmVJbXBsaWNpdEdsb2JhbCAmJiAhdGhpcy5zZXQuaGFzKHJlZi5pZGVudGlmaWVyLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgaW1wbGljaXQucHVzaChyZWYuX19tYXliZUltcGxpY2l0R2xvYmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNyZWF0ZSBhbiBpbXBsaWNpdCBnbG9iYWwgdmFyaWFibGUgZnJvbSBhc3NpZ25tZW50IGV4cHJlc3Npb25cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGl6ID0gaW1wbGljaXQubGVuZ3RoOyBpIDwgaXo7ICsraSkge1xuICAgICAgICAgICAgbGV0IGluZm8gPSBpbXBsaWNpdFtpXTtcbiAgICAgICAgICAgIHRoaXMuX19kZWZpbmVJbXBsaWNpdChpbmZvLnBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuSW1wbGljaXRHbG9iYWxWYXJpYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ucGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ubm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbXBsaWNpdC5sZWZ0ID0gdGhpcy5fX2xlZnQ7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9fY2xvc2Uoc2NvcGVNYW5hZ2VyKTtcbiAgICB9XG5cbiAgICBfX2RlZmluZUltcGxpY2l0KG5vZGUsIGRlZikge1xuICAgICAgICBpZiAobm9kZSAmJiBub2RlLnR5cGUgPT09IFN5bnRheC5JZGVudGlmaWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGVmaW5lR2VuZXJpYyhcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltcGxpY2l0LnNldCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbXBsaWNpdC52YXJpYWJsZXMsXG4gICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGRlZik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb2R1bGVTY29wZSBleHRlbmRzIFNjb3BlIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZU1hbmFnZXIsIHVwcGVyU2NvcGUsIGJsb2NrKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlTWFuYWdlciwgJ21vZHVsZScsIHVwcGVyU2NvcGUsIGJsb2NrLCBmYWxzZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRnVuY3Rpb25FeHByZXNzaW9uTmFtZVNjb3BlIGV4dGVuZHMgU2NvcGUge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlTWFuYWdlciwgdXBwZXJTY29wZSwgYmxvY2spIHtcbiAgICAgICAgc3VwZXIoc2NvcGVNYW5hZ2VyLCAnZnVuY3Rpb24tZXhwcmVzc2lvbi1uYW1lJywgdXBwZXJTY29wZSwgYmxvY2ssIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fX2RlZmluZShibG9jay5pZCxcbiAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuRnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICBibG9jay5pZCxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgdGhpcy5mdW5jdGlvbkV4cHJlc3Npb25TY29wZSA9IHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2F0Y2hTY29wZSBleHRlbmRzIFNjb3BlIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZU1hbmFnZXIsIHVwcGVyU2NvcGUsIGJsb2NrKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlTWFuYWdlciwgJ2NhdGNoJywgdXBwZXJTY29wZSwgYmxvY2ssIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXaXRoU2NvcGUgZXh0ZW5kcyBTY29wZSB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGVNYW5hZ2VyLCB1cHBlclNjb3BlLCBibG9jaykge1xuICAgICAgICBzdXBlcihzY29wZU1hbmFnZXIsICd3aXRoJywgdXBwZXJTY29wZSwgYmxvY2ssIGZhbHNlKTtcbiAgICB9XG5cbiAgICBfX2Nsb3NlKHNjb3BlTWFuYWdlcikge1xuICAgICAgICBpZiAodGhpcy5fX3Nob3VsZFN0YXRpY2FsbHlDbG9zZShzY29wZU1hbmFnZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuX19jbG9zZShzY29wZU1hbmFnZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGl6ID0gdGhpcy5fX2xlZnQubGVuZ3RoOyBpIDwgaXo7ICsraSkge1xuICAgICAgICAgICAgbGV0IHJlZiA9IHRoaXMuX19sZWZ0W2ldO1xuICAgICAgICAgICAgcmVmLnRhaW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fX2RlbGVnYXRlVG9VcHBlclNjb3BlKHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2xlZnQgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnVwcGVyO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFREWlNjb3BlIGV4dGVuZHMgU2NvcGUge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlTWFuYWdlciwgdXBwZXJTY29wZSwgYmxvY2spIHtcbiAgICAgICAgc3VwZXIoc2NvcGVNYW5hZ2VyLCAnVERaJywgdXBwZXJTY29wZSwgYmxvY2ssIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCbG9ja1Njb3BlIGV4dGVuZHMgU2NvcGUge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlTWFuYWdlciwgdXBwZXJTY29wZSwgYmxvY2spIHtcbiAgICAgICAgc3VwZXIoc2NvcGVNYW5hZ2VyLCAnYmxvY2snLCB1cHBlclNjb3BlLCBibG9jaywgZmFsc2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN3aXRjaFNjb3BlIGV4dGVuZHMgU2NvcGUge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlTWFuYWdlciwgdXBwZXJTY29wZSwgYmxvY2spIHtcbiAgICAgICAgc3VwZXIoc2NvcGVNYW5hZ2VyLCAnc3dpdGNoJywgdXBwZXJTY29wZSwgYmxvY2ssIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvblNjb3BlIGV4dGVuZHMgU2NvcGUge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlTWFuYWdlciwgdXBwZXJTY29wZSwgYmxvY2ssIGlzTWV0aG9kRGVmaW5pdGlvbikge1xuICAgICAgICBzdXBlcihzY29wZU1hbmFnZXIsICdmdW5jdGlvbicsIHVwcGVyU2NvcGUsIGJsb2NrLCBpc01ldGhvZERlZmluaXRpb24pO1xuXG4gICAgICAgIC8vIHNlY3Rpb24gOS4yLjEzLCBGdW5jdGlvbkRlY2xhcmF0aW9uSW5zdGFudGlhdGlvbi5cbiAgICAgICAgLy8gTk9URSBBcnJvdyBmdW5jdGlvbnMgbmV2ZXIgaGF2ZSBhbiBhcmd1bWVudHMgb2JqZWN0cy5cbiAgICAgICAgaWYgKHRoaXMuYmxvY2sudHlwZSAhPT0gU3ludGF4LkFycm93RnVuY3Rpb25FeHByZXNzaW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGVmaW5lQXJndW1lbnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0FyZ3VtZW50c01hdGVyaWFsaXplZCgpIHtcbiAgICAgICAgLy8gVE9ETyhDb25zdGVsbGF0aW9uKVxuICAgICAgICAvLyBXZSBjYW4gbW9yZSBhZ2dyZXNzaXZlIG9uIHRoaXMgY29uZGl0aW9uIGxpa2UgdGhpcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gZnVuY3Rpb24gdCgpIHtcbiAgICAgICAgLy8gICAgIC8vIGFyZ3VtZW50cyBvZiB0IGlzIGFsd2F5cyBoaWRkZW4uXG4gICAgICAgIC8vICAgICBmdW5jdGlvbiBhcmd1bWVudHMoKSB7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cbiAgICAgICAgaWYgKHRoaXMuYmxvY2sudHlwZSA9PT0gU3ludGF4LkFycm93RnVuY3Rpb25FeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNTdGF0aWMoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmFyaWFibGUgPSB0aGlzLnNldC5nZXQoJ2FyZ3VtZW50cycpO1xuICAgICAgICBhc3NlcnQodmFyaWFibGUsICdBbHdheXMgaGF2ZSBhcmd1bWVudHMgdmFyaWFibGUuJyk7XG4gICAgICAgIHJldHVybiB2YXJpYWJsZS50YWludGVkIHx8IHZhcmlhYmxlLnJlZmVyZW5jZXMubGVuZ3RoICAhPT0gMDtcbiAgICB9XG5cbiAgICBpc1RoaXNNYXRlcmlhbGl6ZWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1N0YXRpYygpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50aGlzRm91bmQ7XG4gICAgfVxuXG4gICAgX19kZWZpbmVBcmd1bWVudHMoKSB7XG4gICAgICAgIHRoaXMuX19kZWZpbmVHZW5lcmljKFxuICAgICAgICAgICAgICAgICdhcmd1bWVudHMnLFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0LFxuICAgICAgICAgICAgICAgIHRoaXMudmFyaWFibGVzLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgbnVsbCk7XG4gICAgICAgIHRoaXMudGFpbnRzLnNldCgnYXJndW1lbnRzJywgdHJ1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9yU2NvcGUgZXh0ZW5kcyBTY29wZSB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGVNYW5hZ2VyLCB1cHBlclNjb3BlLCBibG9jaykge1xuICAgICAgICBzdXBlcihzY29wZU1hbmFnZXIsICdmb3InLCB1cHBlclNjb3BlLCBibG9jaywgZmFsc2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENsYXNzU2NvcGUgZXh0ZW5kcyBTY29wZSB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGVNYW5hZ2VyLCB1cHBlclNjb3BlLCBibG9jaykge1xuICAgICAgICBzdXBlcihzY29wZU1hbmFnZXIsICdjbGFzcycsIHVwcGVyU2NvcGUsIGJsb2NrLCBmYWxzZSk7XG4gICAgfVxufVxuXG4vKiB2aW06IHNldCBzdz00IHRzPTQgZXQgdHc9ODAgOiAqL1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

}, function(modId) { var map = {"./reference":1602510871641,"./variable":1602510871642,"./definition":1602510871643}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871641, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var READ = 0x1;
var WRITE = 0x2;
var RW = READ | WRITE;

/**
 * A Reference represents a single occurrence of an identifier in code.
 * @class Reference
 */

var Reference = function () {
  function Reference(ident, scope, flag, writeExpr, maybeImplicitGlobal, partial, init) {
    _classCallCheck(this, Reference);

    /**
     * Identifier syntax node.
     * @member {esprima#Identifier} Reference#identifier
     */
    this.identifier = ident;
    /**
     * Reference to the enclosing Scope.
     * @member {Scope} Reference#from
     */
    this.from = scope;
    /**
     * Whether the reference comes from a dynamic scope (such as 'eval',
     * 'with', etc.), and may be trapped by dynamic scopes.
     * @member {boolean} Reference#tainted
     */
    this.tainted = false;
    /**
     * The variable this reference is resolved with.
     * @member {Variable} Reference#resolved
     */
    this.resolved = null;
    /**
     * The read-write mode of the reference. (Value is one of {@link
     * Reference.READ}, {@link Reference.RW}, {@link Reference.WRITE}).
     * @member {number} Reference#flag
     * @private
     */
    this.flag = flag;
    if (this.isWrite()) {
      /**
       * If reference is writeable, this is the tree being written to it.
       * @member {esprima#Node} Reference#writeExpr
       */
      this.writeExpr = writeExpr;
      /**
       * Whether the Reference might refer to a partial value of writeExpr.
       * @member {boolean} Reference#partial
       */
      this.partial = partial;
      /**
       * Whether the Reference is to write of initialization.
       * @member {boolean} Reference#init
       */
      this.init = init;
    }
    this.__maybeImplicitGlobal = maybeImplicitGlobal;
  }

  /**
   * Whether the reference is static.
   * @method Reference#isStatic
   * @return {boolean}
   */


  _createClass(Reference, [{
    key: "isStatic",
    value: function isStatic() {
      return !this.tainted && this.resolved && this.resolved.scope.isStatic();
    }

    /**
     * Whether the reference is writeable.
     * @method Reference#isWrite
     * @return {boolean}
     */

  }, {
    key: "isWrite",
    value: function isWrite() {
      return !!(this.flag & Reference.WRITE);
    }

    /**
     * Whether the reference is readable.
     * @method Reference#isRead
     * @return {boolean}
     */

  }, {
    key: "isRead",
    value: function isRead() {
      return !!(this.flag & Reference.READ);
    }

    /**
     * Whether the reference is read-only.
     * @method Reference#isReadOnly
     * @return {boolean}
     */

  }, {
    key: "isReadOnly",
    value: function isReadOnly() {
      return this.flag === Reference.READ;
    }

    /**
     * Whether the reference is write-only.
     * @method Reference#isWriteOnly
     * @return {boolean}
     */

  }, {
    key: "isWriteOnly",
    value: function isWriteOnly() {
      return this.flag === Reference.WRITE;
    }

    /**
     * Whether the reference is read-write.
     * @method Reference#isReadWrite
     * @return {boolean}
     */

  }, {
    key: "isReadWrite",
    value: function isReadWrite() {
      return this.flag === Reference.RW;
    }
  }]);

  return Reference;
}();

/**
 * @constant Reference.READ
 * @private
 */


exports.default = Reference;
Reference.READ = READ;
/**
 * @constant Reference.WRITE
 * @private
 */
Reference.WRITE = WRITE;
/**
 * @constant Reference.RW
 * @private
 */
Reference.RW = RW;

/* vim: set sw=4 ts=4 et tw=80 : */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLElBQU0sT0FBTyxHQUFQO0FBQ04sSUFBTSxRQUFRLEdBQVI7QUFDTixJQUFNLEtBQUssT0FBTyxLQUFQOzs7Ozs7O0lBTVU7QUFDakIsV0FEaUIsU0FDakIsQ0FBWSxLQUFaLEVBQW1CLEtBQW5CLEVBQTBCLElBQTFCLEVBQWlDLFNBQWpDLEVBQTRDLG1CQUE1QyxFQUFpRSxPQUFqRSxFQUEwRSxJQUExRSxFQUFnRjswQkFEL0QsV0FDK0Q7Ozs7OztBQUs1RSxTQUFLLFVBQUwsR0FBa0IsS0FBbEI7Ozs7O0FBTDRFLFFBVTVFLENBQUssSUFBTCxHQUFZLEtBQVo7Ozs7OztBQVY0RSxRQWdCNUUsQ0FBSyxPQUFMLEdBQWUsS0FBZjs7Ozs7QUFoQjRFLFFBcUI1RSxDQUFLLFFBQUwsR0FBZ0IsSUFBaEI7Ozs7Ozs7QUFyQjRFLFFBNEI1RSxDQUFLLElBQUwsR0FBWSxJQUFaLENBNUI0RTtBQTZCNUUsUUFBSSxLQUFLLE9BQUwsRUFBSixFQUFvQjs7Ozs7QUFLaEIsV0FBSyxTQUFMLEdBQWlCLFNBQWpCOzs7OztBQUxnQixVQVVoQixDQUFLLE9BQUwsR0FBZSxPQUFmOzs7OztBQVZnQixVQWVoQixDQUFLLElBQUwsR0FBWSxJQUFaLENBZmdCO0tBQXBCO0FBaUJBLFNBQUsscUJBQUwsR0FBNkIsbUJBQTdCLENBOUM0RTtHQUFoRjs7Ozs7Ozs7O2VBRGlCOzsrQkF1RE47QUFDUCxhQUFPLENBQUMsS0FBSyxPQUFMLElBQWdCLEtBQUssUUFBTCxJQUFpQixLQUFLLFFBQUwsQ0FBYyxLQUFkLENBQW9CLFFBQXBCLEVBQWxDLENBREE7Ozs7Ozs7Ozs7OzhCQVNEO0FBQ04sYUFBTyxDQUFDLEVBQUUsS0FBSyxJQUFMLEdBQVksVUFBVSxLQUFWLENBQWQsQ0FERjs7Ozs7Ozs7Ozs7NkJBU0Q7QUFDTCxhQUFPLENBQUMsRUFBRSxLQUFLLElBQUwsR0FBWSxVQUFVLElBQVYsQ0FBZCxDQURIOzs7Ozs7Ozs7OztpQ0FTSTtBQUNULGFBQU8sS0FBSyxJQUFMLEtBQWMsVUFBVSxJQUFWLENBRFo7Ozs7Ozs7Ozs7O2tDQVNDO0FBQ1YsYUFBTyxLQUFLLElBQUwsS0FBYyxVQUFVLEtBQVYsQ0FEWDs7Ozs7Ozs7Ozs7a0NBU0E7QUFDVixhQUFPLEtBQUssSUFBTCxLQUFjLFVBQVUsRUFBVixDQURYOzs7O1NBcEdHOzs7Ozs7Ozs7O0FBNkdyQixVQUFVLElBQVYsR0FBaUIsSUFBakI7Ozs7O0FBS0EsVUFBVSxLQUFWLEdBQWtCLEtBQWxCOzs7OztBQUtBLFVBQVUsRUFBVixHQUFlLEVBQWYiLCJmaWxlIjoicmVmZXJlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgQ29weXJpZ2h0IChDKSAyMDE1IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG5jb25zdCBSRUFEID0gMHgxO1xuY29uc3QgV1JJVEUgPSAweDI7XG5jb25zdCBSVyA9IFJFQUQgfCBXUklURTtcblxuLyoqXG4gKiBBIFJlZmVyZW5jZSByZXByZXNlbnRzIGEgc2luZ2xlIG9jY3VycmVuY2Ugb2YgYW4gaWRlbnRpZmllciBpbiBjb2RlLlxuICogQGNsYXNzIFJlZmVyZW5jZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWZlcmVuY2Uge1xuICAgIGNvbnN0cnVjdG9yKGlkZW50LCBzY29wZSwgZmxhZywgIHdyaXRlRXhwciwgbWF5YmVJbXBsaWNpdEdsb2JhbCwgcGFydGlhbCwgaW5pdCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogSWRlbnRpZmllciBzeW50YXggbm9kZS5cbiAgICAgICAgICogQG1lbWJlciB7ZXNwcmltYSNJZGVudGlmaWVyfSBSZWZlcmVuY2UjaWRlbnRpZmllclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pZGVudGlmaWVyID0gaWRlbnQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGVuY2xvc2luZyBTY29wZS5cbiAgICAgICAgICogQG1lbWJlciB7U2NvcGV9IFJlZmVyZW5jZSNmcm9tXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZyb20gPSBzY29wZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgdGhlIHJlZmVyZW5jZSBjb21lcyBmcm9tIGEgZHluYW1pYyBzY29wZSAoc3VjaCBhcyAnZXZhbCcsXG4gICAgICAgICAqICd3aXRoJywgZXRjLiksIGFuZCBtYXkgYmUgdHJhcHBlZCBieSBkeW5hbWljIHNjb3Blcy5cbiAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gUmVmZXJlbmNlI3RhaW50ZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGFpbnRlZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHZhcmlhYmxlIHRoaXMgcmVmZXJlbmNlIGlzIHJlc29sdmVkIHdpdGguXG4gICAgICAgICAqIEBtZW1iZXIge1ZhcmlhYmxlfSBSZWZlcmVuY2UjcmVzb2x2ZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzb2x2ZWQgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHJlYWQtd3JpdGUgbW9kZSBvZiB0aGUgcmVmZXJlbmNlLiAoVmFsdWUgaXMgb25lIG9mIHtAbGlua1xuICAgICAgICAgKiBSZWZlcmVuY2UuUkVBRH0sIHtAbGluayBSZWZlcmVuY2UuUld9LCB7QGxpbmsgUmVmZXJlbmNlLldSSVRFfSkuXG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn0gUmVmZXJlbmNlI2ZsYWdcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxhZyA9IGZsYWc7XG4gICAgICAgIGlmICh0aGlzLmlzV3JpdGUoKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJZiByZWZlcmVuY2UgaXMgd3JpdGVhYmxlLCB0aGlzIGlzIHRoZSB0cmVlIGJlaW5nIHdyaXR0ZW4gdG8gaXQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtlc3ByaW1hI05vZGV9IFJlZmVyZW5jZSN3cml0ZUV4cHJcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy53cml0ZUV4cHIgPSB3cml0ZUV4cHI7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFdoZXRoZXIgdGhlIFJlZmVyZW5jZSBtaWdodCByZWZlciB0byBhIHBhcnRpYWwgdmFsdWUgb2Ygd3JpdGVFeHByLlxuICAgICAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gUmVmZXJlbmNlI3BhcnRpYWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWFsID0gcGFydGlhbDtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogV2hldGhlciB0aGUgUmVmZXJlbmNlIGlzIHRvIHdyaXRlIG9mIGluaXRpYWxpemF0aW9uLlxuICAgICAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gUmVmZXJlbmNlI2luaXRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pbml0ID0gaW5pdDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fbWF5YmVJbXBsaWNpdEdsb2JhbCA9IG1heWJlSW1wbGljaXRHbG9iYWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHN0YXRpYy5cbiAgICAgKiBAbWV0aG9kIFJlZmVyZW5jZSNpc1N0YXRpY1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdGF0aWMoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy50YWludGVkICYmIHRoaXMucmVzb2x2ZWQgJiYgdGhpcy5yZXNvbHZlZC5zY29wZS5pc1N0YXRpYygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHJlZmVyZW5jZSBpcyB3cml0ZWFibGUuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNXcml0ZVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNXcml0ZSgpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuZmxhZyAmIFJlZmVyZW5jZS5XUklURSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHJlYWRhYmxlLlxuICAgICAqIEBtZXRob2QgUmVmZXJlbmNlI2lzUmVhZFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNSZWFkKCkge1xuICAgICAgICByZXR1cm4gISEodGhpcy5mbGFnICYgUmVmZXJlbmNlLlJFQUQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHJlZmVyZW5jZSBpcyByZWFkLW9ubHkuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNSZWFkT25seVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNSZWFkT25seSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhZyA9PT0gUmVmZXJlbmNlLlJFQUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHdyaXRlLW9ubHkuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNXcml0ZU9ubHlcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzV3JpdGVPbmx5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGFnID09PSBSZWZlcmVuY2UuV1JJVEU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHJlYWQtd3JpdGUuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNSZWFkV3JpdGVcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzUmVhZFdyaXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGFnID09PSBSZWZlcmVuY2UuUlc7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjb25zdGFudCBSZWZlcmVuY2UuUkVBRFxuICogQHByaXZhdGVcbiAqL1xuUmVmZXJlbmNlLlJFQUQgPSBSRUFEO1xuLyoqXG4gKiBAY29uc3RhbnQgUmVmZXJlbmNlLldSSVRFXG4gKiBAcHJpdmF0ZVxuICovXG5SZWZlcmVuY2UuV1JJVEUgPSBXUklURTtcbi8qKlxuICogQGNvbnN0YW50IFJlZmVyZW5jZS5SV1xuICogQHByaXZhdGVcbiAqL1xuUmVmZXJlbmNlLlJXID0gUlc7XG5cbi8qIHZpbTogc2V0IHN3PTQgdHM9NCBldCB0dz04MCA6ICovXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871642, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * A Variable represents a locally scoped identifier. These include arguments to
 * functions.
 * @class Variable
 */

var Variable = function Variable(name, scope) {
  _classCallCheck(this, Variable);

  /**
   * The variable name, as given in the source code.
   * @member {String} Variable#name
   */
  this.name = name;
  /**
   * List of defining occurrences of this variable (like in 'var ...'
   * statements or as parameter), as AST nodes.
   * @member {esprima.Identifier[]} Variable#identifiers
   */
  this.identifiers = [];
  /**
   * List of {@link Reference|references} of this variable (excluding parameter entries)
   * in its defining scope and all nested scopes. For defining
   * occurrences only see {@link Variable#defs}.
   * @member {Reference[]} Variable#references
   */
  this.references = [];

  /**
   * List of defining occurrences of this variable (like in 'var ...'
   * statements or as parameter), as custom objects.
   * @member {Definition[]} Variable#defs
   */
  this.defs = [];

  this.tainted = false;
  /**
   * Whether this is a stack variable.
   * @member {boolean} Variable#stack
   */
  this.stack = true;
  /**
   * Reference to the enclosing Scope.
   * @member {Scope} Variable#scope
   */
  this.scope = scope;
};

exports.default = Variable;


Variable.CatchClause = 'CatchClause';
Variable.Parameter = 'Parameter';
Variable.FunctionName = 'FunctionName';
Variable.ClassName = 'ClassName';
Variable.Variable = 'Variable';
Variable.ImportBinding = 'ImportBinding';
Variable.TDZ = 'TDZ';
Variable.ImplicitGlobalVariable = 'ImplicitGlobalVariable';

/* vim: set sw=4 ts=4 et tw=80 : */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBNkJxQixXQUNqQixTQURpQixRQUNqQixDQUFZLElBQVosRUFBa0IsS0FBbEIsRUFBeUI7d0JBRFIsVUFDUTs7Ozs7O0FBS3JCLE9BQUssSUFBTCxHQUFZLElBQVo7Ozs7OztBQUxxQixNQVdyQixDQUFLLFdBQUwsR0FBbUIsRUFBbkI7Ozs7Ozs7QUFYcUIsTUFrQnJCLENBQUssVUFBTCxHQUFrQixFQUFsQjs7Ozs7OztBQWxCcUIsTUF5QnJCLENBQUssSUFBTCxHQUFZLEVBQVosQ0F6QnFCOztBQTJCckIsT0FBSyxPQUFMLEdBQWUsS0FBZjs7Ozs7QUEzQnFCLE1BZ0NyQixDQUFLLEtBQUwsR0FBYSxJQUFiOzs7OztBQWhDcUIsTUFxQ3JCLENBQUssS0FBTCxHQUFhLEtBQWIsQ0FyQ3FCO0NBQXpCOztrQkFEaUI7OztBQTBDckIsU0FBUyxXQUFULEdBQXVCLGFBQXZCO0FBQ0EsU0FBUyxTQUFULEdBQXFCLFdBQXJCO0FBQ0EsU0FBUyxZQUFULEdBQXdCLGNBQXhCO0FBQ0EsU0FBUyxTQUFULEdBQXFCLFdBQXJCO0FBQ0EsU0FBUyxRQUFULEdBQW9CLFVBQXBCO0FBQ0EsU0FBUyxhQUFULEdBQXlCLGVBQXpCO0FBQ0EsU0FBUyxHQUFULEdBQWUsS0FBZjtBQUNBLFNBQVMsc0JBQVQsR0FBa0Msd0JBQWxDIiwiZmlsZSI6InZhcmlhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgQ29weXJpZ2h0IChDKSAyMDE1IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG4vKipcbiAqIEEgVmFyaWFibGUgcmVwcmVzZW50cyBhIGxvY2FsbHkgc2NvcGVkIGlkZW50aWZpZXIuIFRoZXNlIGluY2x1ZGUgYXJndW1lbnRzIHRvXG4gKiBmdW5jdGlvbnMuXG4gKiBAY2xhc3MgVmFyaWFibGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFibGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHNjb3BlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdmFyaWFibGUgbmFtZSwgYXMgZ2l2ZW4gaW4gdGhlIHNvdXJjZSBjb2RlLlxuICAgICAgICAgKiBAbWVtYmVyIHtTdHJpbmd9IFZhcmlhYmxlI25hbWVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0IG9mIGRlZmluaW5nIG9jY3VycmVuY2VzIG9mIHRoaXMgdmFyaWFibGUgKGxpa2UgaW4gJ3ZhciAuLi4nXG4gICAgICAgICAqIHN0YXRlbWVudHMgb3IgYXMgcGFyYW1ldGVyKSwgYXMgQVNUIG5vZGVzLlxuICAgICAgICAgKiBAbWVtYmVyIHtlc3ByaW1hLklkZW50aWZpZXJbXX0gVmFyaWFibGUjaWRlbnRpZmllcnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaWRlbnRpZmllcnMgPSBbXTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpc3Qgb2Yge0BsaW5rIFJlZmVyZW5jZXxyZWZlcmVuY2VzfSBvZiB0aGlzIHZhcmlhYmxlIChleGNsdWRpbmcgcGFyYW1ldGVyIGVudHJpZXMpXG4gICAgICAgICAqIGluIGl0cyBkZWZpbmluZyBzY29wZSBhbmQgYWxsIG5lc3RlZCBzY29wZXMuIEZvciBkZWZpbmluZ1xuICAgICAgICAgKiBvY2N1cnJlbmNlcyBvbmx5IHNlZSB7QGxpbmsgVmFyaWFibGUjZGVmc30uXG4gICAgICAgICAqIEBtZW1iZXIge1JlZmVyZW5jZVtdfSBWYXJpYWJsZSNyZWZlcmVuY2VzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlZmVyZW5jZXMgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTGlzdCBvZiBkZWZpbmluZyBvY2N1cnJlbmNlcyBvZiB0aGlzIHZhcmlhYmxlIChsaWtlIGluICd2YXIgLi4uJ1xuICAgICAgICAgKiBzdGF0ZW1lbnRzIG9yIGFzIHBhcmFtZXRlciksIGFzIGN1c3RvbSBvYmplY3RzLlxuICAgICAgICAgKiBAbWVtYmVyIHtEZWZpbml0aW9uW119IFZhcmlhYmxlI2RlZnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVmcyA9IFtdO1xuXG4gICAgICAgIHRoaXMudGFpbnRlZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciB0aGlzIGlzIGEgc3RhY2sgdmFyaWFibGUuXG4gICAgICAgICAqIEBtZW1iZXIge2Jvb2xlYW59IFZhcmlhYmxlI3N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnN0YWNrID0gdHJ1ZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZmVyZW5jZSB0byB0aGUgZW5jbG9zaW5nIFNjb3BlLlxuICAgICAgICAgKiBAbWVtYmVyIHtTY29wZX0gVmFyaWFibGUjc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcbiAgICB9XG59XG5cblZhcmlhYmxlLkNhdGNoQ2xhdXNlID0gJ0NhdGNoQ2xhdXNlJztcblZhcmlhYmxlLlBhcmFtZXRlciA9ICdQYXJhbWV0ZXInO1xuVmFyaWFibGUuRnVuY3Rpb25OYW1lID0gJ0Z1bmN0aW9uTmFtZSc7XG5WYXJpYWJsZS5DbGFzc05hbWUgPSAnQ2xhc3NOYW1lJztcblZhcmlhYmxlLlZhcmlhYmxlID0gJ1ZhcmlhYmxlJztcblZhcmlhYmxlLkltcG9ydEJpbmRpbmcgPSAnSW1wb3J0QmluZGluZyc7XG5WYXJpYWJsZS5URFogPSAnVERaJztcblZhcmlhYmxlLkltcGxpY2l0R2xvYmFsVmFyaWFibGUgPSAnSW1wbGljaXRHbG9iYWxWYXJpYWJsZSc7XG5cbi8qIHZpbTogc2V0IHN3PTQgdHM9NCBldCB0dz04MCA6ICovXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871643, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Definition = exports.ParameterDefinition = undefined;

var _variable = require('./variable');

var _variable2 = _interopRequireDefault(_variable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*
                                                                                                                                                            Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                          
                                                                                                                                                            Redistribution and use in source and binary forms, with or without
                                                                                                                                                            modification, are permitted provided that the following conditions are met:
                                                                                                                                                          
                                                                                                                                                              * Redistributions of source code must retain the above copyright
                                                                                                                                                                notice, this list of conditions and the following disclaimer.
                                                                                                                                                              * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                documentation and/or other materials provided with the distribution.
                                                                                                                                                          
                                                                                                                                                            THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                            AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                            IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                            ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                            DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                            (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                            LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                            ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                            (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                            THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                          */

/**
 * @class Definition
 */

var Definition = function Definition(type, name, node, parent, index, kind) {
  _classCallCheck(this, Definition);

  /**
   * @member {String} Definition#type - type of the occurrence (e.g. "Parameter", "Variable", ...).
   */
  this.type = type;
  /**
   * @member {esprima.Identifier} Definition#name - the identifier AST node of the occurrence.
   */
  this.name = name;
  /**
   * @member {esprima.Node} Definition#node - the enclosing node of the identifier.
   */
  this.node = node;
  /**
   * @member {esprima.Node?} Definition#parent - the enclosing statement node of the identifier.
   */
  this.parent = parent;
  /**
   * @member {Number?} Definition#index - the index in the declaration statement.
   */
  this.index = index;
  /**
   * @member {String?} Definition#kind - the kind of the declaration statement.
   */
  this.kind = kind;
};

/**
 * @class ParameterDefinition
 */


exports.default = Definition;

var ParameterDefinition = function (_Definition) {
  _inherits(ParameterDefinition, _Definition);

  function ParameterDefinition(name, node, index, rest) {
    _classCallCheck(this, ParameterDefinition);

    /**
     * Whether the parameter definition is a part of a rest parameter.
     * @member {boolean} ParameterDefinition#rest
     */

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParameterDefinition).call(this, _variable2.default.Parameter, name, node, null, index, null));

    _this.rest = rest;
    return _this;
  }

  return ParameterDefinition;
}(Definition);

exports.ParameterDefinition = ParameterDefinition;
exports.Definition = Definition;

/* vim: set sw=4 ts=4 et tw=80 : */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlZmluaXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQXdCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFLcUIsYUFDakIsU0FEaUIsVUFDakIsQ0FBWSxJQUFaLEVBQWtCLElBQWxCLEVBQXdCLElBQXhCLEVBQThCLE1BQTlCLEVBQXNDLEtBQXRDLEVBQTZDLElBQTdDLEVBQW1EO3dCQURsQyxZQUNrQzs7Ozs7QUFJL0MsT0FBSyxJQUFMLEdBQVksSUFBWjs7OztBQUorQyxNQVEvQyxDQUFLLElBQUwsR0FBWSxJQUFaOzs7O0FBUitDLE1BWS9DLENBQUssSUFBTCxHQUFZLElBQVo7Ozs7QUFaK0MsTUFnQi9DLENBQUssTUFBTCxHQUFjLE1BQWQ7Ozs7QUFoQitDLE1Bb0IvQyxDQUFLLEtBQUwsR0FBYSxLQUFiOzs7O0FBcEIrQyxNQXdCL0MsQ0FBSyxJQUFMLEdBQVksSUFBWixDQXhCK0M7Q0FBbkQ7Ozs7Ozs7a0JBRGlCOztJQWdDZjs7O0FBQ0YsV0FERSxtQkFDRixDQUFZLElBQVosRUFBa0IsSUFBbEIsRUFBd0IsS0FBeEIsRUFBK0IsSUFBL0IsRUFBcUM7MEJBRG5DLHFCQUNtQzs7Ozs7Ozt1RUFEbkMsZ0NBRVEsbUJBQVMsU0FBVCxFQUFvQixNQUFNLE1BQU0sTUFBTSxPQUFPLE9BRGxCOztBQU1qQyxVQUFLLElBQUwsR0FBWSxJQUFaLENBTmlDOztHQUFyQzs7U0FERTtFQUE0Qjs7UUFZOUI7UUFDQSIsImZpbGUiOiJkZWZpbml0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgQ29weXJpZ2h0IChDKSAyMDE1IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG5pbXBvcnQgVmFyaWFibGUgZnJvbSAnLi92YXJpYWJsZSc7XG5cbi8qKlxuICogQGNsYXNzIERlZmluaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmaW5pdGlvbiB7XG4gICAgY29uc3RydWN0b3IodHlwZSwgbmFtZSwgbm9kZSwgcGFyZW50LCBpbmRleCwga2luZCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7U3RyaW5nfSBEZWZpbml0aW9uI3R5cGUgLSB0eXBlIG9mIHRoZSBvY2N1cnJlbmNlIChlLmcuIFwiUGFyYW1ldGVyXCIsIFwiVmFyaWFibGVcIiwgLi4uKS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtlc3ByaW1hLklkZW50aWZpZXJ9IERlZmluaXRpb24jbmFtZSAtIHRoZSBpZGVudGlmaWVyIEFTVCBub2RlIG9mIHRoZSBvY2N1cnJlbmNlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2VzcHJpbWEuTm9kZX0gRGVmaW5pdGlvbiNub2RlIC0gdGhlIGVuY2xvc2luZyBub2RlIG9mIHRoZSBpZGVudGlmaWVyLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2VzcHJpbWEuTm9kZT99IERlZmluaXRpb24jcGFyZW50IC0gdGhlIGVuY2xvc2luZyBzdGF0ZW1lbnQgbm9kZSBvZiB0aGUgaWRlbnRpZmllci5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7TnVtYmVyP30gRGVmaW5pdGlvbiNpbmRleCAtIHRoZSBpbmRleCBpbiB0aGUgZGVjbGFyYXRpb24gc3RhdGVtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7U3RyaW5nP30gRGVmaW5pdGlvbiNraW5kIC0gdGhlIGtpbmQgb2YgdGhlIGRlY2xhcmF0aW9uIHN0YXRlbWVudC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMua2luZCA9IGtpbmQ7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjbGFzcyBQYXJhbWV0ZXJEZWZpbml0aW9uXG4gKi9cbmNsYXNzIFBhcmFtZXRlckRlZmluaXRpb24gZXh0ZW5kcyBEZWZpbml0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBub2RlLCBpbmRleCwgcmVzdCkge1xuICAgICAgICBzdXBlcihWYXJpYWJsZS5QYXJhbWV0ZXIsIG5hbWUsIG5vZGUsIG51bGwsIGluZGV4LCBudWxsKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgdGhlIHBhcmFtZXRlciBkZWZpbml0aW9uIGlzIGEgcGFydCBvZiBhIHJlc3QgcGFyYW1ldGVyLlxuICAgICAgICAgKiBAbWVtYmVyIHtib29sZWFufSBQYXJhbWV0ZXJEZWZpbml0aW9uI3Jlc3RcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzdCA9IHJlc3Q7XG4gICAgfVxufVxuXG5leHBvcnQge1xuICAgIFBhcmFtZXRlckRlZmluaXRpb24sXG4gICAgRGVmaW5pdGlvblxufVxuXG4vKiB2aW06IHNldCBzdz00IHRzPTQgZXQgdHc9ODAgOiAqL1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

}, function(modId) { var map = {"./variable":1602510871642}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871644, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _estraverse = require('estraverse');

var _esrecurse = require('esrecurse');

var _esrecurse2 = _interopRequireDefault(_esrecurse);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _variable = require('./variable');

var _variable2 = _interopRequireDefault(_variable);

var _patternVisitor = require('./pattern-visitor');

var _patternVisitor2 = _interopRequireDefault(_patternVisitor);

var _definition = require('./definition');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


function traverseIdentifierInPattern(options, rootPattern, referencer, callback) {
    // Call the callback at left hand identifier nodes, and Collect right hand nodes.
    var visitor = new _patternVisitor2.default(options, rootPattern, callback);
    visitor.visit(rootPattern);

    // Process the right hand nodes recursively.
    if (referencer != null) {
        visitor.rightHandNodes.forEach(referencer.visit, referencer);
    }
}

// Importing ImportDeclaration.
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-moduledeclarationinstantiation
// https://github.com/estree/estree/blob/master/es6.md#importdeclaration
// FIXME: Now, we don't create module environment, because the context is
// implementation dependent.

var Importer = function (_esrecurse$Visitor) {
    _inherits(Importer, _esrecurse$Visitor);

    function Importer(declaration, referencer) {
        _classCallCheck(this, Importer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Importer).call(this, null, referencer.options));

        _this.declaration = declaration;
        _this.referencer = referencer;
        return _this;
    }

    _createClass(Importer, [{
        key: 'visitImport',
        value: function visitImport(id, specifier) {
            var _this2 = this;

            this.referencer.visitPattern(id, function (pattern) {
                _this2.referencer.currentScope().__define(pattern, new _definition.Definition(_variable2.default.ImportBinding, pattern, specifier, _this2.declaration, null, null));
            });
        }
    }, {
        key: 'ImportNamespaceSpecifier',
        value: function ImportNamespaceSpecifier(node) {
            var local = node.local || node.id;
            if (local) {
                this.visitImport(local, node);
            }
        }
    }, {
        key: 'ImportDefaultSpecifier',
        value: function ImportDefaultSpecifier(node) {
            var local = node.local || node.id;
            this.visitImport(local, node);
        }
    }, {
        key: 'ImportSpecifier',
        value: function ImportSpecifier(node) {
            var local = node.local || node.id;
            if (node.name) {
                this.visitImport(node.name, node);
            } else {
                this.visitImport(local, node);
            }
        }
    }]);

    return Importer;
}(_esrecurse2.default.Visitor);

// Referencing variables and creating bindings.


var Referencer = function (_esrecurse$Visitor2) {
    _inherits(Referencer, _esrecurse$Visitor2);

    function Referencer(options, scopeManager) {
        _classCallCheck(this, Referencer);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Referencer).call(this, null, options));

        _this3.options = options;
        _this3.scopeManager = scopeManager;
        _this3.parent = null;
        _this3.isInnerMethodDefinition = false;
        return _this3;
    }

    _createClass(Referencer, [{
        key: 'currentScope',
        value: function currentScope() {
            return this.scopeManager.__currentScope;
        }
    }, {
        key: 'close',
        value: function close(node) {
            while (this.currentScope() && node === this.currentScope().block) {
                this.scopeManager.__currentScope = this.currentScope().__close(this.scopeManager);
            }
        }
    }, {
        key: 'pushInnerMethodDefinition',
        value: function pushInnerMethodDefinition(isInnerMethodDefinition) {
            var previous = this.isInnerMethodDefinition;
            this.isInnerMethodDefinition = isInnerMethodDefinition;
            return previous;
        }
    }, {
        key: 'popInnerMethodDefinition',
        value: function popInnerMethodDefinition(isInnerMethodDefinition) {
            this.isInnerMethodDefinition = isInnerMethodDefinition;
        }
    }, {
        key: 'materializeTDZScope',
        value: function materializeTDZScope(node, iterationNode) {
            // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-runtime-semantics-forin-div-ofexpressionevaluation-abstract-operation
            // TDZ scope hides the declaration's names.
            this.scopeManager.__nestTDZScope(node, iterationNode);
            this.visitVariableDeclaration(this.currentScope(), _variable2.default.TDZ, iterationNode.left, 0, true);
        }
    }, {
        key: 'materializeIterationScope',
        value: function materializeIterationScope(node) {
            var _this4 = this;

            // Generate iteration scope for upper ForIn/ForOf Statements.
            var letOrConstDecl;
            this.scopeManager.__nestForScope(node);
            letOrConstDecl = node.left;
            this.visitVariableDeclaration(this.currentScope(), _variable2.default.Variable, letOrConstDecl, 0);
            this.visitPattern(letOrConstDecl.declarations[0].id, function (pattern) {
                _this4.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
            });
        }
    }, {
        key: 'referencingDefaultValue',
        value: function referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
            var scope = this.currentScope();
            assignments.forEach(function (assignment) {
                scope.__referencing(pattern, _reference2.default.WRITE, assignment.right, maybeImplicitGlobal, pattern !== assignment.left, init);
            });
        }
    }, {
        key: 'visitPattern',
        value: function visitPattern(node, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = { processRightHandNodes: false };
            }
            traverseIdentifierInPattern(this.options, node, options.processRightHandNodes ? this : null, callback);
        }
    }, {
        key: 'visitFunction',
        value: function visitFunction(node) {
            var _this5 = this;

            var i, iz;
            // FunctionDeclaration name is defined in upper scope
            // NOTE: Not referring variableScope. It is intended.
            // Since
            //  in ES5, FunctionDeclaration should be in FunctionBody.
            //  in ES6, FunctionDeclaration should be block scoped.
            if (node.type === _estraverse.Syntax.FunctionDeclaration) {
                // id is defined in upper scope
                this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.FunctionName, node.id, node, null, null, null));
            }

            // FunctionExpression with name creates its special scope;
            // FunctionExpressionNameScope.
            if (node.type === _estraverse.Syntax.FunctionExpression && node.id) {
                this.scopeManager.__nestFunctionExpressionNameScope(node);
            }

            // Consider this function is in the MethodDefinition.
            this.scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);

            // Process parameter declarations.
            for (i = 0, iz = node.params.length; i < iz; ++i) {
                this.visitPattern(node.params[i], { processRightHandNodes: true }, function (pattern, info) {
                    _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, i, info.rest));

                    _this5.referencingDefaultValue(pattern, info.assignments, null, true);
                });
            }

            // if there's a rest argument, add that
            if (node.rest) {
                this.visitPattern({
                    type: 'RestElement',
                    argument: node.rest
                }, function (pattern) {
                    _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, node.params.length, true));
                });
            }

            // Skip BlockStatement to prevent creating BlockStatement scope.
            if (node.body.type === _estraverse.Syntax.BlockStatement) {
                this.visitChildren(node.body);
            } else {
                this.visit(node.body);
            }

            this.close(node);
        }
    }, {
        key: 'visitClass',
        value: function visitClass(node) {
            if (node.type === _estraverse.Syntax.ClassDeclaration) {
                this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node, null, null, null));
            }

            // FIXME: Maybe consider TDZ.
            this.visit(node.superClass);

            this.scopeManager.__nestClassScope(node);

            if (node.id) {
                this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node));
            }
            this.visit(node.body);

            this.close(node);
        }
    }, {
        key: 'visitProperty',
        value: function visitProperty(node) {
            var previous, isMethodDefinition;
            if (node.computed) {
                this.visit(node.key);
            }

            isMethodDefinition = node.type === _estraverse.Syntax.MethodDefinition;
            if (isMethodDefinition) {
                previous = this.pushInnerMethodDefinition(true);
            }
            this.visit(node.value);
            if (isMethodDefinition) {
                this.popInnerMethodDefinition(previous);
            }
        }
    }, {
        key: 'visitForIn',
        value: function visitForIn(node) {
            var _this6 = this;

            if (node.left.type === _estraverse.Syntax.VariableDeclaration && node.left.kind !== 'var') {
                this.materializeTDZScope(node.right, node);
                this.visit(node.right);
                this.close(node.right);

                this.materializeIterationScope(node);
                this.visit(node.body);
                this.close(node);
            } else {
                if (node.left.type === _estraverse.Syntax.VariableDeclaration) {
                    this.visit(node.left);
                    this.visitPattern(node.left.declarations[0].id, function (pattern) {
                        _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
                    });
                } else {
                    this.visitPattern(node.left, { processRightHandNodes: true }, function (pattern, info) {
                        var maybeImplicitGlobal = null;
                        if (!_this6.currentScope().isStrict) {
                            maybeImplicitGlobal = {
                                pattern: pattern,
                                node: node
                            };
                        }
                        _this6.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                        _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, true, false);
                    });
                }
                this.visit(node.right);
                this.visit(node.body);
            }
        }
    }, {
        key: 'visitVariableDeclaration',
        value: function visitVariableDeclaration(variableTargetScope, type, node, index, fromTDZ) {
            var _this7 = this;

            // If this was called to initialize a TDZ scope, this needs to make definitions, but doesn't make references.
            var decl, init;

            decl = node.declarations[index];
            init = decl.init;
            this.visitPattern(decl.id, { processRightHandNodes: !fromTDZ }, function (pattern, info) {
                variableTargetScope.__define(pattern, new _definition.Definition(type, pattern, decl, node, index, node.kind));

                if (!fromTDZ) {
                    _this7.referencingDefaultValue(pattern, info.assignments, null, true);
                }
                if (init) {
                    _this7.currentScope().__referencing(pattern, _reference2.default.WRITE, init, null, !info.topLevel, true);
                }
            });
        }
    }, {
        key: 'AssignmentExpression',
        value: function AssignmentExpression(node) {
            var _this8 = this;

            if (_patternVisitor2.default.isPattern(node.left)) {
                if (node.operator === '=') {
                    this.visitPattern(node.left, { processRightHandNodes: true }, function (pattern, info) {
                        var maybeImplicitGlobal = null;
                        if (!_this8.currentScope().isStrict) {
                            maybeImplicitGlobal = {
                                pattern: pattern,
                                node: node
                            };
                        }
                        _this8.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                        _this8.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, !info.topLevel, false);
                    });
                } else {
                    this.currentScope().__referencing(node.left, _reference2.default.RW, node.right);
                }
            } else {
                this.visit(node.left);
            }
            this.visit(node.right);
        }
    }, {
        key: 'CatchClause',
        value: function CatchClause(node) {
            var _this9 = this;

            this.scopeManager.__nestCatchScope(node);

            this.visitPattern(node.param, { processRightHandNodes: true }, function (pattern, info) {
                _this9.currentScope().__define(pattern, new _definition.Definition(_variable2.default.CatchClause, node.param, node, null, null, null));
                _this9.referencingDefaultValue(pattern, info.assignments, null, true);
            });
            this.visit(node.body);

            this.close(node);
        }
    }, {
        key: 'Program',
        value: function Program(node) {
            this.scopeManager.__nestGlobalScope(node);

            if (this.scopeManager.__isNodejsScope()) {
                // Force strictness of GlobalScope to false when using node.js scope.
                this.currentScope().isStrict = false;
                this.scopeManager.__nestFunctionScope(node, false);
            }

            if (this.scopeManager.__isES6() && this.scopeManager.isModule()) {
                this.scopeManager.__nestModuleScope(node);
            }

            if (this.scopeManager.isStrictModeSupported() && this.scopeManager.isImpliedStrict()) {
                this.currentScope().isStrict = true;
            }

            this.visitChildren(node);
            this.close(node);
        }
    }, {
        key: 'Identifier',
        value: function Identifier(node) {
            this.currentScope().__referencing(node);
        }
    }, {
        key: 'UpdateExpression',
        value: function UpdateExpression(node) {
            if (_patternVisitor2.default.isPattern(node.argument)) {
                this.currentScope().__referencing(node.argument, _reference2.default.RW, null);
            } else {
                this.visitChildren(node);
            }
        }
    }, {
        key: 'MemberExpression',
        value: function MemberExpression(node) {
            this.visit(node.object);
            if (node.computed) {
                this.visit(node.property);
            }
        }
    }, {
        key: 'Property',
        value: function Property(node) {
            this.visitProperty(node);
        }
    }, {
        key: 'MethodDefinition',
        value: function MethodDefinition(node) {
            this.visitProperty(node);
        }
    }, {
        key: 'BreakStatement',
        value: function BreakStatement() {}
    }, {
        key: 'ContinueStatement',
        value: function ContinueStatement() {}
    }, {
        key: 'LabeledStatement',
        value: function LabeledStatement(node) {
            this.visit(node.body);
        }
    }, {
        key: 'ForStatement',
        value: function ForStatement(node) {
            // Create ForStatement declaration.
            // NOTE: In ES6, ForStatement dynamically generates
            // per iteration environment. However, escope is
            // a static analyzer, we only generate one scope for ForStatement.
            if (node.init && node.init.type === _estraverse.Syntax.VariableDeclaration && node.init.kind !== 'var') {
                this.scopeManager.__nestForScope(node);
            }

            this.visitChildren(node);

            this.close(node);
        }
    }, {
        key: 'ClassExpression',
        value: function ClassExpression(node) {
            this.visitClass(node);
        }
    }, {
        key: 'ClassDeclaration',
        value: function ClassDeclaration(node) {
            this.visitClass(node);
        }
    }, {
        key: 'CallExpression',
        value: function CallExpression(node) {
            // Check this is direct call to eval
            if (!this.scopeManager.__ignoreEval() && node.callee.type === _estraverse.Syntax.Identifier && node.callee.name === 'eval') {
                // NOTE: This should be `variableScope`. Since direct eval call always creates Lexical environment and
                // let / const should be enclosed into it. Only VariableDeclaration affects on the caller's environment.
                this.currentScope().variableScope.__detectEval();
            }
            this.visitChildren(node);
        }
    }, {
        key: 'BlockStatement',
        value: function BlockStatement(node) {
            if (this.scopeManager.__isES6()) {
                this.scopeManager.__nestBlockScope(node);
            }

            this.visitChildren(node);

            this.close(node);
        }
    }, {
        key: 'ThisExpression',
        value: function ThisExpression() {
            this.currentScope().variableScope.__detectThis();
        }
    }, {
        key: 'WithStatement',
        value: function WithStatement(node) {
            this.visit(node.object);
            // Then nest scope for WithStatement.
            this.scopeManager.__nestWithScope(node);

            this.visit(node.body);

            this.close(node);
        }
    }, {
        key: 'VariableDeclaration',
        value: function VariableDeclaration(node) {
            var variableTargetScope, i, iz, decl;
            variableTargetScope = node.kind === 'var' ? this.currentScope().variableScope : this.currentScope();
            for (i = 0, iz = node.declarations.length; i < iz; ++i) {
                decl = node.declarations[i];
                this.visitVariableDeclaration(variableTargetScope, _variable2.default.Variable, node, i);
                if (decl.init) {
                    this.visit(decl.init);
                }
            }
        }

        // sec 13.11.8

    }, {
        key: 'SwitchStatement',
        value: function SwitchStatement(node) {
            var i, iz;

            this.visit(node.discriminant);

            if (this.scopeManager.__isES6()) {
                this.scopeManager.__nestSwitchScope(node);
            }

            for (i = 0, iz = node.cases.length; i < iz; ++i) {
                this.visit(node.cases[i]);
            }

            this.close(node);
        }
    }, {
        key: 'FunctionDeclaration',
        value: function FunctionDeclaration(node) {
            this.visitFunction(node);
        }
    }, {
        key: 'FunctionExpression',
        value: function FunctionExpression(node) {
            this.visitFunction(node);
        }
    }, {
        key: 'ForOfStatement',
        value: function ForOfStatement(node) {
            this.visitForIn(node);
        }
    }, {
        key: 'ForInStatement',
        value: function ForInStatement(node) {
            this.visitForIn(node);
        }
    }, {
        key: 'ArrowFunctionExpression',
        value: function ArrowFunctionExpression(node) {
            this.visitFunction(node);
        }
    }, {
        key: 'ImportDeclaration',
        value: function ImportDeclaration(node) {
            var importer;

            (0, _assert2.default)(this.scopeManager.__isES6() && this.scopeManager.isModule(), 'ImportDeclaration should appear when the mode is ES6 and in the module context.');

            importer = new Importer(node, this);
            importer.visit(node);
        }
    }, {
        key: 'visitExportDeclaration',
        value: function visitExportDeclaration(node) {
            if (node.source) {
                return;
            }
            if (node.declaration) {
                this.visit(node.declaration);
                return;
            }

            this.visitChildren(node);
        }
    }, {
        key: 'ExportDeclaration',
        value: function ExportDeclaration(node) {
            this.visitExportDeclaration(node);
        }
    }, {
        key: 'ExportNamedDeclaration',
        value: function ExportNamedDeclaration(node) {
            this.visitExportDeclaration(node);
        }
    }, {
        key: 'ExportSpecifier',
        value: function ExportSpecifier(node) {
            var local = node.id || node.local;
            this.visit(local);
        }
    }, {
        key: 'MetaProperty',
        value: function MetaProperty() {
            // do nothing.
        }
    }]);

    return Referencer;
}(_esrecurse2.default.Visitor);

/* vim: set sw=4 ts=4 et tw=80 : */


exports.default = Referencer;
//# sourceMappingURL=data:application/json;base64,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SyxXQUFMLENBQVgsQ0FEa0I7QUFFbEIsdUJBRmtCO2FBQXRCOztBQUtBLGlCQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFUeUI7Ozs7MENBWVgsTUFBTTtBQUNwQixpQkFBSyxzQkFBTCxDQUE0QixJQUE1QixFQURvQjs7OzsrQ0FJRCxNQUFNO0FBQ3pCLGlCQUFLLHNCQUFMLENBQTRCLElBQTVCLEVBRHlCOzs7O3dDQUliLE1BQU07QUFDbEIsZ0JBQUksUUFBUyxLQUFLLEVBQUwsSUFBVyxLQUFLLEtBQUwsQ0FETjtBQUVsQixpQkFBSyxLQUFMLENBQVcsS0FBWCxFQUZrQjs7Ozt1Q0FLUDs7Ozs7V0F0ZUU7RUFBbUIsb0JBQVUsT0FBVjs7Ozs7a0JBQW5CIiwiZmlsZSI6InJlZmVyZW5jZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICBDb3B5cmlnaHQgKEMpIDIwMTUgWXVzdWtlIFN1enVraSA8dXRhdGFuZS50ZWFAZ21haWwuY29tPlxuXG4gIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4gICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiXG4gIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0VcbiAgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIDxDT1BZUklHSFQgSE9MREVSPiBCRSBMSUFCTEUgRk9SIEFOWVxuICBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuICAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gIExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORFxuICBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0ZcbiAgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiovXG5pbXBvcnQgeyBTeW50YXggfSBmcm9tICdlc3RyYXZlcnNlJztcbmltcG9ydCBlc3JlY3Vyc2UgZnJvbSAnZXNyZWN1cnNlJztcbmltcG9ydCBSZWZlcmVuY2UgZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IFZhcmlhYmxlIGZyb20gJy4vdmFyaWFibGUnO1xuaW1wb3J0IFBhdHRlcm5WaXNpdG9yIGZyb20gJy4vcGF0dGVybi12aXNpdG9yJztcbmltcG9ydCB7IFBhcmFtZXRlckRlZmluaXRpb24sIERlZmluaXRpb24gfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5mdW5jdGlvbiB0cmF2ZXJzZUlkZW50aWZpZXJJblBhdHRlcm4ob3B0aW9ucywgcm9vdFBhdHRlcm4sIHJlZmVyZW5jZXIsIGNhbGxiYWNrKSB7XG4gICAgLy8gQ2FsbCB0aGUgY2FsbGJhY2sgYXQgbGVmdCBoYW5kIGlkZW50aWZpZXIgbm9kZXMsIGFuZCBDb2xsZWN0IHJpZ2h0IGhhbmQgbm9kZXMuXG4gICAgdmFyIHZpc2l0b3IgPSBuZXcgUGF0dGVyblZpc2l0b3Iob3B0aW9ucywgcm9vdFBhdHRlcm4sIGNhbGxiYWNrKTtcbiAgICB2aXNpdG9yLnZpc2l0KHJvb3RQYXR0ZXJuKTtcblxuICAgIC8vIFByb2Nlc3MgdGhlIHJpZ2h0IGhhbmQgbm9kZXMgcmVjdXJzaXZlbHkuXG4gICAgaWYgKHJlZmVyZW5jZXIgIT0gbnVsbCkge1xuICAgICAgICB2aXNpdG9yLnJpZ2h0SGFuZE5vZGVzLmZvckVhY2gocmVmZXJlbmNlci52aXNpdCwgcmVmZXJlbmNlcik7XG4gICAgfVxufVxuXG4vLyBJbXBvcnRpbmcgSW1wb3J0RGVjbGFyYXRpb24uXG4vLyBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1tb2R1bGVkZWNsYXJhdGlvbmluc3RhbnRpYXRpb25cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9lc3RyZWUvZXN0cmVlL2Jsb2IvbWFzdGVyL2VzNi5tZCNpbXBvcnRkZWNsYXJhdGlvblxuLy8gRklYTUU6IE5vdywgd2UgZG9uJ3QgY3JlYXRlIG1vZHVsZSBlbnZpcm9ubWVudCwgYmVjYXVzZSB0aGUgY29udGV4dCBpc1xuLy8gaW1wbGVtZW50YXRpb24gZGVwZW5kZW50LlxuXG5jbGFzcyBJbXBvcnRlciBleHRlbmRzIGVzcmVjdXJzZS5WaXNpdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihkZWNsYXJhdGlvbiwgcmVmZXJlbmNlcikge1xuICAgICAgICBzdXBlcihudWxsLCByZWZlcmVuY2VyLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRlY2xhcmF0aW9uID0gZGVjbGFyYXRpb247XG4gICAgICAgIHRoaXMucmVmZXJlbmNlciA9IHJlZmVyZW5jZXI7XG4gICAgfVxuXG4gICAgdmlzaXRJbXBvcnQoaWQsIHNwZWNpZmllcikge1xuICAgICAgICB0aGlzLnJlZmVyZW5jZXIudmlzaXRQYXR0ZXJuKGlkLCAocGF0dGVybikgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2VyLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgbmV3IERlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIFZhcmlhYmxlLkltcG9ydEJpbmRpbmcsXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgIHNwZWNpZmllcixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNsYXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgbGV0IGxvY2FsID0gKG5vZGUubG9jYWwgfHwgbm9kZS5pZCk7XG4gICAgICAgIGlmIChsb2NhbCkge1xuICAgICAgICAgICAgdGhpcy52aXNpdEltcG9ydChsb2NhbCwgbm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBJbXBvcnREZWZhdWx0U3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgbGV0IGxvY2FsID0gKG5vZGUubG9jYWwgfHwgbm9kZS5pZCk7XG4gICAgICAgIHRoaXMudmlzaXRJbXBvcnQobG9jYWwsIG5vZGUpO1xuICAgIH1cblxuICAgIEltcG9ydFNwZWNpZmllcihub2RlKSB7XG4gICAgICAgIGxldCBsb2NhbCA9IChub2RlLmxvY2FsIHx8IG5vZGUuaWQpO1xuICAgICAgICBpZiAobm9kZS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0SW1wb3J0KG5vZGUubmFtZSwgbm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0SW1wb3J0KGxvY2FsLCBub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gUmVmZXJlbmNpbmcgdmFyaWFibGVzIGFuZCBjcmVhdGluZyBiaW5kaW5ncy5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlZmVyZW5jZXIgZXh0ZW5kcyBlc3JlY3Vyc2UuVmlzaXRvciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucywgc2NvcGVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKG51bGwsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlciA9IHNjb3BlTWFuYWdlcjtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmlzSW5uZXJNZXRob2REZWZpbml0aW9uID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY3VycmVudFNjb3BlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY29wZU1hbmFnZXIuX19jdXJyZW50U2NvcGU7XG4gICAgfVxuXG4gICAgY2xvc2Uobm9kZSkge1xuICAgICAgICB3aGlsZSAodGhpcy5jdXJyZW50U2NvcGUoKSAmJiBub2RlID09PSB0aGlzLmN1cnJlbnRTY29wZSgpLmJsb2NrKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX2N1cnJlbnRTY29wZSA9IHRoaXMuY3VycmVudFNjb3BlKCkuX19jbG9zZSh0aGlzLnNjb3BlTWFuYWdlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdXNoSW5uZXJNZXRob2REZWZpbml0aW9uKGlzSW5uZXJNZXRob2REZWZpbml0aW9uKSB7XG4gICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMuaXNJbm5lck1ldGhvZERlZmluaXRpb247XG4gICAgICAgIHRoaXMuaXNJbm5lck1ldGhvZERlZmluaXRpb24gPSBpc0lubmVyTWV0aG9kRGVmaW5pdGlvbjtcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzO1xuICAgIH1cblxuICAgIHBvcElubmVyTWV0aG9kRGVmaW5pdGlvbihpc0lubmVyTWV0aG9kRGVmaW5pdGlvbikge1xuICAgICAgICB0aGlzLmlzSW5uZXJNZXRob2REZWZpbml0aW9uID0gaXNJbm5lck1ldGhvZERlZmluaXRpb247XG4gICAgfVxuXG4gICAgbWF0ZXJpYWxpemVURFpTY29wZShub2RlLCBpdGVyYXRpb25Ob2RlKSB7XG4gICAgICAgIC8vIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXJ1bnRpbWUtc2VtYW50aWNzLWZvcmluLWRpdi1vZmV4cHJlc3Npb25ldmFsdWF0aW9uLWFic3RyYWN0LW9wZXJhdGlvblxuICAgICAgICAvLyBURFogc2NvcGUgaGlkZXMgdGhlIGRlY2xhcmF0aW9uJ3MgbmFtZXMuXG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdFREWlNjb3BlKG5vZGUsIGl0ZXJhdGlvbk5vZGUpO1xuICAgICAgICB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmN1cnJlbnRTY29wZSgpLCBWYXJpYWJsZS5URFosIGl0ZXJhdGlvbk5vZGUubGVmdCwgMCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgbWF0ZXJpYWxpemVJdGVyYXRpb25TY29wZShub2RlKSB7XG4gICAgICAgIC8vIEdlbmVyYXRlIGl0ZXJhdGlvbiBzY29wZSBmb3IgdXBwZXIgRm9ySW4vRm9yT2YgU3RhdGVtZW50cy5cbiAgICAgICAgdmFyIGxldE9yQ29uc3REZWNsO1xuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RGb3JTY29wZShub2RlKTtcbiAgICAgICAgbGV0T3JDb25zdERlY2wgPSBub2RlLmxlZnQ7XG4gICAgICAgIHRoaXMudmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuY3VycmVudFNjb3BlKCksIFZhcmlhYmxlLlZhcmlhYmxlLCBsZXRPckNvbnN0RGVjbCwgMCk7XG4gICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKGxldE9yQ29uc3REZWNsLmRlY2xhcmF0aW9uc1swXS5pZCwgKHBhdHRlcm4pID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhwYXR0ZXJuLCBSZWZlcmVuY2UuV1JJVEUsIG5vZGUucmlnaHQsIG51bGwsIHRydWUsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZWZlcmVuY2luZ0RlZmF1bHRWYWx1ZShwYXR0ZXJuLCBhc3NpZ25tZW50cywgbWF5YmVJbXBsaWNpdEdsb2JhbCwgaW5pdCkge1xuICAgICAgICBjb25zdCBzY29wZSA9IHRoaXMuY3VycmVudFNjb3BlKCk7XG4gICAgICAgIGFzc2lnbm1lbnRzLmZvckVhY2goYXNzaWdubWVudCA9PiB7XG4gICAgICAgICAgICBzY29wZS5fX3JlZmVyZW5jaW5nKFxuICAgICAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgUmVmZXJlbmNlLldSSVRFLFxuICAgICAgICAgICAgICAgIGFzc2lnbm1lbnQucmlnaHQsXG4gICAgICAgICAgICAgICAgbWF5YmVJbXBsaWNpdEdsb2JhbCxcbiAgICAgICAgICAgICAgICBwYXR0ZXJuICE9PSBhc3NpZ25tZW50LmxlZnQsXG4gICAgICAgICAgICAgICAgaW5pdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHZpc2l0UGF0dGVybihub2RlLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7cHJvY2Vzc1JpZ2h0SGFuZE5vZGVzOiBmYWxzZX1cbiAgICAgICAgfVxuICAgICAgICB0cmF2ZXJzZUlkZW50aWZpZXJJblBhdHRlcm4oXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgb3B0aW9ucy5wcm9jZXNzUmlnaHRIYW5kTm9kZXMgPyB0aGlzIDogbnVsbCxcbiAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB2aXNpdEZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGksIGl6O1xuICAgICAgICAvLyBGdW5jdGlvbkRlY2xhcmF0aW9uIG5hbWUgaXMgZGVmaW5lZCBpbiB1cHBlciBzY29wZVxuICAgICAgICAvLyBOT1RFOiBOb3QgcmVmZXJyaW5nIHZhcmlhYmxlU2NvcGUuIEl0IGlzIGludGVuZGVkLlxuICAgICAgICAvLyBTaW5jZVxuICAgICAgICAvLyAgaW4gRVM1LCBGdW5jdGlvbkRlY2xhcmF0aW9uIHNob3VsZCBiZSBpbiBGdW5jdGlvbkJvZHkuXG4gICAgICAgIC8vICBpbiBFUzYsIEZ1bmN0aW9uRGVjbGFyYXRpb24gc2hvdWxkIGJlIGJsb2NrIHNjb3BlZC5cbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gU3ludGF4LkZ1bmN0aW9uRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgIC8vIGlkIGlzIGRlZmluZWQgaW4gdXBwZXIgc2NvcGVcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19kZWZpbmUobm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmV3IERlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZS5GdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZ1bmN0aW9uRXhwcmVzc2lvbiB3aXRoIG5hbWUgY3JlYXRlcyBpdHMgc3BlY2lhbCBzY29wZTtcbiAgICAgICAgLy8gRnVuY3Rpb25FeHByZXNzaW9uTmFtZVNjb3BlLlxuICAgICAgICBpZiAobm9kZS50eXBlID09PSBTeW50YXguRnVuY3Rpb25FeHByZXNzaW9uICYmIG5vZGUuaWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEZ1bmN0aW9uRXhwcmVzc2lvbk5hbWVTY29wZShub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnNpZGVyIHRoaXMgZnVuY3Rpb24gaXMgaW4gdGhlIE1ldGhvZERlZmluaXRpb24uXG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEZ1bmN0aW9uU2NvcGUobm9kZSwgdGhpcy5pc0lubmVyTWV0aG9kRGVmaW5pdGlvbik7XG5cbiAgICAgICAgLy8gUHJvY2VzcyBwYXJhbWV0ZXIgZGVjbGFyYXRpb25zLlxuICAgICAgICBmb3IgKGkgPSAwLCBpeiA9IG5vZGUucGFyYW1zLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKG5vZGUucGFyYW1zW2ldLCB7cHJvY2Vzc1JpZ2h0SGFuZE5vZGVzOiB0cnVlfSwgKHBhdHRlcm4sIGluZm8pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQYXJhbWV0ZXJEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5yZXN0XG4gICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2luZ0RlZmF1bHRWYWx1ZShwYXR0ZXJuLCBpbmZvLmFzc2lnbm1lbnRzLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBhIHJlc3QgYXJndW1lbnQsIGFkZCB0aGF0XG4gICAgICAgIGlmIChub2RlLnJlc3QpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUmVzdEVsZW1lbnQnLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50OiBub2RlLnJlc3RcbiAgICAgICAgICAgIH0sIChwYXR0ZXJuKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICBuZXcgUGFyYW1ldGVyRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXJhbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2tpcCBCbG9ja1N0YXRlbWVudCB0byBwcmV2ZW50IGNyZWF0aW5nIEJsb2NrU3RhdGVtZW50IHNjb3BlLlxuICAgICAgICBpZiAobm9kZS5ib2R5LnR5cGUgPT09IFN5bnRheC5CbG9ja1N0YXRlbWVudCkge1xuICAgICAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUuYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIHZpc2l0Q2xhc3Mobm9kZSkge1xuICAgICAgICBpZiAobm9kZS50eXBlID09PSBTeW50YXguQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIFZhcmlhYmxlLkNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRklYTUU6IE1heWJlIGNvbnNpZGVyIFREWi5cbiAgICAgICAgdGhpcy52aXNpdChub2RlLnN1cGVyQ2xhc3MpO1xuXG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdENsYXNzU2NvcGUobm9kZSk7XG5cbiAgICAgICAgaWYgKG5vZGUuaWQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19kZWZpbmUobm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmV3IERlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZS5DbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG5cbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICB2aXNpdFByb3BlcnR5KG5vZGUpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzLCBpc01ldGhvZERlZmluaXRpb247XG4gICAgICAgIGlmIChub2RlLmNvbXB1dGVkKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUua2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlzTWV0aG9kRGVmaW5pdGlvbiA9IG5vZGUudHlwZSA9PT0gU3ludGF4Lk1ldGhvZERlZmluaXRpb247XG4gICAgICAgIGlmIChpc01ldGhvZERlZmluaXRpb24pIHtcbiAgICAgICAgICAgIHByZXZpb3VzID0gdGhpcy5wdXNoSW5uZXJNZXRob2REZWZpbml0aW9uKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS52YWx1ZSk7XG4gICAgICAgIGlmIChpc01ldGhvZERlZmluaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucG9wSW5uZXJNZXRob2REZWZpbml0aW9uKHByZXZpb3VzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZpc2l0Rm9ySW4obm9kZSkge1xuICAgICAgICBpZiAobm9kZS5sZWZ0LnR5cGUgPT09IFN5bnRheC5WYXJpYWJsZURlY2xhcmF0aW9uICYmIG5vZGUubGVmdC5raW5kICE9PSAndmFyJykge1xuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbGl6ZVREWlNjb3BlKG5vZGUucmlnaHQsIG5vZGUpO1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLnJpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2Uobm9kZS5yaWdodCk7XG5cbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxpemVJdGVyYXRpb25TY29wZShub2RlKTtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobm9kZS5sZWZ0LnR5cGUgPT09IFN5bnRheC5WYXJpYWJsZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLmxlZnQpO1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKG5vZGUubGVmdC5kZWNsYXJhdGlvbnNbMF0uaWQsIChwYXR0ZXJuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhwYXR0ZXJuLCBSZWZlcmVuY2UuV1JJVEUsIG5vZGUucmlnaHQsIG51bGwsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihub2RlLmxlZnQsIHtwcm9jZXNzUmlnaHRIYW5kTm9kZXM6IHRydWV9LCAocGF0dGVybiwgaW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF5YmVJbXBsaWNpdEdsb2JhbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50U2NvcGUoKS5pc1N0cmljdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVJbXBsaWNpdEdsb2JhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2luZ0RlZmF1bHRWYWx1ZShwYXR0ZXJuLCBpbmZvLmFzc2lnbm1lbnRzLCBtYXliZUltcGxpY2l0R2xvYmFsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhwYXR0ZXJuLCBSZWZlcmVuY2UuV1JJVEUsIG5vZGUucmlnaHQsIG1heWJlSW1wbGljaXRHbG9iYWwsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5yaWdodCk7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24odmFyaWFibGVUYXJnZXRTY29wZSwgdHlwZSwgbm9kZSwgaW5kZXgsIGZyb21URFopIHtcbiAgICAgICAgLy8gSWYgdGhpcyB3YXMgY2FsbGVkIHRvIGluaXRpYWxpemUgYSBURFogc2NvcGUsIHRoaXMgbmVlZHMgdG8gbWFrZSBkZWZpbml0aW9ucywgYnV0IGRvZXNuJ3QgbWFrZSByZWZlcmVuY2VzLlxuICAgICAgICB2YXIgZGVjbCwgaW5pdDtcblxuICAgICAgICBkZWNsID0gbm9kZS5kZWNsYXJhdGlvbnNbaW5kZXhdO1xuICAgICAgICBpbml0ID0gZGVjbC5pbml0O1xuICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihkZWNsLmlkLCB7cHJvY2Vzc1JpZ2h0SGFuZE5vZGVzOiAhZnJvbVREWn0sIChwYXR0ZXJuLCBpbmZvKSA9PiB7XG4gICAgICAgICAgICB2YXJpYWJsZVRhcmdldFNjb3BlLl9fZGVmaW5lKHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgbmV3IERlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgIGRlY2wsXG4gICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgICAgICAgICBub2RlLmtpbmRcbiAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgaWYgKCFmcm9tVERaKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2luZ0RlZmF1bHRWYWx1ZShwYXR0ZXJuLCBpbmZvLmFzc2lnbm1lbnRzLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbml0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKHBhdHRlcm4sIFJlZmVyZW5jZS5XUklURSwgaW5pdCwgbnVsbCwgIWluZm8udG9wTGV2ZWwsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBBc3NpZ25tZW50RXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIGlmIChQYXR0ZXJuVmlzaXRvci5pc1BhdHRlcm4obm9kZS5sZWZ0KSkge1xuICAgICAgICAgICAgaWYgKG5vZGUub3BlcmF0b3IgPT09ICc9Jykge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKG5vZGUubGVmdCwge3Byb2Nlc3NSaWdodEhhbmROb2RlczogdHJ1ZX0sIChwYXR0ZXJuLCBpbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXliZUltcGxpY2l0R2xvYmFsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTY29wZSgpLmlzU3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZUltcGxpY2l0R2xvYmFsID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlKHBhdHRlcm4sIGluZm8uYXNzaWdubWVudHMsIG1heWJlSW1wbGljaXRHbG9iYWwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKHBhdHRlcm4sIFJlZmVyZW5jZS5XUklURSwgbm9kZS5yaWdodCwgbWF5YmVJbXBsaWNpdEdsb2JhbCwgIWluZm8udG9wTGV2ZWwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKG5vZGUubGVmdCwgUmVmZXJlbmNlLlJXLCBub2RlLnJpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5sZWZ0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpc2l0KG5vZGUucmlnaHQpO1xuICAgIH1cblxuICAgIENhdGNoQ2xhdXNlKG5vZGUpIHtcbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0Q2F0Y2hTY29wZShub2RlKTtcblxuICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihub2RlLnBhcmFtLCB7cHJvY2Vzc1JpZ2h0SGFuZE5vZGVzOiB0cnVlfSwgKHBhdHRlcm4sIGluZm8pID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19kZWZpbmUocGF0dGVybixcbiAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuQ2F0Y2hDbGF1c2UsXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucGFyYW0sXG4gICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNpbmdEZWZhdWx0VmFsdWUocGF0dGVybiwgaW5mby5hc3NpZ25tZW50cywgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG5cbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICBQcm9ncmFtKG5vZGUpIHtcbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0R2xvYmFsU2NvcGUobm9kZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2NvcGVNYW5hZ2VyLl9faXNOb2RlanNTY29wZSgpKSB7XG4gICAgICAgICAgICAvLyBGb3JjZSBzdHJpY3RuZXNzIG9mIEdsb2JhbFNjb3BlIHRvIGZhbHNlIHdoZW4gdXNpbmcgbm9kZS5qcyBzY29wZS5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuaXNTdHJpY3QgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEZ1bmN0aW9uU2NvcGUobm9kZSwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2NvcGVNYW5hZ2VyLl9faXNFUzYoKSAmJiB0aGlzLnNjb3BlTWFuYWdlci5pc01vZHVsZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RNb2R1bGVTY29wZShub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5pc1N0cmljdE1vZGVTdXBwb3J0ZWQoKSAmJiB0aGlzLnNjb3BlTWFuYWdlci5pc0ltcGxpZWRTdHJpY3QoKSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5pc1N0cmljdCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZSk7XG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgSWRlbnRpZmllcihub2RlKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhub2RlKTtcbiAgICB9XG5cbiAgICBVcGRhdGVFeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgaWYgKFBhdHRlcm5WaXNpdG9yLmlzUGF0dGVybihub2RlLmFyZ3VtZW50KSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKG5vZGUuYXJndW1lbnQsIFJlZmVyZW5jZS5SVywgbnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdChub2RlLm9iamVjdCk7XG4gICAgICAgIGlmIChub2RlLmNvbXB1dGVkKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUucHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgUHJvcGVydHkobm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0UHJvcGVydHkobm9kZSk7XG4gICAgfVxuXG4gICAgTWV0aG9kRGVmaW5pdGlvbihub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXRQcm9wZXJ0eShub2RlKTtcbiAgICB9XG5cbiAgICBCcmVha1N0YXRlbWVudCgpIHt9XG5cbiAgICBDb250aW51ZVN0YXRlbWVudCgpIHt9XG5cbiAgICBMYWJlbGVkU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuICAgIH1cblxuICAgIEZvclN0YXRlbWVudChub2RlKSB7XG4gICAgICAgIC8vIENyZWF0ZSBGb3JTdGF0ZW1lbnQgZGVjbGFyYXRpb24uXG4gICAgICAgIC8vIE5PVEU6IEluIEVTNiwgRm9yU3RhdGVtZW50IGR5bmFtaWNhbGx5IGdlbmVyYXRlc1xuICAgICAgICAvLyBwZXIgaXRlcmF0aW9uIGVudmlyb25tZW50LiBIb3dldmVyLCBlc2NvcGUgaXNcbiAgICAgICAgLy8gYSBzdGF0aWMgYW5hbHl6ZXIsIHdlIG9ubHkgZ2VuZXJhdGUgb25lIHNjb3BlIGZvciBGb3JTdGF0ZW1lbnQuXG4gICAgICAgIGlmIChub2RlLmluaXQgJiYgbm9kZS5pbml0LnR5cGUgPT09IFN5bnRheC5WYXJpYWJsZURlY2xhcmF0aW9uICYmIG5vZGUuaW5pdC5raW5kICE9PSAndmFyJykge1xuICAgICAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0Rm9yU2NvcGUobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZSk7XG5cbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICBDbGFzc0V4cHJlc3Npb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0Q2xhc3Mobm9kZSk7XG4gICAgfVxuXG4gICAgQ2xhc3NEZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXRDbGFzcyhub2RlKTtcbiAgICB9XG5cbiAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIC8vIENoZWNrIHRoaXMgaXMgZGlyZWN0IGNhbGwgdG8gZXZhbFxuICAgICAgICBpZiAoIXRoaXMuc2NvcGVNYW5hZ2VyLl9faWdub3JlRXZhbCgpICYmIG5vZGUuY2FsbGVlLnR5cGUgPT09IFN5bnRheC5JZGVudGlmaWVyICYmIG5vZGUuY2FsbGVlLm5hbWUgPT09ICdldmFsJykge1xuICAgICAgICAgICAgLy8gTk9URTogVGhpcyBzaG91bGQgYmUgYHZhcmlhYmxlU2NvcGVgLiBTaW5jZSBkaXJlY3QgZXZhbCBjYWxsIGFsd2F5cyBjcmVhdGVzIExleGljYWwgZW52aXJvbm1lbnQgYW5kXG4gICAgICAgICAgICAvLyBsZXQgLyBjb25zdCBzaG91bGQgYmUgZW5jbG9zZWQgaW50byBpdC4gT25seSBWYXJpYWJsZURlY2xhcmF0aW9uIGFmZmVjdHMgb24gdGhlIGNhbGxlcidzIGVudmlyb25tZW50LlxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS52YXJpYWJsZVNjb3BlLl9fZGV0ZWN0RXZhbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlKTtcbiAgICB9XG5cbiAgICBCbG9ja1N0YXRlbWVudChub2RlKSB7XG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEJsb2NrU2NvcGUobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZSk7XG5cbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICBUaGlzRXhwcmVzc2lvbigpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS52YXJpYWJsZVNjb3BlLl9fZGV0ZWN0VGhpcygpO1xuICAgIH1cblxuICAgIFdpdGhTdGF0ZW1lbnQobm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0KG5vZGUub2JqZWN0KTtcbiAgICAgICAgLy8gVGhlbiBuZXN0IHNjb3BlIGZvciBXaXRoU3RhdGVtZW50LlxuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RXaXRoU2NvcGUobm9kZSk7XG5cbiAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuXG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgVmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIHZhciB2YXJpYWJsZVRhcmdldFNjb3BlLCBpLCBpeiwgZGVjbDtcbiAgICAgICAgdmFyaWFibGVUYXJnZXRTY29wZSA9IChub2RlLmtpbmQgPT09ICd2YXInKSA/IHRoaXMuY3VycmVudFNjb3BlKCkudmFyaWFibGVTY29wZSA6IHRoaXMuY3VycmVudFNjb3BlKCk7XG4gICAgICAgIGZvciAoaSA9IDAsIGl6ID0gbm9kZS5kZWNsYXJhdGlvbnMubGVuZ3RoOyBpIDwgaXo7ICsraSkge1xuICAgICAgICAgICAgZGVjbCA9IG5vZGUuZGVjbGFyYXRpb25zW2ldO1xuICAgICAgICAgICAgdGhpcy52aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24odmFyaWFibGVUYXJnZXRTY29wZSwgVmFyaWFibGUuVmFyaWFibGUsIG5vZGUsIGkpO1xuICAgICAgICAgICAgaWYgKGRlY2wuaW5pdCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaXQoZGVjbC5pbml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNlYyAxMy4xMS44XG4gICAgU3dpdGNoU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdmFyIGksIGl6O1xuXG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5kaXNjcmltaW5hbnQpO1xuXG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdFN3aXRjaFNjb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMCwgaXogPSBub2RlLmNhc2VzLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5jYXNlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIEZ1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0RnVuY3Rpb24obm9kZSk7XG4gICAgfVxuXG4gICAgRnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZ1bmN0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEZvck9mU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZvckluKG5vZGUpO1xuICAgIH1cblxuICAgIEZvckluU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZvckluKG5vZGUpO1xuICAgIH1cblxuICAgIEFycm93RnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZ1bmN0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGltcG9ydGVyO1xuXG4gICAgICAgIGFzc2VydCh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkgJiYgdGhpcy5zY29wZU1hbmFnZXIuaXNNb2R1bGUoKSwgJ0ltcG9ydERlY2xhcmF0aW9uIHNob3VsZCBhcHBlYXIgd2hlbiB0aGUgbW9kZSBpcyBFUzYgYW5kIGluIHRoZSBtb2R1bGUgY29udGV4dC4nKTtcblxuICAgICAgICBpbXBvcnRlciA9IG5ldyBJbXBvcnRlcihub2RlLCB0aGlzKTtcbiAgICAgICAgaW1wb3J0ZXIudmlzaXQobm9kZSk7XG4gICAgfVxuXG4gICAgdmlzaXRFeHBvcnREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUuZGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIEV4cG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEV4cG9ydERlY2xhcmF0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0RXhwb3J0RGVjbGFyYXRpb24obm9kZSk7XG4gICAgfVxuXG4gICAgRXhwb3J0U3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgbGV0IGxvY2FsID0gKG5vZGUuaWQgfHwgbm9kZS5sb2NhbCk7XG4gICAgICAgIHRoaXMudmlzaXQobG9jYWwpO1xuICAgIH1cblxuICAgIE1ldGFQcm9wZXJ0eSgpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZy5cbiAgICB9XG59XG5cbi8qIHZpbTogc2V0IHN3PTQgdHM9NCBldCB0dz04MCA6ICovXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

}, function(modId) { var map = {"./reference":1602510871641,"./variable":1602510871642,"./pattern-visitor":1602510871645,"./definition":1602510871643}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871645, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _estraverse = require('estraverse');

var _esrecurse = require('esrecurse');

var _esrecurse2 = _interopRequireDefault(_esrecurse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */

function getLast(xs) {
    return xs[xs.length - 1] || null;
}

var PatternVisitor = function (_esrecurse$Visitor) {
    _inherits(PatternVisitor, _esrecurse$Visitor);

    _createClass(PatternVisitor, null, [{
        key: 'isPattern',
        value: function isPattern(node) {
            var nodeType = node.type;
            return nodeType === _estraverse.Syntax.Identifier || nodeType === _estraverse.Syntax.ObjectPattern || nodeType === _estraverse.Syntax.ArrayPattern || nodeType === _estraverse.Syntax.SpreadElement || nodeType === _estraverse.Syntax.RestElement || nodeType === _estraverse.Syntax.AssignmentPattern;
        }
    }]);

    function PatternVisitor(options, rootPattern, callback) {
        _classCallCheck(this, PatternVisitor);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PatternVisitor).call(this, null, options));

        _this.rootPattern = rootPattern;
        _this.callback = callback;
        _this.assignments = [];
        _this.rightHandNodes = [];
        _this.restElements = [];
        return _this;
    }

    _createClass(PatternVisitor, [{
        key: 'Identifier',
        value: function Identifier(pattern) {
            var lastRestElement = getLast(this.restElements);
            this.callback(pattern, {
                topLevel: pattern === this.rootPattern,
                rest: lastRestElement != null && lastRestElement.argument === pattern,
                assignments: this.assignments
            });
        }
    }, {
        key: 'Property',
        value: function Property(property) {
            // Computed property's key is a right hand node.
            if (property.computed) {
                this.rightHandNodes.push(property.key);
            }

            // If it's shorthand, its key is same as its value.
            // If it's shorthand and has its default value, its key is same as its value.left (the value is AssignmentPattern).
            // If it's not shorthand, the name of new variable is its value's.
            this.visit(property.value);
        }
    }, {
        key: 'ArrayPattern',
        value: function ArrayPattern(pattern) {
            var i, iz, element;
            for (i = 0, iz = pattern.elements.length; i < iz; ++i) {
                element = pattern.elements[i];
                this.visit(element);
            }
        }
    }, {
        key: 'AssignmentPattern',
        value: function AssignmentPattern(pattern) {
            this.assignments.push(pattern);
            this.visit(pattern.left);
            this.rightHandNodes.push(pattern.right);
            this.assignments.pop();
        }
    }, {
        key: 'RestElement',
        value: function RestElement(pattern) {
            this.restElements.push(pattern);
            this.visit(pattern.argument);
            this.restElements.pop();
        }
    }, {
        key: 'MemberExpression',
        value: function MemberExpression(node) {
            // Computed property's key is a right hand node.
            if (node.computed) {
                this.rightHandNodes.push(node.property);
            }
            // the object is only read, write to its property.
            this.rightHandNodes.push(node.object);
        }

        //
        // ForInStatement.left and AssignmentExpression.left are LeftHandSideExpression.
        // By spec, LeftHandSideExpression is Pattern or MemberExpression.
        //   (see also: https://github.com/estree/estree/pull/20#issuecomment-74584758)
        // But espree 2.0 and esprima 2.0 parse to ArrayExpression, ObjectExpression, etc...
        //

    }, {
        key: 'SpreadElement',
        value: function SpreadElement(node) {
            this.visit(node.argument);
        }
    }, {
        key: 'ArrayExpression',
        value: function ArrayExpression(node) {
            node.elements.forEach(this.visit, this);
        }
    }, {
        key: 'AssignmentExpression',
        value: function AssignmentExpression(node) {
            this.assignments.push(node);
            this.visit(node.left);
            this.rightHandNodes.push(node.right);
            this.assignments.pop();
        }
    }, {
        key: 'CallExpression',
        value: function CallExpression(node) {
            var _this2 = this;

            // arguments are right hand nodes.
            node.arguments.forEach(function (a) {
                _this2.rightHandNodes.push(a);
            });
            this.visit(node.callee);
        }
    }]);

    return PatternVisitor;
}(_esrecurse2.default.Visitor);

/* vim: set sw=4 ts=4 et tw=80 : */


exports.default = PatternVisitor;
//# sourceMappingURL=data:application/json;base64,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Ozs7OztzQ0FnQlQsTUFBTTtBQUNoQixpQkFBSyxLQUFMLENBQVcsS0FBSyxRQUFMLENBQVgsQ0FEZ0I7Ozs7d0NBSUosTUFBTTtBQUNsQixpQkFBSyxRQUFMLENBQWMsT0FBZCxDQUFzQixLQUFLLEtBQUwsRUFBWSxJQUFsQyxFQURrQjs7Ozs2Q0FJRCxNQUFNO0FBQ3ZCLGlCQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsSUFBdEIsRUFEdUI7QUFFdkIsaUJBQUssS0FBTCxDQUFXLEtBQUssSUFBTCxDQUFYLENBRnVCO0FBR3ZCLGlCQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsS0FBSyxLQUFMLENBQXpCLENBSHVCO0FBSXZCLGlCQUFLLFdBQUwsQ0FBaUIsR0FBakIsR0FKdUI7Ozs7dUNBT1osTUFBTTs7OztBQUVqQixpQkFBSyxTQUFMLENBQWUsT0FBZixDQUF1QixhQUFLO0FBQUUsdUJBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixDQUF6QixFQUFGO2FBQUwsQ0FBdkIsQ0FGaUI7QUFHakIsaUJBQUssS0FBTCxDQUFXLEtBQUssTUFBTCxDQUFYLENBSGlCOzs7O1dBL0ZKO0VBQXVCLG9CQUFVLE9BQVY7Ozs7O2tCQUF2QiIsImZpbGUiOiJwYXR0ZXJuLXZpc2l0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICBDb3B5cmlnaHQgKEMpIDIwMTUgWXVzdWtlIFN1enVraSA8dXRhdGFuZS50ZWFAZ21haWwuY29tPlxuXG4gIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4gICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiXG4gIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0VcbiAgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIDxDT1BZUklHSFQgSE9MREVSPiBCRSBMSUFCTEUgRk9SIEFOWVxuICBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuICAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gIExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORFxuICBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0ZcbiAgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiovXG5cbmltcG9ydCB7IFN5bnRheCB9IGZyb20gJ2VzdHJhdmVyc2UnO1xuaW1wb3J0IGVzcmVjdXJzZSBmcm9tICdlc3JlY3Vyc2UnO1xuXG5mdW5jdGlvbiBnZXRMYXN0KHhzKSB7XG4gICAgcmV0dXJuIHhzW3hzLmxlbmd0aCAtIDFdIHx8IG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdHRlcm5WaXNpdG9yIGV4dGVuZHMgZXNyZWN1cnNlLlZpc2l0b3Ige1xuICAgIHN0YXRpYyBpc1BhdHRlcm4obm9kZSkge1xuICAgICAgICB2YXIgbm9kZVR5cGUgPSBub2RlLnR5cGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBub2RlVHlwZSA9PT0gU3ludGF4LklkZW50aWZpZXIgfHxcbiAgICAgICAgICAgIG5vZGVUeXBlID09PSBTeW50YXguT2JqZWN0UGF0dGVybiB8fFxuICAgICAgICAgICAgbm9kZVR5cGUgPT09IFN5bnRheC5BcnJheVBhdHRlcm4gfHxcbiAgICAgICAgICAgIG5vZGVUeXBlID09PSBTeW50YXguU3ByZWFkRWxlbWVudCB8fFxuICAgICAgICAgICAgbm9kZVR5cGUgPT09IFN5bnRheC5SZXN0RWxlbWVudCB8fFxuICAgICAgICAgICAgbm9kZVR5cGUgPT09IFN5bnRheC5Bc3NpZ25tZW50UGF0dGVyblxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMsIHJvb3RQYXR0ZXJuLCBjYWxsYmFjaykge1xuICAgICAgICBzdXBlcihudWxsLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5yb290UGF0dGVybiA9IHJvb3RQYXR0ZXJuO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuYXNzaWdubWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5yaWdodEhhbmROb2RlcyA9IFtdO1xuICAgICAgICB0aGlzLnJlc3RFbGVtZW50cyA9IFtdO1xuICAgIH1cblxuICAgIElkZW50aWZpZXIocGF0dGVybikge1xuICAgICAgICBjb25zdCBsYXN0UmVzdEVsZW1lbnQgPSBnZXRMYXN0KHRoaXMucmVzdEVsZW1lbnRzKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayhwYXR0ZXJuLCB7XG4gICAgICAgICAgICB0b3BMZXZlbDogcGF0dGVybiA9PT0gdGhpcy5yb290UGF0dGVybixcbiAgICAgICAgICAgIHJlc3Q6IGxhc3RSZXN0RWxlbWVudCAhPSBudWxsICYmIGxhc3RSZXN0RWxlbWVudC5hcmd1bWVudCA9PT0gcGF0dGVybixcbiAgICAgICAgICAgIGFzc2lnbm1lbnRzOiB0aGlzLmFzc2lnbm1lbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbXB1dGVkIHByb3BlcnR5J3Mga2V5IGlzIGEgcmlnaHQgaGFuZCBub2RlLlxuICAgICAgICBpZiAocHJvcGVydHkuY29tcHV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRIYW5kTm9kZXMucHVzaChwcm9wZXJ0eS5rZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgaXQncyBzaG9ydGhhbmQsIGl0cyBrZXkgaXMgc2FtZSBhcyBpdHMgdmFsdWUuXG4gICAgICAgIC8vIElmIGl0J3Mgc2hvcnRoYW5kIGFuZCBoYXMgaXRzIGRlZmF1bHQgdmFsdWUsIGl0cyBrZXkgaXMgc2FtZSBhcyBpdHMgdmFsdWUubGVmdCAodGhlIHZhbHVlIGlzIEFzc2lnbm1lbnRQYXR0ZXJuKS5cbiAgICAgICAgLy8gSWYgaXQncyBub3Qgc2hvcnRoYW5kLCB0aGUgbmFtZSBvZiBuZXcgdmFyaWFibGUgaXMgaXRzIHZhbHVlJ3MuXG4gICAgICAgIHRoaXMudmlzaXQocHJvcGVydHkudmFsdWUpO1xuICAgIH1cblxuICAgIEFycmF5UGF0dGVybihwYXR0ZXJuKSB7XG4gICAgICAgIHZhciBpLCBpeiwgZWxlbWVudDtcbiAgICAgICAgZm9yIChpID0gMCwgaXogPSBwYXR0ZXJuLmVsZW1lbnRzLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBwYXR0ZXJuLmVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgdGhpcy52aXNpdChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEFzc2lnbm1lbnRQYXR0ZXJuKHBhdHRlcm4pIHtcbiAgICAgICAgdGhpcy5hc3NpZ25tZW50cy5wdXNoKHBhdHRlcm4pO1xuICAgICAgICB0aGlzLnZpc2l0KHBhdHRlcm4ubGVmdCk7XG4gICAgICAgIHRoaXMucmlnaHRIYW5kTm9kZXMucHVzaChwYXR0ZXJuLnJpZ2h0KTtcbiAgICAgICAgdGhpcy5hc3NpZ25tZW50cy5wb3AoKTtcbiAgICB9XG5cbiAgICBSZXN0RWxlbWVudChwYXR0ZXJuKSB7XG4gICAgICAgIHRoaXMucmVzdEVsZW1lbnRzLnB1c2gocGF0dGVybik7XG4gICAgICAgIHRoaXMudmlzaXQocGF0dGVybi5hcmd1bWVudCk7XG4gICAgICAgIHRoaXMucmVzdEVsZW1lbnRzLnBvcCgpO1xuICAgIH1cblxuICAgIE1lbWJlckV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICAvLyBDb21wdXRlZCBwcm9wZXJ0eSdzIGtleSBpcyBhIHJpZ2h0IGhhbmQgbm9kZS5cbiAgICAgICAgaWYgKG5vZGUuY29tcHV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRIYW5kTm9kZXMucHVzaChub2RlLnByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGUgb2JqZWN0IGlzIG9ubHkgcmVhZCwgd3JpdGUgdG8gaXRzIHByb3BlcnR5LlxuICAgICAgICB0aGlzLnJpZ2h0SGFuZE5vZGVzLnB1c2gobm9kZS5vYmplY3QpO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gRm9ySW5TdGF0ZW1lbnQubGVmdCBhbmQgQXNzaWdubWVudEV4cHJlc3Npb24ubGVmdCBhcmUgTGVmdEhhbmRTaWRlRXhwcmVzc2lvbi5cbiAgICAvLyBCeSBzcGVjLCBMZWZ0SGFuZFNpZGVFeHByZXNzaW9uIGlzIFBhdHRlcm4gb3IgTWVtYmVyRXhwcmVzc2lvbi5cbiAgICAvLyAgIChzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL2VzdHJlZS9lc3RyZWUvcHVsbC8yMCNpc3N1ZWNvbW1lbnQtNzQ1ODQ3NTgpXG4gICAgLy8gQnV0IGVzcHJlZSAyLjAgYW5kIGVzcHJpbWEgMi4wIHBhcnNlIHRvIEFycmF5RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgZXRjLi4uXG4gICAgLy9cblxuICAgIFNwcmVhZEVsZW1lbnQobm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYXJndW1lbnQpO1xuICAgIH1cblxuICAgIEFycmF5RXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIG5vZGUuZWxlbWVudHMuZm9yRWFjaCh0aGlzLnZpc2l0LCB0aGlzKTtcbiAgICB9XG5cbiAgICBBc3NpZ25tZW50RXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIHRoaXMuYXNzaWdubWVudHMucHVzaChub2RlKTtcbiAgICAgICAgdGhpcy52aXNpdChub2RlLmxlZnQpO1xuICAgICAgICB0aGlzLnJpZ2h0SGFuZE5vZGVzLnB1c2gobm9kZS5yaWdodCk7XG4gICAgICAgIHRoaXMuYXNzaWdubWVudHMucG9wKCk7XG4gICAgfVxuXG4gICAgQ2FsbEV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICAvLyBhcmd1bWVudHMgYXJlIHJpZ2h0IGhhbmQgbm9kZXMuXG4gICAgICAgIG5vZGUuYXJndW1lbnRzLmZvckVhY2goYSA9PiB7IHRoaXMucmlnaHRIYW5kTm9kZXMucHVzaChhKTsgfSk7XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5jYWxsZWUpO1xuICAgIH1cbn1cblxuLyogdmltOiBzZXQgc3c9NCB0cz00IGV0IHR3PTgwIDogKi9cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871646, function(require, module, exports) {
module.exports = {
  "_from": "escope@^3.6.0",
  "_id": "escope@3.6.0",
  "_inBundle": false,
  "_integrity": "sha1-4Bl16BJ4GhY6ba392AOY3GTIicM=",
  "_location": "/escope",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "escope@^3.6.0",
    "name": "escope",
    "escapedName": "escope",
    "rawSpec": "^3.6.0",
    "saveSpec": null,
    "fetchSpec": "^3.6.0"
  },
  "_requiredBy": [
    "/webpack"
  ],
  "_resolved": "https://registry.npmjs.org/escope/-/escope-3.6.0.tgz",
  "_shasum": "e01975e812781a163a6dadfdd80398dc64c889c3",
  "_spec": "escope@^3.6.0",
  "_where": "E:\\gitworkspace\\exchange_wxmini\\node_modules\\webpack",
  "bugs": {
    "url": "https://github.com/estools/escope/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "es6-map": "^0.1.3",
    "es6-weak-map": "^2.0.1",
    "esrecurse": "^4.1.0",
    "estraverse": "^4.1.1"
  },
  "deprecated": false,
  "description": "ECMAScript scope analyzer",
  "devDependencies": {
    "babel": "^6.3.26",
    "babel-preset-es2015": "^6.3.13",
    "babel-register": "^6.3.13",
    "browserify": "^13.0.0",
    "chai": "^3.4.1",
    "espree": "^3.1.1",
    "esprima": "^2.7.1",
    "gulp": "^3.9.0",
    "gulp-babel": "^6.1.1",
    "gulp-bump": "^1.0.0",
    "gulp-eslint": "^1.1.1",
    "gulp-espower": "^1.0.2",
    "gulp-filter": "^3.0.1",
    "gulp-git": "^1.6.1",
    "gulp-mocha": "^2.2.0",
    "gulp-plumber": "^1.0.1",
    "gulp-sourcemaps": "^1.6.0",
    "gulp-tag-version": "^1.3.0",
    "jsdoc": "^3.4.0",
    "lazypipe": "^1.0.1",
    "vinyl-source-stream": "^1.1.0"
  },
  "engines": {
    "node": ">=0.4.0"
  },
  "homepage": "http://github.com/estools/escope",
  "license": "BSD-2-Clause",
  "main": "lib/index.js",
  "maintainers": [
    {
      "name": "Yusuke Suzuki",
      "email": "utatane.tea@gmail.com",
      "url": "http://github.com/Constellation"
    }
  ],
  "name": "escope",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/estools/escope.git"
  },
  "scripts": {
    "jsdoc": "jsdoc src/*.js README.md",
    "lint": "gulp lint",
    "test": "gulp travis",
    "unit-test": "gulp test"
  },
  "version": "3.6.0"
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510871638);
})()
//# sourceMappingURL=index.js.map