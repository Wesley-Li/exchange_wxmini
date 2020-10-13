module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510871792, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var normalize = require("./normalize");
var errors = require("errno");
var stream = require("readable-stream");

var ReadableStream = stream.Readable;
var WritableStream = stream.Writable;

function MemoryFileSystemError(err, path) {
	Error.call(this)
	if (Error.captureStackTrace)
		Error.captureStackTrace(this, arguments.callee)
	this.code = err.code;
	this.errno = err.errno;
	this.message = err.description;
	this.path = path;
}
MemoryFileSystemError.prototype = new Error();

function MemoryFileSystem(data) {
	this.data = data || {};
}
module.exports = MemoryFileSystem;

function isDir(item) {
	if(typeof item !== "object") return false;
	return item[""] === true;
}

function isFile(item) {
	if(typeof item !== "object") return false;
	return !item[""];
}

function pathToArray(path) {
	path = normalize(path);
	var nix = /^\//.test(path);
	if(!nix) {
		if(!/^[A-Za-z]:/.test(path)) {
			throw new MemoryFileSystemError(errors.code.EINVAL, path);
		}
		path = path.replace(/[\\\/]+/g, "\\"); // multi slashs
		path = path.split(/[\\\/]/);
		path[0] = path[0].toUpperCase();
	} else {
		path = path.replace(/\/+/g, "/"); // multi slashs
		path = path.substr(1).split("/");
	}
	if(!path[path.length-1]) path.pop();
	return path;
}

function trueFn() { return true; }
function falseFn() { return false; }

MemoryFileSystem.prototype.meta = function(_path) {
	var path = pathToArray(_path);
	var current = this.data;
	for(var i = 0; i < path.length - 1; i++) {
		if(!isDir(current[path[i]]))
			return;
		current = current[path[i]];
	}
	return current[path[i]];
}

MemoryFileSystem.prototype.existsSync = function(_path) {
	return !!this.meta(_path);
}

MemoryFileSystem.prototype.statSync = function(_path) {
	var current = this.meta(_path);
	if(_path === "/" || isDir(current)) {
		return {
			isFile: falseFn,
			isDirectory: trueFn,
			isBlockDevice: falseFn,
			isCharacterDevice: falseFn,
			isSymbolicLink: falseFn,
			isFIFO: falseFn,
			isSocket: falseFn
		};
	} else if(isFile(current)) {
		return {
			isFile: trueFn,
			isDirectory: falseFn,
			isBlockDevice: falseFn,
			isCharacterDevice: falseFn,
			isSymbolicLink: falseFn,
			isFIFO: falseFn,
			isSocket: falseFn
		};
	} else {
		throw new MemoryFileSystemError(errors.code.ENOENT, _path);
	}
};

MemoryFileSystem.prototype.readFileSync = function(_path, encoding) {
	var path = pathToArray(_path);
	var current = this.data;
	for(var i = 0; i < path.length - 1; i++) {
		if(!isDir(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
		current = current[path[i]];
	}
	if(!isFile(current[path[i]])) {
		if(isDir(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.EISDIR, _path);
		else
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
	}
	current = current[path[i]];
	return encoding ? current.toString(encoding) : current;
};

MemoryFileSystem.prototype.readdirSync = function(_path) {
	if(_path === "/") return Object.keys(this.data).filter(Boolean);
	var path = pathToArray(_path);
	var current = this.data;
	for(var i = 0; i < path.length - 1; i++) {
		if(!isDir(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
		current = current[path[i]];
	}
	if(!isDir(current[path[i]])) {
		if(isFile(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOTDIR, _path);
		else
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
	}
	return Object.keys(current[path[i]]).filter(Boolean);
};

MemoryFileSystem.prototype.mkdirpSync = function(_path) {
	var path = pathToArray(_path);
	if(path.length === 0) return;
	var current = this.data;
	for(var i = 0; i < path.length; i++) {
		if(isFile(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOTDIR, _path);
		else if(!isDir(current[path[i]]))
			current[path[i]] = {"":true};
		current = current[path[i]];
	}
	return;
};

MemoryFileSystem.prototype.mkdirSync = function(_path) {
	var path = pathToArray(_path);
	if(path.length === 0) return;
	var current = this.data;
	for(var i = 0; i < path.length - 1; i++) {
		if(!isDir(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
		current = current[path[i]];
	}
	if(isDir(current[path[i]]))
		throw new MemoryFileSystemError(errors.code.EEXIST, _path);
	else if(isFile(current[path[i]]))
		throw new MemoryFileSystemError(errors.code.ENOTDIR, _path);
	current[path[i]] = {"":true};
	return;
};

MemoryFileSystem.prototype._remove = function(_path, name, testFn) {
	var path = pathToArray(_path);
	if(path.length === 0) {
		throw new MemoryFileSystemError(errors.code.EPERM, _path);
	}
	var current = this.data;
	for(var i = 0; i < path.length - 1; i++) {
		if(!isDir(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
		current = current[path[i]];
	}
	if(!testFn(current[path[i]]))
		throw new MemoryFileSystemError(errors.code.ENOENT, _path);
	delete current[path[i]];
	return;
};

MemoryFileSystem.prototype.rmdirSync = function(_path) {
	return this._remove(_path, "Directory", isDir);
};

MemoryFileSystem.prototype.unlinkSync = function(_path) {
	return this._remove(_path, "File", isFile);
};

MemoryFileSystem.prototype.readlinkSync = function(_path) {
	throw new MemoryFileSystemError(errors.code.ENOSYS, _path);
};

MemoryFileSystem.prototype.writeFileSync = function(_path, content, encoding) {
	if(!content && !encoding) throw new Error("No content");
	var path = pathToArray(_path);
	if(path.length === 0) {
		throw new MemoryFileSystemError(errors.code.EISDIR, _path);
	}
	var current = this.data;
	for(var i = 0; i < path.length - 1; i++) {
		if(!isDir(current[path[i]]))
			throw new MemoryFileSystemError(errors.code.ENOENT, _path);
		current = current[path[i]];
	}
	if(isDir(current[path[i]]))
		throw new MemoryFileSystemError(errors.code.EISDIR, _path);
	current[path[i]] = encoding || typeof content === "string" ? new Buffer(content, encoding) : content;
	return;
};

MemoryFileSystem.prototype.join = require("./join");
MemoryFileSystem.prototype.pathToArray = pathToArray;
MemoryFileSystem.prototype.normalize = normalize;

// stream functions

MemoryFileSystem.prototype.createReadStream = function(path, options) {
	var stream = new ReadableStream();
	var done = false;
	var data;
	try {
		data = this.readFileSync(path);
	} catch (e) {
		stream._read = function() {
			if (done) {
				return;
			}
			done = true;
			this.emit('error', e);
			this.push(null);
		};
		return stream;
	}
	options = options || { };
	options.start = options.start || 0;
	options.end = options.end || data.length;
	stream._read = function() {
		if (done) {
			return;
		}
		done = true;
		this.push(data.slice(options.start, options.end));
		this.push(null);
	};
	return stream;
};

MemoryFileSystem.prototype.createWriteStream = function(path, options) {
	var stream = new WritableStream(), self = this;
	try {
		// Zero the file and make sure it is writable
		this.writeFileSync(path, new Buffer(0));
	} catch(e) {
		// This or setImmediate?
		stream.once('prefinish', function() {
			stream.emit('error', e);
		});
		return stream;
	}
	var bl = [ ], len = 0;
	stream._write = function(chunk, encoding, callback) {
		bl.push(chunk);
		len += chunk.length;
		self.writeFile(path, Buffer.concat(bl, len), callback);
	}
	return stream;
};

// async functions

["stat", "readdir", "mkdirp", "rmdir", "unlink", "readlink"].forEach(function(fn) {
	MemoryFileSystem.prototype[fn] = function(path, callback) {
		try {
			var result = this[fn + "Sync"](path);
		} catch(e) {
			setImmediate(function() {
				callback(e);
			});

			return;
		}
		setImmediate(function() {
			callback(null, result);
		});
	};
});

["mkdir", "readFile"].forEach(function(fn) {
	MemoryFileSystem.prototype[fn] = function(path, optArg, callback) {
		if(!callback) {
			callback = optArg;
			optArg = undefined;
		}
		try {
			var result = this[fn + "Sync"](path, optArg);
		} catch(e) {
			setImmediate(function() {
				callback(e);
			});

			return;
		}
		setImmediate(function() {
			callback(null, result);
		});
	};
});

MemoryFileSystem.prototype.exists = function(path, callback) {
	return callback(this.existsSync(path));
}

MemoryFileSystem.prototype.writeFile = function (path, content, encoding, callback) {
	if(!callback) {
		callback = encoding;
		encoding = undefined;
	}
	try {
		this.writeFileSync(path, content, encoding);
	} catch(e) {
		return callback(e);
	}
	return callback();
};

}, function(modId) {var map = {"./normalize":1602510871793,"./join":1602510871794}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871793, function(require, module, exports) {
module.exports = function normalize(path) {
	var parts = path.split(/(\\+|\/+)/);
	if(parts.length === 1)
		return path;
	var result = [];
	var absolutePathStart = 0;
	for(var i = 0, sep = false; i < parts.length; i++, sep = !sep) {
		var part = parts[i];
		if(i === 0 && /^([A-Z]:)?$/i.test(part)) {
			result.push(part);
			absolutePathStart = 2;
		} else if(sep) {
			result.push(part[0]);
		} else if(part === "..") {
			switch(result.length) {
				case 0:
					// i. e. ".." => ".."
					// i. e. "../a/b/c" => "../a/b/c"
					result.push(part);
					break;
				case 2:
					// i. e. "a/.." => ""
					// i. e. "/.." => "/"
					// i. e. "C:\.." => "C:\"
					// i. e. "a/../b/c" => "b/c"
					// i. e. "/../b/c" => "/b/c"
					// i. e. "C:\..\a\b\c" => "C:\a\b\c"
					i++;
					sep = !sep;
					result.length = absolutePathStart;
					break;
				case 4:
					// i. e. "a/b/.." => "a"
					// i. e. "/a/.." => "/"
					// i. e. "C:\a\.." => "C:\"
					// i. e. "/a/../b/c" => "/b/c"
					if(absolutePathStart === 0) {
						result.length -= 3;
					} else {
						i++;
						sep = !sep;
						result.length = 2;
					}
					break;
				default:
					// i. e. "/a/b/.." => "/a"
					// i. e. "/a/b/../c" => "/a/c"
					result.length -= 3;
					break;
			}
		} else if(part === ".") {
			switch(result.length) {
				case 0:
					// i. e. "." => "."
					// i. e. "./a/b/c" => "./a/b/c"
					result.push(part);
					break;
				case 2:
					// i. e. "a/." => "a"
					// i. e. "/." => "/"
					// i. e. "C:\." => "C:\"
					// i. e. "C:\.\a\b\c" => "C:\a\b\c"
					if(absolutePathStart === 0) {
						result.length--;
					} else {
						i++;
						sep = !sep;
					}
					break;
				default:
					// i. e. "a/b/." => "a/b"
					// i. e. "/a/." => "/"
					// i. e. "C:\a\." => "C:\"
					// i. e. "a/./b/c" => "a/b/c"
					// i. e. "/a/./b/c" => "/a/b/c"
					result.length--;
					break;
			}
		} else if(part) {
			result.push(part);
		}
	}
	if(result.length === 1 && /^[A-Za-z]:$/.test(result))
		return result[0] + "\\";
	return result.join("");
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871794, function(require, module, exports) {
var normalize = require("./normalize");

var absoluteWinRegExp = /^[A-Z]:([\\\/]|$)/i;
var absoluteNixRegExp = /^\//i;

module.exports = function join(path, request) {
	if(!request) return normalize(path);
	if(absoluteWinRegExp.test(request)) return normalize(request.replace(/\//g, "\\"));
	if(absoluteNixRegExp.test(request)) return normalize(request);
	if(path == "/") return normalize(path + request);
	if(absoluteWinRegExp.test(path)) return normalize(path.replace(/\//g, "\\") + "\\" + request.replace(/\//g, "\\"));
	if(absoluteNixRegExp.test(path)) return normalize(path + "/" + request);
	return normalize(path + "/" + request);
};

}, function(modId) { var map = {"./normalize":1602510871793}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510871792);
})()
//# sourceMappingURL=index.js.map