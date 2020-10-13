module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510871210, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var ResolverFactory = require("./ResolverFactory");

var NodeJsInputFileSystem = require("./NodeJsInputFileSystem");
var CachedInputFileSystem = require("./CachedInputFileSystem");

var nodeFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000);

var nodeContext = {
	environments: [
		"node+es3+es5+process+native"
	]
};

var asyncResolver = ResolverFactory.createResolver({
	extensions: [".js", ".json", ".node"],
	fileSystem: nodeFileSystem
});
module.exports = function resolve(context, path, request, callback) {
	if(typeof context === "string") {
		callback = request;
		request = path;
		path = context;
		context = nodeContext;
	}
	asyncResolver.resolve(context, path, request, callback);
};

var syncResolver = ResolverFactory.createResolver({
	extensions: [".js", ".json", ".node"],
	useSyncFileSystemCalls: true,
	fileSystem: nodeFileSystem
});
module.exports.sync = function resolveSync(context, path, request) {
	if(typeof context === "string") {
		request = path;
		path = context;
		context = nodeContext;
	}
	return syncResolver.resolveSync(context, path, request);
};

var asyncContextResolver = ResolverFactory.createResolver({
	extensions: [".js", ".json", ".node"],
	resolveToContext: true,
	fileSystem: nodeFileSystem
});
module.exports.context = function resolveContext(context, path, request, callback) {
	if(typeof context === "string") {
		callback = request;
		request = path;
		path = context;
		context = nodeContext;
	}
	asyncContextResolver.resolve(context, path, request, callback);
};

var syncContextResolver = ResolverFactory.createResolver({
	extensions: [".js", ".json", ".node"],
	resolveToContext: true,
	useSyncFileSystemCalls: true,
	fileSystem: nodeFileSystem
});
module.exports.context.sync = function resolveContextSync(context, path, request) {
	if(typeof context === "string") {
		request = path;
		path = context;
		context = nodeContext;
	}
	return syncContextResolver.resolveSync(context, path, request);
};

var asyncLoaderResolver = ResolverFactory.createResolver({
	extensions: [".js", ".json", ".node"],
	moduleExtensions: ["-loader"],
	mainFields: ["loader", "main"],
	fileSystem: nodeFileSystem
});
module.exports.loader = function resolveLoader(context, path, request, callback) {
	if(typeof context === "string") {
		callback = request;
		request = path;
		path = context;
		context = nodeContext;
	}
	asyncLoaderResolver.resolve(context, path, request, callback);
};

var syncLoaderResolver = ResolverFactory.createResolver({
	extensions: [".js", ".json", ".node"],
	moduleExtensions: ["-loader"],
	mainFields: ["loader", "main"],
	useSyncFileSystemCalls: true,
	fileSystem: nodeFileSystem
});
module.exports.loader.sync = function resolveLoaderSync(context, path, request) {
	if(typeof context === "string") {
		request = path;
		path = context;
		context = nodeContext;
	}
	return syncLoaderResolver.resolveSync(context, path, request);
};

module.exports.create = function create(options) {
	options = Object.assign({
		fileSystem: nodeFileSystem
	}, options);
	var resolver = ResolverFactory.createResolver(options);
	return function(context, path, request, callback) {
		if(typeof context === "string") {
			callback = request;
			request = path;
			path = context;
			context = nodeContext;
		}
		resolver.resolve(context, path, request, callback);
	};
};

module.exports.create.sync = function createSync(options) {
	options = Object.assign({
		useSyncFileSystemCalls: true,
		fileSystem: nodeFileSystem
	}, options);
	var resolver = ResolverFactory.createResolver(options);
	return function(context, path, request) {
		if(typeof context === "string") {
			request = path;
			path = context;
			context = nodeContext;
		}
		return resolver.resolveSync(context, path, request);
	};
};

// Export Resolver, FileSystems and Plugins
module.exports.ResolverFactory = ResolverFactory;

module.exports.NodeJsInputFileSystem = NodeJsInputFileSystem;
module.exports.CachedInputFileSystem = CachedInputFileSystem;

}, function(modId) {var map = {"./ResolverFactory":1602510871211,"./NodeJsInputFileSystem":1602510871244,"./CachedInputFileSystem":1602510871245}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871211, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var Resolver = require("./Resolver");

var SyncAsyncFileSystemDecorator = require("./SyncAsyncFileSystemDecorator");

var ParsePlugin = require("./ParsePlugin");
var DescriptionFilePlugin = require("./DescriptionFilePlugin");
var NextPlugin = require("./NextPlugin");
var TryNextPlugin = require("./TryNextPlugin");
var ModuleKindPlugin = require("./ModuleKindPlugin");
var FileKindPlugin = require("./FileKindPlugin");
var JoinRequestPlugin = require("./JoinRequestPlugin");
var ModulesInHierachicDirectoriesPlugin = require("./ModulesInHierachicDirectoriesPlugin");
var ModulesInRootPlugin = require("./ModulesInRootPlugin");
var AliasPlugin = require("./AliasPlugin");
var AliasFieldPlugin = require("./AliasFieldPlugin");
var ConcordExtensionsPlugin = require("./ConcordExtensionsPlugin");
var ConcordMainPlugin = require("./ConcordMainPlugin");
var ConcordModulesPlugin = require("./ConcordModulesPlugin");
var DirectoryExistsPlugin = require("./DirectoryExistsPlugin");
var FileExistsPlugin = require("./FileExistsPlugin");
var SymlinkPlugin = require("./SymlinkPlugin");
var MainFieldPlugin = require("./MainFieldPlugin");
var UseFilePlugin = require("./UseFilePlugin");
var AppendPlugin = require("./AppendPlugin");
var ResultPlugin = require("./ResultPlugin");
var ModuleAppendPlugin = require("./ModuleAppendPlugin");
var UnsafeCachePlugin = require("./UnsafeCachePlugin");

exports.createResolver = function(options) {

	//// OPTIONS ////

	// A list of directories to resolve modules from, can be absolute path or folder name
	var modules = options.modules || ["node_modules"];

	// A list of description files to read from
	var descriptionFiles = options.descriptionFiles || ["package.json"];

	// A list of additional resolve plugins which should be applied
	// The slice is there to create a copy, because otherwise pushing into plugins
	// changes the original options.plugins array, causing duplicate plugins
	var plugins = (options.plugins && options.plugins.slice()) || [];

	// A list of main fields in description files
	var mainFields = options.mainFields || ["main"];

	// A list of alias fields in description files
	var aliasFields = options.aliasFields || [];

	// A list of main files in directories
	var mainFiles = options.mainFiles || ["index"];

	// A list of extensions which should be tried for files
	var extensions = options.extensions || [".js", ".json", ".node"];

	// Enforce that a extension from extensions must be used
	var enforceExtension = options.enforceExtension || false;

	// A list of module extensions which should be tried for modules
	var moduleExtensions = options.moduleExtensions || [];

	// Enforce that a extension from moduleExtensions must be used
	var enforceModuleExtension = options.enforceModuleExtension || false;

	// A list of module alias configurations or an object which maps key to value
	var alias = options.alias || [];

	// Resolve symlinks to their symlinked location
	var symlinks = typeof options.symlinks !== "undefined" ? options.symlinks : true;

	// Resolve to a context instead of a file
	var resolveToContext = options.resolveToContext || false;

	// Use this cache object to unsafely cache the successful requests
	var unsafeCache = options.unsafeCache || false;

	// Whether or not the unsafeCache should include request context as part of the cache key.
	var cacheWithContext = typeof options.cacheWithContext !== "undefined" ? options.cacheWithContext : true;

	// A function which decides whether a request should be cached or not.
	// an object is passed with `path` and `request` properties.
	var cachePredicate = options.cachePredicate || function() {
		return true;
	};

	// The file system which should be used
	var fileSystem = options.fileSystem;

	// Use only the sync variants of the file system calls
	var useSyncFileSystemCalls = options.useSyncFileSystemCalls;

	// A prepared Resolver to which the plugins are attached
	var resolver = options.resolver;

	//// options processing ////

	if(!resolver) {
		resolver = new Resolver(useSyncFileSystemCalls ? new SyncAsyncFileSystemDecorator(fileSystem) : fileSystem);
	}

	extensions = [].concat(extensions);
	moduleExtensions = [].concat(moduleExtensions);

	modules = mergeFilteredToArray([].concat(modules), function(item) {
		return !isAbsolutePath(item);
	});

	mainFields = mainFields.map(function(item) {
		if(typeof item === "string") {
			item = {
				name: item,
				forceRelative: true
			};
		}
		return item;
	});

	if(typeof alias === "object" && !Array.isArray(alias)) {
		alias = Object.keys(alias).map(function(key) {
			var onlyModule = false;
			var obj = alias[key];
			if(/\$$/.test(key)) {
				onlyModule = true;
				key = key.substr(0, key.length - 1);
			}
			if(typeof obj === "string") {
				obj = {
					alias: obj
				};
			}
			obj = Object.assign({
				name: key,
				onlyModule: onlyModule
			}, obj);
			return obj;
		});
	}

	if(unsafeCache && typeof unsafeCache !== "object") {
		unsafeCache = {};
	}

	//// pipeline ////

	// resolve
	if(unsafeCache) {
		plugins.push(new UnsafeCachePlugin("resolve", cachePredicate, unsafeCache, cacheWithContext, "new-resolve"));
		plugins.push(new ParsePlugin("new-resolve", "parsed-resolve"));
	} else {
		plugins.push(new ParsePlugin("resolve", "parsed-resolve"));
	}

	// parsed-resolve
	plugins.push(new DescriptionFilePlugin("parsed-resolve", descriptionFiles, "described-resolve"));
	plugins.push(new NextPlugin("after-parsed-resolve", "described-resolve"));

	// described-resolve
	alias.forEach(function(item) {
		plugins.push(new AliasPlugin("described-resolve", item, "resolve"));
	});
	plugins.push(new ConcordModulesPlugin("described-resolve", {}, "resolve"));
	aliasFields.forEach(function(item) {
		plugins.push(new AliasFieldPlugin("described-resolve", item, "resolve"));
	});
	plugins.push(new ModuleKindPlugin("after-described-resolve", "raw-module"));
	plugins.push(new JoinRequestPlugin("after-described-resolve", "relative"));

	// raw-module
	moduleExtensions.forEach(function(item) {
		plugins.push(new ModuleAppendPlugin("raw-module", item, "module"));
	});
	if(!enforceModuleExtension)
		plugins.push(new TryNextPlugin("raw-module", null, "module"));

	// module
	modules.forEach(function(item) {
		if(Array.isArray(item))
			plugins.push(new ModulesInHierachicDirectoriesPlugin("module", item, "resolve"));
		else
			plugins.push(new ModulesInRootPlugin("module", item, "resolve"));
	});

	// relative
	plugins.push(new DescriptionFilePlugin("relative", descriptionFiles, "described-relative"));
	plugins.push(new NextPlugin("after-relative", "described-relative"));

	// described-relative
	plugins.push(new FileKindPlugin("described-relative", "raw-file"));
	plugins.push(new TryNextPlugin("described-relative", "as directory", "directory"));

	// directory
	plugins.push(new DirectoryExistsPlugin("directory", "existing-directory"));

	if(resolveToContext) {

		// existing-directory
		plugins.push(new NextPlugin("existing-directory", "resolved"));

	} else {

		// existing-directory
		plugins.push(new ConcordMainPlugin("existing-directory", {}, "resolve"));
		mainFields.forEach(function(item) {
			plugins.push(new MainFieldPlugin("existing-directory", item, "resolve"));
		});
		mainFiles.forEach(function(item) {
			plugins.push(new UseFilePlugin("existing-directory", item, "undescribed-raw-file"));
		});

		// undescribed-raw-file
		plugins.push(new DescriptionFilePlugin("undescribed-raw-file", descriptionFiles, "raw-file"));
		plugins.push(new NextPlugin("after-undescribed-raw-file", "raw-file"));

		// raw-file
		if(!enforceExtension)
			plugins.push(new TryNextPlugin("raw-file", "no extension", "file"));
		plugins.push(new ConcordExtensionsPlugin("raw-file", {}, "file"));
		extensions.forEach(function(item) {
			plugins.push(new AppendPlugin("raw-file", item, "file"));
		});

		// file
		alias.forEach(function(item) {
			plugins.push(new AliasPlugin("file", item, "resolve"));
		});
		plugins.push(new ConcordModulesPlugin("file", {}, "resolve"));
		aliasFields.forEach(function(item) {
			plugins.push(new AliasFieldPlugin("file", item, "resolve"));
		});
		if(symlinks)
			plugins.push(new SymlinkPlugin("file", "relative"));
		plugins.push(new FileExistsPlugin("file", "existing-file"));

		// existing-file
		plugins.push(new NextPlugin("existing-file", "resolved"));

	}

	// resolved
	plugins.push(new ResultPlugin("resolved"));

	//// RESOLVER ////

	plugins.forEach(function(plugin) {
		resolver.apply(plugin);
	});
	return resolver;
};

function mergeFilteredToArray(array, filter) {
	return array.reduce(function(array, item) {
		if(filter(item)) {
			var lastElement = array[array.length - 1];
			if(Array.isArray(lastElement)) {
				lastElement.push(item);
			} else {
				array.push([item]);
			}
			return array;
		} else {
			array.push(item);
			return array;
		}
	}, []);
}

function isAbsolutePath(path) {
	return /^[A-Z]:|^\//.test(path);
}

}, function(modId) { var map = {"./Resolver":1602510871212,"./SyncAsyncFileSystemDecorator":1602510871214,"./ParsePlugin":1602510871215,"./DescriptionFilePlugin":1602510871216,"./NextPlugin":1602510871219,"./TryNextPlugin":1602510871220,"./ModuleKindPlugin":1602510871221,"./FileKindPlugin":1602510871222,"./JoinRequestPlugin":1602510871223,"./ModulesInHierachicDirectoriesPlugin":1602510871224,"./ModulesInRootPlugin":1602510871226,"./AliasPlugin":1602510871227,"./AliasFieldPlugin":1602510871228,"./ConcordExtensionsPlugin":1602510871230,"./ConcordMainPlugin":1602510871233,"./ConcordModulesPlugin":1602510871234,"./DirectoryExistsPlugin":1602510871235,"./FileExistsPlugin":1602510871236,"./SymlinkPlugin":1602510871237,"./MainFieldPlugin":1602510871238,"./UseFilePlugin":1602510871239,"./AppendPlugin":1602510871240,"./ResultPlugin":1602510871241,"./ModuleAppendPlugin":1602510871242,"./UnsafeCachePlugin":1602510871243}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871212, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var Tapable = require("tapable");
var createInnerCallback = require("./createInnerCallback");

function Resolver(fileSystem) {
	Tapable.call(this);
	this.fileSystem = fileSystem;
}
module.exports = Resolver;

Resolver.prototype = Object.create(Tapable.prototype);

Resolver.prototype.constructor = Resolver;

Resolver.prototype.resolveSync = function resolveSync(context, path, request) {
	var err, result, sync = false;
	this.resolve(context, path, request, function(e, r) {
		err = e;
		result = r;
		sync = true;
	});
	if(!sync) throw new Error("Cannot 'resolveSync' because the fileSystem is not sync. Use 'resolve'!");
	if(err) throw err;
	return result;
};

Resolver.prototype.resolve = function resolve(context, path, request, callback) {
	if(arguments.length === 3) {
		throw new Error("Signature changed: context parameter added");
	}
	var resolver = this;
	var obj = {
		context: context,
		path: path,
		request: request
	};

	var localMissing;
	var log;
	var message = "resolve '" + request + "' in '" + path + "'";

	function writeLog(msg) {
		log.push(msg);
	}

	function logAsString() {
		return log.join("\n");
	}

	function onError(err, result) {
		if(callback.log) {
			for(var i = 0; i < log.length; i++)
				callback.log(log[i]);
		}

		if(err) return callback(err);

		var error = new Error("Can't " + message);
		error.details = logAsString();
		error.missing = localMissing;
		resolver.applyPlugins("no-resolve", obj, error);
		return callback(error);
	}

	function onResolve(err, result) {
		if(!err && result) {
			return callback(null, result.path === false ? false : result.path + (result.query || ""), result);
		}

		localMissing = [];
		log = [];

		return resolver.doResolve("resolve", obj, message, createInnerCallback(onError, {
			log: writeLog,
			missing: localMissing,
			stack: callback.stack
		}));
	}

	onResolve.missing = callback.missing;
	onResolve.stack = callback.stack;

	return this.doResolve("resolve", obj, message, onResolve);
};

Resolver.prototype.doResolve = function doResolve(type, request, message, callback) {
	var resolver = this;
	var stackLine = type + ": (" + request.path + ") " +
		(request.request || "") + (request.query || "") +
		(request.directory ? " directory" : "") +
		(request.module ? " module" : "");
	var newStack = [stackLine];
	if(callback.stack) {
		newStack = callback.stack.concat(newStack);
		if(callback.stack.indexOf(stackLine) >= 0) {
			// Prevent recursion
			var recursionError = new Error("Recursion in resolving\nStack:\n  " + newStack.join("\n  "));
			recursionError.recursion = true;
			if(callback.log) callback.log("abort resolving because of recursion");
			return callback(recursionError);
		}
	}
	resolver.applyPlugins("resolve-step", type, request);

	var beforePluginName = "before-" + type;
	if(resolver.hasPlugins(beforePluginName)) {
		resolver.applyPluginsAsyncSeriesBailResult1(beforePluginName, request, createInnerCallback(beforeInnerCallback, {
			log: callback.log,
			missing: callback.missing,
			stack: newStack
		}, message && ("before " + message), true));
	} else {
		runNormal();
	}

	function beforeInnerCallback(err, result) {
		if(arguments.length > 0) {
			if(err) return callback(err);
			if(result) return callback(null, result);
			return callback();
		}
		runNormal();
	}

	function runNormal() {
		if(resolver.hasPlugins(type)) {
			return resolver.applyPluginsAsyncSeriesBailResult1(type, request, createInnerCallback(innerCallback, {
				log: callback.log,
				missing: callback.missing,
				stack: newStack
			}, message));
		} else {
			runAfter();
		}
	}

	function innerCallback(err, result) {
		if(arguments.length > 0) {
			if(err) return callback(err);
			if(result) return callback(null, result);
			return callback();
		}
		runAfter();
	}

	function runAfter() {
		var afterPluginName = "after-" + type;
		if(resolver.hasPlugins(afterPluginName)) {
			return resolver.applyPluginsAsyncSeriesBailResult1(afterPluginName, request, createInnerCallback(afterInnerCallback, {
				log: callback.log,
				missing: callback.missing,
				stack: newStack
			}, message && ("after " + message), true));
		} else {
			callback();
		}
	}

	function afterInnerCallback(err, result) {
		if(arguments.length > 0) {
			if(err) return callback(err);
			if(result) return callback(null, result);
			return callback();
		}
		return callback();
	}
};

Resolver.prototype.parse = function parse(identifier) {
	if(identifier === "") return null;
	var part = {
		request: "",
		query: "",
		module: false,
		directory: false,
		file: false
	};
	var idxQuery = identifier.indexOf("?");
	if(idxQuery === 0) {
		part.query = identifier;
	} else if(idxQuery > 0) {
		part.request = identifier.slice(0, idxQuery);
		part.query = identifier.slice(idxQuery);
	} else {
		part.request = identifier;
	}
	if(part.request) {
		part.module = this.isModule(part.request);
		part.directory = this.isDirectory(part.request);
		if(part.directory) {
			part.request = part.request.substr(0, part.request.length - 1);
		}
	}
	return part;
};

var notModuleRegExp = /^\.$|^\.[\\\/]|^\.\.$|^\.\.[\/\\]|^\/|^[A-Z]:[\\\/]/i;
Resolver.prototype.isModule = function isModule(path) {
	return !notModuleRegExp.test(path);
};

var directoryRegExp = /[\/\\]$/i;
Resolver.prototype.isDirectory = function isDirectory(path) {
	return directoryRegExp.test(path);
};

var memoryFsJoin = require("memory-fs/lib/join");
var memoizedJoin = new Map();
Resolver.prototype.join = function(path, request) {
	var cacheEntry;
	var pathCache = memoizedJoin.get(path);
	if(typeof pathCache === "undefined") {
		memoizedJoin.set(path, pathCache = new Map());
	} else {
		cacheEntry = pathCache.get(request);
		if(typeof cacheEntry !== "undefined")
			return cacheEntry;
	}
	cacheEntry = memoryFsJoin(path, request);
	pathCache.set(request, cacheEntry);
	return cacheEntry;
};

Resolver.prototype.normalize = require("memory-fs/lib/normalize");

}, function(modId) { var map = {"./createInnerCallback":1602510871213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871213, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function createInnerCallback(callback, options, message, messageOptional) {
	var log = options.log;
	if(!log) {
		if(options.stack !== callback.stack) {
			var callbackWrapper = function callbackWrapper() {
				return callback.apply(this, arguments);
			};
			callbackWrapper.stack = options.stack;
			callbackWrapper.missing = options.missing;
			return callbackWrapper;
		}
		return callback;
	}

	function loggingCallbackWrapper() {
		var i;
		if(message) {
			if(!messageOptional || theLog.length > 0) {
				log(message);
				for(i = 0; i < theLog.length; i++)
					log("  " + theLog[i]);
			}
		} else {
			for(i = 0; i < theLog.length; i++)
				log(theLog[i]);
		}
		return callback.apply(this, arguments);

	}
	var theLog = [];
	loggingCallbackWrapper.log = function writeLog(msg) {
		theLog.push(msg);
	};
	loggingCallbackWrapper.stack = options.stack;
	loggingCallbackWrapper.missing = options.missing;
	return loggingCallbackWrapper;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871214, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function SyncAsyncFileSystemDecorator(fs) {
	this.fs = fs;
	if(fs.statSync) {
		this.stat = function(arg, callback) {
			try {
				var result = fs.statSync(arg);
			} catch(e) {
				return callback(e);
			}
			callback(null, result);
		};
	}
	if(fs.readdirSync) {
		this.readdir = function(arg, callback) {
			try {
				var result = fs.readdirSync(arg);
			} catch(e) {
				return callback(e);
			}
			callback(null, result);
		};
	}
	if(fs.readFileSync) {
		this.readFile = function(arg, callback) {
			try {
				var result = fs.readFileSync(arg);
			} catch(e) {
				return callback(e);
			}
			callback(null, result);
		};
	}
	if(fs.readlinkSync) {
		this.readlink = function(arg, callback) {
			try {
				var result = fs.readlinkSync(arg);
			} catch(e) {
				return callback(e);
			}
			callback(null, result);
		};
	}
	if(fs.readJsonSync) {
		this.readJson = function(arg, callback) {
			try {
				var result = fs.readJsonSync(arg);
			} catch(e) {
				return callback(e);
			}
			callback(null, result);
		};
	}
}
module.exports = SyncAsyncFileSystemDecorator;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871215, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function ParsePlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = ParsePlugin;

ParsePlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var parsed = resolver.parse(request.request);
		var obj = Object.assign({}, request, parsed);
		if(request.query && !parsed.query) {
			obj.query = request.query;
		}
		if(parsed && callback.log) {
			if(parsed.module)
				callback.log("Parsed request is a module");
			if(parsed.directory)
				callback.log("Parsed request is a directory");
		}
		resolver.doResolve(target, obj, null, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871216, function(require, module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
const createInnerCallback = require("./createInnerCallback");
const DescriptionFileUtils = require("./DescriptionFileUtils");

class DescriptionFilePlugin {
	constructor(source, filenames, target) {
		this.source = source;
		this.filenames = [].concat(filenames);
		this.target = target;
	}

	apply(resolver) {
		const filenames = this.filenames;
		const target = this.target;
		resolver.plugin(this.source, (request, callback) => {
			const directory = request.path;
			DescriptionFileUtils.loadDescriptionFile(resolver, directory, filenames, ((err, result) => {
				if(err) return callback(err);
				if(!result) {
					if(callback.missing) {
						filenames.forEach((filename) => {
							callback.missing.push(resolver.join(directory, filename));
						});
					}
					if(callback.log) callback.log("No description file found");
					return callback();
				}
				const relativePath = "." + request.path.substr(result.directory.length).replace(/\\/g, "/");
				const obj = Object.assign({}, request, {
					descriptionFilePath: result.path,
					descriptionFileData: result.content,
					descriptionFileRoot: result.directory,
					relativePath: relativePath
				});
				resolver.doResolve(target, obj, "using description file: " + result.path + " (relative path: " + relativePath + ")", createInnerCallback((err, result) => {
					if(err) return callback(err);
					if(result) return callback(null, result);

					// Don't allow other description files or none at all
					callback(null, null);
				}, callback));
			}));
		});
	}
}

module.exports = DescriptionFilePlugin;

}, function(modId) { var map = {"./createInnerCallback":1602510871213,"./DescriptionFileUtils":1602510871217}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871217, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var forEachBail = require("./forEachBail");

function loadDescriptionFile(resolver, directory, filenames, callback) {
	(function findDescriptionFile() {
		forEachBail(filenames, function(filename, callback) {
			var descriptionFilePath = resolver.join(directory, filename);
			if(resolver.fileSystem.readJson) {
				resolver.fileSystem.readJson(descriptionFilePath, function(err, content) {
					if(err) {
						if(typeof err.code !== "undefined") return callback();
						return onJson(err);
					}
					onJson(null, content);
				});
			} else {
				resolver.fileSystem.readFile(descriptionFilePath, function(err, content) {
					if(err) return callback();
					try {
						var json = JSON.parse(content);
					} catch(e) {
						onJson(e);
					}
					onJson(null, json);
				});
			}

			function onJson(err, content) {
				if(err) {
					if(callback.log)
						callback.log(descriptionFilePath + " (directory description file): " + err);
					else
						err.message = descriptionFilePath + " (directory description file): " + err;
					return callback(err);
				}
				callback(null, {
					content: content,
					directory: directory,
					path: descriptionFilePath
				});
			}
		}, function(err, result) {
			if(err) return callback(err);
			if(result) {
				return callback(null, result);
			} else {
				directory = cdUp(directory);
				if(!directory) {
					return callback();
				} else {
					return findDescriptionFile();
				}
			}
		});
	}());
}

function getField(content, field) {
	if(!content) return undefined;
	if(Array.isArray(field)) {
		var current = content;
		for(var j = 0; j < field.length; j++) {
			if(current === null || typeof current !== "object") {
				current = null;
				break;
			}
			current = current[field[j]];
		}
		if(typeof current === "object") {
			return current;
		}
	} else {
		if(typeof content[field] === "object") {
			return content[field];
		}
	}
}

function cdUp(directory) {
	if(directory === "/") return null;
	var i = directory.lastIndexOf("/"),
		j = directory.lastIndexOf("\\");
	var p = i < 0 ? j : j < 0 ? i : i < j ? j : i;
	if(p < 0) return null;
	return directory.substr(0, p || 1);
}

exports.loadDescriptionFile = loadDescriptionFile;
exports.getField = getField;
exports.cdUp = cdUp;

}, function(modId) { var map = {"./forEachBail":1602510871218}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871218, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function forEachBail(array, iterator, callback) {
	if(array.length === 0) return callback();
	var currentPos = array.length;
	var currentResult;
	var done = [];
	for(var i = 0; i < array.length; i++) {
		var itCb = createIteratorCallback(i);
		iterator(array[i], itCb);
		if(currentPos === 0) break;
	}

	function createIteratorCallback(i) {
		return function() {
			if(i >= currentPos) return; // ignore
			var args = Array.prototype.slice.call(arguments);
			done.push(i);
			if(args.length > 0) {
				currentPos = i + 1;
				done = done.filter(function(item) {
					return item <= i;
				});
				currentResult = args;
			}
			if(done.length === currentPos) {
				callback.apply(null, currentResult);
				currentPos = 0;
			}
		};
	}
};

module.exports.withIndex = function forEachBailWithIndex(array, iterator, callback) {
	if(array.length === 0) return callback();
	var currentPos = array.length;
	var currentResult;
	var done = [];
	for(var i = 0; i < array.length; i++) {
		var itCb = createIteratorCallback(i);
		iterator(array[i], i, itCb);
		if(currentPos === 0) break;
	}

	function createIteratorCallback(i) {
		return function() {
			if(i >= currentPos) return; // ignore
			var args = Array.prototype.slice.call(arguments);
			done.push(i);
			if(args.length > 0) {
				currentPos = i + 1;
				done = done.filter(function(item) {
					return item <= i;
				});
				currentResult = args;
			}
			if(done.length === currentPos) {
				callback.apply(null, currentResult);
				currentPos = 0;
			}
		};
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871219, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function NextPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = NextPlugin;

NextPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		resolver.doResolve(target, request, null, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871220, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function TryNextPlugin(source, message, target) {
	this.source = source;
	this.message = message;
	this.target = target;
}
module.exports = TryNextPlugin;

TryNextPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	var message = this.message;
	resolver.plugin(this.source, function(request, callback) {
		resolver.doResolve(target, request, message, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871221, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var createInnerCallback = require("./createInnerCallback");

function ModuleKindPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = ModuleKindPlugin;

ModuleKindPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		if(!request.module) return callback();
		var obj = Object.assign({}, request);
		delete obj.module;
		resolver.doResolve(target, obj, "resolve as module", createInnerCallback(function(err, result) {
			if(arguments.length > 0) return callback(err, result);

			// Don't allow other alternatives
			callback(null, null);
		}, callback));
	});
};

}, function(modId) { var map = {"./createInnerCallback":1602510871213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871222, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function FileKindPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = FileKindPlugin;

FileKindPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		if(request.directory) return callback();
		var obj = Object.assign({}, request);
		delete obj.directory;
		resolver.doResolve(target, obj, null, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871223, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function JoinRequestPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = JoinRequestPlugin;

JoinRequestPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var obj = Object.assign({}, request, {
			path: resolver.join(request.path, request.request),
			relativePath: request.relativePath && resolver.join(request.relativePath, request.request),
			request: undefined
		});
		resolver.doResolve(target, obj, null, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871224, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var createInnerCallback = require("./createInnerCallback");
var forEachBail = require("./forEachBail");
var getPaths = require("./getPaths");

function ModulesInHierachicDirectoriesPlugin(source, directories, target) {
	this.source = source;
	this.directories = [].concat(directories);
	this.target = target;
}
module.exports = ModulesInHierachicDirectoriesPlugin;

ModulesInHierachicDirectoriesPlugin.prototype.apply = function(resolver) {
	var directories = this.directories;
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var fs = this.fileSystem;
		var topLevelCallback = callback;
		var addrs = getPaths(request.path).paths.map(function(p) {
			return directories.map(function(d) {
				return this.join(p, d);
			}, this);
		}, this).reduce(function(array, p) {
			array.push.apply(array, p);
			return array;
		}, []);
		forEachBail(addrs, function(addr, callback) {
			fs.stat(addr, function(err, stat) {
				if(!err && stat && stat.isDirectory()) {
					var obj = Object.assign({}, request, {
						path: addr,
						request: "./" + request.request
					});
					var message = "looking for modules in " + addr;
					return resolver.doResolve(target, obj, message, createInnerCallback(callback, topLevelCallback));
				}
				if(topLevelCallback.log) topLevelCallback.log(addr + " doesn't exist or is not a directory");
				if(topLevelCallback.missing) topLevelCallback.missing.push(addr);
				return callback();
			});
		}, callback);
	});
};

}, function(modId) { var map = {"./createInnerCallback":1602510871213,"./forEachBail":1602510871218,"./getPaths":1602510871225}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871225, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function getPaths(path) {
	var parts = path.split(/(.*?[\\\/]+)/);
	var paths = [path];
	var seqments = [parts[parts.length - 1]];
	var part = parts[parts.length - 1];
	path = path.substr(0, path.length - part.length - 1);
	paths.push(path);
	for(var i = parts.length - 2; i > 2; i -= 2) {
		part = parts[i];
		path = path.substr(0, path.length - part.length) || "/";
		paths.push(path);
		seqments.push(part.substr(0, part.length - 1));
	}
	part = parts[1];
	seqments.push(part.length > 1 ? part.substr(0, part.length - 1) : part);
	return {
		paths: paths,
		seqments: seqments
	};
};

module.exports.basename = function basename(path) {
	var i = path.lastIndexOf("/"),
		j = path.lastIndexOf("\\");
	var p = i < 0 ? j : j < 0 ? i : i < j ? j : i;
	if(p < 0) return null;
	var s = path.substr(p + 1);
	return s;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871226, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function ModulesInRootPlugin(source, path, target) {
	this.source = source;
	this.path = path;
	this.target = target;
}
module.exports = ModulesInRootPlugin;

ModulesInRootPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	var path = this.path;
	resolver.plugin(this.source, function(request, callback) {
		var obj = Object.assign({}, request, {
			path: path,
			request: "./" + request.request
		});
		resolver.doResolve(target, obj, "looking for modules in " + path, callback, true);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871227, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var createInnerCallback = require("./createInnerCallback");

function startsWith(string, searchString) {
	var stringLength = string.length;
	var searchLength = searchString.length;

	// early out if the search length is greater than the search string
	if(searchLength > stringLength) {
		return false;
	}
	var index = -1;
	while(++index < searchLength) {
		if(string.charCodeAt(index) !== searchString.charCodeAt(index)) {
			return false;
		}
	}
	return true;
}

function AliasPlugin(source, options, target) {
	this.source = source;
	this.name = options.name;
	this.alias = options.alias;
	this.onlyModule = options.onlyModule;
	this.target = target;
}
module.exports = AliasPlugin;

AliasPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	var name = this.name;
	var alias = this.alias;
	var onlyModule = this.onlyModule;
	resolver.plugin(this.source, function(request, callback) {
		var innerRequest = request.request;
		if(!innerRequest) return callback();
		if(innerRequest === name || (!onlyModule && startsWith(innerRequest, name + "/"))) {
			if(innerRequest !== alias && !startsWith(innerRequest, alias + "/")) {
				var newRequestStr = alias + innerRequest.substr(name.length);
				var obj = Object.assign({}, request, {
					request: newRequestStr
				});
				return resolver.doResolve(target, obj, "aliased with mapping '" + name + "': '" + alias + "' to '" + newRequestStr + "'", createInnerCallback(function(err, result) {
					if(arguments.length > 0) return callback(err, result);

					// don't allow other aliasing or raw request
					callback(null, null);
				}, callback));
			}
		}
		return callback();
	});
};

}, function(modId) { var map = {"./createInnerCallback":1602510871213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871228, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var DescriptionFileUtils = require("./DescriptionFileUtils");
var createInnerCallback = require("./createInnerCallback");
var getInnerRequest = require("./getInnerRequest");

function AliasFieldPlugin(source, field, target) {
	this.source = source;
	this.field = field;
	this.target = target;
}
module.exports = AliasFieldPlugin;

AliasFieldPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	var field = this.field;
	resolver.plugin(this.source, function(request, callback) {
		if(!request.descriptionFileData) return callback();
		var innerRequest = getInnerRequest(resolver, request);
		if(!innerRequest) return callback();
		var fieldData = DescriptionFileUtils.getField(request.descriptionFileData, field);
		if(typeof fieldData !== "object") {
			if(callback.log) callback.log("Field '" + field + "' doesn't contain a valid alias configuration");
			return callback();
		}
		var data1 = fieldData[innerRequest];
		var data2 = fieldData[innerRequest.replace(/^\.\//, "")];
		var data = typeof data1 !== "undefined" ? data1 : data2;
		if(data === innerRequest) return callback();
		if(data === undefined) return callback();
		if(data === false) {
			var ignoreObj = Object.assign({}, request, {
				path: false
			});
			return callback(null, ignoreObj);
		}
		var obj = Object.assign({}, request, {
			path: request.descriptionFileRoot,
			request: data
		});
		resolver.doResolve(target, obj, "aliased from description file " + request.descriptionFilePath + " with mapping '" + innerRequest + "' to '" + data + "'", createInnerCallback(function(err, result) {
			if(arguments.length > 0) return callback(err, result);

			// Don't allow other aliasing or raw request
			callback(null, null);
		}, callback));
	});
};

}, function(modId) { var map = {"./DescriptionFileUtils":1602510871217,"./createInnerCallback":1602510871213,"./getInnerRequest":1602510871229}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871229, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function getInnerRequest(resolver, request) {
	if(typeof request.__innerRequest === "string" &&
		request.__innerRequest_request === request.request &&
		request.__innerRequest_relativePath === request.relativePath)
		return request.__innerRequest;
	var innerRequest;
	if(request.request) {
		innerRequest = request.request;
		if(/^\.\.?\//.test(innerRequest) && request.relativePath) {
			innerRequest = resolver.join(request.relativePath, innerRequest);
		}
	} else {
		innerRequest = request.relativePath;
	}
	request.__innerRequest_request = request.request;
	request.__innerRequest_relativePath = request.relativePath;
	return request.__innerRequest = innerRequest;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871230, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var concord = require("./concord");
var DescriptionFileUtils = require("./DescriptionFileUtils");
var forEachBail = require("./forEachBail");
var createInnerCallback = require("./createInnerCallback");

function ConcordExtensionsPlugin(source, options, target) {
	this.source = source;
	this.options = options;
	this.target = target;
}
module.exports = ConcordExtensionsPlugin;

ConcordExtensionsPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var concordField = DescriptionFileUtils.getField(request.descriptionFileData, "concord");
		if(!concordField) return callback();
		var extensions = concord.getExtensions(request.context, concordField);
		if(!extensions) return callback();
		var topLevelCallback = callback;
		forEachBail(extensions, function(appending, callback) {
			var obj = Object.assign({}, request, {
				path: request.path + appending,
				relativePath: request.relativePath && (request.relativePath + appending)
			});
			resolver.doResolve(target, obj, "concord extension: " + appending, createInnerCallback(callback, topLevelCallback));
		}, function(err, result) {
			if(arguments.length > 0) return callback(err, result);

			callback(null, null);
		});
	});
};

}, function(modId) { var map = {"./concord":1602510871231,"./DescriptionFileUtils":1602510871217,"./forEachBail":1602510871218,"./createInnerCallback":1602510871213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871231, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var globToRegExp = require("./globToRegExp").globToRegExp;

function parseType(type) {
	var items = type.split("+");
	var t = items.shift();
	return {
		type: t === "*" ? null : t,
		features: items
	};
}

function isTypeMatched(baseType, testedType) {
	if(typeof baseType === "string") baseType = parseType(baseType);
	if(typeof testedType === "string") testedType = parseType(testedType);
	if(testedType.type && testedType.type !== baseType.type) return false;
	return testedType.features.every(function(requiredFeature) {
		return baseType.features.indexOf(requiredFeature) >= 0;
	});
}

function isResourceTypeMatched(baseType, testedType) {
	baseType = baseType.split("/");
	testedType = testedType.split("/");
	if(baseType.length !== testedType.length) return false;
	for(var i = 0; i < baseType.length; i++) {
		if(!isTypeMatched(baseType[i], testedType[i]))
			return false;
	}
	return true;
}

function isResourceTypeSupported(context, type) {
	return context.supportedResourceTypes && context.supportedResourceTypes.some(function(supportedType) {
		return isResourceTypeMatched(supportedType, type);
	});
}

function isEnvironment(context, env) {
	return context.environments && context.environments.every(function(environment) {
		return isTypeMatched(environment, env);
	});
}

var globCache = {};

function getGlobRegExp(glob) {
	var regExp = globCache[glob] || (globCache[glob] = globToRegExp(glob));
	return regExp;
}

function matchGlob(glob, relativePath) {
	var regExp = getGlobRegExp(glob);
	return regExp.exec(relativePath);
}

function isGlobMatched(glob, relativePath) {
	return !!matchGlob(glob, relativePath);
}

function isConditionMatched(context, condition) {
	var items = condition.split("|");
	return items.some(function testFn(item) {
		item = item.trim();
		var inverted = /^!/.test(item);
		if(inverted) return !testFn(item.substr(1));
		if(/^[a-z]+:/.test(item)) {
			// match named condition
			var match = /^([a-z]+):\s*/.exec(item);
			var value = item.substr(match[0].length);
			var name = match[1];
			switch(name) {
				case "referrer":
					return isGlobMatched(value, context.referrer);
				default:
					return false;
			}
		} else if(item.indexOf("/") >= 0) {
			// match supported type
			return isResourceTypeSupported(context, item);
		} else {
			// match environment
			return isEnvironment(context, item);
		}
	});
}

function isKeyMatched(context, key) {
	while(true) { //eslint-disable-line
		var match = /^\[([^\]]+)\]\s*/.exec(key);
		if(!match) return key;
		key = key.substr(match[0].length);
		var condition = match[1];
		if(!isConditionMatched(context, condition)) {
			return false;
		}
	}
}

function getField(context, configuration, field) {
	var value;
	Object.keys(configuration).forEach(function(key) {
		var pureKey = isKeyMatched(context, key);
		if(pureKey === field) {
			value = configuration[key];
		}
	});
	return value;
}

function getMain(context, configuration) {
	return getField(context, configuration, "main");
}

function getExtensions(context, configuration) {
	return getField(context, configuration, "extensions");
}

function matchModule(context, configuration, request) {
	var modulesField = getField(context, configuration, "modules");
	if(!modulesField) return request;
	var newRequest = request;
	var keys = Object.keys(modulesField);
	var iteration = 0;
	for(var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var pureKey = isKeyMatched(context, key);
		var match = matchGlob(pureKey, newRequest);
		if(match) {
			var value = modulesField[key];
			if(typeof value !== "string") {
				return value;
			} else if(/^\(.+\)$/.test(pureKey)) {
				newRequest = newRequest.replace(getGlobRegExp(pureKey), value);
			} else {
				var index = 1;
				newRequest = value.replace(/(\/?\*)?\*/g, replaceMatcher);
			}
			i = -1;
			if(iteration++ > keys.length) {
				throw new Error("Request '" + request + "' matches recursively");
			}
		}
	}
	return newRequest;

	function replaceMatcher(find) {
		switch(find) {
			case "/**":
				var m = match[index++];
				return m ? "/" + m : "";
			case "**":
			case "*":
				return match[index++];
		}
	}
}

function matchType(context, configuration, relativePath) {
	var typesField = getField(context, configuration, "types");
	if(!typesField) return undefined;
	var type;
	Object.keys(typesField).forEach(function(key) {
		var pureKey = isKeyMatched(context, key);
		if(isGlobMatched(pureKey, relativePath)) {
			var value = typesField[key];
			if(!type && /\/\*$/.test(value))
				throw new Error("value ('" + value + "') of key '" + key + "' contains '*', but there is no previous value defined");
			type = value.replace(/\/\*$/, "/" + type);
		}
	});
	return type;
}

exports.parseType = parseType;
exports.isTypeMatched = isTypeMatched;
exports.isResourceTypeSupported = isResourceTypeSupported;
exports.isEnvironment = isEnvironment;
exports.isGlobMatched = isGlobMatched;
exports.isConditionMatched = isConditionMatched;
exports.isKeyMatched = isKeyMatched;
exports.getField = getField;
exports.getMain = getMain;
exports.getExtensions = getExtensions;
exports.matchModule = matchModule;
exports.matchType = matchType;

}, function(modId) { var map = {"./globToRegExp":1602510871232}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871232, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function globToRegExp(glob) {
	// * [^\\\/]*
	// /**/ /.+/
	// ^* \./.+ (concord special)
	// ? [^\\\/]
	// [!...] [^...]
	// [^...] [^...]
	// / [\\\/]
	// {...,...} (...|...)
	// ?(...|...) (...|...)?
	// +(...|...) (...|...)+
	// *(...|...) (...|...)*
	// @(...|...) (...|...)
	if(/^\(.+\)$/.test(glob)) {
		// allow to pass an RegExp in brackets
		return new RegExp(glob.substr(1, glob.length - 2));
	}
	var tokens = tokenize(glob);
	var process = createRoot();
	var regExpStr = tokens.map(process).join("");
	return new RegExp("^" + regExpStr + "$");
}

var SIMPLE_TOKENS = {
	"@(": "one",
	"?(": "zero-one",
	"+(": "one-many",
	"*(": "zero-many",
	"|": "segment-sep",
	"/**/": "any-path-segments",
	"**": "any-path",
	"*": "any-path-segment",
	"?": "any-char",
	"{": "or",
	"/": "path-sep",
	",": "comma",
	")": "closing-segment",
	"}": "closing-or"
};

function tokenize(glob) {
	return glob.split(/([@?+*]\(|\/\*\*\/|\*\*|[?*]|\[[\!\^]?(?:[^\]\\]|\\.)+\]|\{|,|\/|[|)}])/g).map(function(item) {
		if(!item)
			return null;
		var t = SIMPLE_TOKENS[item];
		if(t) {
			return {
				type: t
			};
		}
		if(item[0] === "[") {
			if(item[1] === "^" || item[1] === "!") {
				return {
					type: "inverted-char-set",
					value: item.substr(2, item.length - 3)
				};
			} else {
				return {
					type: "char-set",
					value: item.substr(1, item.length - 2)
				};
			}
		}
		return {
			type: "string",
			value: item
		};
	}).filter(Boolean).concat({
		type: "end"
	});
}

function createRoot() {
	var inOr = [];
	var process = createSeqment();
	var initial = true;
	return function(token) {
		switch(token.type) {
			case "or":
				inOr.push(initial);
				return "(";
			case "comma":
				if(inOr.length) {
					initial = inOr[inOr.length - 1];
					return "|";
				} else {
					return process({
						type: "string",
						value: ","
					}, initial);
				}
			case "closing-or":
				if(inOr.length === 0)
					throw new Error("Unmatched '}'");
				inOr.pop();
				return ")";
			case "end":
				if(inOr.length)
					throw new Error("Unmatched '{'");
				return process(token, initial);
			default:
				var result = process(token, initial);
				initial = false;
				return result;
		}
	};
}

function createSeqment() {
	var inSeqment = [];
	var process = createSimple();
	return function(token, initial) {
		switch(token.type) {
			case "one":
			case "one-many":
			case "zero-many":
			case "zero-one":
				inSeqment.push(token.type);
				return "(";
			case "segment-sep":
				if(inSeqment.length) {
					return "|";
				} else {
					return process({
						type: "string",
						value: "|"
					}, initial);
				}
			case "closing-segment":
				var segment = inSeqment.pop();
				switch(segment) {
					case "one":
						return ")";
					case "one-many":
						return ")+";
					case "zero-many":
						return ")*";
					case "zero-one":
						return ")?";
				}
				throw new Error("Unexcepted segment " + segment);
			case "end":
				if(inSeqment.length > 0) {
					throw new Error("Unmatched segment, missing ')'");
				}
				return process(token, initial);
			default:
				return process(token, initial);
		}
	};
}

function createSimple() {
	return function(token, initial) {
		switch(token.type) {
			case "path-sep":
				return "[\\\\/]+";
			case "any-path-segments":
				return "[\\\\/]+(?:(.+)[\\\\/]+)?";
			case "any-path":
				return "(.*)";
			case "any-path-segment":
				if(initial) {
					return "\\.[\\\\/]+(?:.*[\\\\/]+)?([^\\\\/]+)";
				} else {
					return "([^\\\\/]*)";
				}
			case "any-char":
				return "[^\\\\/]";
			case "inverted-char-set":
				return "[^" + token.value + "]";
			case "char-set":
				return "[" + token.value + "]";
			case "string":
				return token.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			case "end":
				return "";
			default:
				throw new Error("Unsupported token '" + token.type + "'");
		}
	};
}

exports.globToRegExp = globToRegExp;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871233, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
var concord = require("./concord");
var DescriptionFileUtils = require("./DescriptionFileUtils");

function ConcordMainPlugin(source, options, target) {
	this.source = source;
	this.options = options;
	this.target = target;
}
module.exports = ConcordMainPlugin;

ConcordMainPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		if(request.path !== request.descriptionFileRoot) return callback();
		var concordField = DescriptionFileUtils.getField(request.descriptionFileData, "concord");
		if(!concordField) return callback();
		var mainModule = concord.getMain(request.context, concordField);
		if(!mainModule) return callback();
		var obj = Object.assign({}, request, {
			request: mainModule
		});
		var filename = path.basename(request.descriptionFilePath);
		return resolver.doResolve(target, obj, "use " + mainModule + " from " + filename, callback);
	});
};

}, function(modId) { var map = {"./concord":1602510871231,"./DescriptionFileUtils":1602510871217}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871234, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var concord = require("./concord");
var DescriptionFileUtils = require("./DescriptionFileUtils");
var createInnerCallback = require("./createInnerCallback");
var getInnerRequest = require("./getInnerRequest");

function ConcordModulesPlugin(source, options, target) {
	this.source = source;
	this.options = options;
	this.target = target;
}
module.exports = ConcordModulesPlugin;

ConcordModulesPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var innerRequest = getInnerRequest(resolver, request);
		if(!innerRequest) return callback();
		var concordField = DescriptionFileUtils.getField(request.descriptionFileData, "concord");
		if(!concordField) return callback();
		var data = concord.matchModule(request.context, concordField, innerRequest);
		if(data === innerRequest) return callback();
		if(data === undefined) return callback();
		if(data === false) {
			var ignoreObj = Object.assign({}, request, {
				path: false
			});
			return callback(null, ignoreObj);
		}
		var obj = Object.assign({}, request, {
			path: request.descriptionFileRoot,
			request: data
		});
		resolver.doResolve(target, obj, "aliased from description file " + request.descriptionFilePath + " with mapping '" + innerRequest + "' to '" + data + "'", createInnerCallback(function(err, result) {
			if(arguments.length > 0) return callback(err, result);

			// Don't allow other aliasing or raw request
			callback(null, null);
		}, callback));
	});
};

}, function(modId) { var map = {"./concord":1602510871231,"./DescriptionFileUtils":1602510871217,"./createInnerCallback":1602510871213,"./getInnerRequest":1602510871229}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871235, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function DirectoryExistsPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = DirectoryExistsPlugin;

DirectoryExistsPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var fs = this.fileSystem;
		var directory = request.path;
		fs.stat(directory, function(err, stat) {
			if(err || !stat) {
				if(callback.missing) callback.missing.push(directory);
				if(callback.log) callback.log(directory + " doesn't exist");
				return callback();
			}
			if(!stat.isDirectory()) {
				if(callback.missing) callback.missing.push(directory);
				if(callback.log) callback.log(directory + " is not a directory");
				return callback();
			}
			this.doResolve(target, request, "existing directory", callback);
		}.bind(this));
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871236, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function FileExistsPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = FileExistsPlugin;

FileExistsPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var fs = this.fileSystem;
		var file = request.path;
		fs.stat(file, function(err, stat) {
			if(err || !stat) {
				if(callback.missing) callback.missing.push(file);
				if(callback.log) callback.log(file + " doesn't exist");
				return callback();
			}
			if(!stat.isFile()) {
				if(callback.missing) callback.missing.push(file);
				if(callback.log) callback.log(file + " is not a file");
				return callback();
			}
			this.doResolve(target, request, "existing file: " + file, callback, true);
		}.bind(this));
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871237, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var getPaths = require("./getPaths");
var forEachBail = require("./forEachBail");

function SymlinkPlugin(source, target) {
	this.source = source;
	this.target = target;
}
module.exports = SymlinkPlugin;

SymlinkPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var _this = this;
		var fs = _this.fileSystem;
		var pathsResult = getPaths(request.path);
		var pathSeqments = pathsResult.seqments;
		var paths = pathsResult.paths;

		var containsSymlink = false;
		forEachBail.withIndex(paths, function(path, idx, callback) {
			fs.readlink(path, function(err, result) {
				if(!err && result) {
					pathSeqments[idx] = result;
					containsSymlink = true;
					// Shortcut when absolute symlink found
					if(/^(\/|[a-zA-z]:($|\\))/.test(result))
						return callback(null, idx);
				}
				callback();
			});
		}, function(err, idx) {
			if(!containsSymlink) return callback();
			var resultSeqments = typeof idx === "number" ? pathSeqments.slice(0, idx + 1) : pathSeqments.slice();
			var result = resultSeqments.reverse().reduce(function(a, b) {
				return _this.join(a, b);
			});
			var obj = Object.assign({}, request, {
				path: result
			});
			resolver.doResolve(target, obj, "resolved symlink to " + result, callback);
		});
	});
};

}, function(modId) { var map = {"./getPaths":1602510871225,"./forEachBail":1602510871218}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871238, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");

function MainFieldPlugin(source, options, target) {
	this.source = source;
	this.options = options;
	this.target = target;
}
module.exports = MainFieldPlugin;

MainFieldPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	var options = this.options;
	resolver.plugin(this.source, function mainField(request, callback) {
		if(request.path !== request.descriptionFileRoot) return callback();
		var content = request.descriptionFileData;
		var filename = path.basename(request.descriptionFilePath);
		var mainModule;
		var field = options.name;
		if(Array.isArray(field)) {
			var current = content;
			for(var j = 0; j < field.length; j++) {
				if(current === null || typeof current !== "object") {
					current = null;
					break;
				}
				current = current[field[j]];
			}
			if(typeof current === "string") {
				mainModule = current;
			}
		} else {
			if(typeof content[field] === "string") {
				mainModule = content[field];
			}
		}
		if(!mainModule) return callback();
		if(options.forceRelative && !/^\.\.?\//.test(mainModule))
			mainModule = "./" + mainModule;
		var obj = Object.assign({}, request, {
			request: mainModule
		});
		return resolver.doResolve(target, obj, "use " + mainModule + " from " + options.name + " in " + filename, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871239, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function UseFilePlugin(source, filename, target) {
	this.source = source;
	this.filename = filename;
	this.target = target;
}
module.exports = UseFilePlugin;

UseFilePlugin.prototype.apply = function(resolver) {
	var filename = this.filename;
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var filePath = resolver.join(request.path, filename);
		var obj = Object.assign({}, request, {
			path: filePath,
			relativePath: request.relativePath && resolver.join(request.relativePath, filename)
		});
		resolver.doResolve(target, obj, "using path: " + filePath, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871240, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function AppendPlugin(source, appending, target) {
	this.source = source;
	this.appending = appending;
	this.target = target;
}
module.exports = AppendPlugin;

AppendPlugin.prototype.apply = function(resolver) {
	var target = this.target;
	var appending = this.appending;
	resolver.plugin(this.source, function(request, callback) {
		var obj = Object.assign({}, request, {
			path: request.path + appending,
			relativePath: request.relativePath && (request.relativePath + appending)
		});
		resolver.doResolve(target, obj, appending, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871241, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function ResultPlugin(source) {
	this.source = source;
}
module.exports = ResultPlugin;

ResultPlugin.prototype.apply = function(resolver) {
	resolver.plugin(this.source, function(request, callback) {
		var obj = Object.assign({}, request);
		resolver.applyPluginsAsyncSeries1("result", obj, function(err) {
			if(err) return callback(err);
			callback(null, obj);
		});
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871242, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function ModuleAppendPlugin(source, appending, target) {
	this.source = source;
	this.appending = appending;
	this.target = target;
}
module.exports = ModuleAppendPlugin;

ModuleAppendPlugin.prototype.apply = function(resolver) {
	var appending = this.appending;
	var target = this.target;
	resolver.plugin(this.source, function(request, callback) {
		var i = request.request.indexOf("/"),
			j = request.request.indexOf("\\");
		var p = i < 0 ? j : j < 0 ? i : i < j ? i : j;
		var moduleName, remainingRequest;
		if(p < 0) {
			moduleName = request.request;
			remainingRequest = "";
		} else {
			moduleName = request.request.substr(0, p);
			remainingRequest = request.request.substr(p);
		}
		if(moduleName === "." || moduleName === "..")
			return callback();
		var moduleFinalName = moduleName + appending;
		var obj = Object.assign({}, request, {
			request: moduleFinalName + remainingRequest
		});
		resolver.doResolve(target, obj, "module variation " + moduleFinalName, callback);
	});
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871243, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var createInnerCallback = require("./createInnerCallback");

function UnsafeCachePlugin(source, filterPredicate, cache, withContext, target) {
	this.source = source;
	this.filterPredicate = filterPredicate;
	this.withContext = withContext;
	this.cache = cache || {};
	this.target = target;
}
module.exports = UnsafeCachePlugin;

function getCacheId(request, withContext) {
	return JSON.stringify({
		context: withContext ? request.context : "",
		path: request.path,
		query: request.query,
		request: request.request
	});
}

UnsafeCachePlugin.prototype.apply = function(resolver) {
	var filterPredicate = this.filterPredicate;
	var cache = this.cache;
	var target = this.target;
	var withContext = this.withContext;
	resolver.plugin(this.source, function(request, callback) {
		if(!filterPredicate(request)) return callback();
		var cacheId = getCacheId(request, withContext);
		var cacheEntry = cache[cacheId];
		if(cacheEntry) {
			return callback(null, cacheEntry);
		}
		resolver.doResolve(target, request, null, createInnerCallback(function(err, result) {
			if(err) return callback(err);
			if(result) return callback(null, cache[cacheId] = result);
			callback();
		}, callback));
	});
};

}, function(modId) { var map = {"./createInnerCallback":1602510871213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871244, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var fs = require("graceful-fs");

function NodeJsInputFileSystem() {}
module.exports = NodeJsInputFileSystem;

NodeJsInputFileSystem.prototype.stat = fs.stat.bind(fs);
NodeJsInputFileSystem.prototype.readdir = function readdir(path, callback) {
	fs.readdir(path, function(err, files) {
		callback(err, files && files.map(function(file) {
			return file.normalize ? file.normalize("NFC") : file;
		}));
	});
};
NodeJsInputFileSystem.prototype.readFile = fs.readFile.bind(fs);
NodeJsInputFileSystem.prototype.readlink = fs.readlink.bind(fs);

NodeJsInputFileSystem.prototype.statSync = fs.statSync.bind(fs);
NodeJsInputFileSystem.prototype.readdirSync = function readdirSync(path) {
	var files = fs.readdirSync(path);
	return files && files.map(function(file) {
		return file.normalize ? file.normalize("NFC") : file;
	});
};
NodeJsInputFileSystem.prototype.readFileSync = fs.readFileSync.bind(fs);
NodeJsInputFileSystem.prototype.readlinkSync = fs.readlinkSync.bind(fs);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871245, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function Storage(duration) {
	this.duration = duration;
	this.running = new Map();
	this.data = new Map();
	this.levels = [];
	if(duration > 0) {
		this.levels.push(new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set());
		for(var i = 8000; i < duration; i += 500)
			this.levels.push(new Set());
	}
	this.count = 0;
	this.interval = null;
	this.needTickCheck = false;
	this.nextTick = null;
	this.passive = true;
	this.tick = this.tick.bind(this);
}

Storage.prototype.ensureTick = function() {
	if(!this.interval && this.duration > 0 && !this.nextTick)
		this.interval = setInterval(this.tick, Math.floor(this.duration / this.levels.length));
};

Storage.prototype.finished = function(name, err, result) {
	var callbacks = this.running.get(name);
	this.running.delete(name);
	if(this.duration > 0) {
		this.data.set(name, [err, result]);
		var levelData = this.levels[0];
		this.count -= levelData.size;
		levelData.add(name);
		this.count += levelData.size;
		this.ensureTick();
	}
	for(var i = 0; i < callbacks.length; i++) {
		callbacks[i](err, result);
	}
};

Storage.prototype.finishedSync = function(name, err, result) {
	if(this.duration > 0) {
		this.data.set(name, [err, result]);
		var levelData = this.levels[0];
		this.count -= levelData.size;
		levelData.add(name);
		this.count += levelData.size;
		this.ensureTick();
	}
};

Storage.prototype.provide = function(name, provider, callback) {
	if(typeof name !== "string") {
		callback(new TypeError("path must be a string"));
		return;
	}
	var running = this.running.get(name);
	if(running) {
		running.push(callback);
		return;
	}
	if(this.duration > 0) {
		this.checkTicks();
		var data = this.data.get(name);
		if(data) {
			return process.nextTick(function() {
				callback.apply(null, data);
			});
		}
	}
	this.running.set(name, running = [callback]);
	var _this = this;
	provider(name, function(err, result) {
		_this.finished(name, err, result);
	});
};

Storage.prototype.provideSync = function(name, provider) {
	if(typeof name !== "string") {
		throw new TypeError("path must be a string");
	}
	if(this.duration > 0) {
		this.checkTicks();
		var data = this.data.get(name);
		if(data) {
			if(data[0])
				throw data[0];
			return data[1];
		}
	}
	try {
		var result = provider(name);
	} catch(e) {
		this.finishedSync(name, e);
		throw e;
	}
	this.finishedSync(name, null, result);
	return result;
};

Storage.prototype.tick = function() {
	var decay = this.levels.pop();
	for(var item of decay) {
		this.data.delete(item);
	}
	this.count -= decay.size;
	decay.clear();
	this.levels.unshift(decay);
	if(this.count === 0) {
		clearInterval(this.interval);
		this.interval = null;
		this.nextTick = null;
		return true;
	} else if(this.nextTick) {
		this.nextTick += Math.floor(this.duration / this.levels.length);
		var time = new Date().getTime();
		if(this.nextTick > time) {
			this.nextTick = null;
			this.interval = setInterval(this.tick, Math.floor(this.duration / this.levels.length));
			return true;
		}
	} else if(this.passive) {
		clearInterval(this.interval);
		this.interval = null;
		this.nextTick = new Date().getTime() + Math.floor(this.duration / this.levels.length);
	} else {
		this.passive = true;
	}
};

Storage.prototype.checkTicks = function() {
	this.passive = false;
	if(this.nextTick) {
		while(!this.tick());
	}
};

Storage.prototype.purge = function(what) {
	if(!what) {
		this.count = 0;
		clearInterval(this.interval);
		this.nextTick = null;
		this.data.clear();
		this.levels.forEach(function(level) {
			level.clear();
		});
	} else if(typeof what === "string") {
		for(var key of this.data.keys()) {
			if(key.startsWith(what))
				this.data.delete(key);
		}
	} else {
		for(var i = what.length - 1; i >= 0; i--) {
			this.purge(what[i]);
		}
	}
};

function CachedInputFileSystem(fileSystem, duration) {
	this.fileSystem = fileSystem;
	this._statStorage = new Storage(duration);
	this._readdirStorage = new Storage(duration);
	this._readFileStorage = new Storage(duration);
	this._readJsonStorage = new Storage(duration);
	this._readlinkStorage = new Storage(duration);

	this._stat = this.fileSystem.stat ? this.fileSystem.stat.bind(this.fileSystem) : null;
	if(!this._stat) this.stat = null;

	this._statSync = this.fileSystem.statSync ? this.fileSystem.statSync.bind(this.fileSystem) : null;
	if(!this._statSync) this.statSync = null;

	this._readdir = this.fileSystem.readdir ? this.fileSystem.readdir.bind(this.fileSystem) : null;
	if(!this._readdir) this.readdir = null;

	this._readdirSync = this.fileSystem.readdirSync ? this.fileSystem.readdirSync.bind(this.fileSystem) : null;
	if(!this._readdirSync) this.readdirSync = null;

	this._readFile = this.fileSystem.readFile ? this.fileSystem.readFile.bind(this.fileSystem) : null;
	if(!this._readFile) this.readFile = null;

	this._readFileSync = this.fileSystem.readFileSync ? this.fileSystem.readFileSync.bind(this.fileSystem) : null;
	if(!this._readFileSync) this.readFileSync = null;

	if(this.fileSystem.readJson) {
		this._readJson = this.fileSystem.readJson.bind(this.fileSystem);
	} else if(this.readFile) {
		this._readJson = function(path, callback) {
			this.readFile(path, function(err, buffer) {
				if(err) return callback(err);
				try {
					var data = JSON.parse(buffer.toString("utf-8"));
				} catch(e) {
					return callback(e);
				}
				callback(null, data);
			});
		}.bind(this);
	} else {
		this.readJson = null;
	}
	if(this.fileSystem.readJsonSync) {
		this._readJsonSync = this.fileSystem.readJsonSync.bind(this.fileSystem);
	} else if(this.readFileSync) {
		this._readJsonSync = function(path) {
			var buffer = this.readFileSync(path);
			var data = JSON.parse(buffer.toString("utf-8"));
			return data;
		}.bind(this);
	} else {
		this.readJsonSync = null;
	}

	this._readlink = this.fileSystem.readlink ? this.fileSystem.readlink.bind(this.fileSystem) : null;
	if(!this._readlink) this.readlink = null;

	this._readlinkSync = this.fileSystem.readlinkSync ? this.fileSystem.readlinkSync.bind(this.fileSystem) : null;
	if(!this._readlinkSync) this.readlinkSync = null;
}
module.exports = CachedInputFileSystem;

CachedInputFileSystem.prototype.stat = function(path, callback) {
	this._statStorage.provide(path, this._stat, callback);
};

CachedInputFileSystem.prototype.readdir = function(path, callback) {
	this._readdirStorage.provide(path, this._readdir, callback);
};

CachedInputFileSystem.prototype.readFile = function(path, callback) {
	this._readFileStorage.provide(path, this._readFile, callback);
};

CachedInputFileSystem.prototype.readJson = function(path, callback) {
	this._readJsonStorage.provide(path, this._readJson, callback);
};

CachedInputFileSystem.prototype.readlink = function(path, callback) {
	this._readlinkStorage.provide(path, this._readlink, callback);
};

CachedInputFileSystem.prototype.statSync = function(path) {
	return this._statStorage.provideSync(path, this._statSync);
};

CachedInputFileSystem.prototype.readdirSync = function(path) {
	return this._readdirStorage.provideSync(path, this._readdirSync);
};

CachedInputFileSystem.prototype.readFileSync = function(path) {
	return this._readFileStorage.provideSync(path, this._readFileSync);
};

CachedInputFileSystem.prototype.readJsonSync = function(path) {
	return this._readJsonStorage.provideSync(path, this._readJsonSync);
};

CachedInputFileSystem.prototype.readlinkSync = function(path) {
	return this._readlinkStorage.provideSync(path, this._readlinkSync);
};

CachedInputFileSystem.prototype.purge = function(what) {
	this._statStorage.purge(what);
	this._readdirStorage.purge(what);
	this._readFileStorage.purge(what);
	this._readlinkStorage.purge(what);
	this._readJsonStorage.purge(what);
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510871210);
})()
//# sourceMappingURL=index.js.map