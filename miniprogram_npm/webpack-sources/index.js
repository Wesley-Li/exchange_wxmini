module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510872111, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
exports.Source = require("./Source");

exports.RawSource = require("./RawSource");
exports.OriginalSource = require("./OriginalSource");
exports.SourceMapSource = require("./SourceMapSource");
exports.LineToLineMappedSource = require("./LineToLineMappedSource");

exports.CachedSource = require("./CachedSource");
exports.ConcatSource = require("./ConcatSource");
exports.ReplaceSource = require("./ReplaceSource");
exports.PrefixSource = require("./PrefixSource");

}, function(modId) {var map = {"./Source":1602510872112,"./RawSource":1602510872113,"./OriginalSource":1602510872114,"./SourceMapSource":1602510872116,"./LineToLineMappedSource":1602510872118,"./CachedSource":1602510872119,"./ConcatSource":1602510872120,"./ReplaceSource":1602510872121,"./PrefixSource":1602510872122}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872112, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;

class Source {

	source() {
		throw new Error("Abstract");
	}

	size() {
		if(Buffer.from.length === 1) return new Buffer(this.source()).length;
		return Buffer.byteLength(this.source())
	}

	map(options) {
		return null;
	}

	sourceAndMap(options) {
		return {
			source: this.source(),
			map: this.map()
		};
	}

	node() {
		throw new Error("Abstract");
	}

	listNode() {
		throw new Error("Abstract");
	}

	updateHash(hash) {
		var source = this.source();
		hash.update(source || "");
	}
}

module.exports = Source;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872113, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var Source = require("./Source");
var SourceNode = require("source-map").SourceNode;
var SourceListMap = require("source-list-map").SourceListMap;

class RawSource extends Source {
	constructor(value) {
		super();
		this._value = value;
	}

	source() {
		return this._value;
	}

	map(options) {
		return null;
	}

	node(options) {
		return new SourceNode(null, null, null, this._value);
	}

	listMap(options) {
		return new SourceListMap(this._value);
	}

	updateHash(hash) {
		hash.update(this._value);
	}
}

module.exports = RawSource;

}, function(modId) { var map = {"./Source":1602510872112}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872114, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var SourceListMap = require("source-list-map").SourceListMap;
var Source = require("./Source");

var SPLIT_REGEX = /(?!$)[^\n\r;{}]*[\n\r;{}]*/g;

function _splitCode(code) {
	return code.match(SPLIT_REGEX) || [];
}

class OriginalSource extends Source {
	constructor(value, name) {
		super();
		this._value = value;
		this._name = name;
	}

	source() {
		return this._value;
	}

	node(options) {
		options = options || {};
		var sourceMap = this._sourceMap;
		var value = this._value;
		var name = this._name;
		var lines = value.split("\n");
		var node = new SourceNode(null, null, null,
			lines.map(function(line, idx) {
				var pos = 0;
				if(options.columns === false) {
					var content = line + (idx != lines.length - 1 ? "\n" : "");
					return new SourceNode(idx + 1, 0, name, content);
				}
				return new SourceNode(null, null, null,
					_splitCode(line + (idx != lines.length - 1 ? "\n" : "")).map(function(item) {
						if(/^\s*$/.test(item)) {
							pos += item.length;
							return item;
						}
						var res = new SourceNode(idx + 1, pos, name, item);
						pos += item.length;
						return res;
					})
				);
			})
		);
		node.setSourceContent(name, value);
		return node;
	}

	listMap(options) {
		return new SourceListMap(this._value, this._name, this._value)
	}

	updateHash(hash) {
		hash.update(this._value);
	}
}

require("./SourceAndMapMixin")(OriginalSource.prototype);

module.exports = OriginalSource;

}, function(modId) { var map = {"./Source":1602510872112,"./SourceAndMapMixin":1602510872115}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872115, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


module.exports = function mixinSourceAndMap(proto) {
	proto.map = function(options) {
		options = options || {};
		if(options.columns === false) {
			return this.listMap(options).toStringWithSourceMap({
				file: "x"
			}).map;
		}

		return this.node(options).toStringWithSourceMap({
			file: "x"
		}).map.toJSON();
	};

	proto.sourceAndMap = function(options) {
		options = options || {};
		if(options.columns === false) {
			return this.listMap(options).toStringWithSourceMap({
				file: "x"
			});
		}

		var res = this.node(options).toStringWithSourceMap({
			file: "x"
		});
		return {
			source: res.code,
			map: res.map.toJSON()
		};
	};
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872116, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var SourceMapGenerator = require("source-map").SourceMapGenerator;
var SourceListMap = require("source-list-map").SourceListMap;
var fromStringWithSourceMap = require("source-list-map").fromStringWithSourceMap;
var Source = require("./Source");
var applySourceMap = require("./applySourceMap");

class SourceMapSource extends Source {
	constructor(value, name, sourceMap, originalSource, innerSourceMap, removeOriginalSource) {
		super();
		this._value = value;
		this._name = name;
		this._sourceMap = sourceMap;
		this._originalSource = originalSource;
		this._innerSourceMap = innerSourceMap;
		this._removeOriginalSource = removeOriginalSource;
	}

	source() {
		return this._value;
	}

	node(options) {
		var sourceMap = this._sourceMap;
		var node = SourceNode.fromStringWithSourceMap(this._value, new SourceMapConsumer(sourceMap));
		node.setSourceContent(this._name, this._originalSource);
		var innerSourceMap = this._innerSourceMap;
		if(innerSourceMap) {
			node = applySourceMap(node, new SourceMapConsumer(innerSourceMap), this._name, this._removeOriginalSource);
		}
		return node;
	}

	listMap(options) {
		options = options || {};
		if(options.module === false)
			return new SourceListMap(this._value, this._name, this._value);
		return fromStringWithSourceMap(this._value, typeof this._sourceMap === "string" ? JSON.parse(this._sourceMap) : this._sourceMap);
	}

	updateHash(hash) {
		hash.update(this._value);
		if(this._originalSource)
			hash.update(this._originalSource);
	}
}

require("./SourceAndMapMixin")(SourceMapSource.prototype);

module.exports = SourceMapSource;

}, function(modId) { var map = {"./Source":1602510872112,"./applySourceMap":1602510872117,"./SourceAndMapMixin":1602510872115}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872117, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;

var applySourceMap = function(
	sourceNode,
	sourceMapConsumer,
	sourceFile,
	removeGeneratedCodeForSourceFile
) {
	// The following notations are used to name stuff:
	// Left <------------> Middle <-------------------> Right
	// Input arguments:
	//        sourceNode                                       - Code mapping from Left to Middle
	//                   sourceFile                            - Name of a Middle file
	//                              sourceMapConsumer          - Code mapping from Middle to Right
	// Variables:
	//           l2m                      m2r
	// Left <-----------------------------------------> Right
	// Variables:
	//                       l2r

	var l2rResult = new SourceNode();
	var l2rOutput = [];

	var middleSourceContents = {};

	var m2rMappingsByLine = {};

	var rightSourceContentsSet = {};
	var rightSourceContentsLines = {};

	// Store all mappings by generated line
	sourceMapConsumer.eachMapping(
		function(mapping) {
			(m2rMappingsByLine[mapping.generatedLine] =
				m2rMappingsByLine[mapping.generatedLine] || []).push(mapping);
		},
		null,
		SourceMapConsumer.GENERATED_ORDER
	);

	// Store all source contents
	sourceNode.walkSourceContents(function(source, content) {
		middleSourceContents["$" + source] = content;
	});

	var middleSource = middleSourceContents["$" + sourceFile];
	var middleSourceLines = middleSource ? middleSource.split("\n") : undefined;

	// Walk all left to middle mappings
	sourceNode.walk(function(chunk, middleMapping) {
		var source;

		// Find a mapping from middle to right
		if(
			middleMapping.source === sourceFile &&
			middleMapping.line &&
			m2rMappingsByLine[middleMapping.line]
		) {
			var m2rBestFit;
			var m2rMappings = m2rMappingsByLine[middleMapping.line];
			// Note: if this becomes a performance problem, use binary search
			for(var i = 0; i < m2rMappings.length; i++) {
				if(m2rMappings[i].generatedColumn <= middleMapping.column) {
					m2rBestFit = m2rMappings[i];
				}
			}
			if(m2rBestFit) {
				var allowMiddleName = false;
				var middleLine;
				var rightSourceContent;
				var rightSourceContentLines;
				var rightSource = m2rBestFit.source;
				// Check if we have middle and right source for this mapping
				// Then we could have an "identify" mapping
				if(
					middleSourceLines &&
					rightSource &&
					(middleLine = middleSourceLines[m2rBestFit.generatedLine - 1]) &&
					((rightSourceContentLines = rightSourceContentsLines[rightSource]) ||
						(rightSourceContent = sourceMapConsumer.sourceContentFor(
							rightSource,
							true
						)))
				) {
					if(!rightSourceContentLines) {
						rightSourceContentLines = rightSourceContentsLines[
							rightSource
						] = rightSourceContent.split("\n");
					}
					var rightLine = rightSourceContentLines[m2rBestFit.originalLine - 1];
					if(rightLine) {
						var offset = middleMapping.column - m2rBestFit.generatedColumn;
						if(offset > 0) {
							var middlePart = middleLine.slice(
								m2rBestFit.generatedColumn,
								middleMapping.column
							);
							var rightPart = rightLine.slice(
								m2rBestFit.originalColumn,
								m2rBestFit.originalColumn + offset
							);
							if(middlePart === rightPart) {
								// When original and generated code is equal we assume we have an "identity" mapping
								// In this case we can offset the original position
								m2rBestFit = Object.assign({}, m2rBestFit, {
									originalColumn: m2rBestFit.originalColumn + offset,
									generatedColumn: middleMapping.column
								});
							}
						}
						if(!m2rBestFit.name && middleMapping.name) {
							allowMiddleName =
								rightLine.slice(
									m2rBestFit.originalColumn,
									m2rBestFit.originalColumn + middleMapping.name.length
								) === middleMapping.name;
						}
					}
				}

				// Construct a left to right node from the found middle to right mapping
				source = m2rBestFit.source;
				l2rOutput.push(
					new SourceNode(
						m2rBestFit.originalLine,
						m2rBestFit.originalColumn,
						source,
						chunk,
						allowMiddleName ? middleMapping.name : m2rBestFit.name
					)
				);

				// Set the source contents once
				if(!("$" + source in rightSourceContentsSet)) {
					rightSourceContentsSet["$" + source] = true;
					var sourceContent = sourceMapConsumer.sourceContentFor(source, true);
					if(sourceContent) {
						l2rResult.setSourceContent(source, sourceContent);
					}
				}
				return;
			}
		}

		if((removeGeneratedCodeForSourceFile && middleMapping.source === sourceFile) || !middleMapping.source) {
			// Construct a left to middle node with only generated code
			// Because user do not want mappings to middle sources
			// Or this chunk has no mapping
			l2rOutput.push(chunk);
			return;
		}

		// Construct a left to middle node
		source = middleMapping.source;
		l2rOutput.push(
			new SourceNode(
				middleMapping.line,
				middleMapping.column,
				source,
				chunk,
				middleMapping.name
			)
		);
		if("$" + source in middleSourceContents) {
			if(!("$" + source in rightSourceContentsSet)) {
				l2rResult.setSourceContent(source, middleSourceContents["$" + source]);
				delete middleSourceContents["$" + source];
			}
		}
	});

	// Put output into the resulting SourceNode
	l2rResult.add(l2rOutput);
	return l2rResult;
};

module.exports = applySourceMap;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872118, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var SourceListMap = require("source-list-map").SourceListMap;
var Source = require("./Source");

class LineToLineMappedSource extends Source {
	constructor(value, name, originalSource) {
		super();
		this._value = value;
		this._name = name;
		this._originalSource = originalSource;
	}

	source() {
		return this._value;
	}

	node(options) {
		var value = this._value;
		var name = this._name;
		var lines = value.split("\n");
		var node = new SourceNode(null, null, null,
			lines.map(function(line, idx) {
				return new SourceNode(idx + 1, 0, name, (line + (idx != lines.length - 1 ? "\n" : "")));
			})
		);
		node.setSourceContent(name, this._originalSource);
		return node;
	}

	listMap(options) {
		return new SourceListMap(this._value, this._name, this._originalSource)
	}

	updateHash(hash) {
		hash.update(this._value);
		hash.update(this._originalSource);
	}
}

require("./SourceAndMapMixin")(LineToLineMappedSource.prototype);

module.exports = LineToLineMappedSource;

}, function(modId) { var map = {"./Source":1602510872112,"./SourceAndMapMixin":1602510872115}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872119, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Source = require("./Source");

class CachedSource extends Source {
	constructor(source) {
		super();
		this._source = source;
		this._cachedSource = undefined;
		this._cachedSize = undefined;
		this._cachedMaps = {};

		if(source.node) this.node = function(options) {
			return this._source.node(options);
		};

		if(source.listMap) this.listMap = function(options) {
			return this._source.listMap(options);
		};
	}

	source() {
		if(typeof this._cachedSource !== "undefined") return this._cachedSource;
		return this._cachedSource = this._source.source();
	}

	size() {
		if(typeof this._cachedSize !== "undefined") return this._cachedSize;
		if(typeof this._cachedSource !== "undefined") {
			if(Buffer.from.length === 1) return new Buffer(this._cachedSource).length;
			return this._cachedSize = Buffer.byteLength(this._cachedSource);
		}
		return this._cachedSize = this._source.size();
	}

	sourceAndMap(options) {
		const key = JSON.stringify(options);
		if(typeof this._cachedSource !== "undefined" && key in this._cachedMaps)
			return {
				source: this._cachedSource,
				map: this._cachedMaps[key]
			};
		else if(typeof this._cachedSource !== "undefined") {
			return {
				source: this._cachedSource,
				map: this._cachedMaps[key] = this._source.map(options)
			};
		} else if(key in this._cachedMaps) {
			return {
				source: this._cachedSource = this._source.source(),
				map: this._cachedMaps[key]
			};
		}
		const result = this._source.sourceAndMap(options);
		this._cachedSource = result.source;
		this._cachedMaps[key] = result.map;
		return {
			source: this._cachedSource,
			map: this._cachedMaps[key]
		};
	}

	map(options) {
		if(!options) options = {};
		const key = JSON.stringify(options);
		if(key in this._cachedMaps)
			return this._cachedMaps[key];
		return this._cachedMaps[key] = this._source.map();
	}

	updateHash(hash) {
		this._source.updateHash(hash);
	}
}

module.exports = CachedSource;

}, function(modId) { var map = {"./Source":1602510872112}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872120, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const SourceNode = require("source-map").SourceNode;
const SourceListMap = require("source-list-map").SourceListMap;
const Source = require("./Source");

class ConcatSource extends Source {
	constructor() {
		super();
		this.children = [];
		for(var i = 0; i < arguments.length; i++) {
			var item = arguments[i];
			if(item instanceof ConcatSource) {
				var children = item.children;
				for(var j = 0; j < children.length; j++)
					this.children.push(children[j]);
			} else {
				this.children.push(item);
			}
		}
	}

	add(item) {
		if(item instanceof ConcatSource) {
			var children = item.children;
			for(var j = 0; j < children.length; j++)
				this.children.push(children[j]);
		} else {
			this.children.push(item);
		}
	}

	source() {
		let source = "";
		const children = this.children;
		for(let i = 0; i < children.length; i++) {
			const child = children[i];
			source += typeof child === "string" ? child : child.source();
		}
		return source;
	}

	size() {
		let size = 0;
		const children = this.children;
		for(let i = 0; i < children.length; i++) {
			const child = children[i];
			size += typeof child === "string" ? child.length : child.size();
		}
		return size;
	}

	node(options) {
		const node = new SourceNode(null, null, null, this.children.map(function(item) {
			return typeof item === "string" ? item : item.node(options);
		}));
		return node;
	}

	listMap(options) {
		const map = new SourceListMap();
		var children = this.children;
		for(var i = 0; i < children.length; i++) {
			var item = children[i];
			if(typeof item === "string")
				map.add(item);
			else
				map.add(item.listMap(options));
		}
		return map;
	}

	updateHash(hash) {
		var children = this.children;
		for(var i = 0; i < children.length; i++) {
			var item = children[i];
			if(typeof item === "string")
				hash.update(item);
			else
				item.updateHash(hash);
		}
	}
}

require("./SourceAndMapMixin")(ConcatSource.prototype);

module.exports = ConcatSource;

}, function(modId) { var map = {"./Source":1602510872112,"./SourceAndMapMixin":1602510872115}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872121, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var Source = require("./Source");
var SourceNode = require("source-map").SourceNode;

class Replacement {
	constructor(start, end, content, insertIndex, name) {
		this.start = start;
		this.end = end;
		this.content = content;
		this.insertIndex = insertIndex;
		this.name = name;
	}
}

class ReplaceSource extends Source {
	constructor(source, name) {
		super();
		this._source = source;
		this._name = name;
		/** @type {Replacement[]} */
		this.replacements = [];
	}

	replace(start, end, newValue, name) {
		if(typeof newValue !== "string")
			throw new Error("insertion must be a string, but is a " + typeof newValue);
		this.replacements.push(new Replacement(start, end, newValue, this.replacements.length, name));
	}

	insert(pos, newValue, name) {
		if(typeof newValue !== "string")
			throw new Error("insertion must be a string, but is a " + typeof newValue + ": " + newValue);
		this.replacements.push(new Replacement(pos, pos - 1, newValue, this.replacements.length, name));
	}

	source(options) {
		return this._replaceString(this._source.source());
	}

	original() {
		return this._source;
	}

	_sortReplacements() {
		this.replacements.sort(function(a, b) {
			var diff = b.end - a.end;
			if(diff !== 0)
				return diff;
			diff = b.start - a.start;
			if(diff !== 0)
				return diff;
			return b.insertIndex - a.insertIndex;
		});
	}

	_replaceString(str) {
		if(typeof str !== "string")
			throw new Error("str must be a string, but is a " + typeof str + ": " + str);
		this._sortReplacements();
		var result = [str];
		this.replacements.forEach(function(repl) {
			var remSource = result.pop();
			var splitted1 = this._splitString(remSource, Math.floor(repl.end + 1));
			var splitted2 = this._splitString(splitted1[0], Math.floor(repl.start));
			result.push(splitted1[1], repl.content, splitted2[0]);
		}, this);

		// write out result array in reverse order
		let resultStr = "";
		for(let i = result.length - 1; i >= 0; --i) {
			resultStr += result[i];
		}
		return resultStr;
	}

	node(options) {
		var node = this._source.node(options);
		if(this.replacements.length === 0) {
			return node;
		}
		this._sortReplacements();
		var replace = new ReplacementEnumerator(this.replacements);
		var output = [];
		var position = 0;
		var sources = Object.create(null);
		var sourcesInLines = Object.create(null);

		// We build a new list of SourceNodes in "output"
		// from the original mapping data

		var result = new SourceNode();

		// We need to add source contents manually
		// because "walk" will not handle it
		node.walkSourceContents(function(sourceFile, sourceContent) {
			result.setSourceContent(sourceFile, sourceContent);
			sources["$" + sourceFile] = sourceContent;
		});

		var replaceInStringNode = this._replaceInStringNode.bind(this, output, replace, function getOriginalSource(mapping) {
			var key = "$" + mapping.source;
			var lines = sourcesInLines[key];
			if(!lines) {
				var source = sources[key];
				if(!source) return null;
				lines = source.split("\n").map(function(line) {
					return line + "\n";
				});
				sourcesInLines[key] = lines;
			}
			// line is 1-based
			if(mapping.line > lines.length) return null;
			var line = lines[mapping.line - 1];
			return line.substr(mapping.column);
		});

		node.walk(function(chunk, mapping) {
			position = replaceInStringNode(chunk, position, mapping);
		});

		// If any replacements occur after the end of the original file, then we append them
		// directly to the end of the output
		var remaining = replace.footer();
		if(remaining) {
			output.push(remaining);
		}

		result.add(output);

		return result;
	}

	listMap(options) {
		this._sortReplacements();
		var map = this._source.listMap(options);
		var currentIndex = 0;
		var replacements = this.replacements;
		var idxReplacement = replacements.length - 1;
		var removeChars = 0;
		map = map.mapGeneratedCode(function(str) {
			var newCurrentIndex = currentIndex + str.length;
			if(removeChars > str.length) {
				removeChars -= str.length;
				str = "";
			} else {
				if(removeChars > 0) {
					str = str.substr(removeChars);
					currentIndex += removeChars;
					removeChars = 0;
				}
				var finalStr = "";
				while(idxReplacement >= 0 && replacements[idxReplacement].start < newCurrentIndex) {
					var repl = replacements[idxReplacement];
					var start = Math.floor(repl.start);
					var end = Math.floor(repl.end + 1);
					var before = str.substr(0, Math.max(0, start - currentIndex));
					if(end <= newCurrentIndex) {
						var after = str.substr(Math.max(0, end - currentIndex));
						finalStr += before + repl.content;
						str = after;
						currentIndex = Math.max(currentIndex, end);
					} else {
						finalStr += before + repl.content;
						str = "";
						removeChars = end - newCurrentIndex;
					}
					idxReplacement--;
				}
				str = finalStr + str;
			}
			currentIndex = newCurrentIndex;
			return str;
		});
		var extraCode = "";
		while(idxReplacement >= 0) {
			extraCode += replacements[idxReplacement].content;
			idxReplacement--;
		}
		if(extraCode) {
			map.add(extraCode);
		}
		return map;
	}

	_splitString(str, position) {
		return position <= 0 ? ["", str] : [str.substr(0, position), str.substr(position)];
	}

	_replaceInStringNode(output, replace, getOriginalSource, node, position, mapping) {
		var original = undefined;

		do {
			var splitPosition = replace.position - position;
			// If multiple replaces occur in the same location then the splitPosition may be
			// before the current position for the subsequent splits. Ensure it is >= 0
			if(splitPosition < 0) {
				splitPosition = 0;
			}
			if(splitPosition >= node.length || replace.done) {
				if(replace.emit) {
					var nodeEnd = new SourceNode(
						mapping.line,
						mapping.column,
						mapping.source,
						node,
						mapping.name
					);
					output.push(nodeEnd);
				}
				return position + node.length;
			}

			var originalColumn = mapping.column;

			// Try to figure out if generated code matches original code of this segement
			// If this is the case we assume that it's allowed to move mapping.column
			// Because getOriginalSource can be expensive we only do it when neccessary

			var nodePart;
			if(splitPosition > 0) {
				nodePart = node.slice(0, splitPosition);
				if(original === undefined) {
					original = getOriginalSource(mapping);
				}
				if(original && original.length >= splitPosition && original.startsWith(nodePart)) {
					mapping.column += splitPosition;
					original = original.substr(splitPosition);
				}
			}

			var emit = replace.next();
			if(!emit) {
				// Stop emitting when we have found the beginning of the string to replace.
				// Emit the part of the string before splitPosition
				if(splitPosition > 0) {
					var nodeStart = new SourceNode(
						mapping.line,
						originalColumn,
						mapping.source,
						nodePart,
						mapping.name
					);
					output.push(nodeStart);
				}

				// Emit the replacement value
				if(replace.value) {
					output.push(new SourceNode(
						mapping.line,
						mapping.column,
						mapping.source,
						replace.value,
						mapping.name || replace.name
					));
				}
			}

			// Recurse with remainder of the string as there may be multiple replaces within a single node
			node = node.substr(splitPosition);
			position += splitPosition;
		} while (true);
	}
}

class ReplacementEnumerator {
	/**
	 * @param {Replacement[]} replacements list of replacements
	 */
	constructor(replacements) {
		this.replacements = replacements || [];
		this.index = this.replacements.length;
		this.done = false;
		this.emit = false;
		// Set initial start position
		this.next();
	}

	next() {
		if(this.done)
			return true;
		if(this.emit) {
			// Start point found. stop emitting. set position to find end
			var repl = this.replacements[this.index];
			var end = Math.floor(repl.end + 1);
			this.position = end;
			this.value = repl.content;
			this.name = repl.name;
		} else {
			// End point found. start emitting. set position to find next start
			this.index--;
			if(this.index < 0) {
				this.done = true;
			} else {
				var nextRepl = this.replacements[this.index];
				var start = Math.floor(nextRepl.start);
				this.position = start;
			}
		}
		if(this.position < 0)
			this.position = 0;
		this.emit = !this.emit;
		return this.emit;
	}

	footer() {
		if(!this.done && !this.emit)
			this.next(); // If we finished _replaceInNode mid emit we advance to next entry
		if(this.done) {
			return [];
		} else {
			var resultStr = "";
			for(var i = this.index; i >= 0; i--) {
				var repl = this.replacements[i];
				// this doesn't need to handle repl.name, because in SourceMaps generated code
				// without pointer to original source can't have a name
				resultStr += repl.content;
			}
			return resultStr;
		}
	}
}

require("./SourceAndMapMixin")(ReplaceSource.prototype);

module.exports = ReplaceSource;

}, function(modId) { var map = {"./Source":1602510872112,"./SourceAndMapMixin":1602510872115}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872122, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


var Source = require("./Source");
var SourceNode = require("source-map").SourceNode;

var REPLACE_REGEX = /\n(?=.|\s)/g;

function cloneAndPrefix(node, prefix, append) {
	if(typeof node === "string") {
		var result = node.replace(REPLACE_REGEX, "\n" + prefix);
		if(append.length > 0) result = append.pop() + result;
		if(/\n$/.test(node)) append.push(prefix);
		return result;
	} else {
		var newNode = new SourceNode(
			node.line,
			node.column,
			node.source,
			node.children.map(function(node) {
				return cloneAndPrefix(node, prefix, append);
			}),
			node.name
		);
		newNode.sourceContents = node.sourceContents;
		return newNode;
	}
};

class PrefixSource extends Source {
	constructor(prefix, source) {
		super();
		this._source = source;
		this._prefix = prefix;
	}

	source() {
		var node = typeof this._source === "string" ? this._source : this._source.source();
		var prefix = this._prefix;
		return prefix + node.replace(REPLACE_REGEX, "\n" + prefix);
	}

	node(options) {
		var node = this._source.node(options);
		var prefix = this._prefix;
		var output = [];
		var result = new SourceNode();
		node.walkSourceContents(function(source, content) {
			result.setSourceContent(source, content);
		});
		var needPrefix = true;
		node.walk(function(chunk, mapping) {
			var parts = chunk.split(/(\n)/);
			for(var i = 0; i < parts.length; i += 2) {
				var nl = i + 1 < parts.length;
				var part = parts[i] + (nl ? "\n" : "");
				if(part) {
					if(needPrefix) {
						output.push(prefix);
					}
					output.push(new SourceNode(mapping.line, mapping.column, mapping.source, part, mapping.name));
					needPrefix = nl;
				}
			}
		});
		result.add(output);
		return result;
	}

	listMap(options) {
		var prefix = this._prefix;
		var map = this._source.listMap(options);
		return map.mapGeneratedCode(function(code) {
			return prefix + code.replace(REPLACE_REGEX, "\n" + prefix);
		});
	}

	updateHash(hash) {
		if(typeof this._source === "string")
			hash.update(this._source);
		else
			this._source.updateHash(hash);
		if(typeof this._prefix === "string")
			hash.update(this._prefix);
		else
			this._prefix.updateHash(hash);
	}
}

require("./SourceAndMapMixin")(PrefixSource.prototype);

module.exports = PrefixSource;

}, function(modId) { var map = {"./Source":1602510872112,"./SourceAndMapMixin":1602510872115}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510872111);
})()
//# sourceMappingURL=index.js.map