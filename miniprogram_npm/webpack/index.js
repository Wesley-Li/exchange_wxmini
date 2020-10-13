module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510872123, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Compiler = require("./Compiler");
const MultiCompiler = require("./MultiCompiler");
const NodeEnvironmentPlugin = require("./node/NodeEnvironmentPlugin");
const WebpackOptionsApply = require("./WebpackOptionsApply");
const WebpackOptionsDefaulter = require("./WebpackOptionsDefaulter");
const validateSchema = require("./validateSchema");
const WebpackOptionsValidationError = require("./WebpackOptionsValidationError");
const webpackOptionsSchema = require("../schemas/webpackOptionsSchema.json");

function webpack(options, callback) {
	const webpackOptionsValidationErrors = validateSchema(webpackOptionsSchema, options);
	if(webpackOptionsValidationErrors.length) {
		throw new WebpackOptionsValidationError(webpackOptionsValidationErrors);
	}
	let compiler;
	if(Array.isArray(options)) {
		compiler = new MultiCompiler(options.map(options => webpack(options)));
	} else if(typeof options === "object") {
		// TODO webpack 4: process returns options
		new WebpackOptionsDefaulter().process(options);

		compiler = new Compiler();
		compiler.context = options.context;
		compiler.options = options;
		new NodeEnvironmentPlugin().apply(compiler);
		if(options.plugins && Array.isArray(options.plugins)) {
			compiler.apply.apply(compiler, options.plugins);
		}
		compiler.applyPlugins("environment");
		compiler.applyPlugins("after-environment");
		compiler.options = new WebpackOptionsApply().process(options, compiler);
	} else {
		throw new Error("Invalid argument: options");
	}
	if(callback) {
		if(typeof callback !== "function") throw new Error("Invalid argument: callback");
		if(options.watch === true || (Array.isArray(options) && options.some(o => o.watch))) {
			const watchOptions = Array.isArray(options) ? options.map(o => o.watchOptions || {}) : (options.watchOptions || {});
			return compiler.watch(watchOptions, callback);
		}
		compiler.run(callback);
	}
	return compiler;
}
exports = module.exports = webpack;

webpack.WebpackOptionsDefaulter = WebpackOptionsDefaulter;
webpack.WebpackOptionsApply = WebpackOptionsApply;
webpack.Compiler = Compiler;
webpack.MultiCompiler = MultiCompiler;
webpack.NodeEnvironmentPlugin = NodeEnvironmentPlugin;
webpack.validate = validateSchema.bind(this, webpackOptionsSchema);
webpack.validateSchema = validateSchema;
webpack.WebpackOptionsValidationError = WebpackOptionsValidationError;

function exportPlugins(obj, mappings) {
	Object.keys(mappings).forEach(name => {
		Object.defineProperty(obj, name, {
			configurable: false,
			enumerable: true,
			get: mappings[name]
		});
	});
}

exportPlugins(exports, {
	"DefinePlugin": () => require("./DefinePlugin"),
	"NormalModuleReplacementPlugin": () => require("./NormalModuleReplacementPlugin"),
	"ContextReplacementPlugin": () => require("./ContextReplacementPlugin"),
	"ContextExclusionPlugin": () => require("./ContextExclusionPlugin"),
	"IgnorePlugin": () => require("./IgnorePlugin"),
	"WatchIgnorePlugin": () => require("./WatchIgnorePlugin"),
	"BannerPlugin": () => require("./BannerPlugin"),
	"PrefetchPlugin": () => require("./PrefetchPlugin"),
	"AutomaticPrefetchPlugin": () => require("./AutomaticPrefetchPlugin"),
	"ProvidePlugin": () => require("./ProvidePlugin"),
	"HotModuleReplacementPlugin": () => require("./HotModuleReplacementPlugin"),
	"SourceMapDevToolPlugin": () => require("./SourceMapDevToolPlugin"),
	"EvalSourceMapDevToolPlugin": () => require("./EvalSourceMapDevToolPlugin"),
	"EvalDevToolModulePlugin": () => require("./EvalDevToolModulePlugin"),
	"CachePlugin": () => require("./CachePlugin"),
	"ExtendedAPIPlugin": () => require("./ExtendedAPIPlugin"),
	"ExternalsPlugin": () => require("./ExternalsPlugin"),
	"JsonpTemplatePlugin": () => require("./JsonpTemplatePlugin"),
	"LibraryTemplatePlugin": () => require("./LibraryTemplatePlugin"),
	"LoaderTargetPlugin": () => require("./LoaderTargetPlugin"),
	"MemoryOutputFileSystem": () => require("./MemoryOutputFileSystem"),
	"ProgressPlugin": () => require("./ProgressPlugin"),
	"SetVarMainTemplatePlugin": () => require("./SetVarMainTemplatePlugin"),
	"UmdMainTemplatePlugin": () => require("./UmdMainTemplatePlugin"),
	"NoErrorsPlugin": () => require("./NoErrorsPlugin"),
	"NoEmitOnErrorsPlugin": () => require("./NoEmitOnErrorsPlugin"),
	"NewWatchingPlugin": () => require("./NewWatchingPlugin"),
	"EnvironmentPlugin": () => require("./EnvironmentPlugin"),
	"DllPlugin": () => require("./DllPlugin"),
	"DllReferencePlugin": () => require("./DllReferencePlugin"),
	"LoaderOptionsPlugin": () => require("./LoaderOptionsPlugin"),
	"NamedModulesPlugin": () => require("./NamedModulesPlugin"),
	"NamedChunksPlugin": () => require("./NamedChunksPlugin"),
	"HashedModuleIdsPlugin": () => require("./HashedModuleIdsPlugin"),
	"ModuleFilenameHelpers": () => require("./ModuleFilenameHelpers")
});
exportPlugins(exports.optimize = {}, {
	"AggressiveMergingPlugin": () => require("./optimize/AggressiveMergingPlugin"),
	"AggressiveSplittingPlugin": () => require("./optimize/AggressiveSplittingPlugin"),
	"CommonsChunkPlugin": () => require("./optimize/CommonsChunkPlugin"),
	"ChunkModuleIdRangePlugin": () => require("./optimize/ChunkModuleIdRangePlugin"),
	"DedupePlugin": () => require("./optimize/DedupePlugin"),
	"LimitChunkCountPlugin": () => require("./optimize/LimitChunkCountPlugin"),
	"MinChunkSizePlugin": () => require("./optimize/MinChunkSizePlugin"),
	"ModuleConcatenationPlugin": () => require("./optimize/ModuleConcatenationPlugin"),
	"OccurrenceOrderPlugin": () => require("./optimize/OccurrenceOrderPlugin"),
	"UglifyJsPlugin": () => require("./optimize/UglifyJsPlugin")
});

}, function(modId) {var map = {"./Compiler":1602510872124,"./MultiCompiler":1602510872173,"./node/NodeEnvironmentPlugin":1602510872176,"./WebpackOptionsApply":1602510872179,"./WebpackOptionsDefaulter":1602510872324,"./validateSchema":1602510872326,"./WebpackOptionsValidationError":1602510872328,"../schemas/webpackOptionsSchema.json":1602510872329,"./DefinePlugin":1602510872330,"./NormalModuleReplacementPlugin":1602510872331,"./ContextReplacementPlugin":1602510872332,"./ContextExclusionPlugin":1602510872333,"./IgnorePlugin":1602510872334,"./WatchIgnorePlugin":1602510872335,"./BannerPlugin":1602510872336,"./PrefetchPlugin":1602510872337,"./AutomaticPrefetchPlugin":1602510872339,"./ProvidePlugin":1602510872340,"./HotModuleReplacementPlugin":1602510872341,"./SourceMapDevToolPlugin":1602510872187,"./EvalSourceMapDevToolPlugin":1602510872189,"./EvalDevToolModulePlugin":1602510872184,"./CachePlugin":1602510872323,"./ExtendedAPIPlugin":1602510872345,"./ExternalsPlugin":1602510872314,"./JsonpTemplatePlugin":1602510872296,"./LibraryTemplatePlugin":1602510872317,"./LoaderTargetPlugin":1602510872181,"./MemoryOutputFileSystem":1602510872346,"./ProgressPlugin":1602510872347,"./SetVarMainTemplatePlugin":1602510872318,"./UmdMainTemplatePlugin":1602510872321,"./NoErrorsPlugin":1602510872348,"./NoEmitOnErrorsPlugin":1602510872349,"./NewWatchingPlugin":1602510872350,"./EnvironmentPlugin":1602510872351,"./DllPlugin":1602510872352,"./DllReferencePlugin":1602510872359,"./LoaderOptionsPlugin":1602510872364,"./NamedModulesPlugin":1602510872365,"./NamedChunksPlugin":1602510872366,"./HashedModuleIdsPlugin":1602510872367,"./ModuleFilenameHelpers":1602510872186,"./optimize/AggressiveMergingPlugin":1602510872368,"./optimize/AggressiveSplittingPlugin":1602510872369,"./optimize/CommonsChunkPlugin":1602510872370,"./optimize/ChunkModuleIdRangePlugin":1602510872371,"./optimize/DedupePlugin":1602510872372,"./optimize/LimitChunkCountPlugin":1602510872373,"./optimize/MinChunkSizePlugin":1602510872374,"./optimize/ModuleConcatenationPlugin":1602510872375,"./optimize/OccurrenceOrderPlugin":1602510872289,"./optimize/UglifyJsPlugin":1602510872377}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872124, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const Tapable = require("tapable");
const util = require("util");

const Compilation = require("./Compilation");
const Stats = require("./Stats");
const NormalModuleFactory = require("./NormalModuleFactory");
const ContextModuleFactory = require("./ContextModuleFactory");

const makePathsRelative = require("./util/identifier").makePathsRelative;

class Watching {
	constructor(compiler, watchOptions, handler) {
		this.startTime = null;
		this.invalid = false;
		this.handler = handler;
		this.callbacks = [];
		this.closed = false;
		if(typeof watchOptions === "number") {
			this.watchOptions = {
				aggregateTimeout: watchOptions
			};
		} else if(watchOptions && typeof watchOptions === "object") {
			this.watchOptions = Object.assign({}, watchOptions);
		} else {
			this.watchOptions = {};
		}
		this.watchOptions.aggregateTimeout = this.watchOptions.aggregateTimeout || 200;
		this.compiler = compiler;
		this.running = true;
		this.compiler.readRecords(err => {
			if(err) return this._done(err);

			this._go();
		});
	}

	_go() {
		this.startTime = Date.now();
		this.running = true;
		this.invalid = false;
		this.compiler.applyPluginsAsync("watch-run", this, err => {
			if(err) return this._done(err);
			const onCompiled = (err, compilation) => {
				if(err) return this._done(err);
				if(this.invalid) return this._done();

				if(this.compiler.applyPluginsBailResult("should-emit", compilation) === false) {
					return this._done(null, compilation);
				}

				this.compiler.emitAssets(compilation, err => {
					if(err) return this._done(err);
					if(this.invalid) return this._done();

					this.compiler.emitRecords(err => {
						if(err) return this._done(err);

						if(compilation.applyPluginsBailResult("need-additional-pass")) {
							compilation.needAdditionalPass = true;

							const stats = new Stats(compilation);
							stats.startTime = this.startTime;
							stats.endTime = Date.now();
							this.compiler.applyPlugins("done", stats);

							this.compiler.applyPluginsAsync("additional-pass", err => {
								if(err) return this._done(err);
								this.compiler.compile(onCompiled);
							});
							return;
						}
						return this._done(null, compilation);
					});
				});
			};
			this.compiler.compile(onCompiled);
		});
	}

	_getStats(compilation) {
		const stats = new Stats(compilation);
		stats.startTime = this.startTime;
		stats.endTime = Date.now();
		return stats;
	}

	_done(err, compilation) {
		this.running = false;
		if(this.invalid) return this._go();

		const stats = compilation ? this._getStats(compilation) : null;
		if(err) {
			this.compiler.applyPlugins("failed", err);
			this.handler(err, stats);
			return;
		}

		this.compiler.applyPlugins("done", stats);
		this.handler(null, stats);
		if(!this.closed) {
			this.watch(compilation.fileDependencies, compilation.contextDependencies, compilation.missingDependencies);
		}
		this.callbacks.forEach(cb => cb());
		this.callbacks.length = 0;
	}

	watch(files, dirs, missing) {
		this.pausedWatcher = null;
		this.watcher = this.compiler.watchFileSystem.watch(files, dirs, missing, this.startTime, this.watchOptions, (err, filesModified, contextModified, missingModified, fileTimestamps, contextTimestamps) => {
			this.pausedWatcher = this.watcher;
			this.watcher = null;
			if(err) return this.handler(err);

			this.compiler.fileTimestamps = fileTimestamps;
			this.compiler.contextTimestamps = contextTimestamps;
			this.invalidate();
		}, (fileName, changeTime) => {
			this.compiler.applyPlugins("invalid", fileName, changeTime);
		});
	}

	invalidate(callback) {
		if(callback) {
			this.callbacks.push(callback);
		}
		if(this.watcher) {
			this.pausedWatcher = this.watcher;
			this.watcher.pause();
			this.watcher = null;
		}
		if(this.running) {
			this.invalid = true;
			return false;
		} else {
			this._go();
		}
	}

	close(callback) {
		if(callback === undefined) callback = function() {};

		this.closed = true;
		if(this.watcher) {
			this.watcher.close();
			this.watcher = null;
		}
		if(this.pausedWatcher) {
			this.pausedWatcher.close();
			this.pausedWatcher = null;
		}
		if(this.running) {
			this.invalid = true;
			this._done = () => {
				this.compiler.applyPlugins("watch-close");
				callback();
			};
		} else {
			this.compiler.applyPlugins("watch-close");
			callback();
		}
	}
}

class Compiler extends Tapable {
	constructor() {
		super();
		this.outputPath = "";
		this.outputFileSystem = null;
		this.inputFileSystem = null;

		this.recordsInputPath = null;
		this.recordsOutputPath = null;
		this.records = {};

		this.fileTimestamps = {};
		this.contextTimestamps = {};

		this.resolvers = {
			normal: null,
			loader: null,
			context: null
		};
		this.parser = {
			plugin: util.deprecate(
				(hook, fn) => {
					this.plugin("compilation", (compilation, data) => {
						data.normalModuleFactory.plugin("parser", parser => {
							parser.plugin(hook, fn);
						});
					});
				},
				"webpack: Using compiler.parser is deprecated.\n" +
				"Use compiler.plugin(\"compilation\", function(compilation, data) {\n  data.normalModuleFactory.plugin(\"parser\", function(parser, options) { parser.plugin(/* ... */); });\n}); instead. "
			),
			apply: util.deprecate(
				() => {
					const args = arguments;
					this.plugin("compilation", (compilation, data) => {
						data.normalModuleFactory.plugin("parser", parser => {
							parser.apply.apply(parser, args);
						});
					});
				},
				"webpack: Using compiler.parser is deprecated.\n" +
				"Use compiler.plugin(\"compilation\", function(compilation, data) {\n  data.normalModuleFactory.plugin(\"parser\", function(parser, options) { parser.apply(/* ... */); });\n}); instead. "
			)
		};

		this.options = {};
	}

	watch(watchOptions, handler) {
		this.fileTimestamps = {};
		this.contextTimestamps = {};
		const watching = new Watching(this, watchOptions, handler);
		return watching;
	}

	run(callback) {
		const startTime = Date.now();

		const onCompiled = (err, compilation) => {
			if(err) return callback(err);

			if(this.applyPluginsBailResult("should-emit", compilation) === false) {
				const stats = new Stats(compilation);
				stats.startTime = startTime;
				stats.endTime = Date.now();
				this.applyPlugins("done", stats);
				return callback(null, stats);
			}

			this.emitAssets(compilation, err => {
				if(err) return callback(err);

				if(compilation.applyPluginsBailResult("need-additional-pass")) {
					compilation.needAdditionalPass = true;

					const stats = new Stats(compilation);
					stats.startTime = startTime;
					stats.endTime = Date.now();
					this.applyPlugins("done", stats);

					this.applyPluginsAsync("additional-pass", err => {
						if(err) return callback(err);
						this.compile(onCompiled);
					});
					return;
				}

				this.emitRecords(err => {
					if(err) return callback(err);

					const stats = new Stats(compilation);
					stats.startTime = startTime;
					stats.endTime = Date.now();
					this.applyPlugins("done", stats);
					return callback(null, stats);
				});
			});
		};

		this.applyPluginsAsync("before-run", this, err => {
			if(err) return callback(err);

			this.applyPluginsAsync("run", this, err => {
				if(err) return callback(err);

				this.readRecords(err => {
					if(err) return callback(err);

					this.compile(onCompiled);
				});
			});
		});
	}

	runAsChild(callback) {
		this.compile((err, compilation) => {
			if(err) return callback(err);

			this.parentCompilation.children.push(compilation);
			Object.keys(compilation.assets).forEach(name => {
				this.parentCompilation.assets[name] = compilation.assets[name];
			});

			const entries = Object.keys(compilation.entrypoints).map(name => {
				return compilation.entrypoints[name].chunks;
			}).reduce((array, chunks) => {
				return array.concat(chunks);
			}, []);

			return callback(null, entries, compilation);
		});
	}

	purgeInputFileSystem() {
		if(this.inputFileSystem && this.inputFileSystem.purge)
			this.inputFileSystem.purge();
	}

	emitAssets(compilation, callback) {
		let outputPath;

		const emitFiles = (err) => {
			if(err) return callback(err);

			require("async").forEach(Object.keys(compilation.assets), (file, callback) => {

				let targetFile = file;
				const queryStringIdx = targetFile.indexOf("?");
				if(queryStringIdx >= 0) {
					targetFile = targetFile.substr(0, queryStringIdx);
				}

				const writeOut = (err) => {
					if(err) return callback(err);
					const targetPath = this.outputFileSystem.join(outputPath, targetFile);
					const source = compilation.assets[file];
					if(source.existsAt === targetPath) {
						source.emitted = false;
						return callback();
					}
					let content = source.source();

					if(!Buffer.isBuffer(content)) {
						content = new Buffer(content, "utf8"); // eslint-disable-line
					}

					source.existsAt = targetPath;
					source.emitted = true;
					this.outputFileSystem.writeFile(targetPath, content, callback);
				};

				if(targetFile.match(/\/|\\/)) {
					const dir = path.dirname(targetFile);
					this.outputFileSystem.mkdirp(this.outputFileSystem.join(outputPath, dir), writeOut);
				} else writeOut();

			}, err => {
				if(err) return callback(err);

				afterEmit.call(this);
			});
		};

		this.applyPluginsAsync("emit", compilation, err => {
			if(err) return callback(err);
			outputPath = compilation.getPath(this.outputPath);
			this.outputFileSystem.mkdirp(outputPath, emitFiles);
		});

		function afterEmit() {
			this.applyPluginsAsyncSeries1("after-emit", compilation, err => {
				if(err) return callback(err);

				return callback();
			});
		}

	}

	emitRecords(callback) {
		if(!this.recordsOutputPath) return callback();
		const idx1 = this.recordsOutputPath.lastIndexOf("/");
		const idx2 = this.recordsOutputPath.lastIndexOf("\\");
		let recordsOutputPathDirectory = null;
		if(idx1 > idx2) recordsOutputPathDirectory = this.recordsOutputPath.substr(0, idx1);
		if(idx1 < idx2) recordsOutputPathDirectory = this.recordsOutputPath.substr(0, idx2);
		if(!recordsOutputPathDirectory) return writeFile.call(this);
		this.outputFileSystem.mkdirp(recordsOutputPathDirectory, err => {
			if(err) return callback(err);
			writeFile.call(this);
		});

		function writeFile() {
			this.outputFileSystem.writeFile(this.recordsOutputPath, JSON.stringify(this.records, undefined, 2), callback);
		}
	}

	readRecords(callback) {
		if(!this.recordsInputPath) {
			this.records = {};
			return callback();
		}
		this.inputFileSystem.stat(this.recordsInputPath, err => {
			// It doesn't exist
			// We can ignore this.
			if(err) return callback();

			this.inputFileSystem.readFile(this.recordsInputPath, (err, content) => {
				if(err) return callback(err);

				try {
					this.records = JSON.parse(content.toString("utf-8"));
				} catch(e) {
					e.message = "Cannot parse records: " + e.message;
					return callback(e);
				}

				return callback();
			});
		});
	}

	createChildCompiler(compilation, compilerName, compilerIndex, outputOptions, plugins) {
		const childCompiler = new Compiler();
		if(Array.isArray(plugins)) {
			plugins.forEach(plugin => childCompiler.apply(plugin));
		}
		for(const name in this._plugins) {
			if(["make", "compile", "emit", "after-emit", "invalid", "done", "this-compilation"].indexOf(name) < 0)
				childCompiler._plugins[name] = this._plugins[name].slice();
		}
		childCompiler.name = compilerName;
		childCompiler.outputPath = this.outputPath;
		childCompiler.inputFileSystem = this.inputFileSystem;
		childCompiler.outputFileSystem = null;
		childCompiler.resolvers = this.resolvers;
		childCompiler.fileTimestamps = this.fileTimestamps;
		childCompiler.contextTimestamps = this.contextTimestamps;

		const relativeCompilerName = makePathsRelative(this.context, compilerName);
		if(!this.records[relativeCompilerName]) this.records[relativeCompilerName] = [];
		if(this.records[relativeCompilerName][compilerIndex])
			childCompiler.records = this.records[relativeCompilerName][compilerIndex];
		else
			this.records[relativeCompilerName].push(childCompiler.records = {});

		childCompiler.options = Object.create(this.options);
		childCompiler.options.output = Object.create(childCompiler.options.output);
		for(const name in outputOptions) {
			childCompiler.options.output[name] = outputOptions[name];
		}
		childCompiler.parentCompilation = compilation;

		compilation.applyPlugins("child-compiler", childCompiler, compilerName, compilerIndex);

		return childCompiler;
	}

	isChild() {
		return !!this.parentCompilation;
	}

	createCompilation() {
		return new Compilation(this);
	}

	newCompilation(params) {
		const compilation = this.createCompilation();
		compilation.fileTimestamps = this.fileTimestamps;
		compilation.contextTimestamps = this.contextTimestamps;
		compilation.name = this.name;
		compilation.records = this.records;
		compilation.compilationDependencies = params.compilationDependencies;
		this.applyPlugins("this-compilation", compilation, params);
		this.applyPlugins("compilation", compilation, params);
		return compilation;
	}

	createNormalModuleFactory() {
		const normalModuleFactory = new NormalModuleFactory(this.options.context, this.resolvers, this.options.module || {});
		this.applyPlugins("normal-module-factory", normalModuleFactory);
		return normalModuleFactory;
	}

	createContextModuleFactory() {
		const contextModuleFactory = new ContextModuleFactory(this.resolvers, this.inputFileSystem);
		this.applyPlugins("context-module-factory", contextModuleFactory);
		return contextModuleFactory;
	}

	newCompilationParams() {
		const params = {
			normalModuleFactory: this.createNormalModuleFactory(),
			contextModuleFactory: this.createContextModuleFactory(),
			compilationDependencies: []
		};
		return params;
	}

	compile(callback) {
		const params = this.newCompilationParams();
		this.applyPluginsAsync("before-compile", params, err => {
			if(err) return callback(err);

			this.applyPlugins("compile", params);

			const compilation = this.newCompilation(params);

			this.applyPluginsParallel("make", compilation, err => {
				if(err) return callback(err);

				compilation.finish();

				compilation.seal(err => {
					if(err) return callback(err);

					this.applyPluginsAsync("after-compile", compilation, err => {
						if(err) return callback(err);

						return callback(null, compilation);
					});
				});
			});
		});
	}
}

Compiler.Watching = Watching;
module.exports = Compiler;

}, function(modId) { var map = {"./Compilation":1602510872125,"./Stats":1602510872148,"./NormalModuleFactory":1602510872155,"./ContextModuleFactory":1602510872167,"./util/identifier":1602510872151}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872125, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
	*/


const asyncLib = require("async");
const crypto = require("crypto");
const Tapable = require("tapable");
const EntryModuleNotFoundError = require("./EntryModuleNotFoundError");
const ModuleNotFoundError = require("./ModuleNotFoundError");
const ModuleDependencyWarning = require("./ModuleDependencyWarning");
const ModuleDependencyError = require("./ModuleDependencyError");
const Module = require("./Module");
const Chunk = require("./Chunk");
const Entrypoint = require("./Entrypoint");
const MainTemplate = require("./MainTemplate");
const ChunkTemplate = require("./ChunkTemplate");
const HotUpdateChunkTemplate = require("./HotUpdateChunkTemplate");
const ModuleTemplate = require("./ModuleTemplate");
const Dependency = require("./Dependency");
const ChunkRenderError = require("./ChunkRenderError");
const AsyncDependencyToInitialChunkWarning = require("./AsyncDependencyToInitialChunkWarning");
const CachedSource = require("webpack-sources").CachedSource;
const Stats = require("./Stats");
const Semaphore = require("./util/Semaphore");
const Queue = require("./util/Queue");

function byId(a, b) {
	if(a.id < b.id) return -1;
	if(a.id > b.id) return 1;
	return 0;
}

function byIndex(a, b) {
	if(a.index < b.index) return -1;
	if(a.index > b.index) return 1;
	return 0;
}

function iterationBlockVariable(variables, fn) {
	for(let indexVariable = 0; indexVariable < variables.length; indexVariable++) {
		const varDep = variables[indexVariable].dependencies;
		for(let indexVDep = 0; indexVDep < varDep.length; indexVDep++) {
			fn(varDep[indexVDep]);
		}
	}
}

function iterationOfArrayCallback(arr, fn) {
	for(let index = 0; index < arr.length; index++) {
		fn(arr[index]);
	}
}

class Compilation extends Tapable {
	constructor(compiler) {
		super();
		this.compiler = compiler;
		this.resolvers = compiler.resolvers;
		this.inputFileSystem = compiler.inputFileSystem;

		const options = this.options = compiler.options;
		this.outputOptions = options && options.output;
		this.bail = options && options.bail;
		this.profile = options && options.profile;
		this.performance = options && options.performance;

		this.mainTemplate = new MainTemplate(this.outputOptions);
		this.chunkTemplate = new ChunkTemplate(this.outputOptions);
		this.hotUpdateChunkTemplate = new HotUpdateChunkTemplate(this.outputOptions);
		this.moduleTemplate = new ModuleTemplate(this.outputOptions);

		this.semaphore = new Semaphore(options.parallelism || 100);

		this.entries = [];
		this.preparedChunks = [];
		this.entrypoints = {};
		this.chunks = [];
		this.namedChunks = {};
		this.modules = [];
		this._modules = {};
		this.cache = null;
		this.records = null;
		this.nextFreeModuleIndex = undefined;
		this.nextFreeModuleIndex2 = undefined;
		this.additionalChunkAssets = [];
		this.assets = {};
		this.errors = [];
		this.warnings = [];
		this.children = [];
		this.dependencyFactories = new Map();
		this.dependencyTemplates = new Map();
		this.dependencyTemplates.set("hash", "");
		this.childrenCounters = {};
	}

	getStats() {
		return new Stats(this);
	}

	templatesPlugin(name, fn) {
		this.mainTemplate.plugin(name, fn);
		this.chunkTemplate.plugin(name, fn);
	}

	addModule(module, cacheGroup) {
		const identifier = module.identifier();
		if(this._modules[identifier]) {
			return false;
		}
		const cacheName = (cacheGroup || "m") + identifier;
		if(this.cache && this.cache[cacheName]) {
			const cacheModule = this.cache[cacheName];

			let rebuild = true;
			if(!cacheModule.error && cacheModule.cacheable && this.fileTimestamps && this.contextTimestamps) {
				rebuild = cacheModule.needRebuild(this.fileTimestamps, this.contextTimestamps);
			}

			if(!rebuild) {
				cacheModule.disconnect();
				this._modules[identifier] = cacheModule;
				this.modules.push(cacheModule);
				cacheModule.errors.forEach(err => this.errors.push(err));
				cacheModule.warnings.forEach(err => this.warnings.push(err));
				return cacheModule;
			}
		}
		module.unbuild();
		this._modules[identifier] = module;
		if(this.cache) {
			this.cache[cacheName] = module;
		}
		this.modules.push(module);
		return true;
	}

	getModule(module) {
		const identifier = module.identifier();
		return this._modules[identifier];
	}

	findModule(identifier) {
		return this._modules[identifier];
	}

	buildModule(module, optional, origin, dependencies, thisCallback) {
		this.applyPlugins1("build-module", module);
		if(module.building) return module.building.push(thisCallback);
		const building = module.building = [thisCallback];

		function callback(err) {
			module.building = undefined;
			building.forEach(cb => cb(err));
		}
		module.build(this.options, this, this.resolvers.normal, this.inputFileSystem, (error) => {
			const errors = module.errors;
			for(let indexError = 0; indexError < errors.length; indexError++) {
				const err = errors[indexError];
				err.origin = origin;
				err.dependencies = dependencies;
				if(optional)
					this.warnings.push(err);
				else
					this.errors.push(err);
			}

			const warnings = module.warnings;
			for(let indexWarning = 0; indexWarning < warnings.length; indexWarning++) {
				const war = warnings[indexWarning];
				war.origin = origin;
				war.dependencies = dependencies;
				this.warnings.push(war);
			}
			module.dependencies.sort(Dependency.compare);
			if(error) {
				this.applyPlugins2("failed-module", module, error);
				return callback(error);
			}
			this.applyPlugins1("succeed-module", module);
			return callback();
		});
	}

	processModuleDependencies(module, callback) {
		const dependencies = [];

		function addDependency(dep) {
			for(let i = 0; i < dependencies.length; i++) {
				if(dep.isEqualResource(dependencies[i][0])) {
					return dependencies[i].push(dep);
				}
			}
			dependencies.push([dep]);
		}

		function addDependenciesBlock(block) {
			if(block.dependencies) {
				iterationOfArrayCallback(block.dependencies, addDependency);
			}
			if(block.blocks) {
				iterationOfArrayCallback(block.blocks, addDependenciesBlock);
			}
			if(block.variables) {
				iterationBlockVariable(block.variables, addDependency);
			}
		}
		addDependenciesBlock(module);
		this.addModuleDependencies(module, dependencies, this.bail, null, true, callback);
	}

	addModuleDependencies(module, dependencies, bail, cacheGroup, recursive, callback) {
		let _this = this;
		const start = _this.profile && Date.now();

		const factories = [];
		for(let i = 0; i < dependencies.length; i++) {
			const factory = _this.dependencyFactories.get(dependencies[i][0].constructor);
			if(!factory) {
				return callback(new Error(`No module factory available for dependency type: ${dependencies[i][0].constructor.name}`));
			}
			factories[i] = [factory, dependencies[i]];
		}
		asyncLib.forEach(factories, function iteratorFactory(item, callback) {
			const dependencies = item[1];

			const errorAndCallback = function errorAndCallback(err) {
				err.origin = module;
				_this.errors.push(err);
				if(bail) {
					callback(err);
				} else {
					callback();
				}
			};
			const warningAndCallback = function warningAndCallback(err) {
				err.origin = module;
				_this.warnings.push(err);
				callback();
			};

			const semaphore = _this.semaphore;
			semaphore.acquire(() => {
				if(_this === null) return semaphore.release();

				const factory = item[0];
				factory.create({
					contextInfo: {
						issuer: module.nameForCondition && module.nameForCondition(),
						compiler: _this.compiler.name
					},
					context: module.context,
					dependencies: dependencies
				}, function factoryCallback(err, dependentModule) {
					if(_this === null) return semaphore.release();

					let afterFactory;

					function isOptional() {
						return dependencies.filter(d => !d.optional).length === 0;
					}

					function errorOrWarningAndCallback(err) {
						if(isOptional()) {
							return warningAndCallback(err);
						} else {
							return errorAndCallback(err);
						}
					}

					function iterationDependencies(depend) {
						for(let index = 0; index < depend.length; index++) {
							const dep = depend[index];
							dep.module = dependentModule;
							dependentModule.addReason(module, dep);
						}
					}

					if(err) {
						semaphore.release();
						return errorOrWarningAndCallback(new ModuleNotFoundError(module, err, dependencies));
					}
					if(!dependentModule) {
						semaphore.release();
						return process.nextTick(callback);
					}
					if(_this.profile) {
						if(!dependentModule.profile) {
							dependentModule.profile = {};
						}
						afterFactory = Date.now();
						dependentModule.profile.factory = afterFactory - start;
					}

					dependentModule.issuer = module;
					const newModule = _this.addModule(dependentModule, cacheGroup);

					if(!newModule) { // from cache
						dependentModule = _this.getModule(dependentModule);

						if(dependentModule.optional) {
							dependentModule.optional = isOptional();
						}

						iterationDependencies(dependencies);

						if(_this.profile) {
							module.profile = module.profile || {};
							const time = Date.now() - start;
							if(!module.profile.dependencies || time > module.profile.dependencies) {
								module.profile.dependencies = time;
							}
						}

						semaphore.release();
						return process.nextTick(callback);
					}

					if(newModule instanceof Module) {
						if(_this.profile) {
							newModule.profile = dependentModule.profile;
						}

						newModule.optional = isOptional();
						newModule.issuer = dependentModule.issuer;
						dependentModule = newModule;

						iterationDependencies(dependencies);

						if(_this.profile) {
							const afterBuilding = Date.now();
							module.profile.building = afterBuilding - afterFactory;
						}

						semaphore.release();
						if(recursive) {
							return process.nextTick(_this.processModuleDependencies.bind(_this, dependentModule, callback));
						} else {
							return process.nextTick(callback);
						}
					}

					dependentModule.optional = isOptional();

					iterationDependencies(dependencies);

					_this.buildModule(dependentModule, isOptional(), module, dependencies, err => {
						if(_this === null) return semaphore.release();

						if(err) {
							semaphore.release();
							return errorOrWarningAndCallback(err);
						}

						if(_this.profile) {
							const afterBuilding = Date.now();
							dependentModule.profile.building = afterBuilding - afterFactory;
						}

						semaphore.release();
						if(recursive) {
							_this.processModuleDependencies(dependentModule, callback);
						} else {
							return callback();
						}
					});

				});
			});
		}, function finalCallbackAddModuleDependencies(err) {
			// In V8, the Error objects keep a reference to the functions on the stack. These warnings &
			// errors are created inside closures that keep a reference to the Compilation, so errors are
			// leaking the Compilation object. Setting _this to null workarounds the following issue in V8.
			// https://bugs.chromium.org/p/chromium/issues/detail?id=612191
			_this = null;

			if(err) {
				return callback(err);
			}

			return process.nextTick(callback);
		});
	}

	_addModuleChain(context, dependency, onModule, callback) {
		const start = this.profile && Date.now();

		const errorAndCallback = this.bail ? (err) => {
			callback(err);
		} : (err) => {
			err.dependencies = [dependency];
			this.errors.push(err);
			callback();
		};

		if(typeof dependency !== "object" || dependency === null || !dependency.constructor) {
			throw new Error("Parameter 'dependency' must be a Dependency");
		}

		const moduleFactory = this.dependencyFactories.get(dependency.constructor);
		if(!moduleFactory) {
			throw new Error(`No dependency factory available for this dependency type: ${dependency.constructor.name}`);
		}

		this.semaphore.acquire(() => {
			moduleFactory.create({
				contextInfo: {
					issuer: "",
					compiler: this.compiler.name
				},
				context: context,
				dependencies: [dependency]
			}, (err, module) => {
				if(err) {
					this.semaphore.release();
					return errorAndCallback(new EntryModuleNotFoundError(err));
				}

				let afterFactory;

				if(this.profile) {
					if(!module.profile) {
						module.profile = {};
					}
					afterFactory = Date.now();
					module.profile.factory = afterFactory - start;
				}

				const result = this.addModule(module);
				if(!result) {
					module = this.getModule(module);

					onModule(module);

					if(this.profile) {
						const afterBuilding = Date.now();
						module.profile.building = afterBuilding - afterFactory;
					}

					this.semaphore.release();
					return callback(null, module);
				}

				if(result instanceof Module) {
					if(this.profile) {
						result.profile = module.profile;
					}

					module = result;

					onModule(module);

					moduleReady.call(this);
					return;
				}

				onModule(module);

				this.buildModule(module, false, null, null, (err) => {
					if(err) {
						this.semaphore.release();
						return errorAndCallback(err);
					}

					if(this.profile) {
						const afterBuilding = Date.now();
						module.profile.building = afterBuilding - afterFactory;
					}

					moduleReady.call(this);
				});

				function moduleReady() {
					this.semaphore.release();
					this.processModuleDependencies(module, err => {
						if(err) {
							return callback(err);
						}

						return callback(null, module);
					});
				}
			});
		});
	}

	addEntry(context, entry, name, callback) {
		const slot = {
			name: name,
			module: null
		};
		this.preparedChunks.push(slot);
		this._addModuleChain(context, entry, (module) => {

			entry.module = module;
			this.entries.push(module);
			module.issuer = null;

		}, (err, module) => {
			if(err) {
				return callback(err);
			}

			if(module) {
				slot.module = module;
			} else {
				const idx = this.preparedChunks.indexOf(slot);
				this.preparedChunks.splice(idx, 1);
			}
			return callback(null, module);
		});
	}

	prefetch(context, dependency, callback) {
		this._addModuleChain(context, dependency, module => {

			module.prefetched = true;
			module.issuer = null;

		}, callback);
	}

	rebuildModule(module, thisCallback) {
		if(module.variables.length || module.blocks.length)
			throw new Error("Cannot rebuild a complex module with variables or blocks");
		if(module.rebuilding) {
			return module.rebuilding.push(thisCallback);
		}
		const rebuilding = module.rebuilding = [thisCallback];

		function callback(err) {
			module.rebuilding = undefined;
			rebuilding.forEach(cb => cb(err));
		}
		const deps = module.dependencies.slice();
		this.buildModule(module, false, module, null, (err) => {
			if(err) return callback(err);

			this.processModuleDependencies(module, (err) => {
				if(err) return callback(err);
				deps.forEach(d => {
					if(d.module && d.module.removeReason(module, d)) {
						module.forEachChunk(chunk => {
							if(!d.module.hasReasonForChunk(chunk)) {
								if(d.module.removeChunk(chunk)) {
									this.removeChunkFromDependencies(d.module, chunk);
								}
							}
						});
					}
				});
				callback();
			});

		});
	}

	finish() {
		const modules = this.modules;
		this.applyPlugins1("finish-modules", modules);

		for(let index = 0; index < modules.length; index++) {
			const module = modules[index];
			this.reportDependencyErrorsAndWarnings(module, [module]);
		}
	}

	unseal() {
		this.applyPlugins0("unseal");
		this.chunks.length = 0;
		this.namedChunks = {};
		this.additionalChunkAssets.length = 0;
		this.assets = {};
		this.modules.forEach(module => module.unseal());
	}

	seal(callback) {
		this.applyPlugins0("seal");
		this.nextFreeModuleIndex = 0;
		this.nextFreeModuleIndex2 = 0;
		this.preparedChunks.forEach(preparedChunk => {
			const module = preparedChunk.module;
			const chunk = this.addChunk(preparedChunk.name, module);
			const entrypoint = this.entrypoints[chunk.name] = new Entrypoint(chunk.name);
			entrypoint.unshiftChunk(chunk);

			chunk.addModule(module);
			module.addChunk(chunk);
			chunk.entryModule = module;
			this.assignIndex(module);
			this.assignDepth(module);
		});
		this.processDependenciesBlocksForChunks(this.chunks.slice());
		this.sortModules(this.modules);
		this.applyPlugins0("optimize");

		while(this.applyPluginsBailResult1("optimize-modules-basic", this.modules) ||
			this.applyPluginsBailResult1("optimize-modules", this.modules) ||
			this.applyPluginsBailResult1("optimize-modules-advanced", this.modules)) { /* empty */ }
		this.applyPlugins1("after-optimize-modules", this.modules);

		while(this.applyPluginsBailResult1("optimize-chunks-basic", this.chunks) ||
			this.applyPluginsBailResult1("optimize-chunks", this.chunks) ||
			this.applyPluginsBailResult1("optimize-chunks-advanced", this.chunks)) { /* empty */ }
		this.applyPlugins1("after-optimize-chunks", this.chunks);

		this.applyPluginsAsyncSeries("optimize-tree", this.chunks, this.modules, (err) => {
			if(err) {
				return callback(err);
			}

			this.applyPlugins2("after-optimize-tree", this.chunks, this.modules);

			while(this.applyPluginsBailResult("optimize-chunk-modules-basic", this.chunks, this.modules) ||
				this.applyPluginsBailResult("optimize-chunk-modules", this.chunks, this.modules) ||
				this.applyPluginsBailResult("optimize-chunk-modules-advanced", this.chunks, this.modules)) { /* empty */ }
			this.applyPlugins2("after-optimize-chunk-modules", this.chunks, this.modules);

			const shouldRecord = this.applyPluginsBailResult("should-record") !== false;

			this.applyPlugins2("revive-modules", this.modules, this.records);
			this.applyPlugins1("optimize-module-order", this.modules);
			this.applyPlugins1("advanced-optimize-module-order", this.modules);
			this.applyPlugins1("before-module-ids", this.modules);
			this.applyPlugins1("module-ids", this.modules);
			this.applyModuleIds();
			this.applyPlugins1("optimize-module-ids", this.modules);
			this.applyPlugins1("after-optimize-module-ids", this.modules);

			this.sortItemsWithModuleIds();

			this.applyPlugins2("revive-chunks", this.chunks, this.records);
			this.applyPlugins1("optimize-chunk-order", this.chunks);
			this.applyPlugins1("before-chunk-ids", this.chunks);
			this.applyChunkIds();
			this.applyPlugins1("optimize-chunk-ids", this.chunks);
			this.applyPlugins1("after-optimize-chunk-ids", this.chunks);

			this.sortItemsWithChunkIds();

			if(shouldRecord)
				this.applyPlugins2("record-modules", this.modules, this.records);
			if(shouldRecord)
				this.applyPlugins2("record-chunks", this.chunks, this.records);

			this.applyPlugins0("before-hash");
			this.createHash();
			this.applyPlugins0("after-hash");

			if(shouldRecord)
				this.applyPlugins1("record-hash", this.records);

			this.applyPlugins0("before-module-assets");
			this.createModuleAssets();
			if(this.applyPluginsBailResult("should-generate-chunk-assets") !== false) {
				this.applyPlugins0("before-chunk-assets");
				this.createChunkAssets();
			}
			this.applyPlugins1("additional-chunk-assets", this.chunks);
			this.summarizeDependencies();
			if(shouldRecord)
				this.applyPlugins2("record", this, this.records);

			this.applyPluginsAsync("additional-assets", err => {
				if(err) {
					return callback(err);
				}
				this.applyPluginsAsync("optimize-chunk-assets", this.chunks, err => {
					if(err) {
						return callback(err);
					}
					this.applyPlugins1("after-optimize-chunk-assets", this.chunks);
					this.applyPluginsAsync("optimize-assets", this.assets, err => {
						if(err) {
							return callback(err);
						}
						this.applyPlugins1("after-optimize-assets", this.assets);
						if(this.applyPluginsBailResult("need-additional-seal")) {
							this.unseal();
							return this.seal(callback);
						}
						return this.applyPluginsAsync("after-seal", callback);
					});
				});
			});
		});
	}

	sortModules(modules) {
		modules.sort(byIndex);
	}

	reportDependencyErrorsAndWarnings(module, blocks) {
		for(let indexBlock = 0; indexBlock < blocks.length; indexBlock++) {
			const block = blocks[indexBlock];
			const dependencies = block.dependencies;

			for(let indexDep = 0; indexDep < dependencies.length; indexDep++) {
				const d = dependencies[indexDep];

				const warnings = d.getWarnings();
				if(warnings) {
					for(let indexWar = 0; indexWar < warnings.length; indexWar++) {
						const w = warnings[indexWar];

						const warning = new ModuleDependencyWarning(module, w, d.loc);
						this.warnings.push(warning);
					}
				}
				const errors = d.getErrors();
				if(errors) {
					for(let indexErr = 0; indexErr < errors.length; indexErr++) {
						const e = errors[indexErr];

						const error = new ModuleDependencyError(module, e, d.loc);
						this.errors.push(error);
					}
				}
			}

			this.reportDependencyErrorsAndWarnings(module, block.blocks);
		}
	}

	addChunk(name, module, loc) {
		if(name) {
			if(Object.prototype.hasOwnProperty.call(this.namedChunks, name)) {
				const chunk = this.namedChunks[name];
				if(module) {
					chunk.addOrigin(module, loc);
				}
				return chunk;
			}
		}
		const chunk = new Chunk(name, module, loc);
		this.chunks.push(chunk);
		if(name) {
			this.namedChunks[name] = chunk;
		}
		return chunk;
	}

	assignIndex(module) {
		const _this = this;

		const queue = [() => {
			assignIndexToModule(module);
		}];

		const iteratorAllDependencies = d => {
			queue.push(() => assignIndexToDependency(d));
		};

		function assignIndexToModule(module) {
			// enter module
			if(typeof module.index !== "number") {
				module.index = _this.nextFreeModuleIndex++;

				// leave module
				queue.push(() => module.index2 = _this.nextFreeModuleIndex2++);

				// enter it as block
				assignIndexToDependencyBlock(module);
			}
		}

		function assignIndexToDependency(dependency) {
			if(dependency.module) {
				queue.push(() => assignIndexToModule(dependency.module));
			}
		}

		function assignIndexToDependencyBlock(block) {
			let allDependencies = [];

			function iteratorDependency(d) {
				allDependencies.push(d);
			}

			function iteratorBlock(b) {
				queue.push(() => assignIndexToDependencyBlock(b));
			}

			if(block.variables) {
				iterationBlockVariable(block.variables, iteratorDependency);
			}

			if(block.dependencies) {
				iterationOfArrayCallback(block.dependencies, iteratorDependency);
			}
			if(block.blocks) {
				const blocks = block.blocks;
				let indexBlock = blocks.length;
				while(indexBlock--) {
					iteratorBlock(blocks[indexBlock]);
				}
			}

			let indexAll = allDependencies.length;
			while(indexAll--) {
				iteratorAllDependencies(allDependencies[indexAll]);
			}
		}

		while(queue.length) {
			queue.pop()();
		}
	}

	assignDepth(module) {
		function assignDepthToModule(module, depth) {
			// enter module
			if(typeof module.depth === "number" && module.depth <= depth) return;
			module.depth = depth;

			// enter it as block
			assignDepthToDependencyBlock(module, depth + 1);
		}

		function assignDepthToDependency(dependency, depth) {
			if(dependency.module) {
				queue.push(() => assignDepthToModule(dependency.module, depth));
			}
		}

		function assignDepthToDependencyBlock(block, depth) {
			function iteratorDependency(d) {
				assignDepthToDependency(d, depth);
			}

			function iteratorBlock(b) {
				assignDepthToDependencyBlock(b, depth);
			}

			if(block.variables) {
				iterationBlockVariable(block.variables, iteratorDependency);
			}

			if(block.dependencies) {
				iterationOfArrayCallback(block.dependencies, iteratorDependency);
			}

			if(block.blocks) {
				iterationOfArrayCallback(block.blocks, iteratorBlock);
			}
		}

		const queue = [() => {
			assignDepthToModule(module, 0);
		}];
		while(queue.length) {
			queue.pop()();
		}
	}

	// This method creates the Chunk graph from the Module graph
	processDependenciesBlocksForChunks(inputChunks) {
		// Process is splitting into two parts:
		// Part one traverse the module graph and builds a very basic chunks graph
		//   in chunkDependencies.
		// Part two traverse every possible way through the basic chunk graph and
		//   tracks the available modules. While traversing it connects chunks with
		//   eachother and Blocks with Chunks. It stops traversing when all modules
		//   for a chunk are already available. So it doesn't connect unneeded chunks.

		const chunkDependencies = new Map(); // Map<Chunk, Array<{Module, Chunk}>>
		const allCreatedChunks = new Set();

		// PART ONE

		const blockChunks = new Map();

		// Start with the provided modules/chunks
		const queue = inputChunks.map(chunk => ({
			block: chunk.entryModule,
			chunk: chunk
		}));

		let block, chunk;

		// For each async Block in graph
		const iteratorBlock = b => {
			// 1. We create a chunk for this Block
			// but only once (blockChunks map)
			let c = blockChunks.get(b);
			if(c === undefined) {
				c = this.namedChunks[b.chunkName];
				if(c && c.isInitial()) {
					// TODO webpack 4: convert this to an error
					this.warnings.push(new AsyncDependencyToInitialChunkWarning(b.chunkName, b.module, b.loc));
					c = chunk;
				} else {
					c = this.addChunk(b.chunkName, b.module, b.loc);
					blockChunks.set(b, c);
					allCreatedChunks.add(c);
					// We initialize the chunks property
					// this is later filled with the chunk when needed
					b.chunks = [];
				}
			}

			// 2. We store the Block+Chunk mapping as dependency for the chunk
			let deps = chunkDependencies.get(chunk);
			if(!deps) chunkDependencies.set(chunk, deps = []);
			deps.push({
				block: b,
				chunk: c
			});

			// 3. We enqueue the DependenciesBlock for traversal
			queue.push({
				block: b,
				chunk: c
			});
		};

		// For each Dependency in the graph
		const iteratorDependency = d => {
			// We skip Dependencies without Module pointer
			if(!d.module) {
				return;
			}
			// We skip weak Dependencies
			if(d.weak) {
				return;
			}
			// We connect Module and Chunk when not already done
			if(chunk.addModule(d.module)) {
				d.module.addChunk(chunk);

				// And enqueue the Module for traversal
				queue.push({
					block: d.module,
					chunk
				});
			}
		};

		// Iterative traversal of the Module graph
		// Recursive would be simpler to write but could result in Stack Overflows
		while(queue.length) {
			const queueItem = queue.pop();
			block = queueItem.block;
			chunk = queueItem.chunk;

			// Traverse all variables, Dependencies and Blocks
			if(block.variables) {
				iterationBlockVariable(block.variables, iteratorDependency);
			}

			if(block.dependencies) {
				iterationOfArrayCallback(block.dependencies, iteratorDependency);
			}

			if(block.blocks) {
				iterationOfArrayCallback(block.blocks, iteratorBlock);
			}
		}

		// PART TWO

		let availableModules;
		let newAvailableModules;
		const queue2 = new Queue(inputChunks.map(chunk => ({
			chunk,
			availableModules: new Set()
		})));

		// Helper function to check if all modules of a chunk are available
		const areModulesAvailable = (chunk, availableModules) => {
			for(const module of chunk.modulesIterable) {
				if(!availableModules.has(module))
					return false;
			}
			return true;
		};

		// For each edge in the basic chunk graph
		const filterFn = dep => {
			// Filter egdes that are not needed because all modules are already available
			// This also filters circular dependencies in the chunks graph
			const depChunk = dep.chunk;
			if(areModulesAvailable(depChunk, newAvailableModules))
				return false; // break all modules are already available
			return true;
		};

		const minAvailableModulesMap = new Map();

		// Iterative traversing of the basic chunk graph
		while(queue2.length) {
			const queueItem = queue2.dequeue();
			chunk = queueItem.chunk;
			availableModules = queueItem.availableModules;

			// 1. Get minimal available modules
			// It doesn't make sense to traverse a chunk again with more available modules.
			// This step calculates the minimal available modules and skips traversal when
			// the list didn't shrink.
			let minAvailableModules = minAvailableModulesMap.get(chunk);
			if(minAvailableModules === undefined) {
				minAvailableModulesMap.set(chunk, new Set(availableModules));
			} else {
				let deletedModules = false;
				for(const m of minAvailableModules) {
					if(!availableModules.has(m)) {
						minAvailableModules.delete(m);
						deletedModules = true;
					}
				}
				if(!deletedModules)
					continue;
				availableModules = minAvailableModules;
			}

			// 2. Get the edges at this point of the graph
			const deps = chunkDependencies.get(chunk);
			if(!deps) continue;
			if(deps.length === 0) continue;

			// 3. Create a new Set of available modules at this points
			newAvailableModules = new Set(availableModules);
			for(const m of chunk.modulesIterable)
				newAvailableModules.add(m);

			// 4. Filter edges with available modules
			const filteredDeps = deps.filter(filterFn);

			// 5. Foreach remaining edge
			const nextChunks = new Set();
			for(let i = 0; i < filteredDeps.length; i++) {
				const dep = filteredDeps[i];
				const depChunk = dep.chunk;
				const depBlock = dep.block;

				// 6. Connnect block with chunk
				if(depChunk.addBlock(depBlock)) {
					depBlock.chunks.push(depChunk);
				}

				// 7. Connect chunk with parent
				if(chunk.addChunk(depChunk)) {
					depChunk.addParent(chunk);
				}

				nextChunks.add(depChunk);
			}

			// 8. Enqueue further traversal
			for(const nextChunk of nextChunks) {
				queue2.enqueue({
					chunk: nextChunk,
					availableModules: newAvailableModules
				});
			}
		}

		// Remove all unconnected chunks
		for(const chunk of allCreatedChunks) {
			if(chunk.parents.length === 0)
				chunk.remove("unconnected");
		}
	}

	removeChunkFromDependencies(block, chunk) {
		const iteratorDependency = d => {
			if(!d.module) {
				return;
			}
			if(!d.module.hasReasonForChunk(chunk)) {
				if(d.module.removeChunk(chunk)) {
					this.removeChunkFromDependencies(d.module, chunk);
				}
			}
		};

		const blocks = block.blocks;
		for(let indexBlock = 0; indexBlock < blocks.length; indexBlock++) {
			const chunks = blocks[indexBlock].chunks;
			for(let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
				const blockChunk = chunks[indexChunk];
				chunk.removeChunk(blockChunk);
				blockChunk.removeParent(chunk);
				this.removeChunkFromDependencies(chunks, blockChunk);
			}
		}

		if(block.dependencies) {
			iterationOfArrayCallback(block.dependencies, iteratorDependency);
		}

		if(block.variables) {
			iterationBlockVariable(block.variables, iteratorDependency);
		}
	}

	applyModuleIds() {
		const unusedIds = [];
		let nextFreeModuleId = 0;
		const usedIds = [];
		// TODO consider Map when performance has improved https://gist.github.com/sokra/234c077e1299b7369461f1708519c392
		const usedIdMap = Object.create(null);
		if(this.usedModuleIds) {
			Object.keys(this.usedModuleIds).forEach(key => {
				const id = this.usedModuleIds[key];
				if(!usedIdMap[id]) {
					usedIds.push(id);
					usedIdMap[id] = true;
				}
			});
		}

		const modules1 = this.modules;
		for(let indexModule1 = 0; indexModule1 < modules1.length; indexModule1++) {
			const module1 = modules1[indexModule1];
			if(module1.id && !usedIdMap[module1.id]) {
				usedIds.push(module1.id);
				usedIdMap[module1.id] = true;
			}
		}

		if(usedIds.length > 0) {
			let usedIdMax = -1;
			for(let index = 0; index < usedIds.length; index++) {
				const usedIdKey = usedIds[index];

				if(typeof usedIdKey !== "number") {
					continue;
				}

				usedIdMax = Math.max(usedIdMax, usedIdKey);
			}

			let lengthFreeModules = nextFreeModuleId = usedIdMax + 1;

			while(lengthFreeModules--) {
				if(!usedIdMap[lengthFreeModules]) {
					unusedIds.push(lengthFreeModules);
				}
			}
		}

		const modules2 = this.modules;
		for(let indexModule2 = 0; indexModule2 < modules2.length; indexModule2++) {
			const module2 = modules2[indexModule2];
			if(module2.id === null) {
				if(unusedIds.length > 0)
					module2.id = unusedIds.pop();
				else
					module2.id = nextFreeModuleId++;
			}
		}
	}

	applyChunkIds() {
		const unusedIds = [];
		let nextFreeChunkId = 0;

		function getNextFreeChunkId(usedChunkIds) {
			const keyChunks = Object.keys(usedChunkIds);
			let result = -1;

			for(let index = 0; index < keyChunks.length; index++) {
				const usedIdKey = keyChunks[index];
				const usedIdValue = usedChunkIds[usedIdKey];

				if(typeof usedIdValue !== "number") {
					continue;
				}

				result = Math.max(result, usedIdValue);
			}

			return result;
		}

		if(this.usedChunkIds) {
			nextFreeChunkId = getNextFreeChunkId(this.usedChunkIds) + 1;
			let index = nextFreeChunkId;
			while(index--) {
				if(this.usedChunkIds[index] !== index) {
					unusedIds.push(index);
				}
			}
		}

		const chunks = this.chunks;
		for(let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			const chunk = chunks[indexChunk];
			if(chunk.id === null) {
				if(unusedIds.length > 0)
					chunk.id = unusedIds.pop();
				else
					chunk.id = nextFreeChunkId++;
			}
			if(!chunk.ids) {
				chunk.ids = [chunk.id];
			}
		}
	}

	sortItemsWithModuleIds() {
		this.modules.sort(byId);

		const modules = this.modules;
		for(let indexModule = 0; indexModule < modules.length; indexModule++) {
			modules[indexModule].sortItems(false);
		}

		const chunks = this.chunks;
		for(let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			chunks[indexChunk].sortItems();
		}
	}

	sortItemsWithChunkIds() {
		this.chunks.sort(byId);

		for(let indexModule = 0; indexModule < this.modules.length; indexModule++) {
			this.modules[indexModule].sortItems(true);
		}

		for(let indexChunk = 0; indexChunk < this.chunks.length; indexChunk++) {
			this.chunks[indexChunk].sortItems();
		}

		const byMessage = (a, b) => {
			const ma = `${a.message}`;
			const mb = `${b.message}`;
			if(ma < mb) return -1;
			if(mb < ma) return 1;
			return 0;
		};

		this.errors.sort(byMessage);
		this.warnings.sort(byMessage);
	}

	summarizeDependencies() {
		function filterDups(array) {
			const newArray = [];
			for(let i = 0; i < array.length; i++) {
				if(i === 0 || array[i - 1] !== array[i])
					newArray.push(array[i]);
			}
			return newArray;
		}
		this.fileDependencies = (this.compilationDependencies || []).slice();
		this.contextDependencies = [];
		this.missingDependencies = [];

		for(let indexChildren = 0; indexChildren < this.children.length; indexChildren++) {
			const child = this.children[indexChildren];

			this.fileDependencies = this.fileDependencies.concat(child.fileDependencies);
			this.contextDependencies = this.contextDependencies.concat(child.contextDependencies);
			this.missingDependencies = this.missingDependencies.concat(child.missingDependencies);
		}

		for(let indexModule = 0; indexModule < this.modules.length; indexModule++) {
			const module = this.modules[indexModule];

			if(module.fileDependencies) {
				const fileDependencies = module.fileDependencies;
				for(let indexFileDep = 0; indexFileDep < fileDependencies.length; indexFileDep++) {
					this.fileDependencies.push(fileDependencies[indexFileDep]);
				}
			}
			if(module.contextDependencies) {
				const contextDependencies = module.contextDependencies;
				for(let indexContextDep = 0; indexContextDep < contextDependencies.length; indexContextDep++) {
					this.contextDependencies.push(contextDependencies[indexContextDep]);
				}
			}
		}
		this.errors.forEach(error => {
			if(Array.isArray(error.missing)) {
				error.missing.forEach(item => this.missingDependencies.push(item));
			}
		});
		this.fileDependencies.sort();
		this.fileDependencies = filterDups(this.fileDependencies);
		this.contextDependencies.sort();
		this.contextDependencies = filterDups(this.contextDependencies);
		this.missingDependencies.sort();
		this.missingDependencies = filterDups(this.missingDependencies);
	}

	createHash() {
		const outputOptions = this.outputOptions;
		const hashFunction = outputOptions.hashFunction;
		const hashDigest = outputOptions.hashDigest;
		const hashDigestLength = outputOptions.hashDigestLength;
		const hash = crypto.createHash(hashFunction);
		if(outputOptions.hashSalt)
			hash.update(outputOptions.hashSalt);
		this.mainTemplate.updateHash(hash);
		this.chunkTemplate.updateHash(hash);
		this.moduleTemplate.updateHash(hash);
		this.children.forEach(function(child) {
			hash.update(child.hash);
		});
		this.warnings.forEach(function(warning) {
			hash.update(`${warning.message}`);
		});
		this.errors.forEach(function(error) {
			hash.update(`${error.message}`);
		});
		// clone needed as sort below is inplace mutation
		const chunks = this.chunks.slice();
		/**
		 * sort here will bring all "falsy" values to the beginning
		 * this is needed as the "hasRuntime()" chunks are dependent on the
		 * hashes of the non-runtime chunks.
		 */
		chunks.sort((a, b) => {
			const aEntry = a.hasRuntime();
			const bEntry = b.hasRuntime();
			if(aEntry && !bEntry) return 1;
			if(!aEntry && bEntry) return -1;
			return 0;
		});
		for(let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const chunkHash = crypto.createHash(hashFunction);
			if(outputOptions.hashSalt)
				chunkHash.update(outputOptions.hashSalt);
			chunk.updateHash(chunkHash);
			if(chunk.hasRuntime()) {
				this.mainTemplate.updateHashForChunk(chunkHash, chunk);
			} else {
				this.chunkTemplate.updateHashForChunk(chunkHash, chunk);
			}
			this.applyPlugins2("chunk-hash", chunk, chunkHash);
			chunk.hash = chunkHash.digest(hashDigest);
			hash.update(chunk.hash);
			chunk.renderedHash = chunk.hash.substr(0, hashDigestLength);
		}
		this.fullHash = hash.digest(hashDigest);
		this.hash = this.fullHash.substr(0, hashDigestLength);
	}

	modifyHash(update) {
		const outputOptions = this.outputOptions;
		const hashFunction = outputOptions.hashFunction;
		const hashDigest = outputOptions.hashDigest;
		const hashDigestLength = outputOptions.hashDigestLength;
		const hash = crypto.createHash(hashFunction);
		hash.update(this.fullHash);
		hash.update(update);
		this.fullHash = hash.digest(hashDigest);
		this.hash = this.fullHash.substr(0, hashDigestLength);
	}

	createModuleAssets() {
		for(let i = 0; i < this.modules.length; i++) {
			const module = this.modules[i];
			if(module.assets) {
				Object.keys(module.assets).forEach((assetName) => {
					const fileName = this.getPath(assetName);
					this.assets[fileName] = module.assets[assetName];
					this.applyPlugins2("module-asset", module, fileName);
				});
			}
		}
	}

	createChunkAssets() {
		const outputOptions = this.outputOptions;
		const filename = outputOptions.filename;
		const chunkFilename = outputOptions.chunkFilename;
		for(let i = 0; i < this.chunks.length; i++) {
			const chunk = this.chunks[i];
			chunk.files = [];
			const chunkHash = chunk.hash;
			let source;
			let file;
			const filenameTemplate = chunk.filenameTemplate ? chunk.filenameTemplate :
				chunk.isInitial() ? filename :
				chunkFilename;
			try {
				const useChunkHash = !chunk.hasRuntime() || (this.mainTemplate.useChunkHash && this.mainTemplate.useChunkHash(chunk));
				const usedHash = useChunkHash ? chunkHash : this.fullHash;
				const cacheName = "c" + chunk.id;
				if(this.cache && this.cache[cacheName] && this.cache[cacheName].hash === usedHash) {
					source = this.cache[cacheName].source;
				} else {
					if(chunk.hasRuntime()) {
						source = this.mainTemplate.render(this.hash, chunk, this.moduleTemplate, this.dependencyTemplates);
					} else {
						source = this.chunkTemplate.render(chunk, this.moduleTemplate, this.dependencyTemplates);
					}
					if(this.cache) {
						this.cache[cacheName] = {
							hash: usedHash,
							source: source = (source instanceof CachedSource ? source : new CachedSource(source))
						};
					}
				}
				file = this.getPath(filenameTemplate, {
					noChunkHash: !useChunkHash,
					chunk
				});
				if(this.assets[file])
					throw new Error(`Conflict: Multiple assets emit to the same filename ${file}`);
				this.assets[file] = source;
				chunk.files.push(file);
				this.applyPlugins2("chunk-asset", chunk, file);
			} catch(err) {
				this.errors.push(new ChunkRenderError(chunk, file || filenameTemplate, err));
			}
		}
	}

	getPath(filename, data) {
		data = data || {};
		data.hash = data.hash || this.hash;
		return this.mainTemplate.applyPluginsWaterfall("asset-path", filename, data);
	}

	createChildCompiler(name, outputOptions, plugins) {
		const idx = (this.childrenCounters[name] || 0);
		this.childrenCounters[name] = idx + 1;
		return this.compiler.createChildCompiler(this, name, idx, outputOptions, plugins);
	}

	checkConstraints() {
		const usedIds = {};

		const modules = this.modules;
		for(let indexModule = 0; indexModule < modules.length; indexModule++) {
			const moduleId = modules[indexModule].id;

			if(usedIds[moduleId])
				throw new Error(`checkConstraints: duplicate module id ${moduleId}`);
		}

		const chunks = this.chunks;
		for(let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			const chunk = chunks[indexChunk];

			if(chunks.indexOf(chunk) !== indexChunk)
				throw new Error(`checkConstraints: duplicate chunk in compilation ${chunk.debugId}`);
			chunk.checkConstraints();
		}
	}
}

module.exports = Compilation;

}, function(modId) { var map = {"./EntryModuleNotFoundError":1602510872126,"./ModuleNotFoundError":1602510872128,"./ModuleDependencyWarning":1602510872129,"./ModuleDependencyError":1602510872131,"./Module":1602510872132,"./Chunk":1602510872138,"./Entrypoint":1602510872140,"./MainTemplate":1602510872141,"./ChunkTemplate":1602510872142,"./HotUpdateChunkTemplate":1602510872143,"./ModuleTemplate":1602510872144,"./Dependency":1602510872145,"./ChunkRenderError":1602510872146,"./AsyncDependencyToInitialChunkWarning":1602510872147,"./Stats":1602510872148,"./util/Semaphore":1602510872153,"./util/Queue":1602510872154}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872126, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");

class EntryModuleNotFoundError extends WebpackError {
	constructor(err) {
		super();

		this.name = "EntryModuleNotFoundError";
		this.message = "Entry module not found: " + err;
		this.details = err.details;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = EntryModuleNotFoundError;

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872127, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Jarid Margolin @jaridmargolin
*/


module.exports = class WebpackError extends Error {
	inspect() {
		return this.stack + (this.details ? `\n${this.details}` : "");
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872128, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");

class ModuleNotFoundError extends WebpackError {
	constructor(module, err, dependencies) {
		super();

		this.name = "ModuleNotFoundError";
		this.message = "Module not found: " + err;
		this.details = err.details;
		this.missing = err.missing;
		this.module = module;
		this.origin = module;
		this.dependencies = dependencies;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ModuleNotFoundError;

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872129, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");
const formatLocation = require("./formatLocation");

module.exports = class ModuleDependencyWarning extends WebpackError {
	constructor(module, err, loc) {
		super();

		this.name = "ModuleDependencyWarning";
		this.message = `${formatLocation(loc)} ${err.message}`;
		this.details = err.stack.split("\n").slice(1).join("\n");
		this.origin = this.module = module;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
};

}, function(modId) { var map = {"./WebpackError":1602510872127,"./formatLocation":1602510872130}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872130, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



const formatPosition = (pos) => {
	if(pos === null)
		return "";
	const typeOfPos = typeof pos;
	switch(typeOfPos) {
		case "string":
			return pos;
		case "number":
			return `${pos}`;
		case "object":
			if(typeof pos.line === "number" && typeof pos.column === "number")
				return `${pos.line}:${pos.column}`;
			else if(typeof pos.line === "number")
				return `${pos.line}:?`;
			else if(typeof pos.index === "number")
				return `+${pos.index}`;
			else
				return "";
		default:
			return "";
	}
};

const formatLocation = (loc) => {
	if(loc === null)
		return "";
	const typeOfLoc = typeof loc;
	switch(typeOfLoc) {
		case "string":
			return loc;
		case "number":
			return `${loc}`;
		case "object":
			if(loc.start && loc.end) {
				if(typeof loc.start.line === "number" && typeof loc.end.line === "number" && typeof loc.end.column === "number" && loc.start.line === loc.end.line)
					return `${formatPosition(loc.start)}-${loc.end.column}`;
				return `${formatPosition(loc.start)}-${formatPosition(loc.end)}`;
			}
			if(loc.start)
				return formatPosition(loc.start);
			return formatPosition(loc);
		default:
			return "";
	}
};

module.exports = formatLocation;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872131, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");
const formatLocation = require("./formatLocation");

module.exports = class ModuleDependencyError extends WebpackError {
	constructor(module, err, loc) {
		super();

		this.name = "ModuleDependencyError";
		this.message = `${formatLocation(loc)} ${err.message}`;
		this.details = err.stack.split("\n").slice(1).join("\n");
		this.origin = this.module = module;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
};

}, function(modId) { var map = {"./WebpackError":1602510872127,"./formatLocation":1602510872130}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872132, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const util = require("util");

const DependenciesBlock = require("./DependenciesBlock");
const ModuleReason = require("./ModuleReason");
const SortableSet = require("./util/SortableSet");
const Template = require("./Template");

let debugId = 1000;

const sortById = (a, b) => {
	return a.id - b.id;
};

const sortByDebugId = (a, b) => {
	return a.debugId - b.debugId;
};

class Module extends DependenciesBlock {

	constructor() {
		super();
		this.context = null;
		this.reasons = [];
		this.debugId = debugId++;
		this.id = null;
		this.portableId = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this.used = null;
		this.usedExports = null;
		this.providedExports = null;
		this._chunks = new SortableSet(undefined, sortById);
		this._chunksDebugIdent = undefined;
		this.warnings = [];
		this.dependenciesWarnings = [];
		this.errors = [];
		this.dependenciesErrors = [];
		this.strict = false;
		this.meta = {};
		this.optimizationBailout = [];
	}

	disconnect() {
		this.reasons.length = 0;
		this.id = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this.used = null;
		this.usedExports = null;
		this.providedExports = null;
		this._chunks.clear();
		this._chunksDebugIdent = undefined;
		this.optimizationBailout.length = 0;
		super.disconnect();
	}

	unseal() {
		this.id = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this._chunks.clear();
		this._chunksDebugIdent = undefined;
		super.unseal();
	}

	setChunks(chunks) {
		this._chunks = new SortableSet(chunks, sortById);
		this._chunksDebugIdent = undefined;
	}

	addChunk(chunk) {
		this._chunks.add(chunk);
		this._chunksDebugIdent = undefined;
	}

	removeChunk(chunk) {
		if(this._chunks.delete(chunk)) {
			this._chunksDebugIdent = undefined;
			chunk.removeModule(this);
			return true;
		}
		return false;
	}

	isInChunk(chunk) {
		return this._chunks.has(chunk);
	}

	getChunkIdsIdent() {
		if(this._chunksDebugIdent !== undefined) return this._chunksDebugIdent;
		this._chunks.sortWith(sortByDebugId);
		const chunks = this._chunks;
		const list = [];
		for(const chunk of chunks) {
			const debugId = chunk.debugId;

			if(typeof debugId !== "number") {
				return this._chunksDebugIdent = null;
			}

			list.push(debugId);
		}

		return this._chunksDebugIdent = list.join(",");
	}

	forEachChunk(fn) {
		this._chunks.forEach(fn);
	}

	mapChunks(fn) {
		return Array.from(this._chunks, fn);
	}

	getChunks() {
		return Array.from(this._chunks);
	}

	getNumberOfChunks() {
		return this._chunks.size;
	}

	hasEqualsChunks(otherModule) {
		if(this._chunks.size !== otherModule._chunks.size) return false;
		this._chunks.sortWith(sortByDebugId);
		otherModule._chunks.sortWith(sortByDebugId);
		const a = this._chunks[Symbol.iterator]();
		const b = otherModule._chunks[Symbol.iterator]();
		while(true) { // eslint-disable-line
			const aItem = a.next();
			const bItem = b.next();
			if(aItem.done) return true;
			if(aItem.value !== bItem.value) return false;
		}
	}

	addReason(module, dependency) {
		this.reasons.push(new ModuleReason(module, dependency));
	}

	removeReason(module, dependency) {
		for(let i = 0; i < this.reasons.length; i++) {
			let r = this.reasons[i];
			if(r.module === module && r.dependency === dependency) {
				this.reasons.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	hasReasonForChunk(chunk) {
		for(let i = 0; i < this.reasons.length; i++) {
			if(this.reasons[i].hasChunk(chunk))
				return true;
		}
		return false;
	}

	rewriteChunkInReasons(oldChunk, newChunks) {
		for(let i = 0; i < this.reasons.length; i++) {
			this.reasons[i].rewriteChunks(oldChunk, newChunks);
		}
	}

	isUsed(exportName) {
		if(this.used === null) return exportName;
		if(!exportName) return !!this.used;
		if(!this.used) return false;
		if(!this.usedExports) return false;
		if(this.usedExports === true) return exportName;
		let idx = this.usedExports.indexOf(exportName);
		if(idx < 0) return false;
		if(this.isProvided(exportName))
			return Template.numberToIdentifer(idx);
		return exportName;
	}

	isProvided(exportName) {
		if(!Array.isArray(this.providedExports))
			return null;
		return this.providedExports.indexOf(exportName) >= 0;
	}

	toString() {
		return `Module[${this.id || this.debugId}]`;
	}

	needRebuild(fileTimestamps, contextTimestamps) {
		return true;
	}

	updateHash(hash) {
		hash.update(this.id + "" + this.used);
		hash.update(JSON.stringify(this.usedExports));
		super.updateHash(hash);
	}

	sortItems(sortChunks) {
		super.sortItems();
		if(sortChunks)
			this._chunks.sort();
		this.reasons.sort((a, b) => sortById(a.module, b.module));
		if(Array.isArray(this.usedExports)) {
			this.usedExports.sort();
		}
	}

	unbuild() {
		this.disconnect();
	}
}

Object.defineProperty(Module.prototype, "entry", {
	configurable: false,
	get() {
		throw new Error("Module.entry was removed. Use Chunk.entryModule");
	},
	set() {
		throw new Error("Module.entry was removed. Use Chunk.entryModule");
	}
});

Object.defineProperty(Module.prototype, "chunks", {
	configurable: false,
	get: util.deprecate(function() {
		return Array.from(this._chunks);
	}, "Module.chunks: Use Module.forEachChunk/mapChunks/getNumberOfChunks/isInChunk/addChunk/removeChunk instead"),
	set() {
		throw new Error("Readonly. Use Module.addChunk/removeChunk to modify chunks.");
	}
});

Module.prototype.identifier = null;
Module.prototype.readableIdentifier = null;
Module.prototype.build = null;
Module.prototype.source = null;
Module.prototype.size = null;
Module.prototype.nameForCondition = null;

module.exports = Module;

}, function(modId) { var map = {"./DependenciesBlock":1602510872133,"./ModuleReason":1602510872135,"./util/SortableSet":1602510872136,"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872133, function(require, module, exports) {
/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */


const DependenciesBlockVariable = require("./DependenciesBlockVariable");

function disconnect(i) {
	i.disconnect();
}

function unseal(i) {
	i.unseal();
}

class DependenciesBlock {
	constructor() {
		this.dependencies = [];
		this.blocks = [];
		this.variables = [];
	}

	addBlock(block) {
		this.blocks.push(block);
		block.parent = this;
	}

	addVariable(name, expression, dependencies) {
		for(let v of this.variables) {
			if(v.name === name && v.expression === expression) {
				return;
			}
		}
		this.variables.push(new DependenciesBlockVariable(name, expression, dependencies));
	}

	addDependency(dependency) {
		this.dependencies.push(dependency);
	}

	updateHash(hash) {
		function updateHash(i) {
			i.updateHash(hash);
		}

		this.dependencies.forEach(updateHash);
		this.blocks.forEach(updateHash);
		this.variables.forEach(updateHash);
	}

	disconnect() {
		this.dependencies.forEach(disconnect);
		this.blocks.forEach(disconnect);
		this.variables.forEach(disconnect);
	}

	unseal() {
		this.blocks.forEach(unseal);
	}

	hasDependencies(filter) {
		if(filter) {
			if(this.dependencies.some(filter)) {
				return true;
			}
		} else {
			if(this.dependencies.length > 0) {
				return true;
			}
		}

		return this.blocks.concat(this.variables).some(item => item.hasDependencies(filter));
	}

	sortItems() {
		this.blocks.forEach(block => block.sortItems());
	}
}

module.exports = DependenciesBlock;

}, function(modId) { var map = {"./DependenciesBlockVariable":1602510872134}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872134, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ReplaceSource = require("webpack-sources").ReplaceSource;
const RawSource = require("webpack-sources").RawSource;

class DependenciesBlockVariable {
	constructor(name, expression, dependencies) {
		this.name = name;
		this.expression = expression;
		this.dependencies = dependencies || [];
	}

	updateHash(hash) {
		hash.update(this.name);
		hash.update(this.expression);
		this.dependencies.forEach(d => {
			d.updateHash(hash);
		});
	}

	expressionSource(dependencyTemplates, outputOptions, requestShortener) {
		const source = new ReplaceSource(new RawSource(this.expression));
		this.dependencies.forEach(dep => {
			const template = dependencyTemplates.get(dep.constructor);
			if(!template) throw new Error(`No template for dependency: ${dep.constructor.name}`);
			template.apply(dep, source, outputOptions, requestShortener, dependencyTemplates);
		});
		return source;
	}

	disconnect() {
		this.dependencies.forEach(d => {
			d.disconnect();
		});
	}

	hasDependencies(filter) {
		if(filter) {
			if(this.dependencies.some(filter)) return true;
		} else {
			if(this.dependencies.length > 0) return true;
		}
		return false;
	}
}

module.exports = DependenciesBlockVariable;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872135, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const util = require("util");

class ModuleReason {
	constructor(module, dependency) {
		this.module = module;
		this.dependency = dependency;
		this._chunks = null;
	}

	hasChunk(chunk) {
		if(this._chunks) {
			if(this._chunks.has(chunk))
				return true;
		} else if(this.module._chunks.has(chunk))
			return true;
		return false;
	}

	rewriteChunks(oldChunk, newChunks) {
		if(!this._chunks) {
			if(!this.module._chunks.has(oldChunk))
				return;
			this._chunks = new Set(this.module._chunks);
		}
		if(this._chunks.has(oldChunk)) {
			this._chunks.delete(oldChunk);
			for(let i = 0; i < newChunks.length; i++) {
				this._chunks.add(newChunks[i]);
			}
		}
	}
}

Object.defineProperty(ModuleReason.prototype, "chunks", {
	configurable: false,
	get: util.deprecate(function() {
		return this._chunks ? Array.from(this._chunks) : null;
	}, "ModuleReason.chunks: Use ModuleReason.hasChunk/rewriteChunks instead"),
	set() {
		throw new Error("Readonly. Use ModuleReason.rewriteChunks to modify chunks.");
	}
});

module.exports = ModuleReason;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872136, function(require, module, exports) {


module.exports = class SortableSet extends Set {

	constructor(initialIterable, defaultSort) {
		super(initialIterable);
		this._sortFn = defaultSort;
		this._lastActiveSortFn = null;
	}

	/**
	 * @param {any} value - value to add to set
	 * @returns {SortableSet} - returns itself
	 */
	add(value) {
		this._lastActiveSortFn = null;
		super.add(value);
		return this;
	}

	/**
	 * @param {Function} sortFn - function to sort the set
	 * @returns {void}
	 */
	sortWith(sortFn) {
		if(this.size === 0 || sortFn === this._lastActiveSortFn) {
			// already sorted - nothing to do
			return;
		}

		const sortedArray = Array.from(this).sort(sortFn);
		super.clear();
		for(let i = 0; i < sortedArray.length; i += 1) {
			this.add(sortedArray[i]);
		}
		this._lastActiveSortFn = sortFn;
	}

	/**
	 * @returns {void}
	 */
	sort() {
		this.sortWith(this._sortFn);
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872137, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Tapable = require("tapable");
const ConcatSource = require("webpack-sources").ConcatSource;

const START_LOWERCASE_ALPHABET_CODE = "a".charCodeAt(0);
const START_UPPERCASE_ALPHABET_CODE = "A".charCodeAt(0);
const DELTA_A_TO_Z = "z".charCodeAt(0) - START_LOWERCASE_ALPHABET_CODE + 1;
const FUNCTION_CONTENT_REGEX = /^function\s?\(\)\s?\{\n?|\n?\}$/g;
const INDENT_MULTILINE_REGEX = /^\t/mg;
const IDENTIFIER_NAME_REPLACE_REGEX = /^[^a-zA-Z$_]/;
const IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX = /[^a-zA-Z0-9$_]/g;
const PATH_NAME_NORMALIZE_REPLACE_REGEX = /[^a-zA-Z0-9_!§$()=\-^°]+/g;
const MATCH_PADDED_HYPHENS_REPLACE_REGEX = /^-|-$/g;

module.exports = class Template extends Tapable {
	constructor(outputOptions) {
		super();
		this.outputOptions = outputOptions || {};
	}

	static getFunctionContent(fn) {
		return fn.toString().replace(FUNCTION_CONTENT_REGEX, "").replace(INDENT_MULTILINE_REGEX, "");
	}

	static toIdentifier(str) {
		if(typeof str !== "string") return "";
		return str.replace(IDENTIFIER_NAME_REPLACE_REGEX, "_").replace(IDENTIFIER_ALPHA_NUMERIC_NAME_REPLACE_REGEX, "_");
	}

	static toPath(str) {
		if(typeof str !== "string") return "";
		return str.replace(PATH_NAME_NORMALIZE_REPLACE_REGEX, "-").replace(MATCH_PADDED_HYPHENS_REPLACE_REGEX, "");
	}

	// map number to a single character a-z, A-Z or <_ + number> if number is too big
	static numberToIdentifer(n) {
		// lower case
		if(n < DELTA_A_TO_Z) return String.fromCharCode(START_LOWERCASE_ALPHABET_CODE + n);

		// upper case
		n -= DELTA_A_TO_Z;
		if(n < DELTA_A_TO_Z) return String.fromCharCode(START_UPPERCASE_ALPHABET_CODE + n);

		// fall back to _ + number
		n -= DELTA_A_TO_Z;
		return "_" + n;
	}

	indent(str) {
		if(Array.isArray(str)) {
			return str.map(this.indent.bind(this)).join("\n");
		} else {
			str = str.trimRight();
			if(!str) return "";
			var ind = (str[0] === "\n" ? "" : "\t");
			return ind + str.replace(/\n([^\n])/g, "\n\t$1");
		}
	}

	prefix(str, prefix) {
		if(Array.isArray(str)) {
			str = str.join("\n");
		}
		str = str.trim();
		if(!str) return "";
		const ind = (str[0] === "\n" ? "" : prefix);
		return ind + str.replace(/\n([^\n])/g, "\n" + prefix + "$1");
	}

	asString(str) {
		if(Array.isArray(str)) {
			return str.join("\n");
		}
		return str;
	}

	getModulesArrayBounds(modules) {
		if(!modules.every(moduleIdIsNumber))
			return false;
		var maxId = -Infinity;
		var minId = Infinity;
		modules.forEach(function(module) {
			if(maxId < module.id) maxId = module.id;
			if(minId > module.id) minId = module.id;
		});
		if(minId < 16 + ("" + minId).length) {
			// add minId x ',' instead of 'Array(minId).concat(...)'
			minId = 0;
		}
		var objectOverhead = modules.map(function(module) {
			var idLength = (module.id + "").length;
			return idLength + 2;
		}).reduce(function(a, b) {
			return a + b;
		}, -1);
		var arrayOverhead = minId === 0 ? maxId : 16 + ("" + minId).length + maxId;
		return arrayOverhead < objectOverhead ? [minId, maxId] : false;
	}

	renderChunkModules(chunk, moduleTemplate, dependencyTemplates, prefix) {
		if(!prefix) prefix = "";
		var source = new ConcatSource();
		if(chunk.getNumberOfModules() === 0) {
			source.add("[]");
			return source;
		}
		var removedModules = chunk.removedModules;
		var allModules = chunk.mapModules(function(module) {
			return {
				id: module.id,
				source: moduleTemplate.render(module, dependencyTemplates, chunk)
			};
		});
		if(removedModules && removedModules.length > 0) {
			removedModules.forEach(function(id) {
				allModules.push({
					id: id,
					source: "false"
				});
			});
		}
		var bounds = this.getModulesArrayBounds(allModules);

		if(bounds) {
			// Render a spare array
			var minId = bounds[0];
			var maxId = bounds[1];
			if(minId !== 0) source.add("Array(" + minId + ").concat(");
			source.add("[\n");
			var modules = {};
			allModules.forEach(function(module) {
				modules[module.id] = module;
			});
			for(var idx = minId; idx <= maxId; idx++) {
				var module = modules[idx];
				if(idx !== minId) source.add(",\n");
				source.add("/* " + idx + " */");
				if(module) {
					source.add("\n");
					source.add(module.source);
				}
			}
			source.add("\n" + prefix + "]");
			if(minId !== 0) source.add(")");
		} else {
			// Render an object
			source.add("{\n");
			allModules
				.sort(stringifyIdSortPredicate)
				.forEach(function(module, idx) {
					if(idx !== 0) source.add(",\n");
					source.add(`\n/***/ ${JSON.stringify(module.id)}:\n`);
					source.add(module.source);
				});
			source.add("\n\n" + prefix + "}");
		}
		return source;
	}
};

function stringifyIdSortPredicate(a, b) {
	var aId = a.id + "";
	var bId = b.id + "";
	if(aId < bId) return -1;
	if(aId > bId) return 1;
	return 0;
}

function moduleIdIsNumber(module) {
	return typeof module.id === "number";
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872138, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const util = require("util");
const compareLocations = require("./compareLocations");
const SortableSet = require("./util/SortableSet");
let debugId = 1000;

const sortById = (a, b) => {
	if(a.id < b.id) return -1;
	if(b.id < a.id) return 1;
	return 0;
};

const sortByIdentifier = (a, b) => {
	if(a.identifier() > b.identifier()) return 1;
	if(a.identifier() < b.identifier()) return -1;
	return 0;
};

class Chunk {

	constructor(name, module, loc) {
		this.id = null;
		this.ids = null;
		this.debugId = debugId++;
		this.name = name;
		this._modules = new SortableSet(undefined, sortByIdentifier);
		this.entrypoints = [];
		this.chunks = [];
		this.parents = [];
		this.blocks = [];
		this.origins = [];
		this.files = [];
		this.rendered = false;
		if(module) {
			this.origins.push({
				module,
				loc,
				name
			});
		}
	}

	get entry() {
		throw new Error("Chunk.entry was removed. Use hasRuntime()");
	}

	set entry(data) {
		throw new Error("Chunk.entry was removed. Use hasRuntime()");
	}

	get initial() {
		throw new Error("Chunk.initial was removed. Use isInitial()");
	}

	set initial(data) {
		throw new Error("Chunk.initial was removed. Use isInitial()");
	}

	hasRuntime() {
		if(this.entrypoints.length === 0) return false;
		return this.entrypoints[0].chunks[0] === this;
	}

	isInitial() {
		return this.entrypoints.length > 0;
	}

	hasEntryModule() {
		return !!this.entryModule;
	}

	addToCollection(collection, item) {
		if(item === this) {
			return false;
		}

		if(collection.indexOf(item) > -1) {
			return false;
		}

		collection.push(item);
		return true;
	}

	addChunk(chunk) {
		return this.addToCollection(this.chunks, chunk);
	}

	addParent(parentChunk) {
		return this.addToCollection(this.parents, parentChunk);
	}

	addModule(module) {
		if(!this._modules.has(module)) {
			this._modules.add(module);
			return true;
		}
		return false;
	}

	addBlock(block) {
		return this.addToCollection(this.blocks, block);
	}

	removeModule(module) {
		if(this._modules.delete(module)) {
			module.removeChunk(this);
			return true;
		}
		return false;
	}

	removeChunk(chunk) {
		const idx = this.chunks.indexOf(chunk);
		if(idx >= 0) {
			this.chunks.splice(idx, 1);
			chunk.removeParent(this);
			return true;
		}
		return false;
	}

	removeParent(chunk) {
		const idx = this.parents.indexOf(chunk);
		if(idx >= 0) {
			this.parents.splice(idx, 1);
			chunk.removeChunk(this);
			return true;
		}
		return false;
	}

	addOrigin(module, loc) {
		this.origins.push({
			module,
			loc,
			name: this.name
		});
	}

	setModules(modules) {
		this._modules = new SortableSet(modules, sortByIdentifier);
	}

	getNumberOfModules() {
		return this._modules.size;
	}

	get modulesIterable() {
		return this._modules;
	}

	forEachModule(fn) {
		this._modules.forEach(fn);
	}

	mapModules(fn) {
		return Array.from(this._modules, fn);
	}

	compareTo(otherChunk) {
		this._modules.sort();
		otherChunk._modules.sort();
		if(this._modules.size > otherChunk._modules.size) return -1;
		if(this._modules.size < otherChunk._modules.size) return 1;
		const a = this._modules[Symbol.iterator]();
		const b = otherChunk._modules[Symbol.iterator]();
		while(true) { // eslint-disable-line
			const aItem = a.next();
			const bItem = b.next();
			if(aItem.done) return 0;
			const aModuleIdentifier = aItem.value.identifier();
			const bModuleIdentifier = bItem.value.identifier();
			if(aModuleIdentifier > bModuleIdentifier) return -1;
			if(aModuleIdentifier < bModuleIdentifier) return 1;
		}
	}

	containsModule(module) {
		return this._modules.has(module);
	}

	getModules() {
		return Array.from(this._modules);
	}

	getModulesIdent() {
		this._modules.sort();
		let str = "";
		this._modules.forEach(m => {
			str += m.identifier() + "#";
		});
		return str;
	}

	remove(reason) {
		// cleanup modules
		// Array.from is used here to create a clone, because removeChunk modifies this._modules
		Array.from(this._modules).forEach(module => {
			module.removeChunk(this);
		});

		// cleanup parents
		this.parents.forEach(parentChunk => {
			// remove this chunk from its parents
			const idx = parentChunk.chunks.indexOf(this);
			if(idx >= 0) {
				parentChunk.chunks.splice(idx, 1);
			}

			// cleanup "sub chunks"
			this.chunks.forEach(chunk => {
				/**
				 * remove this chunk as "intermediary" and connect
				 * it "sub chunks" and parents directly
				 */
				// add parent to each "sub chunk"
				chunk.addParent(parentChunk);
				// add "sub chunk" to parent
				parentChunk.addChunk(chunk);
			});
		});

		/**
		 * we need to iterate again over the chunks
		 * to remove this from the chunks parents.
		 * This can not be done in the above loop
		 * as it is not garuanteed that `this.parents` contains anything.
		 */
		this.chunks.forEach(chunk => {
			// remove this as parent of every "sub chunk"
			const idx = chunk.parents.indexOf(this);
			if(idx >= 0) {
				chunk.parents.splice(idx, 1);
			}
		});

		// cleanup blocks
		this.blocks.forEach(block => {
			const idx = block.chunks.indexOf(this);
			if(idx >= 0) {
				block.chunks.splice(idx, 1);
				if(block.chunks.length === 0) {
					block.chunks = null;
					block.chunkReason = reason;
				}
			}
		});
	}

	moveModule(module, otherChunk) {
		module.removeChunk(this);
		module.addChunk(otherChunk);
		otherChunk.addModule(module);
		module.rewriteChunkInReasons(this, [otherChunk]);
	}

	replaceChunk(oldChunk, newChunk) {
		const idx = this.chunks.indexOf(oldChunk);
		if(idx >= 0) {
			this.chunks.splice(idx, 1);
		}
		if(this !== newChunk && newChunk.addParent(this)) {
			this.addChunk(newChunk);
		}
	}

	replaceParentChunk(oldParentChunk, newParentChunk) {
		const idx = this.parents.indexOf(oldParentChunk);
		if(idx >= 0) {
			this.parents.splice(idx, 1);
		}
		if(this !== newParentChunk && newParentChunk.addChunk(this)) {
			this.addParent(newParentChunk);
		}
	}

	integrate(otherChunk, reason) {
		if(!this.canBeIntegrated(otherChunk)) {
			return false;
		}

		// Array.from is used here to create a clone, because moveModule modifies otherChunk._modules
		const otherChunkModules = Array.from(otherChunk._modules);
		otherChunkModules.forEach(module => otherChunk.moveModule(module, this));
		otherChunk._modules.clear();

		otherChunk.parents.forEach(parentChunk => parentChunk.replaceChunk(otherChunk, this));
		otherChunk.parents.length = 0;

		otherChunk.chunks.forEach(chunk => chunk.replaceParentChunk(otherChunk, this));
		otherChunk.chunks.length = 0;

		otherChunk.blocks.forEach(b => {
			b.chunks = b.chunks ? b.chunks.map(c => {
				return c === otherChunk ? this : c;
			}) : [this];
			b.chunkReason = reason;
			this.addBlock(b);
		});
		otherChunk.blocks.length = 0;

		otherChunk.origins.forEach(origin => {
			this.origins.push(origin);
		});
		this.blocks.forEach(b => {
			b.chunkReason = reason;
		});
		this.origins.forEach(origin => {
			if(!origin.reasons) {
				origin.reasons = [reason];
			} else if(origin.reasons[0] !== reason) {
				origin.reasons.unshift(reason);
			}
		});
		this.chunks = this.chunks.filter(chunk => {
			return chunk !== otherChunk && chunk !== this;
		});
		this.parents = this.parents.filter(parentChunk => {
			return parentChunk !== otherChunk && parentChunk !== this;
		});
		return true;
	}

	split(newChunk) {
		this.blocks.forEach(block => {
			newChunk.blocks.push(block);
			block.chunks.push(newChunk);
		});
		this.chunks.forEach(chunk => {
			newChunk.chunks.push(chunk);
			chunk.parents.push(newChunk);
		});
		this.parents.forEach(parentChunk => {
			parentChunk.chunks.push(newChunk);
			newChunk.parents.push(parentChunk);
		});
		this.entrypoints.forEach(entrypoint => {
			entrypoint.insertChunk(newChunk, this);
		});
	}

	isEmpty() {
		return this._modules.size === 0;
	}

	updateHash(hash) {
		hash.update(`${this.id} `);
		hash.update(this.ids ? this.ids.join(",") : "");
		hash.update(`${this.name || ""} `);
		this._modules.forEach(m => m.updateHash(hash));
	}

	canBeIntegrated(otherChunk) {
		if(otherChunk.isInitial()) {
			return false;
		}
		if(this.isInitial()) {
			if(otherChunk.parents.length !== 1 || otherChunk.parents[0] !== this) {
				return false;
			}
		}
		return true;
	}

	addMultiplierAndOverhead(size, options) {
		const overhead = typeof options.chunkOverhead === "number" ? options.chunkOverhead : 10000;
		const multiplicator = this.isInitial() ? (options.entryChunkMultiplicator || 10) : 1;

		return size * multiplicator + overhead;
	}

	modulesSize() {
		let count = 0;
		for(const module of this._modules) {
			count += module.size();
		}
		return count;
	}

	size(options) {
		return this.addMultiplierAndOverhead(this.modulesSize(), options);
	}

	integratedSize(otherChunk, options) {
		// Chunk if it's possible to integrate this chunk
		if(!this.canBeIntegrated(otherChunk)) {
			return false;
		}

		let integratedModulesSize = this.modulesSize();
		// only count modules that do not exist in this chunk!
		for(const otherModule of otherChunk._modules) {
			if(!this._modules.has(otherModule)) {
				integratedModulesSize += otherModule.size();
			}
		}

		return this.addMultiplierAndOverhead(integratedModulesSize, options);
	}

	getChunkMaps(includeInitial, realHash) {
		const chunksProcessed = [];
		const chunkHashMap = {};
		const chunkNameMap = {};
		(function addChunk(chunk) {
			if(chunksProcessed.indexOf(chunk) >= 0) return;
			chunksProcessed.push(chunk);
			if(!chunk.isInitial() || includeInitial) {
				chunkHashMap[chunk.id] = realHash ? chunk.hash : chunk.renderedHash;
				if(chunk.name)
					chunkNameMap[chunk.id] = chunk.name;
			}
			chunk.chunks.forEach(addChunk);
		}(this));
		return {
			hash: chunkHashMap,
			name: chunkNameMap
		};
	}

	sortModules(sortByFn) {
		this._modules.sortWith(sortByFn || sortById);
	}

	sortItems() {
		this.sortModules();
		this.origins.sort((a, b) => {
			const aIdent = a.module.identifier();
			const bIdent = b.module.identifier();
			if(aIdent < bIdent) return -1;
			if(aIdent > bIdent) return 1;
			return compareLocations(a.loc, b.loc);
		});
		this.origins.forEach(origin => {
			if(origin.reasons)
				origin.reasons.sort();
		});
		this.parents.sort(sortById);
		this.chunks.sort(sortById);
	}

	toString() {
		return `Chunk[${Array.from(this._modules).join()}]`;
	}

	checkConstraints() {
		const chunk = this;
		chunk.chunks.forEach((child, idx) => {
			if(chunk.chunks.indexOf(child) !== idx)
				throw new Error(`checkConstraints: duplicate child in chunk ${chunk.debugId} ${child.debugId}`);
			if(child.parents.indexOf(chunk) < 0)
				throw new Error(`checkConstraints: child missing parent ${chunk.debugId} -> ${child.debugId}`);
		});
		chunk.parents.forEach((parentChunk, idx) => {
			if(chunk.parents.indexOf(parentChunk) !== idx)
				throw new Error(`checkConstraints: duplicate parent in chunk ${chunk.debugId} ${parentChunk.debugId}`);
			if(parentChunk.chunks.indexOf(chunk) < 0)
				throw new Error(`checkConstraints: parent missing child ${parentChunk.debugId} <- ${chunk.debugId}`);
		});
	}
}

Object.defineProperty(Chunk.prototype, "modules", {
	configurable: false,
	get: util.deprecate(function() {
		return Array.from(this._modules);
	}, "Chunk.modules is deprecated. Use Chunk.getNumberOfModules/mapModules/forEachModule/containsModule instead."),
	set: util.deprecate(function(value) {
		this.setModules(value);
	}, "Chunk.modules is deprecated. Use Chunk.addModule/removeModule instead.")
});

module.exports = Chunk;

}, function(modId) { var map = {"./compareLocations":1602510872139,"./util/SortableSet":1602510872136}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872139, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

module.exports = function compareLocations(a, b) {
	if(typeof a === "string") {
		if(typeof b === "string") {
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		} else if(typeof b === "object") {
			return 1;
		} else {
			return 0;
		}
	} else if(typeof a === "object") {
		if(typeof b === "string") {
			return -1;
		} else if(typeof b === "object") {
			if(a.start && b.start) {
				const ap = a.start;
				const bp = b.start;
				if(ap.line < bp.line) return -1;
				if(ap.line > bp.line) return 1;
				if(ap.column < bp.column) return -1;
				if(ap.column > bp.column) return 1;
			}
			if(a.index < b.index) return -1;
			if(a.index > b.index) return 1;
			return 0;
		} else {
			return 0;
		}
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872140, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class Entrypoint {
	constructor(name) {
		this.name = name;
		this.chunks = [];
	}

	unshiftChunk(chunk) {
		this.chunks.unshift(chunk);
		chunk.entrypoints.push(this);
	}

	insertChunk(chunk, before) {
		const idx = this.chunks.indexOf(before);
		if(idx >= 0) {
			this.chunks.splice(idx, 0, chunk);
		} else {
			throw new Error("before chunk not found");
		}
		chunk.entrypoints.push(this);
	}

	getFiles() {
		const files = [];

		for(let chunkIdx = 0; chunkIdx < this.chunks.length; chunkIdx++) {
			for(let fileIdx = 0; fileIdx < this.chunks[chunkIdx].files.length; fileIdx++) {
				if(files.indexOf(this.chunks[chunkIdx].files[fileIdx]) === -1) {
					files.push(this.chunks[chunkIdx].files[fileIdx]);
				}
			}
		}

		return files;
	}
}

module.exports = Entrypoint;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872141, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;
const OriginalSource = require("webpack-sources").OriginalSource;
const PrefixSource = require("webpack-sources").PrefixSource;
const Template = require("./Template");

// require function shortcuts:
// __webpack_require__.s = the module id of the entry point
// __webpack_require__.c = the module cache
// __webpack_require__.m = the module functions
// __webpack_require__.p = the bundle public path
// __webpack_require__.i = the identity function used for harmony imports
// __webpack_require__.e = the chunk ensure function
// __webpack_require__.d = the exported propery define getter function
// __webpack_require__.o = Object.prototype.hasOwnProperty.call
// __webpack_require__.n = compatibility get default export
// __webpack_require__.h = the webpack hash
// __webpack_require__.oe = the uncatched error handler for the webpack runtime
// __webpack_require__.nc = the script nonce

module.exports = class MainTemplate extends Template {
	constructor(outputOptions) {
		super(outputOptions);
		this.plugin("startup", (source, chunk, hash) => {
			const buf = [];
			if(chunk.entryModule) {
				buf.push("// Load entry module and return exports");
				buf.push(`return ${this.renderRequireFunctionForModule(hash, chunk, JSON.stringify(chunk.entryModule.id))}(${this.requireFn}.s = ${JSON.stringify(chunk.entryModule.id)});`);
			}
			return this.asString(buf);
		});
		this.plugin("render", (bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
			const source = new ConcatSource();
			source.add("/******/ (function(modules) { // webpackBootstrap\n");
			source.add(new PrefixSource("/******/", bootstrapSource));
			source.add("/******/ })\n");
			source.add("/************************************************************************/\n");
			source.add("/******/ (");
			const modules = this.renderChunkModules(chunk, moduleTemplate, dependencyTemplates, "/******/ ");
			source.add(this.applyPluginsWaterfall("modules", modules, chunk, hash, moduleTemplate, dependencyTemplates));
			source.add(")");
			return source;
		});
		this.plugin("local-vars", (source, chunk, hash) => {
			return this.asString([
				source,
				"// The module cache",
				"var installedModules = {};"
			]);
		});
		this.plugin("require", (source, chunk, hash) => {
			return this.asString([
				source,
				"// Check if module is in cache",
				"if(installedModules[moduleId]) {",
				this.indent("return installedModules[moduleId].exports;"),
				"}",
				"// Create a new module (and put it into the cache)",
				"var module = installedModules[moduleId] = {",
				this.indent(this.applyPluginsWaterfall("module-obj", "", chunk, hash, "moduleId")),
				"};",
				"",
				this.asString(outputOptions.strictModuleExceptionHandling ? [
					"// Execute the module function",
					"var threw = true;",
					"try {",
					this.indent([
						`modules[moduleId].call(module.exports, module, module.exports, ${this.renderRequireFunctionForModule(hash, chunk, "moduleId")});`,
						"threw = false;"
					]),
					"} finally {",
					this.indent([
						"if(threw) delete installedModules[moduleId];"
					]),
					"}"
				] : [
					"// Execute the module function",
					`modules[moduleId].call(module.exports, module, module.exports, ${this.renderRequireFunctionForModule(hash, chunk, "moduleId")});`,
				]),
				"",
				"// Flag the module as loaded",
				"module.l = true;",
				"",
				"// Return the exports of the module",
				"return module.exports;"
			]);
		});
		this.plugin("module-obj", (source, chunk, hash, varModuleId) => {
			return this.asString([
				"i: moduleId,",
				"l: false,",
				"exports: {}"
			]);
		});
		this.plugin("require-extensions", (source, chunk, hash) => {
			const buf = [];
			const chunkMaps = chunk.getChunkMaps();
			// Check if there are non initial chunks which need to be imported using require-ensure
			if(Object.keys(chunkMaps.hash).length) {
				buf.push("// This file contains only the entry chunk.");
				buf.push("// The chunk loading function for additional chunks");
				buf.push(`${this.requireFn}.e = function requireEnsure(chunkId) {`);
				buf.push(this.indent(this.applyPluginsWaterfall("require-ensure", "throw new Error('Not chunk loading available');", chunk, hash, "chunkId")));
				buf.push("};");
			}
			buf.push("");
			buf.push("// expose the modules object (__webpack_modules__)");
			buf.push(`${this.requireFn}.m = modules;`);

			buf.push("");
			buf.push("// expose the module cache");
			buf.push(`${this.requireFn}.c = installedModules;`);

			buf.push("");
			buf.push("// define getter function for harmony exports");
			buf.push(`${this.requireFn}.d = function(exports, name, getter) {`);
			buf.push(this.indent([
				`if(!${this.requireFn}.o(exports, name)) {`,
				this.indent([
					"Object.defineProperty(exports, name, {",
					this.indent([
						"configurable: false,",
						"enumerable: true,",
						"get: getter"
					]),
					"});"
				]),
				"}"
			]));
			buf.push("};");

			buf.push("");
			buf.push("// getDefaultExport function for compatibility with non-harmony modules");
			buf.push(this.requireFn + ".n = function(module) {");
			buf.push(this.indent([
				"var getter = module && module.__esModule ?",
				this.indent([
					"function getDefault() { return module['default']; } :",
					"function getModuleExports() { return module; };"
				]),
				`${this.requireFn}.d(getter, 'a', getter);`,
				"return getter;"
			]));
			buf.push("};");

			buf.push("");
			buf.push("// Object.prototype.hasOwnProperty.call");
			buf.push(`${this.requireFn}.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };`);

			const publicPath = this.getPublicPath({
				hash: hash
			});
			buf.push("");
			buf.push("// __webpack_public_path__");
			buf.push(`${this.requireFn}.p = ${JSON.stringify(publicPath)};`);
			return this.asString(buf);
		});

		this.requireFn = "__webpack_require__";
	}

	render(hash, chunk, moduleTemplate, dependencyTemplates) {
		const buf = [];
		buf.push(this.applyPluginsWaterfall("bootstrap", "", chunk, hash, moduleTemplate, dependencyTemplates));
		buf.push(this.applyPluginsWaterfall("local-vars", "", chunk, hash));
		buf.push("");
		buf.push("// The require function");
		buf.push(`function ${this.requireFn}(moduleId) {`);
		buf.push(this.indent(this.applyPluginsWaterfall("require", "", chunk, hash)));
		buf.push("}");
		buf.push("");
		buf.push(this.asString(this.applyPluginsWaterfall("require-extensions", "", chunk, hash)));
		buf.push("");
		buf.push(this.asString(this.applyPluginsWaterfall("startup", "", chunk, hash)));
		let source = this.applyPluginsWaterfall("render", new OriginalSource(this.prefix(buf, " \t") + "\n", `webpack/bootstrap ${hash}`), chunk, hash, moduleTemplate, dependencyTemplates);
		if(chunk.hasEntryModule()) {
			source = this.applyPluginsWaterfall("render-with-entry", source, chunk, hash);
		}
		if(!source) throw new Error("Compiler error: MainTemplate plugin 'render' should return something");
		chunk.rendered = true;
		return new ConcatSource(source, ";");
	}

	renderRequireFunctionForModule(hash, chunk, varModuleId) {
		return this.applyPluginsWaterfall("module-require", this.requireFn, chunk, hash, varModuleId);
	}

	renderAddModule(hash, chunk, varModuleId, varModule) {
		return this.applyPluginsWaterfall("add-module", `modules[${varModuleId}] = ${varModule};`, chunk, hash, varModuleId, varModule);
	}

	renderCurrentHashCode(hash, length) {
		length = length || Infinity;
		return this.applyPluginsWaterfall("current-hash", JSON.stringify(hash.substr(0, length)), length);
	}

	entryPointInChildren(chunk) {
		const checkChildren = (chunk, alreadyCheckedChunks) => {
			return chunk.chunks.some((child) => {
				if(alreadyCheckedChunks.indexOf(child) >= 0) return;
				alreadyCheckedChunks.push(child);
				return child.hasEntryModule() || checkChildren(child, alreadyCheckedChunks);
			});
		};
		return checkChildren(chunk, []);
	}

	getPublicPath(options) {
		return this.applyPluginsWaterfall("asset-path", this.outputOptions.publicPath || "", options);
	}

	updateHash(hash) {
		hash.update("maintemplate");
		hash.update("3");
		hash.update(this.outputOptions.publicPath + "");
		this.applyPlugins("hash", hash);
	}

	updateHashForChunk(hash, chunk) {
		this.updateHash(hash);
		this.applyPlugins("hash-for-chunk", hash, chunk);
	}

	useChunkHash(chunk) {
		const paths = this.applyPluginsWaterfall("global-hash-paths", []);
		return !this.applyPluginsBailResult("global-hash", chunk, paths);
	}
};

}, function(modId) { var map = {"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872142, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;
const Template = require("./Template");

module.exports = class ChunkTemplate extends Template {
	constructor(outputOptions) {
		super(outputOptions);
	}

	render(chunk, moduleTemplate, dependencyTemplates) {
		const moduleSources = this.renderChunkModules(chunk, moduleTemplate, dependencyTemplates);
		const core = this.applyPluginsWaterfall("modules", moduleSources, chunk, moduleTemplate, dependencyTemplates);
		let source = this.applyPluginsWaterfall("render", core, chunk, moduleTemplate, dependencyTemplates);
		if(chunk.hasEntryModule()) {
			source = this.applyPluginsWaterfall("render-with-entry", source, chunk);
		}
		chunk.rendered = true;
		return new ConcatSource(source, ";");
	}

	updateHash(hash) {
		hash.update("ChunkTemplate");
		hash.update("2");
		this.applyPlugins("hash", hash);
	}

	updateHashForChunk(hash, chunk) {
		this.updateHash(hash);
		this.applyPlugins("hash-for-chunk", hash, chunk);
	}
};

}, function(modId) { var map = {"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872143, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Template = require("./Template");
const Chunk = require("./Chunk");

module.exports = class HotUpdateChunkTemplate extends Template {
	constructor(outputOptions) {
		super(outputOptions);
	}

	render(id, modules, removedModules, hash, moduleTemplate, dependencyTemplates) {
		const hotUpdateChunk = new Chunk();
		hotUpdateChunk.id = id;
		hotUpdateChunk.setModules(modules);
		hotUpdateChunk.removedModules = removedModules;
		const modulesSource = this.renderChunkModules(hotUpdateChunk, moduleTemplate, dependencyTemplates);
		const core = this.applyPluginsWaterfall("modules", modulesSource, modules, removedModules, moduleTemplate, dependencyTemplates);
		const source = this.applyPluginsWaterfall("render", core, modules, removedModules, hash, id, moduleTemplate, dependencyTemplates);
		return source;
	}

	updateHash(hash) {
		hash.update("HotUpdateChunkTemplate");
		hash.update("1");
		this.applyPlugins("hash", hash);
	}
};

}, function(modId) { var map = {"./Template":1602510872137,"./Chunk":1602510872138}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872144, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Template = require("./Template");

module.exports = class ModuleTemplate extends Template {
	constructor(outputOptions) {
		super(outputOptions);
	}
	render(module, dependencyTemplates, chunk) {
		const moduleSource = module.source(dependencyTemplates, this.outputOptions, this.requestShortener);
		const moduleSourcePostModule = this.applyPluginsWaterfall("module", moduleSource, module, chunk, dependencyTemplates);
		const moduleSourcePostRender = this.applyPluginsWaterfall("render", moduleSourcePostModule, module, chunk, dependencyTemplates);
		return this.applyPluginsWaterfall("package", moduleSourcePostRender, module, chunk, dependencyTemplates);
	}
	updateHash(hash) {
		hash.update("1");
		this.applyPlugins("hash", hash);
	}
};

}, function(modId) { var map = {"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872145, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const compareLocations = require("./compareLocations");

class Dependency {
	constructor() {
		this.module = null;
	}

	isEqualResource() {
		return false;
	}

	// Returns the referenced module and export
	getReference() {
		if(!this.module) return null;
		return {
			module: this.module,
			importedNames: true, // true: full object, false: only sideeffects/no export, array of strings: the exports with this names
		};
	}

	// Returns the exported names
	getExports() {
		return null;
	}

	getWarnings() {
		return null;
	}

	getErrors() {
		return null;
	}

	updateHash(hash) {
		hash.update((this.module && this.module.id) + "");
	}

	disconnect() {
		this.module = null;
	}

	// TODO: remove in webpack 3
	compare(a, b) {
		return compareLocations(a.loc, b.loc);
	}
}
Dependency.compare = (a, b) => compareLocations(a.loc, b.loc);

module.exports = Dependency;

}, function(modId) { var map = {"./compareLocations":1602510872139}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872146, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");

class ChunkRenderError extends WebpackError {
	constructor(chunk, file, error) {
		super();

		this.name = "ChunkRenderError";
		this.error = error;
		this.message = error.message;
		this.details = error.stack;
		this.file = file;
		this.chunk = chunk;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ChunkRenderError;

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872147, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Sean Larkin @thelarkinn
*/


const WebpackError = require("./WebpackError");

module.exports = class AsyncDependencyToInitialChunkWarning extends WebpackError {
	constructor(chunkName, module, loc) {
		super();

		this.name = "AsyncDependencyToInitialChunkWarning";
		this.message = `It's not allowed to load an initial chunk on demand. The chunk name "${chunkName}" is already used by an entrypoint.`;
		this.module = module;
		this.origin = module;
		this.originLoc = loc;

		Error.captureStackTrace(this, this.constructor);
	}
};

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872148, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequestShortener = require("./RequestShortener");
const SizeFormatHelpers = require("./SizeFormatHelpers");
const formatLocation = require("./formatLocation");
const identifierUtils = require("./util/identifier");

const optionsOrFallback = function() {
	let optionValues = [];
	optionValues.push.apply(optionValues, arguments);
	return optionValues.find(optionValue => typeof optionValue !== "undefined");
};

class Stats {
	constructor(compilation) {
		this.compilation = compilation;
		this.hash = compilation.hash;
	}

	static filterWarnings(warnings, warningsFilter) {
		// we dont have anything to filter so all warnings can be shown
		if(!warningsFilter) {
			return warnings;
		}

		// create a chain of filters
		// if they return "true" a warning should be surpressed
		const normalizedWarningsFilters = [].concat(warningsFilter).map(filter => {
			if(typeof filter === "string") {
				return warning => warning.indexOf(filter) > -1;
			}

			if(filter instanceof RegExp) {
				return warning => filter.test(warning);
			}

			if(typeof filter === "function") {
				return filter;
			}

			throw new Error(`Can only filter warnings with Strings or RegExps. (Given: ${filter})`);
		});
		return warnings.filter(warning => {
			return !normalizedWarningsFilters.some(check => check(warning));
		});
	}

	hasWarnings() {
		return this.compilation.warnings.length > 0 ||
			this.compilation.children.some(child => child.getStats().hasWarnings());
	}

	hasErrors() {
		return this.compilation.errors.length > 0 ||
			this.compilation.children.some(child => child.getStats().hasErrors());
	}

	// remove a prefixed "!" that can be specified to reverse sort order
	normalizeFieldKey(field) {
		if(field[0] === "!") {
			return field.substr(1);
		}
		return field;
	}

	// if a field is prefixed by a "!" reverse sort order
	sortOrderRegular(field) {
		if(field[0] === "!") {
			return false;
		}
		return true;
	}

	toJson(options, forToString) {
		if(typeof options === "boolean" || typeof options === "string") {
			options = Stats.presetToOptions(options);
		} else if(!options) {
			options = {};
		}

		const optionOrLocalFallback = (v, def) =>
			typeof v !== "undefined" ? v :
			typeof options.all !== "undefined" ? options.all : def;

		const testAgainstGivenOption = (item) => {
			if(typeof item === "string") {
				const regExp = new RegExp(`[\\\\/]${item.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}([\\\\/]|$|!|\\?)`); // eslint-disable-line no-useless-escape
				return ident => regExp.test(ident);
			}
			if(item && typeof item === "object" && typeof item.test === "function")
				return ident => item.test(ident);
			if(typeof item === "function")
				return item;
		};

		const compilation = this.compilation;
		const context = optionsOrFallback(options.context, process.cwd());
		const requestShortener = new RequestShortener(context);
		const showPerformance = optionOrLocalFallback(options.performance, true);
		const showHash = optionOrLocalFallback(options.hash, true);
		const showEnv = optionOrLocalFallback(options.env, false);
		const showVersion = optionOrLocalFallback(options.version, true);
		const showTimings = optionOrLocalFallback(options.timings, true);
		const showAssets = optionOrLocalFallback(options.assets, true);
		const showEntrypoints = optionOrLocalFallback(options.entrypoints, !forToString);
		const showChunks = optionOrLocalFallback(options.chunks, !forToString);
		const showChunkModules = optionOrLocalFallback(options.chunkModules, true);
		const showChunkOrigins = optionOrLocalFallback(options.chunkOrigins, !forToString);
		const showModules = optionOrLocalFallback(options.modules, true);
		const showDepth = optionOrLocalFallback(options.depth, !forToString);
		const showCachedModules = optionOrLocalFallback(options.cached, true);
		const showCachedAssets = optionOrLocalFallback(options.cachedAssets, true);
		const showReasons = optionOrLocalFallback(options.reasons, !forToString);
		const showUsedExports = optionOrLocalFallback(options.usedExports, !forToString);
		const showProvidedExports = optionOrLocalFallback(options.providedExports, !forToString);
		const showOptimizationBailout = optionOrLocalFallback(options.optimizationBailout, !forToString);
		const showChildren = optionOrLocalFallback(options.children, true);
		const showSource = optionOrLocalFallback(options.source, !forToString);
		const showModuleTrace = optionOrLocalFallback(options.moduleTrace, true);
		const showErrors = optionOrLocalFallback(options.errors, true);
		const showErrorDetails = optionOrLocalFallback(options.errorDetails, !forToString);
		const showWarnings = optionOrLocalFallback(options.warnings, true);
		const warningsFilter = optionsOrFallback(options.warningsFilter, null);
		const showPublicPath = optionOrLocalFallback(options.publicPath, !forToString);
		const excludeModules = [].concat(optionsOrFallback(options.excludeModules, options.exclude, [])).map(testAgainstGivenOption);
		const excludeAssets = [].concat(optionsOrFallback(options.excludeAssets, [])).map(testAgainstGivenOption);
		const maxModules = optionsOrFallback(options.maxModules, forToString ? 15 : Infinity);
		const sortModules = optionsOrFallback(options.modulesSort, "id");
		const sortChunks = optionsOrFallback(options.chunksSort, "id");
		const sortAssets = optionsOrFallback(options.assetsSort, "");

		if(!showCachedModules) {
			excludeModules.push((ident, module) => !module.built);
		}

		const createModuleFilter = () => {
			let i = 0;
			return module => {
				if(excludeModules.length > 0) {
					const ident = requestShortener.shorten(module.resource);
					const excluded = excludeModules.some(fn => fn(ident, module));
					if(excluded)
						return false;
				}
				return i++ < maxModules;
			};
		};

		const createAssetFilter = () => {
			return asset => {
				if(excludeAssets.length > 0) {
					const ident = asset.name;
					const excluded = excludeAssets.some(fn => fn(ident, asset));
					if(excluded)
						return false;
				}
				return showCachedAssets || asset.emitted;
			};
		};

		const sortByFieldAndOrder = (fieldKey, a, b) => {
			if(a[fieldKey] === null && b[fieldKey] === null) return 0;
			if(a[fieldKey] === null) return 1;
			if(b[fieldKey] === null) return -1;
			if(a[fieldKey] === b[fieldKey]) return 0;
			return a[fieldKey] < b[fieldKey] ? -1 : 1;
		};

		const sortByField = (field) => (a, b) => {
			if(!field) {
				return 0;
			}

			const fieldKey = this.normalizeFieldKey(field);

			// if a field is prefixed with a "!" the sort is reversed!
			const sortIsRegular = this.sortOrderRegular(field);

			return sortByFieldAndOrder(fieldKey, sortIsRegular ? a : b, sortIsRegular ? b : a);
		};

		const formatError = (e) => {
			let text = "";
			if(typeof e === "string")
				e = {
					message: e
				};
			if(e.chunk) {
				text += `chunk ${e.chunk.name || e.chunk.id}${e.chunk.hasRuntime() ? " [entry]" : e.chunk.isInitial() ? " [initial]" : ""}\n`;
			}
			if(e.file) {
				text += `${e.file}\n`;
			}
			if(e.module && e.module.readableIdentifier && typeof e.module.readableIdentifier === "function") {
				text += `${e.module.readableIdentifier(requestShortener)}\n`;
			}
			text += e.message;
			if(showErrorDetails && e.details) text += `\n${e.details}`;
			if(showErrorDetails && e.missing) text += e.missing.map(item => `\n[${item}]`).join("");
			if(showModuleTrace && e.origin) {
				text += `\n @ ${e.origin.readableIdentifier(requestShortener)}`;
				if(typeof e.originLoc === "object") {
					const locInfo = formatLocation(e.originLoc);
					if(locInfo)
						text += ` ${locInfo}`;
				}
				if(e.dependencies) {
					e.dependencies.forEach(dep => {
						if(!dep.loc) return;
						if(typeof dep.loc === "string") return;
						const locInfo = formatLocation(dep.loc);
						if(!locInfo) return;
						text += ` ${locInfo}`;
					});
				}
				let current = e.origin;
				while(current.issuer) {
					current = current.issuer;
					text += `\n @ ${current.readableIdentifier(requestShortener)}`;
				}
			}
			return text;
		};

		const obj = {
			errors: compilation.errors.map(formatError),
			warnings: Stats.filterWarnings(compilation.warnings.map(formatError), warningsFilter)
		};

		//We just hint other renderers since actually omitting
		//errors/warnings from the JSON would be kind of weird.
		Object.defineProperty(obj, "_showWarnings", {
			value: showWarnings,
			enumerable: false
		});
		Object.defineProperty(obj, "_showErrors", {
			value: showErrors,
			enumerable: false
		});

		if(showVersion) {
			obj.version = require("../package.json").version;
		}

		if(showHash) obj.hash = this.hash;
		if(showTimings && this.startTime && this.endTime) {
			obj.time = this.endTime - this.startTime;
		}

		if(showEnv && options._env) {
			obj.env = options._env;
		}

		if(compilation.needAdditionalPass) {
			obj.needAdditionalPass = true;
		}
		if(showPublicPath) {
			obj.publicPath = this.compilation.mainTemplate.getPublicPath({
				hash: this.compilation.hash
			});
		}
		if(showAssets) {
			const assetsByFile = {};
			const compilationAssets = Object.keys(compilation.assets);
			obj.assetsByChunkName = {};
			obj.assets = compilationAssets.map(asset => {
				const obj = {
					name: asset,
					size: compilation.assets[asset].size(),
					chunks: [],
					chunkNames: [],
					emitted: compilation.assets[asset].emitted
				};

				if(showPerformance) {
					obj.isOverSizeLimit = compilation.assets[asset].isOverSizeLimit;
				}

				assetsByFile[asset] = obj;
				return obj;
			}).filter(createAssetFilter());
			obj.filteredAssets = compilationAssets.length - obj.assets.length;

			compilation.chunks.forEach(chunk => {
				chunk.files.forEach(asset => {
					if(assetsByFile[asset]) {
						chunk.ids.forEach(id => {
							assetsByFile[asset].chunks.push(id);
						});
						if(chunk.name) {
							assetsByFile[asset].chunkNames.push(chunk.name);
							if(obj.assetsByChunkName[chunk.name])
								obj.assetsByChunkName[chunk.name] = [].concat(obj.assetsByChunkName[chunk.name]).concat([asset]);
							else
								obj.assetsByChunkName[chunk.name] = asset;
						}
					}
				});
			});
			obj.assets.sort(sortByField(sortAssets));
		}

		if(showEntrypoints) {
			obj.entrypoints = {};
			Object.keys(compilation.entrypoints).forEach(name => {
				const ep = compilation.entrypoints[name];
				obj.entrypoints[name] = {
					chunks: ep.chunks.map(c => c.id),
					assets: ep.chunks.reduce((array, c) => array.concat(c.files || []), [])
				};
				if(showPerformance) {
					obj.entrypoints[name].isOverSizeLimit = ep.isOverSizeLimit;
				}
			});
		}

		function fnModule(module) {
			const obj = {
				id: module.id,
				identifier: module.identifier(),
				name: module.readableIdentifier(requestShortener),
				index: module.index,
				index2: module.index2,
				size: module.size(),
				cacheable: !!module.cacheable,
				built: !!module.built,
				optional: !!module.optional,
				prefetched: !!module.prefetched,
				chunks: module.mapChunks(chunk => chunk.id),
				assets: Object.keys(module.assets || {}),
				issuer: module.issuer && module.issuer.identifier(),
				issuerId: module.issuer && module.issuer.id,
				issuerName: module.issuer && module.issuer.readableIdentifier(requestShortener),
				profile: module.profile,
				failed: !!module.error,
				errors: module.errors && module.dependenciesErrors && (module.errors.length + module.dependenciesErrors.length),
				warnings: module.errors && module.dependenciesErrors && (module.warnings.length + module.dependenciesWarnings.length)
			};
			if(showReasons) {
				obj.reasons = module.reasons.filter(reason => reason.dependency && reason.module).map(reason => {
					const obj = {
						moduleId: reason.module.id,
						moduleIdentifier: reason.module.identifier(),
						module: reason.module.readableIdentifier(requestShortener),
						moduleName: reason.module.readableIdentifier(requestShortener),
						type: reason.dependency.type,
						userRequest: reason.dependency.userRequest
					};
					const locInfo = formatLocation(reason.dependency.loc);
					if(locInfo) obj.loc = locInfo;
					return obj;
				}).sort((a, b) => a.moduleId - b.moduleId);
			}
			if(showUsedExports) {
				obj.usedExports = module.used ? module.usedExports : false;
			}
			if(showProvidedExports) {
				obj.providedExports = Array.isArray(module.providedExports) ? module.providedExports : null;
			}
			if(showOptimizationBailout) {
				obj.optimizationBailout = module.optimizationBailout.map(item => {
					if(typeof item === "function") return item(requestShortener);
					return item;
				});
			}
			if(showDepth) {
				obj.depth = module.depth;
			}
			if(showSource && module._source) {
				obj.source = module._source.source();
			}
			return obj;
		}
		if(showChunks) {
			obj.chunks = compilation.chunks.map(chunk => {
				const obj = {
					id: chunk.id,
					rendered: chunk.rendered,
					initial: chunk.isInitial(),
					entry: chunk.hasRuntime(),
					recorded: chunk.recorded,
					extraAsync: !!chunk.extraAsync,
					size: chunk.mapModules(m => m.size()).reduce((size, moduleSize) => size + moduleSize, 0),
					names: chunk.name ? [chunk.name] : [],
					files: chunk.files.slice(),
					hash: chunk.renderedHash,
					parents: chunk.parents.map(c => c.id)
				};
				if(showChunkModules) {
					obj.modules = chunk
						.getModules()
						.sort(sortByField("depth"))
						.filter(createModuleFilter())
						.map(fnModule);
					obj.filteredModules = chunk.getNumberOfModules() - obj.modules.length;
					obj.modules.sort(sortByField(sortModules));
				}
				if(showChunkOrigins) {
					obj.origins = chunk.origins.map(origin => ({
						moduleId: origin.module ? origin.module.id : undefined,
						module: origin.module ? origin.module.identifier() : "",
						moduleIdentifier: origin.module ? origin.module.identifier() : "",
						moduleName: origin.module ? origin.module.readableIdentifier(requestShortener) : "",
						loc: formatLocation(origin.loc),
						name: origin.name,
						reasons: origin.reasons || []
					}));
				}
				return obj;
			});
			obj.chunks.sort(sortByField(sortChunks));
		}
		if(showModules) {
			obj.modules = compilation.modules
				.slice()
				.sort(sortByField("depth"))
				.filter(createModuleFilter())
				.map(fnModule);
			obj.filteredModules = compilation.modules.length - obj.modules.length;
			obj.modules.sort(sortByField(sortModules));
		}
		if(showChildren) {
			obj.children = compilation.children.map((child, idx) => {
				const childOptions = Stats.getChildOptions(options, idx);
				const obj = new Stats(child).toJson(childOptions, forToString);
				delete obj.hash;
				delete obj.version;
				if(child.name)
					obj.name = identifierUtils.makePathsRelative(context, child.name, compilation.cache);
				return obj;
			});
		}

		return obj;
	}

	toString(options) {
		if(typeof options === "boolean" || typeof options === "string") {
			options = Stats.presetToOptions(options);
		} else if(!options) {
			options = {};
		}

		const useColors = optionsOrFallback(options.colors, false);

		const obj = this.toJson(options, true);

		return Stats.jsonToString(obj, useColors);
	}

	static jsonToString(obj, useColors) {
		const buf = [];

		const defaultColors = {
			bold: "\u001b[1m",
			yellow: "\u001b[1m\u001b[33m",
			red: "\u001b[1m\u001b[31m",
			green: "\u001b[1m\u001b[32m",
			cyan: "\u001b[1m\u001b[36m",
			magenta: "\u001b[1m\u001b[35m"
		};

		const colors = Object.keys(defaultColors).reduce((obj, color) => {
			obj[color] = str => {
				if(useColors) {
					buf.push(
						(useColors === true || useColors[color] === undefined) ?
						defaultColors[color] : useColors[color]
					);
				}
				buf.push(str);
				if(useColors) {
					buf.push("\u001b[39m\u001b[22m");
				}
			};
			return obj;
		}, {
			normal: (str) => buf.push(str)
		});

		const coloredTime = (time) => {
			let times = [800, 400, 200, 100];
			if(obj.time) {
				times = [obj.time / 2, obj.time / 4, obj.time / 8, obj.time / 16];
			}
			if(time < times[3])
				colors.normal(`${time}ms`);
			else if(time < times[2])
				colors.bold(`${time}ms`);
			else if(time < times[1])
				colors.green(`${time}ms`);
			else if(time < times[0])
				colors.yellow(`${time}ms`);
			else
				colors.red(`${time}ms`);
		};

		const newline = () => buf.push("\n");

		const getText = (arr, row, col) => {
			return arr[row][col].value;
		};

		const table = (array, align, splitter) => {
			const rows = array.length;
			const cols = array[0].length;
			const colSizes = new Array(cols);
			for(let col = 0; col < cols; col++)
				colSizes[col] = 0;
			for(let row = 0; row < rows; row++) {
				for(let col = 0; col < cols; col++) {
					const value = `${getText(array, row, col)}`;
					if(value.length > colSizes[col]) {
						colSizes[col] = value.length;
					}
				}
			}
			for(let row = 0; row < rows; row++) {
				for(let col = 0; col < cols; col++) {
					const format = array[row][col].color;
					const value = `${getText(array, row, col)}`;
					let l = value.length;
					if(align[col] === "l")
						format(value);
					for(; l < colSizes[col] && col !== cols - 1; l++)
						colors.normal(" ");
					if(align[col] === "r")
						format(value);
					if(col + 1 < cols && colSizes[col] !== 0)
						colors.normal(splitter || "  ");
				}
				newline();
			}
		};

		const getAssetColor = (asset, defaultColor) => {
			if(asset.isOverSizeLimit) {
				return colors.yellow;
			}

			return defaultColor;
		};

		if(obj.hash) {
			colors.normal("Hash: ");
			colors.bold(obj.hash);
			newline();
		}
		if(obj.version) {
			colors.normal("Version: webpack ");
			colors.bold(obj.version);
			newline();
		}
		if(typeof obj.time === "number") {
			colors.normal("Time: ");
			colors.bold(obj.time);
			colors.normal("ms");
			newline();
		}
		if(obj.env) {
			colors.normal("Environment (--env): ");
			colors.bold(JSON.stringify(obj.env, null, 2));
			newline();
		}
		if(obj.publicPath) {
			colors.normal("PublicPath: ");
			colors.bold(obj.publicPath);
			newline();
		}

		if(obj.assets && obj.assets.length > 0) {
			const t = [
				[{
					value: "Asset",
					color: colors.bold
				}, {
					value: "Size",
					color: colors.bold
				}, {
					value: "Chunks",
					color: colors.bold
				}, {
					value: "",
					color: colors.bold
				}, {
					value: "",
					color: colors.bold
				}, {
					value: "Chunk Names",
					color: colors.bold
				}]
			];
			obj.assets.forEach(asset => {
				t.push([{
					value: asset.name,
					color: getAssetColor(asset, colors.green)
				}, {
					value: SizeFormatHelpers.formatSize(asset.size),
					color: getAssetColor(asset, colors.normal)
				}, {
					value: asset.chunks.join(", "),
					color: colors.bold
				}, {
					value: asset.emitted ? "[emitted]" : "",
					color: colors.green
				}, {
					value: asset.isOverSizeLimit ? "[big]" : "",
					color: getAssetColor(asset, colors.normal)
				}, {
					value: asset.chunkNames.join(", "),
					color: colors.normal
				}]);
			});
			table(t, "rrrlll");
		}
		if(obj.filteredAssets > 0) {
			colors.normal(" ");
			if(obj.assets.length > 0)
				colors.normal("+ ");
			colors.normal(obj.filteredAssets);
			if(obj.assets.length > 0)
				colors.normal(" hidden");
			colors.normal(obj.filteredAssets !== 1 ? " assets" : " asset");
			newline();
		}
		if(obj.entrypoints) {
			Object.keys(obj.entrypoints).forEach(name => {
				const ep = obj.entrypoints[name];
				colors.normal("Entrypoint ");
				colors.bold(name);
				if(ep.isOverSizeLimit) {
					colors.normal(" ");
					colors.yellow("[big]");
				}
				colors.normal(" =");
				ep.assets.forEach(asset => {
					colors.normal(" ");
					colors.green(asset);
				});
				newline();
			});
		}
		const modulesByIdentifier = {};
		if(obj.modules) {
			obj.modules.forEach(module => {
				modulesByIdentifier[`$${module.identifier}`] = module;
			});
		} else if(obj.chunks) {
			obj.chunks.forEach(chunk => {
				if(chunk.modules) {
					chunk.modules.forEach(module => {
						modulesByIdentifier[`$${module.identifier}`] = module;
					});
				}
			});
		}

		const processModuleAttributes = (module) => {
			colors.normal(" ");
			colors.normal(SizeFormatHelpers.formatSize(module.size));
			if(module.chunks) {
				module.chunks.forEach(chunk => {
					colors.normal(" {");
					colors.yellow(chunk);
					colors.normal("}");
				});
			}
			if(typeof module.depth === "number") {
				colors.normal(` [depth ${module.depth}]`);
			}
			if(!module.cacheable) {
				colors.red(" [not cacheable]");
			}
			if(module.optional) {
				colors.yellow(" [optional]");
			}
			if(module.built) {
				colors.green(" [built]");
			}
			if(module.prefetched) {
				colors.magenta(" [prefetched]");
			}
			if(module.failed)
				colors.red(" [failed]");
			if(module.warnings)
				colors.yellow(` [${module.warnings} warning${module.warnings === 1 ? "" : "s"}]`);
			if(module.errors)
				colors.red(` [${module.errors} error${module.errors === 1 ? "" : "s"}]`);
		};

		const processModuleContent = (module, prefix) => {
			if(Array.isArray(module.providedExports)) {
				colors.normal(prefix);
				if(module.providedExports.length === 0)
					colors.cyan("[no exports]");
				else
					colors.cyan(`[exports: ${module.providedExports.join(", ")}]`);
				newline();
			}
			if(module.usedExports !== undefined) {
				if(module.usedExports !== true) {
					colors.normal(prefix);
					if(module.usedExports === false || module.usedExports.length === 0)
						colors.cyan("[no exports used]");
					else
						colors.cyan(`[only some exports used: ${module.usedExports.join(", ")}]`);
					newline();
				}
			}
			if(Array.isArray(module.optimizationBailout)) {
				module.optimizationBailout.forEach(item => {
					colors.normal(prefix);
					colors.yellow(item);
					newline();
				});
			}
			if(module.reasons) {
				module.reasons.forEach(reason => {
					colors.normal(prefix);
					colors.normal(reason.type);
					colors.normal(" ");
					colors.cyan(reason.userRequest);
					colors.normal(" [");
					colors.normal(reason.moduleId);
					colors.normal("] ");
					colors.magenta(reason.module);
					if(reason.loc) {
						colors.normal(" ");
						colors.normal(reason.loc);
					}
					newline();
				});
			}
			if(module.profile) {
				colors.normal(prefix);
				let sum = 0;
				const path = [];
				let current = module;
				while(current.issuer) {
					path.push(current = current.issuer);
				}
				path.reverse().forEach(module => {
					colors.normal("[");
					colors.normal(module.id);
					colors.normal("] ");
					if(module.profile) {
						const time = (module.profile.factory || 0) + (module.profile.building || 0);
						coloredTime(time);
						sum += time;
						colors.normal(" ");
					}
					colors.normal("->");
				});
				Object.keys(module.profile).forEach(key => {
					colors.normal(` ${key}:`);
					const time = module.profile[key];
					coloredTime(time);
					sum += time;
				});
				colors.normal(" = ");
				coloredTime(sum);
				newline();
			}
		};

		const processModulesList = (obj, prefix) => {
			if(obj.modules) {
				obj.modules.forEach(module => {
					colors.normal(prefix);
					if(module.id < 1000) colors.normal(" ");
					if(module.id < 100) colors.normal(" ");
					if(module.id < 10) colors.normal(" ");
					colors.normal("[");
					colors.normal(module.id);
					colors.normal("] ");
					colors.bold(module.name || module.identifier);
					processModuleAttributes(module);
					newline();
					processModuleContent(module, prefix + "       ");
				});
				if(obj.filteredModules > 0) {
					colors.normal(prefix);
					colors.normal("   ");
					if(obj.modules.length > 0)
						colors.normal(" + ");
					colors.normal(obj.filteredModules);
					if(obj.modules.length > 0)
						colors.normal(" hidden");
					colors.normal(obj.filteredModules !== 1 ? " modules" : " module");
					newline();
				}
			}
		};

		if(obj.chunks) {
			obj.chunks.forEach(chunk => {
				colors.normal("chunk ");
				if(chunk.id < 1000) colors.normal(" ");
				if(chunk.id < 100) colors.normal(" ");
				if(chunk.id < 10) colors.normal(" ");
				colors.normal("{");
				colors.yellow(chunk.id);
				colors.normal("} ");
				colors.green(chunk.files.join(", "));
				if(chunk.names && chunk.names.length > 0) {
					colors.normal(" (");
					colors.normal(chunk.names.join(", "));
					colors.normal(")");
				}
				colors.normal(" ");
				colors.normal(SizeFormatHelpers.formatSize(chunk.size));
				chunk.parents.forEach(id => {
					colors.normal(" {");
					colors.yellow(id);
					colors.normal("}");
				});
				if(chunk.entry) {
					colors.yellow(" [entry]");
				} else if(chunk.initial) {
					colors.yellow(" [initial]");
				}
				if(chunk.rendered) {
					colors.green(" [rendered]");
				}
				if(chunk.recorded) {
					colors.green(" [recorded]");
				}
				newline();
				if(chunk.origins) {
					chunk.origins.forEach(origin => {
						colors.normal("    > ");
						if(origin.reasons && origin.reasons.length) {
							colors.yellow(origin.reasons.join(" "));
							colors.normal(" ");
						}
						if(origin.name) {
							colors.normal(origin.name);
							colors.normal(" ");
						}
						if(origin.module) {
							colors.normal("[");
							colors.normal(origin.moduleId);
							colors.normal("] ");
							const module = modulesByIdentifier[`$${origin.module}`];
							if(module) {
								colors.bold(module.name);
								colors.normal(" ");
							}
							if(origin.loc) {
								colors.normal(origin.loc);
							}
						}
						newline();
					});
				}
				processModulesList(chunk, " ");
			});
		}

		processModulesList(obj, "");

		if(obj._showWarnings && obj.warnings) {
			obj.warnings.forEach(warning => {
				newline();
				colors.yellow(`WARNING in ${warning}`);
				newline();
			});
		}
		if(obj._showErrors && obj.errors) {
			obj.errors.forEach(error => {
				newline();
				colors.red(`ERROR in ${error}`);
				newline();
			});
		}
		if(obj.children) {
			obj.children.forEach(child => {
				const childString = Stats.jsonToString(child, useColors);
				if(childString) {
					if(child.name) {
						colors.normal("Child ");
						colors.bold(child.name);
						colors.normal(":");
					} else {
						colors.normal("Child");
					}
					newline();
					buf.push("    ");
					buf.push(childString.replace(/\n/g, "\n    "));
					newline();
				}
			});
		}
		if(obj.needAdditionalPass) {
			colors.yellow("Compilation needs an additional pass and will compile again.");
		}

		while(buf[buf.length - 1] === "\n") buf.pop();
		return buf.join("");
	}

	static presetToOptions(name) {
		// Accepted values: none, errors-only, minimal, normal, detailed, verbose
		// Any other falsy value will behave as 'none', truthy values as 'normal'
		const pn = (typeof name === "string") && name.toLowerCase() || name || "none";
		switch(pn) {
			case "none":
				return {
					all: false
				};
			case "verbose":
				return {
					entrypoints: true,
					modules: false,
					chunks: true,
					chunkModules: true,
					chunkOrigins: true,
					depth: true,
					env: true,
					reasons: true,
					usedExports: true,
					providedExports: true,
					optimizationBailout: true,
					errorDetails: true,
					publicPath: true,
					exclude: () => false,
					maxModules: Infinity,
				};
			case "detailed":
				return {
					entrypoints: true,
					chunks: true,
					chunkModules: false,
					chunkOrigins: true,
					depth: true,
					usedExports: true,
					providedExports: true,
					optimizationBailout: true,
					errorDetails: true,
					publicPath: true,
					exclude: () => false,
					maxModules: Infinity,
				};
			case "minimal":
				return {
					all: false,
					modules: true,
					maxModules: 0,
					errors: true,
					warnings: true,
				};
			case "errors-only":
				return {
					all: false,
					errors: true,
					moduleTrace: true,
				};
			default:
				return {};
		}
	}

	static getChildOptions(options, idx) {
		let innerOptions;
		if(Array.isArray(options.children)) {
			if(idx < options.children.length)
				innerOptions = options.children[idx];
		} else if(typeof options.children === "object" && options.children) {
			innerOptions = options.children;
		}
		if(typeof innerOptions === "boolean" || typeof innerOptions === "string")
			innerOptions = Stats.presetToOptions(innerOptions);
		if(!innerOptions)
			return options;
		const childOptions = Object.assign({}, options);
		delete childOptions.children; // do not inherit children
		return Object.assign(childOptions, innerOptions);
	}
}

module.exports = Stats;

}, function(modId) { var map = {"./RequestShortener":1602510872149,"./SizeFormatHelpers":1602510872150,"./formatLocation":1602510872130,"./util/identifier":1602510872151,"../package.json":1602510872152}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872149, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const NORMALIZE_SLASH_DIRECTION_REGEXP = /\\/g;
const PATH_CHARS_REGEXP = /[-[\]{}()*+?.,\\^$|#\s]/g;
const SEPARATOR_REGEXP = /[/\\]$/;
const FRONT_OR_BACK_BANG_REGEXP = /^!|!$/g;
const INDEX_JS_REGEXP = /\/index.js(!|\?|\(query\))/g;

const normalizeBackSlashDirection = (request) => {
	return request.replace(NORMALIZE_SLASH_DIRECTION_REGEXP, "/");
};

const createRegExpForPath = (path) => {
	const regexpTypePartial = path.replace(PATH_CHARS_REGEXP, "\\$&");
	return new RegExp(`(^|!)${regexpTypePartial}`, "g");
};

class RequestShortener {
	constructor(directory) {
		directory = normalizeBackSlashDirection(directory);
		if(SEPARATOR_REGEXP.test(directory)) directory = directory.substr(0, directory.length - 1);

		if(directory) {
			this.currentDirectoryRegExp = createRegExpForPath(directory);
		}

		const dirname = path.dirname(directory);
		const endsWithSeperator = SEPARATOR_REGEXP.test(dirname);
		const parentDirectory = endsWithSeperator ? dirname.substr(0, dirname.length - 1) : dirname;
		if(parentDirectory && parentDirectory !== directory) {
			this.parentDirectoryRegExp = createRegExpForPath(parentDirectory);
		}

		if(__dirname.length >= 2) {
			const buildins = normalizeBackSlashDirection(path.join(__dirname, ".."));
			const buildinsAsModule = this.currentDirectoryRegExp && this.currentDirectoryRegExp.test(buildins);
			this.buildinsAsModule = buildinsAsModule;
			this.buildinsRegExp = createRegExpForPath(buildins);
		}
	}

	shorten(request) {
		if(!request) return request;
		request = normalizeBackSlashDirection(request);
		if(this.buildinsAsModule && this.buildinsRegExp)
			request = request.replace(this.buildinsRegExp, "!(webpack)");
		if(this.currentDirectoryRegExp)
			request = request.replace(this.currentDirectoryRegExp, "!.");
		if(this.parentDirectoryRegExp)
			request = request.replace(this.parentDirectoryRegExp, "!..");
		if(!this.buildinsAsModule && this.buildinsRegExp)
			request = request.replace(this.buildinsRegExp, "!(webpack)");
		request = request.replace(INDEX_JS_REGEXP, "$1");
		return request.replace(FRONT_OR_BACK_BANG_REGEXP, "");
	}
}

module.exports = RequestShortener;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872150, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Sean Larkin @thelarkinn
*/


const SizeFormatHelpers = exports;

SizeFormatHelpers.formatSize = size => {
	if(size <= 0) {
		return "0 bytes";
	}

	const abbreviations = ["bytes", "kB", "MB", "GB"];
	const index = Math.floor(Math.log(size) / Math.log(1000));

	return `${+(size / Math.pow(1000, index)).toPrecision(3)} ${abbreviations[index]}`;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872151, function(require, module, exports) {

const path = require("path");

const looksLikeAbsolutePath = (maybeAbsolutePath) => {
	return /^(?:[a-z]:\\|\/)/i.test(maybeAbsolutePath);
};

const normalizePathSeparator = (p) => p.replace(/\\/g, "/");

const _makePathsRelative = (context, identifier) => {
	return identifier
		.split(/([|! ])/)
		.map(str => looksLikeAbsolutePath(str) ?
			normalizePathSeparator(path.relative(context, str)) : str)
		.join("");
};

exports.makePathsRelative = (context, identifier, cache) => {
	if(!cache) return _makePathsRelative(context, identifier);

	const relativePaths = cache.relativePaths || (cache.relativePaths = new Map());

	let cachedResult;
	let contextCache = relativePaths.get(context);
	if(typeof contextCache === "undefined") {
		relativePaths.set(context, contextCache = new Map());
	} else {
		cachedResult = contextCache.get(identifier);
	}

	if(typeof cachedResult !== "undefined") {
		return cachedResult;
	} else {
		const relativePath = _makePathsRelative(context, identifier);
		contextCache.set(identifier, relativePath);
		return relativePath;
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872152, function(require, module, exports) {
module.exports = {
  "_from": "webpack@^3.12.0",
  "_id": "webpack@3.12.0",
  "_inBundle": false,
  "_integrity": "sha512-Sw7MdIIOv/nkzPzee4o0EdvCuPmxT98+vVpIvwtcwcF1Q4SDSNp92vwcKc4REe7NItH9f1S4ra9FuQ7yuYZ8bQ==",
  "_location": "/webpack",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "webpack@^3.12.0",
    "name": "webpack",
    "escapedName": "webpack",
    "rawSpec": "^3.12.0",
    "saveSpec": null,
    "fetchSpec": "^3.12.0"
  },
  "_requiredBy": [
    "/cos-wx-sdk-v5"
  ],
  "_resolved": "https://registry.npmjs.org/webpack/-/webpack-3.12.0.tgz",
  "_shasum": "3f9e34360370602fcf639e97939db486f4ec0d74",
  "_spec": "webpack@^3.12.0",
  "_where": "E:\\gitworkspace\\exchange_wxmini\\node_modules\\cos-wx-sdk-v5",
  "author": {
    "name": "Tobias Koppers @sokra"
  },
  "bin": {
    "webpack": "bin/webpack.js"
  },
  "bugs": {
    "url": "https://github.com/webpack/webpack/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "acorn": "^5.0.0",
    "acorn-dynamic-import": "^2.0.0",
    "ajv": "^6.1.0",
    "ajv-keywords": "^3.1.0",
    "async": "^2.1.2",
    "enhanced-resolve": "^3.4.0",
    "escope": "^3.6.0",
    "interpret": "^1.0.0",
    "json-loader": "^0.5.4",
    "json5": "^0.5.1",
    "loader-runner": "^2.3.0",
    "loader-utils": "^1.1.0",
    "memory-fs": "~0.4.1",
    "mkdirp": "~0.5.0",
    "node-libs-browser": "^2.0.0",
    "source-map": "^0.5.3",
    "supports-color": "^4.2.1",
    "tapable": "^0.2.7",
    "uglifyjs-webpack-plugin": "^0.4.6",
    "watchpack": "^1.4.0",
    "webpack-sources": "^1.0.1",
    "yargs": "^8.0.2"
  },
  "deprecated": false,
  "description": "Packs CommonJs/AMD modules for the browser. Allows to split your codebase into multiple bundles, which can be loaded on demand. Support loaders to preprocess files, i.e. json, jsx, es7, css, less, ... and your custom stuff.",
  "devDependencies": {
    "beautify-lint": "^1.0.3",
    "benchmark": "^2.1.1",
    "bundle-loader": "~0.5.0",
    "codacy-coverage": "^2.0.1",
    "coffee-loader": "~0.7.1",
    "coffee-script": "^1.10.0",
    "coveralls": "^2.11.2",
    "css-loader": "^0.28.3",
    "es6-promise-polyfill": "^1.1.1",
    "eslint": "^4.3.0",
    "eslint-plugin-node": "^5.1.1",
    "express": "~4.13.1",
    "extract-text-webpack-plugin": "^3.0.0",
    "file-loader": "^0.11.2",
    "glob": "^7.1.2",
    "i18n-webpack-plugin": "^1.0.0",
    "istanbul": "^0.4.5",
    "jade": "^1.11.0",
    "jade-loader": "~0.8.0",
    "js-beautify": "^1.5.10",
    "less": "^2.5.1",
    "less-loader": "^4.0.3",
    "lodash": "^4.17.4",
    "mocha": "^3.2.0",
    "mocha-lcov-reporter": "^1.0.0",
    "raw-loader": "~0.5.0",
    "react": "^15.2.1",
    "react-dom": "^15.2.1",
    "rimraf": "^2.6.2",
    "script-loader": "~0.7.0",
    "should": "^11.1.1",
    "simple-git": "^1.65.0",
    "sinon": "^2.3.2",
    "style-loader": "^0.18.1",
    "url-loader": "~0.5.0",
    "val-loader": "^1.0.2",
    "vm-browserify": "~0.0.0",
    "webpack-dev-middleware": "^1.9.0",
    "worker-loader": "^0.8.0"
  },
  "engines": {
    "node": ">=4.3.0 <5.0.0 || >=5.10"
  },
  "files": [
    "lib/",
    "bin/",
    "buildin/",
    "hot/",
    "web_modules/",
    "schemas/"
  ],
  "homepage": "https://github.com/webpack/webpack",
  "license": "MIT",
  "main": "lib/webpack.js",
  "name": "webpack",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/webpack/webpack.git"
  },
  "scripts": {
    "appveyor:benchmark": "npm run benchmark",
    "appveyor:integration": "npm run cover:init && npm run cover:integration && npm run cover:report-min",
    "appveyor:unit": "npm run cover:init && npm run cover:unit && npm run cover:report-min",
    "beautify-lint": "beautify-lint \"lib/**/*.js\" \"hot/**/*.js\" \"bin/**/*.js\" \"benchmark/*.js\" \"test/*.js\"",
    "benchmark": "mocha --max-old-space-size=4096 --harmony --trace-deprecation test/*.benchmark.js -R spec",
    "build:examples": "cd examples && node buildAll.js",
    "circleci:lint": "npm run lint-files",
    "circleci:test": "node node_modules/mocha/bin/mocha --max-old-space-size=4096 --harmony --trace-deprecation test/*.test.js test/*.unittest.js",
    "cover": "npm run cover:init && npm run cover:all && npm run cover:report",
    "cover:all": "node --max-old-space-size=4096 --harmony --trace-deprecation ./node_modules/istanbul/lib/cli.js cover --report none node_modules/mocha/bin/_mocha -- test/*.test.js test/*.unittest.js",
    "cover:init": "rimraf coverage",
    "cover:integration": "node --max-old-space-size=4096 --harmony --trace-deprecation ./node_modules/istanbul/lib/cli.js cover --report none node_modules/mocha/bin/_mocha -- test/*.test.js",
    "cover:report": "istanbul report",
    "cover:report-min": "istanbul report --report lcovonly",
    "cover:unit": "node --max-old-space-size=4096 --harmony --trace-deprecation ./node_modules/istanbul/lib/cli.js cover --report none node_modules/mocha/bin/_mocha -- test/*.unittest.js",
    "fix": "npm run lint -- --fix",
    "lint": "eslint lib bin hot buildin \"test/**/webpack.config.js\" \"test/binCases/**/test.js\" \"examples/**/webpack.config.js\"",
    "lint-files": "npm run lint && npm run beautify-lint && npm run schema-lint",
    "pretest": "npm run lint-files",
    "publish-patch": "npm run lint && npm run beautify-lint && mocha && npm version patch && git push && git push --tags && npm publish",
    "schema-lint": "mocha test/*.lint.js --opts test/lint-mocha.opts",
    "test": "mocha test/*.test.js test/*.unittest.js --max-old-space-size=4096 --harmony --trace-deprecation --check-leaks",
    "test:integration": "mocha test/*.test.js --max-old-space-size=4096 --harmony --trace-deprecation --check-leaks",
    "test:unit": "mocha test/*.unittest.js --max-old-space-size=4096 --harmony --trace-deprecation --check-leaks",
    "travis:benchmark": "npm run benchmark",
    "travis:integration": "npm run cover:init && npm run cover:integration && npm run cover:report-min",
    "travis:lint": "npm run lint-files",
    "travis:unit": "npm run cover:init && npm run cover:unit && npm run cover:report-min"
  },
  "version": "3.12.0",
  "web": "lib/webpack.web.js"
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872153, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class Semaphore {
	constructor(available) {
		this.available = available;
		this.waiters = [];
	}

	acquire(callback) {
		if(this.available > 0) {
			this.available--;
			callback();
		} else {
			this.waiters.push(callback);
		}
	}

	release() {
		if(this.waiters.length > 0) {
			const callback = this.waiters.pop();
			process.nextTick(callback);
		} else {
			this.available++;
		}
	}
}

module.exports = Semaphore;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872154, function(require, module, exports) {


module.exports = class Queue {
	constructor(items) {
		this.first = null;
		this.last = null;
		this.length = 0;
		if(items) {
			for(const item of items) {
				this.enqueue(item);
			}
		}
	}

	enqueue(item) {
		const first = this.first;
		const node = {
			item,
			next: null
		};
		if(first === null) {
			this.last = node;
		} else {
			first.next = node;
		}
		this.first = node;
		this.length++;
	}

	dequeue() {
		const last = this.last;
		if(last === null)
			return undefined;
		const next = last.next;
		if(next === null) {
			this.first = null;
		}
		this.last = next;
		this.length--;
		return last.item;
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872155, function(require, module, exports) {
/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */


const asyncLib = require("async");
const Tapable = require("tapable");
const NormalModule = require("./NormalModule");
const RawModule = require("./RawModule");
const Parser = require("./Parser");
const RuleSet = require("./RuleSet");

function loaderToIdent(data) {
	if(!data.options)
		return data.loader;
	if(typeof data.options === "string")
		return data.loader + "?" + data.options;
	if(typeof data.options !== "object")
		throw new Error("loader options must be string or object");
	if(data.ident)
		return data.loader + "??" + data.ident;
	return data.loader + "?" + JSON.stringify(data.options);
}

function identToLoaderRequest(resultString) {
	const idx = resultString.indexOf("?");
	let options;

	if(idx >= 0) {
		options = resultString.substr(idx + 1);
		resultString = resultString.substr(0, idx);

		return {
			loader: resultString,
			options
		};
	} else {
		return {
			loader: resultString
		};
	}
}

class NormalModuleFactory extends Tapable {
	constructor(context, resolvers, options) {
		super();
		this.resolvers = resolvers;
		this.ruleSet = new RuleSet(options.rules || options.loaders);
		this.cachePredicate = typeof options.unsafeCache === "function" ? options.unsafeCache : Boolean.bind(null, options.unsafeCache);
		this.context = context || "";
		this.parserCache = {};
		this.plugin("factory", () => (result, callback) => {
			let resolver = this.applyPluginsWaterfall0("resolver", null);

			// Ignored
			if(!resolver) return callback();

			resolver(result, (err, data) => {
				if(err) return callback(err);

				// Ignored
				if(!data) return callback();

				// direct module
				if(typeof data.source === "function")
					return callback(null, data);

				this.applyPluginsAsyncWaterfall("after-resolve", data, (err, result) => {
					if(err) return callback(err);

					// Ignored
					if(!result) return callback();

					let createdModule = this.applyPluginsBailResult("create-module", result);
					if(!createdModule) {

						if(!result.request) {
							return callback(new Error("Empty dependency (no request)"));
						}

						createdModule = new NormalModule(
							result.request,
							result.userRequest,
							result.rawRequest,
							result.loaders,
							result.resource,
							result.parser
						);
					}

					createdModule = this.applyPluginsWaterfall0("module", createdModule);

					return callback(null, createdModule);
				});
			});
		});
		this.plugin("resolver", () => (data, callback) => {
			const contextInfo = data.contextInfo;
			const context = data.context;
			const request = data.request;

			const noAutoLoaders = /^-?!/.test(request);
			const noPrePostAutoLoaders = /^!!/.test(request);
			const noPostAutoLoaders = /^-!/.test(request);
			let elements = request.replace(/^-?!+/, "").replace(/!!+/g, "!").split("!");
			let resource = elements.pop();
			elements = elements.map(identToLoaderRequest);

			asyncLib.parallel([
				callback => this.resolveRequestArray(contextInfo, context, elements, this.resolvers.loader, callback),
				callback => {
					if(resource === "" || resource[0] === "?")
						return callback(null, {
							resource
						});

					this.resolvers.normal.resolve(contextInfo, context, resource, (err, resource, resourceResolveData) => {
						if(err) return callback(err);
						callback(null, {
							resourceResolveData,
							resource
						});
					});
				}
			], (err, results) => {
				if(err) return callback(err);
				let loaders = results[0];
				const resourceResolveData = results[1].resourceResolveData;
				resource = results[1].resource;

				// translate option idents
				try {
					loaders.forEach(item => {
						if(typeof item.options === "string" && /^\?/.test(item.options)) {
							const ident = item.options.substr(1);
							item.options = this.ruleSet.findOptionsByIdent(ident);
							item.ident = ident;
						}
					});
				} catch(e) {
					return callback(e);
				}

				if(resource === false) {
					// ignored
					return callback(null,
						new RawModule(
							"/* (ignored) */",
							`ignored ${context} ${request}`,
							`${request} (ignored)`
						)
					);
				}

				const userRequest = loaders.map(loaderToIdent).concat([resource]).join("!");

				let resourcePath = resource;
				let resourceQuery = "";
				const queryIndex = resourcePath.indexOf("?");
				if(queryIndex >= 0) {
					resourceQuery = resourcePath.substr(queryIndex);
					resourcePath = resourcePath.substr(0, queryIndex);
				}

				const result = this.ruleSet.exec({
					resource: resourcePath,
					resourceQuery,
					issuer: contextInfo.issuer,
					compiler: contextInfo.compiler
				});
				const settings = {};
				const useLoadersPost = [];
				const useLoaders = [];
				const useLoadersPre = [];
				result.forEach(r => {
					if(r.type === "use") {
						if(r.enforce === "post" && !noPostAutoLoaders && !noPrePostAutoLoaders)
							useLoadersPost.push(r.value);
						else if(r.enforce === "pre" && !noPrePostAutoLoaders)
							useLoadersPre.push(r.value);
						else if(!r.enforce && !noAutoLoaders && !noPrePostAutoLoaders)
							useLoaders.push(r.value);
					} else {
						settings[r.type] = r.value;
					}
				});
				asyncLib.parallel([
					this.resolveRequestArray.bind(this, contextInfo, this.context, useLoadersPost, this.resolvers.loader),
					this.resolveRequestArray.bind(this, contextInfo, this.context, useLoaders, this.resolvers.loader),
					this.resolveRequestArray.bind(this, contextInfo, this.context, useLoadersPre, this.resolvers.loader)
				], (err, results) => {
					if(err) return callback(err);
					loaders = results[0].concat(loaders, results[1], results[2]);
					process.nextTick(() => {
						callback(null, {
							context: context,
							request: loaders.map(loaderToIdent).concat([resource]).join("!"),
							dependencies: data.dependencies,
							userRequest,
							rawRequest: request,
							loaders,
							resource,
							resourceResolveData,
							parser: this.getParser(settings.parser)
						});
					});
				});
			});
		});
	}

	create(data, callback) {
		const dependencies = data.dependencies;
		const cacheEntry = dependencies[0].__NormalModuleFactoryCache;
		if(cacheEntry) return callback(null, cacheEntry);
		const context = data.context || this.context;
		const request = dependencies[0].request;
		const contextInfo = data.contextInfo || {};
		this.applyPluginsAsyncWaterfall("before-resolve", {
			contextInfo,
			context,
			request,
			dependencies
		}, (err, result) => {
			if(err) return callback(err);

			// Ignored
			if(!result) return callback();

			const factory = this.applyPluginsWaterfall0("factory", null);

			// Ignored
			if(!factory) return callback();

			factory(result, (err, module) => {
				if(err) return callback(err);

				if(module && this.cachePredicate(module)) {
					dependencies.forEach(d => d.__NormalModuleFactoryCache = module);
				}

				callback(null, module);
			});
		});
	}

	resolveRequestArray(contextInfo, context, array, resolver, callback) {
		if(array.length === 0) return callback(null, []);
		asyncLib.map(array, (item, callback) => {
			resolver.resolve(contextInfo, context, item.loader, (err, result) => {
				if(err && /^[^/]*$/.test(item.loader) && !/-loader$/.test(item.loader)) {
					return resolver.resolve(contextInfo, context, item.loader + "-loader", err2 => {
						if(!err2) {
							err.message = err.message + "\n" +
								"BREAKING CHANGE: It's no longer allowed to omit the '-loader' suffix when using loaders.\n" +
								`                 You need to specify '${item.loader}-loader' instead of '${item.loader}',\n` +
								"                 see https://webpack.js.org/guides/migrating/#automatic-loader-module-name-extension-removed";
						}
						callback(err);
					});
				}
				if(err) return callback(err);

				const optionsOnly = item.options ? {
					options: item.options
				} : undefined;
				return callback(null, Object.assign({}, item, identToLoaderRequest(result), optionsOnly));
			});
		}, callback);
	}

	getParser(parserOptions) {
		let ident = "null";
		if(parserOptions) {
			if(parserOptions.ident)
				ident = parserOptions.ident;
			else
				ident = JSON.stringify(parserOptions);
		}
		const parser = this.parserCache[ident];
		if(parser)
			return parser;
		return this.parserCache[ident] = this.createParser(parserOptions);
	}

	createParser(parserOptions) {
		const parser = new Parser();
		this.applyPlugins2("parser", parser, parserOptions || {});
		return parser;
	}
}

module.exports = NormalModuleFactory;

}, function(modId) { var map = {"./NormalModule":1602510872156,"./RawModule":1602510872163,"./Parser":1602510872164,"./RuleSet":1602510872166}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872156, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const NativeModule = require("module");
const crypto = require("crypto");

const SourceMapSource = require("webpack-sources").SourceMapSource;
const OriginalSource = require("webpack-sources").OriginalSource;
const RawSource = require("webpack-sources").RawSource;
const ReplaceSource = require("webpack-sources").ReplaceSource;
const CachedSource = require("webpack-sources").CachedSource;
const LineToLineMappedSource = require("webpack-sources").LineToLineMappedSource;

const WebpackError = require("./WebpackError");
const Module = require("./Module");
const ModuleParseError = require("./ModuleParseError");
const ModuleBuildError = require("./ModuleBuildError");
const ModuleError = require("./ModuleError");
const ModuleWarning = require("./ModuleWarning");

const runLoaders = require("loader-runner").runLoaders;
const getContext = require("loader-runner").getContext;

function asString(buf) {
	if(Buffer.isBuffer(buf)) {
		return buf.toString("utf-8");
	}
	return buf;
}

function contextify(context, request) {
	return request.split("!").map(function(r) {
		const splitPath = r.split("?");
		splitPath[0] = path.relative(context, splitPath[0]);
		if(path.sep === "\\")
			splitPath[0] = splitPath[0].replace(/\\/g, "/");
		if(splitPath[0].indexOf("../") !== 0)
			splitPath[0] = "./" + splitPath[0];
		return splitPath.join("?");
	}).join("!");
}

class NonErrorEmittedError extends WebpackError {
	constructor(error) {
		super();

		this.name = "NonErrorEmittedError";
		this.message = "(Emitted value instead of an instance of Error) " + error;

		Error.captureStackTrace(this, this.constructor);
	}
}

const dependencyTemplatesHashMap = new WeakMap();

class NormalModule extends Module {

	constructor(request, userRequest, rawRequest, loaders, resource, parser) {
		super();
		this.request = request;
		this.userRequest = userRequest;
		this.rawRequest = rawRequest;
		this.parser = parser;
		this.resource = resource;
		this.context = getContext(resource);
		this.loaders = loaders;
		this.fileDependencies = [];
		this.contextDependencies = [];
		this.warnings = [];
		this.errors = [];
		this.error = null;
		this._source = null;
		this.assets = {};
		this.built = false;
		this._cachedSource = null;
	}

	identifier() {
		return this.request;
	}

	readableIdentifier(requestShortener) {
		return requestShortener.shorten(this.userRequest);
	}

	libIdent(options) {
		return contextify(options.context, this.userRequest);
	}

	nameForCondition() {
		const idx = this.resource.indexOf("?");
		if(idx >= 0) return this.resource.substr(0, idx);
		return this.resource;
	}

	createSourceForAsset(name, content, sourceMap) {
		if(!sourceMap) {
			return new RawSource(content);
		}

		if(typeof sourceMap === "string") {
			return new OriginalSource(content, sourceMap);
		}

		return new SourceMapSource(content, name, sourceMap);
	}

	createLoaderContext(resolver, options, compilation, fs) {
		const loaderContext = {
			version: 2,
			emitWarning: (warning) => {
				if(!(warning instanceof Error))
					warning = new NonErrorEmittedError(warning);
				this.warnings.push(new ModuleWarning(this, warning));
			},
			emitError: (error) => {
				if(!(error instanceof Error))
					error = new NonErrorEmittedError(error);
				this.errors.push(new ModuleError(this, error));
			},
			exec: (code, filename) => {
				const module = new NativeModule(filename, this);
				module.paths = NativeModule._nodeModulePaths(this.context);
				module.filename = filename;
				module._compile(code, filename);
				return module.exports;
			},
			resolve(context, request, callback) {
				resolver.resolve({}, context, request, callback);
			},
			resolveSync(context, request) {
				return resolver.resolveSync({}, context, request);
			},
			emitFile: (name, content, sourceMap) => {
				this.assets[name] = this.createSourceForAsset(name, content, sourceMap);
			},
			options: options,
			webpack: true,
			sourceMap: !!this.useSourceMap,
			_module: this,
			_compilation: compilation,
			_compiler: compilation.compiler,
			fs: fs,
		};

		compilation.applyPlugins("normal-module-loader", loaderContext, this);
		if(options.loader)
			Object.assign(loaderContext, options.loader);

		return loaderContext;
	}

	createSource(source, resourceBuffer, sourceMap) {
		// if there is no identifier return raw source
		if(!this.identifier) {
			return new RawSource(source);
		}

		// from here on we assume we have an identifier
		const identifier = this.identifier();

		if(this.lineToLine && resourceBuffer) {
			return new LineToLineMappedSource(
				source, identifier, asString(resourceBuffer));
		}

		if(this.useSourceMap && sourceMap) {
			return new SourceMapSource(source, identifier, sourceMap);
		}

		return new OriginalSource(source, identifier);
	}

	doBuild(options, compilation, resolver, fs, callback) {
		this.cacheable = false;
		const loaderContext = this.createLoaderContext(resolver, options, compilation, fs);

		runLoaders({
			resource: this.resource,
			loaders: this.loaders,
			context: loaderContext,
			readResource: fs.readFile.bind(fs)
		}, (err, result) => {
			if(result) {
				this.cacheable = result.cacheable;
				this.fileDependencies = result.fileDependencies;
				this.contextDependencies = result.contextDependencies;
			}

			if(err) {
				const error = new ModuleBuildError(this, err);
				return callback(error);
			}

			const resourceBuffer = result.resourceBuffer;
			const source = result.result[0];
			const sourceMap = result.result[1];

			if(!Buffer.isBuffer(source) && typeof source !== "string") {
				const error = new ModuleBuildError(this, new Error("Final loader didn't return a Buffer or String"));
				return callback(error);
			}

			this._source = this.createSource(asString(source), resourceBuffer, sourceMap);
			return callback();
		});
	}

	disconnect() {
		this.built = false;
		super.disconnect();
	}

	markModuleAsErrored(error) {
		this.meta = null;
		this.error = error;
		this.errors.push(this.error);
		this._source = new RawSource("throw new Error(" + JSON.stringify(this.error.message) + ");");
	}

	applyNoParseRule(rule, content) {
		// must start with "rule" if rule is a string
		if(typeof rule === "string") {
			return content.indexOf(rule) === 0;
		}

		if(typeof rule === "function") {
			return rule(content);
		}
		// we assume rule is a regexp
		return rule.test(content);
	}

	// check if module should not be parsed
	// returns "true" if the module should !not! be parsed
	// returns "false" if the module !must! be parsed
	shouldPreventParsing(noParseRule, request) {
		// if no noParseRule exists, return false
		// the module !must! be parsed.
		if(!noParseRule) {
			return false;
		}

		// we only have one rule to check
		if(!Array.isArray(noParseRule)) {
			// returns "true" if the module is !not! to be parsed
			return this.applyNoParseRule(noParseRule, request);
		}

		for(let i = 0; i < noParseRule.length; i++) {
			const rule = noParseRule[i];
			// early exit on first truthy match
			// this module is !not! to be parsed
			if(this.applyNoParseRule(rule, request)) {
				return true;
			}
		}
		// no match found, so this module !should! be parsed
		return false;
	}

	build(options, compilation, resolver, fs, callback) {
		this.buildTimestamp = Date.now();
		this.built = true;
		this._source = null;
		this.error = null;
		this.errors.length = 0;
		this.warnings.length = 0;
		this.meta = {};

		return this.doBuild(options, compilation, resolver, fs, (err) => {
			this.dependencies.length = 0;
			this.variables.length = 0;
			this.blocks.length = 0;
			this._cachedSource = null;

			// if we have an error mark module as failed and exit
			if(err) {
				this.markModuleAsErrored(err);
				return callback();
			}

			// check if this module should !not! be parsed.
			// if so, exit here;
			const noParseRule = options.module && options.module.noParse;
			if(this.shouldPreventParsing(noParseRule, this.request)) {
				return callback();
			}

			try {
				this.parser.parse(this._source.source(), {
					current: this,
					module: this,
					compilation: compilation,
					options: options
				});
			} catch(e) {
				const source = this._source.source();
				const error = new ModuleParseError(this, source, e);
				this.markModuleAsErrored(error);
				return callback();
			}
			return callback();
		});
	}

	getHashDigest(dependencyTemplates) {
		let dtHash = dependencyTemplatesHashMap.get("hash");
		const hash = crypto.createHash("md5");
		this.updateHash(hash);
		hash.update(`${dtHash}`);
		return hash.digest("hex");
	}

	sourceDependency(dependency, dependencyTemplates, source, outputOptions, requestShortener) {
		const template = dependencyTemplates.get(dependency.constructor);
		if(!template) throw new Error("No template for dependency: " + dependency.constructor.name);
		template.apply(dependency, source, outputOptions, requestShortener, dependencyTemplates);
	}

	sourceVariables(variable, availableVars, dependencyTemplates, outputOptions, requestShortener) {
		const name = variable.name;
		const expr = variable.expressionSource(dependencyTemplates, outputOptions, requestShortener);

		if(availableVars.some(v => v.name === name && v.expression.source() === expr.source())) {
			return;
		}
		return {
			name: name,
			expression: expr
		};
	}

	/*
	 * creates the start part of a IIFE around the module to inject a variable name
	 * (function(...){   <- this part
	 * }.call(...))
	 */
	variableInjectionFunctionWrapperStartCode(varNames) {
		const args = varNames.join(", ");
		return `/* WEBPACK VAR INJECTION */(function(${args}) {`;
	}

	contextArgument(block) {
		if(this === block) {
			return this.exportsArgument || "exports";
		}
		return "this";
	}

	/*
	 * creates the end part of a IIFE around the module to inject a variable name
	 * (function(...){
	 * }.call(...))   <- this part
	 */
	variableInjectionFunctionWrapperEndCode(varExpressions, block) {
		const firstParam = this.contextArgument(block);
		const furtherParams = varExpressions.map(e => e.source()).join(", ");
		return `}.call(${firstParam}, ${furtherParams}))`;
	}

	splitVariablesInUniqueNamedChunks(vars) {
		const startState = [
			[]
		];
		return vars.reduce((chunks, variable) => {
			const current = chunks[chunks.length - 1];
			// check if variable with same name exists already
			// if so create a new chunk of variables.
			const variableNameAlreadyExists = current.some(v => v.name === variable.name);

			if(variableNameAlreadyExists) {
				// start new chunk with current variable
				chunks.push([variable]);
			} else {
				// else add it to current chunk
				current.push(variable);
			}
			return chunks;
		}, startState);
	}

	sourceBlock(block, availableVars, dependencyTemplates, source, outputOptions, requestShortener) {
		block.dependencies.forEach((dependency) => this.sourceDependency(
			dependency, dependencyTemplates, source, outputOptions, requestShortener));

		/**
		 * Get the variables of all blocks that we need to inject.
		 * These will contain the variable name and its expression.
		 * The name will be added as a paramter in a IIFE the expression as its value.
		 */
		const vars = block.variables.reduce((result, value) => {
			const variable = this.sourceVariables(
				value, availableVars, dependencyTemplates, outputOptions, requestShortener);

			if(variable) {
				result.push(variable);
			}

			return result;
		}, []);

		/**
		 * if we actually have variables
		 * this is important as how #splitVariablesInUniqueNamedChunks works
		 * it will always return an array in an array which would lead to a IIFE wrapper around
		 * a module if we do this with an empty vars array.
		 */
		if(vars.length > 0) {
			/**
			 * Split all variables up into chunks of unique names.
			 * e.g. imagine you have the following variable names that need to be injected:
			 * [foo, bar, baz, foo, some, more]
			 * we can not inject "foo" twice, therefore we just make two IIFEs like so:
			 * (function(foo, bar, baz){
			 *   (function(foo, some, more){
			 *     ...
			 *   }(...));
			 * }(...));
			 *
			 * "splitVariablesInUniqueNamedChunks" splits the variables shown above up to this:
			 * [[foo, bar, baz], [foo, some, more]]
			 */
			const injectionVariableChunks = this.splitVariablesInUniqueNamedChunks(vars);

			// create all the beginnings of IIFEs
			const functionWrapperStarts = injectionVariableChunks.map((variableChunk) => {
				return this.variableInjectionFunctionWrapperStartCode(
					variableChunk.map(variable => variable.name)
				);
			});

			// and all the ends
			const functionWrapperEnds = injectionVariableChunks.map((variableChunk) => {
				return this.variableInjectionFunctionWrapperEndCode(
					variableChunk.map(variable => variable.expression), block
				);
			});

			// join them to one big string
			const varStartCode = functionWrapperStarts.join("");

			// reverse the ends first before joining them, as the last added must be the inner most
			const varEndCode = functionWrapperEnds.reverse().join("");

			// if we have anything, add it to the source
			if(varStartCode && varEndCode) {
				const start = block.range ? block.range[0] : -10;
				const end = block.range ? block.range[1] : (this._source.size() + 1);
				source.insert(start + 0.5, varStartCode);
				source.insert(end + 0.5, "\n/* WEBPACK VAR INJECTION */" + varEndCode);
			}
		}

		block.blocks.forEach((block) =>
			this.sourceBlock(
				block,
				availableVars.concat(vars),
				dependencyTemplates,
				source,
				outputOptions,
				requestShortener
			)
		);
	}

	source(dependencyTemplates, outputOptions, requestShortener) {
		const hashDigest = this.getHashDigest(dependencyTemplates);
		if(this._cachedSource && this._cachedSource.hash === hashDigest) {
			return this._cachedSource.source;
		}

		if(!this._source) {
			return new RawSource("throw new Error('No source available');");
		}

		const source = new ReplaceSource(this._source);
		this._cachedSource = {
			source: source,
			hash: hashDigest
		};

		this.sourceBlock(this, [], dependencyTemplates, source, outputOptions, requestShortener);
		return new CachedSource(source);
	}

	originalSource() {
		return this._source;
	}

	getHighestTimestamp(keys, timestampsByKey) {
		let highestTimestamp = 0;
		for(let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const timestamp = timestampsByKey[key];
			// if there is no timestamp yet, early return with Infinity
			if(!timestamp) return Infinity;
			highestTimestamp = Math.max(highestTimestamp, timestamp);
		}
		return highestTimestamp;
	}

	needRebuild(fileTimestamps, contextTimestamps) {
		const highestFileDepTimestamp = this.getHighestTimestamp(
			this.fileDependencies, fileTimestamps);
		// if the hightest is Infinity, we need a rebuild
		// exit early here.
		if(highestFileDepTimestamp === Infinity) {
			return true;
		}

		const highestContextDepTimestamp = this.getHighestTimestamp(
			this.contextDependencies, contextTimestamps);

		// Again if the hightest is Infinity, we need a rebuild
		// exit early here.
		if(highestContextDepTimestamp === Infinity) {
			return true;
		}

		// else take the highest of file and context timestamps and compare
		// to last build timestamp
		return Math.max(highestContextDepTimestamp, highestFileDepTimestamp) >= this.buildTimestamp;
	}

	size() {
		return this._source ? this._source.size() : -1;
	}

	updateHashWithSource(hash) {
		if(!this._source) {
			hash.update("null");
			return;
		}
		hash.update("source");
		this._source.updateHash(hash);
	}

	updateHashWithMeta(hash) {
		hash.update("meta");
		hash.update(JSON.stringify(this.meta));
	}

	updateHash(hash) {
		this.updateHashWithSource(hash);
		this.updateHashWithMeta(hash);
		super.updateHash(hash);
	}

}

module.exports = NormalModule;

}, function(modId) { var map = {"module":1602510872157,"./WebpackError":1602510872127,"./Module":1602510872132,"./ModuleParseError":1602510872158,"./ModuleBuildError":1602510872159,"./ModuleError":1602510872161,"./ModuleWarning":1602510872162}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872157, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const util = require("util");

const DependenciesBlock = require("./DependenciesBlock");
const ModuleReason = require("./ModuleReason");
const SortableSet = require("./util/SortableSet");
const Template = require("./Template");

let debugId = 1000;

const sortById = (a, b) => {
	return a.id - b.id;
};

const sortByDebugId = (a, b) => {
	return a.debugId - b.debugId;
};

class Module extends DependenciesBlock {

	constructor() {
		super();
		this.context = null;
		this.reasons = [];
		this.debugId = debugId++;
		this.id = null;
		this.portableId = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this.used = null;
		this.usedExports = null;
		this.providedExports = null;
		this._chunks = new SortableSet(undefined, sortById);
		this._chunksDebugIdent = undefined;
		this.warnings = [];
		this.dependenciesWarnings = [];
		this.errors = [];
		this.dependenciesErrors = [];
		this.strict = false;
		this.meta = {};
		this.optimizationBailout = [];
	}

	disconnect() {
		this.reasons.length = 0;
		this.id = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this.used = null;
		this.usedExports = null;
		this.providedExports = null;
		this._chunks.clear();
		this._chunksDebugIdent = undefined;
		this.optimizationBailout.length = 0;
		super.disconnect();
	}

	unseal() {
		this.id = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this._chunks.clear();
		this._chunksDebugIdent = undefined;
		super.unseal();
	}

	setChunks(chunks) {
		this._chunks = new SortableSet(chunks, sortById);
		this._chunksDebugIdent = undefined;
	}

	addChunk(chunk) {
		this._chunks.add(chunk);
		this._chunksDebugIdent = undefined;
	}

	removeChunk(chunk) {
		if(this._chunks.delete(chunk)) {
			this._chunksDebugIdent = undefined;
			chunk.removeModule(this);
			return true;
		}
		return false;
	}

	isInChunk(chunk) {
		return this._chunks.has(chunk);
	}

	getChunkIdsIdent() {
		if(this._chunksDebugIdent !== undefined) return this._chunksDebugIdent;
		this._chunks.sortWith(sortByDebugId);
		const chunks = this._chunks;
		const list = [];
		for(const chunk of chunks) {
			const debugId = chunk.debugId;

			if(typeof debugId !== "number") {
				return this._chunksDebugIdent = null;
			}

			list.push(debugId);
		}

		return this._chunksDebugIdent = list.join(",");
	}

	forEachChunk(fn) {
		this._chunks.forEach(fn);
	}

	mapChunks(fn) {
		return Array.from(this._chunks, fn);
	}

	getChunks() {
		return Array.from(this._chunks);
	}

	getNumberOfChunks() {
		return this._chunks.size;
	}

	hasEqualsChunks(otherModule) {
		if(this._chunks.size !== otherModule._chunks.size) return false;
		this._chunks.sortWith(sortByDebugId);
		otherModule._chunks.sortWith(sortByDebugId);
		const a = this._chunks[Symbol.iterator]();
		const b = otherModule._chunks[Symbol.iterator]();
		while(true) { // eslint-disable-line
			const aItem = a.next();
			const bItem = b.next();
			if(aItem.done) return true;
			if(aItem.value !== bItem.value) return false;
		}
	}

	addReason(module, dependency) {
		this.reasons.push(new ModuleReason(module, dependency));
	}

	removeReason(module, dependency) {
		for(let i = 0; i < this.reasons.length; i++) {
			let r = this.reasons[i];
			if(r.module === module && r.dependency === dependency) {
				this.reasons.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	hasReasonForChunk(chunk) {
		for(let i = 0; i < this.reasons.length; i++) {
			if(this.reasons[i].hasChunk(chunk))
				return true;
		}
		return false;
	}

	rewriteChunkInReasons(oldChunk, newChunks) {
		for(let i = 0; i < this.reasons.length; i++) {
			this.reasons[i].rewriteChunks(oldChunk, newChunks);
		}
	}

	isUsed(exportName) {
		if(this.used === null) return exportName;
		if(!exportName) return !!this.used;
		if(!this.used) return false;
		if(!this.usedExports) return false;
		if(this.usedExports === true) return exportName;
		let idx = this.usedExports.indexOf(exportName);
		if(idx < 0) return false;
		if(this.isProvided(exportName))
			return Template.numberToIdentifer(idx);
		return exportName;
	}

	isProvided(exportName) {
		if(!Array.isArray(this.providedExports))
			return null;
		return this.providedExports.indexOf(exportName) >= 0;
	}

	toString() {
		return `Module[${this.id || this.debugId}]`;
	}

	needRebuild(fileTimestamps, contextTimestamps) {
		return true;
	}

	updateHash(hash) {
		hash.update(this.id + "" + this.used);
		hash.update(JSON.stringify(this.usedExports));
		super.updateHash(hash);
	}

	sortItems(sortChunks) {
		super.sortItems();
		if(sortChunks)
			this._chunks.sort();
		this.reasons.sort((a, b) => sortById(a.module, b.module));
		if(Array.isArray(this.usedExports)) {
			this.usedExports.sort();
		}
	}

	unbuild() {
		this.disconnect();
	}
}

Object.defineProperty(Module.prototype, "entry", {
	configurable: false,
	get() {
		throw new Error("Module.entry was removed. Use Chunk.entryModule");
	},
	set() {
		throw new Error("Module.entry was removed. Use Chunk.entryModule");
	}
});

Object.defineProperty(Module.prototype, "chunks", {
	configurable: false,
	get: util.deprecate(function() {
		return Array.from(this._chunks);
	}, "Module.chunks: Use Module.forEachChunk/mapChunks/getNumberOfChunks/isInChunk/addChunk/removeChunk instead"),
	set() {
		throw new Error("Readonly. Use Module.addChunk/removeChunk to modify chunks.");
	}
});

Module.prototype.identifier = null;
Module.prototype.readableIdentifier = null;
Module.prototype.build = null;
Module.prototype.source = null;
Module.prototype.size = null;
Module.prototype.nameForCondition = null;

module.exports = Module;

}, function(modId) { var map = {"./DependenciesBlock":1602510872133,"./ModuleReason":1602510872135,"./util/SortableSet":1602510872136,"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872158, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");

class ModuleParseError extends WebpackError {
	constructor(module, source, err) {
		super();

		this.name = "ModuleParseError";
		this.message = "Module parse failed: " + err.message;
		this.message += "\nYou may need an appropriate loader to handle this file type.";
		if(err.loc && typeof err.loc === "object" && typeof err.loc.line === "number") {
			var lineNumber = err.loc.line;
			if(/[\0\u0001\u0002\u0003\u0004\u0005\u0006\u0007]/.test(source)) { // binary file
				this.message += "\n(Source code omitted for this binary file)";
			} else {
				source = source.split("\n");
				this.message += "\n| " + source.slice(Math.max(0, lineNumber - 3), lineNumber + 2).join("\n| ");
			}
		} else {
			this.message += "\n" + err.stack;
		}
		this.module = module;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ModuleParseError;

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872159, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");
const cutOffLoaderExecution = require("./ErrorHelpers").cutOffLoaderExecution;

class ModuleBuildError extends WebpackError {
	constructor(module, err) {
		super();

		this.name = "ModuleBuildError";
		this.message = "Module build failed: ";
		if(err !== null && typeof err === "object") {
			if(typeof err.stack === "string" && err.stack) {
				var stack = cutOffLoaderExecution(err.stack);
				if(!err.hideStack) {
					this.message += stack;
				} else {
					this.details = stack;
					if(typeof err.message === "string" && err.message) {
						this.message += err.message;
					} else {
						this.message += err;
					}
				}
			} else if(typeof err.message === "string" && err.message) {
				this.message += err.message;
			} else {
				this.message += err;
			}
		}
		this.module = module;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ModuleBuildError;

}, function(modId) { var map = {"./WebpackError":1602510872127,"./ErrorHelpers":1602510872160}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872160, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const loaderFlag = "LOADER_EXECUTION";

exports.cutOffLoaderExecution = (stack) => {
	stack = stack.split("\n");
	for(let i = 0; i < stack.length; i++)
		if(stack[i].indexOf(loaderFlag) >= 0)
			stack.length = i;
	return stack.join("\n");
};

exports.cutOffMessage = (stack, message) => {
	const nextLine = stack.indexOf("\n");
	if(nextLine === -1) {
		return stack === message ? "" : stack;
	} else {
		const firstLine = stack.substr(0, nextLine);
		return firstLine === message ? stack.substr(nextLine + 1) : stack;
	}
};

exports.cleanUp = (stack, message) => {
	stack = exports.cutOffLoaderExecution(stack);
	stack = exports.cutOffMessage(stack, message);
	return stack;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872161, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");
const cleanUp = require("./ErrorHelpers").cleanUp;

class ModuleError extends WebpackError {
	constructor(module, err) {
		super();

		this.name = "ModuleError";
		this.module = module;
		this.message = err && typeof err === "object" && err.message ? err.message : err;
		this.error = err;
		this.details = err && typeof err === "object" && err.stack ? cleanUp(err.stack, this.message) : undefined;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ModuleError;

}, function(modId) { var map = {"./WebpackError":1602510872127,"./ErrorHelpers":1602510872160}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872162, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");
const cleanUp = require("./ErrorHelpers").cleanUp;

class ModuleWarning extends WebpackError {
	constructor(module, warning) {
		super();

		this.name = "ModuleWarning";
		this.module = module;
		this.message = warning && typeof warning === "object" && warning.message ? warning.message : warning;
		this.warning = warning;
		this.details = warning && typeof warning === "object" && warning.stack ? cleanUp(warning.stack, this.message) : undefined;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ModuleWarning;

}, function(modId) { var map = {"./WebpackError":1602510872127,"./ErrorHelpers":1602510872160}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872163, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Module = require("./Module");
const OriginalSource = require("webpack-sources").OriginalSource;
const RawSource = require("webpack-sources").RawSource;

module.exports = class RawModule extends Module {

	constructor(source, identifier, readableIdentifier) {
		super();
		this.sourceStr = source;
		this.identifierStr = identifier || this.sourceStr;
		this.readableIdentifierStr = readableIdentifier || this.identifierStr;
		this.cacheable = true;
		this.built = false;
	}

	identifier() {
		return this.identifierStr;
	}

	size() {
		return this.sourceStr.length;
	}

	readableIdentifier(requestShortener) {
		return requestShortener.shorten(this.readableIdentifierStr);
	}

	needRebuild() {
		return false;
	}

	build(options, compilations, resolver, fs, callback) {
		this.builtTime = Date.now();
		callback();
	}

	source() {
		if(this.useSourceMap)
			return new OriginalSource(this.sourceStr, this.identifier());
		else
			return new RawSource(this.sourceStr);
	}

	updateHash(hash) {
		hash.update(this.sourceStr);
		super.updateHash(hash);
	}
};

}, function(modId) { var map = {"./Module":1602510872132}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872164, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


// Syntax: https://developer.mozilla.org/en/SpiderMonkey/Parser_API

const acorn = require("acorn-dynamic-import").default;
const Tapable = require("tapable");
const json5 = require("json5");
const BasicEvaluatedExpression = require("./BasicEvaluatedExpression");

function joinRanges(startRange, endRange) {
	if(!endRange) return startRange;
	if(!startRange) return endRange;
	return [startRange[0], endRange[1]];
}

const ECMA_VERSION = 2017;

const POSSIBLE_AST_OPTIONS = [{
	ranges: true,
	locations: true,
	ecmaVersion: ECMA_VERSION,
	sourceType: "module",
	plugins: {
		dynamicImport: true
	}
}, {
	ranges: true,
	locations: true,
	ecmaVersion: ECMA_VERSION,
	sourceType: "script",
	plugins: {
		dynamicImport: true
	}
}];

class Parser extends Tapable {
	constructor(options) {
		super();
		this.options = options;
		this.scope = undefined;
		this.state = undefined;
		this.comments = undefined;
		this.initializeEvaluating();
	}

	initializeEvaluating() {
		this.plugin("evaluate Literal", expr => {
			switch(typeof expr.value) {
				case "number":
					return new BasicEvaluatedExpression().setNumber(expr.value).setRange(expr.range);
				case "string":
					return new BasicEvaluatedExpression().setString(expr.value).setRange(expr.range);
				case "boolean":
					return new BasicEvaluatedExpression().setBoolean(expr.value).setRange(expr.range);
			}
			if(expr.value === null)
				return new BasicEvaluatedExpression().setNull().setRange(expr.range);
			if(expr.value instanceof RegExp)
				return new BasicEvaluatedExpression().setRegExp(expr.value).setRange(expr.range);
		});
		this.plugin("evaluate LogicalExpression", function(expr) {
			let left;
			let leftAsBool;
			let right;
			if(expr.operator === "&&") {
				left = this.evaluateExpression(expr.left);
				leftAsBool = left && left.asBool();
				if(leftAsBool === false) return left.setRange(expr.range);
				if(leftAsBool !== true) return;
				right = this.evaluateExpression(expr.right);
				return right.setRange(expr.range);
			} else if(expr.operator === "||") {
				left = this.evaluateExpression(expr.left);
				leftAsBool = left && left.asBool();
				if(leftAsBool === true) return left.setRange(expr.range);
				if(leftAsBool !== false) return;
				right = this.evaluateExpression(expr.right);
				return right.setRange(expr.range);
			}
		});
		this.plugin("evaluate BinaryExpression", function(expr) {
			let left;
			let right;
			let res;
			if(expr.operator === "+") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				res = new BasicEvaluatedExpression();
				if(left.isString()) {
					if(right.isString()) {
						res.setString(left.string + right.string);
					} else if(right.isNumber()) {
						res.setString(left.string + right.number);
					} else if(right.isWrapped() && right.prefix && right.prefix.isString()) {
						res.setWrapped(
							new BasicEvaluatedExpression()
							.setString(left.string + right.prefix.string)
							.setRange(joinRanges(left.range, right.prefix.range)),
							right.postfix);
					} else if(right.isWrapped()) {
						res.setWrapped(
							new BasicEvaluatedExpression()
							.setString(left.string)
							.setRange(left.range),
							right.postfix);
					} else {
						res.setWrapped(left, null);
					}
				} else if(left.isNumber()) {
					if(right.isString()) {
						res.setString(left.number + right.string);
					} else if(right.isNumber()) {
						res.setNumber(left.number + right.number);
					}
				} else if(left.isWrapped()) {
					if(left.postfix && left.postfix.isString() && right.isString()) {
						res.setWrapped(left.prefix,
							new BasicEvaluatedExpression()
							.setString(left.postfix.string + right.string)
							.setRange(joinRanges(left.postfix.range, right.range))
						);
					} else if(left.postfix && left.postfix.isString() && right.isNumber()) {
						res.setWrapped(left.prefix,
							new BasicEvaluatedExpression()
							.setString(left.postfix.string + right.number)
							.setRange(joinRanges(left.postfix.range, right.range))
						);
					} else if(right.isString()) {
						res.setWrapped(left.prefix, right);
					} else if(right.isNumber()) {
						res.setWrapped(left.prefix,
							new BasicEvaluatedExpression()
							.setString(right.number + "")
							.setRange(right.range));
					} else {
						res.setWrapped(left.prefix, new BasicEvaluatedExpression());
					}
				} else {
					if(right.isString()) {
						res.setWrapped(null, right);
					}
				}
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "-") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number - right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "*") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number * right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "/") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number / right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "**") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(Math.pow(left.number, right.number));
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "==" || expr.operator === "===") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				res = new BasicEvaluatedExpression();
				res.setRange(expr.range);
				if(left.isString() && right.isString()) {
					return res.setBoolean(left.string === right.string);
				} else if(left.isNumber() && right.isNumber()) {
					return res.setBoolean(left.number === right.number);
				} else if(left.isBoolean() && right.isBoolean()) {
					return res.setBoolean(left.bool === right.bool);
				}
			} else if(expr.operator === "!=" || expr.operator === "!==") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				res = new BasicEvaluatedExpression();
				res.setRange(expr.range);
				if(left.isString() && right.isString()) {
					return res.setBoolean(left.string !== right.string);
				} else if(left.isNumber() && right.isNumber()) {
					return res.setBoolean(left.number !== right.number);
				} else if(left.isBoolean() && right.isBoolean()) {
					return res.setBoolean(left.bool !== right.bool);
				}
			} else if(expr.operator === "&") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number & right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "|") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number | right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "^") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number ^ right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === ">>>") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number >>> right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === ">>") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number >> right.number);
				res.setRange(expr.range);
				return res;
			} else if(expr.operator === "<<") {
				left = this.evaluateExpression(expr.left);
				right = this.evaluateExpression(expr.right);
				if(!left || !right) return;
				if(!left.isNumber() || !right.isNumber()) return;
				res = new BasicEvaluatedExpression();
				res.setNumber(left.number << right.number);
				res.setRange(expr.range);
				return res;
			}
		});
		this.plugin("evaluate UnaryExpression", function(expr) {
			if(expr.operator === "typeof") {
				let res;
				let name;
				if(expr.argument.type === "Identifier") {
					name = this.scope.renames["$" + expr.argument.name] || expr.argument.name;
					if(this.scope.definitions.indexOf(name) === -1) {
						res = this.applyPluginsBailResult1("evaluate typeof " + name, expr);
						if(res !== undefined) return res;
					}
				}
				if(expr.argument.type === "MemberExpression") {
					const exprName = this.getNameForExpression(expr.argument);
					if(exprName && exprName.free) {
						res = this.applyPluginsBailResult1("evaluate typeof " + exprName.name, expr);
						if(res !== undefined) return res;
					}
				}
				if(expr.argument.type === "FunctionExpression") {
					return new BasicEvaluatedExpression().setString("function").setRange(expr.range);
				}
				const arg = this.evaluateExpression(expr.argument);
				if(arg.isString() || arg.isWrapped()) return new BasicEvaluatedExpression().setString("string").setRange(expr.range);
				else if(arg.isNumber()) return new BasicEvaluatedExpression().setString("number").setRange(expr.range);
				else if(arg.isBoolean()) return new BasicEvaluatedExpression().setString("boolean").setRange(expr.range);
				else if(arg.isArray() || arg.isConstArray() || arg.isRegExp()) return new BasicEvaluatedExpression().setString("object").setRange(expr.range);
			} else if(expr.operator === "!") {
				const argument = this.evaluateExpression(expr.argument);
				if(!argument) return;
				if(argument.isBoolean()) {
					return new BasicEvaluatedExpression().setBoolean(!argument.bool).setRange(expr.range);
				} else if(argument.isTruthy()) {
					return new BasicEvaluatedExpression().setBoolean(false).setRange(expr.range);
				} else if(argument.isFalsy()) {
					return new BasicEvaluatedExpression().setBoolean(true).setRange(expr.range);
				} else if(argument.isString()) {
					return new BasicEvaluatedExpression().setBoolean(!argument.string).setRange(expr.range);
				} else if(argument.isNumber()) {
					return new BasicEvaluatedExpression().setBoolean(!argument.number).setRange(expr.range);
				}
			} else if(expr.operator === "~") {
				const argument = this.evaluateExpression(expr.argument);
				if(!argument) return;
				if(!argument.isNumber()) return;
				const res = new BasicEvaluatedExpression();
				res.setNumber(~argument.number);
				res.setRange(expr.range);
				return res;
			}
		});
		this.plugin("evaluate typeof undefined", function(expr) {
			return new BasicEvaluatedExpression().setString("undefined").setRange(expr.range);
		});
		this.plugin("evaluate Identifier", function(expr) {
			const name = this.scope.renames["$" + expr.name] || expr.name;
			if(this.scope.definitions.indexOf(expr.name) === -1) {
				const result = this.applyPluginsBailResult1("evaluate Identifier " + name, expr);
				if(result) return result;
				return new BasicEvaluatedExpression().setIdentifier(name).setRange(expr.range);
			} else {
				return this.applyPluginsBailResult1("evaluate defined Identifier " + name, expr);
			}
		});
		this.plugin("evaluate ThisExpression", function(expr) {
			const name = this.scope.renames.$this;
			if(name) {
				const result = this.applyPluginsBailResult1("evaluate Identifier " + name, expr);
				if(result) return result;
				return new BasicEvaluatedExpression().setIdentifier(name).setRange(expr.range);
			}
		});
		this.plugin("evaluate MemberExpression", function(expression) {
			let exprName = this.getNameForExpression(expression);
			if(exprName) {
				if(exprName.free) {
					const result = this.applyPluginsBailResult1("evaluate Identifier " + exprName.name, expression);
					if(result) return result;
					return new BasicEvaluatedExpression().setIdentifier(exprName.name).setRange(expression.range);
				} else {
					return this.applyPluginsBailResult1("evaluate defined Identifier " + exprName.name, expression);
				}
			}
		});
		this.plugin("evaluate CallExpression", function(expr) {
			if(expr.callee.type !== "MemberExpression") return;
			if(expr.callee.property.type !== (expr.callee.computed ? "Literal" : "Identifier")) return;
			const param = this.evaluateExpression(expr.callee.object);
			if(!param) return;
			const property = expr.callee.property.name || expr.callee.property.value;
			return this.applyPluginsBailResult("evaluate CallExpression ." + property, expr, param);
		});
		this.plugin("evaluate CallExpression .replace", function(expr, param) {
			if(!param.isString()) return;
			if(expr.arguments.length !== 2) return;
			let arg1 = this.evaluateExpression(expr.arguments[0]);
			let arg2 = this.evaluateExpression(expr.arguments[1]);
			if(!arg1.isString() && !arg1.isRegExp()) return;
			arg1 = arg1.regExp || arg1.string;
			if(!arg2.isString()) return;
			arg2 = arg2.string;
			return new BasicEvaluatedExpression().setString(param.string.replace(arg1, arg2)).setRange(expr.range);
		});
		["substr", "substring"].forEach(fn => {
			this.plugin("evaluate CallExpression ." + fn, function(expr, param) {
				if(!param.isString()) return;
				let arg1;
				let result, str = param.string;
				switch(expr.arguments.length) {
					case 1:
						arg1 = this.evaluateExpression(expr.arguments[0]);
						if(!arg1.isNumber()) return;
						result = str[fn](arg1.number);
						break;
					case 2:
						{
							arg1 = this.evaluateExpression(expr.arguments[0]);
							const arg2 = this.evaluateExpression(expr.arguments[1]);
							if(!arg1.isNumber()) return;
							if(!arg2.isNumber()) return;
							result = str[fn](arg1.number, arg2.number);
							break;
						}
					default:
						return;
				}
				return new BasicEvaluatedExpression().setString(result).setRange(expr.range);
			});
		});

		/**
		 * @param {string} kind "cooked" | "raw"
		 * @param {any[]} quasis quasis
		 * @param {any[]} expressions expressions
		 * @return {BasicEvaluatedExpression[]} Simplified template
		 */
		function getSimplifiedTemplateResult(kind, quasis, expressions) {
			const parts = [];

			for(let i = 0; i < quasis.length; i++) {
				parts.push(new BasicEvaluatedExpression().setString(quasis[i].value[kind]).setRange(quasis[i].range));

				if(i > 0) {
					const prevExpr = parts[parts.length - 2],
						lastExpr = parts[parts.length - 1];
					const expr = this.evaluateExpression(expressions[i - 1]);
					if(!(expr.isString() || expr.isNumber())) continue;

					prevExpr.setString(prevExpr.string + (expr.isString() ? expr.string : expr.number) + lastExpr.string);
					prevExpr.setRange([prevExpr.range[0], lastExpr.range[1]]);
					parts.pop();
				}
			}
			return parts;
		}

		this.plugin("evaluate TemplateLiteral", function(node) {
			const parts = getSimplifiedTemplateResult.call(this, "cooked", node.quasis, node.expressions);
			if(parts.length === 1) {
				return parts[0].setRange(node.range);
			}
			return new BasicEvaluatedExpression().setTemplateString(parts).setRange(node.range);
		});
		this.plugin("evaluate TaggedTemplateExpression", function(node) {
			if(this.evaluateExpression(node.tag).identifier !== "String.raw") return;
			const parts = getSimplifiedTemplateResult.call(this, "raw", node.quasi.quasis, node.quasi.expressions);
			return new BasicEvaluatedExpression().setTemplateString(parts).setRange(node.range);
		});

		this.plugin("evaluate CallExpression .concat", function(expr, param) {
			if(!param.isString() && !param.isWrapped()) return;

			let stringSuffix = null;
			let hasUnknownParams = false;
			for(let i = expr.arguments.length - 1; i >= 0; i--) {
				const argExpr = this.evaluateExpression(expr.arguments[i]);
				if(!argExpr.isString() && !argExpr.isNumber()) {
					hasUnknownParams = true;
					break;
				}

				const value = argExpr.isString() ? argExpr.string : "" + argExpr.number;

				const newString = value + (stringSuffix ? stringSuffix.string : "");
				const newRange = [argExpr.range[0], (stringSuffix || argExpr).range[1]];
				stringSuffix = new BasicEvaluatedExpression().setString(newString).setRange(newRange);
			}

			if(hasUnknownParams) {
				const prefix = param.isString() ? param : param.prefix;
				return new BasicEvaluatedExpression().setWrapped(prefix, stringSuffix).setRange(expr.range);
			} else if(param.isWrapped()) {
				const postfix = stringSuffix || param.postfix;
				return new BasicEvaluatedExpression().setWrapped(param.prefix, postfix).setRange(expr.range);
			} else {
				const newString = param.string + (stringSuffix ? stringSuffix.string : "");
				return new BasicEvaluatedExpression().setString(newString).setRange(expr.range);
			}
		});
		this.plugin("evaluate CallExpression .split", function(expr, param) {
			if(!param.isString()) return;
			if(expr.arguments.length !== 1) return;
			let result;
			const arg = this.evaluateExpression(expr.arguments[0]);
			if(arg.isString()) {
				result = param.string.split(arg.string);
			} else if(arg.isRegExp()) {
				result = param.string.split(arg.regExp);
			} else return;
			return new BasicEvaluatedExpression().setArray(result).setRange(expr.range);
		});
		this.plugin("evaluate ConditionalExpression", function(expr) {
			const condition = this.evaluateExpression(expr.test);
			const conditionValue = condition.asBool();
			let res;
			if(conditionValue === undefined) {
				const consequent = this.evaluateExpression(expr.consequent);
				const alternate = this.evaluateExpression(expr.alternate);
				if(!consequent || !alternate) return;
				res = new BasicEvaluatedExpression();
				if(consequent.isConditional())
					res.setOptions(consequent.options);
				else
					res.setOptions([consequent]);
				if(alternate.isConditional())
					res.addOptions(alternate.options);
				else
					res.addOptions([alternate]);
			} else {
				res = this.evaluateExpression(conditionValue ? expr.consequent : expr.alternate);
			}
			res.setRange(expr.range);
			return res;
		});
		this.plugin("evaluate ArrayExpression", function(expr) {
			const items = expr.elements.map(function(element) {
				return element !== null && this.evaluateExpression(element);
			}, this);
			if(!items.every(Boolean)) return;
			return new BasicEvaluatedExpression().setItems(items).setRange(expr.range);
		});
	}

	getRenameIdentifier(expr) {
		const result = this.evaluateExpression(expr);
		if(!result) return;
		if(result.isIdentifier()) return result.identifier;
		return;
	}

	walkClass(classy) {
		if(classy.superClass)
			this.walkExpression(classy.superClass);
		if(classy.body && classy.body.type === "ClassBody") {
			classy.body.body.forEach(methodDefinition => {
				if(methodDefinition.type === "MethodDefinition")
					this.walkMethodDefinition(methodDefinition);
			});
		}
	}

	walkMethodDefinition(methodDefinition) {
		if(methodDefinition.computed && methodDefinition.key)
			this.walkExpression(methodDefinition.key);
		if(methodDefinition.value)
			this.walkExpression(methodDefinition.value);
	}

	// Prewalking iterates the scope for variable declarations
	prewalkStatements(statements) {
		for(let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.prewalkStatement(statement);
		}
	}

	// Walking iterates the statements and expressions and processes them
	walkStatements(statements) {
		for(let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.walkStatement(statement);
		}
	}

	prewalkStatement(statement) {
		const handler = this["prewalk" + statement.type];
		if(handler)
			handler.call(this, statement);
	}

	walkStatement(statement) {
		if(this.applyPluginsBailResult1("statement", statement) !== undefined) return;
		const handler = this["walk" + statement.type];
		if(handler)
			handler.call(this, statement);
	}

	// Real Statements
	prewalkBlockStatement(statement) {
		this.prewalkStatements(statement.body);
	}

	walkBlockStatement(statement) {
		this.walkStatements(statement.body);
	}

	walkExpressionStatement(statement) {
		this.walkExpression(statement.expression);
	}

	prewalkIfStatement(statement) {
		this.prewalkStatement(statement.consequent);
		if(statement.alternate)
			this.prewalkStatement(statement.alternate);
	}

	walkIfStatement(statement) {
		const result = this.applyPluginsBailResult1("statement if", statement);
		if(result === undefined) {
			this.walkExpression(statement.test);
			this.walkStatement(statement.consequent);
			if(statement.alternate)
				this.walkStatement(statement.alternate);
		} else {
			if(result)
				this.walkStatement(statement.consequent);
			else if(statement.alternate)
				this.walkStatement(statement.alternate);
		}
	}

	prewalkLabeledStatement(statement) {
		this.prewalkStatement(statement.body);
	}

	walkLabeledStatement(statement) {
		const result = this.applyPluginsBailResult1("label " + statement.label.name, statement);
		if(result !== true)
			this.walkStatement(statement.body);
	}

	prewalkWithStatement(statement) {
		this.prewalkStatement(statement.body);
	}

	walkWithStatement(statement) {
		this.walkExpression(statement.object);
		this.walkStatement(statement.body);
	}

	prewalkSwitchStatement(statement) {
		this.prewalkSwitchCases(statement.cases);
	}

	walkSwitchStatement(statement) {
		this.walkExpression(statement.discriminant);
		this.walkSwitchCases(statement.cases);
	}

	walkTerminatingStatement(statement) {
		if(statement.argument)
			this.walkExpression(statement.argument);
	}

	walkReturnStatement(statement) {
		this.walkTerminatingStatement(statement);
	}

	walkThrowStatement(statement) {
		this.walkTerminatingStatement(statement);
	}

	prewalkTryStatement(statement) {
		this.prewalkStatement(statement.block);
	}

	walkTryStatement(statement) {
		if(this.scope.inTry) {
			this.walkStatement(statement.block);
		} else {
			this.scope.inTry = true;
			this.walkStatement(statement.block);
			this.scope.inTry = false;
		}
		if(statement.handler)
			this.walkCatchClause(statement.handler);
		if(statement.finalizer)
			this.walkStatement(statement.finalizer);
	}

	prewalkWhileStatement(statement) {
		this.prewalkStatement(statement.body);
	}

	walkWhileStatement(statement) {
		this.walkExpression(statement.test);
		this.walkStatement(statement.body);
	}

	prewalkDoWhileStatement(statement) {
		this.prewalkStatement(statement.body);
	}

	walkDoWhileStatement(statement) {
		this.walkStatement(statement.body);
		this.walkExpression(statement.test);
	}

	prewalkForStatement(statement) {
		if(statement.init) {
			if(statement.init.type === "VariableDeclaration")
				this.prewalkStatement(statement.init);
		}
		this.prewalkStatement(statement.body);
	}

	walkForStatement(statement) {
		if(statement.init) {
			if(statement.init.type === "VariableDeclaration")
				this.walkStatement(statement.init);
			else
				this.walkExpression(statement.init);
		}
		if(statement.test)
			this.walkExpression(statement.test);
		if(statement.update)
			this.walkExpression(statement.update);
		this.walkStatement(statement.body);
	}

	prewalkForInStatement(statement) {
		if(statement.left.type === "VariableDeclaration")
			this.prewalkStatement(statement.left);
		this.prewalkStatement(statement.body);
	}

	walkForInStatement(statement) {
		if(statement.left.type === "VariableDeclaration")
			this.walkStatement(statement.left);
		else
			this.walkExpression(statement.left);
		this.walkExpression(statement.right);
		this.walkStatement(statement.body);
	}

	prewalkForOfStatement(statement) {
		if(statement.left.type === "VariableDeclaration")
			this.prewalkStatement(statement.left);
		this.prewalkStatement(statement.body);
	}

	walkForOfStatement(statement) {
		if(statement.left.type === "VariableDeclaration")
			this.walkStatement(statement.left);
		else
			this.walkExpression(statement.left);
		this.walkExpression(statement.right);
		this.walkStatement(statement.body);
	}

	// Declarations
	prewalkFunctionDeclaration(statement) {
		if(statement.id) {
			this.scope.renames["$" + statement.id.name] = undefined;
			this.scope.definitions.push(statement.id.name);
		}
	}

	walkFunctionDeclaration(statement) {
		statement.params.forEach(param => {
			this.walkPattern(param);
		});
		this.inScope(statement.params, () => {
			if(statement.body.type === "BlockStatement") {
				this.prewalkStatement(statement.body);
				this.walkStatement(statement.body);
			} else {
				this.walkExpression(statement.body);
			}
		});
	}

	prewalkImportDeclaration(statement) {
		const source = statement.source.value;
		this.applyPluginsBailResult("import", statement, source);
		statement.specifiers.forEach(function(specifier) {
			const name = specifier.local.name;
			this.scope.renames["$" + name] = undefined;
			this.scope.definitions.push(name);
			switch(specifier.type) {
				case "ImportDefaultSpecifier":
					this.applyPluginsBailResult("import specifier", statement, source, "default", name);
					break;
				case "ImportSpecifier":
					this.applyPluginsBailResult("import specifier", statement, source, specifier.imported.name, name);
					break;
				case "ImportNamespaceSpecifier":
					this.applyPluginsBailResult("import specifier", statement, source, null, name);
					break;
			}
		}, this);
	}

	prewalkExportNamedDeclaration(statement) {
		let source;
		if(statement.source) {
			source = statement.source.value;
			this.applyPluginsBailResult("export import", statement, source);
		} else {
			this.applyPluginsBailResult1("export", statement);
		}
		if(statement.declaration) {
			if(/Expression$/.test(statement.declaration.type)) {
				throw new Error("Doesn't occur?");
			} else {
				if(!this.applyPluginsBailResult("export declaration", statement, statement.declaration)) {
					const pos = this.scope.definitions.length;
					this.prewalkStatement(statement.declaration);
					const newDefs = this.scope.definitions.slice(pos);
					for(let index = newDefs.length - 1; index >= 0; index--) {
						const def = newDefs[index];
						this.applyPluginsBailResult("export specifier", statement, def, def, index);
					}
				}
			}
		}
		if(statement.specifiers) {
			for(let specifierIndex = 0; specifierIndex < statement.specifiers.length; specifierIndex++) {
				const specifier = statement.specifiers[specifierIndex];
				switch(specifier.type) {
					case "ExportSpecifier":
						{
							const name = specifier.exported.name;
							if(source)
								this.applyPluginsBailResult("export import specifier", statement, source, specifier.local.name, name, specifierIndex);
							else
								this.applyPluginsBailResult("export specifier", statement, specifier.local.name, name, specifierIndex);
							break;
						}
				}
			}
		}
	}

	walkExportNamedDeclaration(statement) {
		if(statement.declaration) {
			this.walkStatement(statement.declaration);
		}
	}

	prewalkExportDefaultDeclaration(statement) {
		if(/Declaration$/.test(statement.declaration.type)) {
			const pos = this.scope.definitions.length;
			this.prewalkStatement(statement.declaration);
			const newDefs = this.scope.definitions.slice(pos);
			for(let index = 0, len = newDefs.length; index < len; index++) {
				const def = newDefs[index];
				this.applyPluginsBailResult("export specifier", statement, def, "default");
			}
		}
	}

	walkExportDefaultDeclaration(statement) {
		this.applyPluginsBailResult1("export", statement);
		if(/Declaration$/.test(statement.declaration.type)) {
			if(!this.applyPluginsBailResult("export declaration", statement, statement.declaration)) {
				this.walkStatement(statement.declaration);
			}
		} else {
			this.walkExpression(statement.declaration);
			if(!this.applyPluginsBailResult("export expression", statement, statement.declaration)) {
				this.applyPluginsBailResult("export specifier", statement, statement.declaration, "default");
			}
		}
	}

	prewalkExportAllDeclaration(statement) {
		const source = statement.source.value;
		this.applyPluginsBailResult("export import", statement, source);
		this.applyPluginsBailResult("export import specifier", statement, source, null, null, 0);
	}

	prewalkVariableDeclaration(statement) {
		if(statement.declarations)
			this.prewalkVariableDeclarators(statement.declarations);
	}

	walkVariableDeclaration(statement) {
		if(statement.declarations)
			this.walkVariableDeclarators(statement.declarations);
	}

	prewalkClassDeclaration(statement) {
		if(statement.id) {
			this.scope.renames["$" + statement.id.name] = undefined;
			this.scope.definitions.push(statement.id.name);
		}
	}

	walkClassDeclaration(statement) {
		this.walkClass(statement);
	}

	prewalkSwitchCases(switchCases) {
		for(let index = 0, len = switchCases.length; index < len; index++) {
			const switchCase = switchCases[index];
			this.prewalkStatements(switchCase.consequent);
		}
	}

	walkSwitchCases(switchCases) {
		for(let index = 0, len = switchCases.length; index < len; index++) {
			const switchCase = switchCases[index];

			if(switchCase.test) {
				this.walkExpression(switchCase.test);
			}
			this.walkStatements(switchCase.consequent);
		}
	}

	walkCatchClause(catchClause) {
		this.inScope([catchClause.param], () => {
			this.prewalkStatement(catchClause.body);
			this.walkStatement(catchClause.body);
		});
	}

	prewalkVariableDeclarators(declarators) {
		declarators.forEach(declarator => {
			switch(declarator.type) {
				case "VariableDeclarator":
					{
						this.enterPattern(declarator.id, (name, decl) => {
							if(!this.applyPluginsBailResult1("var-" + declarator.kind + " " + name, decl)) {
								if(!this.applyPluginsBailResult1("var " + name, decl)) {
									this.scope.renames["$" + name] = undefined;
									if(this.scope.definitions.indexOf(name) < 0)
										this.scope.definitions.push(name);
								}
							}
						});
						break;
					}
			}
		});
	}

	walkVariableDeclarators(declarators) {
		declarators.forEach(declarator => {
			switch(declarator.type) {
				case "VariableDeclarator":
					{
						const renameIdentifier = declarator.init && this.getRenameIdentifier(declarator.init);
						if(renameIdentifier && declarator.id.type === "Identifier" && this.applyPluginsBailResult1("can-rename " + renameIdentifier, declarator.init)) {
							// renaming with "var a = b;"
							if(!this.applyPluginsBailResult1("rename " + renameIdentifier, declarator.init)) {
								this.scope.renames["$" + declarator.id.name] = this.scope.renames["$" + renameIdentifier] || renameIdentifier;
								const idx = this.scope.definitions.indexOf(declarator.id.name);
								if(idx >= 0) this.scope.definitions.splice(idx, 1);
							}
						} else {
							this.walkPattern(declarator.id);
							if(declarator.init)
								this.walkExpression(declarator.init);
						}
						break;
					}
			}
		});
	}

	walkPattern(pattern) {
		if(pattern.type === "Identifier")
			return;
		if(this["walk" + pattern.type])
			this["walk" + pattern.type](pattern);
	}

	walkAssignmentPattern(pattern) {
		this.walkExpression(pattern.right);
		this.walkPattern(pattern.left);
	}

	walkObjectPattern(pattern) {
		for(let i = 0, len = pattern.properties.length; i < len; i++) {
			const prop = pattern.properties[i];
			if(prop) {
				if(prop.computed)
					this.walkExpression(prop.key);
				if(prop.value)
					this.walkPattern(prop.value);
			}
		}
	}

	walkArrayPattern(pattern) {
		for(let i = 0, len = pattern.elements.length; i < len; i++) {
			const element = pattern.elements[i];
			if(element)
				this.walkPattern(element);
		}
	}

	walkRestElement(pattern) {
		this.walkPattern(pattern.argument);
	}

	walkExpressions(expressions) {
		for(let expressionsIndex = 0, len = expressions.length; expressionsIndex < len; expressionsIndex++) {
			const expression = expressions[expressionsIndex];
			if(expression)
				this.walkExpression(expression);
		}
	}

	walkExpression(expression) {
		if(this["walk" + expression.type])
			return this["walk" + expression.type](expression);
	}

	walkAwaitExpression(expression) {
		const argument = expression.argument;
		if(this["walk" + argument.type])
			return this["walk" + argument.type](argument);
	}

	walkArrayExpression(expression) {
		if(expression.elements)
			this.walkExpressions(expression.elements);
	}

	walkSpreadElement(expression) {
		if(expression.argument)
			this.walkExpression(expression.argument);
	}

	walkObjectExpression(expression) {
		for(let propIndex = 0, len = expression.properties.length; propIndex < len; propIndex++) {
			const prop = expression.properties[propIndex];
			if(prop.computed)
				this.walkExpression(prop.key);
			if(prop.shorthand)
				this.scope.inShorthand = true;
			this.walkExpression(prop.value);
			if(prop.shorthand)
				this.scope.inShorthand = false;
		}
	}

	walkFunctionExpression(expression) {
		expression.params.forEach(param => {
			this.walkPattern(param);
		});
		this.inScope(expression.params, () => {
			if(expression.body.type === "BlockStatement") {
				this.prewalkStatement(expression.body);
				this.walkStatement(expression.body);
			} else {
				this.walkExpression(expression.body);
			}
		});
	}

	walkArrowFunctionExpression(expression) {
		expression.params.forEach(param => {
			this.walkPattern(param);
		});
		this.inScope(expression.params, () => {
			if(expression.body.type === "BlockStatement") {
				this.prewalkStatement(expression.body);
				this.walkStatement(expression.body);
			} else {
				this.walkExpression(expression.body);
			}
		});
	}

	walkSequenceExpression(expression) {
		if(expression.expressions)
			this.walkExpressions(expression.expressions);
	}

	walkUpdateExpression(expression) {
		this.walkExpression(expression.argument);
	}

	walkUnaryExpression(expression) {
		if(expression.operator === "typeof") {
			const exprName = this.getNameForExpression(expression.argument);
			if(exprName && exprName.free) {
				const result = this.applyPluginsBailResult1("typeof " + exprName.name, expression);
				if(result === true)
					return;
			}
		}
		this.walkExpression(expression.argument);
	}

	walkLeftRightExpression(expression) {
		this.walkExpression(expression.left);
		this.walkExpression(expression.right);
	}

	walkBinaryExpression(expression) {
		this.walkLeftRightExpression(expression);
	}

	walkLogicalExpression(expression) {
		this.walkLeftRightExpression(expression);
	}

	walkAssignmentExpression(expression) {
		const renameIdentifier = this.getRenameIdentifier(expression.right);
		if(expression.left.type === "Identifier" && renameIdentifier && this.applyPluginsBailResult1("can-rename " + renameIdentifier, expression.right)) {
			// renaming "a = b;"
			if(!this.applyPluginsBailResult1("rename " + renameIdentifier, expression.right)) {
				this.scope.renames["$" + expression.left.name] = renameIdentifier;
				const idx = this.scope.definitions.indexOf(expression.left.name);
				if(idx >= 0) this.scope.definitions.splice(idx, 1);
			}
		} else if(expression.left.type === "Identifier") {
			if(!this.applyPluginsBailResult1("assigned " + expression.left.name, expression)) {
				this.walkExpression(expression.right);
			}
			this.scope.renames["$" + expression.left.name] = undefined;
			if(!this.applyPluginsBailResult1("assign " + expression.left.name, expression)) {
				this.walkExpression(expression.left);
			}
		} else {
			this.walkExpression(expression.right);
			this.walkPattern(expression.left);
			this.enterPattern(expression.left, (name, decl) => {
				this.scope.renames["$" + name] = undefined;
			});
		}
	}

	walkConditionalExpression(expression) {
		const result = this.applyPluginsBailResult1("expression ?:", expression);
		if(result === undefined) {
			this.walkExpression(expression.test);
			this.walkExpression(expression.consequent);
			if(expression.alternate)
				this.walkExpression(expression.alternate);
		} else {
			if(result)
				this.walkExpression(expression.consequent);
			else if(expression.alternate)
				this.walkExpression(expression.alternate);
		}
	}

	walkNewExpression(expression) {
		const callee = this.evaluateExpression(expression.callee);
		if(callee.isIdentifier()) {
			const result = this.applyPluginsBailResult("new " + callee.identifier, expression);
			if(result === true) {
				return;
			}
		}

		this.walkExpression(expression.callee);
		if(expression.arguments)
			this.walkExpressions(expression.arguments);
	}

	walkYieldExpression(expression) {
		if(expression.argument)
			this.walkExpression(expression.argument);
	}

	walkTemplateLiteral(expression) {
		if(expression.expressions)
			this.walkExpressions(expression.expressions);
	}

	walkTaggedTemplateExpression(expression) {
		if(expression.tag)
			this.walkExpression(expression.tag);
		if(expression.quasi && expression.quasi.expressions)
			this.walkExpressions(expression.quasi.expressions);
	}

	walkClassExpression(expression) {
		this.walkClass(expression);
	}

	walkCallExpression(expression) {
		let result;

		function walkIIFE(functionExpression, options, currentThis) {
			function renameArgOrThis(argOrThis) {
				const renameIdentifier = this.getRenameIdentifier(argOrThis);
				if(renameIdentifier && this.applyPluginsBailResult1("can-rename " + renameIdentifier, argOrThis)) {
					if(!this.applyPluginsBailResult1("rename " + renameIdentifier, argOrThis))
						return renameIdentifier;
				}
				this.walkExpression(argOrThis);
			}
			const params = functionExpression.params;
			const renameThis = currentThis ? renameArgOrThis.call(this, currentThis) : null;
			const args = options.map(renameArgOrThis, this);
			this.inScope(params.filter(function(identifier, idx) {
				return !args[idx];
			}), () => {
				if(renameThis) {
					this.scope.renames.$this = renameThis;
				}
				for(let i = 0; i < args.length; i++) {
					const param = args[i];
					if(!param) continue;
					if(!params[i] || params[i].type !== "Identifier") continue;
					this.scope.renames["$" + params[i].name] = param;
				}
				if(functionExpression.body.type === "BlockStatement") {
					this.prewalkStatement(functionExpression.body);
					this.walkStatement(functionExpression.body);
				} else
					this.walkExpression(functionExpression.body);
			});
		}
		if(expression.callee.type === "MemberExpression" &&
			expression.callee.object.type === "FunctionExpression" &&
			!expression.callee.computed &&
			(["call", "bind"]).indexOf(expression.callee.property.name) >= 0 &&
			expression.arguments &&
			expression.arguments.length > 0
		) {
			// (function(...) { }.call/bind(?, ...))
			walkIIFE.call(this, expression.callee.object, expression.arguments.slice(1), expression.arguments[0]);
		} else if(expression.callee.type === "FunctionExpression" && expression.arguments) {
			// (function(...) { }(...))
			walkIIFE.call(this, expression.callee, expression.arguments);
		} else if(expression.callee.type === "Import") {
			result = this.applyPluginsBailResult1("import-call", expression);
			if(result === true)
				return;

			if(expression.arguments)
				this.walkExpressions(expression.arguments);
		} else {

			const callee = this.evaluateExpression(expression.callee);
			if(callee.isIdentifier()) {
				result = this.applyPluginsBailResult1("call " + callee.identifier, expression);
				if(result === true)
					return;
				let identifier = callee.identifier.replace(/\.[^.]+$/, ".*");
				if(identifier !== callee.identifier) {
					result = this.applyPluginsBailResult1("call " + identifier, expression);
					if(result === true)
						return;
				}
			}

			if(expression.callee)
				this.walkExpression(expression.callee);
			if(expression.arguments)
				this.walkExpressions(expression.arguments);
		}
	}

	walkMemberExpression(expression) {
		const exprName = this.getNameForExpression(expression);
		if(exprName && exprName.free) {
			let result = this.applyPluginsBailResult1("expression " + exprName.name, expression);
			if(result === true)
				return;
			result = this.applyPluginsBailResult1("expression " + exprName.nameGeneral, expression);
			if(result === true)
				return;
		}
		this.walkExpression(expression.object);
		if(expression.computed === true)
			this.walkExpression(expression.property);
	}

	walkIdentifier(expression) {
		if(this.scope.definitions.indexOf(expression.name) === -1) {
			const result = this.applyPluginsBailResult1("expression " + (this.scope.renames["$" + expression.name] || expression.name), expression);
			if(result === true)
				return;
		}
	}

	inScope(params, fn) {
		const oldScope = this.scope;
		this.scope = {
			inTry: false,
			inShorthand: false,
			definitions: oldScope.definitions.slice(),
			renames: Object.create(oldScope.renames)
		};

		this.scope.renames.$this = undefined;

		for(let paramIndex = 0, len = params.length; paramIndex < len; paramIndex++) {
			const param = params[paramIndex];

			if(typeof param !== "string") {
				this.enterPattern(param, param => {
					this.scope.renames["$" + param] = undefined;
					this.scope.definitions.push(param);
				});
			} else {
				this.scope.renames["$" + param] = undefined;
				this.scope.definitions.push(param);
			}
		}

		fn();
		this.scope = oldScope;
	}

	enterPattern(pattern, onIdent) {
		if(pattern && this["enter" + pattern.type])
			this["enter" + pattern.type](pattern, onIdent);
	}

	enterIdentifier(pattern, onIdent) {
		onIdent(pattern.name, pattern);
	}

	enterObjectPattern(pattern, onIdent) {
		for(let propIndex = 0, len = pattern.properties.length; propIndex < len; propIndex++) {
			const prop = pattern.properties[propIndex];
			this.enterPattern(prop.value, onIdent);
		}
	}

	enterArrayPattern(pattern, onIdent) {
		for(let elementIndex = 0, len = pattern.elements.length; elementIndex < len; elementIndex++) {
			const element = pattern.elements[elementIndex];
			this.enterPattern(element, onIdent);
		}
	}

	enterRestElement(pattern, onIdent) {
		this.enterPattern(pattern.argument, onIdent);
	}

	enterAssignmentPattern(pattern, onIdent) {
		this.enterPattern(pattern.left, onIdent);
	}

	evaluateExpression(expression) {
		try {
			const result = this.applyPluginsBailResult1("evaluate " + expression.type, expression);
			if(result !== undefined)
				return result;
		} catch(e) {
			console.warn(e);
			// ignore error
		}
		return new BasicEvaluatedExpression().setRange(expression.range);
	}

	parseString(expression) {
		switch(expression.type) {
			case "BinaryExpression":
				if(expression.operator === "+")
					return this.parseString(expression.left) + this.parseString(expression.right);
				break;
			case "Literal":
				return expression.value + "";
		}
		throw new Error(expression.type + " is not supported as parameter for require");
	}

	parseCalculatedString(expression) {
		switch(expression.type) {
			case "BinaryExpression":
				if(expression.operator === "+") {
					const left = this.parseCalculatedString(expression.left);
					const right = this.parseCalculatedString(expression.right);
					if(left.code) {
						return {
							range: left.range,
							value: left.value,
							code: true
						};
					} else if(right.code) {
						return {
							range: [left.range[0], right.range ? right.range[1] : left.range[1]],
							value: left.value + right.value,
							code: true
						};
					} else {
						return {
							range: [left.range[0], right.range[1]],
							value: left.value + right.value
						};
					}
				}
				break;
			case "ConditionalExpression":
				{
					const consequent = this.parseCalculatedString(expression.consequent);
					const alternate = this.parseCalculatedString(expression.alternate);
					const items = [];
					if(consequent.conditional)
						Array.prototype.push.apply(items, consequent.conditional);
					else if(!consequent.code)
						items.push(consequent);
					else break;
					if(alternate.conditional)
						Array.prototype.push.apply(items, alternate.conditional);
					else if(!alternate.code)
						items.push(alternate);
					else break;
					return {
						value: "",
						code: true,
						conditional: items
					};
				}
			case "Literal":
				return {
					range: expression.range,
					value: expression.value + ""
				};
		}
		return {
			value: "",
			code: true
		};
	}

	parseStringArray(expression) {
		if(expression.type !== "ArrayExpression") {
			return [this.parseString(expression)];
		}

		const arr = [];
		if(expression.elements)
			expression.elements.forEach(function(expr) {
				arr.push(this.parseString(expr));
			}, this);
		return arr;
	}

	parseCalculatedStringArray(expression) {
		if(expression.type !== "ArrayExpression") {
			return [this.parseCalculatedString(expression)];
		}

		const arr = [];
		if(expression.elements)
			expression.elements.forEach(function(expr) {
				arr.push(this.parseCalculatedString(expr));
			}, this);
		return arr;
	}

	parse(source, initialState) {
		let ast;
		const comments = [];
		for(let i = 0, len = POSSIBLE_AST_OPTIONS.length; i < len; i++) {
			if(!ast) {
				try {
					comments.length = 0;
					POSSIBLE_AST_OPTIONS[i].onComment = comments;
					ast = acorn.parse(source, POSSIBLE_AST_OPTIONS[i]);
				} catch(e) {
					// ignore the error
				}
			}
		}
		if(!ast) {
			// for the error
			ast = acorn.parse(source, {
				ranges: true,
				locations: true,
				ecmaVersion: ECMA_VERSION,
				sourceType: "module",
				plugins: {
					dynamicImport: true
				},
				onComment: comments
			});
		}
		if(!ast || typeof ast !== "object")
			throw new Error("Source couldn't be parsed");
		const oldScope = this.scope;
		const oldState = this.state;
		const oldComments = this.comments;
		this.scope = {
			inTry: false,
			definitions: [],
			renames: {}
		};
		const state = this.state = initialState || {};
		this.comments = comments;
		if(this.applyPluginsBailResult("program", ast, comments) === undefined) {
			this.prewalkStatements(ast.body);
			this.walkStatements(ast.body);
		}
		this.scope = oldScope;
		this.state = oldState;
		this.comments = oldComments;
		return state;
	}

	evaluate(source) {
		const ast = acorn.parse("(" + source + ")", {
			ranges: true,
			locations: true,
			ecmaVersion: ECMA_VERSION,
			sourceType: "module",
			plugins: {
				dynamicImport: true
			}
		});
		if(!ast || typeof ast !== "object" || ast.type !== "Program")
			throw new Error("evaluate: Source couldn't be parsed");
		if(ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement")
			throw new Error("evaluate: Source is not a expression");
		return this.evaluateExpression(ast.body[0].expression);
	}

	getComments(range) {
		return this.comments.filter(comment => comment.range[0] >= range[0] && comment.range[1] <= range[1]);
	}

	getCommentOptions(range) {
		const comments = this.getComments(range);
		if(comments.length === 0) return null;
		const options = comments.map(comment => {
			try {
				return json5.parse(`{${comment.value}}`);
			} catch(e) {
				return {};
			}
		});
		return options.reduce((o, i) => Object.assign(o, i), {});
	}

	getNameForExpression(expression) {
		let expr = expression;
		const exprName = [];
		while(expr.type === "MemberExpression" && expr.property.type === (expr.computed ? "Literal" : "Identifier")) {
			exprName.push(expr.computed ? expr.property.value : expr.property.name);
			expr = expr.object;
		}
		let free;
		if(expr.type === "Identifier") {
			free = this.scope.definitions.indexOf(expr.name) === -1;
			exprName.push(this.scope.renames["$" + expr.name] || expr.name);
		} else if(expr.type === "ThisExpression" && this.scope.renames.$this) {
			free = true;
			exprName.push(this.scope.renames.$this);
		} else if(expr.type === "ThisExpression") {
			free = false;
			exprName.push("this");
		} else {
			return null;
		}
		let prefix = "";
		for(let i = exprName.length - 1; i >= 1; i--)
			prefix += exprName[i] + ".";
		const name = prefix + exprName[0];
		const nameGeneral = prefix + "*";
		return {
			name,
			nameGeneral,
			free
		};
	}

}

Parser.ECMA_VERSION = ECMA_VERSION;

module.exports = Parser;

}, function(modId) { var map = {"./BasicEvaluatedExpression":1602510872165}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872165, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



class BasicEvaluatedExpression {

	constructor() {
		this.range = null;
	}

	isNull() {
		return !!this.null;
	}

	isString() {
		return Object.prototype.hasOwnProperty.call(this, "string");
	}

	isNumber() {
		return Object.prototype.hasOwnProperty.call(this, "number");
	}

	isBoolean() {
		return Object.prototype.hasOwnProperty.call(this, "bool");
	}

	isRegExp() {
		return Object.prototype.hasOwnProperty.call(this, "regExp");
	}

	isConditional() {
		return Object.prototype.hasOwnProperty.call(this, "options");
	}

	isArray() {
		return Object.prototype.hasOwnProperty.call(this, "items");
	}

	isConstArray() {
		return Object.prototype.hasOwnProperty.call(this, "array");
	}

	isIdentifier() {
		return Object.prototype.hasOwnProperty.call(this, "identifier");
	}

	isWrapped() {
		return Object.prototype.hasOwnProperty.call(this, "prefix") || Object.prototype.hasOwnProperty.call(this, "postfix");
	}

	isTemplateString() {
		return Object.prototype.hasOwnProperty.call(this, "quasis");
	}

	isTruthy() {
		return this.truthy;
	}

	isFalsy() {
		return this.falsy;
	}

	asBool() {
		if(this.truthy) return true;
		else if(this.falsy) return false;
		else if(this.isBoolean()) return this.bool;
		else if(this.isNull()) return false;
		else if(this.isString()) return !!this.string;
		else if(this.isNumber()) return !!this.number;
		else if(this.isRegExp()) return true;
		else if(this.isArray()) return true;
		else if(this.isConstArray()) return true;
		else if(this.isWrapped()) return this.prefix && this.prefix.asBool() || this.postfix && this.postfix.asBool() ? true : undefined;
		else if(this.isTemplateString()) {
			if(this.quasis.length === 1) return this.quasis[0].asBool();
			for(let i = 0; i < this.quasis.length; i++) {
				if(this.quasis[i].asBool()) return true;
			}
			// can't tell if string will be empty without executing
		}
		return undefined;
	}

	setString(str) {
		if(str === null)
			delete this.string;
		else
			this.string = str;
		return this;
	}

	setNull() {
		this.null = true;
		return this;
	}

	setNumber(num) {
		if(num === null)
			delete this.number;
		else
			this.number = num;
		return this;
	}

	setBoolean(bool) {
		if(bool === null)
			delete this.bool;
		else
			this.bool = bool;
		return this;
	}

	setRegExp(regExp) {
		if(regExp === null)
			delete this.regExp;
		else
			this.regExp = regExp;
		return this;
	}

	setIdentifier(identifier) {
		if(identifier === null)
			delete this.identifier;
		else
			this.identifier = identifier;
		return this;
	}

	setWrapped(prefix, postfix) {
		this.prefix = prefix;
		this.postfix = postfix;
		return this;
	}

	unsetWrapped() {
		delete this.prefix;
		delete this.postfix;
		return this;
	}

	setOptions(options) {
		if(options === null)
			delete this.options;
		else
			this.options = options;
		return this;
	}

	setItems(items) {
		if(items === null)
			delete this.items;
		else
			this.items = items;
		return this;
	}

	setArray(array) {
		if(array === null)
			delete this.array;
		else
			this.array = array;
		return this;
	}

	setTemplateString(quasis) {
		if(quasis === null)
			delete this.quasis;
		else
			this.quasis = quasis;
		return this;
	}

	setTruthy() {
		this.falsy = false;
		this.truthy = true;
		return this;
	}

	setFalsy() {
		this.falsy = true;
		this.truthy = false;
		return this;
	}

	addOptions(options) {
		if(!this.options) this.options = [];
		options.forEach(item => {
			this.options.push(item);
		}, this);
		return this;
	}

	setRange(range) {
		this.range = range;
		return this;
	}

}

module.exports = BasicEvaluatedExpression;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872166, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*
<rules>: <rule>
<rules>: [<rule>]
<rule>: {
	resource: {
		test: <condition>,
		include: <condition>,
		exclude: <condition>,
	},
	resource: <condition>, -> resource.test
	test: <condition>, -> resource.test
	include: <condition>, -> resource.include
	exclude: <condition>, -> resource.exclude
	resourceQuery: <condition>,
	compiler: <condition>,
	issuer: <condition>,
	use: "loader", -> use[0].loader
	loader: <>, -> use[0].loader
	loaders: <>, -> use
	options: {}, -> use[0].options,
	query: {}, -> options
	parser: {},
	use: [
		"loader" -> use[x].loader
	],
	use: [
		{
			loader: "loader",
			options: {}
		}
	],
	rules: [
		<rule>
	],
	oneOf: [
		<rule>
	]
}

<condition>: /regExp/
<condition>: function(arg) {}
<condition>: "starting"
<condition>: [<condition>] // or
<condition>: { and: [<condition>] }
<condition>: { or: [<condition>] }
<condition>: { not: [<condition>] }
<condition>: { test: <condition>, include: <condition>, exclude: <condition> }


normalized:

{
	resource: function(),
	resourceQuery: function(),
	compiler: function(),
	issuer: function(),
	use: [
		{
			loader: string,
			options: string,
			<any>: <any>
		}
	],
	rules: [<rule>],
	oneOf: [<rule>],
	<any>: <any>,
}

*/



module.exports = class RuleSet {
	constructor(rules) {
		this.references = Object.create(null);
		this.rules = RuleSet.normalizeRules(rules, this.references, "ref-");
	}

	static normalizeRules(rules, refs, ident) {
		if(Array.isArray(rules)) {
			return rules.map((rule, idx) => {
				return RuleSet.normalizeRule(rule, refs, `${ident}-${idx}`);
			});
		} else if(rules) {
			return [RuleSet.normalizeRule(rules, refs, ident)];
		} else {
			return [];
		}
	}

	static normalizeRule(rule, refs, ident) {
		if(typeof rule === "string")
			return {
				use: [{
					loader: rule
				}]
			};
		if(!rule)
			throw new Error("Unexcepted null when object was expected as rule");
		if(typeof rule !== "object")
			throw new Error("Unexcepted " + typeof rule + " when object was expected as rule (" + rule + ")");

		const newRule = {};
		let useSource;
		let resourceSource;
		let condition;

		if(rule.test || rule.include || rule.exclude) {
			checkResourceSource("test + include + exclude");
			condition = {
				test: rule.test,
				include: rule.include,
				exclude: rule.exclude
			};
			try {
				newRule.resource = RuleSet.normalizeCondition(condition);
			} catch(error) {
				throw new Error(RuleSet.buildErrorMessage(condition, error));
			}
		}

		if(rule.resource) {
			checkResourceSource("resource");
			try {
				newRule.resource = RuleSet.normalizeCondition(rule.resource);
			} catch(error) {
				throw new Error(RuleSet.buildErrorMessage(rule.resource, error));
			}
		}

		if(rule.resourceQuery) {
			try {
				newRule.resourceQuery = RuleSet.normalizeCondition(rule.resourceQuery);
			} catch(error) {
				throw new Error(RuleSet.buildErrorMessage(rule.resourceQuery, error));
			}
		}

		if(rule.compiler) {
			try {
				newRule.compiler = RuleSet.normalizeCondition(rule.compiler);
			} catch(error) {
				throw new Error(RuleSet.buildErrorMessage(rule.compiler, error));
			}
		}

		if(rule.issuer) {
			try {
				newRule.issuer = RuleSet.normalizeCondition(rule.issuer);
			} catch(error) {
				throw new Error(RuleSet.buildErrorMessage(rule.issuer, error));
			}
		}

		if(rule.loader && rule.loaders)
			throw new Error(RuleSet.buildErrorMessage(rule, new Error("Provided loader and loaders for rule (use only one of them)")));

		const loader = rule.loaders || rule.loader;
		if(typeof loader === "string" && !rule.options && !rule.query) {
			checkUseSource("loader");
			newRule.use = RuleSet.normalizeUse(loader.split("!"), ident);
		} else if(typeof loader === "string" && (rule.options || rule.query)) {
			checkUseSource("loader + options/query");
			newRule.use = RuleSet.normalizeUse({
				loader: loader,
				options: rule.options,
				query: rule.query
			}, ident);
		} else if(loader && (rule.options || rule.query)) {
			throw new Error(RuleSet.buildErrorMessage(rule, new Error("options/query cannot be used with loaders (use options for each array item)")));
		} else if(loader) {
			checkUseSource("loaders");
			newRule.use = RuleSet.normalizeUse(loader, ident);
		} else if(rule.options || rule.query) {
			throw new Error(RuleSet.buildErrorMessage(rule, new Error("options/query provided without loader (use loader + options)")));
		}

		if(rule.use) {
			checkUseSource("use");
			newRule.use = RuleSet.normalizeUse(rule.use, ident);
		}

		if(rule.rules)
			newRule.rules = RuleSet.normalizeRules(rule.rules, refs, `${ident}-rules`);

		if(rule.oneOf)
			newRule.oneOf = RuleSet.normalizeRules(rule.oneOf, refs, `${ident}-oneOf`);

		const keys = Object.keys(rule).filter((key) => {
			return ["resource", "resourceQuery", "compiler", "test", "include", "exclude", "issuer", "loader", "options", "query", "loaders", "use", "rules", "oneOf"].indexOf(key) < 0;
		});
		keys.forEach((key) => {
			newRule[key] = rule[key];
		});

		function checkUseSource(newSource) {
			if(useSource && useSource !== newSource)
				throw new Error(RuleSet.buildErrorMessage(rule, new Error("Rule can only have one result source (provided " + newSource + " and " + useSource + ")")));
			useSource = newSource;
		}

		function checkResourceSource(newSource) {
			if(resourceSource && resourceSource !== newSource)
				throw new Error(RuleSet.buildErrorMessage(rule, new Error("Rule can only have one resource source (provided " + newSource + " and " + resourceSource + ")")));
			resourceSource = newSource;
		}

		if(Array.isArray(newRule.use)) {
			newRule.use.forEach((item) => {
				if(item.ident) {
					refs[item.ident] = item.options;
				}
			});
		}

		return newRule;
	}

	static buildErrorMessage(condition, error) {
		const conditionAsText = JSON.stringify(condition, (key, value) => {
			return value === undefined ? "undefined" : value;
		}, 2);
		return error.message + " in " + conditionAsText;
	}

	static normalizeUse(use, ident) {
		if(Array.isArray(use)) {
			return use
				.map((item, idx) => RuleSet.normalizeUse(item, `${ident}-${idx}`))
				.reduce((arr, items) => arr.concat(items), []);
		}
		return [RuleSet.normalizeUseItem(use, ident)];
	}

	static normalizeUseItemFunction(use, data) {
		const result = use(data);
		if(typeof result === "string") {
			return RuleSet.normalizeUseItem(result);
		}
		return result;
	}

	static normalizeUseItemString(useItemString) {
		const idx = useItemString.indexOf("?");
		if(idx >= 0) {
			return {
				loader: useItemString.substr(0, idx),
				options: useItemString.substr(idx + 1)
			};
		}
		return {
			loader: useItemString
		};
	}

	static normalizeUseItem(item, ident) {
		if(typeof item === "function")
			return item;

		if(typeof item === "string") {
			return RuleSet.normalizeUseItemString(item);
		}

		const newItem = {};

		if(item.options && item.query)
			throw new Error("Provided options and query in use");

		if(!item.loader)
			throw new Error("No loader specified");

		newItem.options = item.options || item.query;

		if(typeof newItem.options === "object" && newItem.options) {
			if(newItem.options.ident)
				newItem.ident = newItem.options.ident;
			else
				newItem.ident = ident;
		}

		const keys = Object.keys(item).filter(function(key) {
			return ["options", "query"].indexOf(key) < 0;
		});

		keys.forEach(function(key) {
			newItem[key] = item[key];
		});

		return newItem;
	}

	static normalizeCondition(condition) {
		if(!condition)
			throw new Error("Expected condition but got falsy value");
		if(typeof condition === "string") {
			return str => str.indexOf(condition) === 0;
		}
		if(typeof condition === "function") {
			return condition;
		}
		if(condition instanceof RegExp) {
			return condition.test.bind(condition);
		}
		if(Array.isArray(condition)) {
			const items = condition.map(c => RuleSet.normalizeCondition(c));
			return orMatcher(items);
		}
		if(typeof condition !== "object")
			throw Error("Unexcepted " + typeof condition + " when condition was expected (" + condition + ")");

		const matchers = [];
		Object.keys(condition).forEach(key => {
			const value = condition[key];
			switch(key) {
				case "or":
				case "include":
				case "test":
					if(value)
						matchers.push(RuleSet.normalizeCondition(value));
					break;
				case "and":
					if(value) {
						const items = value.map(c => RuleSet.normalizeCondition(c));
						matchers.push(andMatcher(items));
					}
					break;
				case "not":
				case "exclude":
					if(value) {
						const matcher = RuleSet.normalizeCondition(value);
						matchers.push(notMatcher(matcher));
					}
					break;
				default:
					throw new Error("Unexcepted property " + key + " in condition");
			}
		});
		if(matchers.length === 0)
			throw new Error("Excepted condition but got " + condition);
		if(matchers.length === 1)
			return matchers[0];
		return andMatcher(matchers);
	}

	exec(data) {
		const result = [];
		this._run(data, {
			rules: this.rules
		}, result);
		return result;
	}

	_run(data, rule, result) {
		// test conditions
		if(rule.resource && !data.resource)
			return false;
		if(rule.resourceQuery && !data.resourceQuery)
			return false;
		if(rule.compiler && !data.compiler)
			return false;
		if(rule.issuer && !data.issuer)
			return false;
		if(rule.resource && !rule.resource(data.resource))
			return false;
		if(data.issuer && rule.issuer && !rule.issuer(data.issuer))
			return false;
		if(data.resourceQuery && rule.resourceQuery && !rule.resourceQuery(data.resourceQuery))
			return false;
		if(data.compiler && rule.compiler && !rule.compiler(data.compiler))
			return false;

		// apply
		const keys = Object.keys(rule).filter((key) => {
			return ["resource", "resourceQuery", "compiler", "issuer", "rules", "oneOf", "use", "enforce"].indexOf(key) < 0;
		});
		keys.forEach((key) => {
			result.push({
				type: key,
				value: rule[key]
			});
		});

		if(rule.use) {
			rule.use.forEach((use) => {
				result.push({
					type: "use",
					value: typeof use === "function" ? RuleSet.normalizeUseItemFunction(use, data) : use,
					enforce: rule.enforce
				});
			});
		}

		if(rule.rules) {
			for(let i = 0; i < rule.rules.length; i++) {
				this._run(data, rule.rules[i], result);
			}
		}

		if(rule.oneOf) {
			for(let i = 0; i < rule.oneOf.length; i++) {
				if(this._run(data, rule.oneOf[i], result))
					break;
			}
		}

		return true;
	}

	findOptionsByIdent(ident) {
		const options = this.references[ident];
		if(!options) throw new Error("Can't find options with ident '" + ident + "'");
		return options;
	}
};

function notMatcher(matcher) {
	return function(str) {
		return !matcher(str);
	};
}

function orMatcher(items) {
	return function(str) {
		for(let i = 0; i < items.length; i++) {
			if(items[i](str))
				return true;
		}
		return false;
	};
}

function andMatcher(items) {
	return function(str) {
		for(let i = 0; i < items.length; i++) {
			if(!items[i](str))
				return false;
		}
		return true;
	};
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872167, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const asyncLib = require("async");
const path = require("path");

const Tapable = require("tapable");
const ContextModule = require("./ContextModule");
const ContextElementDependency = require("./dependencies/ContextElementDependency");

module.exports = class ContextModuleFactory extends Tapable {
	constructor(resolvers) {
		super();
		this.resolvers = resolvers;
	}

	create(data, callback) {
		const context = data.context;
		const dependencies = data.dependencies;
		const dependency = dependencies[0];
		this.applyPluginsAsyncWaterfall("before-resolve", {
			context: context,
			request: dependency.request,
			recursive: dependency.recursive,
			regExp: dependency.regExp,
			async: dependency.async,
			dependencies: dependencies
		}, (err, result) => {
			if(err) return callback(err);

			// Ignored
			if(!result) return callback();

			const context = result.context;
			const request = result.request;
			const recursive = result.recursive;
			const regExp = result.regExp;
			const asyncContext = result.async;
			const dependencies = result.dependencies;

			let loaders, resource, loadersPrefix = "";
			const idx = request.lastIndexOf("!");
			if(idx >= 0) {
				loaders = request.substr(0, idx + 1);
				let i;
				for(i = 0; i < loaders.length && loaders[i] === "!"; i++) {
					loadersPrefix += "!";
				}
				loaders = loaders.substr(i).replace(/!+$/, "").replace(/!!+/g, "!");
				if(loaders === "") loaders = [];
				else loaders = loaders.split("!");
				resource = request.substr(idx + 1);
			} else {
				loaders = [];
				resource = request;
			}

			const resolvers = this.resolvers;

			asyncLib.parallel([
				function(callback) {
					resolvers.context.resolve({}, context, resource, function(err, result) {
						if(err) return callback(err);
						callback(null, result);
					});
				},
				function(callback) {
					asyncLib.map(loaders, function(loader, callback) {
						resolvers.loader.resolve({}, context, loader, function(err, result) {
							if(err) return callback(err);
							callback(null, result);
						});
					}, callback);
				}
			], (err, result) => {
				if(err) return callback(err);

				this.applyPluginsAsyncWaterfall("after-resolve", {
					loaders: loadersPrefix + result[1].join("!") + (result[1].length > 0 ? "!" : ""),
					resource: result[0],
					recursive: recursive,
					regExp: regExp,
					async: asyncContext,
					dependencies: dependencies,
					resolveDependencies: this.resolveDependencies.bind(this)
				}, function(err, result) {
					if(err) return callback(err);

					// Ignored
					if(!result) return callback();

					return callback(null, new ContextModule(result.resolveDependencies, result.resource, result.recursive, result.regExp, result.loaders, result.async, dependency.chunkName));
				});
			});
		});
	}

	resolveDependencies(fs, resource, recursive, regExp, callback) {
		const cmf = this;
		if(!regExp || !resource)
			return callback(null, []);
		(function addDirectory(directory, callback) {
			fs.readdir(directory, (err, files) => {
				if(err) return callback(err);
				files = cmf.applyPluginsWaterfall("context-module-files", files);
				if(!files || files.length === 0) return callback(null, []);
				asyncLib.map(files.filter(function(p) {
					return p.indexOf(".") !== 0;
				}), (seqment, callback) => {

					const subResource = path.join(directory, seqment);

					fs.stat(subResource, (err, stat) => {
						if(err) {
							if(err.code === "ENOENT") {
								// ENOENT is ok here because the file may have been deleted between
								// the readdir and stat calls.
								return callback();
							} else {
								return callback(err);
							}
						}

						if(stat.isDirectory()) {

							if(!recursive) return callback();
							addDirectory.call(this, subResource, callback);

						} else if(stat.isFile()) {

							const obj = {
								context: resource,
								request: "." + subResource.substr(resource.length).replace(/\\/g, "/")
							};

							this.applyPluginsAsyncWaterfall("alternatives", [obj], (err, alternatives) => {
								if(err) return callback(err);
								alternatives = alternatives.filter(function(obj) {
									return regExp.test(obj.request);
								}).map(function(obj) {
									const dep = new ContextElementDependency(obj.request);
									dep.optional = true;
									return dep;
								});
								callback(null, alternatives);
							});

						} else callback();

					});

				}, (err, result) => {
					if(err) return callback(err);

					if(!result) return callback(null, []);

					callback(null, result.filter(function(i) {
						return !!i;
					}).reduce(function(a, i) {
						return a.concat(i);
					}, []));
				});
			});
		}.call(this, resource, callback));
	}
};

}, function(modId) { var map = {"./ContextModule":1602510872168,"./dependencies/ContextElementDependency":1602510872171}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872168, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const path = require("path");
const Module = require("./Module");
const OriginalSource = require("webpack-sources").OriginalSource;
const RawSource = require("webpack-sources").RawSource;
const AsyncDependenciesBlock = require("./AsyncDependenciesBlock");
const DepBlockHelpers = require("./dependencies/DepBlockHelpers");
const Template = require("./Template");

class ContextModule extends Module {
	constructor(resolveDependencies, context, recursive, regExp, addon, asyncMode, chunkName) {
		super();
		this.resolveDependencies = resolveDependencies;
		this.context = context;
		this.recursive = recursive;
		this.regExp = regExp;
		this.addon = addon;
		this.async = asyncMode;
		this.cacheable = true;
		this.contextDependencies = [context];
		this.built = false;
		this.chunkName = chunkName;
	}

	prettyRegExp(regexString) {
		// remove the "/" at the front and the beginning
		// "/foo/" -> "foo"
		return regexString.substring(1, regexString.length - 1);
	}

	contextify(context, request) {
		return request.split("!").map(subrequest => {
			let rp = path.relative(context, subrequest);
			if(path.sep === "\\")
				rp = rp.replace(/\\/g, "/");
			if(rp.indexOf("../") !== 0)
				rp = "./" + rp;
			return rp;
		}).join("!");
	}

	identifier() {
		let identifier = this.context;
		if(this.async)
			identifier += ` ${this.async}`;
		if(!this.recursive)
			identifier += " nonrecursive";
		if(this.addon)
			identifier += ` ${this.addon}`;
		if(this.regExp)
			identifier += ` ${this.regExp}`;

		return identifier;
	}

	readableIdentifier(requestShortener) {
		let identifier = requestShortener.shorten(this.context);
		if(this.async)
			identifier += ` ${this.async}`;
		if(!this.recursive)
			identifier += " nonrecursive";
		if(this.addon)
			identifier += ` ${requestShortener.shorten(this.addon)}`;
		if(this.regExp)
			identifier += ` ${this.prettyRegExp(this.regExp + "")}`;

		return identifier;
	}

	libIdent(options) {
		let identifier = this.contextify(options.context, this.context);
		if(this.async)
			identifier += ` ${this.async}`;
		if(this.recursive)
			identifier += " recursive";
		if(this.addon)
			identifier += ` ${this.contextify(options.context, this.addon)}`;
		if(this.regExp)
			identifier += ` ${this.prettyRegExp(this.regExp + "")}`;

		return identifier;
	}

	needRebuild(fileTimestamps, contextTimestamps) {
		const ts = contextTimestamps[this.context];
		if(!ts) {
			return true;
		}

		return ts >= this.builtTime;
	}

	unbuild() {
		this.built = false;
		super.unbuild();
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		this.builtTime = Date.now();
		this.resolveDependencies(fs, this.context, this.recursive, this.regExp, (err, dependencies) => {
			if(err) return callback(err);

			// Reset children
			this.dependencies = [];
			this.blocks = [];

			// abort if something failed
			// this will create an empty context
			if(!dependencies) {
				callback();
				return;
			}

			// enhance dependencies with meta info
			dependencies.forEach(dep => {
				dep.loc = dep.userRequest;
				dep.request = this.addon + dep.request;
			});

			if(!this.async || this.async === "eager") {

				// if we have an sync or eager context
				// just add all dependencies and continue
				this.dependencies = dependencies;

			} else if(this.async === "lazy-once") {

				// for the lazy-once mode create a new async dependency block
				// and add that block to this context
				if(dependencies.length > 0) {
					const block = new AsyncDependenciesBlock(this.chunkName, this);
					dependencies.forEach(dep => {
						block.addDependency(dep);
					});
					this.addBlock(block);
				}

			} else if(this.async === "weak" || this.async === "async-weak") {

				// we mark all dependencies as weak
				dependencies.forEach(dep => dep.weak = true);
				this.dependencies = dependencies;

			} else {
				// if we are lazy create a new async dependency block per dependency
				// and add all blocks to this context
				dependencies.forEach((dep, idx) => {
					let chunkName = this.chunkName;
					if(chunkName) {
						if(!/\[(index|request)\]/.test(chunkName))
							chunkName += "[index]";
						chunkName = chunkName.replace(/\[index\]/g, idx);
						chunkName = chunkName.replace(/\[request\]/g, Template.toPath(dep.userRequest));
					}
					const block = new AsyncDependenciesBlock(chunkName, dep.module, dep.loc);
					block.addDependency(dep);
					this.addBlock(block);
				});
			}
			callback();
		});
	}

	getUserRequestMap(dependencies) {
		// if we filter first we get a new array
		// therefor we dont need to create a clone of dependencies explicitly
		// therefore the order of this is !important!
		return dependencies
			.filter(dependency => dependency.module)
			.sort((a, b) => {
				if(a.userRequest === b.userRequest) {
					return 0;
				}
				return a.userRequest < b.userRequest ? -1 : 1;
			}).reduce(function(map, dep) {
				map[dep.userRequest] = dep.module.id;
				return map;
			}, Object.create(null));
	}

	getSyncSource(dependencies, id) {
		const map = this.getUserRequestMap(dependencies);
		return `var map = ${JSON.stringify(map, null, "\t")};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = ${JSON.stringify(id)};`;
	}

	getWeakSyncSource(dependencies, id) {
		const map = this.getUserRequestMap(dependencies);
		return `var map = ${JSON.stringify(map, null, "\t")};
function webpackContext(req) {
	var id = webpackContextResolve(req);
	if(!__webpack_require__.m[id])
		throw new Error("Module '" + req + "' ('" + id + "') is not available (weak dependency)");
	return __webpack_require__(id);
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
webpackContext.id = ${JSON.stringify(id)};
module.exports = webpackContext;`;
	}

	getAsyncWeakSource(dependencies, id) {
		const map = this.getUserRequestMap(dependencies);

		return `var map = ${JSON.stringify(map, null, "\t")};
function webpackAsyncContext(req) {
	return webpackAsyncContextResolve(req).then(function(id) {
		if(!__webpack_require__.m[id])
			throw new Error("Module '" + req + "' ('" + id + "') is not available (weak dependency)");
		return __webpack_require__(id);
	});
};
function webpackAsyncContextResolve(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		var id = map[req];
		if(!(id + 1)) // check for number or string
			throw new Error("Cannot find module '" + req + "'.");
		return id;
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.resolve = webpackAsyncContextResolve;
webpackAsyncContext.id = ${JSON.stringify(id)};
module.exports = webpackAsyncContext;`;
	}

	getEagerSource(dependencies, id) {
		const map = this.getUserRequestMap(dependencies);
		return `var map = ${JSON.stringify(map, null, "\t")};
function webpackAsyncContext(req) {
	return webpackAsyncContextResolve(req).then(__webpack_require__);
};
function webpackAsyncContextResolve(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		var id = map[req];
		if(!(id + 1)) // check for number or string
			throw new Error("Cannot find module '" + req + "'.");
		return id;
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.resolve = webpackAsyncContextResolve;
webpackAsyncContext.id = ${JSON.stringify(id)};
module.exports = webpackAsyncContext;`;
	}

	getLazyOnceSource(block, dependencies, id, outputOptions, requestShortener) {
		const promise = DepBlockHelpers.getDepBlockPromise(block, outputOptions, requestShortener, "lazy-once context");
		const map = this.getUserRequestMap(dependencies);
		return `var map = ${JSON.stringify(map, null, "\t")};
function webpackAsyncContext(req) {
	return webpackAsyncContextResolve(req).then(__webpack_require__);
};
function webpackAsyncContextResolve(req) {
	return ${promise}.then(function() {
		var id = map[req];
		if(!(id + 1)) // check for number or string
			throw new Error("Cannot find module '" + req + "'.");
		return id;
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.resolve = webpackAsyncContextResolve;
webpackAsyncContext.id = ${JSON.stringify(id)};
module.exports = webpackAsyncContext;`;
	}

	getLazySource(blocks, id) {
		let hasMultipleOrNoChunks = false;
		const map = blocks
			.filter(block => block.dependencies[0].module)
			.map((block) => ({
				dependency: block.dependencies[0],
				block: block,
				userRequest: block.dependencies[0].userRequest
			})).sort((a, b) => {
				if(a.userRequest === b.userRequest) return 0;
				return a.userRequest < b.userRequest ? -1 : 1;
			}).reduce((map, item) => {
				const chunks = item.block.chunks || [];
				if(chunks.length !== 1) {
					hasMultipleOrNoChunks = true;
				}
				map[item.userRequest] = [item.dependency.module.id]
					.concat(chunks.map(chunk => chunk.id));

				return map;
			}, Object.create(null));

		const requestPrefix = hasMultipleOrNoChunks ?
			"Promise.all(ids.slice(1).map(__webpack_require__.e))" :
			"__webpack_require__.e(ids[1])";

		return `var map = ${JSON.stringify(map, null, "\t")};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return ${requestPrefix}.then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = ${JSON.stringify(id)};
module.exports = webpackAsyncContext;`;
	}

	getSourceForEmptyContext(id) {
		return `function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = ${JSON.stringify(id)};`;
	}

	getSourceForEmptyAsyncContext(id) {
		return `function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = ${JSON.stringify(id)};`;
	}

	getSourceString(asyncMode, outputOptions, requestShortener) {
		if(asyncMode === "lazy") {
			if(this.blocks && this.blocks.length > 0) {
				return this.getLazySource(this.blocks, this.id);
			}
			return this.getSourceForEmptyAsyncContext(this.id);
		}
		if(asyncMode === "eager") {
			if(this.dependencies && this.dependencies.length > 0) {
				return this.getEagerSource(this.dependencies, this.id);
			}
			return this.getSourceForEmptyAsyncContext(this.id);
		}
		if(asyncMode === "lazy-once") {
			const block = this.blocks[0];
			if(block) {
				return this.getLazyOnceSource(block, block.dependencies, this.id, outputOptions, requestShortener);
			}
			return this.getSourceForEmptyAsyncContext(this.id);
		}
		if(asyncMode === "async-weak") {
			if(this.dependencies && this.dependencies.length > 0) {
				return this.getAsyncWeakSource(this.dependencies, this.id);
			}
			return this.getSourceForEmptyAsyncContext(this.id);
		}
		if(asyncMode === "weak") {
			if(this.dependencies && this.dependencies.length > 0) {
				return this.getWeakSyncSource(this.dependencies, this.id);
			}
		}
		if(this.dependencies && this.dependencies.length > 0) {
			return this.getSyncSource(this.dependencies, this.id);
		}
		return this.getSourceForEmptyContext(this.id);
	}

	getSource(sourceString) {
		if(this.useSourceMap) {
			return new OriginalSource(sourceString, this.identifier());
		}
		return new RawSource(sourceString);
	}

	source(dependencyTemplates, outputOptions, requestShortener) {
		return this.getSource(
			this.getSourceString(this.async, outputOptions, requestShortener)
		);
	}

	size() {
		// base penalty
		const initialSize = 160;

		// if we dont have dependencies we stop here.
		return this.dependencies
			.reduce((size, dependency) => size + 5 + dependency.userRequest.length, initialSize);
	}
}

module.exports = ContextModule;

}, function(modId) { var map = {"./Module":1602510872132,"./AsyncDependenciesBlock":1602510872169,"./dependencies/DepBlockHelpers":1602510872170,"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872169, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const DependenciesBlock = require("./DependenciesBlock");

module.exports = class AsyncDependenciesBlock extends DependenciesBlock {
	constructor(name, module, loc) {
		super();
		this.chunkName = name;
		this.chunks = null;
		this.module = module;
		this.loc = loc;
	}
	get chunk() {
		throw new Error("`chunk` was been renamed to `chunks` and is now an array");
	}
	set chunk(chunk) {
		throw new Error("`chunk` was been renamed to `chunks` and is now an array");
	}
	updateHash(hash) {
		hash.update(this.chunkName || "");
		hash.update(this.chunks && this.chunks.map((chunk) => {
			return chunk.id !== null ? chunk.id : "";
		}).join(",") || "");
		super.updateHash(hash);
	}
	disconnect() {
		this.chunks = null;
		super.disconnect();
	}
	unseal() {
		this.chunks = null;
		super.unseal();
	}
	sortItems() {
		super.sortItems();
		if(this.chunks) {
			this.chunks.sort((a, b) => a.compareTo(b));
		}
	}
};

}, function(modId) { var map = {"./DependenciesBlock":1602510872133}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872170, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const DepBlockHelpers = exports;

DepBlockHelpers.getLoadDepBlockWrapper = (depBlock, outputOptions, requestShortener, name) => {
	const promiseCode = DepBlockHelpers.getDepBlockPromise(depBlock, outputOptions, requestShortener, name);
	return [
		promiseCode + ".then(",
		").catch(",
		")"
	];
};

DepBlockHelpers.getDepBlockPromise = (depBlock, outputOptions, requestShortener, name) => {
	if(depBlock.chunks) {
		const chunks = depBlock.chunks.filter(chunk => !chunk.hasRuntime() && chunk.id !== null);
		const pathChunkCheck = outputOptions.pathinfo && depBlock.chunkName;
		const shortChunkName = requestShortener.shorten(depBlock.chunkName);
		const chunkReason = asComment(depBlock.chunkReason);
		const requireChunkId = chunk => "__webpack_require__.e(" + JSON.stringify(chunk.id) + ")";
		name = asComment(name);
		if(chunks.length === 1) {
			const chunkId = JSON.stringify(chunks[0].id);
			return `__webpack_require__.e${name}(${chunkId}${pathChunkCheck ? "/*! " + shortChunkName + " */" : ""}${chunkReason})`;
		} else if(chunks.length > 0) {
			return `Promise.all${name}(${pathChunkCheck ? "/*! " + shortChunkName + " */" : ""}[${chunks.map(requireChunkId).join(", ")}])`;
		}
	}
	return "new Promise(function(resolve) { resolve(); })";
};

function asComment(str) {
	if(!str) return "";
	return `/* ${str} */`;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872171, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class ContextElementDependency extends ModuleDependency {
	constructor(request, userRequest) {
		super(request);
		if(userRequest) {
			this.userRequest = userRequest;
		}
	}

	get type() {
		return "context element";
	}
}

module.exports = ContextElementDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872172, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = require("../Dependency");

class ModuleDependency extends Dependency {
	constructor(request) {
		super();
		this.request = request;
		this.userRequest = request;
	}

	isEqualResource(other) {
		if(!(other instanceof ModuleDependency))
			return false;

		return this.request === other.request;
	}
}

module.exports = ModuleDependency;

}, function(modId) { var map = {"../Dependency":1602510872145}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872173, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Tapable = require("tapable");
const asyncLib = require("async");
const MultiWatching = require("./MultiWatching");
const MultiStats = require("./MultiStats");

module.exports = class MultiCompiler extends Tapable {
	constructor(compilers) {
		super();
		if(!Array.isArray(compilers)) {
			compilers = Object.keys(compilers).map((name) => {
				compilers[name].name = name;
				return compilers[name];
			});
		}
		this.compilers = compilers;
		let doneCompilers = 0;
		let compilerStats = [];
		this.compilers.forEach((compiler, idx) => {
			let compilerDone = false;
			compiler.plugin("done", stats => {
				if(!compilerDone) {
					compilerDone = true;
					doneCompilers++;
				}
				compilerStats[idx] = stats;
				if(doneCompilers === this.compilers.length) {
					this.applyPlugins("done", new MultiStats(compilerStats));
				}
			});
			compiler.plugin("invalid", () => {
				if(compilerDone) {
					compilerDone = false;
					doneCompilers--;
				}
				this.applyPlugins("invalid");
			});
		}, this);
	}

	get outputPath() {
		let commonPath = this.compilers[0].outputPath;
		for(const compiler of this.compilers) {
			while(compiler.outputPath.indexOf(commonPath) !== 0 && /[/\\]/.test(commonPath)) {
				commonPath = commonPath.replace(/[/\\][^/\\]*$/, "");
			}
		}

		if(!commonPath && this.compilers[0].outputPath[0] === "/") return "/";
		return commonPath;
	}

	get inputFileSystem() {
		throw new Error("Cannot read inputFileSystem of a MultiCompiler");
	}

	get outputFileSystem() {
		throw new Error("Cannot read outputFileSystem of a MultiCompiler");
	}

	set inputFileSystem(value) {
		this.compilers.forEach(compiler => {
			compiler.inputFileSystem = value;
		});
	}

	set outputFileSystem(value) {
		this.compilers.forEach(compiler => {
			compiler.outputFileSystem = value;
		});
	}

	runWithDependencies(compilers, fn, callback) {
		let fulfilledNames = {};
		let remainingCompilers = compilers;
		const isDependencyFulfilled = (d) => fulfilledNames[d];
		const getReadyCompilers = () => {
			let readyCompilers = [];
			let list = remainingCompilers;
			remainingCompilers = [];
			for(const c of list) {
				const ready = !c.dependencies || c.dependencies.every(isDependencyFulfilled);
				if(ready)
					readyCompilers.push(c);
				else
					remainingCompilers.push(c);
			}
			return readyCompilers;
		};
		const runCompilers = (callback) => {
			if(remainingCompilers.length === 0) return callback();
			asyncLib.map(getReadyCompilers(), (compiler, callback) => {
				fn(compiler, (err) => {
					if(err) return callback(err);
					fulfilledNames[compiler.name] = true;
					runCompilers(callback);
				});
			}, callback);
		};
		runCompilers(callback);
	}

	watch(watchOptions, handler) {
		let watchings = [];
		let allStats = this.compilers.map(() => null);
		let compilerStatus = this.compilers.map(() => false);
		this.runWithDependencies(this.compilers, (compiler, callback) => {
			const compilerIdx = this.compilers.indexOf(compiler);
			let firstRun = true;
			let watching = compiler.watch(Array.isArray(watchOptions) ? watchOptions[compilerIdx] : watchOptions, (err, stats) => {
				if(err)
					handler(err);
				if(stats) {
					allStats[compilerIdx] = stats;
					compilerStatus[compilerIdx] = "new";
					if(compilerStatus.every(Boolean)) {
						const freshStats = allStats.filter((s, idx) => {
							return compilerStatus[idx] === "new";
						});
						compilerStatus.fill(true);
						const multiStats = new MultiStats(freshStats);
						handler(null, multiStats);
					}
				}
				if(firstRun && !err) {
					firstRun = false;
					callback();
				}
			});
			watchings.push(watching);
		}, () => {
			// ignore
		});

		return new MultiWatching(watchings, this);
	}

	run(callback) {
		const allStats = this.compilers.map(() => null);
		this.runWithDependencies(this.compilers, ((compiler, callback) => {
			const compilerIdx = this.compilers.indexOf(compiler);
			compiler.run((err, stats) => {
				if(err) return callback(err);
				allStats[compilerIdx] = stats;
				callback();
			});
		}), (err) => {
			if(err) return callback(err);
			callback(null, new MultiStats(allStats));
		});
	}

	purgeInputFileSystem() {
		this.compilers.forEach((compiler) => {
			if(compiler.inputFileSystem && compiler.inputFileSystem.purge)
				compiler.inputFileSystem.purge();
		});
	}
};

}, function(modId) { var map = {"./MultiWatching":1602510872174,"./MultiStats":1602510872175}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872174, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const asyncLib = require("async");

class MultiWatching {
	constructor(watchings, compiler) {
		this.watchings = watchings;
		this.compiler = compiler;
	}

	invalidate() {
		this.watchings.forEach((watching) => watching.invalidate());
	}

	close(callback) {
		if(callback === undefined) callback = () => { /*do nothing*/ };

		asyncLib.forEach(this.watchings, (watching, finishedCallback) => {
			watching.close(finishedCallback);
		}, err => {
			this.compiler.applyPlugins("watch-close");
			callback(err);
		});

	}
}

module.exports = MultiWatching;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872175, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Stats = require("./Stats");

const optionOrFallback = (optionValue, fallbackValue) => optionValue !== undefined ? optionValue : fallbackValue;

class MultiStats {
	constructor(stats) {
		this.stats = stats;
		this.hash = stats.map(stat => stat.hash).join("");
	}

	hasErrors() {
		return this.stats.map((stat) => stat.hasErrors()).reduce((a, b) => a || b, false);
	}

	hasWarnings() {
		return this.stats.map((stat) => stat.hasWarnings()).reduce((a, b) => a || b, false);
	}

	toJson(options, forToString) {
		if(typeof options === "boolean" || typeof options === "string") {
			options = Stats.presetToOptions(options);
		} else if(!options) {
			options = {};
		}
		const jsons = this.stats.map((stat, idx) => {
			const childOptions = Stats.getChildOptions(options, idx);
			const obj = stat.toJson(childOptions, forToString);
			obj.name = stat.compilation && stat.compilation.name;
			return obj;
		});
		const showVersion = typeof options.version === "undefined" ? jsons.every(j => j.version) : options.version !== false;
		const showHash = typeof options.hash === "undefined" ? jsons.every(j => j.hash) : options.hash !== false;
		jsons.forEach(j => {
			if(showVersion)
				delete j.version;
		});
		const obj = {
			errors: jsons.reduce((arr, j) => {
				return arr.concat(j.errors.map(msg => {
					return `(${j.name}) ${msg}`;
				}));
			}, []),
			warnings: jsons.reduce((arr, j) => {
				return arr.concat(j.warnings.map(msg => {
					return `(${j.name}) ${msg}`;
				}));
			}, [])
		};
		if(showVersion)
			obj.version = require("../package.json").version;
		if(showHash)
			obj.hash = this.hash;
		if(options.children !== false)
			obj.children = jsons;
		return obj;
	}

	toString(options) {
		if(typeof options === "boolean" || typeof options === "string") {
			options = Stats.presetToOptions(options);
		} else if(!options) {
			options = {};
		}

		const useColors = optionOrFallback(options.colors, false);

		const obj = this.toJson(options, true);

		return Stats.jsonToString(obj, useColors);
	}
}

module.exports = MultiStats;

}, function(modId) { var map = {"./Stats":1602510872148,"../package.json":1602510872152}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872176, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const NodeWatchFileSystem = require("./NodeWatchFileSystem");
const NodeOutputFileSystem = require("./NodeOutputFileSystem");
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");

class NodeEnvironmentPlugin {
	apply(compiler) {
		compiler.inputFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000);
		const inputFileSystem = compiler.inputFileSystem;
		compiler.outputFileSystem = new NodeOutputFileSystem();
		compiler.watchFileSystem = new NodeWatchFileSystem(compiler.inputFileSystem);
		compiler.plugin("before-run", (compiler, callback) => {
			if(compiler.inputFileSystem === inputFileSystem)
				inputFileSystem.purge();
			callback();
		});
	}
}
module.exports = NodeEnvironmentPlugin;

}, function(modId) { var map = {"./NodeWatchFileSystem":1602510872177,"./NodeOutputFileSystem":1602510872178}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872177, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Watchpack = require("watchpack");

class NodeWatchFileSystem {
	constructor(inputFileSystem) {
		this.inputFileSystem = inputFileSystem;
		this.watcherOptions = {
			aggregateTimeout: 0
		};
		this.watcher = new Watchpack(this.watcherOptions);
	}

	watch(files, dirs, missing, startTime, options, callback, callbackUndelayed) {
		if(!Array.isArray(files))
			throw new Error("Invalid arguments: 'files'");
		if(!Array.isArray(dirs))
			throw new Error("Invalid arguments: 'dirs'");
		if(!Array.isArray(missing))
			throw new Error("Invalid arguments: 'missing'");
		if(typeof callback !== "function")
			throw new Error("Invalid arguments: 'callback'");
		if(typeof startTime !== "number" && startTime)
			throw new Error("Invalid arguments: 'startTime'");
		if(typeof options !== "object")
			throw new Error("Invalid arguments: 'options'");
		if(typeof callbackUndelayed !== "function" && callbackUndelayed)
			throw new Error("Invalid arguments: 'callbackUndelayed'");
		const oldWatcher = this.watcher;
		this.watcher = new Watchpack(options);

		if(callbackUndelayed)
			this.watcher.once("change", callbackUndelayed);

		this.watcher.once("aggregated", (changes, removals) => {
			changes = changes.concat(removals);
			if(this.inputFileSystem && this.inputFileSystem.purge) {
				this.inputFileSystem.purge(changes);
			}
			const times = this.watcher.getTimes();
			callback(null,
				changes.filter(file => files.indexOf(file) >= 0).sort(),
				changes.filter(file => dirs.indexOf(file) >= 0).sort(),
				changes.filter(file => missing.indexOf(file) >= 0).sort(), times, times);
		});

		this.watcher.watch(files.concat(missing), dirs.concat(missing), startTime);

		if(oldWatcher) {
			oldWatcher.close();
		}
		return {
			close: () => {
				if(this.watcher) {
					this.watcher.close();
					this.watcher = null;
				}
			},
			pause: () => {
				if(this.watcher) {
					this.watcher.pause();
				}
			}
		};
	}
}

module.exports = NodeWatchFileSystem;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872178, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

class NodeOutputFileSystem {
	constructor() {
		this.mkdirp = mkdirp;
		this.mkdir = fs.mkdir.bind(fs);
		this.rmdir = fs.rmdir.bind(fs);
		this.unlink = fs.unlink.bind(fs);
		this.writeFile = fs.writeFile.bind(fs);
		this.join = path.join.bind(path);
	}
}

module.exports = NodeOutputFileSystem;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872179, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const OptionsApply = require("./OptionsApply");

const LoaderTargetPlugin = require("./LoaderTargetPlugin");
const FunctionModulePlugin = require("./FunctionModulePlugin");
const EvalDevToolModulePlugin = require("./EvalDevToolModulePlugin");
const SourceMapDevToolPlugin = require("./SourceMapDevToolPlugin");
const EvalSourceMapDevToolPlugin = require("./EvalSourceMapDevToolPlugin");

const EntryOptionPlugin = require("./EntryOptionPlugin");
const RecordIdsPlugin = require("./RecordIdsPlugin");

const APIPlugin = require("./APIPlugin");
const ConstPlugin = require("./ConstPlugin");
const RequireJsStuffPlugin = require("./RequireJsStuffPlugin");
const NodeStuffPlugin = require("./NodeStuffPlugin");
const CompatibilityPlugin = require("./CompatibilityPlugin");

const TemplatedPathPlugin = require("./TemplatedPathPlugin");
const WarnCaseSensitiveModulesPlugin = require("./WarnCaseSensitiveModulesPlugin");
const UseStrictPlugin = require("./UseStrictPlugin");

const LoaderPlugin = require("./dependencies/LoaderPlugin");
const CommonJsPlugin = require("./dependencies/CommonJsPlugin");
const HarmonyModulesPlugin = require("./dependencies/HarmonyModulesPlugin");
const SystemPlugin = require("./dependencies/SystemPlugin");
const ImportPlugin = require("./dependencies/ImportPlugin");
const AMDPlugin = require("./dependencies/AMDPlugin");
const RequireContextPlugin = require("./dependencies/RequireContextPlugin");
const RequireEnsurePlugin = require("./dependencies/RequireEnsurePlugin");
const RequireIncludePlugin = require("./dependencies/RequireIncludePlugin");

const EnsureChunkConditionsPlugin = require("./optimize/EnsureChunkConditionsPlugin");
const RemoveParentModulesPlugin = require("./optimize/RemoveParentModulesPlugin");
const RemoveEmptyChunksPlugin = require("./optimize/RemoveEmptyChunksPlugin");
const MergeDuplicateChunksPlugin = require("./optimize/MergeDuplicateChunksPlugin");
const FlagIncludedChunksPlugin = require("./optimize/FlagIncludedChunksPlugin");
const OccurrenceOrderPlugin = require("./optimize/OccurrenceOrderPlugin");
const FlagDependencyUsagePlugin = require("./FlagDependencyUsagePlugin");
const FlagDependencyExportsPlugin = require("./FlagDependencyExportsPlugin");
const SizeLimitsPlugin = require("./performance/SizeLimitsPlugin");

const ResolverFactory = require("enhanced-resolve").ResolverFactory;

class WebpackOptionsApply extends OptionsApply {
	constructor() {
		super();
	}

	process(options, compiler) {
		let ExternalsPlugin;
		compiler.outputPath = options.output.path;
		compiler.recordsInputPath = options.recordsInputPath || options.recordsPath;
		compiler.recordsOutputPath = options.recordsOutputPath || options.recordsPath;
		compiler.name = options.name;
		compiler.dependencies = options.dependencies;
		if(typeof options.target === "string") {
			let JsonpTemplatePlugin;
			let NodeSourcePlugin;
			let NodeTargetPlugin;
			let NodeTemplatePlugin;

			switch(options.target) {
				case "web":
					JsonpTemplatePlugin = require("./JsonpTemplatePlugin");
					NodeSourcePlugin = require("./node/NodeSourcePlugin");
					compiler.apply(
						new JsonpTemplatePlugin(options.output),
						new FunctionModulePlugin(options.output),
						new NodeSourcePlugin(options.node),
						new LoaderTargetPlugin(options.target)
					);
					break;
				case "webworker":
					{
						let WebWorkerTemplatePlugin = require("./webworker/WebWorkerTemplatePlugin");
						NodeSourcePlugin = require("./node/NodeSourcePlugin");
						compiler.apply(
							new WebWorkerTemplatePlugin(),
							new FunctionModulePlugin(options.output),
							new NodeSourcePlugin(options.node),
							new LoaderTargetPlugin(options.target)
						);
						break;
					}
				case "node":
				case "async-node":
					NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					compiler.apply(
						new NodeTemplatePlugin({
							asyncChunkLoading: options.target === "async-node"
						}),
						new FunctionModulePlugin(options.output),
						new NodeTargetPlugin(),
						new LoaderTargetPlugin("node")
					);
					break;
				case "node-webkit":
					JsonpTemplatePlugin = require("./JsonpTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					ExternalsPlugin = require("./ExternalsPlugin");
					compiler.apply(
						new JsonpTemplatePlugin(options.output),
						new FunctionModulePlugin(options.output),
						new NodeTargetPlugin(),
						new ExternalsPlugin("commonjs", "nw.gui"),
						new LoaderTargetPlugin(options.target)
					);
					break;
				case "atom":
				case "electron":
				case "electron-main":
					NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					ExternalsPlugin = require("./ExternalsPlugin");
					compiler.apply(
						new NodeTemplatePlugin({
							asyncChunkLoading: true
						}),
						new FunctionModulePlugin(options.output),
						new NodeTargetPlugin(),
						new ExternalsPlugin("commonjs", [
							"app",
							"auto-updater",
							"browser-window",
							"content-tracing",
							"dialog",
							"electron",
							"global-shortcut",
							"ipc",
							"ipc-main",
							"menu",
							"menu-item",
							"power-monitor",
							"power-save-blocker",
							"protocol",
							"session",
							"web-contents",
							"tray",
							"clipboard",
							"crash-reporter",
							"native-image",
							"screen",
							"shell"
						]),
						new LoaderTargetPlugin(options.target)
					);
					break;
				case "electron-renderer":
					JsonpTemplatePlugin = require("./JsonpTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					ExternalsPlugin = require("./ExternalsPlugin");
					compiler.apply(
						new JsonpTemplatePlugin(options.output),
						new FunctionModulePlugin(options.output),
						new NodeTargetPlugin(),
						new ExternalsPlugin("commonjs", [
							"desktop-capturer",
							"electron",
							"ipc",
							"ipc-renderer",
							"remote",
							"web-frame",
							"clipboard",
							"crash-reporter",
							"native-image",
							"screen",
							"shell"
						]),
						new LoaderTargetPlugin(options.target)
					);
					break;
				default:
					throw new Error("Unsupported target '" + options.target + "'.");
			}
		} else if(options.target !== false) {
			options.target(compiler);
		} else {
			throw new Error("Unsupported target '" + options.target + "'.");
		}

		if(options.output.library || options.output.libraryTarget !== "var") {
			let LibraryTemplatePlugin = require("./LibraryTemplatePlugin");
			compiler.apply(new LibraryTemplatePlugin(options.output.library, options.output.libraryTarget, options.output.umdNamedDefine, options.output.auxiliaryComment || "", options.output.libraryExport));
		}
		if(options.externals) {
			ExternalsPlugin = require("./ExternalsPlugin");
			compiler.apply(new ExternalsPlugin(options.output.libraryTarget, options.externals));
		}
		let noSources;
		let legacy;
		let modern;
		let comment;
		if(options.devtool && (options.devtool.indexOf("sourcemap") >= 0 || options.devtool.indexOf("source-map") >= 0)) {
			const hidden = options.devtool.indexOf("hidden") >= 0;
			const inline = options.devtool.indexOf("inline") >= 0;
			const evalWrapped = options.devtool.indexOf("eval") >= 0;
			const cheap = options.devtool.indexOf("cheap") >= 0;
			const moduleMaps = options.devtool.indexOf("module") >= 0;
			noSources = options.devtool.indexOf("nosources") >= 0;
			legacy = options.devtool.indexOf("@") >= 0;
			modern = options.devtool.indexOf("#") >= 0;
			comment = legacy && modern ? "\n/*\n//@ source" + "MappingURL=[url]\n//# source" + "MappingURL=[url]\n*/" :
				legacy ? "\n/*\n//@ source" + "MappingURL=[url]\n*/" :
				modern ? "\n//# source" + "MappingURL=[url]" :
				null;
			let Plugin = evalWrapped ? EvalSourceMapDevToolPlugin : SourceMapDevToolPlugin;
			compiler.apply(new Plugin({
				filename: inline ? null : options.output.sourceMapFilename,
				moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
				fallbackModuleFilenameTemplate: options.output.devtoolFallbackModuleFilenameTemplate,
				append: hidden ? false : comment,
				module: moduleMaps ? true : cheap ? false : true,
				columns: cheap ? false : true,
				lineToLine: options.output.devtoolLineToLine,
				noSources: noSources,
			}));
		} else if(options.devtool && options.devtool.indexOf("eval") >= 0) {
			legacy = options.devtool.indexOf("@") >= 0;
			modern = options.devtool.indexOf("#") >= 0;
			comment = legacy && modern ? "\n//@ sourceURL=[url]\n//# sourceURL=[url]" :
				legacy ? "\n//@ sourceURL=[url]" :
				modern ? "\n//# sourceURL=[url]" :
				null;
			compiler.apply(new EvalDevToolModulePlugin(comment, options.output.devtoolModuleFilenameTemplate));
		}

		compiler.apply(new EntryOptionPlugin());
		compiler.applyPluginsBailResult("entry-option", options.context, options.entry);

		compiler.apply(
			new CompatibilityPlugin(),
			new HarmonyModulesPlugin(options.module),
			new AMDPlugin(options.module, options.amd || {}),
			new CommonJsPlugin(options.module),
			new LoaderPlugin(),
			new NodeStuffPlugin(options.node),
			new RequireJsStuffPlugin(),
			new APIPlugin(),
			new ConstPlugin(),
			new UseStrictPlugin(),
			new RequireIncludePlugin(),
			new RequireEnsurePlugin(),
			new RequireContextPlugin(options.resolve.modules, options.resolve.extensions, options.resolve.mainFiles),
			new ImportPlugin(options.module),
			new SystemPlugin(options.module)
		);

		compiler.apply(
			new EnsureChunkConditionsPlugin(),
			new RemoveParentModulesPlugin(),
			new RemoveEmptyChunksPlugin(),
			new MergeDuplicateChunksPlugin(),
			new FlagIncludedChunksPlugin(),
			new OccurrenceOrderPlugin(true),
			new FlagDependencyExportsPlugin(),
			new FlagDependencyUsagePlugin()
		);

		if(options.performance) {
			compiler.apply(new SizeLimitsPlugin(options.performance));
		}

		compiler.apply(new TemplatedPathPlugin());

		compiler.apply(new RecordIdsPlugin());

		compiler.apply(new WarnCaseSensitiveModulesPlugin());

		if(options.cache) {
			let CachePlugin = require("./CachePlugin");
			compiler.apply(new CachePlugin(typeof options.cache === "object" ? options.cache : null));
		}

		compiler.applyPlugins("after-plugins", compiler);
		if(!compiler.inputFileSystem) throw new Error("No input filesystem provided");
		compiler.resolvers.normal = ResolverFactory.createResolver(Object.assign({
			fileSystem: compiler.inputFileSystem
		}, options.resolve));
		compiler.resolvers.context = ResolverFactory.createResolver(Object.assign({
			fileSystem: compiler.inputFileSystem,
			resolveToContext: true
		}, options.resolve));
		compiler.resolvers.loader = ResolverFactory.createResolver(Object.assign({
			fileSystem: compiler.inputFileSystem
		}, options.resolveLoader));
		compiler.applyPlugins("after-resolvers", compiler);
		return options;
	}
}

module.exports = WebpackOptionsApply;

}, function(modId) { var map = {"./OptionsApply":1602510872180,"./LoaderTargetPlugin":1602510872181,"./FunctionModulePlugin":1602510872182,"./EvalDevToolModulePlugin":1602510872184,"./SourceMapDevToolPlugin":1602510872187,"./EvalSourceMapDevToolPlugin":1602510872189,"./EntryOptionPlugin":1602510872191,"./RecordIdsPlugin":1602510872199,"./APIPlugin":1602510872200,"./ConstPlugin":1602510872206,"./RequireJsStuffPlugin":1602510872207,"./NodeStuffPlugin":1602510872208,"./CompatibilityPlugin":1602510872209,"./TemplatedPathPlugin":1602510872210,"./WarnCaseSensitiveModulesPlugin":1602510872211,"./UseStrictPlugin":1602510872213,"./dependencies/LoaderPlugin":1602510872214,"./dependencies/CommonJsPlugin":1602510872216,"./dependencies/HarmonyModulesPlugin":1602510872235,"./dependencies/SystemPlugin":1602510872249,"./dependencies/ImportPlugin":1602510872250,"./dependencies/AMDPlugin":1602510872261,"./dependencies/RequireContextPlugin":1602510872273,"./dependencies/RequireEnsurePlugin":1602510872276,"./dependencies/RequireIncludePlugin":1602510872281,"./optimize/EnsureChunkConditionsPlugin":1602510872284,"./optimize/RemoveParentModulesPlugin":1602510872285,"./optimize/RemoveEmptyChunksPlugin":1602510872286,"./optimize/MergeDuplicateChunksPlugin":1602510872287,"./optimize/FlagIncludedChunksPlugin":1602510872288,"./optimize/OccurrenceOrderPlugin":1602510872289,"./FlagDependencyUsagePlugin":1602510872290,"./FlagDependencyExportsPlugin":1602510872291,"./performance/SizeLimitsPlugin":1602510872292,"./JsonpTemplatePlugin":1602510872296,"./node/NodeSourcePlugin":1602510872301,"./webworker/WebWorkerTemplatePlugin":1602510872302,"./node/NodeTemplatePlugin":1602510872307,"./node/NodeTargetPlugin":1602510872313,"./ExternalsPlugin":1602510872314,"./LibraryTemplatePlugin":1602510872317,"./CachePlugin":1602510872323}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872180, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class OptionsApply {
	process(options, compiler) {}
}
module.exports = OptionsApply;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872181, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class LoaderTargetPlugin {
	constructor(target) {
		this.target = target;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("normal-module-loader", (loaderContext) => loaderContext.target = this.target);
		});
	}
}

module.exports = LoaderTargetPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872182, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const FunctionModuleTemplatePlugin = require("./FunctionModuleTemplatePlugin");
const RequestShortener = require("./RequestShortener");

class FunctionModulePlugin {
	constructor(options, requestShortener) {
		this.options = options;
		this.requestShortener = requestShortener;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.moduleTemplate.requestShortener = this.requestShortener || new RequestShortener(compiler.context);
			compilation.moduleTemplate.apply(new FunctionModuleTemplatePlugin());
		});
	}
}

module.exports = FunctionModulePlugin;

}, function(modId) { var map = {"./FunctionModuleTemplatePlugin":1602510872183,"./RequestShortener":1602510872149}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872183, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

class FunctionModuleTemplatePlugin {
	apply(moduleTemplate) {
		moduleTemplate.plugin("render", function(moduleSource, module) {
			const source = new ConcatSource();
			const defaultArguments = [module.moduleArgument || "module", module.exportsArgument || "exports"];
			if((module.arguments && module.arguments.length !== 0) || module.hasDependencies(d => d.requireWebpackRequire !== false)) {
				defaultArguments.push("__webpack_require__");
			}
			source.add("/***/ (function(" + defaultArguments.concat(module.arguments || []).join(", ") + ") {\n\n");
			if(module.strict) source.add("\"use strict\";\n");
			source.add(moduleSource);
			source.add("\n\n/***/ })");
			return source;
		});

		moduleTemplate.plugin("package", function(moduleSource, module) {
			if(this.outputOptions.pathinfo) {
				const source = new ConcatSource();
				const req = module.readableIdentifier(this.requestShortener);
				source.add("/*!****" + req.replace(/./g, "*") + "****!*\\\n");
				source.add("  !*** " + req.replace(/\*\//g, "*_/") + " ***!\n");
				source.add("  \\****" + req.replace(/./g, "*") + "****/\n");
				if(Array.isArray(module.providedExports) && module.providedExports.length === 0)
					source.add("/*! no exports provided */\n");
				else if(Array.isArray(module.providedExports))
					source.add("/*! exports provided: " + module.providedExports.join(", ") + " */\n");
				else if(module.providedExports)
					source.add("/*! dynamic exports provided */\n");
				if(Array.isArray(module.usedExports) && module.usedExports.length === 0)
					source.add("/*! no exports used */\n");
				else if(Array.isArray(module.usedExports))
					source.add("/*! exports used: " + module.usedExports.join(", ") + " */\n");
				else if(module.usedExports)
					source.add("/*! all exports used */\n");
				if(module.optimizationBailout) {
					module.optimizationBailout.forEach(text => {
						if(typeof text === "function") text = text(this.requestShortener);
						source.add(`/*! ${text} */\n`);
					});
				}
				source.add(moduleSource);
				return source;
			}
			return moduleSource;
		});

		moduleTemplate.plugin("hash", function(hash) {
			hash.update("FunctionModuleTemplatePlugin");
			hash.update("2");
		});
	}
}
module.exports = FunctionModuleTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872184, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const EvalDevToolModuleTemplatePlugin = require("./EvalDevToolModuleTemplatePlugin");

class EvalDevToolModulePlugin {
	constructor(sourceUrlComment, moduleFilenameTemplate) {
		this.sourceUrlComment = sourceUrlComment;
		this.moduleFilenameTemplate = moduleFilenameTemplate;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.moduleTemplate.apply(new EvalDevToolModuleTemplatePlugin(this.sourceUrlComment, this.moduleFilenameTemplate));
		});
	}
}

module.exports = EvalDevToolModulePlugin;

}, function(modId) { var map = {"./EvalDevToolModuleTemplatePlugin":1602510872185}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872185, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RawSource = require("webpack-sources").RawSource;
const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");

class EvalDevToolModuleTemplatePlugin {
	constructor(sourceUrlComment, moduleFilenameTemplate) {
		this.sourceUrlComment = sourceUrlComment || "\n//# sourceURL=[url]";
		this.moduleFilenameTemplate = moduleFilenameTemplate || "webpack:///[resourcePath]?[loaders]";
	}

	apply(moduleTemplate) {
		moduleTemplate.plugin("module", (source, module) => {
			const content = source.source();
			const str = ModuleFilenameHelpers.createFilename(module, this.moduleFilenameTemplate, moduleTemplate.requestShortener);
			const footer = ["\n",
				ModuleFilenameHelpers.createFooter(module, moduleTemplate.requestShortener),
				this.sourceUrlComment.replace(/\[url\]/g, encodeURI(str).replace(/%2F/g, "/").replace(/%20/g, "_").replace(/%5E/g, "^").replace(/%5C/g, "\\").replace(/^\//, ""))
			].join("\n");
			return new RawSource(`eval(${JSON.stringify(content + footer)});`);
		});
		moduleTemplate.plugin("hash", hash => {
			hash.update("EvalDevToolModuleTemplatePlugin");
			hash.update("2");
		});
	}
}

module.exports = EvalDevToolModuleTemplatePlugin;

}, function(modId) { var map = {"./ModuleFilenameHelpers":1602510872186}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872186, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ModuleFilenameHelpers = exports;

ModuleFilenameHelpers.ALL_LOADERS_RESOURCE = "[all-loaders][resource]";
ModuleFilenameHelpers.REGEXP_ALL_LOADERS_RESOURCE = /\[all-?loaders\]\[resource\]/gi;
ModuleFilenameHelpers.LOADERS_RESOURCE = "[loaders][resource]";
ModuleFilenameHelpers.REGEXP_LOADERS_RESOURCE = /\[loaders\]\[resource\]/gi;
ModuleFilenameHelpers.RESOURCE = "[resource]";
ModuleFilenameHelpers.REGEXP_RESOURCE = /\[resource\]/gi;
ModuleFilenameHelpers.ABSOLUTE_RESOURCE_PATH = "[absolute-resource-path]";
ModuleFilenameHelpers.REGEXP_ABSOLUTE_RESOURCE_PATH = /\[abs(olute)?-?resource-?path\]/gi;
ModuleFilenameHelpers.RESOURCE_PATH = "[resource-path]";
ModuleFilenameHelpers.REGEXP_RESOURCE_PATH = /\[resource-?path\]/gi;
ModuleFilenameHelpers.ALL_LOADERS = "[all-loaders]";
ModuleFilenameHelpers.REGEXP_ALL_LOADERS = /\[all-?loaders\]/gi;
ModuleFilenameHelpers.LOADERS = "[loaders]";
ModuleFilenameHelpers.REGEXP_LOADERS = /\[loaders\]/gi;
ModuleFilenameHelpers.QUERY = "[query]";
ModuleFilenameHelpers.REGEXP_QUERY = /\[query\]/gi;
ModuleFilenameHelpers.ID = "[id]";
ModuleFilenameHelpers.REGEXP_ID = /\[id\]/gi;
ModuleFilenameHelpers.HASH = "[hash]";
ModuleFilenameHelpers.REGEXP_HASH = /\[hash\]/gi;

function getAfter(str, token) {
	const idx = str.indexOf(token);
	return idx < 0 ? "" : str.substr(idx);
}

function getBefore(str, token) {
	const idx = str.lastIndexOf(token);
	return idx < 0 ? "" : str.substr(0, idx);
}

function getHash(str) {
	const hash = require("crypto").createHash("md5");
	hash.update(str);
	return hash.digest("hex").substr(0, 4);
}

function asRegExp(test) {
	if(typeof test === "string") test = new RegExp("^" + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
	return test;
}

ModuleFilenameHelpers.createFilename = function createFilename(module, moduleFilenameTemplate, requestShortener) {
	let absoluteResourcePath;
	let hash;
	let identifier;
	let moduleId;
	let shortIdentifier;
	if(module === undefined) module = "";
	if(typeof module === "string") {
		shortIdentifier = requestShortener.shorten(module);
		identifier = shortIdentifier;
		moduleId = "";
		absoluteResourcePath = module.split("!").pop();
		hash = getHash(identifier);
	} else {
		shortIdentifier = module.readableIdentifier(requestShortener);
		identifier = requestShortener.shorten(module.identifier());
		moduleId = module.id;
		absoluteResourcePath = module.identifier().split("!").pop();
		hash = getHash(identifier);
	}
	const resource = shortIdentifier.split("!").pop();
	const loaders = getBefore(shortIdentifier, "!");
	const allLoaders = getBefore(identifier, "!");
	const query = getAfter(resource, "?");
	const resourcePath = resource.substr(0, resource.length - query.length);
	if(typeof moduleFilenameTemplate === "function") {
		return moduleFilenameTemplate({
			identifier: identifier,
			shortIdentifier: shortIdentifier,
			resource: resource,
			resourcePath: resourcePath,
			absoluteResourcePath: absoluteResourcePath,
			allLoaders: allLoaders,
			query: query,
			moduleId: moduleId,
			hash: hash
		});
	}
	return moduleFilenameTemplate
		.replace(ModuleFilenameHelpers.REGEXP_ALL_LOADERS_RESOURCE, identifier)
		.replace(ModuleFilenameHelpers.REGEXP_LOADERS_RESOURCE, shortIdentifier)
		.replace(ModuleFilenameHelpers.REGEXP_RESOURCE, resource)
		.replace(ModuleFilenameHelpers.REGEXP_RESOURCE_PATH, resourcePath)
		.replace(ModuleFilenameHelpers.REGEXP_ABSOLUTE_RESOURCE_PATH, absoluteResourcePath)
		.replace(ModuleFilenameHelpers.REGEXP_ALL_LOADERS, allLoaders)
		.replace(ModuleFilenameHelpers.REGEXP_LOADERS, loaders)
		.replace(ModuleFilenameHelpers.REGEXP_QUERY, query)
		.replace(ModuleFilenameHelpers.REGEXP_ID, moduleId)
		.replace(ModuleFilenameHelpers.REGEXP_HASH, hash);
};

ModuleFilenameHelpers.createFooter = function createFooter(module, requestShortener) {
	if(!module) module = "";
	if(typeof module === "string") {
		return [
			"// WEBPACK FOOTER //",
			`// ${requestShortener.shorten(module)}`
		].join("\n");
	} else {
		return [
			"//////////////////",
			"// WEBPACK FOOTER",
			`// ${module.readableIdentifier(requestShortener)}`,
			`// module id = ${module.id}`,
			`// module chunks = ${module.mapChunks(c => c.id).join(" ")}`
		].join("\n");
	}
};

ModuleFilenameHelpers.replaceDuplicates = function replaceDuplicates(array, fn, comparator) {
	const countMap = Object.create(null);
	const posMap = Object.create(null);
	array.forEach((item, idx) => {
		countMap[item] = (countMap[item] || []);
		countMap[item].push(idx);
		posMap[item] = 0;
	});
	if(comparator) {
		Object.keys(countMap).forEach(item => {
			countMap[item].sort(comparator);
		});
	}
	return array.map((item, i) => {
		if(countMap[item].length > 1) {
			if(comparator && countMap[item][0] === i)
				return item;
			return fn(item, i, posMap[item]++);
		} else return item;
	});
};

ModuleFilenameHelpers.matchPart = function matchPart(str, test) {
	if(!test) return true;
	test = asRegExp(test);
	if(Array.isArray(test)) {
		return test.map(asRegExp).filter(function(regExp) {
			return regExp.test(str);
		}).length > 0;
	} else {
		return test.test(str);
	}
};

ModuleFilenameHelpers.matchObject = function matchObject(obj, str) {
	if(obj.test)
		if(!ModuleFilenameHelpers.matchPart(str, obj.test)) return false;
	if(obj.include)
		if(!ModuleFilenameHelpers.matchPart(str, obj.include)) return false;
	if(obj.exclude)
		if(ModuleFilenameHelpers.matchPart(str, obj.exclude)) return false;
	return true;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872187, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const crypto = require("crypto");
const RequestShortener = require("./RequestShortener");
const ConcatSource = require("webpack-sources").ConcatSource;
const RawSource = require("webpack-sources").RawSource;
const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");
const SourceMapDevToolModuleOptionsPlugin = require("./SourceMapDevToolModuleOptionsPlugin");

const basename = (name) => {
	if(name.indexOf("/") < 0) return name;
	return name.substr(name.lastIndexOf("/") + 1);
};

function getTaskForFile(file, chunk, options, compilation) {
	const asset = compilation.assets[file];
	if(asset.__SourceMapDevToolFile === file && asset.__SourceMapDevToolData) {
		const data = asset.__SourceMapDevToolData;
		for(const cachedFile in data) {
			compilation.assets[cachedFile] = data[cachedFile];
			if(cachedFile !== file)
				chunk.files.push(cachedFile);
		}
		return;
	}
	let source, sourceMap;
	if(asset.sourceAndMap) {
		const sourceAndMap = asset.sourceAndMap(options);
		sourceMap = sourceAndMap.map;
		source = sourceAndMap.source;
	} else {
		sourceMap = asset.map(options);
		source = asset.source();
	}
	if(sourceMap) {
		return {
			chunk,
			file,
			asset,
			source,
			sourceMap,
			modules: undefined
		};
	}
}

class SourceMapDevToolPlugin {
	constructor(options) {
		if(arguments.length > 1)
			throw new Error("SourceMapDevToolPlugin only takes one argument (pass an options object)");
		// TODO: remove in webpack 3
		if(typeof options === "string") {
			options = {
				sourceMapFilename: options
			};
		}
		if(!options) options = {};
		this.sourceMapFilename = options.filename;
		this.sourceMappingURLComment = options.append === false ? false : options.append || "\n//# sourceMappingURL=[url]";
		this.moduleFilenameTemplate = options.moduleFilenameTemplate || "webpack:///[resourcePath]";
		this.fallbackModuleFilenameTemplate = options.fallbackModuleFilenameTemplate || "webpack:///[resourcePath]?[hash]";
		this.options = options;
	}

	apply(compiler) {
		const sourceMapFilename = this.sourceMapFilename;
		const sourceMappingURLComment = this.sourceMappingURLComment;
		const moduleFilenameTemplate = this.moduleFilenameTemplate;
		const fallbackModuleFilenameTemplate = this.fallbackModuleFilenameTemplate;
		const requestShortener = new RequestShortener(compiler.context);
		const options = this.options;
		options.test = options.test || /\.(js|css)($|\?)/i;

		const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, options);

		compiler.plugin("compilation", compilation => {
			new SourceMapDevToolModuleOptionsPlugin(options).apply(compilation);

			compilation.plugin("after-optimize-chunk-assets", function(chunks) {
				const moduleToSourceNameMapping = new Map();
				const tasks = [];

				chunks.forEach(function(chunk) {
					chunk.files.forEach(file => {
						if(matchObject(file)) {
							const task = getTaskForFile(file, chunk, options, compilation);

							if(task) {
								const modules = task.sourceMap.sources.map(source => {
									const module = compilation.findModule(source);
									return module || source;
								});

								for(let idx = 0; idx < modules.length; idx++) {
									const module = modules[idx];
									if(!moduleToSourceNameMapping.get(module)) {
										moduleToSourceNameMapping.set(module, ModuleFilenameHelpers.createFilename(module, moduleFilenameTemplate, requestShortener));
									}
								}

								task.modules = modules;

								tasks.push(task);
							}
						}
					});
				});

				const usedNamesSet = new Set(moduleToSourceNameMapping.values());
				const conflictDetectionSet = new Set();

				// all modules in defined order (longest identifier first)
				const allModules = Array.from(moduleToSourceNameMapping.keys()).sort((a, b) => {
					const ai = typeof a === "string" ? a : a.identifier();
					const bi = typeof b === "string" ? b : b.identifier();
					return ai.length - bi.length;
				});

				// find modules with conflicting source names
				for(let idx = 0; idx < allModules.length; idx++) {
					const module = allModules[idx];
					let sourceName = moduleToSourceNameMapping.get(module);
					let hasName = conflictDetectionSet.has(sourceName);
					if(!hasName) {
						conflictDetectionSet.add(sourceName);
						continue;
					}

					// try the fallback name first
					sourceName = ModuleFilenameHelpers.createFilename(module, fallbackModuleFilenameTemplate, requestShortener);
					hasName = usedNamesSet.has(sourceName);
					if(!hasName) {
						moduleToSourceNameMapping.set(module, sourceName);
						usedNamesSet.add(sourceName);
						continue;
					}

					// elsewise just append stars until we have a valid name
					while(hasName) {
						sourceName += "*";
						hasName = usedNamesSet.has(sourceName);
					}
					moduleToSourceNameMapping.set(module, sourceName);
					usedNamesSet.add(sourceName);
				}
				tasks.forEach(function(task) {
					const chunk = task.chunk;
					const file = task.file;
					const asset = task.asset;
					const sourceMap = task.sourceMap;
					const source = task.source;
					const modules = task.modules;
					const moduleFilenames = modules.map(m => moduleToSourceNameMapping.get(m));
					sourceMap.sources = moduleFilenames;
					if(sourceMap.sourcesContent && !options.noSources) {
						sourceMap.sourcesContent = sourceMap.sourcesContent.map((content, i) => typeof content === "string" ? `${content}\n\n\n${ModuleFilenameHelpers.createFooter(modules[i], requestShortener)}` : null);
					} else {
						sourceMap.sourcesContent = undefined;
					}
					sourceMap.sourceRoot = options.sourceRoot || "";
					sourceMap.file = file;
					asset.__SourceMapDevToolFile = file;
					asset.__SourceMapDevToolData = {};
					let currentSourceMappingURLComment = sourceMappingURLComment;
					if(currentSourceMappingURLComment !== false && /\.css($|\?)/i.test(file)) {
						currentSourceMappingURLComment = currentSourceMappingURLComment.replace(/^\n\/\/(.*)$/, "\n/*$1*/");
					}
					const sourceMapString = JSON.stringify(sourceMap);
					if(sourceMapFilename) {
						let filename = file;
						let query = "";
						const idx = filename.indexOf("?");
						if(idx >= 0) {
							query = filename.substr(idx);
							filename = filename.substr(0, idx);
						}
						let sourceMapFile = compilation.getPath(sourceMapFilename, {
							chunk,
							filename: options.fileContext ? path.relative(options.fileContext, filename) : filename,
							query,
							basename: basename(filename)
						});
						if(sourceMapFile.indexOf("[contenthash]") !== -1) {
							sourceMapFile = sourceMapFile.replace(/\[contenthash\]/g, crypto.createHash("md5").update(sourceMapString).digest("hex"));
						}
						const sourceMapUrl = options.publicPath ? options.publicPath + sourceMapFile.replace(/\\/g, "/") : path.relative(path.dirname(file), sourceMapFile).replace(/\\/g, "/");
						if(currentSourceMappingURLComment !== false) {
							asset.__SourceMapDevToolData[file] = compilation.assets[file] = new ConcatSource(new RawSource(source), currentSourceMappingURLComment.replace(/\[url\]/g, sourceMapUrl));
						}
						asset.__SourceMapDevToolData[sourceMapFile] = compilation.assets[sourceMapFile] = new RawSource(sourceMapString);
						chunk.files.push(sourceMapFile);
					} else {
						asset.__SourceMapDevToolData[file] = compilation.assets[file] = new ConcatSource(new RawSource(source), currentSourceMappingURLComment
							.replace(/\[map\]/g, () => sourceMapString)
							.replace(/\[url\]/g, () => `data:application/json;charset=utf-8;base64,${new Buffer(sourceMapString, "utf-8").toString("base64")}`) // eslint-disable-line
						);
					}
				});
			});
		});
	}
}

module.exports = SourceMapDevToolPlugin;

}, function(modId) { var map = {"./RequestShortener":1602510872149,"./ModuleFilenameHelpers":1602510872186,"./SourceMapDevToolModuleOptionsPlugin":1602510872188}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872188, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");

class SourceMapDevToolModuleOptionsPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compilation) {
		const options = this.options;
		if(options.module !== false) {
			compilation.plugin("build-module", module => {
				module.useSourceMap = true;
			});
		}
		if(options.lineToLine === true) {
			compilation.plugin("build-module", module => {
				module.lineToLine = true;
			});
		} else if(options.lineToLine) {
			compilation.plugin("build-module", module => {
				if(!module.resource) return;
				let resourcePath = module.resource;
				const idx = resourcePath.indexOf("?");
				if(idx >= 0) resourcePath = resourcePath.substr(0, idx);
				module.lineToLine = ModuleFilenameHelpers.matchObject(options.lineToLine, resourcePath);
			});
		}
	}
}

module.exports = SourceMapDevToolModuleOptionsPlugin;

}, function(modId) { var map = {"./ModuleFilenameHelpers":1602510872186}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872189, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const EvalSourceMapDevToolModuleTemplatePlugin = require("./EvalSourceMapDevToolModuleTemplatePlugin");
const SourceMapDevToolModuleOptionsPlugin = require("./SourceMapDevToolModuleOptionsPlugin");

class EvalSourceMapDevToolPlugin {
	constructor(options) {
		if(arguments.length > 1)
			throw new Error("EvalSourceMapDevToolPlugin only takes one argument (pass an options object)");
		if(typeof options === "string") {
			options = {
				append: options
			};
		}
		if(!options) options = {};
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation) => {
			new SourceMapDevToolModuleOptionsPlugin(options).apply(compilation);
			compilation.moduleTemplate.apply(new EvalSourceMapDevToolModuleTemplatePlugin(compilation, options));
		});
	}
}

module.exports = EvalSourceMapDevToolPlugin;

}, function(modId) { var map = {"./EvalSourceMapDevToolModuleTemplatePlugin":1602510872190,"./SourceMapDevToolModuleOptionsPlugin":1602510872188}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872190, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RawSource = require("webpack-sources").RawSource;
const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");

class EvalSourceMapDevToolModuleTemplatePlugin {
	constructor(compilation, options) {
		this.compilation = compilation;
		this.sourceMapComment = options.append || "//# sourceURL=[module]\n//# sourceMappingURL=[url]";
		this.moduleFilenameTemplate = options.moduleFilenameTemplate || "webpack:///[resource-path]?[hash]";
		this.options = options;
	}

	apply(moduleTemplate) {
		const self = this;
		const options = this.options;
		moduleTemplate.plugin("module", function(source, module) {
			if(source.__EvalSourceMapDevToolData)
				return source.__EvalSourceMapDevToolData;
			let sourceMap;
			let content;
			if(source.sourceAndMap) {
				const sourceAndMap = source.sourceAndMap(options);
				sourceMap = sourceAndMap.map;
				content = sourceAndMap.source;
			} else {
				sourceMap = source.map(options);
				content = source.source();
			}
			if(!sourceMap) {
				return source;
			}

			// Clone (flat) the sourcemap to ensure that the mutations below do not persist.
			sourceMap = Object.keys(sourceMap).reduce(function(obj, key) {
				obj[key] = sourceMap[key];
				return obj;
			}, {});
			const modules = sourceMap.sources.map(function(source) {
				const module = self.compilation.findModule(source);
				return module || source;
			});
			let moduleFilenames = modules.map(function(module) {
				return ModuleFilenameHelpers.createFilename(module, self.moduleFilenameTemplate, this.requestShortener);
			}, this);
			moduleFilenames = ModuleFilenameHelpers.replaceDuplicates(moduleFilenames, function(filename, i, n) {
				for(let j = 0; j < n; j++)
					filename += "*";
				return filename;
			});
			sourceMap.sources = moduleFilenames;
			if(sourceMap.sourcesContent) {
				sourceMap.sourcesContent = sourceMap.sourcesContent.map(function(content, i) {
					return typeof content === "string" ? `${content}\n\n\n${ModuleFilenameHelpers.createFooter(modules[i], this.requestShortener)}` : null;
				}, this);
			}
			sourceMap.sourceRoot = options.sourceRoot || "";
			sourceMap.file = `${module.id}.js`;

			const footer = self.sourceMapComment.replace(/\[url\]/g, `data:application/json;charset=utf-8;base64,${new Buffer(JSON.stringify(sourceMap), "utf8").toString("base64")}`) + //eslint-disable-line
				`\n//# sourceURL=webpack-internal:///${module.id}\n`; // workaround for chrome bug
			source.__EvalSourceMapDevToolData = new RawSource(`eval(${JSON.stringify(content + footer)});`);
			return source.__EvalSourceMapDevToolData;
		});
		moduleTemplate.plugin("hash", function(hash) {
			hash.update("eval-source-map");
			hash.update("2");
		});
	}
}
module.exports = EvalSourceMapDevToolModuleTemplatePlugin;

}, function(modId) { var map = {"./ModuleFilenameHelpers":1602510872186}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872191, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const SingleEntryPlugin = require("./SingleEntryPlugin");
const MultiEntryPlugin = require("./MultiEntryPlugin");
const DynamicEntryPlugin = require("./DynamicEntryPlugin");

function itemToPlugin(context, item, name) {
	if(Array.isArray(item)) {
		return new MultiEntryPlugin(context, item, name);
	}
	return new SingleEntryPlugin(context, item, name);
}

module.exports = class EntryOptionPlugin {
	apply(compiler) {
		compiler.plugin("entry-option", (context, entry) => {
			if(typeof entry === "string" || Array.isArray(entry)) {
				compiler.apply(itemToPlugin(context, entry, "main"));
			} else if(typeof entry === "object") {
				Object.keys(entry).forEach(name => compiler.apply(itemToPlugin(context, entry[name], name)));
			} else if(typeof entry === "function") {
				compiler.apply(new DynamicEntryPlugin(context, entry));
			}
			return true;
		});
	}
};

}, function(modId) { var map = {"./SingleEntryPlugin":1602510872192,"./MultiEntryPlugin":1602510872194,"./DynamicEntryPlugin":1602510872198}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872192, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const SingleEntryDependency = require("./dependencies/SingleEntryDependency");

class SingleEntryPlugin {
	constructor(context, entry, name) {
		this.context = context;
		this.entry = entry;
		this.name = name;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
		});

		compiler.plugin("make", (compilation, callback) => {
			const dep = SingleEntryPlugin.createDependency(this.entry, this.name);
			compilation.addEntry(this.context, dep, this.name, callback);
		});
	}

	static createDependency(entry, name) {
		const dep = new SingleEntryDependency(entry);
		dep.loc = name;
		return dep;
	}
}

module.exports = SingleEntryPlugin;

}, function(modId) { var map = {"./dependencies/SingleEntryDependency":1602510872193}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872193, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class SingleEntryDependency extends ModuleDependency {
	constructor(request) {
		super(request);
	}

	get type() {
		return "single entry";
	}
}

module.exports = SingleEntryDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872194, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const MultiEntryDependency = require("./dependencies/MultiEntryDependency");
const SingleEntryDependency = require("./dependencies/SingleEntryDependency");
const MultiModuleFactory = require("./MultiModuleFactory");

module.exports = class MultiEntryPlugin {
	constructor(context, entries, name) {
		this.context = context;
		this.entries = entries;
		this.name = name;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const multiModuleFactory = new MultiModuleFactory();
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(MultiEntryDependency, multiModuleFactory);
			compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
		});
		compiler.plugin("make", (compilation, callback) => {
			const dep = MultiEntryPlugin.createDependency(this.entries, this.name);
			compilation.addEntry(this.context, dep, this.name, callback);
		});
	}

	static createDependency(entries, name) {
		return new MultiEntryDependency(entries.map((e, idx) => {
			const dep = new SingleEntryDependency(e);
			dep.loc = name + ":" + (100000 + idx);
			return dep;
		}), name);
	}
};

}, function(modId) { var map = {"./dependencies/MultiEntryDependency":1602510872195,"./dependencies/SingleEntryDependency":1602510872193,"./MultiModuleFactory":1602510872196}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872195, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = require("../Dependency");

class MultiEntryDependency extends Dependency {
	constructor(dependencies, name) {
		super();
		this.dependencies = dependencies;
		this.name = name;
	}

	get type() {
		return "multi entry";
	}
}

module.exports = MultiEntryDependency;

}, function(modId) { var map = {"../Dependency":1602510872145}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872196, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Tapable = require("tapable");
const MultiModule = require("./MultiModule");

module.exports = class MultiModuleFactory extends Tapable {
	constructor() {
		super();
	}

	create(data, callback) {
		const dependency = data.dependencies[0];
		callback(null, new MultiModule(data.context, dependency.dependencies, dependency.name));
	}
};

}, function(modId) { var map = {"./MultiModule":1602510872197}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872197, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Module = require("./Module");
const RawSource = require("webpack-sources").RawSource;

class MultiModule extends Module {

	constructor(context, dependencies, name) {
		super();
		this.context = context;
		this.dependencies = dependencies;
		this.name = name;
		this.built = false;
		this.cacheable = true;
	}

	identifier() {
		return `multi ${this.dependencies.map((d) => d.request).join(" ")}`;
	}

	readableIdentifier(requestShortener) {
		return `multi ${this.dependencies.map((d) => requestShortener.shorten(d.request)).join(" ")}`;
	}

	disconnect() {
		this.built = false;
		super.disconnect();
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		return callback();
	}

	needRebuild() {
		return false;
	}

	size() {
		return 16 + this.dependencies.length * 12;
	}

	updateHash(hash) {
		hash.update("multi module");
		hash.update(this.name || "");
		super.updateHash(hash);
	}

	source(dependencyTemplates, outputOptions) {
		const str = [];
		this.dependencies.forEach(function(dep, idx) {
			if(dep.module) {
				if(idx === this.dependencies.length - 1)
					str.push("module.exports = ");
				str.push("__webpack_require__(");
				if(outputOptions.pathinfo)
					str.push(`/*! ${dep.request} */`);
				str.push(`${JSON.stringify(dep.module.id)}`);
				str.push(")");
			} else {
				str.push("(function webpackMissingModule() { throw new Error(");
				str.push(JSON.stringify(`Cannot find module "${dep.request}"`));
				str.push("); }())");
			}
			str.push(";\n");
		}, this);
		return new RawSource(str.join(""));
	}
}

module.exports = MultiModule;

}, function(modId) { var map = {"./Module":1602510872132}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872198, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Naoyuki Kanezawa @nkzawa
*/


const MultiEntryDependency = require("./dependencies/MultiEntryDependency");
const SingleEntryDependency = require("./dependencies/SingleEntryDependency");
const MultiModuleFactory = require("./MultiModuleFactory");
const MultiEntryPlugin = require("./MultiEntryPlugin");
const SingleEntryPlugin = require("./SingleEntryPlugin");

class DynamicEntryPlugin {
	constructor(context, entry) {
		this.context = context;
		this.entry = entry;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const multiModuleFactory = new MultiModuleFactory();
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(MultiEntryDependency, multiModuleFactory);
			compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
		});

		compiler.plugin("make", (compilation, callback) => {
			const addEntry = (entry, name) => {
				const dep = DynamicEntryPlugin.createDependency(entry, name);
				return new Promise((resolve, reject) => {
					compilation.addEntry(this.context, dep, name, (err) => {
						if(err) return reject(err);
						resolve();
					});
				});
			};

			Promise.resolve(this.entry()).then((entry) => {
				if(typeof entry === "string" || Array.isArray(entry)) {
					addEntry(entry, "main").then(() => callback(), callback);
				} else if(typeof entry === "object") {
					Promise.all(Object.keys(entry).map((name) => {
						return addEntry(entry[name], name);
					})).then(() => callback(), callback);
				}
			});
		});
	}
}

module.exports = DynamicEntryPlugin;

DynamicEntryPlugin.createDependency = function(entry, name) {
	if(Array.isArray(entry))
		return MultiEntryPlugin.createDependency(entry, name);
	else
		return SingleEntryPlugin.createDependency(entry, name);
};

}, function(modId) { var map = {"./dependencies/MultiEntryDependency":1602510872195,"./dependencies/SingleEntryDependency":1602510872193,"./MultiModuleFactory":1602510872196,"./MultiEntryPlugin":1602510872194,"./SingleEntryPlugin":1602510872192}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872199, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const identifierUtils = require("./util/identifier");

class RecordIdsPlugin {

	apply(compiler) {
		compiler.plugin("compilation", compilation => {
			compilation.plugin("record-modules", (modules, records) => {
				if(!records.modules) records.modules = {};
				if(!records.modules.byIdentifier) records.modules.byIdentifier = {};
				if(!records.modules.usedIds) records.modules.usedIds = {};
				modules.forEach(function(module) {
					if(!module.portableId) module.portableId = identifierUtils.makePathsRelative(compiler.context, module.identifier());
					const identifier = module.portableId;
					records.modules.byIdentifier[identifier] = module.id;
					records.modules.usedIds[module.id] = module.id;
				});
			});
			compilation.plugin("revive-modules", (modules, records) => {
				if(!records.modules) return;
				if(records.modules.byIdentifier) {
					const usedIds = {};
					modules.forEach(function(module) {
						if(module.id !== null) return;
						if(!module.portableId) module.portableId = identifierUtils.makePathsRelative(compiler.context, module.identifier());
						const identifier = module.portableId;
						const id = records.modules.byIdentifier[identifier];
						if(id === undefined) return;
						if(usedIds[id]) return;
						usedIds[id] = true;
						module.id = id;
					});
				}
				compilation.usedModuleIds = records.modules.usedIds;
			});

			function getDepBlockIdent(chunk, block) {
				const ident = [];
				if(block.chunks.length > 1)
					ident.push(block.chunks.indexOf(chunk));
				while(block.parent) {
					const p = block.parent;
					const idx = p.blocks.indexOf(block);
					const l = p.blocks.length - 1;
					ident.push(`${idx}/${l}`);
					block = block.parent;
				}
				if(!block.identifier) return null;
				ident.push(identifierUtils.makePathsRelative(compiler.context, block.identifier()));
				return ident.reverse().join(":");
			}
			compilation.plugin("record-chunks", (chunks, records) => {
				records.nextFreeChunkId = compilation.nextFreeChunkId;
				if(!records.chunks) records.chunks = {};
				if(!records.chunks.byName) records.chunks.byName = {};
				if(!records.chunks.byBlocks) records.chunks.byBlocks = {};
				records.chunks.usedIds = {};
				chunks.forEach(chunk => {
					const name = chunk.name;
					const blockIdents = chunk.blocks.map(getDepBlockIdent.bind(null, chunk)).filter(Boolean);
					if(name) records.chunks.byName[name] = chunk.id;
					blockIdents.forEach((blockIdent) => {
						records.chunks.byBlocks[blockIdent] = chunk.id;
					});
					records.chunks.usedIds[chunk.id] = chunk.id;
				});
			});
			compilation.plugin("revive-chunks", (chunks, records) => {
				if(!records.chunks) return;
				const usedIds = {};
				if(records.chunks.byName) {
					chunks.forEach(function(chunk) {
						if(chunk.id !== null) return;
						if(!chunk.name) return;
						const id = records.chunks.byName[chunk.name];
						if(id === undefined) return;
						if(usedIds[id]) return;
						usedIds[id] = true;
						chunk.id = id;
					});
				}
				if(records.chunks.byBlocks) {
					const argumentedChunks = chunks.filter(chunk => chunk.id === null).map(chunk => ({
						chunk,
						blockIdents: chunk.blocks.map(getDepBlockIdent.bind(null, chunk)).filter(Boolean)
					})).filter(arg => arg.blockIdents.length > 0);
					let blockIdentsCount = {};
					argumentedChunks.forEach((arg, idx) => {
						arg.blockIdents.forEach(blockIdent => {
							const id = records.chunks.byBlocks[blockIdent];
							if(typeof id !== "number") return;
							const accessor = `${id}:${idx}`;
							blockIdentsCount[accessor] = (blockIdentsCount[accessor] || 0) + 1;
						});
					});
					blockIdentsCount = Object.keys(blockIdentsCount).map(accessor => [blockIdentsCount[accessor]].concat(accessor.split(":").map(Number))).sort((a, b) => b[0] - a[0]);
					blockIdentsCount.forEach(function(arg) {
						const id = arg[1];
						if(usedIds[id]) return;
						const idx = arg[2];
						const chunk = argumentedChunks[idx].chunk;
						if(chunk.id !== null) return;
						usedIds[id] = true;
						chunk.id = id;
					});
				}
				compilation.usedChunkIds = records.chunks.usedIds;
			});
		});
	}
}
module.exports = RecordIdsPlugin;

}, function(modId) { var map = {"./util/identifier":1602510872151}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872200, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConstDependency = require("./dependencies/ConstDependency");
const ParserHelpers = require("./ParserHelpers");

const NullFactory = require("./NullFactory");

const REPLACEMENTS = {
	__webpack_require__: "__webpack_require__", // eslint-disable-line camelcase
	__webpack_public_path__: "__webpack_require__.p", // eslint-disable-line camelcase
	__webpack_modules__: "__webpack_require__.m", // eslint-disable-line camelcase
	__webpack_chunk_load__: "__webpack_require__.e", // eslint-disable-line camelcase
	__non_webpack_require__: "require", // eslint-disable-line camelcase
	__webpack_nonce__: "__webpack_require__.nc", // eslint-disable-line camelcase
	"require.onError": "__webpack_require__.oe" // eslint-disable-line camelcase
};
const REPLACEMENT_TYPES = {
	__webpack_public_path__: "string", // eslint-disable-line camelcase
	__webpack_require__: "function", // eslint-disable-line camelcase
	__webpack_modules__: "object", // eslint-disable-line camelcase
	__webpack_chunk_load__: "function", // eslint-disable-line camelcase
	__webpack_nonce__: "string" // eslint-disable-line camelcase
};

class APIPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

			params.normalModuleFactory.plugin("parser", parser => {
				Object.keys(REPLACEMENTS).forEach(key => {
					parser.plugin(`expression ${key}`, ParserHelpers.toConstantDependency(REPLACEMENTS[key]));
					parser.plugin(`evaluate typeof ${key}`, ParserHelpers.evaluateToString(REPLACEMENT_TYPES[key]));
				});
			});
		});
	}
}

module.exports = APIPlugin;

}, function(modId) { var map = {"./dependencies/ConstDependency":1602510872201,"./ParserHelpers":1602510872203,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872201, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class ConstDependency extends NullDependency {
	constructor(expression, range) {
		super();
		this.expression = expression;
		this.range = range;
	}

	updateHash(hash) {
		hash.update(this.range + "");
		hash.update(this.expression + "");
	}
}

ConstDependency.Template = class ConstDependencyTemplate {
	apply(dep, source) {
		if(typeof dep.range === "number") {
			source.insert(dep.range, dep.expression);
			return;
		}

		source.replace(dep.range[0], dep.range[1] - 1, dep.expression);
	}
};

module.exports = ConstDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872202, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = require("../Dependency");

class NullDependency extends Dependency {
	get type() {
		return "null";
	}

	isEqualResource() {
		return false;
	}

	updateHash() {}
}

NullDependency.Template = class NullDependencyTemplate {
	apply() {}
};

module.exports = NullDependency;

}, function(modId) { var map = {"../Dependency":1602510872145}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872203, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const path = require("path");

const BasicEvaluatedExpression = require("./BasicEvaluatedExpression");
const ConstDependency = require("./dependencies/ConstDependency");
const UnsupportedFeatureWarning = require("./UnsupportedFeatureWarning");

const ParserHelpers = exports;

ParserHelpers.addParsedVariableToModule = function(parser, name, expression) {
	if(!parser.state.current.addVariable) return false;
	var deps = [];
	parser.parse(expression, {
		current: {
			addDependency: function(dep) {
				dep.userRequest = name;
				deps.push(dep);
			}
		},
		module: parser.state.module
	});
	parser.state.current.addVariable(name, expression, deps);
	return true;
};

ParserHelpers.requireFileAsExpression = function(context, pathToModule) {
	var moduleJsPath = path.relative(context, pathToModule);
	if(!/^[A-Z]:/i.test(moduleJsPath)) {
		moduleJsPath = "./" + moduleJsPath.replace(/\\/g, "/");
	}
	return "require(" + JSON.stringify(moduleJsPath) + ")";
};

ParserHelpers.toConstantDependency = function(value) {
	return function constDependency(expr) {
		var dep = new ConstDependency(value, expr.range);
		dep.loc = expr.loc;
		this.state.current.addDependency(dep);
		return true;
	};
};

ParserHelpers.evaluateToString = function(value) {
	return function stringExpression(expr) {
		return new BasicEvaluatedExpression().setString(value).setRange(expr.range);
	};
};

ParserHelpers.evaluateToBoolean = function(value) {
	return function booleanExpression(expr) {
		return new BasicEvaluatedExpression().setBoolean(value).setRange(expr.range);
	};
};

ParserHelpers.evaluateToIdentifier = function(identifier, truthy) {
	return function identifierExpression(expr) {
		let evex = new BasicEvaluatedExpression().setIdentifier(identifier).setRange(expr.range);
		if(truthy === true) evex = evex.setTruthy();
		else if(truthy === false) evex = evex.setFalsy();
		return evex;
	};
};

ParserHelpers.expressionIsUnsupported = function(message) {
	return function unsupportedExpression(expr) {
		var dep = new ConstDependency("(void 0)", expr.range);
		dep.loc = expr.loc;
		this.state.current.addDependency(dep);
		if(!this.state.module) return;
		this.state.module.warnings.push(new UnsupportedFeatureWarning(this.state.module, message));
		return true;
	};
};

ParserHelpers.skipTraversal = function skipTraversal() {
	return true;
};

ParserHelpers.approve = function approve() {
	return true;
};

}, function(modId) { var map = {"./BasicEvaluatedExpression":1602510872165,"./dependencies/ConstDependency":1602510872201,"./UnsupportedFeatureWarning":1602510872204}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872204, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");

class UnsupportedFeatureWarning extends WebpackError {
	constructor(module, message) {
		super();

		this.name = "UnsupportedFeatureWarning";
		this.message = message;
		this.origin = this.module = module;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = UnsupportedFeatureWarning;

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872205, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class NullFactory {
	create(data, callback) {
		return callback();
	}
}
module.exports = NullFactory;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872206, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ConstDependency = require("./dependencies/ConstDependency");
const NullFactory = require("./NullFactory");
const ParserHelpers = require("./ParserHelpers");

const getQuery = (request) => {
	const i = request.indexOf("?");
	return request.indexOf("?") < 0 ? "" : request.substr(i);
};

class ConstPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

			params.normalModuleFactory.plugin("parser", parser => {
				parser.plugin("statement if", function(statement) {
					const param = this.evaluateExpression(statement.test);
					const bool = param.asBool();
					if(typeof bool === "boolean") {
						if(statement.test.type !== "Literal") {
							const dep = new ConstDependency(`${bool}`, param.range);
							dep.loc = statement.loc;
							this.state.current.addDependency(dep);
						}
						return bool;
					}
				});
				parser.plugin("expression ?:", function(expression) {
					const param = this.evaluateExpression(expression.test);
					const bool = param.asBool();
					if(typeof bool === "boolean") {
						if(expression.test.type !== "Literal") {
							const dep = new ConstDependency(` ${bool}`, param.range);
							dep.loc = expression.loc;
							this.state.current.addDependency(dep);
						}
						return bool;
					}
				});
				parser.plugin("evaluate Identifier __resourceQuery", function(expr) {
					if(!this.state.module) return;
					return ParserHelpers.evaluateToString(getQuery(this.state.module.resource))(expr);
				});
				parser.plugin("expression __resourceQuery", function() {
					if(!this.state.module) return;
					this.state.current.addVariable("__resourceQuery", JSON.stringify(getQuery(this.state.module.resource)));
					return true;
				});
			});
		});
	}
}

module.exports = ConstPlugin;

}, function(modId) { var map = {"./dependencies/ConstDependency":1602510872201,"./NullFactory":1602510872205,"./ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872207, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ParserHelpers = require("./ParserHelpers");
const ConstDependency = require("./dependencies/ConstDependency");
const NullFactory = require("./NullFactory");

module.exports = class RequireJsStuffPlugin {

	apply(compiler) {
		compiler.plugin("compilation", function(compilation, params) {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
			params.normalModuleFactory.plugin("parser", function(parser, parserOptions) {

				if(typeof parserOptions.requireJs !== "undefined" && !parserOptions.requireJs)
					return;

				parser.plugin("call require.config", ParserHelpers.toConstantDependency("undefined"));
				parser.plugin("call requirejs.config", ParserHelpers.toConstantDependency("undefined"));

				parser.plugin("expression require.version", ParserHelpers.toConstantDependency(JSON.stringify("0.0.0")));
				parser.plugin("expression requirejs.onError", ParserHelpers.toConstantDependency("__webpack_require__.oe"));
			});
		});
	}

};

}, function(modId) { var map = {"./ParserHelpers":1602510872203,"./dependencies/ConstDependency":1602510872201,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872208, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const ParserHelpers = require("./ParserHelpers");
const ConstDependency = require("./dependencies/ConstDependency");

const NullFactory = require("./NullFactory");

class NodeStuffPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(parserOptions.node === false)
					return;

				let localOptions = options;
				if(parserOptions.node)
					localOptions = Object.assign({}, localOptions, parserOptions.node);

				function setConstant(expressionName, value) {
					parser.plugin(`expression ${expressionName}`, function() {
						this.state.current.addVariable(expressionName, JSON.stringify(value));
						return true;
					});
				}

				function setModuleConstant(expressionName, fn) {
					parser.plugin(`expression ${expressionName}`, function() {
						this.state.current.addVariable(expressionName, JSON.stringify(fn(this.state.module)));
						return true;
					});
				}
				const context = compiler.context;
				if(localOptions.__filename === "mock") {
					setConstant("__filename", "/index.js");
				} else if(localOptions.__filename) {
					setModuleConstant("__filename", module => path.relative(context, module.resource));
				}
				parser.plugin("evaluate Identifier __filename", function(expr) {
					if(!this.state.module) return;
					const resource = this.state.module.resource;
					const i = resource.indexOf("?");
					return ParserHelpers.evaluateToString(i < 0 ? resource : resource.substr(0, i))(expr);
				});
				if(localOptions.__dirname === "mock") {
					setConstant("__dirname", "/");
				} else if(localOptions.__dirname) {
					setModuleConstant("__dirname", module => path.relative(context, module.context));
				}
				parser.plugin("evaluate Identifier __dirname", function(expr) {
					if(!this.state.module) return;
					return ParserHelpers.evaluateToString(this.state.module.context)(expr);
				});
				parser.plugin("expression require.main", ParserHelpers.toConstantDependency("__webpack_require__.c[__webpack_require__.s]"));
				parser.plugin(
					"expression require.extensions",
					ParserHelpers.expressionIsUnsupported("require.extensions is not supported by webpack. Use a loader instead.")
				);
				parser.plugin("expression module.loaded", ParserHelpers.toConstantDependency("module.l"));
				parser.plugin("expression module.id", ParserHelpers.toConstantDependency("module.i"));
				parser.plugin("expression module.exports", function() {
					const module = this.state.module;
					const isHarmony = module.meta && module.meta.harmonyModule;
					if(!isHarmony)
						return true;
				});
				parser.plugin("evaluate Identifier module.hot", ParserHelpers.evaluateToIdentifier("module.hot", false));
				parser.plugin("expression module", function() {
					const module = this.state.module;
					const isHarmony = module.meta && module.meta.harmonyModule;
					let moduleJsPath = path.join(__dirname, "..", "buildin", isHarmony ? "harmony-module.js" : "module.js");
					if(module.context) {
						moduleJsPath = path.relative(this.state.module.context, moduleJsPath);
						if(!/^[A-Z]:/i.test(moduleJsPath)) {
							moduleJsPath = `./${moduleJsPath.replace(/\\/g, "/")}`;
						}
					}
					return ParserHelpers.addParsedVariableToModule(this, "module", `require(${JSON.stringify(moduleJsPath)})(module)`);
				});
			});
		});
	}
}
module.exports = NodeStuffPlugin;

}, function(modId) { var map = {"./ParserHelpers":1602510872203,"./dependencies/ConstDependency":1602510872201,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872209, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConstDependency = require("./dependencies/ConstDependency");

const NullFactory = require("./NullFactory");

const jsonLoaderPath = require.resolve("json-loader");
const matchJson = /\.json$/i;

class CompatibilityPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.browserify !== "undefined" && !parserOptions.browserify)
					return;

				parser.plugin("call require", (expr) => {
					// support for browserify style require delegator: "require(o, !0)"
					if(expr.arguments.length !== 2) return;
					const second = parser.evaluateExpression(expr.arguments[1]);
					if(!second.isBoolean()) return;
					if(second.asBool() !== true) return;
					const dep = new ConstDependency("require", expr.callee.range);
					dep.loc = expr.loc;
					if(parser.state.current.dependencies.length > 1) {
						const last = parser.state.current.dependencies[parser.state.current.dependencies.length - 1];
						if(last.critical && last.request === "." && last.userRequest === "." && last.recursive)
							parser.state.current.dependencies.pop();
					}
					parser.state.current.addDependency(dep);
					return true;
				});
			});

			params.normalModuleFactory.plugin("after-resolve", (data, done) => {
				// if this is a json file and there are no loaders active, we use the json-loader in order to avoid parse errors
				// @see https://github.com/webpack/webpack/issues/3363
				if(matchJson.test(data.request) && data.loaders.length === 0) {
					data.loaders.push({
						loader: jsonLoaderPath
					});
				}
				done(null, data);
			});
		});
	}
}
module.exports = CompatibilityPlugin;

}, function(modId) { var map = {"./dependencies/ConstDependency":1602510872201,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872210, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Jason Anderson @diurnalist
*/


const REGEXP_HASH = /\[hash(?::(\d+))?\]/gi,
	REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/gi,
	REGEXP_NAME = /\[name\]/gi,
	REGEXP_ID = /\[id\]/gi,
	REGEXP_FILE = /\[file\]/gi,
	REGEXP_QUERY = /\[query\]/gi,
	REGEXP_FILEBASE = /\[filebase\]/gi;

// Using global RegExp for .test is dangerous
// We use a normal RegExp instead of .test
const REGEXP_HASH_FOR_TEST = new RegExp(REGEXP_HASH.source, "i"),
	REGEXP_CHUNKHASH_FOR_TEST = new RegExp(REGEXP_CHUNKHASH.source, "i"),
	REGEXP_NAME_FOR_TEST = new RegExp(REGEXP_NAME.source, "i");

// TODO: remove in webpack 3
// Backwards compatibility; expose regexes on Template object
const Template = require("./Template");
Template.REGEXP_HASH = REGEXP_HASH;
Template.REGEXP_CHUNKHASH = REGEXP_CHUNKHASH;
Template.REGEXP_NAME = REGEXP_NAME;
Template.REGEXP_ID = REGEXP_ID;
Template.REGEXP_FILE = REGEXP_FILE;
Template.REGEXP_QUERY = REGEXP_QUERY;
Template.REGEXP_FILEBASE = REGEXP_FILEBASE;

const withHashLength = (replacer, handlerFn) => {
	return function(_, hashLength) {
		const length = hashLength && parseInt(hashLength, 10);
		if(length && handlerFn) {
			return handlerFn(length);
		}
		const hash = replacer.apply(this, arguments);
		return length ? hash.slice(0, length) : hash;
	};
};

const getReplacer = (value, allowEmpty) => {
	return function(match) {
		// last argument in replacer is the entire input string
		const input = arguments[arguments.length - 1];
		if(value === null || value === undefined) {
			if(!allowEmpty) throw new Error(`Path variable ${match} not implemented in this context: ${input}`);
			return "";
		} else {
			return `${value}`;
		}
	};
};

const replacePathVariables = (path, data) => {
	const chunk = data.chunk;
	const chunkId = chunk && chunk.id;
	const chunkName = chunk && (chunk.name || chunk.id);
	const chunkHash = chunk && (chunk.renderedHash || chunk.hash);
	const chunkHashWithLength = chunk && chunk.hashWithLength;

	if(typeof path === "function") {
		path = path(data);
	}

	if(data.noChunkHash && REGEXP_CHUNKHASH_FOR_TEST.test(path)) {
		throw new Error(`Cannot use [chunkhash] for chunk in '${path}' (use [hash] instead)`);
	}

	return path
		.replace(REGEXP_HASH, withHashLength(getReplacer(data.hash), data.hashWithLength))
		.replace(REGEXP_CHUNKHASH, withHashLength(getReplacer(chunkHash), chunkHashWithLength))
		.replace(REGEXP_ID, getReplacer(chunkId))
		.replace(REGEXP_NAME, getReplacer(chunkName))
		.replace(REGEXP_FILE, getReplacer(data.filename))
		.replace(REGEXP_FILEBASE, getReplacer(data.basename))
		// query is optional, it's OK if it's in a path but there's nothing to replace it with
		.replace(REGEXP_QUERY, getReplacer(data.query, true));
};

class TemplatedPathPlugin {
	apply(compiler) {
		compiler.plugin("compilation", compilation => {
			const mainTemplate = compilation.mainTemplate;

			mainTemplate.plugin("asset-path", replacePathVariables);

			mainTemplate.plugin("global-hash", function(chunk, paths) {
				const outputOptions = this.outputOptions;
				const publicPath = outputOptions.publicPath || "";
				const filename = outputOptions.filename || "";
				const chunkFilename = outputOptions.chunkFilename || outputOptions.filename;
				if(REGEXP_HASH_FOR_TEST.test(publicPath) || REGEXP_CHUNKHASH_FOR_TEST.test(publicPath) || REGEXP_NAME_FOR_TEST.test(publicPath))
					return true;
				if(REGEXP_HASH_FOR_TEST.test(filename))
					return true;
				if(REGEXP_HASH_FOR_TEST.test(chunkFilename))
					return true;
				if(REGEXP_HASH_FOR_TEST.test(paths.join("|")))
					return true;
			});

			mainTemplate.plugin("hash-for-chunk", function(hash, chunk) {
				const outputOptions = this.outputOptions;
				const chunkFilename = outputOptions.chunkFilename || outputOptions.filename;
				if(REGEXP_CHUNKHASH_FOR_TEST.test(chunkFilename))
					hash.update(JSON.stringify(chunk.getChunkMaps(false, true).hash));
				if(REGEXP_NAME_FOR_TEST.test(chunkFilename))
					hash.update(JSON.stringify(chunk.getChunkMaps(false, true).name));
			});
		});
	}
}

module.exports = TemplatedPathPlugin;

}, function(modId) { var map = {"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872211, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const CaseSensitiveModulesWarning = require("./CaseSensitiveModulesWarning");

class WarnCaseSensitiveModulesPlugin {
	apply(compiler) {
		compiler.plugin("compilation", compilation => {
			compilation.plugin("seal", () => {
				const moduleWithoutCase = Object.create(null);
				compilation.modules.forEach(module => {
					const identifier = module.identifier().toLowerCase();
					if(moduleWithoutCase[identifier]) {
						moduleWithoutCase[identifier].push(module);
					} else {
						moduleWithoutCase[identifier] = [module];
					}
				});
				Object.keys(moduleWithoutCase).forEach(key => {
					if(moduleWithoutCase[key].length > 1)
						compilation.warnings.push(new CaseSensitiveModulesWarning(moduleWithoutCase[key]));
				});
			});
		});
	}
}

module.exports = WarnCaseSensitiveModulesPlugin;

}, function(modId) { var map = {"./CaseSensitiveModulesWarning":1602510872212}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872212, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("./WebpackError");

module.exports = class CaseSensitiveModulesWarning extends WebpackError {
	constructor(modules) {
		super();

		this.name = "CaseSensitiveModulesWarning";
		const sortedModules = this._sort(modules);
		const modulesList = this._moduleMessages(sortedModules);
		this.message = "There are multiple modules with names that only differ in casing.\n" +
			"This can lead to unexpected behavior when compiling on a filesystem with other case-semantic.\n" +
			`Use equal casing. Compare these module identifiers:\n${modulesList}`;
		this.origin = this.module = sortedModules[0];

		Error.captureStackTrace(this, this.constructor);
	}

	_sort(modules) {
		return modules.slice().sort((a, b) => {
			a = a.identifier();
			b = b.identifier();
			/* istanbul ignore next */
			if(a < b) return -1;
			/* istanbul ignore next */
			if(a > b) return 1;
			/* istanbul ignore next */
			return 0;
		});
	}

	_moduleMessages(modules) {
		return modules.map((m) => {
			let message = `* ${m.identifier()}`;
			const validReasons = m.reasons.filter((reason) => reason.module);

			if(validReasons.length > 0) {
				message += `\n    Used by ${validReasons.length} module(s), i. e.`;
				message += `\n    ${validReasons[0].module.identifier()}`;
			}
			return message;
		}).join("\n");
	}
};

}, function(modId) { var map = {"./WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872213, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConstDependency = require("./dependencies/ConstDependency");

class UseStrictPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			params.normalModuleFactory.plugin("parser", (parser) => {
				const parserInstance = parser;
				parser.plugin("program", (ast) => {
					const firstNode = ast.body[0];
					if(firstNode &&
						firstNode.type === "ExpressionStatement" &&
						firstNode.expression.type === "Literal" &&
						firstNode.expression.value === "use strict") {
						// Remove "use strict" expression. It will be added later by the renderer again.
						// This is necessary in order to not break the strict mode when webpack prepends code.
						// @see https://github.com/webpack/webpack/issues/1970
						const dep = new ConstDependency("", firstNode.range);
						dep.loc = firstNode.loc;
						parserInstance.state.current.addDependency(dep);
						parserInstance.state.module.strict = true;
					}
				});
			});
		});
	}
}

module.exports = UseStrictPlugin;

}, function(modId) { var map = {"./dependencies/ConstDependency":1602510872201}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872214, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const LoaderDependency = require("./LoaderDependency");

class LoaderPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(LoaderDependency, normalModuleFactory);
		});
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("normal-module-loader", (loaderContext, module) => {
				loaderContext.loadModule = function loadModule(request, callback) {
					const dep = new LoaderDependency(request);
					dep.loc = request;
					compilation.addModuleDependencies(module, [
						[dep]
					], true, "lm", false, (err) => {
						if(err) return callback(err);

						if(!dep.module) return callback(new Error("Cannot load the module"));
						if(dep.module.building) dep.module.building.push(next);
						else next();

						function next(err) {
							if(err) return callback(err);

							if(dep.module.error) return callback(dep.module.error);
							if(!dep.module._source) throw new Error("The module created for a LoaderDependency must have a property _source");
							let source, map;
							const moduleSource = dep.module._source;
							if(moduleSource.sourceAndMap) {
								const sourceAndMap = moduleSource.sourceAndMap();
								map = sourceAndMap.map;
								source = sourceAndMap.source;
							} else {
								map = moduleSource.map();
								source = moduleSource.source();
							}
							if(dep.module.fileDependencies) {
								dep.module.fileDependencies.forEach((dep) => loaderContext.addDependency(dep));
							}
							if(dep.module.contextDependencies) {
								dep.module.contextDependencies.forEach((dep) => loaderContext.addContextDependency(dep));
							}
							return callback(null, source, map, dep.module);
						}
					});
				};
			});
		});
	}
}
module.exports = LoaderPlugin;

}, function(modId) { var map = {"./LoaderDependency":1602510872215}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872215, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class LoaderDependency extends ModuleDependency {
	constructor(request) {
		super(request);
	}

	get type() {
		return "loader";
	}
}

module.exports = LoaderDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872216, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ConstDependency = require("./ConstDependency");
const CommonJsRequireDependency = require("./CommonJsRequireDependency");
const CommonJsRequireContextDependency = require("./CommonJsRequireContextDependency");
const RequireResolveDependency = require("./RequireResolveDependency");
const RequireResolveContextDependency = require("./RequireResolveContextDependency");
const RequireResolveHeaderDependency = require("./RequireResolveHeaderDependency");
const RequireHeaderDependency = require("./RequireHeaderDependency");

const NullFactory = require("../NullFactory");

const RequireResolveDependencyParserPlugin = require("./RequireResolveDependencyParserPlugin");
const CommonJsRequireDependencyParserPlugin = require("./CommonJsRequireDependencyParserPlugin");

const ParserHelpers = require("../ParserHelpers");

class CommonJsPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;
			const contextModuleFactory = params.contextModuleFactory;

			compilation.dependencyFactories.set(CommonJsRequireDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(CommonJsRequireDependency, new CommonJsRequireDependency.Template());

			compilation.dependencyFactories.set(CommonJsRequireContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(CommonJsRequireContextDependency, new CommonJsRequireContextDependency.Template());

			compilation.dependencyFactories.set(RequireResolveDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(RequireResolveDependency, new RequireResolveDependency.Template());

			compilation.dependencyFactories.set(RequireResolveContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(RequireResolveContextDependency, new RequireResolveContextDependency.Template());

			compilation.dependencyFactories.set(RequireResolveHeaderDependency, new NullFactory());
			compilation.dependencyTemplates.set(RequireResolveHeaderDependency, new RequireResolveHeaderDependency.Template());

			compilation.dependencyFactories.set(RequireHeaderDependency, new NullFactory());
			compilation.dependencyTemplates.set(RequireHeaderDependency, new RequireHeaderDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.commonjs !== "undefined" && !parserOptions.commonjs)
					return;

				const requireExpressions = ["require", "require.resolve", "require.resolveWeak"];
				for(let expression of requireExpressions) {
					parser.plugin(`typeof ${expression}`, ParserHelpers.toConstantDependency(JSON.stringify("function")));
					parser.plugin(`evaluate typeof ${expression}`, ParserHelpers.evaluateToString("function"));
					parser.plugin(`evaluate Identifier ${expression}`, ParserHelpers.evaluateToIdentifier(expression, true));
				}

				parser.plugin("evaluate typeof module", ParserHelpers.evaluateToString("object"));
				parser.plugin("assign require", (expr) => {
					// to not leak to global "require", we need to define a local require here.
					const dep = new ConstDependency("var require;", 0);
					dep.loc = expr.loc;
					parser.state.current.addDependency(dep);
					parser.scope.definitions.push("require");
					return true;
				});
				parser.plugin("can-rename require", () => true);
				parser.plugin("rename require", (expr) => {
					// define the require variable. It's still undefined, but not "not defined".
					const dep = new ConstDependency("var require;", 0);
					dep.loc = expr.loc;
					parser.state.current.addDependency(dep);
					return false;
				});
				parser.plugin("typeof module", () => true);
				parser.plugin("evaluate typeof exports", ParserHelpers.evaluateToString("object"));
				parser.apply(
					new CommonJsRequireDependencyParserPlugin(options),
					new RequireResolveDependencyParserPlugin(options)
				);
			});
		});
	}
}
module.exports = CommonJsPlugin;

}, function(modId) { var map = {"./ConstDependency":1602510872201,"./CommonJsRequireDependency":1602510872217,"./CommonJsRequireContextDependency":1602510872220,"./RequireResolveDependency":1602510872224,"./RequireResolveContextDependency":1602510872225,"./RequireResolveHeaderDependency":1602510872227,"./RequireHeaderDependency":1602510872228,"../NullFactory":1602510872205,"./RequireResolveDependencyParserPlugin":1602510872229,"./CommonJsRequireDependencyParserPlugin":1602510872231,"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872217, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyTemplateAsId = require("./ModuleDependencyTemplateAsId");

class CommonJsRequireDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
	}

	get type() {
		return "cjs require";
	}
}

CommonJsRequireDependency.Template = ModuleDependencyTemplateAsId;

module.exports = CommonJsRequireDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./ModuleDependencyTemplateAsId":1602510872218}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872218, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class ModuleDependencyTemplateAsId {

	apply(dep, source, outputOptions, requestShortener) {
		if(!dep.range) return;
		const comment = outputOptions.pathinfo ?
			`/*! ${requestShortener.shorten(dep.request)} */ ` : "";
		let content;
		if(dep.module)
			content = comment + JSON.stringify(dep.module.id);
		else
			content = require("./WebpackMissingModule").module(dep.request);
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}
}
module.exports = ModuleDependencyTemplateAsId;

}, function(modId) { var map = {"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872219, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const toErrorCode = err => `var e = new Error(${JSON.stringify(err)}); e.code = 'MODULE_NOT_FOUND';`;

exports.module = request => `!(function webpackMissingModule() { ${exports.moduleCode(request)} }())`;

exports.promise = (request) => {
	const errorCode = toErrorCode(`Cannot find module "${request}"`);
	return `Promise.reject(function webpackMissingModule() { ${errorCode}; return e; }())`;
};

exports.moduleCode = (request) => {
	const errorCode = toErrorCode(`Cannot find module "${request}"`);
	return `${errorCode} throw e;`;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872220, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ContextDependency = require("./ContextDependency");
const ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");

class CommonJsRequireContextDependency extends ContextDependency {
	constructor(request, recursive, regExp, range, valueRange) {
		super(request, recursive, regExp);
		this.range = range;
		this.valueRange = valueRange;
	}

	get type() {
		return "cjs require context";
	}

}

CommonJsRequireContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = CommonJsRequireContextDependency;

}, function(modId) { var map = {"./ContextDependency":1602510872221,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872221, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = require("../Dependency");
const CriticalDependencyWarning = require("./CriticalDependencyWarning");

class ContextDependency extends Dependency {
	constructor(request, recursive, regExp) {
		super();
		this.request = request;
		this.userRequest = request;
		this.recursive = recursive;
		this.regExp = regExp;
		this.async = false;

		this.hadGlobalOrStickyRegExp = false;
		if(this.regExp.global || this.regExp.sticky) {
			this.regExp = null;
			this.hadGlobalOrStickyRegExp = true;
		}

	}

	isEqualResource(other) {
		if(!(other instanceof ContextDependency))
			return false;

		return this.request === other.request &&
			this.recursive === other.recursive &&
			this.regExp === other.regExp &&
			this.async === other.async;
	}

	getWarnings() {
		let warnings = super.getWarnings() || [];
		if(this.critical) {
			warnings.push(new CriticalDependencyWarning(this.critical));
		}
		if(this.hadGlobalOrStickyRegExp) {
			warnings.push(new CriticalDependencyWarning("Contexts can't use RegExps with the 'g' or 'y' flags."));
		}
		return warnings;
	}

}

module.exports = ContextDependency;

}, function(modId) { var map = {"../Dependency":1602510872145,"./CriticalDependencyWarning":1602510872222}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872222, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebpackError = require("../WebpackError");

class CriticalDependencyWarning extends WebpackError {
	constructor(message) {
		super();

		this.name = "CriticalDependencyWarning";
		this.message = "Critical dependency: " + message;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = CriticalDependencyWarning;

}, function(modId) { var map = {"../WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872223, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class ContextDependencyTemplateAsRequireCall {

	apply(dep, source, outputOptions, requestShortener) {
		const comment = outputOptions.pathinfo ?
			"/*! " + requestShortener.shorten(dep.request) + " */ " : "";

		const containsDeps = dep.module && dep.module.dependencies && dep.module.dependencies.length > 0;
		const isAsync = dep.module && dep.module.async;
		if(dep.module && (isAsync || containsDeps)) {
			if(dep.valueRange) {
				if(Array.isArray(dep.replaces)) {
					for(let i = 0; i < dep.replaces.length; i++) {
						const rep = dep.replaces[i];
						source.replace(rep.range[0], rep.range[1] - 1, rep.value);
					}
				}
				source.replace(dep.valueRange[1], dep.range[1] - 1, ")");
				source.replace(dep.range[0], dep.valueRange[0] - 1, "__webpack_require__(" + comment + JSON.stringify(dep.module.id) + ")(" + (typeof dep.prepend === "string" ? JSON.stringify(dep.prepend) : "") + "");
			} else {
				source.replace(dep.range[0], dep.range[1] - 1, "__webpack_require__(" + comment + JSON.stringify(dep.module.id) + ")");
			}
		} else {
			const content = require("./WebpackMissingModule").module(dep.request);
			source.replace(dep.range[0], dep.range[1] - 1, content);
		}
	}
}
module.exports = ContextDependencyTemplateAsRequireCall;

}, function(modId) { var map = {"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872224, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyAsId = require("./ModuleDependencyTemplateAsId");

class RequireResolveDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
	}

	get type() {
		return "require.resolve";
	}
}

RequireResolveDependency.Template = ModuleDependencyAsId;

module.exports = RequireResolveDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./ModuleDependencyTemplateAsId":1602510872218}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872225, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ContextDependency = require("./ContextDependency");
const ContextDependencyTemplateAsId = require("./ContextDependencyTemplateAsId");

class RequireResolveContextDependency extends ContextDependency {
	constructor(request, recursive, regExp, range, valueRange) {
		super(request, recursive, regExp);
		this.range = range;
		this.valueRange = valueRange;
	}

	get type() {
		return "amd require context";
	}

}

RequireResolveContextDependency.Template = ContextDependencyTemplateAsId;

module.exports = RequireResolveContextDependency;

}, function(modId) { var map = {"./ContextDependency":1602510872221,"./ContextDependencyTemplateAsId":1602510872226}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872226, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class ContextDependencyTemplateAsId {

	apply(dep, source, outputOptions, requestShortener) {
		const comment = outputOptions.pathinfo ?
			"/*! " + requestShortener.shorten(dep.request) + " */ " : "";

		if(dep.module && dep.module.dependencies && dep.module.dependencies.length > 0) {
			if(dep.valueRange) {
				if(Array.isArray(dep.replaces)) {
					for(let i = 0; i < dep.replaces.length; i++) {
						const rep = dep.replaces[i];
						source.replace(rep.range[0], rep.range[1] - 1, rep.value);
					}
				}
				source.replace(dep.valueRange[1], dep.range[1] - 1, ")");
				source.replace(dep.range[0], dep.valueRange[0] - 1, "__webpack_require__(" + comment + JSON.stringify(dep.module.id) + ").resolve(" + (typeof dep.prepend === "string" ? JSON.stringify(dep.prepend) : "") + "");
			} else {
				source.replace(dep.range[0], dep.range[1] - 1, "__webpack_require__(" + comment + JSON.stringify(dep.module.id) + ").resolve");
			}
		} else {
			const content = require("./WebpackMissingModule").module(dep.request);
			source.replace(dep.range[0], dep.range[1] - 1, content);
		}
	}
}
module.exports = ContextDependencyTemplateAsId;

}, function(modId) { var map = {"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872227, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class RequireResolveHeaderDependency extends NullDependency {
	constructor(range) {
		super();
		if(!Array.isArray(range)) throw new Error("range must be valid");
		this.range = range;
	}
}

RequireResolveHeaderDependency.Template = class RequireResolveHeaderDependencyTemplate {
	apply(dep, source) {
		source.replace(dep.range[0], dep.range[1] - 1, "/*require.resolve*/");
	}

	applyAsTemplateArgument(name, dep, source) {
		source.replace(dep.range[0], dep.range[1] - 1, "/*require.resolve*/");
	}
};

module.exports = RequireResolveHeaderDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872228, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class RequireHeaderDependency extends NullDependency {
	constructor(range) {
		super();
		if(!Array.isArray(range)) throw new Error("range must be valid");
		this.range = range;
	}
}

RequireHeaderDependency.Template = class RequireHeaderDependencyTemplate {
	apply(dep, source) {
		source.replace(dep.range[0], dep.range[1] - 1, "__webpack_require__");
	}

	applyAsTemplateArgument(name, dep, source) {
		source.replace(dep.range[0], dep.range[1] - 1, "require");
	}
};

module.exports = RequireHeaderDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872229, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireResolveDependency = require("./RequireResolveDependency");
const RequireResolveContextDependency = require("./RequireResolveContextDependency");
const RequireResolveHeaderDependency = require("./RequireResolveHeaderDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");

class RequireResolveDependencyParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		const options = this.options;
		parser.plugin("call require.resolve", (expr) => {
			return parser.applyPluginsBailResult("call require.resolve(Weak)", expr, false);
		});
		parser.plugin("call require.resolveWeak", (expr) => {
			return parser.applyPluginsBailResult("call require.resolve(Weak)", expr, true);
		});
		parser.plugin("call require.resolve(Weak)", (expr, weak) => {
			if(expr.arguments.length !== 1) return;
			const param = parser.evaluateExpression(expr.arguments[0]);
			if(param.isConditional()) {
				param.options.forEach((option) => {
					const result = parser.applyPluginsBailResult("call require.resolve(Weak):item", expr, option, weak);
					if(result === undefined) {
						parser.applyPluginsBailResult("call require.resolve(Weak):context", expr, option, weak);
					}
				});
				const dep = new RequireResolveHeaderDependency(expr.callee.range);
				dep.loc = expr.loc;
				parser.state.current.addDependency(dep);
				return true;
			} else {
				const result = parser.applyPluginsBailResult("call require.resolve(Weak):item", expr, param, weak);
				if(result === undefined) {
					parser.applyPluginsBailResult("call require.resolve(Weak):context", expr, param, weak);
				}
				const dep = new RequireResolveHeaderDependency(expr.callee.range);
				dep.loc = expr.loc;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call require.resolve(Weak):item", (expr, param, weak) => {
			if(param.isString()) {
				const dep = new RequireResolveDependency(param.string, param.range);
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				dep.weak = weak;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call require.resolve(Weak):context", (expr, param, weak) => {
			const dep = ContextDependencyHelpers.create(RequireResolveContextDependency, param.range, param, expr, options);
			if(!dep) return;
			dep.loc = expr.loc;
			dep.optional = !!parser.scope.inTry;
			dep.async = weak ? "weak" : false;
			parser.state.current.addDependency(dep);
			return true;
		});
	}
}
module.exports = RequireResolveDependencyParserPlugin;

}, function(modId) { var map = {"./RequireResolveDependency":1602510872224,"./RequireResolveContextDependency":1602510872225,"./RequireResolveHeaderDependency":1602510872227,"./ContextDependencyHelpers":1602510872230}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872230, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ContextDependencyHelpers = exports;

/**
 * Escapes regular expression metacharacters
 * @param {string} str String to quote
 * @return {string} Escaped string
 */
function quotemeta(str) {
	return str.replace(/[-[\]\\/{}()*+?.^$|]/g, "\\$&");
}

ContextDependencyHelpers.create = function(Dep, range, param, expr, options, chunkName) {
	let dep;
	let prefix;
	let postfix;
	let prefixRange;
	let valueRange;
	let idx;
	let context;
	let regExp;
	if(param.isTemplateString()) {
		prefix = param.quasis[0].string;
		postfix = param.quasis.length > 1 ? param.quasis[param.quasis.length - 1].string : "";
		prefixRange = [param.quasis[0].range[0], param.quasis[0].range[1]];
		valueRange = param.range;
		idx = prefix.lastIndexOf("/");
		context = ".";
		if(idx >= 0) {
			context = prefix.substr(0, idx);
			prefix = `.${prefix.substr(idx)}`;
		}
		// If there are more than two quasis, maybe the generated RegExp can be more precise?
		regExp = new RegExp(`^${quotemeta(prefix)}${options.wrappedContextRegExp.source}${quotemeta(postfix)}$`);
		dep = new Dep(context, options.wrappedContextRecursive, regExp, range, valueRange, chunkName);
		dep.loc = expr.loc;
		dep.replaces = [{
			range: prefixRange,
			value: prefix
		}];
		dep.critical = options.wrappedContextCritical && "a part of the request of a dependency is an expression";
		return dep;
	} else if(param.isWrapped() && (param.prefix && param.prefix.isString() || param.postfix && param.postfix.isString())) {
		prefix = param.prefix && param.prefix.isString() ? param.prefix.string : "";
		postfix = param.postfix && param.postfix.isString() ? param.postfix.string : "";
		prefixRange = param.prefix && param.prefix.isString() ? param.prefix.range : null;
		valueRange = [prefixRange ? prefixRange[1] : param.range[0], param.range[1]];
		idx = prefix.lastIndexOf("/");
		context = ".";
		if(idx >= 0) {
			context = prefix.substr(0, idx);
			prefix = `.${prefix.substr(idx)}`;
		}
		regExp = new RegExp(`^${quotemeta(prefix)}${options.wrappedContextRegExp.source}${quotemeta(postfix)}$`);
		dep = new Dep(context, options.wrappedContextRecursive, regExp, range, valueRange, chunkName);
		dep.loc = expr.loc;
		dep.prepend = param.prefix && param.prefix.isString() ? prefix : null;
		dep.critical = options.wrappedContextCritical && "a part of the request of a dependency is an expression";
		return dep;
	} else {
		dep = new Dep(options.exprContextRequest, options.exprContextRecursive, options.exprContextRegExp, range, param.range, chunkName);
		dep.loc = expr.loc;
		dep.critical = options.exprContextCritical && "the request of a dependency is an expression";
		return dep;
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872231, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const CommonJsRequireDependency = require("./CommonJsRequireDependency");
const CommonJsRequireContextDependency = require("./CommonJsRequireContextDependency");
const RequireHeaderDependency = require("./RequireHeaderDependency");
const LocalModuleDependency = require("./LocalModuleDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const LocalModulesHelpers = require("./LocalModulesHelpers");
const ParserHelpers = require("../ParserHelpers");

class CommonJsRequireDependencyParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		const options = this.options;
		parser.plugin("expression require.cache", ParserHelpers.toConstantDependency("__webpack_require__.c"));
		parser.plugin("expression require", (expr) => {
			const dep = new CommonJsRequireContextDependency(options.unknownContextRequest, options.unknownContextRecursive, options.unknownContextRegExp, expr.range);
			dep.critical = options.unknownContextCritical && "require function is used in a way in which dependencies cannot be statically extracted";
			dep.loc = expr.loc;
			dep.optional = !!parser.scope.inTry;
			parser.state.current.addDependency(dep);
			return true;
		});
		parser.plugin("call require", (expr) => {
			if(expr.arguments.length !== 1) return;
			let localModule;
			const param = parser.evaluateExpression(expr.arguments[0]);
			if(param.isConditional()) {
				let isExpression = false;
				const prevLength = parser.state.current.dependencies.length;
				const dep = new RequireHeaderDependency(expr.callee.range);
				dep.loc = expr.loc;
				parser.state.current.addDependency(dep);
				param.options.forEach(function(param) {
					const result = parser.applyPluginsBailResult("call require:commonjs:item", expr, param);
					if(result === undefined) {
						isExpression = true;
					}
				});
				if(isExpression) {
					parser.state.current.dependencies.length = prevLength;
				} else {
					return true;
				}
			}
			if(param.isString() && (localModule = LocalModulesHelpers.getLocalModule(parser.state, param.string))) {
				const dep = new LocalModuleDependency(localModule, expr.range);
				dep.loc = expr.loc;
				parser.state.current.addDependency(dep);
				return true;
			} else {
				const result = parser.applyPluginsBailResult("call require:commonjs:item", expr, param);
				if(result === undefined) {
					parser.applyPluginsBailResult("call require:commonjs:context", expr, param);
				} else {
					const dep = new RequireHeaderDependency(expr.callee.range);
					dep.loc = expr.loc;
					parser.state.current.addDependency(dep);
				}
				return true;
			}
		});
		parser.plugin("call require:commonjs:item", (expr, param) => {
			if(param.isString()) {
				const dep = new CommonJsRequireDependency(param.string, param.range);
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call require:commonjs:context", (expr, param) => {
			const dep = ContextDependencyHelpers.create(CommonJsRequireContextDependency, expr.range, param, expr, options);
			if(!dep) return;
			dep.loc = expr.loc;
			dep.optional = !!parser.scope.inTry;
			parser.state.current.addDependency(dep);
			return true;
		});
	}
}
module.exports = CommonJsRequireDependencyParserPlugin;

}, function(modId) { var map = {"./CommonJsRequireDependency":1602510872217,"./CommonJsRequireContextDependency":1602510872220,"./RequireHeaderDependency":1602510872228,"./LocalModuleDependency":1602510872232,"./ContextDependencyHelpers":1602510872230,"./LocalModulesHelpers":1602510872233,"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872232, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class LocalModuleDependency extends NullDependency {
	constructor(localModule, range) {
		super();
		localModule.flagUsed();
		this.localModule = localModule;
		this.range = range;
	}
}

LocalModuleDependency.Template = class LocalModuleDependencyTemplate {
	apply(dep, source) {
		if(!dep.range) return;
		source.replace(dep.range[0], dep.range[1] - 1, dep.localModule.variableName());
	}
};

module.exports = LocalModuleDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872233, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const LocalModule = require("./LocalModule");
const LocalModulesHelpers = exports;

const lookup = (parent, mod) => {
	if(mod.charAt(0) !== ".") return mod;

	var path = parent.split("/"),
		segs = mod.split("/");
	path.pop();

	for(let i = 0; i < segs.length; i++) {
		const seg = segs[i];
		if(seg === "..") path.pop();
		else if(seg !== ".") path.push(seg);
	}

	return path.join("/");
};

LocalModulesHelpers.addLocalModule = (state, name) => {
	if(!state.localModules) state.localModules = [];
	const m = new LocalModule(state.module, name, state.localModules.length);
	state.localModules.push(m);
	return m;
};

LocalModulesHelpers.getLocalModule = (state, name, namedModule) => {
	if(!state.localModules) return null;
	if(namedModule) {
		// resolve dependency name relative to the defining named module
		name = lookup(namedModule, name);
	}
	for(let i = 0; i < state.localModules.length; i++) {
		if(state.localModules[i].name === name)
			return state.localModules[i];
	}
	return null;
};

module.exports = LocalModulesHelpers;

}, function(modId) { var map = {"./LocalModule":1602510872234}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872234, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class LocalModule {
	constructor(module, name, idx) {
		this.module = module;
		this.name = name;
		this.idx = idx;
		this.used = false;
	}

	flagUsed() {
		this.used = true;
	}

	variableName() {
		return "__WEBPACK_LOCAL_MODULE_" + this.idx + "__";
	}
}
module.exports = LocalModule;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872235, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const HarmonyImportDependency = require("./HarmonyImportDependency");
const HarmonyImportSpecifierDependency = require("./HarmonyImportSpecifierDependency");
const HarmonyCompatiblilityDependency = require("./HarmonyCompatibilityDependency");
const HarmonyExportHeaderDependency = require("./HarmonyExportHeaderDependency");
const HarmonyExportExpressionDependency = require("./HarmonyExportExpressionDependency");
const HarmonyExportSpecifierDependency = require("./HarmonyExportSpecifierDependency");
const HarmonyExportImportedSpecifierDependency = require("./HarmonyExportImportedSpecifierDependency");
const HarmonyAcceptDependency = require("./HarmonyAcceptDependency");
const HarmonyAcceptImportDependency = require("./HarmonyAcceptImportDependency");

const NullFactory = require("../NullFactory");

const HarmonyDetectionParserPlugin = require("./HarmonyDetectionParserPlugin");
const HarmonyImportDependencyParserPlugin = require("./HarmonyImportDependencyParserPlugin");
const HarmonyExportDependencyParserPlugin = require("./HarmonyExportDependencyParserPlugin");

class HarmonyModulesPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(HarmonyImportDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(HarmonyImportDependency, new HarmonyImportDependency.Template());

			compilation.dependencyFactories.set(HarmonyImportSpecifierDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyImportSpecifierDependency, new HarmonyImportSpecifierDependency.Template());

			compilation.dependencyFactories.set(HarmonyCompatiblilityDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyCompatiblilityDependency, new HarmonyCompatiblilityDependency.Template());

			compilation.dependencyFactories.set(HarmonyExportHeaderDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyExportHeaderDependency, new HarmonyExportHeaderDependency.Template());

			compilation.dependencyFactories.set(HarmonyExportExpressionDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyExportExpressionDependency, new HarmonyExportExpressionDependency.Template());

			compilation.dependencyFactories.set(HarmonyExportSpecifierDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyExportSpecifierDependency, new HarmonyExportSpecifierDependency.Template());

			compilation.dependencyFactories.set(HarmonyExportImportedSpecifierDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyExportImportedSpecifierDependency, new HarmonyExportImportedSpecifierDependency.Template());

			compilation.dependencyFactories.set(HarmonyAcceptDependency, new NullFactory());
			compilation.dependencyTemplates.set(HarmonyAcceptDependency, new HarmonyAcceptDependency.Template());

			compilation.dependencyFactories.set(HarmonyAcceptImportDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(HarmonyAcceptImportDependency, new HarmonyAcceptImportDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.harmony !== "undefined" && !parserOptions.harmony)
					return;

				parser.apply(
					new HarmonyDetectionParserPlugin(),
					new HarmonyImportDependencyParserPlugin(this.options),
					new HarmonyExportDependencyParserPlugin()
				);
			});
		});
	}
}
module.exports = HarmonyModulesPlugin;

}, function(modId) { var map = {"./HarmonyImportDependency":1602510872236,"./HarmonyImportSpecifierDependency":1602510872237,"./HarmonyCompatibilityDependency":1602510872238,"./HarmonyExportHeaderDependency":1602510872239,"./HarmonyExportExpressionDependency":1602510872240,"./HarmonyExportSpecifierDependency":1602510872241,"./HarmonyExportImportedSpecifierDependency":1602510872242,"./HarmonyAcceptDependency":1602510872243,"./HarmonyAcceptImportDependency":1602510872244,"../NullFactory":1602510872205,"./HarmonyDetectionParserPlugin":1602510872245,"./HarmonyImportDependencyParserPlugin":1602510872246,"./HarmonyExportDependencyParserPlugin":1602510872248}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872236, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class HarmonyImportDependency extends ModuleDependency {
	constructor(request, importedVar, range) {
		super(request);
		this.range = range;
		this.importedVar = importedVar;
	}

	get type() {
		return "harmony import";
	}

	getReference() {
		if(!this.module) return null;

		return {
			module: this.module,
			importedNames: false
		};
	}

	updateHash(hash) {
		super.updateHash(hash);
		hash.update((this.module && (!this.module.meta || this.module.meta.harmonyModule)) + "");
	}
}

HarmonyImportDependency.Template = class HarmonyImportDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const content = makeImportStatement(true, dep, outputOptions, requestShortener);
		source.replace(dep.range[0], dep.range[1] - 1, "");
		source.insert(-1, content);
	}
};

function getOptionalComment(pathinfo, shortenedRequest) {
	if(!pathinfo) {
		return "";
	}
	return `/*! ${shortenedRequest} */ `;
}

function makeImportStatement(declare, dep, outputOptions, requestShortener) {
	const comment = getOptionalComment(outputOptions.pathinfo, requestShortener.shorten(dep.request));
	const declaration = declare ? "var " : "";
	const newline = declare ? "\n" : " ";

	if(!dep.module) {
		const stringifiedError = JSON.stringify(`Cannot find module "${dep.request}"`);
		return `throw new Error(${stringifiedError});${newline}`;
	}

	if(dep.importedVar) {
		const isHarmonyModule = dep.module.meta && dep.module.meta.harmonyModule;
		const content = `/* harmony import */ ${declaration}${dep.importedVar} = __webpack_require__(${comment}${JSON.stringify(dep.module.id)});${newline}`;
		if(isHarmonyModule) {
			return content;
		}
		return `${content}/* harmony import */ ${declaration}${dep.importedVar}_default = __webpack_require__.n(${dep.importedVar});${newline}`;
	}

	return "";
}
HarmonyImportDependency.makeImportStatement = makeImportStatement;

module.exports = HarmonyImportDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872237, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class HarmonyImportSpecifierDependency extends NullDependency {
	constructor(importDependency, importedVar, id, name, range, strictExportPresence) {
		super();
		this.importDependency = importDependency;
		this.importedVar = importedVar;
		this.id = id;
		this.name = name;
		this.range = range;
		this.strictExportPresence = strictExportPresence;
		this.namespaceObjectAsContext = false;
		this.callArgs = undefined;
		this.call = undefined;
		this.directImport = undefined;
	}

	get type() {
		return "harmony import specifier";
	}

	getReference() {
		if(!this.importDependency.module) return null;
		return {
			module: this.importDependency.module,
			importedNames: this.id && !this.namespaceObjectAsContext ? [this.id] : true
		};
	}

	getWarnings() {
		if(this.strictExportPresence) {
			return [];
		}
		return this._getErrors();
	}

	getErrors() {
		if(this.strictExportPresence) {
			return this._getErrors();
		}
		return [];
	}

	_getErrors() {
		const importedModule = this.importDependency.module;
		if(!importedModule || !importedModule.meta || !importedModule.meta.harmonyModule) {
			return;
		}

		if(!this.id) {
			return;
		}

		if(importedModule.isProvided(this.id) !== false) {
			return;
		}

		const idIsNotNameMessage = this.id !== this.name ? ` (imported as '${this.name}')` : "";
		const errorMessage = `"export '${this.id}'${idIsNotNameMessage} was not found in '${this.importDependency.userRequest}'`;
		const err = new Error(errorMessage);
		err.hideStack = true;
		return [err];
	}

	updateHash(hash) {
		super.updateHash(hash);
		const importedModule = this.importDependency.module;
		hash.update((importedModule && importedModule.id) + "");
		hash.update((importedModule && this.id) + "");
		hash.update((importedModule && this.importedVar) + "");
		hash.update((importedModule && this.id && importedModule.isUsed(this.id)) + "");
		hash.update((importedModule && (!importedModule.meta || importedModule.meta.harmonyModule)) + "");
		hash.update((importedModule && (importedModule.used + JSON.stringify(importedModule.usedExports))) + "");
	}
}

HarmonyImportSpecifierDependency.Template = class HarmonyImportSpecifierDependencyTemplate {
	apply(dep, source) {
		const content = this.getContent(dep);
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}

	getContent(dep) {
		const importedModule = dep.importDependency.module;
		const defaultImport = dep.directImport && dep.id === "default" && !(importedModule && (!importedModule.meta || importedModule.meta.harmonyModule));
		const shortHandPrefix = this.getShortHandPrefix(dep);
		const importedVar = dep.importedVar;
		const importedVarSuffix = this.getImportVarSuffix(dep, defaultImport, importedModule);

		if(dep.call && defaultImport) {
			return `${shortHandPrefix}${importedVar}_default()`;
		}

		if(dep.call && dep.id) {
			return `${shortHandPrefix}Object(${importedVar}${importedVarSuffix})`;
		}

		return `${shortHandPrefix}${importedVar}${importedVarSuffix}`;
	}

	getImportVarSuffix(dep, defaultImport, importedModule) {
		if(defaultImport) {
			return "_default.a";
		}

		if(dep.id) {
			const used = importedModule ? importedModule.isUsed(dep.id) : dep.id;
			const optionalComment = dep.id !== used ? " /* " + dep.id + " */" : "";
			return `[${JSON.stringify(used)}${optionalComment}]`;
		}

		return "";
	}

	getShortHandPrefix(dep) {
		if(!dep.shorthand) {
			return "";
		}

		return dep.name + ": ";
	}
};

module.exports = HarmonyImportSpecifierDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872238, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class HarmonyCompatibilityDependency extends NullDependency {
	constructor(originModule) {
		super();
		this.originModule = originModule;
	}

	get type() {
		return "harmony export header";
	}
}

HarmonyCompatibilityDependency.Template = class HarmonyExportDependencyTemplate {
	apply(dep, source) {
		const usedExports = dep.originModule.usedExports;
		if(usedExports && !Array.isArray(usedExports)) {
			const exportName = dep.originModule.exportsArgument || "exports";
			const content = `Object.defineProperty(${exportName}, "__esModule", { value: true });\n`;
			source.insert(-10, content);
		}
	}
};

module.exports = HarmonyCompatibilityDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872239, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class HarmonyExportHeaderDependency extends NullDependency {
	constructor(range, rangeStatement) {
		super();
		this.range = range;
		this.rangeStatement = rangeStatement;
	}

	get type() {
		return "harmony export header";
	}
}

HarmonyExportHeaderDependency.Template = class HarmonyExportDependencyTemplate {
	apply(dep, source) {
		const content = "";
		const replaceUntil = dep.range ? dep.range[0] - 1 : dep.rangeStatement[1] - 1;
		source.replace(dep.rangeStatement[0], replaceUntil, content);
	}
};

module.exports = HarmonyExportHeaderDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872240, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class HarmonyExportExpressionDependency extends NullDependency {
	constructor(originModule, range, rangeStatement) {
		super();
		this.originModule = originModule;
		this.range = range;
		this.rangeStatement = rangeStatement;
	}

	get type() {
		return "harmony export expression";
	}

	getExports() {
		return {
			exports: ["default"]
		};
	}
}

HarmonyExportExpressionDependency.Template = class HarmonyExportDependencyTemplate {
	apply(dep, source) {
		const used = dep.originModule.isUsed("default");
		const content = this.getContent(dep.originModule, used);

		if(dep.range) {
			source.replace(dep.rangeStatement[0], dep.range[0] - 1, content + "(");
			source.replace(dep.range[1], dep.rangeStatement[1] - 1, ");");
			return;
		}

		source.replace(dep.rangeStatement[0], dep.rangeStatement[1] - 1, content);
	}

	getContent(module, used) {
		const exportsName = module.exportsArgument || "exports";
		if(used) {
			return `/* harmony default export */ ${exportsName}[${JSON.stringify(used)}] = `;
		}
		return "/* unused harmony default export */ var _unused_webpack_default_export = ";
	}
};

module.exports = HarmonyExportExpressionDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872241, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class HarmonyExportSpecifierDependency extends NullDependency {
	constructor(originModule, id, name, position, immutable) {
		super();
		this.originModule = originModule;
		this.id = id;
		this.name = name;
		this.position = position;
		this.immutable = immutable;
	}

	get type() {
		return "harmony export specifier";
	}

	getExports() {
		return {
			exports: [this.name]
		};
	}
}

HarmonyExportSpecifierDependency.Template = class HarmonyExportSpecifierDependencyTemplate {
	apply(dep, source) {
		const content = this.getPrefix(dep) + this.getContent(dep);
		source.insert(dep.position, content);
	}

	getPrefix(dep) {
		return dep.position > 0 ? "\n" : "";
	}

	getContent(dep) {
		const used = dep.originModule.isUsed(dep.name);
		if(!used) {
			return `/* unused harmony export ${(dep.name || "namespace")} */\n`;
		}

		const exportsName = dep.originModule.exportsArgument || "exports";
		if(dep.immutable) {
			return `/* harmony export (immutable) */ ${exportsName}[${JSON.stringify(used)}] = ${dep.id};\n`;
		}

		return `/* harmony export (binding) */ __webpack_require__.d(${exportsName}, ${JSON.stringify(used)}, function() { return ${dep.id}; });\n`;
	}
};

module.exports = HarmonyExportSpecifierDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872242, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class HarmonyExportImportedSpecifierDependency extends NullDependency {
	constructor(originModule, importDependency, importedVar, id, name, activeExports, otherStarExports) {
		super();
		this.originModule = originModule;
		this.importDependency = importDependency;
		this.importedVar = importedVar;
		this.id = id;
		this.name = name;
		this.activeExports = activeExports;
		this.otherStarExports = otherStarExports;
	}

	get type() {
		return "harmony export imported specifier";
	}

	getReference() {
		const name = this.name;
		const used = this.originModule.isUsed(name);
		const importedModule = this.importDependency.module;

		if(!importedModule || !used || !this.originModule.usedExports) return null;

		const hasUsedExports = Array.isArray(this.originModule.usedExports);

		if(name) {
			const nameIsNotInUsedExports = hasUsedExports && this.originModule.usedExports.indexOf(name) < 0;
			if(nameIsNotInUsedExports) return null;

			// export { name as name }
			if(this.id) {
				return {
					module: importedModule,
					importedNames: [this.id]
				};
			}

			// export { * as name }
			return {
				module: importedModule,
				importedNames: true
			};
		}

		const hasProvidedExports = Array.isArray(importedModule.providedExports);
		const activeFromOtherStarExports = this._discoverActiveExportsFromOtherStartExports();

		// export *
		if(hasUsedExports) {
			// reexport * with known used exports
			const importedNames = this.originModule.usedExports.filter(id => {
				if(id === "default") return false;
				if(this.activeExports.has(id)) return false;
				if(activeFromOtherStarExports.has(id)) return false;
				if(hasProvidedExports && importedModule.providedExports.indexOf(id) < 0) return false;

				return true;
			});

			return {
				module: importedModule,
				importedNames
			};
		}

		if(hasProvidedExports) {
			return {
				module: importedModule,
				importedNames: importedModule.providedExports.filter(id => {
					if(id === "default") return false;
					if(this.activeExports.has(id)) return false;
					if(activeFromOtherStarExports.has(id)) return false;

					return true;
				})
			};
		}

		return {
			module: importedModule,
			importedNames: true,
		};
	}

	_discoverActiveExportsFromOtherStartExports() {
		if(!this.otherStarExports)
			return new Set();
		const result = new Set();
		// try to learn impossible exports from other star exports with provided exports
		for(const otherStarExport of this.otherStarExports) {
			const otherImportedModule = otherStarExport.importDependency.module;
			if(otherImportedModule && Array.isArray(otherImportedModule.providedExports)) {
				for(const exportName of otherImportedModule.providedExports)
					result.add(exportName);
			}
		}
		return result;
	}

	getExports() {
		if(this.name) {
			return {
				exports: [this.name]
			};
		}

		const importedModule = this.importDependency.module;

		if(!importedModule) {
			// no imported module available
			return {
				exports: null
			};
		}

		if(Array.isArray(importedModule.providedExports)) {
			return {
				exports: importedModule.providedExports.filter(id => id !== "default"),
				dependencies: [importedModule]
			};
		}

		if(importedModule.providedExports) {
			return {
				exports: true
			};
		}

		return {
			exports: null,
			dependencies: [importedModule]
		};
	}

	updateHash(hash) {
		super.updateHash(hash);
		const hashValue = this.getHashValue(this.importDependency.module);
		hash.update(hashValue);
	}

	getHashValue(importedModule) {
		if(!importedModule) {
			return "";
		}

		const stringifiedUsedExport = JSON.stringify(importedModule.usedExports);
		const stringifiedProvidedExport = JSON.stringify(importedModule.providedExports);
		return importedModule.used + stringifiedUsedExport + stringifiedProvidedExport;
	}
}

module.exports = HarmonyExportImportedSpecifierDependency;

HarmonyExportImportedSpecifierDependency.Template = class HarmonyExportImportedSpecifierDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const content = this.getContent(dep);
		source.insert(-1, content);
	}

	getContent(dep) {
		const name = dep.importedVar;
		const used = dep.originModule.isUsed(dep.name);
		const importedModule = dep.importDependency.module;
		const importsExportsUnknown = !importedModule || !Array.isArray(importedModule.providedExports);

		const getReexportStatement = this.reexportStatementCreator(dep.originModule, importsExportsUnknown, name);

		// we want to rexport something, but the export isn't used
		if(!used) {
			return "/* unused harmony reexport " + dep.name + " */\n";
		}

		// we want to reexport the default export from a non-hamory module
		const isNotAHarmonyModule = !(importedModule && (!importedModule.meta || importedModule.meta.harmonyModule));
		if(dep.name && dep.id === "default" && isNotAHarmonyModule) {
			return "/* harmony reexport (default from non-hamory) */ " + getReexportStatement(JSON.stringify(used), null);
		}

		// we want to reexport a key as new key
		if(dep.name && dep.id) {
			var idUsed = importedModule && importedModule.isUsed(dep.id);
			return "/* harmony reexport (binding) */ " + getReexportStatement(JSON.stringify(used), JSON.stringify(idUsed));
		}

		// we want to reexport the module object as named export
		if(dep.name) {
			return "/* harmony reexport (module object) */ " + getReexportStatement(JSON.stringify(used), "");
		}

		const hasProvidedExports = importedModule && Array.isArray(importedModule.providedExports);

		const activeFromOtherStarExports = dep._discoverActiveExportsFromOtherStartExports();

		// we know which exports are used
		if(Array.isArray(dep.originModule.usedExports)) {
			const items = dep.originModule.usedExports.map(id => {
				if(id === "default") return;
				if(dep.activeExports.has(id)) return;
				if(importedModule.isProvided(id) === false) return;
				if(activeFromOtherStarExports.has(id)) return;
				var exportUsed = dep.originModule.isUsed(id);
				var idUsed = importedModule && importedModule.isUsed(id);
				return [exportUsed, idUsed];
			}).filter(Boolean);

			if(items.length === 0) {
				return "/* unused harmony namespace reexport */\n";
			}

			return items.map(function(item) {
				return "/* harmony namespace reexport (by used) */ " + getReexportStatement(JSON.stringify(item[0]), JSON.stringify(item[1]));
			}).join("");
		}

		// not sure which exports are used, but we know which are provided
		if(dep.originModule.usedExports && importedModule && hasProvidedExports) {
			const items = importedModule.providedExports.map(id => {
				if(id === "default") return;
				if(dep.activeExports.has(id)) return;
				if(activeFromOtherStarExports.has(id)) return;
				var exportUsed = dep.originModule.isUsed(id);
				var idUsed = importedModule && importedModule.isUsed(id);
				return [exportUsed, idUsed];
			}).filter(Boolean);

			if(items.length === 0) {
				return "/* empty harmony namespace reexport */\n";
			}

			return items.map(function(item) {
				return "/* harmony namespace reexport (by provided) */ " + getReexportStatement(JSON.stringify(item[0]), JSON.stringify(item[1]));
			}).join("");
		}

		// not sure which exports are used and provided
		if(dep.originModule.usedExports) {
			const activeExports = Array.from(dep.activeExports).concat(Array.from(activeFromOtherStarExports));
			let content = "/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in " + name + ") ";

			// Filter out exports which are defined by other exports
			// and filter out default export because it cannot be reexported with *
			if(activeExports.length > 0)
				content += "if(" + JSON.stringify(activeExports.concat("default")) + ".indexOf(__WEBPACK_IMPORT_KEY__) < 0) ";
			else
				content += "if(__WEBPACK_IMPORT_KEY__ !== 'default') ";
			const exportsName = dep.originModule.exportsArgument || "exports";
			return content + `(function(key) { __webpack_require__.d(${exportsName}, key, function() { return ${name}[key]; }) }(__WEBPACK_IMPORT_KEY__));\n`;
		}

		return "/* unused harmony reexport namespace */\n";
	}

	reexportStatementCreator(module, importsExportsUnknown, name) {
		const exportsName = module.exportsArgument || "exports";
		const getReexportStatement = (key, valueKey) => {
			const conditional = this.getConditional(importsExportsUnknown, valueKey, name);
			const returnValue = this.getReturnValue(valueKey);
			return `${conditional}__webpack_require__.d(${exportsName}, ${key}, function() { return ${name}${returnValue}; });\n`;
		};
		return getReexportStatement;
	}

	getConditional(importsExportsUnknown, valueKey, name) {
		if(!importsExportsUnknown || !valueKey) {
			return "";
		}

		return `if(__webpack_require__.o(${name}, ${valueKey})) `;
	}

	getReturnValue(valueKey) {
		if(valueKey === null) {
			return "_default.a";
		}

		return valueKey && "[" + valueKey + "]";
	}
};

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872243, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");
const makeHarmonyImportStatement = require("./HarmonyImportDependency").makeImportStatement;

class HarmonyAcceptDependency extends NullDependency {
	constructor(range, dependencies, hasCallback) {
		super();
		this.range = range;
		this.dependencies = dependencies;
		this.hasCallback = hasCallback;
	}

	get type() {
		return "accepted harmony modules";
	}
}

HarmonyAcceptDependency.Template = class HarmonyAcceptDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const content = dep.dependencies
			.map(dependency => makeHarmonyImportStatement(
				false,
				dependency,
				outputOptions,
				requestShortener
			)).join("");

		if(dep.hasCallback) {
			source.insert(dep.range[0], `function(__WEBPACK_OUTDATED_DEPENDENCIES__) { ${content}(`);
			source.insert(dep.range[1], ")(__WEBPACK_OUTDATED_DEPENDENCIES__); }");
			return;
		}

		source.insert(dep.range[1] - 0.5, `, function() { ${content} }`);
	}
};

module.exports = HarmonyAcceptDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202,"./HarmonyImportDependency":1602510872236}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872244, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const HarmonyImportDependency = require("./HarmonyImportDependency");

class HarmonyAcceptImportDependency extends HarmonyImportDependency {
	constructor(request, importedVar, range) {
		super(request, importedVar, range);
	}

	get type() {
		return "harmony accept";
	}
}

HarmonyAcceptImportDependency.Template = class HarmonyAcceptImportDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {}
};

module.exports = HarmonyAcceptImportDependency;

}, function(modId) { var map = {"./HarmonyImportDependency":1602510872236}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872245, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const HarmonyCompatibilityDependency = require("./HarmonyCompatibilityDependency");

module.exports = class HarmonyDetectionParserPlugin {
	apply(parser) {
		parser.plugin("program", (ast) => {
			const isHarmony = ast.body.some(statement => {
				return /^(Import|Export).*Declaration$/.test(statement.type);
			});
			if(isHarmony) {
				const module = parser.state.module;
				const dep = new HarmonyCompatibilityDependency(module);
				dep.loc = {
					start: {
						line: -1,
						column: 0
					},
					end: {
						line: -1,
						column: 0
					},
					index: -2
				};
				module.addDependency(dep);
				module.meta.harmonyModule = true;
				module.strict = true;
				module.exportsArgument = "__webpack_exports__";
			}
		});
		const nonHarmonyIdentifiers = ["define", "exports"];
		nonHarmonyIdentifiers.forEach(identifer => {
			parser.plugin(`evaluate typeof ${identifer}`, nullInHarmony);
			parser.plugin(`typeof ${identifer}`, skipInHarmony);
			parser.plugin(`evaluate ${identifer}`, nullInHarmony);
			parser.plugin(`expression ${identifer}`, skipInHarmony);
			parser.plugin(`call ${identifer}`, skipInHarmony);
		});

		function skipInHarmony() {
			const module = this.state.module;
			if(module && module.meta && module.meta.harmonyModule)
				return true;
		}

		function nullInHarmony() {
			const module = this.state.module;
			if(module && module.meta && module.meta.harmonyModule)
				return null;
		}
	}
};

}, function(modId) { var map = {"./HarmonyCompatibilityDependency":1602510872238}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872246, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const HarmonyImportDependency = require("./HarmonyImportDependency");
const HarmonyImportSpecifierDependency = require("./HarmonyImportSpecifierDependency");
const HarmonyAcceptImportDependency = require("./HarmonyAcceptImportDependency");
const HarmonyAcceptDependency = require("./HarmonyAcceptDependency");
const HarmonyModulesHelpers = require("./HarmonyModulesHelpers");

module.exports = class HarmonyImportDependencyParserPlugin {
	constructor(moduleOptions) {
		this.strictExportPresence = moduleOptions.strictExportPresence;
		this.strictThisContextOnImports = moduleOptions.strictThisContextOnImports;
	}

	apply(parser) {
		parser.plugin("import", (statement, source) => {
			const dep = new HarmonyImportDependency(source, HarmonyModulesHelpers.getNewModuleVar(parser.state, source), statement.range);
			dep.loc = statement.loc;
			parser.state.current.addDependency(dep);
			parser.state.lastHarmonyImport = dep;
			return true;
		});
		parser.plugin("import specifier", (statement, source, id, name) => {
			parser.scope.definitions.length--;
			parser.scope.renames[`$${name}`] = "imported var";
			if(!parser.state.harmonySpecifier) parser.state.harmonySpecifier = {};
			parser.state.harmonySpecifier[`$${name}`] = [parser.state.lastHarmonyImport, HarmonyModulesHelpers.getModuleVar(parser.state, source), id];
			return true;
		});
		parser.plugin("expression imported var", (expr) => {
			const name = expr.name;
			const settings = parser.state.harmonySpecifier[`$${name}`];
			const dep = new HarmonyImportSpecifierDependency(settings[0], settings[1], settings[2], name, expr.range, this.strictExportPresence);
			dep.shorthand = parser.scope.inShorthand;
			dep.directImport = true;
			dep.loc = expr.loc;
			parser.state.current.addDependency(dep);
			return true;
		});
		parser.plugin("expression imported var.*", (expr) => {
			const name = expr.object.name;
			const settings = parser.state.harmonySpecifier[`$${name}`];
			if(settings[2] !== null)
				return false;
			const dep = new HarmonyImportSpecifierDependency(settings[0], settings[1], expr.property.name || expr.property.value, name, expr.range, this.strictExportPresence);
			dep.shorthand = parser.scope.inShorthand;
			dep.directImport = false;
			dep.loc = expr.loc;
			parser.state.current.addDependency(dep);
			return true;
		});
		if(this.strictThisContextOnImports) {
			// only in case when we strictly follow the spec we need a special case here
			parser.plugin("call imported var.*", (expr) => {
				if(expr.callee.type !== "MemberExpression") return;
				if(expr.callee.object.type !== "Identifier") return;
				const name = expr.callee.object.name;
				const settings = parser.state.harmonySpecifier[`$${name}`];
				if(settings[2] !== null)
					return false;
				const dep = new HarmonyImportSpecifierDependency(settings[0], settings[1], expr.callee.property.name || expr.callee.property.value, name, expr.callee.range, this.strictExportPresence);
				dep.shorthand = parser.scope.inShorthand;
				dep.directImport = false;
				dep.namespaceObjectAsContext = true;
				dep.loc = expr.callee.loc;
				parser.state.current.addDependency(dep);
				if(expr.arguments)
					parser.walkExpressions(expr.arguments);
				return true;
			});
		}
		parser.plugin("call imported var", (expr) => {
			const args = expr.arguments;
			const fullExpr = expr;
			expr = expr.callee;
			if(expr.type !== "Identifier") return;
			const name = expr.name;
			const settings = parser.state.harmonySpecifier[`$${name}`];
			const dep = new HarmonyImportSpecifierDependency(settings[0], settings[1], settings[2], name, expr.range, this.strictExportPresence);
			dep.directImport = true;
			dep.callArgs = args;
			dep.call = fullExpr;
			dep.loc = expr.loc;
			parser.state.current.addDependency(dep);
			if(args)
				parser.walkExpressions(args);
			return true;
		});
		parser.plugin("hot accept callback", (expr, requests) => {
			const dependencies = requests
				.filter(request => HarmonyModulesHelpers.checkModuleVar(parser.state, request))
				.map(request => {
					const dep = new HarmonyAcceptImportDependency(request, HarmonyModulesHelpers.getModuleVar(parser.state, request), expr.range);
					dep.loc = expr.loc;
					parser.state.current.addDependency(dep);
					return dep;
				});
			if(dependencies.length > 0) {
				const dep = new HarmonyAcceptDependency(expr.range, dependencies, true);
				dep.loc = expr.loc;
				parser.state.current.addDependency(dep);
			}
		});
		parser.plugin("hot accept without callback", (expr, requests) => {
			const dependencies = requests
				.filter(request => HarmonyModulesHelpers.checkModuleVar(parser.state, request))
				.map(request => {
					const dep = new HarmonyAcceptImportDependency(request, HarmonyModulesHelpers.getModuleVar(parser.state, request), expr.range);
					dep.loc = expr.loc;
					parser.state.current.addDependency(dep);
					return dep;
				});
			if(dependencies.length > 0) {
				const dep = new HarmonyAcceptDependency(expr.range, dependencies, false);
				dep.loc = expr.loc;
				parser.state.current.addDependency(dep);
			}
		});
	}
};

}, function(modId) { var map = {"./HarmonyImportDependency":1602510872236,"./HarmonyImportSpecifierDependency":1602510872237,"./HarmonyAcceptImportDependency":1602510872244,"./HarmonyAcceptDependency":1602510872243,"./HarmonyModulesHelpers":1602510872247}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872247, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class HarmonyModulesHelpers {

	static getModuleVar(state, request) {
		if(!state.harmonyModules) state.harmonyModules = [];
		let idx = state.harmonyModules.indexOf(request);
		if(idx < 0) {
			idx = state.harmonyModules.length;
			state.harmonyModules.push(request);
		}
		return `__WEBPACK_IMPORTED_MODULE_${idx}_${request.replace(/[^A-Za-z0-9_]/g, "_").replace(/__+/g, "_")}__`;
	}

	static getNewModuleVar(state, request) {
		if(state.harmonyModules && state.harmonyModules.indexOf(request) >= 0)
			return null;
		return this.getModuleVar(state, request);
	}

	static checkModuleVar(state, request) {
		if(!state.harmonyModules || state.harmonyModules.indexOf(request) < 0)
			return null;
		return this.getModuleVar(state, request);
	}
}

module.exports = HarmonyModulesHelpers;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872248, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const HarmonyExportExpressionDependency = require("./HarmonyExportExpressionDependency");
const HarmonyExportHeaderDependency = require("./HarmonyExportHeaderDependency");
const HarmonyExportSpecifierDependency = require("./HarmonyExportSpecifierDependency");
const HarmonyExportImportedSpecifierDependency = require("./HarmonyExportImportedSpecifierDependency");
const HarmonyImportDependency = require("./HarmonyImportDependency");
const HarmonyModulesHelpers = require("./HarmonyModulesHelpers");

module.exports = class HarmonyExportDependencyParserPlugin {
	apply(parser) {
		parser.plugin("export", statement => {
			const dep = new HarmonyExportHeaderDependency(statement.declaration && statement.declaration.range, statement.range);
			dep.loc = Object.create(statement.loc);
			dep.loc.index = -1;
			parser.state.current.addDependency(dep);
			return true;
		});
		parser.plugin("export import", (statement, source) => {
			const dep = new HarmonyImportDependency(source, HarmonyModulesHelpers.getNewModuleVar(parser.state, source), statement.range);
			dep.loc = Object.create(statement.loc);
			dep.loc.index = -1;
			parser.state.current.addDependency(dep);
			parser.state.lastHarmonyImport = dep;
			return true;
		});
		parser.plugin("export expression", (statement, expr) => {
			const dep = new HarmonyExportExpressionDependency(parser.state.module, expr.range, statement.range);
			dep.loc = Object.create(statement.loc);
			dep.loc.index = -1;
			parser.state.current.addDependency(dep);
			return true;
		});
		parser.plugin("export declaration", statement => {});
		parser.plugin("export specifier", (statement, id, name, idx) => {
			const rename = parser.scope.renames[`$${id}`];
			let dep;
			const harmonyNamedExports = parser.state.harmonyNamedExports = parser.state.harmonyNamedExports || new Set();
			harmonyNamedExports.add(name);
			if(rename === "imported var") {
				const settings = parser.state.harmonySpecifier[`$${id}`];
				dep = new HarmonyExportImportedSpecifierDependency(parser.state.module, settings[0], settings[1], settings[2], name, harmonyNamedExports, null);
			} else {
				const immutable = statement.declaration && isImmutableStatement(statement.declaration);
				const hoisted = statement.declaration && isHoistedStatement(statement.declaration);
				dep = new HarmonyExportSpecifierDependency(parser.state.module, id, name, !immutable || hoisted ? -2 : (statement.range[1] + 0.5), immutable);
			}
			dep.loc = Object.create(statement.loc);
			dep.loc.index = idx;
			parser.state.current.addDependency(dep);
			return true;
		});
		parser.plugin("export import specifier", (statement, source, id, name, idx) => {
			const harmonyNamedExports = parser.state.harmonyNamedExports = parser.state.harmonyNamedExports || new Set();
			let harmonyStarExports = null;
			if(name) {
				harmonyNamedExports.add(name);
			} else {
				harmonyStarExports = parser.state.harmonyStarExports = parser.state.harmonyStarExports || [];
			}
			const dep = new HarmonyExportImportedSpecifierDependency(parser.state.module, parser.state.lastHarmonyImport, HarmonyModulesHelpers.getModuleVar(parser.state, source), id, name, harmonyNamedExports, harmonyStarExports && harmonyStarExports.slice());
			if(harmonyStarExports) {
				harmonyStarExports.push(dep);
			}
			dep.loc = Object.create(statement.loc);
			dep.loc.index = idx;
			parser.state.current.addDependency(dep);
			return true;
		});
	}
};

function isImmutableStatement(statement) {
	if(statement.type === "FunctionDeclaration") return true;
	if(statement.type === "ClassDeclaration") return true;
	if(statement.type === "VariableDeclaration" && statement.kind === "const") return true;
	return false;
}

function isHoistedStatement(statement) {
	if(statement.type === "FunctionDeclaration") return true;
	return false;
}

}, function(modId) { var map = {"./HarmonyExportExpressionDependency":1602510872240,"./HarmonyExportHeaderDependency":1602510872239,"./HarmonyExportSpecifierDependency":1602510872241,"./HarmonyExportImportedSpecifierDependency":1602510872242,"./HarmonyImportDependency":1602510872236,"./HarmonyModulesHelpers":1602510872247}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872249, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ParserHelpers = require("../ParserHelpers");

class SystemPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.system !== "undefined" && !parserOptions.system)
					return;

				function setNotSupported(name) {
					parser.plugin("evaluate typeof " + name, ParserHelpers.evaluateToString("undefined"));
					parser.plugin("expression " + name,
						ParserHelpers.expressionIsUnsupported(name + " is not supported by webpack.")
					);
				}

				parser.plugin("typeof System.import", ParserHelpers.toConstantDependency(JSON.stringify("function")));
				parser.plugin("evaluate typeof System.import", ParserHelpers.evaluateToString("function"));
				parser.plugin("typeof System", ParserHelpers.toConstantDependency(JSON.stringify("object")));
				parser.plugin("evaluate typeof System", ParserHelpers.evaluateToString("object"));

				setNotSupported("System.set");
				setNotSupported("System.get");
				setNotSupported("System.register");
				parser.plugin("expression System", function() {
					const systemPolyfillRequire = ParserHelpers.requireFileAsExpression(
						this.state.module.context, require.resolve("../../buildin/system.js"));
					return ParserHelpers.addParsedVariableToModule(this, "System", systemPolyfillRequire);
				});
			});
		});
	}
}
module.exports = SystemPlugin;

}, function(modId) { var map = {"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872250, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ImportDependency = require("./ImportDependency");
const ImportEagerDependency = require("./ImportEagerDependency");
const ImportWeakDependency = require("./ImportWeakDependency");
const ImportEagerContextDependency = require("./ImportEagerContextDependency");
const ImportWeakContextDependency = require("./ImportWeakContextDependency");
const ImportLazyOnceContextDependency = require("./ImportLazyOnceContextDependency");
const ImportLazyContextDependency = require("./ImportLazyContextDependency");
const ImportParserPlugin = require("./ImportParserPlugin");

class ImportPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;
			const contextModuleFactory = params.contextModuleFactory;

			compilation.dependencyFactories.set(ImportDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(ImportDependency, new ImportDependency.Template());

			compilation.dependencyFactories.set(ImportEagerDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(ImportEagerDependency, new ImportEagerDependency.Template());

			compilation.dependencyFactories.set(ImportWeakDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(ImportWeakDependency, new ImportWeakDependency.Template());

			compilation.dependencyFactories.set(ImportEagerContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(ImportEagerContextDependency, new ImportEagerContextDependency.Template());

			compilation.dependencyFactories.set(ImportWeakContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(ImportWeakContextDependency, new ImportWeakContextDependency.Template());

			compilation.dependencyFactories.set(ImportLazyOnceContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(ImportLazyOnceContextDependency, new ImportLazyOnceContextDependency.Template());

			compilation.dependencyFactories.set(ImportLazyContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(ImportLazyContextDependency, new ImportLazyContextDependency.Template());

			normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.import !== "undefined" && !parserOptions.import)
					return;

				parser.apply(
					new ImportParserPlugin(options)
				);
			});
		});
	}
}
module.exports = ImportPlugin;

}, function(modId) { var map = {"./ImportDependency":1602510872251,"./ImportEagerDependency":1602510872252,"./ImportWeakDependency":1602510872253,"./ImportEagerContextDependency":1602510872254,"./ImportWeakContextDependency":1602510872256,"./ImportLazyOnceContextDependency":1602510872257,"./ImportLazyContextDependency":1602510872258,"./ImportParserPlugin":1602510872259}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872251, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const DepBlockHelpers = require("./DepBlockHelpers");
const webpackMissingPromiseModule = require("./WebpackMissingModule").promise;

class ImportDependency extends ModuleDependency {
	constructor(request, block) {
		super(request);
		this.block = block;
	}

	get type() {
		return "import()";
	}
}

ImportDependency.Template = class ImportDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const depBlock = dep.block;
		const promise = DepBlockHelpers.getDepBlockPromise(depBlock, outputOptions, requestShortener, "import()");
		const comment = this.getOptionalComment(outputOptions.pathinfo, requestShortener.shorten(dep.request));

		const content = this.getContent(promise, dep, comment);
		source.replace(depBlock.range[0], depBlock.range[1] - 1, content);
	}

	getOptionalComment(pathinfo, shortenedRequest) {
		if(!pathinfo) {
			return "";
		}

		return `/*! ${shortenedRequest} */ `;
	}

	getContent(promise, dep, comment) {
		if(promise && dep.module) {
			const stringifiedId = JSON.stringify(dep.module.id);
			return `${promise}.then(__webpack_require__.bind(null, ${comment}${stringifiedId}))`;
		}

		if(dep.module) {
			const stringifiedId = JSON.stringify(dep.module.id);
			return `new Promise(function(resolve) { resolve(__webpack_require__(${comment}${stringifiedId})); })`;
		}

		return webpackMissingPromiseModule(dep.request);
	}
};

module.exports = ImportDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./DepBlockHelpers":1602510872170,"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872252, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const webpackMissingPromiseModule = require("./WebpackMissingModule").promise;

class ImportEagerDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
	}

	get type() {
		return "import()";
	}
}

ImportEagerDependency.Template = class ImportEagerDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const comment = this.getOptionalComment(outputOptions.pathinfo, requestShortener.shorten(dep.request));

		const content = this.getContent(dep, comment);
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}

	getOptionalComment(pathinfo, shortenedRequest) {
		if(!pathinfo) {
			return "";
		}

		return `/*! ${shortenedRequest} */ `;
	}

	getContent(dep, comment) {
		if(dep.module) {
			const stringifiedId = JSON.stringify(dep.module.id);
			return `new Promise(function(resolve) { resolve(__webpack_require__(${comment}${stringifiedId})); })`;
		}

		return webpackMissingPromiseModule(dep.request);
	}
};

module.exports = ImportEagerDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872253, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const webpackMissingPromiseModule = require("./WebpackMissingModule").promise;

class ImportWeakDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
		this.weak = true;
	}

	get type() {
		return "import() weak";
	}
}

ImportWeakDependency.Template = class ImportDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const comment = this.getOptionalComment(outputOptions.pathinfo, requestShortener.shorten(dep.request));

		const content = this.getContent(dep, comment);
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}

	getOptionalComment(pathinfo, shortenedRequest) {
		if(!pathinfo) {
			return "";
		}

		return `/*! ${shortenedRequest} */ `;
	}

	getContent(dep, comment) {
		if(dep.module) {
			const stringifiedId = JSON.stringify(dep.module.id);
			return `Promise.resolve(${comment}${stringifiedId}).then(function(id) { if(!__webpack_require__.m[id]) throw new Error("Module '" + id + "' is not available (weak dependency)"); return __webpack_require__(id); })`;
		}

		return webpackMissingPromiseModule(dep.request);
	}
};

module.exports = ImportWeakDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872254, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ImportContextDependency = require("./ImportContextDependency");
const ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");

class ImportEagerContextDependency extends ImportContextDependency {
	constructor(request, recursive, regExp, range, valueRange, chunkName) {
		super(request, recursive, regExp, range, valueRange, chunkName);
		this.async = "eager";
	}

	get type() {
		return "import() context eager";
	}
}

ImportEagerContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = ImportEagerContextDependency;

}, function(modId) { var map = {"./ImportContextDependency":1602510872255,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872255, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ContextDependency = require("./ContextDependency");
const ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");

class ImportContextDependency extends ContextDependency {
	constructor(request, recursive, regExp, range, valueRange, chunkName) {
		super(request, recursive, regExp);
		this.range = range;
		this.valueRange = valueRange;
		this.chunkName = chunkName;
	}

	get type() {
		return "import() context";
	}

}

ImportContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = ImportContextDependency;

}, function(modId) { var map = {"./ContextDependency":1602510872221,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872256, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ImportContextDependency = require("./ImportContextDependency");
const ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");

class ImportWeakContextDependency extends ImportContextDependency {
	constructor(request, recursive, regExp, range, valueRange, chunkName) {
		super(request, recursive, regExp, range, valueRange, chunkName);
		this.async = "async-weak";
	}

	get type() {
		return "import() context weak";
	}
}

ImportWeakContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = ImportWeakContextDependency;

}, function(modId) { var map = {"./ImportContextDependency":1602510872255,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872257, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ImportContextDependency = require("./ImportContextDependency");
const ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");

class ImportLazyOnceContextDependency extends ImportContextDependency {
	constructor(request, recursive, regExp, range, valueRange, chunkName) {
		super(request, recursive, regExp, range, valueRange, chunkName);
		this.async = "lazy-once";
	}

	get type() {
		return "import() context lazy-once";
	}
}

ImportLazyOnceContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = ImportLazyOnceContextDependency;

}, function(modId) { var map = {"./ImportContextDependency":1602510872255,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872258, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ImportContextDependency = require("./ImportContextDependency");
const ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");

class ImportLazyContextDependency extends ImportContextDependency {
	constructor(request, recursive, regExp, range, valueRange, chunkName) {
		super(request, recursive, regExp, range, valueRange, chunkName);
		this.async = "lazy";
	}

	get type() {
		return "import() context lazy";
	}
}

ImportLazyContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = ImportLazyContextDependency;

}, function(modId) { var map = {"./ImportContextDependency":1602510872255,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872259, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ImportEagerContextDependency = require("./ImportEagerContextDependency");
const ImportWeakDependency = require("./ImportWeakDependency");
const ImportWeakContextDependency = require("./ImportWeakContextDependency");
const ImportLazyOnceContextDependency = require("./ImportLazyOnceContextDependency");
const ImportLazyContextDependency = require("./ImportLazyContextDependency");
const ImportDependenciesBlock = require("./ImportDependenciesBlock");
const ImportEagerDependency = require("./ImportEagerDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const UnsupportedFeatureWarning = require("../UnsupportedFeatureWarning");

class ImportParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		const options = this.options;

		parser.plugin(["call System.import", "import-call"], (expr) => {
			if(expr.arguments.length !== 1)
				throw new Error("Incorrect number of arguments provided to 'import(module: string) -> Promise'.");

			const param = parser.evaluateExpression(expr.arguments[0]);

			let chunkName = null;
			let mode = "lazy";

			const importOptions = parser.getCommentOptions(expr.range);
			if(importOptions) {
				if(typeof importOptions.webpackChunkName !== "undefined") {
					if(typeof importOptions.webpackChunkName !== "string")
						parser.state.module.warnings.push(new UnsupportedFeatureWarning(parser.state.module, `\`webpackChunkName\` expected a string, but received: ${importOptions.webpackChunkName}.`));
					else
						chunkName = importOptions.webpackChunkName;
				}
				if(typeof importOptions.webpackMode !== "undefined") {
					if(typeof importOptions.webpackMode !== "string")
						parser.state.module.warnings.push(new UnsupportedFeatureWarning(parser.state.module, `\`webpackMode\` expected a string, but received: ${importOptions.webpackMode}.`));
					else
						mode = importOptions.webpackMode;
				}
			}

			if(param.isString()) {
				if(mode !== "lazy" && mode !== "eager" && mode !== "weak") {
					parser.state.module.warnings.push(new UnsupportedFeatureWarning(parser.state.module, `\`webpackMode\` expected 'lazy', 'eager' or 'weak', but received: ${mode}.`));
				}

				if(mode === "eager") {
					const dep = new ImportEagerDependency(param.string, expr.range);
					parser.state.current.addDependency(dep);
				} else if(mode === "weak") {
					const dep = new ImportWeakDependency(param.string, expr.range);
					parser.state.current.addDependency(dep);
				} else {
					const depBlock = new ImportDependenciesBlock(param.string, expr.range, chunkName, parser.state.module, expr.loc);
					parser.state.current.addBlock(depBlock);
				}
				return true;
			} else {
				if(mode !== "lazy" && mode !== "lazy-once" && mode !== "eager" && mode !== "weak") {
					parser.state.module.warnings.push(new UnsupportedFeatureWarning(parser.state.module, `\`webpackMode\` expected 'lazy', 'lazy-once', 'eager' or 'weak', but received: ${mode}.`));
				}

				let Dep = ImportLazyContextDependency;
				if(mode === "eager") {
					Dep = ImportEagerContextDependency;
				} else if(mode === "weak") {
					Dep = ImportWeakContextDependency;
				} else if(mode === "lazy-once") {
					Dep = ImportLazyOnceContextDependency;
				}
				const dep = ContextDependencyHelpers.create(Dep, expr.range, param, expr, options, chunkName);
				if(!dep) return;
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
	}
}
module.exports = ImportParserPlugin;

}, function(modId) { var map = {"./ImportEagerContextDependency":1602510872254,"./ImportWeakDependency":1602510872253,"./ImportWeakContextDependency":1602510872256,"./ImportLazyOnceContextDependency":1602510872257,"./ImportLazyContextDependency":1602510872258,"./ImportDependenciesBlock":1602510872260,"./ImportEagerDependency":1602510872252,"./ContextDependencyHelpers":1602510872230,"../UnsupportedFeatureWarning":1602510872204}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872260, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const AsyncDependenciesBlock = require("../AsyncDependenciesBlock");
const ImportDependency = require("./ImportDependency");

module.exports = class ImportDependenciesBlock extends AsyncDependenciesBlock {
	constructor(request, range, chunkName, module, loc) {
		super(chunkName, module, loc);
		this.range = range;
		const dep = new ImportDependency(request, this);
		dep.loc = loc;
		this.addDependency(dep);
	}
};

}, function(modId) { var map = {"../AsyncDependenciesBlock":1602510872169,"./ImportDependency":1602510872251}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872261, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const AMDRequireDependency = require("./AMDRequireDependency");
const AMDRequireItemDependency = require("./AMDRequireItemDependency");
const AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
const AMDRequireContextDependency = require("./AMDRequireContextDependency");
const AMDDefineDependency = require("./AMDDefineDependency");
const UnsupportedDependency = require("./UnsupportedDependency");
const LocalModuleDependency = require("./LocalModuleDependency");

const NullFactory = require("../NullFactory");

const AMDRequireDependenciesBlockParserPlugin = require("./AMDRequireDependenciesBlockParserPlugin");
const AMDDefineDependencyParserPlugin = require("./AMDDefineDependencyParserPlugin");

const AliasPlugin = require("enhanced-resolve/lib/AliasPlugin");

const ParserHelpers = require("../ParserHelpers");

class AMDPlugin {
	constructor(options, amdOptions) {
		this.amdOptions = amdOptions;
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		const amdOptions = this.amdOptions;
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;
			const contextModuleFactory = params.contextModuleFactory;

			compilation.dependencyFactories.set(AMDRequireDependency, new NullFactory());
			compilation.dependencyTemplates.set(AMDRequireDependency, new AMDRequireDependency.Template());

			compilation.dependencyFactories.set(AMDRequireItemDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(AMDRequireItemDependency, new AMDRequireItemDependency.Template());

			compilation.dependencyFactories.set(AMDRequireArrayDependency, new NullFactory());
			compilation.dependencyTemplates.set(AMDRequireArrayDependency, new AMDRequireArrayDependency.Template());

			compilation.dependencyFactories.set(AMDRequireContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(AMDRequireContextDependency, new AMDRequireContextDependency.Template());

			compilation.dependencyFactories.set(AMDDefineDependency, new NullFactory());
			compilation.dependencyTemplates.set(AMDDefineDependency, new AMDDefineDependency.Template());

			compilation.dependencyFactories.set(UnsupportedDependency, new NullFactory());
			compilation.dependencyTemplates.set(UnsupportedDependency, new UnsupportedDependency.Template());

			compilation.dependencyFactories.set(LocalModuleDependency, new NullFactory());
			compilation.dependencyTemplates.set(LocalModuleDependency, new LocalModuleDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.amd !== "undefined" && !parserOptions.amd)
					return;

				function setExpressionToModule(outerExpr, module) {
					parser.plugin("expression " + outerExpr, (expr) => {
						const dep = new AMDRequireItemDependency(module, expr.range);
						dep.userRequest = outerExpr;
						dep.loc = expr.loc;
						parser.state.current.addDependency(dep);
						return true;
					});
				}

				parser.apply(
					new AMDRequireDependenciesBlockParserPlugin(options),
					new AMDDefineDependencyParserPlugin(options)
				);
				setExpressionToModule("require.amd", "!!webpack amd options");
				setExpressionToModule("define.amd", "!!webpack amd options");
				setExpressionToModule("define", "!!webpack amd define");
				parser.plugin("expression __webpack_amd_options__", () =>
					parser.state.current.addVariable("__webpack_amd_options__", JSON.stringify(amdOptions)));
				parser.plugin("evaluate typeof define.amd", ParserHelpers.evaluateToString(typeof amdOptions));
				parser.plugin("evaluate typeof require.amd", ParserHelpers.evaluateToString(typeof amdOptions));
				parser.plugin("evaluate Identifier define.amd", ParserHelpers.evaluateToIdentifier("define.amd", true));
				parser.plugin("evaluate Identifier require.amd", ParserHelpers.evaluateToIdentifier("require.amd", true));
				parser.plugin("typeof define", ParserHelpers.toConstantDependency(JSON.stringify("function")));
				parser.plugin("evaluate typeof define", ParserHelpers.evaluateToString("function"));
				parser.plugin("can-rename define", ParserHelpers.approve);
				parser.plugin("rename define", (expr) => {
					const dep = new AMDRequireItemDependency("!!webpack amd define", expr.range);
					dep.userRequest = "define";
					dep.loc = expr.loc;
					parser.state.current.addDependency(dep);
					return false;
				});
				parser.plugin("typeof require", ParserHelpers.toConstantDependency(JSON.stringify("function")));
				parser.plugin("evaluate typeof require", ParserHelpers.evaluateToString("function"));
			});
		});
		compiler.plugin("after-resolvers", () => {
			compiler.resolvers.normal.apply(
				new AliasPlugin("described-resolve", {
					name: "amdefine",
					alias: path.join(__dirname, "..", "..", "buildin", "amd-define.js")
				}, "resolve"),
				new AliasPlugin("described-resolve", {
					name: "webpack amd options",
					alias: path.join(__dirname, "..", "..", "buildin", "amd-options.js")
				}, "resolve"),
				new AliasPlugin("described-resolve", {
					name: "webpack amd define",
					alias: path.join(__dirname, "..", "..", "buildin", "amd-define.js")
				}, "resolve")
			);
		});
	}
}
module.exports = AMDPlugin;

}, function(modId) { var map = {"./AMDRequireDependency":1602510872262,"./AMDRequireItemDependency":1602510872263,"./AMDRequireArrayDependency":1602510872265,"./AMDRequireContextDependency":1602510872266,"./AMDDefineDependency":1602510872267,"./UnsupportedDependency":1602510872268,"./LocalModuleDependency":1602510872232,"../NullFactory":1602510872205,"./AMDRequireDependenciesBlockParserPlugin":1602510872269,"./AMDDefineDependencyParserPlugin":1602510872272,"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872262, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");
const DepBlockHelpers = require("./DepBlockHelpers");

class AMDRequireDependency extends NullDependency {
	constructor(block) {
		super();
		this.block = block;
	}
}

AMDRequireDependency.Template = class AMDRequireDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const depBlock = dep.block;
		const wrapper = DepBlockHelpers.getLoadDepBlockWrapper(depBlock, outputOptions, requestShortener, "require");

		// has array range but no function range
		if(depBlock.arrayRange && !depBlock.functionRange) {
			const startBlock = wrapper[0] + "function() {";
			const endBlock = `;}${wrapper[1]}__webpack_require__.oe${wrapper[2]}`;
			source.replace(depBlock.outerRange[0], depBlock.arrayRange[0] - 1, startBlock);
			source.replace(depBlock.arrayRange[1], depBlock.outerRange[1] - 1, endBlock);
			return;
		}

		// has function range but no array range
		if(depBlock.functionRange && !depBlock.arrayRange) {
			const startBlock = wrapper[0] + "function() {(";
			const endBlock = `.call(exports, __webpack_require__, exports, module));}${wrapper[1]}__webpack_require__.oe${wrapper[2]}`;
			source.replace(depBlock.outerRange[0], depBlock.functionRange[0] - 1, startBlock);
			source.replace(depBlock.functionRange[1], depBlock.outerRange[1] - 1, endBlock);
			return;
		}

		// has array range, function range, and errorCallbackRange
		if(depBlock.arrayRange && depBlock.functionRange && depBlock.errorCallbackRange) {
			const startBlock = wrapper[0] + "function() { ";
			const errorRangeBlock = `}${depBlock.functionBindThis ? ".bind(this)" : ""}${wrapper[1]}`;
			const endBlock = `${depBlock.errorCallbackBindThis ? ".bind(this)" : ""}${wrapper[2]}`;

			source.replace(depBlock.outerRange[0], depBlock.arrayRange[0] - 1, startBlock);
			source.insert(depBlock.arrayRange[0] + 0.9, "var __WEBPACK_AMD_REQUIRE_ARRAY__ = ");
			source.replace(depBlock.arrayRange[1], depBlock.functionRange[0] - 1, "; ((");
			source.insert(depBlock.functionRange[1], ").apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));");
			source.replace(depBlock.functionRange[1], depBlock.errorCallbackRange[0] - 1, errorRangeBlock);
			source.replace(depBlock.errorCallbackRange[1], depBlock.outerRange[1] - 1, endBlock);
			return;
		}

		// has array range, function range, but no errorCallbackRange
		if(depBlock.arrayRange && depBlock.functionRange) {
			const startBlock = wrapper[0] + "function() { ";
			const endBlock = `}${depBlock.functionBindThis ? ".bind(this)" : ""}${wrapper[1]}__webpack_require__.oe${wrapper[2]}`;
			source.replace(depBlock.outerRange[0], depBlock.arrayRange[0] - 1, startBlock);
			source.insert(depBlock.arrayRange[0] + 0.9, "var __WEBPACK_AMD_REQUIRE_ARRAY__ = ");
			source.replace(depBlock.arrayRange[1], depBlock.functionRange[0] - 1, "; ((");
			source.insert(depBlock.functionRange[1], ").apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));");
			source.replace(depBlock.functionRange[1], depBlock.outerRange[1] - 1, endBlock);
		}
	}
};

module.exports = AMDRequireDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202,"./DepBlockHelpers":1602510872170}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872263, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyTemplateAsRequireId = require("./ModuleDependencyTemplateAsRequireId");

class AMDRequireItemDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
	}

	get type() {
		return "amd require";
	}
}

AMDRequireItemDependency.Template = ModuleDependencyTemplateAsRequireId;

module.exports = AMDRequireItemDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./ModuleDependencyTemplateAsRequireId":1602510872264}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872264, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class ModuleDependencyTemplateAsRequireId {

	apply(dep, source, outputOptions, requestShortener) {
		if(!dep.range) return;
		const comment = outputOptions.pathinfo ?
			`/*! ${requestShortener.shorten(dep.request)} */ ` : "";
		let content;
		if(dep.module)
			content = `__webpack_require__(${comment}${JSON.stringify(dep.module.id)})`;
		else
			content = require("./WebpackMissingModule").module(dep.request);
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}
}
module.exports = ModuleDependencyTemplateAsRequireId;

}, function(modId) { var map = {"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872265, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = require("../Dependency");
const webpackMissingModuleModule = require("./WebpackMissingModule").module;

class AMDRequireArrayDependency extends Dependency {
	constructor(depsArray, range) {
		super();
		this.depsArray = depsArray;
		this.range = range;
	}

	get type() {
		return "amd require array";
	}
}

AMDRequireArrayDependency.Template = class AMDRequireArrayDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const content = this.getContent(dep, outputOptions, requestShortener);
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}

	getContent(dep, outputOptions, requestShortener) {
		const requires = dep.depsArray.map((dependency) => {
			const optionalComment = this.optionalComment(outputOptions.pathinfo, requestShortener.shorten(dependency.request));
			return this.contentForDependency(dependency, optionalComment);
		});
		return `[${requires.join(", ")}]`;
	}

	optionalComment(pathInfo, shortenedRequest) {
		if(!pathInfo) {
			return "";
		}
		return `/*! ${shortenedRequest} */ `;
	}

	contentForDependency(dep, comment) {
		if(typeof dep === "string") {
			return dep;
		}

		if(dep.module) {
			const stringifiedId = JSON.stringify(dep.module.id);
			return `__webpack_require__(${comment}${stringifiedId})`;
		} else if(dep.localModule) {
			return dep.localModule.variableName();
		}

		return webpackMissingModuleModule(dep.request);
	}
};

module.exports = AMDRequireArrayDependency;

}, function(modId) { var map = {"../Dependency":1602510872145,"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872266, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ContextDependency = require("./ContextDependency");
class AMDRequireContextDependency extends ContextDependency {
	constructor(request, recursive, regExp, range, valueRange) {
		super(request, recursive, regExp);
		this.range = range;
		this.valueRange = valueRange;
	}

	get type() {
		return "amd require context";
	}
}
AMDRequireContextDependency.Template = require("./ContextDependencyTemplateAsRequireCall");
module.exports = AMDRequireContextDependency;

}, function(modId) { var map = {"./ContextDependency":1602510872221,"./ContextDependencyTemplateAsRequireCall":1602510872223}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872267, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class AMDDefineDependency extends NullDependency {
	constructor(range, arrayRange, functionRange, objectRange, namedModule) {
		super();
		this.range = range;
		this.arrayRange = arrayRange;
		this.functionRange = functionRange;
		this.objectRange = objectRange;
		this.namedModule = namedModule;
	}

	get type() {
		return "amd define";
	}
}

AMDDefineDependency.Template = class AMDDefineDependencyTemplate {
	get definitions() {
		return {
			f: [
				"var __WEBPACK_AMD_DEFINE_RESULT__;",
				`!(__WEBPACK_AMD_DEFINE_RESULT__ = (#).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))`
			],
			o: [
				"",
				"!(module.exports = #)"
			],
			of: [
				"var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;",
				`!(__WEBPACK_AMD_DEFINE_FACTORY__ = (#),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))`
			],
			af: [
				"var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;",
				`!(__WEBPACK_AMD_DEFINE_ARRAY__ = #, __WEBPACK_AMD_DEFINE_RESULT__ = (#).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))`
			],
			ao: [
				"",
				"!(#, module.exports = #)"
			],
			aof: [
				"var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;",
				`!(__WEBPACK_AMD_DEFINE_ARRAY__ = #, __WEBPACK_AMD_DEFINE_FACTORY__ = (#),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))`
			],
			lf: [
				"var XXX, XXXmodule;",
				"!(XXXmodule = { id: YYY, exports: {}, loaded: false }, XXX = #.call(XXXmodule.exports, __webpack_require__, XXXmodule.exports, XXXmodule), XXXmodule.loaded = true, XXX === undefined && (XXX = XXXmodule.exports))"
			],
			lo: [
				"var XXX;",
				"!(XXX = #)"
			],
			lof: [
				"var XXX, XXXfactory, XXXmodule;",
				"!(XXXfactory = (#), (XXXmodule = { id: YYY, exports: {}, loaded: false }), XXX = (typeof XXXfactory === 'function' ? (XXXfactory.call(XXXmodule.exports, __webpack_require__, XXXmodule.exports, XXXmodule)) : XXXfactory), (XXXmodule.loaded = true), XXX === undefined && (XXX = XXXmodule.exports))"
			],
			laf: [
				"var __WEBPACK_AMD_DEFINE_ARRAY__, XXX;",
				"!(__WEBPACK_AMD_DEFINE_ARRAY__ = #, XXX = ((#).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)))"
			],
			lao: [
				"var XXX;",
				"!(#, XXX = #)"
			],
			laof: [
				"var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_FACTORY__, XXX;",
				`!(__WEBPACK_AMD_DEFINE_ARRAY__ = #, __WEBPACK_AMD_DEFINE_FACTORY__ = (#),
				XXX = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__))`
			]
		};
	}

	apply(dependency, source) {
		const branch = this.branch(dependency);
		const defAndText = this.definitions[branch];
		const definitions = defAndText[0];
		const text = defAndText[1];
		this.replace(dependency, source, definitions, text);
	}

	localModuleVar(dependency) {
		return dependency.localModule && dependency.localModule.used && dependency.localModule.variableName();
	}

	branch(dependency) {
		const localModuleVar = this.localModuleVar(dependency) ? "l" : "";
		const arrayRange = dependency.arrayRange ? "a" : "";
		const objectRange = dependency.objectRange ? "o" : "";
		const functionRange = dependency.functionRange ? "f" : "";
		return localModuleVar + arrayRange + objectRange + functionRange;
	}

	replace(dependency, source, definition, text) {
		const localModuleVar = this.localModuleVar(dependency);
		if(localModuleVar) {
			text = text.replace(/XXX/g, localModuleVar.replace(/\$/g, "$$$$"));
			definition = definition.replace(/XXX/g, localModuleVar.replace(/\$/g, "$$$$"));
		}

		if(dependency.namedModule) {
			text = text.replace(/YYY/g, JSON.stringify(dependency.namedModule));
		}

		const texts = text.split("#");

		if(definition) source.insert(0, definition);

		let current = dependency.range[0];
		if(dependency.arrayRange) {
			source.replace(current, dependency.arrayRange[0] - 1, texts.shift());
			current = dependency.arrayRange[1];
		}

		if(dependency.objectRange) {
			source.replace(current, dependency.objectRange[0] - 1, texts.shift());
			current = dependency.objectRange[1];
		} else if(dependency.functionRange) {
			source.replace(current, dependency.functionRange[0] - 1, texts.shift());
			current = dependency.functionRange[1];
		}
		source.replace(current, dependency.range[1] - 1, texts.shift());
		if(texts.length > 0)
			throw new Error("Implementation error");
	}
};

module.exports = AMDDefineDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872268, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");
const webpackMissingModule = require("./WebpackMissingModule").module;

class UnsupportedDependency extends NullDependency {
	constructor(request, range) {
		super();
		this.request = request;
		this.range = range;
	}
}

UnsupportedDependency.Template = class UnsupportedDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		source.replace(dep.range[0], dep.range[1], webpackMissingModule(dep.request));
	}
};

module.exports = UnsupportedDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202,"./WebpackMissingModule":1602510872219}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872269, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const AMDRequireItemDependency = require("./AMDRequireItemDependency");
const AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
const AMDRequireContextDependency = require("./AMDRequireContextDependency");
const AMDRequireDependenciesBlock = require("./AMDRequireDependenciesBlock");
const UnsupportedDependency = require("./UnsupportedDependency");
const LocalModuleDependency = require("./LocalModuleDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const LocalModulesHelpers = require("./LocalModulesHelpers");
const ConstDependency = require("./ConstDependency");
const getFunctionExpression = require("./getFunctionExpression");
const UnsupportedFeatureWarning = require("../UnsupportedFeatureWarning");

class AMDRequireDependenciesBlockParserPlugin {
	constructor(options) {
		this.options = options;
	}

	processFunctionArgument(parser, expression) {
		let bindThis = true;
		const fnData = getFunctionExpression(expression);
		if(fnData) {
			parser.inScope(fnData.fn.params.filter((i) => {
				return ["require", "module", "exports"].indexOf(i.name) < 0;
			}), () => {
				if(fnData.fn.body.type === "BlockStatement")
					parser.walkStatement(fnData.fn.body);
				else
					parser.walkExpression(fnData.fn.body);
			});
			parser.walkExpressions(fnData.expressions);
			if(fnData.needThis === false) {
				bindThis = false;
			}
		} else {
			parser.walkExpression(expression);
		}
		return bindThis;
	}

	apply(parser) {
		const options = this.options;
		parser.plugin("call require", (expr) => {
			let param;
			let dep;
			let result;

			const old = parser.state.current;

			if(expr.arguments.length >= 1) {
				param = parser.evaluateExpression(expr.arguments[0]);
				dep = new AMDRequireDependenciesBlock(
					expr,
					param.range,
					(expr.arguments.length > 1) ? expr.arguments[1].range : null,
					(expr.arguments.length > 2) ? expr.arguments[2].range : null,
					parser.state.module,
					expr.loc
				);
				parser.state.current = dep;
			}

			if(expr.arguments.length === 1) {
				parser.inScope([], () => {
					result = parser.applyPluginsBailResult("call require:amd:array", expr, param);
				});
				parser.state.current = old;
				if(!result) return;
				parser.state.current.addBlock(dep);
				return true;
			}

			if(expr.arguments.length === 2 || expr.arguments.length === 3) {
				try {
					parser.inScope([], () => {
						result = parser.applyPluginsBailResult("call require:amd:array", expr, param);
					});
					if(!result) {
						dep = new UnsupportedDependency("unsupported", expr.range);
						old.addDependency(dep);
						if(parser.state.module)
							parser.state.module.errors.push(new UnsupportedFeatureWarning(parser.state.module, "Cannot statically analyse 'require(..., ...)' in line " + expr.loc.start.line));
						dep = null;
						return true;
					}
					dep.functionBindThis = this.processFunctionArgument(parser, expr.arguments[1]);
					if(expr.arguments.length === 3) {
						dep.errorCallbackBindThis = this.processFunctionArgument(parser, expr.arguments[2]);
					}
				} finally {
					parser.state.current = old;
					if(dep)
						parser.state.current.addBlock(dep);
				}
				return true;
			}
		});
		parser.plugin("call require:amd:array", (expr, param) => {
			if(param.isArray()) {
				param.items.forEach((param) => {
					const result = parser.applyPluginsBailResult("call require:amd:item", expr, param);
					if(result === undefined) {
						parser.applyPluginsBailResult("call require:amd:context", expr, param);
					}
				});
				return true;
			} else if(param.isConstArray()) {
				const deps = [];
				param.array.forEach((request) => {
					let dep, localModule;
					if(request === "require") {
						dep = "__webpack_require__";
					} else if(["exports", "module"].indexOf(request) >= 0) {
						dep = request;
					} else if(localModule = LocalModulesHelpers.getLocalModule(parser.state, request)) { // eslint-disable-line no-cond-assign
						dep = new LocalModuleDependency(localModule);
						dep.loc = expr.loc;
						parser.state.current.addDependency(dep);
					} else {
						dep = new AMDRequireItemDependency(request);
						dep.loc = expr.loc;
						dep.optional = !!parser.scope.inTry;
						parser.state.current.addDependency(dep);
					}
					deps.push(dep);
				});
				const dep = new AMDRequireArrayDependency(deps, param.range);
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call require:amd:item", (expr, param) => {
			if(param.isConditional()) {
				param.options.forEach((param) => {
					const result = parser.applyPluginsBailResult("call require:amd:item", expr, param);
					if(result === undefined) {
						parser.applyPluginsBailResult("call require:amd:context", expr, param);
					}
				});
				return true;
			} else if(param.isString()) {
				let dep, localModule;
				if(param.string === "require") {
					dep = new ConstDependency("__webpack_require__", param.string);
				} else if(param.string === "module") {
					dep = new ConstDependency(parser.state.module.moduleArgument || "module", param.range);
				} else if(param.string === "exports") {
					dep = new ConstDependency(parser.state.module.exportsArgument || "exports", param.range);
				} else if(localModule = LocalModulesHelpers.getLocalModule(parser.state, param.string)) { // eslint-disable-line no-cond-assign
					dep = new LocalModuleDependency(localModule, param.range);
				} else {
					dep = new AMDRequireItemDependency(param.string, param.range);
				}
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call require:amd:context", (expr, param) => {
			const dep = ContextDependencyHelpers.create(AMDRequireContextDependency, param.range, param, expr, options);
			if(!dep) return;
			dep.loc = expr.loc;
			dep.optional = !!parser.scope.inTry;
			parser.state.current.addDependency(dep);
			return true;
		});
	}
}
module.exports = AMDRequireDependenciesBlockParserPlugin;

}, function(modId) { var map = {"./AMDRequireItemDependency":1602510872263,"./AMDRequireArrayDependency":1602510872265,"./AMDRequireContextDependency":1602510872266,"./AMDRequireDependenciesBlock":1602510872270,"./UnsupportedDependency":1602510872268,"./LocalModuleDependency":1602510872232,"./ContextDependencyHelpers":1602510872230,"./LocalModulesHelpers":1602510872233,"./ConstDependency":1602510872201,"./getFunctionExpression":1602510872271,"../UnsupportedFeatureWarning":1602510872204}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872270, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const AsyncDependenciesBlock = require("../AsyncDependenciesBlock");
const AMDRequireDependency = require("./AMDRequireDependency");

module.exports = class AMDRequireDependenciesBlock extends AsyncDependenciesBlock {
	constructor(expr, arrayRange, functionRange, errorCallbackRange, module, loc) {
		super(null, module, loc);
		this.expr = expr;
		this.outerRange = expr.range;
		this.arrayRange = arrayRange;
		this.functionRange = functionRange;
		this.errorCallbackRange = errorCallbackRange;
		this.bindThis = true;
		if(arrayRange && functionRange && errorCallbackRange) {
			this.range = [arrayRange[0], errorCallbackRange[1]];
		} else if(arrayRange && functionRange) {
			this.range = [arrayRange[0], functionRange[1]];
		} else if(arrayRange) {
			this.range = arrayRange;
		} else if(functionRange) {
			this.range = functionRange;
		} else {
			this.range = expr.range;
		}
		const dep = new AMDRequireDependency(this);
		dep.loc = loc;
		this.addDependency(dep);
	}
};

}, function(modId) { var map = {"../AsyncDependenciesBlock":1602510872169,"./AMDRequireDependency":1602510872262}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872271, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(expr) {
	// <FunctionExpression>
	if(expr.type === "FunctionExpression" || expr.type === "ArrowFunctionExpression") {
		return {
			fn: expr,
			expressions: [],
			needThis: false
		};
	}

	// <FunctionExpression>.bind(<Expression>)
	if(expr.type === "CallExpression" &&
		expr.callee.type === "MemberExpression" &&
		expr.callee.object.type === "FunctionExpression" &&
		expr.callee.property.type === "Identifier" &&
		expr.callee.property.name === "bind" &&
		expr.arguments.length === 1) {
		return {
			fn: expr.callee.object,
			expressions: [expr.arguments[0]]
		};
	}
	// (function(_this) {return <FunctionExpression>})(this) (Coffeescript)
	if(expr.type === "CallExpression" &&
		expr.callee.type === "FunctionExpression" &&
		expr.callee.body.type === "BlockStatement" &&
		expr.arguments.length === 1 &&
		expr.arguments[0].type === "ThisExpression" &&
		expr.callee.body.body &&
		expr.callee.body.body.length === 1 &&
		expr.callee.body.body[0].type === "ReturnStatement" &&
		expr.callee.body.body[0].argument &&
		expr.callee.body.body[0].argument.type === "FunctionExpression") {
		return {
			fn: expr.callee.body.body[0].argument,
			expressions: [],
			needThis: true
		};
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872272, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const AMDRequireItemDependency = require("./AMDRequireItemDependency");
const AMDRequireContextDependency = require("./AMDRequireContextDependency");
const ConstDependency = require("./ConstDependency");
const AMDDefineDependency = require("./AMDDefineDependency");
const AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
const LocalModuleDependency = require("./LocalModuleDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const LocalModulesHelpers = require("./LocalModulesHelpers");

function isBoundFunctionExpression(expr) {
	if(expr.type !== "CallExpression") return false;
	if(expr.callee.type !== "MemberExpression") return false;
	if(expr.callee.computed) return false;
	if(expr.callee.object.type !== "FunctionExpression") return false;
	if(expr.callee.property.type !== "Identifier") return false;
	if(expr.callee.property.name !== "bind") return false;
	return true;
}

function isUnboundFunctionExpression(expr) {
	if(expr.type === "FunctionExpression") return true;
	if(expr.type === "ArrowFunctionExpression") return true;
	return false;
}

function isCallable(expr) {
	if(isUnboundFunctionExpression(expr)) return true;
	if(isBoundFunctionExpression(expr)) return true;
	return false;
}

class AMDDefineDependencyParserPlugin {
	constructor(options) {
		this.options = options;
	}

	newDefineDependency(range, arrayRange, functionRange, objectRange, namedModule) {
		return new AMDDefineDependency(range, arrayRange, functionRange, objectRange, namedModule);
	}

	apply(parser) {
		const options = this.options;
		parser.plugin("call define", (expr) => {
			let array, fn, obj, namedModule;
			switch(expr.arguments.length) {
				case 1:
					if(isCallable(expr.arguments[0])) {
						// define(f() {...})
						fn = expr.arguments[0];
					} else if(expr.arguments[0].type === "ObjectExpression") {
						// define({...})
						obj = expr.arguments[0];
					} else {
						// define(expr)
						// unclear if function or object
						obj = fn = expr.arguments[0];
					}
					break;
				case 2:
					if(expr.arguments[0].type === "Literal") {
						namedModule = expr.arguments[0].value;
						// define("...", ...)
						if(isCallable(expr.arguments[1])) {
							// define("...", f() {...})
							fn = expr.arguments[1];
						} else if(expr.arguments[1].type === "ObjectExpression") {
							// define("...", {...})
							obj = expr.arguments[1];
						} else {
							// define("...", expr)
							// unclear if function or object
							obj = fn = expr.arguments[1];
						}
					} else {
						array = expr.arguments[0];
						if(isCallable(expr.arguments[1])) {
							// define([...], f() {})
							fn = expr.arguments[1];
						} else if(expr.arguments[1].type === "ObjectExpression") {
							// define([...], {...})
							obj = expr.arguments[1];
						} else {
							// define([...], expr)
							// unclear if function or object
							obj = fn = expr.arguments[1];
						}
					}
					break;
				case 3:
					// define("...", [...], f() {...})
					namedModule = expr.arguments[0].value;
					array = expr.arguments[1];
					if(isCallable(expr.arguments[2])) {
						// define("...", [...], f() {})
						fn = expr.arguments[2];
					} else if(expr.arguments[2].type === "ObjectExpression") {
						// define("...", [...], {...})
						obj = expr.arguments[2];
					} else {
						// define("...", [...], expr)
						// unclear if function or object
						obj = fn = expr.arguments[2];
					}
					break;
				default:
					return;
			}
			let fnParams = null;
			let fnParamsOffset = 0;
			if(fn) {
				if(isUnboundFunctionExpression(fn)) fnParams = fn.params;
				else if(isBoundFunctionExpression(fn)) {
					fnParams = fn.callee.object.params;
					fnParamsOffset = fn.arguments.length - 1;
					if(fnParamsOffset < 0) fnParamsOffset = 0;
				}
			}
			let fnRenames = Object.create(parser.scope.renames);
			let identifiers;
			if(array) {
				identifiers = {};
				const param = parser.evaluateExpression(array);
				const result = parser.applyPluginsBailResult("call define:amd:array", expr, param, identifiers, namedModule);
				if(!result) return;
				if(fnParams) fnParams = fnParams.slice(fnParamsOffset).filter((param, idx) => {
					if(identifiers[idx]) {
						fnRenames["$" + param.name] = identifiers[idx];
						return false;
					}
					return true;
				});
			} else {
				identifiers = ["require", "exports", "module"];
				if(fnParams) fnParams = fnParams.slice(fnParamsOffset).filter((param, idx) => {
					if(identifiers[idx]) {
						fnRenames["$" + param.name] = identifiers[idx];
						return false;
					}
					return true;
				});
			}
			let inTry;
			if(fn && isUnboundFunctionExpression(fn)) {
				inTry = parser.scope.inTry;
				parser.inScope(fnParams, () => {
					parser.scope.renames = fnRenames;
					parser.scope.inTry = inTry;
					if(fn.body.type === "BlockStatement")
						parser.walkStatement(fn.body);
					else
						parser.walkExpression(fn.body);
				});
			} else if(fn && isBoundFunctionExpression(fn)) {
				inTry = parser.scope.inTry;
				parser.inScope(fn.callee.object.params.filter((i) => ["require", "module", "exports"].indexOf(i.name) < 0), () => {
					parser.scope.renames = fnRenames;
					parser.scope.inTry = inTry;
					if(fn.callee.object.body.type === "BlockStatement")
						parser.walkStatement(fn.callee.object.body);
					else
						parser.walkExpression(fn.callee.object.body);
				});
				if(fn.arguments)
					parser.walkExpressions(fn.arguments);
			} else if(fn || obj) {
				parser.walkExpression(fn || obj);
			}

			const dep = this.newDefineDependency(
				expr.range,
				array ? array.range : null,
				fn ? fn.range : null,
				obj ? obj.range : null,
				namedModule ? namedModule : null
			);
			dep.loc = expr.loc;
			if(namedModule) {
				dep.localModule = LocalModulesHelpers.addLocalModule(parser.state, namedModule);
			}
			parser.state.current.addDependency(dep);
			return true;
		});
		parser.plugin("call define:amd:array", (expr, param, identifiers, namedModule) => {
			if(param.isArray()) {
				param.items.forEach((param, idx) => {
					if(param.isString() && ["require", "module", "exports"].indexOf(param.string) >= 0)
						identifiers[idx] = param.string;
					const result = parser.applyPluginsBailResult("call define:amd:item", expr, param, namedModule);
					if(result === undefined) {
						parser.applyPluginsBailResult("call define:amd:context", expr, param);
					}
				});
				return true;
			} else if(param.isConstArray()) {
				const deps = [];
				param.array.forEach((request, idx) => {
					let dep;
					let localModule;
					if(request === "require") {
						identifiers[idx] = request;
						dep = "__webpack_require__";
					} else if(["exports", "module"].indexOf(request) >= 0) {
						identifiers[idx] = request;
						dep = request;
					} else if(localModule = LocalModulesHelpers.getLocalModule(parser.state, request)) { // eslint-disable-line no-cond-assign
						dep = new LocalModuleDependency(localModule);
						dep.loc = expr.loc;
						parser.state.current.addDependency(dep);
					} else {
						dep = new AMDRequireItemDependency(request);
						dep.loc = expr.loc;
						dep.optional = !!parser.scope.inTry;
						parser.state.current.addDependency(dep);
					}
					deps.push(dep);
				});
				const dep = new AMDRequireArrayDependency(deps, param.range);
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call define:amd:item", (expr, param, namedModule) => {
			if(param.isConditional()) {
				param.options.forEach((param) => {
					const result = parser.applyPluginsBailResult("call define:amd:item", expr, param);
					if(result === undefined) {
						parser.applyPluginsBailResult("call define:amd:context", expr, param);
					}
				});
				return true;
			} else if(param.isString()) {
				let dep, localModule;
				if(param.string === "require") {
					dep = new ConstDependency("__webpack_require__", param.range);
				} else if(["require", "exports", "module"].indexOf(param.string) >= 0) {
					dep = new ConstDependency(param.string, param.range);
				} else if(localModule = LocalModulesHelpers.getLocalModule(parser.state, param.string, namedModule)) { // eslint-disable-line no-cond-assign
					dep = new LocalModuleDependency(localModule, param.range);
				} else {
					dep = new AMDRequireItemDependency(param.string, param.range);
				}
				dep.loc = expr.loc;
				dep.optional = !!parser.scope.inTry;
				parser.state.current.addDependency(dep);
				return true;
			}
		});
		parser.plugin("call define:amd:context", (expr, param) => {
			const dep = ContextDependencyHelpers.create(AMDRequireContextDependency, param.range, param, expr, options);
			if(!dep) return;
			dep.loc = expr.loc;
			dep.optional = !!parser.scope.inTry;
			parser.state.current.addDependency(dep);
			return true;
		});
	}
}
module.exports = AMDDefineDependencyParserPlugin;

}, function(modId) { var map = {"./AMDRequireItemDependency":1602510872263,"./AMDRequireContextDependency":1602510872266,"./ConstDependency":1602510872201,"./AMDDefineDependency":1602510872267,"./AMDRequireArrayDependency":1602510872265,"./LocalModuleDependency":1602510872232,"./ContextDependencyHelpers":1602510872230,"./LocalModulesHelpers":1602510872233}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872273, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireContextDependency = require("./RequireContextDependency");
const ContextElementDependency = require("./ContextElementDependency");

const RequireContextDependencyParserPlugin = require("./RequireContextDependencyParserPlugin");

class RequireContextPlugin {
	constructor(modulesDirectories, extensions, mainFiles) {
		if(!Array.isArray(modulesDirectories))
			throw new Error("modulesDirectories must be an array");
		if(!Array.isArray(extensions))
			throw new Error("extensions must be an array");
		this.modulesDirectories = modulesDirectories;
		this.extensions = extensions;
		this.mainFiles = mainFiles;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const contextModuleFactory = params.contextModuleFactory;
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(RequireContextDependency, contextModuleFactory);
			compilation.dependencyTemplates.set(RequireContextDependency, new RequireContextDependency.Template());

			compilation.dependencyFactories.set(ContextElementDependency, normalModuleFactory);

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.requireContext !== "undefined" && !parserOptions.requireContext)
					return;

				parser.apply(new RequireContextDependencyParserPlugin());
			});

			params.contextModuleFactory.plugin("alternatives", (items, callback) => {
				if(items.length === 0) return callback(null, items);

				callback(null, items.map((obj) => {
					return this.extensions.filter((ext) => {
						const l = obj.request.length;
						return l > ext.length && obj.request.substr(l - ext.length, l) === ext;
					}).map((ext) => {
						const l = obj.request.length;
						return {
							context: obj.context,
							request: obj.request.substr(0, l - ext.length)
						};
					}).concat(obj);
				}).reduce((a, b) => a.concat(b), []));
			});

			params.contextModuleFactory.plugin("alternatives", (items, callback) => {
				if(items.length === 0) return callback(null, items);

				callback(null, items.map((obj) => {
					return this.mainFiles.filter((mainFile) => {
						const l = obj.request.length;
						return l > mainFile.length + 1 && obj.request.substr(l - mainFile.length - 1, l) === "/" + mainFile;
					}).map((mainFile) => {
						const l = obj.request.length;
						return [{
							context: obj.context,
							request: obj.request.substr(0, l - mainFile.length)
						}, {
							context: obj.context,
							request: obj.request.substr(0, l - mainFile.length - 1)
						}];
					}).reduce((a, b) => a.concat(b), []).concat(obj);
				}).reduce((a, b) => a.concat(b), []));
			});

			params.contextModuleFactory.plugin("alternatives", (items, callback) => {
				if(items.length === 0) return callback(null, items);

				callback(null, items.map((obj) => {
					for(let i = 0; i < this.modulesDirectories.length; i++) {
						const dir = this.modulesDirectories[i];
						const idx = obj.request.indexOf("./" + dir + "/");
						if(idx === 0) {
							obj.request = obj.request.slice(dir.length + 3);
							break;
						}
					}
					return obj;
				}));
			});
		});
	}
}
module.exports = RequireContextPlugin;

}, function(modId) { var map = {"./RequireContextDependency":1602510872274,"./ContextElementDependency":1602510872171,"./RequireContextDependencyParserPlugin":1602510872275}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872274, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ContextDependency = require("./ContextDependency");
const ModuleDependencyTemplateAsRequireId = require("./ModuleDependencyTemplateAsRequireId");

class RequireContextDependency extends ContextDependency {
	constructor(request, recursive, regExp, asyncMode, range) {
		super(request, recursive, regExp);
		this.range = range;

		if(asyncMode) {
			this.async = asyncMode;
		}
	}

	get type() {
		return "require.context";
	}
}

RequireContextDependency.Template = ModuleDependencyTemplateAsRequireId;

module.exports = RequireContextDependency;

}, function(modId) { var map = {"./ContextDependency":1602510872221,"./ModuleDependencyTemplateAsRequireId":1602510872264}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872275, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireContextDependency = require("./RequireContextDependency");

module.exports = class RequireContextDependencyParserPlugin {
	apply(parser) {
		parser.plugin("call require.context", expr => {
			let regExp = /^\.\/.*$/;
			let recursive = true;
			let asyncMode;
			switch(expr.arguments.length) {
				case 4:
					{
						const asyncModeExpr = parser.evaluateExpression(expr.arguments[3]);
						if(!asyncModeExpr.isString()) return;
						asyncMode = asyncModeExpr.string;
					}
					// falls through
				case 3:
					{
						const regExpExpr = parser.evaluateExpression(expr.arguments[2]);
						if(!regExpExpr.isRegExp()) return;
						regExp = regExpExpr.regExp;
					}
					// falls through
				case 2:
					{
						const recursiveExpr = parser.evaluateExpression(expr.arguments[1]);
						if(!recursiveExpr.isBoolean()) return;
						recursive = recursiveExpr.bool;
					}
					// falls through
				case 1:
					{
						const requestExpr = parser.evaluateExpression(expr.arguments[0]);
						if(!requestExpr.isString()) return;
						const dep = new RequireContextDependency(requestExpr.string, recursive, regExp, asyncMode, expr.range);
						dep.loc = expr.loc;
						dep.optional = parser.scope.inTry;
						parser.state.current.addDependency(dep);
						return true;
					}
			}
		});
	}
};

}, function(modId) { var map = {"./RequireContextDependency":1602510872274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872276, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireEnsureItemDependency = require("./RequireEnsureItemDependency");
const RequireEnsureDependency = require("./RequireEnsureDependency");

const NullFactory = require("../NullFactory");

const RequireEnsureDependenciesBlockParserPlugin = require("./RequireEnsureDependenciesBlockParserPlugin");

const ParserHelpers = require("../ParserHelpers");

class RequireEnsurePlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(RequireEnsureItemDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(RequireEnsureItemDependency, new RequireEnsureItemDependency.Template());

			compilation.dependencyFactories.set(RequireEnsureDependency, new NullFactory());
			compilation.dependencyTemplates.set(RequireEnsureDependency, new RequireEnsureDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.requireEnsure !== "undefined" && !parserOptions.requireEnsure)
					return;

				parser.apply(new RequireEnsureDependenciesBlockParserPlugin());
				parser.plugin("evaluate typeof require.ensure", ParserHelpers.evaluateToString("function"));
				parser.plugin("typeof require.ensure", ParserHelpers.toConstantDependency(JSON.stringify("function")));
			});
		});
	}
}
module.exports = RequireEnsurePlugin;

}, function(modId) { var map = {"./RequireEnsureItemDependency":1602510872277,"./RequireEnsureDependency":1602510872278,"../NullFactory":1602510872205,"./RequireEnsureDependenciesBlockParserPlugin":1602510872279,"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872277, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const NullDependency = require("./NullDependency");

class RequireEnsureItemDependency extends ModuleDependency {
	constructor(request) {
		super(request);
	}

	get type() {
		return "require.ensure item";
	}
}

RequireEnsureItemDependency.Template = NullDependency.Template;

module.exports = RequireEnsureItemDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872278, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");
const DepBlockHelpers = require("./DepBlockHelpers");

class RequireEnsureDependency extends NullDependency {
	constructor(block) {
		super();
		this.block = block;
	}

	get type() {
		return "require.ensure";
	}
}

RequireEnsureDependency.Template = class RequireEnsureDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const depBlock = dep.block;
		const wrapper = DepBlockHelpers.getLoadDepBlockWrapper(depBlock, outputOptions, requestShortener, "require.ensure");
		const errorCallbackExists = depBlock.expr.arguments.length === 4 || (!depBlock.chunkName && depBlock.expr.arguments.length === 3);
		const startBlock = wrapper[0] + "(";
		const middleBlock = `).bind(null, __webpack_require__)${wrapper[1]}`;
		const endBlock = `${middleBlock}__webpack_require__.oe${wrapper[2]}`;
		source.replace(depBlock.expr.range[0], depBlock.expr.arguments[1].range[0] - 1, startBlock);
		if(errorCallbackExists) {
			source.replace(depBlock.expr.arguments[1].range[1], depBlock.expr.arguments[2].range[0] - 1, middleBlock);
			source.replace(depBlock.expr.arguments[2].range[1], depBlock.expr.range[1] - 1, wrapper[2]);
		} else {
			source.replace(depBlock.expr.arguments[1].range[1], depBlock.expr.range[1] - 1, endBlock);
		}
	}
};

module.exports = RequireEnsureDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202,"./DepBlockHelpers":1602510872170}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872279, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireEnsureDependenciesBlock = require("./RequireEnsureDependenciesBlock");
const RequireEnsureItemDependency = require("./RequireEnsureItemDependency");
const getFunctionExpression = require("./getFunctionExpression");

module.exports = class RequireEnsureDependenciesBlockParserPlugin {
	apply(parser) {
		parser.plugin("call require.ensure", expr => {
			let chunkName = null;
			let chunkNameRange = null;
			let errorExpressionArg = null;
			let errorExpression = null;
			switch(expr.arguments.length) {
				case 4:
					{
						const chunkNameExpr = parser.evaluateExpression(expr.arguments[3]);
						if(!chunkNameExpr.isString()) return;
						chunkNameRange = chunkNameExpr.range;
						chunkName = chunkNameExpr.string;
					}
					// falls through
				case 3:
					{
						errorExpressionArg = expr.arguments[2];
						errorExpression = getFunctionExpression(errorExpressionArg);

						if(!errorExpression && !chunkName) {
							const chunkNameExpr = parser.evaluateExpression(expr.arguments[2]);
							if(!chunkNameExpr.isString()) return;
							chunkNameRange = chunkNameExpr.range;
							chunkName = chunkNameExpr.string;
						}
					}
					// falls through
				case 2:
					{
						const dependenciesExpr = parser.evaluateExpression(expr.arguments[0]);
						const dependenciesItems = dependenciesExpr.isArray() ? dependenciesExpr.items : [dependenciesExpr];
						const successExpressionArg = expr.arguments[1];
						const successExpression = getFunctionExpression(successExpressionArg);

						if(successExpression) {
							parser.walkExpressions(successExpression.expressions);
						}
						if(errorExpression) {
							parser.walkExpressions(errorExpression.expressions);
						}

						const dep = new RequireEnsureDependenciesBlock(expr,
							successExpression ? successExpression.fn : successExpressionArg,
							errorExpression ? errorExpression.fn : errorExpressionArg,
							chunkName, chunkNameRange, parser.state.module, expr.loc);
						const old = parser.state.current;
						parser.state.current = dep;
						try {
							let failed = false;
							parser.inScope([], () => {
								dependenciesItems.forEach(ee => {
									if(ee.isString()) {
										const edep = new RequireEnsureItemDependency(ee.string, ee.range);
										edep.loc = dep.loc;
										dep.addDependency(edep);
									} else {
										failed = true;
									}
								});
							});
							if(failed) {
								return;
							}
							if(successExpression) {
								if(successExpression.fn.body.type === "BlockStatement")
									parser.walkStatement(successExpression.fn.body);
								else
									parser.walkExpression(successExpression.fn.body);
							}
							old.addBlock(dep);
						} finally {
							parser.state.current = old;
						}
						if(!successExpression) {
							parser.walkExpression(successExpressionArg);
						}
						if(errorExpression) {
							if(errorExpression.fn.body.type === "BlockStatement")
								parser.walkStatement(errorExpression.fn.body);
							else
								parser.walkExpression(errorExpression.fn.body);
						} else if(errorExpressionArg) {
							parser.walkExpression(errorExpressionArg);
						}
						return true;
					}
			}
		});
	}
};

}, function(modId) { var map = {"./RequireEnsureDependenciesBlock":1602510872280,"./RequireEnsureItemDependency":1602510872277,"./getFunctionExpression":1602510872271}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872280, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const AsyncDependenciesBlock = require("../AsyncDependenciesBlock");
const RequireEnsureDependency = require("./RequireEnsureDependency");

module.exports = class RequireEnsureDependenciesBlock extends AsyncDependenciesBlock {
	constructor(expr, successExpression, errorExpression, chunkName, chunkNameRange, module, loc) {
		super(chunkName, module, loc);
		this.expr = expr;
		const successBodyRange = successExpression && successExpression.body && successExpression.body.range;
		if(successBodyRange) {
			this.range = [successBodyRange[0] + 1, successBodyRange[1] - 1];
		}
		this.chunkNameRange = chunkNameRange;
		const dep = new RequireEnsureDependency(this);
		dep.loc = loc;
		this.addDependency(dep);
	}
};

}, function(modId) { var map = {"../AsyncDependenciesBlock":1602510872169,"./RequireEnsureDependency":1602510872278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872281, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireIncludeDependency = require("./RequireIncludeDependency");
const RequireIncludeDependencyParserPlugin = require("./RequireIncludeDependencyParserPlugin");

const ParserHelpers = require("../ParserHelpers");

class RequireIncludePlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(RequireIncludeDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(RequireIncludeDependency, new RequireIncludeDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

				if(typeof parserOptions.requireInclude !== "undefined" && !parserOptions.requireInclude)
					return;

				parser.apply(new RequireIncludeDependencyParserPlugin());
				parser.plugin("evaluate typeof require.include", ParserHelpers.evaluateToString("function"));
				parser.plugin("typeof require.include", ParserHelpers.toConstantDependency(JSON.stringify("function")));
			});
		});
	}
}
module.exports = RequireIncludePlugin;

}, function(modId) { var map = {"./RequireIncludeDependency":1602510872282,"./RequireIncludeDependencyParserPlugin":1602510872283,"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872282, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class RequireIncludeDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
	}

	getReference() {
		if(!this.module) return null;
		return {
			module: this.module,
			importedNames: [] // This doesn't use any export
		};
	}

	get type() {
		return "require.include";
	}
}

RequireIncludeDependency.Template = class RequireIncludeDependencyTemplate {
	apply(dep, source, outputOptions, requestShortener) {
		const comment = this.getOptionalComment(outputOptions.pathinfo && dep.module, requestShortener.shorten(dep.request));
		source.replace(dep.range[0], dep.range[1] - 1, `undefined${comment}`);
	}

	getOptionalComment(shouldHaveComment, shortenedRequest) {
		if(shouldHaveComment) {
			return "";
		}
		return `/*! require.include ${shortenedRequest} */`;
	}
};

module.exports = RequireIncludeDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872283, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const RequireIncludeDependency = require("./RequireIncludeDependency");

module.exports = class RequireIncludeDependencyParserPlugin {
	apply(parser) {
		parser.plugin("call require.include", expr => {
			if(expr.arguments.length !== 1) return;
			const param = parser.evaluateExpression(expr.arguments[0]);
			if(!param.isString()) return;
			const dep = new RequireIncludeDependency(param.string, expr.range);
			dep.loc = expr.loc;
			parser.state.current.addDependency(dep);
			return true;
		});
	}
};

}, function(modId) { var map = {"./RequireIncludeDependency":1602510872282}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872284, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class EnsureChunkConditionsPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			const triesMap = new Map();
			compilation.plugin(["optimize-chunks-basic", "optimize-extracted-chunks-basic"], (chunks) => {
				let changed = false;
				chunks.forEach((chunk) => {
					chunk.forEachModule((module) => {
						if(!module.chunkCondition) return;
						if(!module.chunkCondition(chunk)) {
							let usedChunks = triesMap.get(module);
							if(!usedChunks) triesMap.set(module, usedChunks = new Set());
							usedChunks.add(chunk);
							const newChunks = [];
							chunk.parents.forEach((parent) => {
								if(!usedChunks.has(parent)) {
									parent.addModule(module);
									module.addChunk(parent);
									newChunks.push(parent);
								}
							});
							module.rewriteChunkInReasons(chunk, newChunks);
							chunk.removeModule(module);
							changed = true;
						}
					});
				});
				if(changed) return true;
			});
		});
	}
}
module.exports = EnsureChunkConditionsPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872285, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


function hasModule(chunk, module, checkedChunks) {
	if(chunk.containsModule(module)) return [chunk];
	if(chunk.parents.length === 0) return false;
	return allHaveModule(chunk.parents.filter((c) => {
		return !checkedChunks.has(c);
	}), module, checkedChunks);
}

function allHaveModule(someChunks, module, checkedChunks) {
	if(!checkedChunks) checkedChunks = new Set();
	var chunks = new Set();
	for(var i = 0; i < someChunks.length; i++) {
		checkedChunks.add(someChunks[i]);
		var subChunks = hasModule(someChunks[i], module, checkedChunks);
		if(!subChunks) return false;

		for(var index = 0; index < subChunks.length; index++) {
			var item = subChunks[index];

			chunks.add(item);
		}
	}
	return chunks;
}

class RemoveParentModulesPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin(["optimize-chunks-basic", "optimize-extracted-chunks-basic"], (chunks) => {
				for(var index = 0; index < chunks.length; index++) {
					var chunk = chunks[index];
					if(chunk.parents.length === 0) continue;

					// TODO consider Map when performance has improved https://gist.github.com/sokra/b36098368da7b8f6792fd7c85fca6311
					var cache = Object.create(null);
					var modules = chunk.getModules();
					for(var i = 0; i < modules.length; i++) {
						var module = modules[i];

						var dId = module.getChunkIdsIdent();
						var parentChunksWithModule;
						if(dId === null) {
							parentChunksWithModule = allHaveModule(chunk.parents, module);
						} else if(dId in cache) {
							parentChunksWithModule = cache[dId];
						} else {
							parentChunksWithModule = cache[dId] = allHaveModule(chunk.parents, module);
						}
						if(parentChunksWithModule) {
							module.rewriteChunkInReasons(chunk, Array.from(parentChunksWithModule));
							chunk.removeModule(module);
						}
					}
				}
			});
		});
	}
}
module.exports = RemoveParentModulesPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872286, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class RemoveEmptyChunksPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin(["optimize-chunks-basic", "optimize-extracted-chunks-basic"], (chunks) => {
				chunks.filter((chunk) => chunk.isEmpty() && !chunk.hasRuntime() && !chunk.hasEntryModule())
					.forEach((chunk) => {
						chunk.remove("empty");
						chunks.splice(chunks.indexOf(chunk), 1);
					});
			});
		});
	}
}
module.exports = RemoveEmptyChunksPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872287, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class MergeDuplicateChunksPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-chunks-basic", (chunks) => {
				const map = Object.create(null);
				chunks.slice().forEach((chunk) => {
					if(chunk.hasRuntime() || chunk.hasEntryModule()) return;
					const ident = chunk.getModulesIdent();
					const otherChunk = map[ident];
					if(otherChunk) {
						if(otherChunk.integrate(chunk, "duplicate"))
							chunks.splice(chunks.indexOf(chunk), 1);
						return;
					}
					map[ident] = chunk;
				});
			});
		});
	}
}
module.exports = MergeDuplicateChunksPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872288, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class FlagIncludedChunksPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-chunk-ids", (chunks) => {
				chunks.forEach((chunkA) => {
					chunks.forEach((chunkB) => {
						// as we iterate the same iterables twice
						// skip if we find ourselves
						if(chunkA === chunkB) return;

						// instead of swapping A and B just bail
						// as we loop twice the current A will be B and B then A
						if(chunkA.getNumberOfModules() < chunkB.getNumberOfModules()) return;

						if(chunkB.getNumberOfModules() === 0) return;

						// is chunkB in chunkA?
						for(const m of chunkB.modulesIterable) {
							if(!chunkA.containsModule(m)) return;
						}
						chunkA.ids.push(chunkB.id);
					});
				});
			});
		});
	}
}
module.exports = FlagIncludedChunksPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872289, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class OccurrenceOrderPlugin {
	constructor(preferEntry) {
		if(preferEntry !== undefined && typeof preferEntry !== "boolean") {
			throw new Error("Argument should be a boolean.\nFor more info on this plugin, see https://webpack.js.org/plugins/");
		}
		this.preferEntry = preferEntry;
	}
	apply(compiler) {
		const preferEntry = this.preferEntry;
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-module-order", (modules) => {
				const occursInInitialChunksMap = new Map();
				const occursInAllChunksMap = new Map();

				const initialChunkChunkMap = new Map();
				const entryCountMap = new Map();
				modules.forEach(m => {
					let initial = 0;
					let entry = 0;
					m.forEachChunk(c => {
						if(c.isInitial()) initial++;
						if(c.entryModule === m) entry++;
					});
					initialChunkChunkMap.set(m, initial);
					entryCountMap.set(m, entry);
				});

				const countOccursInEntry = (sum, r) => {
					if(!r.module) return sum;
					return sum + initialChunkChunkMap.get(r.module);
				};
				const countOccurs = (sum, r) => {
					if(!r.module) return sum;
					return sum + r.module.getNumberOfChunks();
				};

				if(preferEntry) {
					modules.forEach(m => {
						const result = m.reasons.reduce(countOccursInEntry, 0) + initialChunkChunkMap.get(m) + entryCountMap.get(m);
						occursInInitialChunksMap.set(m, result);
					});
				}

				modules.forEach(m => {
					const result = m.reasons.reduce(countOccurs, 0) + m.getNumberOfChunks() + entryCountMap.get(m);
					occursInAllChunksMap.set(m, result);
				});

				modules.sort((a, b) => {
					if(preferEntry) {
						const aEntryOccurs = occursInInitialChunksMap.get(a);
						const bEntryOccurs = occursInInitialChunksMap.get(b);
						if(aEntryOccurs > bEntryOccurs) return -1;
						if(aEntryOccurs < bEntryOccurs) return 1;
					}
					const aOccurs = occursInAllChunksMap.get(a);
					const bOccurs = occursInAllChunksMap.get(b);
					if(aOccurs > bOccurs) return -1;
					if(aOccurs < bOccurs) return 1;
					if(a.index > b.index) return 1;
					if(a.index < b.index) return -1;
					return 0;
				});
			});
			compilation.plugin("optimize-chunk-order", (chunks) => {
				const occursInInitialChunksMap = new Map();

				chunks.forEach(c => {
					const result = c.parents.reduce((sum, p) => {
						if(p.isInitial()) return sum + 1;
						return sum;
					}, 0);
					return occursInInitialChunksMap.set(c, result);
				});

				function occurs(c) {
					return c.blocks.length;
				}

				chunks.sort((a, b) => {
					const aEntryOccurs = occursInInitialChunksMap.get(a);
					const bEntryOccurs = occursInInitialChunksMap.get(b);
					if(aEntryOccurs > bEntryOccurs) return -1;
					if(aEntryOccurs < bEntryOccurs) return 1;
					const aOccurs = occurs(a);
					const bOccurs = occurs(b);
					if(aOccurs > bOccurs) return -1;
					if(aOccurs < bOccurs) return 1;
					return a.compareTo(b);
				});
			});
		});
	}
}

module.exports = OccurrenceOrderPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872290, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class FlagDependencyUsagePlugin {
	apply(compiler) {
		compiler.plugin("compilation", compilation => {
			compilation.plugin("optimize-modules-advanced", modules => {

				modules.forEach(module => module.used = false);

				const queue = [];
				compilation.chunks.forEach(chunk => {
					if(chunk.entryModule) {
						processModule(chunk.entryModule, true);
					}
				});

				while(queue.length) {
					const queueItem = queue.pop();
					processDependenciesBlock(queueItem[0], queueItem[1]);
				}

				function processModule(module, usedExports) {
					module.used = true;
					if(module.usedExports === true)
						return;
					else if(usedExports === true)
						module.usedExports = true;
					else if(Array.isArray(usedExports)) {
						const old = module.usedExports ? module.usedExports.length : -1;
						module.usedExports = addToSet(module.usedExports || [], usedExports);
						if(module.usedExports.length === old)
							return;
					} else if(Array.isArray(module.usedExports))
						return;
					else
						module.usedExports = false;

					queue.push([module, module.usedExports]);
				}

				function processDependenciesBlock(depBlock, usedExports) {
					depBlock.dependencies.forEach(dep => processDependency(dep));
					depBlock.variables.forEach(variable => variable.dependencies.forEach(dep => processDependency(dep)));
					depBlock.blocks.forEach(block => queue.push([block, usedExports]));
				}

				function processDependency(dep) {
					const reference = dep.getReference && dep.getReference();
					if(!reference) return;
					const module = reference.module;
					const importedNames = reference.importedNames;
					const oldUsed = module.used;
					const oldUsedExports = module.usedExports;
					if(!oldUsed || (importedNames && (!oldUsedExports || !isSubset(oldUsedExports, importedNames)))) {
						processModule(module, importedNames);
					}
				}

			});

			function addToSet(a, b) {
				b.forEach(item => {
					if(a.indexOf(item) < 0)
						a.push(item);
				});
				return a;
			}

			function isSubset(biggerSet, subset) {
				if(biggerSet === true) return true;
				if(subset === true) return false;
				return subset.every(item => biggerSet.indexOf(item) >= 0);
			}
		});
	}
}
module.exports = FlagDependencyUsagePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872291, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class FlagDependencyExportsPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("finish-modules", (modules) => {
				const dependencies = Object.create(null);

				let module;
				let moduleWithExports;
				let moduleProvidedExports;
				const queue = modules.filter((m) => !m.providedExports);
				for(let i = 0; i < queue.length; i++) {
					module = queue[i];

					if(module.providedExports !== true) {
						moduleWithExports = module.meta && module.meta.harmonyModule;
						moduleProvidedExports = Array.isArray(module.providedExports) ? new Set(module.providedExports) : new Set();
						processDependenciesBlock(module);
						if(!moduleWithExports) {
							module.providedExports = true;
							notifyDependencies();
						} else if(module.providedExports !== true) {
							module.providedExports = Array.from(moduleProvidedExports);
						}
					}
				}

				function processDependenciesBlock(depBlock) {
					depBlock.dependencies.forEach((dep) => processDependency(dep));
					depBlock.variables.forEach((variable) => {
						variable.dependencies.forEach((dep) => processDependency(dep));
					});
					depBlock.blocks.forEach(processDependenciesBlock);
				}

				function processDependency(dep) {
					const exportDesc = dep.getExports && dep.getExports();
					if(!exportDesc) return;
					moduleWithExports = true;
					const exports = exportDesc.exports;
					const exportDeps = exportDesc.dependencies;
					if(exportDeps) {
						exportDeps.forEach((dep) => {
							const depIdent = dep.identifier();
							// if this was not yet initialized
							// initialize it as an array containing the module and stop
							const array = dependencies[depIdent];
							if(!array) {
								dependencies[depIdent] = [module];
								return;
							}

							// check if this module is known
							// if not, add it to the dependencies for this identifier
							if(array.indexOf(module) < 0)
								array.push(module);
						});
					}
					let changed = false;
					if(module.providedExports !== true) {
						if(exports === true) {
							module.providedExports = true;
							changed = true;
						} else if(Array.isArray(exports)) {
							changed = addToSet(moduleProvidedExports, exports);
						}
					}
					if(changed) {
						notifyDependencies();
					}
				}

				function notifyDependencies() {
					const deps = dependencies[module.identifier()];
					if(deps) {
						deps.forEach((dep) => queue.push(dep));
					}
				}
			});

			function addToSet(a, b) {
				let changed = false;
				b.forEach((item) => {
					if(!a.has(item)) {
						a.add(item);
						changed = true;
					}
				});
				return changed;
			}
		});
	}
}

module.exports = FlagDependencyExportsPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872292, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Sean Larkin @thelarkinn
*/

const EntrypointsOverSizeLimitWarning = require("./EntrypointsOverSizeLimitWarning");
const AssetsOverSizeLimitWarning = require("./AssetsOverSizeLimitWarning");
const NoAsyncChunksWarning = require("./NoAsyncChunksWarning");

module.exports = class SizeLimitsPlugin {
	constructor(options) {
		this.hints = options.hints;
		this.maxAssetSize = options.maxAssetSize;
		this.maxEntrypointSize = options.maxEntrypointSize;
		this.assetFilter = options.assetFilter;
	}
	apply(compiler) {
		const entrypointSizeLimit = this.maxEntrypointSize;
		const assetSizeLimit = this.maxAssetSize;
		const hints = this.hints;
		const assetFilter = this.assetFilter || (asset => !(/\.map$/.test(asset)));

		compiler.plugin("after-emit", (compilation, callback) => {
			const warnings = [];

			const getEntrypointSize = entrypoint =>
				entrypoint.getFiles()
				.filter(assetFilter)
				.map(file => compilation.assets[file])
				.filter(Boolean)
				.map(asset => asset.size())
				.reduce((currentSize, nextSize) => currentSize + nextSize, 0);

			const assetsOverSizeLimit = [];
			Object.keys(compilation.assets)
				.filter(assetFilter)
				.forEach(assetName => {
					const asset = compilation.assets[assetName];
					const size = asset.size();

					if(size > assetSizeLimit) {
						assetsOverSizeLimit.push({
							name: assetName,
							size: size,
						});
						asset.isOverSizeLimit = true;
					}
				});

			const entrypointsOverLimit = [];
			Object.keys(compilation.entrypoints)
				.forEach(key => {
					const entry = compilation.entrypoints[key];
					const size = getEntrypointSize(entry, compilation);

					if(size > entrypointSizeLimit) {
						entrypointsOverLimit.push({
							name: key,
							size: size,
							files: entry.getFiles().filter(assetFilter)
						});
						entry.isOverSizeLimit = true;
					}
				});

			if(hints) {
				// 1. Individual Chunk: Size < 250kb
				// 2. Collective Initial Chunks [entrypoint] (Each Set?): Size < 250kb
				// 3. No Async Chunks
				// if !1, then 2, if !2 return
				if(assetsOverSizeLimit.length > 0) {
					warnings.push(
						new AssetsOverSizeLimitWarning(
							assetsOverSizeLimit,
							assetSizeLimit));
				}
				if(entrypointsOverLimit.length > 0) {
					warnings.push(
						new EntrypointsOverSizeLimitWarning(
							entrypointsOverLimit,
							entrypointSizeLimit));
				}

				if(warnings.length > 0) {
					const hasAsyncChunks = compilation.chunks.filter(chunk => !chunk.isInitial()).length > 0;

					if(!hasAsyncChunks) {
						warnings.push(new NoAsyncChunksWarning());
					}

					if(hints === "error") {
						Array.prototype.push.apply(compilation.errors, warnings);
					} else {
						Array.prototype.push.apply(compilation.warnings, warnings);
					}
				}
			}

			callback();
		});
	}
};

}, function(modId) { var map = {"./EntrypointsOverSizeLimitWarning":1602510872293,"./AssetsOverSizeLimitWarning":1602510872294,"./NoAsyncChunksWarning":1602510872295}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872293, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Sean Larkin @thelarkinn
*/


const WebpackError = require("../WebpackError");
const SizeFormatHelpers = require("../SizeFormatHelpers");

module.exports = class EntrypointsOverSizeLimitWarning extends WebpackError {
	constructor(entrypoints, entrypointLimit) {
		super();

		this.name = "EntrypointsOverSizeLimitWarning";
		this.entrypoints = entrypoints;
		const entrypointList = this.entrypoints.map(entrypoint => `\n  ${
			entrypoint.name
		} (${
			SizeFormatHelpers.formatSize(entrypoint.size)
		})\n${
			entrypoint.files.map(asset => `      ${asset}`).join("\n")
		}`).join("");
		this.message = `entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (${SizeFormatHelpers.formatSize(entrypointLimit)}). This can impact web performance.
Entrypoints:${entrypointList}\n`;

		Error.captureStackTrace(this, this.constructor);
	}
};

}, function(modId) { var map = {"../WebpackError":1602510872127,"../SizeFormatHelpers":1602510872150}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872294, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Sean Larkin @thelarkinn
*/


const WebpackError = require("../WebpackError");
const SizeFormatHelpers = require("../SizeFormatHelpers");

module.exports = class AssetsOverSizeLimitWarning extends WebpackError {
	constructor(assetsOverSizeLimit, assetLimit) {
		super();

		this.name = "AssetsOverSizeLimitWarning";
		this.assets = assetsOverSizeLimit;
		const assetLists = this.assets.map(asset => `\n  ${asset.name} (${SizeFormatHelpers.formatSize(asset.size)})`).join("");
		this.message = `asset size limit: The following asset(s) exceed the recommended size limit (${SizeFormatHelpers.formatSize(assetLimit)}).
This can impact web performance.
Assets: ${assetLists}`;

		Error.captureStackTrace(this, this.constructor);
	}
};

}, function(modId) { var map = {"../WebpackError":1602510872127,"../SizeFormatHelpers":1602510872150}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872295, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Sean Larkin @thelarkinn
*/


const WebpackError = require("../WebpackError");

module.exports = class NoAsyncChunksWarning extends WebpackError {
	constructor() {
		super();

		this.name = "NoAsyncChunksWarning";
		this.message = "webpack performance recommendations: \n" +
			"You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.\n" +
			"For more info visit https://webpack.js.org/guides/code-splitting/";

		Error.captureStackTrace(this, this.constructor);
	}
};

}, function(modId) { var map = {"../WebpackError":1602510872127}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872296, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const JsonpMainTemplatePlugin = require("./JsonpMainTemplatePlugin");
const JsonpChunkTemplatePlugin = require("./JsonpChunkTemplatePlugin");
const JsonpHotUpdateChunkTemplatePlugin = require("./JsonpHotUpdateChunkTemplatePlugin");

class JsonpTemplatePlugin {
	apply(compiler) {
		compiler.plugin("this-compilation", (compilation) => {
			compilation.mainTemplate.apply(new JsonpMainTemplatePlugin());
			compilation.chunkTemplate.apply(new JsonpChunkTemplatePlugin());
			compilation.hotUpdateChunkTemplate.apply(new JsonpHotUpdateChunkTemplatePlugin());
		});
	}
}

module.exports = JsonpTemplatePlugin;

}, function(modId) { var map = {"./JsonpMainTemplatePlugin":1602510872297,"./JsonpChunkTemplatePlugin":1602510872299,"./JsonpHotUpdateChunkTemplatePlugin":1602510872300}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872297, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Template = require("./Template");

class JsonpMainTemplatePlugin {

	apply(mainTemplate) {
		mainTemplate.plugin("local-vars", function(source, chunk) {
			if(chunk.chunks.length > 0) {
				return this.asString([
					source,
					"",
					"// objects to store loaded and loading chunks",
					"var installedChunks = {",
					this.indent(
						chunk.ids.map(id => `${JSON.stringify(id)}: 0`).join(",\n")
					),
					"};"
				]);
			}
			return source;
		});
		mainTemplate.plugin("jsonp-script", function(_, chunk, hash) {
			const chunkFilename = this.outputOptions.chunkFilename;
			const chunkMaps = chunk.getChunkMaps();
			const crossOriginLoading = this.outputOptions.crossOriginLoading;
			const chunkLoadTimeout = this.outputOptions.chunkLoadTimeout;
			const jsonpScriptType = this.outputOptions.jsonpScriptType;
			const scriptSrcPath = this.applyPluginsWaterfall("asset-path", JSON.stringify(chunkFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: length => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
				chunk: {
					id: "\" + chunkId + \"",
					hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
					hashWithLength(length) {
						const shortChunkHashMap = Object.create(null);
						Object.keys(chunkMaps.hash).forEach(chunkId => {
							if(typeof chunkMaps.hash[chunkId] === "string")
								shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
						});
						return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
					},
					name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
				}
			});
			return this.asString([
				"var script = document.createElement('script');",
				`script.type = ${JSON.stringify(jsonpScriptType)};`,
				"script.charset = 'utf-8';",
				"script.async = true;",
				`script.timeout = ${chunkLoadTimeout};`,
				crossOriginLoading ? `script.crossOrigin = ${JSON.stringify(crossOriginLoading)};` : "",
				`if (${this.requireFn}.nc) {`,
				this.indent(`script.setAttribute("nonce", ${this.requireFn}.nc);`),
				"}",
				`script.src = ${this.requireFn}.p + ${scriptSrcPath};`,
				`var timeout = setTimeout(onScriptComplete, ${chunkLoadTimeout});`,
				"script.onerror = script.onload = onScriptComplete;",
				"function onScriptComplete() {",
				this.indent([
					"// avoid mem leaks in IE.",
					"script.onerror = script.onload = null;",
					"clearTimeout(timeout);",
					"var chunk = installedChunks[chunkId];",
					"if(chunk !== 0) {",
					this.indent([
						"if(chunk) {",
						this.indent("chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));"),
						"}",
						"installedChunks[chunkId] = undefined;"
					]),
					"}"
				]),
				"};",
			]);
		});
		mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
			return this.asString([
				"var installedChunkData = installedChunks[chunkId];",
				"if(installedChunkData === 0) {",
				this.indent([
					"return new Promise(function(resolve) { resolve(); });"
				]),
				"}",
				"",
				"// a Promise means \"currently loading\".",
				"if(installedChunkData) {",
				this.indent([
					"return installedChunkData[2];"
				]),
				"}",
				"",
				"// setup Promise in chunk cache",
				"var promise = new Promise(function(resolve, reject) {",
				this.indent([
					"installedChunkData = installedChunks[chunkId] = [resolve, reject];"
				]),
				"});",
				"installedChunkData[2] = promise;",
				"",
				"// start chunk loading",
				"var head = document.getElementsByTagName('head')[0];",
				this.applyPluginsWaterfall("jsonp-script", "", chunk, hash),
				"head.appendChild(script);",
				"",
				"return promise;"
			]);
		});
		mainTemplate.plugin("require-extensions", function(source, chunk) {
			if(chunk.chunks.length === 0) return source;

			return this.asString([
				source,
				"",
				"// on error function for async loading",
				`${this.requireFn}.oe = function(err) { console.error(err); throw err; };`
			]);
		});
		mainTemplate.plugin("bootstrap", function(source, chunk, hash) {
			if(chunk.chunks.length > 0) {
				var jsonpFunction = this.outputOptions.jsonpFunction;
				return this.asString([
					source,
					"",
					"// install a JSONP callback for chunk loading",
					`var parentJsonpFunction = window[${JSON.stringify(jsonpFunction)}];`,
					`window[${JSON.stringify(jsonpFunction)}] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {`,
					this.indent([
						"// add \"moreModules\" to the modules object,",
						"// then flag all \"chunkIds\" as loaded and fire callback",
						"var moduleId, chunkId, i = 0, resolves = [], result;",
						"for(;i < chunkIds.length; i++) {",
						this.indent([
							"chunkId = chunkIds[i];",
							"if(installedChunks[chunkId]) {",
							this.indent("resolves.push(installedChunks[chunkId][0]);"),
							"}",
							"installedChunks[chunkId] = 0;"
						]),
						"}",
						"for(moduleId in moreModules) {",
						this.indent([
							"if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {",
							this.indent(this.renderAddModule(hash, chunk, "moduleId", "moreModules[moduleId]")),
							"}"
						]),
						"}",
						"if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);",
						"while(resolves.length) {",
						this.indent("resolves.shift()();"),
						"}",
						this.entryPointInChildren(chunk) ? [
							"if(executeModules) {",
							this.indent([
								"for(i=0; i < executeModules.length; i++) {",
								this.indent(`result = ${this.requireFn}(${this.requireFn}.s = executeModules[i]);`),
								"}"
							]),
							"}",
							"return result;",
						] : ""
					]),
					"};"
				]);
			}
			return source;
		});
		mainTemplate.plugin("hot-bootstrap", function(source, chunk, hash) {
			const hotUpdateChunkFilename = this.outputOptions.hotUpdateChunkFilename;
			const hotUpdateMainFilename = this.outputOptions.hotUpdateMainFilename;
			const crossOriginLoading = this.outputOptions.crossOriginLoading;
			const hotUpdateFunction = this.outputOptions.hotUpdateFunction;
			const currentHotUpdateChunkFilename = this.applyPluginsWaterfall("asset-path", JSON.stringify(hotUpdateChunkFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: length => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
				chunk: {
					id: "\" + chunkId + \""
				}
			});
			const currentHotUpdateMainFilename = this.applyPluginsWaterfall("asset-path", JSON.stringify(hotUpdateMainFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: length => `" + ${this.renderCurrentHashCode(hash, length)} + "`
			});
			const runtimeSource = Template.getFunctionContent(require("./JsonpMainTemplate.runtime.js"))
				.replace(/\/\/\$semicolon/g, ";")
				.replace(/\$require\$/g, this.requireFn)
				.replace(/\$crossOriginLoading\$/g, crossOriginLoading ? `script.crossOrigin = ${JSON.stringify(crossOriginLoading)}` : "")
				.replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
				.replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
				.replace(/\$hash\$/g, JSON.stringify(hash));
			return `${source}
function hotDisposeChunk(chunkId) {
	delete installedChunks[chunkId];
}
var parentHotUpdateCallback = window[${JSON.stringify(hotUpdateFunction)}];
window[${JSON.stringify(hotUpdateFunction)}] = ${runtimeSource}`;
		});
		mainTemplate.plugin("hash", function(hash) {
			hash.update("jsonp");
			hash.update("4");
			hash.update(`${this.outputOptions.filename}`);
			hash.update(`${this.outputOptions.chunkFilename}`);
			hash.update(`${this.outputOptions.jsonpFunction}`);
			hash.update(`${this.outputOptions.hotUpdateFunction}`);
		});
	}
}
module.exports = JsonpMainTemplatePlugin;

}, function(modId) { var map = {"./Template":1602510872137,"./JsonpMainTemplate.runtime.js":1602510872298}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872298, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*globals hotAddUpdateChunk parentHotUpdateCallback document XMLHttpRequest $require$ $hotChunkFilename$ $hotMainFilename$ $crossOriginLoading$ */
module.exports = function() {
	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
		hotAddUpdateChunk(chunkId, moreModules);
		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
	} //$semicolon

	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		script.src = $require$.p + $hotChunkFilename$;
		$crossOriginLoading$;
		head.appendChild(script);
	}

	function hotDownloadManifest(requestTimeout) { // eslint-disable-line no-unused-vars
		requestTimeout = requestTimeout || 10000;
		return new Promise(function(resolve, reject) {
			if(typeof XMLHttpRequest === "undefined")
				return reject(new Error("No browser support"));
			try {
				var request = new XMLHttpRequest();
				var requestPath = $require$.p + $hotMainFilename$;
				request.open("GET", requestPath, true);
				request.timeout = requestTimeout;
				request.send(null);
			} catch(err) {
				return reject(err);
			}
			request.onreadystatechange = function() {
				if(request.readyState !== 4) return;
				if(request.status === 0) {
					// timeout
					reject(new Error("Manifest request to " + requestPath + " timed out."));
				} else if(request.status === 404) {
					// no update available
					resolve();
				} else if(request.status !== 200 && request.status !== 304) {
					// other failure
					reject(new Error("Manifest request to " + requestPath + " failed."));
				} else {
					// success
					try {
						var update = JSON.parse(request.responseText);
					} catch(e) {
						reject(e);
						return;
					}
					resolve(update);
				}
			};
		});
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872299, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

class JsonpChunkTemplatePlugin {
	apply(chunkTemplate) {
		chunkTemplate.plugin("render", function(modules, chunk) {
			const jsonpFunction = this.outputOptions.jsonpFunction;
			const source = new ConcatSource();
			source.add(`${jsonpFunction}(${JSON.stringify(chunk.ids)},`);
			source.add(modules);
			const entries = [chunk.entryModule].filter(Boolean).map(m => m.id);
			if(entries.length > 0) {
				source.add(`,${JSON.stringify(entries)}`);
			}
			source.add(")");
			return source;
		});
		chunkTemplate.plugin("hash", function(hash) {
			hash.update("JsonpChunkTemplatePlugin");
			hash.update("3");
			hash.update(`${this.outputOptions.jsonpFunction}`);
			hash.update(`${this.outputOptions.library}`);
		});
	}
}
module.exports = JsonpChunkTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872300, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

class JsonpHotUpdateChunkTemplatePlugin {
	apply(hotUpdateChunkTemplate) {
		hotUpdateChunkTemplate.plugin("render", function(modulesSource, modules, removedModules, hash, id) {
			const source = new ConcatSource();
			source.add(`${this.outputOptions.hotUpdateFunction}(${JSON.stringify(id)},`);
			source.add(modulesSource);
			source.add(")");
			return source;
		});
		hotUpdateChunkTemplate.plugin("hash", function(hash) {
			hash.update("JsonpHotUpdateChunkTemplatePlugin");
			hash.update("3");
			hash.update(`${this.outputOptions.hotUpdateFunction}`);
			hash.update(`${this.outputOptions.library}`);
		});
	}
}

module.exports = JsonpHotUpdateChunkTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872301, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const AliasPlugin = require("enhanced-resolve/lib/AliasPlugin");
const ParserHelpers = require("../ParserHelpers");
const nodeLibsBrowser = require("node-libs-browser");

module.exports = class NodeSourcePlugin {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		const options = this.options;
		if(options === false) // allow single kill switch to turn off this plugin
			return;

		function getPathToModule(module, type) {
			if(type === true || (type === undefined && nodeLibsBrowser[module])) {
				if(!nodeLibsBrowser[module]) throw new Error(`No browser version for node.js core module ${module} available`);
				return nodeLibsBrowser[module];
			} else if(type === "mock") {
				return require.resolve(`node-libs-browser/mock/${module}`);
			} else if(type === "empty") {
				return require.resolve("node-libs-browser/mock/empty");
			} else return module;
		}

		function addExpression(parser, name, module, type, suffix) {
			suffix = suffix || "";
			parser.plugin(`expression ${name}`, function() {
				if(this.state.module && this.state.module.resource === getPathToModule(module, type)) return;
				const mockModule = ParserHelpers.requireFileAsExpression(this.state.module.context, getPathToModule(module, type));
				return ParserHelpers.addParsedVariableToModule(this, name, mockModule + suffix);
			});
		}

		compiler.plugin("compilation", function(compilation, params) {
			params.normalModuleFactory.plugin("parser", function(parser, parserOptions) {

				if(parserOptions.node === false)
					return;

				let localOptions = options;
				if(parserOptions.node)
					localOptions = Object.assign({}, localOptions, parserOptions.node);

				if(localOptions.global) {
					parser.plugin("expression global", function() {
						const retrieveGlobalModule = ParserHelpers.requireFileAsExpression(this.state.module.context, require.resolve("../../buildin/global.js"));
						return ParserHelpers.addParsedVariableToModule(this, "global", retrieveGlobalModule);
					});
				}
				if(localOptions.process) {
					const processType = localOptions.process;
					addExpression(parser, "process", "process", processType);
				}
				if(localOptions.console) {
					const consoleType = localOptions.console;
					addExpression(parser, "console", "console", consoleType);
				}
				const bufferType = localOptions.Buffer;
				if(bufferType) {
					addExpression(parser, "Buffer", "buffer", bufferType, ".Buffer");
				}
				if(localOptions.setImmediate) {
					const setImmediateType = localOptions.setImmediate;
					addExpression(parser, "setImmediate", "timers", setImmediateType, ".setImmediate");
					addExpression(parser, "clearImmediate", "timers", setImmediateType, ".clearImmediate");
				}
			});
		});
		compiler.plugin("after-resolvers", (compiler) => {
			Object.keys(nodeLibsBrowser).forEach((lib) => {
				if(options[lib] !== false) {
					compiler.resolvers.normal.apply(
						new AliasPlugin("described-resolve", {
							name: lib,
							onlyModule: true,
							alias: getPathToModule(lib, options[lib])
						}, "resolve")
					);
				}
			});
		});
	}
};

}, function(modId) { var map = {"../ParserHelpers":1602510872203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872302, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const WebWorkerMainTemplatePlugin = require("./WebWorkerMainTemplatePlugin");
const WebWorkerChunkTemplatePlugin = require("./WebWorkerChunkTemplatePlugin");
const WebWorkerHotUpdateChunkTemplatePlugin = require("./WebWorkerHotUpdateChunkTemplatePlugin");

class WebWorkerTemplatePlugin {
	apply(compiler) {
		compiler.plugin("this-compilation", compilation => {
			compilation.mainTemplate.apply(new WebWorkerMainTemplatePlugin());
			compilation.chunkTemplate.apply(new WebWorkerChunkTemplatePlugin());
			compilation.hotUpdateChunkTemplate.apply(new WebWorkerHotUpdateChunkTemplatePlugin());
		});
	}
}
module.exports = WebWorkerTemplatePlugin;

}, function(modId) { var map = {"./WebWorkerMainTemplatePlugin":1602510872303,"./WebWorkerChunkTemplatePlugin":1602510872305,"./WebWorkerHotUpdateChunkTemplatePlugin":1602510872306}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872303, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Template = require("../Template");

class WebWorkerMainTemplatePlugin {
	apply(mainTemplate) {
		mainTemplate.plugin("local-vars", function(source, chunk) {
			if(chunk.chunks.length > 0) {
				return this.asString([
					source,
					"",
					"// object to store loaded chunks",
					"// \"1\" means \"already loaded\"",
					"var installedChunks = {",
					this.indent(
						chunk.ids.map((id) => `${id}: 1`).join(",\n")
					),
					"};"
				]);
			}
			return source;
		});
		mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
			const chunkFilename = this.outputOptions.chunkFilename;
			return this.asString([
				"return new Promise(function(resolve) {",
				this.indent([
					"// \"1\" is the signal for \"already loaded\"",
					"if(!installedChunks[chunkId]) {",
					this.indent([
						"importScripts(" +
						this.applyPluginsWaterfall("asset-path", JSON.stringify(chunkFilename), {
							hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
							hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
							chunk: {
								id: "\" + chunkId + \""
							}
						}) + ");"
					]),
					"}",
					"resolve();"
				]),
				"});"
			]);
		});
		mainTemplate.plugin("bootstrap", function(source, chunk, hash) {
			if(chunk.chunks.length > 0) {
				const chunkCallbackName = this.outputOptions.chunkCallbackName || Template.toIdentifier("webpackChunk" + (this.outputOptions.library || ""));
				return this.asString([
					source,
					`this[${JSON.stringify(chunkCallbackName)}] = function webpackChunkCallback(chunkIds, moreModules) {`,
					this.indent([
						"for(var moduleId in moreModules) {",
						this.indent(this.renderAddModule(hash, chunk, "moduleId", "moreModules[moduleId]")),
						"}",
						"while(chunkIds.length)",
						this.indent("installedChunks[chunkIds.pop()] = 1;")
					]),
					"};"
				]);
			}
			return source;
		});
		mainTemplate.plugin("hot-bootstrap", function(source, chunk, hash) {
			const hotUpdateChunkFilename = this.outputOptions.hotUpdateChunkFilename;
			const hotUpdateMainFilename = this.outputOptions.hotUpdateMainFilename;
			const hotUpdateFunction = this.outputOptions.hotUpdateFunction || Template.toIdentifier("webpackHotUpdate" + (this.outputOptions.library || ""));
			const currentHotUpdateChunkFilename = this.applyPluginsWaterfall("asset-path", JSON.stringify(hotUpdateChunkFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
				chunk: {
					id: "\" + chunkId + \""
				}
			});
			const currentHotUpdateMainFilename = this.applyPluginsWaterfall("asset-path", JSON.stringify(hotUpdateMainFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
			});

			return source + "\n" +
				`var parentHotUpdateCallback = self[${JSON.stringify(hotUpdateFunction)}];\n` +
				`self[${JSON.stringify(hotUpdateFunction)}] = ` +
				Template.getFunctionContent(require("./WebWorkerMainTemplate.runtime.js"))
				.replace(/\/\/\$semicolon/g, ";")
				.replace(/\$require\$/g, this.requireFn)
				.replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
				.replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
				.replace(/\$hash\$/g, JSON.stringify(hash));
		});
		mainTemplate.plugin("hash", function(hash) {
			hash.update("webworker");
			hash.update("3");
			hash.update(`${this.outputOptions.publicPath}`);
			hash.update(`${this.outputOptions.filename}`);
			hash.update(`${this.outputOptions.chunkFilename}`);
			hash.update(`${this.outputOptions.chunkCallbackName}`);
			hash.update(`${this.outputOptions.library}`);
		});
	}
}
module.exports = WebWorkerMainTemplatePlugin;

}, function(modId) { var map = {"../Template":1602510872137,"./WebWorkerMainTemplate.runtime.js":1602510872304}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872304, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*globals installedChunks hotAddUpdateChunk parentHotUpdateCallback importScripts XMLHttpRequest $require$ $hotChunkFilename$ $hotMainFilename$ */
module.exports = function() {
	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
		hotAddUpdateChunk(chunkId, moreModules);
		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
	} //$semicolon

	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
		importScripts($require$.p + $hotChunkFilename$);
	}

	function hotDownloadManifest(requestTimeout) { // eslint-disable-line no-unused-vars
		requestTimeout = requestTimeout || 10000;
		return new Promise(function(resolve, reject) {
			if(typeof XMLHttpRequest === "undefined")
				return reject(new Error("No browser support"));
			try {
				var request = new XMLHttpRequest();
				var requestPath = $require$.p + $hotMainFilename$;
				request.open("GET", requestPath, true);
				request.timeout = requestTimeout;
				request.send(null);
			} catch(err) {
				return reject(err);
			}
			request.onreadystatechange = function() {
				if(request.readyState !== 4) return;
				if(request.status === 0) {
					// timeout
					reject(new Error("Manifest request to " + requestPath + " timed out."));
				} else if(request.status === 404) {
					// no update available
					resolve();
				} else if(request.status !== 200 && request.status !== 304) {
					// other failure
					reject(new Error("Manifest request to " + requestPath + " failed."));
				} else {
					// success
					try {
						var update = JSON.parse(request.responseText);
					} catch(e) {
						reject(e);
						return;
					}
					resolve(update);
				}
			};
		});
	}

	function hotDisposeChunk(chunkId) { //eslint-disable-line no-unused-vars
		delete installedChunks[chunkId];
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872305, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;
const Template = require("../Template");

class WebWorkerChunkTemplatePlugin {

	apply(chunkTemplate) {
		chunkTemplate.plugin("render", function(modules, chunk) {
			const chunkCallbackName = this.outputOptions.chunkCallbackName || Template.toIdentifier("webpackChunk" + (this.outputOptions.library || ""));
			const source = new ConcatSource();
			source.add(`${chunkCallbackName}(${JSON.stringify(chunk.ids)},`);
			source.add(modules);
			source.add(")");
			return source;
		});
		chunkTemplate.plugin("hash", function(hash) {
			hash.update("webworker");
			hash.update("3");
			hash.update(`${this.outputOptions.chunkCallbackName}`);
			hash.update(`${this.outputOptions.library}`);
		});
	}
}
module.exports = WebWorkerChunkTemplatePlugin;

}, function(modId) { var map = {"../Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872306, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ConcatSource = require("webpack-sources").ConcatSource;
const Template = require("../Template");

class WebWorkerHotUpdateChunkTemplatePlugin {

	apply(hotUpdateChunkTemplate) {
		hotUpdateChunkTemplate.plugin("render", function(modulesSource, modules, removedModules, hash, id) {
			const chunkCallbackName = this.outputOptions.hotUpdateFunction || Template.toIdentifier("webpackHotUpdate" + (this.outputOptions.library || ""));
			const source = new ConcatSource();
			source.add(chunkCallbackName + "(" + JSON.stringify(id) + ",");
			source.add(modulesSource);
			source.add(")");
			return source;
		});
		hotUpdateChunkTemplate.plugin("hash", function(hash) {
			hash.update("WebWorkerHotUpdateChunkTemplatePlugin");
			hash.update("3");
			hash.update(this.outputOptions.hotUpdateFunction + "");
			hash.update(this.outputOptions.library + "");
		});
	}
}
module.exports = WebWorkerHotUpdateChunkTemplatePlugin;

}, function(modId) { var map = {"../Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872307, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



const NodeMainTemplatePlugin = require("./NodeMainTemplatePlugin");
const NodeChunkTemplatePlugin = require("./NodeChunkTemplatePlugin");
const NodeHotUpdateChunkTemplatePlugin = require("./NodeHotUpdateChunkTemplatePlugin");

class NodeTemplatePlugin {
	constructor(options) {
		options = options || {};
		this.asyncChunkLoading = options.asyncChunkLoading;
	}

	apply(compiler) {
		compiler.plugin("this-compilation", (compilation) => {
			compilation.mainTemplate.apply(new NodeMainTemplatePlugin(this.asyncChunkLoading));
			compilation.chunkTemplate.apply(new NodeChunkTemplatePlugin());
			compilation.hotUpdateChunkTemplate.apply(new NodeHotUpdateChunkTemplatePlugin());
		});
	}
}

module.exports = NodeTemplatePlugin;

}, function(modId) { var map = {"./NodeMainTemplatePlugin":1602510872308,"./NodeChunkTemplatePlugin":1602510872311,"./NodeHotUpdateChunkTemplatePlugin":1602510872312}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872308, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Template = require("../Template");

module.exports = class NodeMainTemplatePlugin {
	constructor(asyncChunkLoading) {
		this.asyncChunkLoading = asyncChunkLoading;
	}

	apply(mainTemplate) {
		const asyncChunkLoading = this.asyncChunkLoading;
		mainTemplate.plugin("local-vars", function(source, chunk) {
			if(chunk.chunks.length > 0) {
				return this.asString([
					source,
					"",
					"// object to store loaded chunks",
					"// \"0\" means \"already loaded\"",
					"var installedChunks = {",
					this.indent(chunk.ids.map((id) => `${id}: 0`).join(",\n")),
					"};"
				]);
			}
			return source;
		});
		mainTemplate.plugin("require-extensions", function(source, chunk) {
			if(chunk.chunks.length > 0) {
				return this.asString([
					source,
					"",
					"// uncatched error handler for webpack runtime",
					`${this.requireFn}.oe = function(err) {`,
					this.indent([
						"process.nextTick(function() {",
						this.indent("throw err; // catch this error by using System.import().catch()"),
						"});"
					]),
					"};"
				]);
			}
			return source;
		});
		mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
			const chunkFilename = this.outputOptions.chunkFilename;
			const chunkMaps = chunk.getChunkMaps();
			const insertMoreModules = [
				"var moreModules = chunk.modules, chunkIds = chunk.ids;",
				"for(var moduleId in moreModules) {",
				this.indent(this.renderAddModule(hash, chunk, "moduleId", "moreModules[moduleId]")),
				"}"
			];
			if(asyncChunkLoading) {
				return this.asString([
					"// \"0\" is the signal for \"already loaded\"",
					"if(installedChunks[chunkId] === 0)",
					this.indent([
						"return Promise.resolve();"
					]),
					"// array of [resolve, reject, promise] means \"currently loading\"",
					"if(installedChunks[chunkId])",
					this.indent([
						"return installedChunks[chunkId][2];"
					]),
					"// load the chunk and return promise to it",
					"var promise = new Promise(function(resolve, reject) {",
					this.indent([
						"installedChunks[chunkId] = [resolve, reject];",
						"var filename = __dirname + " + this.applyPluginsWaterfall("asset-path", JSON.stringify(`/${chunkFilename}`), {
							hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
							hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
							chunk: {
								id: "\" + chunkId + \"",
								hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
								hashWithLength: (length) => {
									const shortChunkHashMap = {};
									Object.keys(chunkMaps.hash).forEach((chunkId) => {
										if(typeof chunkMaps.hash[chunkId] === "string")
											shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
									});
									return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
								},
								name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
							}
						}) + ";",
						"require('fs').readFile(filename, 'utf-8',  function(err, content) {",
						this.indent([
							"if(err) return reject(err);",
							"var chunk = {};",
							"require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
							"(chunk, require, require('path').dirname(filename), filename);"
						].concat(insertMoreModules).concat([
							"var callbacks = [];",
							"for(var i = 0; i < chunkIds.length; i++) {",
							this.indent([
								"if(installedChunks[chunkIds[i]])",
								this.indent([
									"callbacks = callbacks.concat(installedChunks[chunkIds[i]][0]);"
								]),
								"installedChunks[chunkIds[i]] = 0;"
							]),
							"}",
							"for(i = 0; i < callbacks.length; i++)",
							this.indent("callbacks[i]();")
						])),
						"});"
					]),
					"});",
					"return installedChunks[chunkId][2] = promise;"
				]);
			} else {
				const request = this.applyPluginsWaterfall("asset-path", JSON.stringify(`./${chunkFilename}`), {
					hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
					hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
					chunk: {
						id: "\" + chunkId + \"",
						hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
						hashWithLength: (length) => {
							const shortChunkHashMap = {};
							Object.keys(chunkMaps.hash).forEach((chunkId) => {
								if(typeof chunkMaps.hash[chunkId] === "string")
									shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
							});
							return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
						},
						name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
					}
				});
				return this.asString([
					"// \"0\" is the signal for \"already loaded\"",
					"if(installedChunks[chunkId] !== 0) {",
					this.indent([
						`var chunk = require(${request});`
					].concat(insertMoreModules).concat([
						"for(var i = 0; i < chunkIds.length; i++)",
						this.indent("installedChunks[chunkIds[i]] = 0;")
					])),
					"}",
					"return Promise.resolve();"
				]);
			}
		});
		mainTemplate.plugin("hot-bootstrap", function(source, chunk, hash) {
			const hotUpdateChunkFilename = this.outputOptions.hotUpdateChunkFilename;
			const hotUpdateMainFilename = this.outputOptions.hotUpdateMainFilename;
			const chunkMaps = chunk.getChunkMaps();
			const currentHotUpdateChunkFilename = this.applyPluginsWaterfall("asset-path", JSON.stringify(hotUpdateChunkFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
				chunk: {
					id: "\" + chunkId + \"",
					hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
					hashWithLength: (length) => {
						const shortChunkHashMap = {};
						Object.keys(chunkMaps.hash).forEach((chunkId) => {
							if(typeof chunkMaps.hash[chunkId] === "string")
								shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
						});
						return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
					},
					name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
				}
			});
			const currentHotUpdateMainFilename = this.applyPluginsWaterfall("asset-path", JSON.stringify(hotUpdateMainFilename), {
				hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
				hashWithLength: (length) => `" + ${this.renderCurrentHashCode(hash, length)} + "`
			});
			return Template.getFunctionContent(asyncChunkLoading ? require("./NodeMainTemplateAsync.runtime.js") : require("./NodeMainTemplate.runtime.js"))
				.replace(/\$require\$/g, this.requireFn)
				.replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
				.replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename);
		});
		mainTemplate.plugin("hash", function(hash) {
			hash.update("node");
			hash.update("3");
			hash.update(this.outputOptions.filename + "");
			hash.update(this.outputOptions.chunkFilename + "");
		});
	}
};

}, function(modId) { var map = {"../Template":1602510872137,"./NodeMainTemplateAsync.runtime.js":1602510872309,"./NodeMainTemplate.runtime.js":1602510872310}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872309, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*global installedChunks $hotChunkFilename$ $require$ hotAddUpdateChunk $hotMainFilename$ */
module.exports = function() {
	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
		var filename = require("path").join(__dirname, $hotChunkFilename$);
		require("fs").readFile(filename, "utf-8", function(err, content) {
			if(err) {
				if($require$.onError)
					return $require$.oe(err);
				else
					throw err;
			}
			var chunk = {};
			require("vm").runInThisContext("(function(exports) {" + content + "\n})", filename)(chunk);
			hotAddUpdateChunk(chunk.id, chunk.modules);
		});
	}

	function hotDownloadManifest() { // eslint-disable-line no-unused-vars
		var filename = require("path").join(__dirname, $hotMainFilename$);
		return new Promise(function(resolve, reject) {
			require("fs").readFile(filename, "utf-8", function(err, content) {
				if(err) return resolve();
				try {
					var update = JSON.parse(content);
				} catch(e) {
					return reject(e);
				}
				resolve(update);
			});
		});
	}

	function hotDisposeChunk(chunkId) { //eslint-disable-line no-unused-vars
		delete installedChunks[chunkId];
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872310, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*global installedChunks $hotChunkFilename$ hotAddUpdateChunk $hotMainFilename$ */
module.exports = function() {
	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
		var chunk = require("./" + $hotChunkFilename$);
		hotAddUpdateChunk(chunk.id, chunk.modules);
	}

	function hotDownloadManifest() { // eslint-disable-line no-unused-vars
		try {
			var update = require("./" + $hotMainFilename$);
		} catch(e) {
			return Promise.resolve();
		}
		return Promise.resolve(update);
	}

	function hotDisposeChunk(chunkId) { //eslint-disable-line no-unused-vars
		delete installedChunks[chunkId];
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872311, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



const ConcatSource = require("webpack-sources").ConcatSource;

class NodeChunkTemplatePlugin {

	apply(chunkTemplate) {
		chunkTemplate.plugin("render", function(modules, chunk) {
			const source = new ConcatSource();
			source.add(`exports.ids = ${JSON.stringify(chunk.ids)};\nexports.modules = `);
			source.add(modules);
			source.add(";");
			return source;
		});
		chunkTemplate.plugin("hash", function(hash) {
			hash.update("node");
			hash.update("3");
		});
	}
}

module.exports = NodeChunkTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872312, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

class NodeHotUpdateChunkTemplatePlugin {

	apply(hotUpdateChunkTemplate) {
		hotUpdateChunkTemplate.plugin("render", (modulesSource, modules, removedModules, hash, id) => {
			const source = new ConcatSource();
			source.add("exports.id = " + JSON.stringify(id) + ";\nexports.modules = ");
			source.add(modulesSource);
			source.add(";");
			return source;
		});
		hotUpdateChunkTemplate.plugin("hash", function(hash) {
			hash.update("NodeHotUpdateChunkTemplatePlugin");
			hash.update("3");
			hash.update(this.outputOptions.hotUpdateFunction + "");
			hash.update(this.outputOptions.library + "");
		});
	}
}
module.exports = NodeHotUpdateChunkTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872313, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ExternalsPlugin = require("../ExternalsPlugin");

const builtins = require("module").builtinModules || Object.keys(process.binding("natives"));

class NodeTargetPlugin {
	apply(compiler) {
		new ExternalsPlugin("commonjs", builtins).apply(compiler);
	}
}

module.exports = NodeTargetPlugin;

}, function(modId) { var map = {"../ExternalsPlugin":1602510872314}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872314, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ExternalModuleFactoryPlugin = require("./ExternalModuleFactoryPlugin");

class ExternalsPlugin {
	constructor(type, externals) {
		this.type = type;
		this.externals = externals;
	}
	apply(compiler) {
		compiler.plugin("compile", (params) => {
			params.normalModuleFactory.apply(new ExternalModuleFactoryPlugin(this.type, this.externals));
		});
	}
}

module.exports = ExternalsPlugin;

}, function(modId) { var map = {"./ExternalModuleFactoryPlugin":1602510872315}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872315, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ExternalModule = require("./ExternalModule");

class ExternalModuleFactoryPlugin {
	constructor(type, externals) {
		this.type = type;
		this.externals = externals;
	}

	apply(normalModuleFactory) {
		const globalType = this.type;
		normalModuleFactory.plugin("factory", factory => (data, callback) => {
			const context = data.context;
			const dependency = data.dependencies[0];

			function handleExternal(value, type, callback) {
				if(typeof type === "function") {
					callback = type;
					type = undefined;
				}
				if(value === false) return factory(data, callback);
				if(value === true) value = dependency.request;
				if(typeof type === "undefined" && /^[a-z0-9]+ /.test(value)) {
					const idx = value.indexOf(" ");
					type = value.substr(0, idx);
					value = value.substr(idx + 1);
				}
				callback(null, new ExternalModule(value, type || globalType, dependency.request));
				return true;
			}
			(function handleExternals(externals, callback) {
				if(typeof externals === "string") {
					if(externals === dependency.request) {
						return handleExternal(dependency.request, callback);
					}
				} else if(Array.isArray(externals)) {
					let i = 0;
					(function next() {
						let asyncFlag;
						const handleExternalsAndCallback = function handleExternalsAndCallback(err, module) {
							if(err) return callback(err);
							if(!module) {
								if(asyncFlag) {
									asyncFlag = false;
									return;
								}
								return next();
							}
							callback(null, module);
						};

						do {
							asyncFlag = true;
							if(i >= externals.length) return callback();
							handleExternals(externals[i++], handleExternalsAndCallback);
						} while (!asyncFlag); // eslint-disable-line keyword-spacing
						asyncFlag = false;
					}());
					return;
				} else if(externals instanceof RegExp) {
					if(externals.test(dependency.request)) {
						return handleExternal(dependency.request, callback);
					}
				} else if(typeof externals === "function") {
					externals.call(null, context, dependency.request, function(err, value, type) {
						if(err) return callback(err);
						if(typeof value !== "undefined") {
							handleExternal(value, type, callback);
						} else {
							callback();
						}
					});
					return;
				} else if(typeof externals === "object" && Object.prototype.hasOwnProperty.call(externals, dependency.request)) {
					return handleExternal(externals[dependency.request], callback);
				}
				callback();
			}(this.externals, function(err, module) {
				if(err) return callback(err);
				if(!module) return handleExternal(false, callback);
				return callback(null, module);
			}));
		});
	}
}
module.exports = ExternalModuleFactoryPlugin;

}, function(modId) { var map = {"./ExternalModule":1602510872316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872316, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Module = require("./Module");
const OriginalSource = require("webpack-sources").OriginalSource;
const RawSource = require("webpack-sources").RawSource;
const WebpackMissingModule = require("./dependencies/WebpackMissingModule");
const Template = require("./Template");

class ExternalModule extends Module {
	constructor(request, type, userRequest) {
		super();
		this.request = request;
		this.userRequest = userRequest;
		this.type = type;
		this.built = false;
		this.external = true;
	}

	libIdent() {
		return this.userRequest;
	}

	chunkCondition(chunk) {
		return chunk.hasEntryModule();
	}

	identifier() {
		return "external " + JSON.stringify(this.request);
	}

	readableIdentifier() {
		return "external " + JSON.stringify(this.request);
	}

	needRebuild() {
		return false;
	}

	build(options, compilation, resolver, fs, callback) {
		this.builtTime = Date.now();
		callback();
	}

	getSourceForGlobalVariableExternal(variableName, type) {
		if(!Array.isArray(variableName)) {
			// make it an array as the look up works the same basically
			variableName = [variableName];
		}

		// needed for e.g. window["some"]["thing"]
		const objectLookup = variableName.map(r => `[${JSON.stringify(r)}]`).join("");
		return `(function() { module.exports = ${type}${objectLookup}; }());`;
	}

	getSourceForCommonJsExternal(moduleAndSpecifiers) {
		if(!Array.isArray(moduleAndSpecifiers)) {
			return `module.exports = require(${JSON.stringify(moduleAndSpecifiers)});`;
		}

		const moduleName = moduleAndSpecifiers[0];
		const objectLookup = moduleAndSpecifiers.slice(1).map(r => `[${JSON.stringify(r)}]`).join("");
		return `module.exports = require(${moduleName})${objectLookup};`;
	}

	checkExternalVariable(variableToCheck, request) {
		return `if(typeof ${variableToCheck} === 'undefined') {${WebpackMissingModule.moduleCode(request)}}\n`;
	}

	getSourceForAmdOrUmdExternal(id, optional, request) {
		const externalVariable = Template.toIdentifier(`__WEBPACK_EXTERNAL_MODULE_${id}__`);
		const missingModuleError = optional ? this.checkExternalVariable(externalVariable, request) : "";
		return `${missingModuleError}module.exports = ${externalVariable};`;
	}

	getSourceForDefaultCase(optional, request) {
		const missingModuleError = optional ? this.checkExternalVariable(request, request) : "";
		return `${missingModuleError}module.exports = ${request};`;
	}

	getSourceString() {
		const request = typeof this.request === "object" ? this.request[this.type] : this.request;
		switch(this.type) {
			case "this":
			case "window":
			case "global":
				return this.getSourceForGlobalVariableExternal(request, this.type);
			case "commonjs":
			case "commonjs2":
				return this.getSourceForCommonJsExternal(request);
			case "amd":
			case "umd":
			case "umd2":
				return this.getSourceForAmdOrUmdExternal(this.id, this.optional, request);
			default:
				return this.getSourceForDefaultCase(this.optional, request);
		}
	}

	getSource(sourceString) {
		if(this.useSourceMap) {
			return new OriginalSource(sourceString, this.identifier());
		}

		return new RawSource(sourceString);
	}

	source() {
		return this.getSource(
			this.getSourceString()
		);
	}

	size() {
		return 42;
	}

	updateHash(hash) {
		hash.update(this.type);
		hash.update(JSON.stringify(this.request));
		hash.update(JSON.stringify(Boolean(this.optional)));
		super.updateHash(hash);
	}
}

module.exports = ExternalModule;

}, function(modId) { var map = {"./Module":1602510872132,"./dependencies/WebpackMissingModule":1602510872219,"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872317, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const SetVarMainTemplatePlugin = require("./SetVarMainTemplatePlugin");

function accessorToObjectAccess(accessor) {
	return accessor.map((a) => {
		return `[${JSON.stringify(a)}]`;
	}).join("");
}

function accessorAccess(base, accessor, joinWith) {
	accessor = [].concat(accessor);
	return accessor.map((a, idx) => {
		a = base ?
			base + accessorToObjectAccess(accessor.slice(0, idx + 1)) :
			accessor[0] + accessorToObjectAccess(accessor.slice(1, idx + 1));
		if(idx === accessor.length - 1) return a;
		if(idx === 0 && typeof base === "undefined") return `${a} = typeof ${a} === "object" ? ${a} : {}`;
		return `${a} = ${a} || {}`;
	}).join(joinWith || "; ");
}

class LibraryTemplatePlugin {

	constructor(name, target, umdNamedDefine, auxiliaryComment, exportProperty) {
		this.name = name;
		this.target = target;
		this.umdNamedDefine = umdNamedDefine;
		this.auxiliaryComment = auxiliaryComment;
		this.exportProperty = exportProperty;
	}

	apply(compiler) {
		compiler.plugin("this-compilation", (compilation) => {
			if(this.exportProperty) {
				var ExportPropertyMainTemplatePlugin = require("./ExportPropertyMainTemplatePlugin");
				compilation.apply(new ExportPropertyMainTemplatePlugin(this.exportProperty));
			}
			switch(this.target) {
				case "var":
					compilation.apply(new SetVarMainTemplatePlugin(`var ${accessorAccess(false, this.name)}`));
					break;
				case "assign":
					compilation.apply(new SetVarMainTemplatePlugin(accessorAccess(undefined, this.name)));
					break;
				case "this":
				case "window":
				case "global":
					if(this.name)
						compilation.apply(new SetVarMainTemplatePlugin(accessorAccess(this.target, this.name)));
					else
						compilation.apply(new SetVarMainTemplatePlugin(this.target, true));
					break;
				case "commonjs":
					if(this.name)
						compilation.apply(new SetVarMainTemplatePlugin(accessorAccess("exports", this.name)));
					else
						compilation.apply(new SetVarMainTemplatePlugin("exports", true));
					break;
				case "commonjs2":
				case "commonjs-module":
					compilation.apply(new SetVarMainTemplatePlugin("module.exports"));
					break;
				case "amd":
					var AmdMainTemplatePlugin = require("./AmdMainTemplatePlugin");
					compilation.apply(new AmdMainTemplatePlugin(this.name));
					break;
				case "umd":
				case "umd2":
					var UmdMainTemplatePlugin = require("./UmdMainTemplatePlugin");
					compilation.apply(new UmdMainTemplatePlugin(this.name, {
						optionalAmdExternalAsGlobal: this.target === "umd2",
						namedDefine: this.umdNamedDefine,
						auxiliaryComment: this.auxiliaryComment
					}));
					break;
				case "jsonp":
					var JsonpExportMainTemplatePlugin = require("./JsonpExportMainTemplatePlugin");
					compilation.apply(new JsonpExportMainTemplatePlugin(this.name));
					break;
				default:
					throw new Error(`${this.target} is not a valid Library target`);
			}
		});
	}
}

module.exports = LibraryTemplatePlugin;

}, function(modId) { var map = {"./SetVarMainTemplatePlugin":1602510872318,"./ExportPropertyMainTemplatePlugin":1602510872319,"./AmdMainTemplatePlugin":1602510872320,"./UmdMainTemplatePlugin":1602510872321,"./JsonpExportMainTemplatePlugin":1602510872322}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872318, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

class SetVarMainTemplatePlugin {
	constructor(varExpression, copyObject) {
		this.varExpression = varExpression;
		this.copyObject = copyObject;
	}

	apply(compilation) {
		const mainTemplate = compilation.mainTemplate;
		compilation.templatesPlugin("render-with-entry", (source, chunk, hash) => {
			const varExpression = mainTemplate.applyPluginsWaterfall("asset-path", this.varExpression, {
				hash,
				chunk
			});
			if(this.copyObject) {
				return new ConcatSource(`(function(e, a) { for(var i in a) e[i] = a[i]; }(${varExpression}, `, source, "))");
			} else {
				const prefix = `${varExpression} =\n`;
				return new ConcatSource(prefix, source);
			}
		});
		mainTemplate.plugin("global-hash-paths", (paths) => {
			if(this.varExpression) paths.push(this.varExpression);
			return paths;
		});
		mainTemplate.plugin("hash", hash => {
			hash.update("set var");
			hash.update(`${this.varExpression}`);
			hash.update(`${this.copyObject}`);
		});
	}
}

module.exports = SetVarMainTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872319, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

function accessorToObjectAccess(accessor) {
	return accessor.map(a => `[${JSON.stringify(a)}]`).join("");
}

class ExportPropertyMainTemplatePlugin {
	constructor(property) {
		this.property = property;
	}

	apply(compilation) {
		const mainTemplate = compilation.mainTemplate;
		compilation.templatesPlugin("render-with-entry", (source, chunk, hash) => {
			const postfix = `${accessorToObjectAccess([].concat(this.property))}`;
			return new ConcatSource(source, postfix);
		});
		mainTemplate.plugin("hash", hash => {
			hash.update("export property");
			hash.update(`${this.property}`);
		});
	}
}

module.exports = ExportPropertyMainTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872320, function(require, module, exports) {
/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */



const ConcatSource = require("webpack-sources").ConcatSource;
const Template = require("./Template");

class AmdMainTemplatePlugin {
	constructor(name) {
		this.name = name;
	}

	apply(compilation) {
		const mainTemplate = compilation.mainTemplate;

		compilation.templatesPlugin("render-with-entry", (source, chunk, hash) => {
			const externals = chunk.getModules().filter((m) => m.external);
			const externalsDepsArray = JSON.stringify(externals.map((m) =>
				typeof m.request === "object" ? m.request.amd : m.request
			));
			const externalsArguments = externals.map((m) =>
				Template.toIdentifier(`__WEBPACK_EXTERNAL_MODULE_${m.id}__`)
			).join(", ");

			if(this.name) {
				const name = mainTemplate.applyPluginsWaterfall("asset-path", this.name, {
					hash,
					chunk
				});

				return new ConcatSource(
					`define(${JSON.stringify(name)}, ${externalsDepsArray}, function(${externalsArguments}) { return `, source, "});"
				);
			} else if(externalsArguments) {
				return new ConcatSource(`define(${externalsDepsArray}, function(${externalsArguments}) { return `, source, "});");
			} else {
				return new ConcatSource("define(function() { return ", source, "});");
			}
		});

		mainTemplate.plugin("global-hash-paths", (paths) => {
			if(this.name) paths.push(this.name);
			return paths;
		});

		mainTemplate.plugin("hash", (hash) => {
			hash.update("exports amd");
			hash.update(this.name);
		});
	}
}

module.exports = AmdMainTemplatePlugin;

}, function(modId) { var map = {"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872321, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;
const OriginalSource = require("webpack-sources").OriginalSource;
const Template = require("./Template");

function accessorToObjectAccess(accessor) {
	return accessor.map(a => `[${JSON.stringify(a)}]`).join("");
}

function accessorAccess(base, accessor) {
	accessor = [].concat(accessor);
	return accessor.map((a, idx) => {
		a = base + accessorToObjectAccess(accessor.slice(0, idx + 1));
		if(idx === accessor.length - 1) return a;
		return `${a} = ${a} || {}`;
	}).join(", ");
}

class UmdMainTemplatePlugin {
	constructor(name, options) {
		if(typeof name === "object" && !Array.isArray(name)) {
			this.name = name.root || name.amd || name.commonjs;
			this.names = name;
		} else {
			this.name = name;
			this.names = {
				commonjs: name,
				root: name,
				amd: name
			};
		}
		this.optionalAmdExternalAsGlobal = options.optionalAmdExternalAsGlobal;
		this.namedDefine = options.namedDefine;
		this.auxiliaryComment = options.auxiliaryComment;
	}

	apply(compilation) {
		const mainTemplate = compilation.mainTemplate;
		compilation.templatesPlugin("render-with-entry", (source, chunk, hash) => {
			let externals = chunk.getModules().filter(m => m.external && (m.type === "umd" || m.type === "umd2"));
			const optionalExternals = [];
			let requiredExternals = [];
			if(this.optionalAmdExternalAsGlobal) {
				externals.forEach(m => {
					if(m.optional) {
						optionalExternals.push(m);
					} else {
						requiredExternals.push(m);
					}
				});
				externals = requiredExternals.concat(optionalExternals);
			} else {
				requiredExternals = externals;
			}

			function replaceKeys(str) {
				return mainTemplate.applyPluginsWaterfall("asset-path", str, {
					hash,
					chunk
				});
			}

			function externalsDepsArray(modules) {
				return `[${replaceKeys(modules.map(m => JSON.stringify(typeof m.request === "object" ? m.request.amd : m.request)).join(", "))}]`;
			}

			function externalsRootArray(modules) {
				return replaceKeys(modules.map(m => {
					let request = m.request;
					if(typeof request === "object") request = request.root;
					return `root${accessorToObjectAccess([].concat(request))}`;
				}).join(", "));
			}

			function externalsRequireArray(type) {
				return replaceKeys(externals.map(m => {
					let expr;
					let request = m.request;
					if(typeof request === "object") request = request[type];
					if(typeof request === "undefined") throw new Error("Missing external configuration for type:" + type);
					if(Array.isArray(request)) {
						expr = `require(${JSON.stringify(request[0])})${accessorToObjectAccess(request.slice(1))}`;
					} else
						expr = `require(${JSON.stringify(request)})`;
					if(m.optional) {
						expr = `(function webpackLoadOptionalExternalModule() { try { return ${expr}; } catch(e) {} }())`;
					}
					return expr;
				}).join(", "));
			}

			function externalsArguments(modules) {
				return modules.map(m => Template.toIdentifier(`__WEBPACK_EXTERNAL_MODULE_${m.id}__`)).join(", ");
			}

			function libraryName(library) {
				return JSON.stringify(replaceKeys([].concat(library).pop()));
			}

			let amdFactory;
			if(optionalExternals.length > 0) {
				const wrapperArguments = externalsArguments(requiredExternals);
				const factoryArguments = requiredExternals.length > 0 ?
					externalsArguments(requiredExternals) + ", " + externalsRootArray(optionalExternals) :
					externalsRootArray(optionalExternals);
				amdFactory = `function webpackLoadOptionalExternalModuleAmd(${wrapperArguments}) {\n` +
					`			return factory(${factoryArguments});\n` +
					"		}";
			} else {
				amdFactory = "factory";
			}

			return new ConcatSource(new OriginalSource(
				"(function webpackUniversalModuleDefinition(root, factory) {\n" +
				(this.auxiliaryComment &&
					typeof this.auxiliaryComment === "string" ?
					"   //" + this.auxiliaryComment + "\n" :
					this.auxiliaryComment.commonjs2 ?
					"   //" + this.auxiliaryComment.commonjs2 + "\n" :
					""
				) +
				"	if(typeof exports === 'object' && typeof module === 'object')\n" +
				"		module.exports = factory(" + externalsRequireArray("commonjs2") + ");\n" +
				(this.auxiliaryComment &&
					typeof this.auxiliaryComment === "string" ?
					"   //" + this.auxiliaryComment + "\n" :
					this.auxiliaryComment.amd ?
					"   //" + this.auxiliaryComment.amd + "\n" :
					""
				) +
				"	else if(typeof define === 'function' && define.amd)\n" +
				(requiredExternals.length > 0 ?
					(this.names.amd && this.namedDefine === true ?
						"		define(" + libraryName(this.names.amd) + ", " + externalsDepsArray(requiredExternals) + ", " + amdFactory + ");\n" :
						"		define(" + externalsDepsArray(requiredExternals) + ", " + amdFactory + ");\n"
					) :
					(this.names.amd && this.namedDefine === true ?
						"		define(" + libraryName(this.names.amd) + ", [], " + amdFactory + ");\n" :
						"		define([], " + amdFactory + ");\n"
					)
				) +
				(this.names.root || this.names.commonjs ?
					(this.auxiliaryComment &&
						typeof this.auxiliaryComment === "string" ?
						"   //" + this.auxiliaryComment + "\n" :
						this.auxiliaryComment.commonjs ?
						"   //" + this.auxiliaryComment.commonjs + "\n" :
						""
					) +
					"	else if(typeof exports === 'object')\n" +
					"		exports[" + libraryName(this.names.commonjs || this.names.root) + "] = factory(" + externalsRequireArray("commonjs") + ");\n" +
					(this.auxiliaryComment &&
						typeof this.auxiliaryComment === "string" ?
						"   //" + this.auxiliaryComment + "\n" :
						this.auxiliaryComment.root ?
						"   //" + this.auxiliaryComment.root + "\n" :
						""
					) +
					"	else\n" +
					"		" + replaceKeys(accessorAccess("root", this.names.root || this.names.commonjs)) + " = factory(" + externalsRootArray(externals) + ");\n" :
					"	else {\n" +
					(externals.length > 0 ?
						"		var a = typeof exports === 'object' ? factory(" + externalsRequireArray("commonjs") + ") : factory(" + externalsRootArray(externals) + ");\n" :
						"		var a = factory();\n"
					) +
					"		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];\n" +
					"	}\n"
				) +
				"})(typeof self !== 'undefined' ? self : this, function(" + externalsArguments(externals) + ") {\nreturn ", "webpack/universalModuleDefinition"), source, ";\n})");
		});
		mainTemplate.plugin("global-hash-paths", (paths) => {
			if(this.names.root) paths = paths.concat(this.names.root);
			if(this.names.amd) paths = paths.concat(this.names.amd);
			if(this.names.commonjs) paths = paths.concat(this.names.commonjs);
			return paths;
		});
		mainTemplate.plugin("hash", (hash) => {
			hash.update("umd");
			hash.update(`${this.names.root}`);
			hash.update(`${this.names.amd}`);
			hash.update(`${this.names.commonjs}`);
		});
	}
}

module.exports = UmdMainTemplatePlugin;

}, function(modId) { var map = {"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872322, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConcatSource = require("webpack-sources").ConcatSource;

class JsonpExportMainTemplatePlugin {
	constructor(name) {
		this.name = name;
	}

	apply(compilation) {
		const mainTemplate = compilation.mainTemplate;

		compilation.templatesPlugin("render-with-entry", (source, chunk, hash) => {
			const name = mainTemplate.applyPluginsWaterfall("asset-path", this.name || "", {
				hash: hash,
				chunk: chunk
			});
			return new ConcatSource(`${name}(`, source, ");");
		});

		mainTemplate.plugin("global-hash-paths", paths => {
			if(this.name) paths.push(this.name);
			return paths;
		});

		mainTemplate.plugin("hash", hash => {
			hash.update("jsonp export");
			hash.update(`${this.name}`);
		});
	}
}

module.exports = JsonpExportMainTemplatePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872323, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const asyncLib = require("async");

class CachePlugin {
	constructor(cache) {
		this.cache = cache || {};
		this.FS_ACCURENCY = 2000;
	}

	apply(compiler) {
		if(Array.isArray(compiler.compilers)) {
			compiler.compilers.forEach((c, idx) => {
				c.apply(new CachePlugin(this.cache[idx] = this.cache[idx] || {}));
			});
		} else {
			const registerCacheToCompiler = (compiler, cache) => {
				compiler.plugin("this-compilation", compilation => {
					// TODO remove notCacheable for webpack 4
					if(!compilation.notCacheable) {
						compilation.cache = cache;
						compilation.plugin("child-compiler", (childCompiler, compilerName, compilerIndex) => {
							if(cache) {
								let childCache;
								if(!cache.children) cache.children = {};
								if(!cache.children[compilerName]) cache.children[compilerName] = [];
								if(cache.children[compilerName][compilerIndex])
									childCache = cache.children[compilerName][compilerIndex];
								else
									cache.children[compilerName].push(childCache = {});
								registerCacheToCompiler(childCompiler, childCache);
							}
						});
					} else if(this.watching) {
						compilation.warnings.push(
							new Error(`CachePlugin - Cache cannot be used because of: ${compilation.notCacheable}`)
						);
					}
				});
			};
			registerCacheToCompiler(compiler, this.cache);
			compiler.plugin("watch-run", (compiler, callback) => {
				this.watching = true;
				callback();
			});
			compiler.plugin("run", (compiler, callback) => {
				if(!compiler._lastCompilationFileDependencies) return callback();
				const fs = compiler.inputFileSystem;
				const fileTs = compiler.fileTimestamps = {};
				asyncLib.forEach(compiler._lastCompilationFileDependencies, (file, callback) => {
					fs.stat(file, (err, stat) => {
						if(err) {
							if(err.code === "ENOENT") return callback();
							return callback(err);
						}

						if(stat.mtime)
							this.applyMtime(+stat.mtime);

						fileTs[file] = +stat.mtime || Infinity;
						callback();
					});
				}, err => {
					if(err) return callback(err);
					Object.keys(fileTs).forEach(key => {
						fileTs[key] += this.FS_ACCURENCY;
					});
					callback();
				});
			});
			compiler.plugin("after-compile", function(compilation, callback) {
				compilation.compiler._lastCompilationFileDependencies = compilation.fileDependencies;
				compilation.compiler._lastCompilationContextDependencies = compilation.contextDependencies;
				callback();
			});
		}
	}

	/* istanbul ignore next */
	applyMtime(mtime) {
		if(this.FS_ACCURENCY > 1 && mtime % 2 !== 0)
			this.FS_ACCURENCY = 1;
		else if(this.FS_ACCURENCY > 10 && mtime % 20 !== 0)
			this.FS_ACCURENCY = 10;
		else if(this.FS_ACCURENCY > 100 && mtime % 200 !== 0)
			this.FS_ACCURENCY = 100;
		else if(this.FS_ACCURENCY > 1000 && mtime % 2000 !== 0)
			this.FS_ACCURENCY = 1000;
	}
}
module.exports = CachePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872324, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const OptionsDefaulter = require("./OptionsDefaulter");
const Template = require("./Template");

class WebpackOptionsDefaulter extends OptionsDefaulter {
	constructor() {
		super();
		this.set("devtool", false);
		this.set("cache", true);

		this.set("context", process.cwd());
		this.set("target", "web");

		this.set("module", "call", value => Object.assign({}, value));
		this.set("module.unknownContextRequest", ".");
		this.set("module.unknownContextRegExp", false);
		this.set("module.unknownContextRecursive", true);
		this.set("module.unknownContextCritical", true);
		this.set("module.exprContextRequest", ".");
		this.set("module.exprContextRegExp", false);
		this.set("module.exprContextRecursive", true);
		this.set("module.exprContextCritical", true);
		this.set("module.wrappedContextRegExp", /.*/);
		this.set("module.wrappedContextRecursive", true);
		this.set("module.wrappedContextCritical", false);
		this.set("module.strictExportPresence", false);
		this.set("module.strictThisContextOnImports", false);
		this.set("module.unsafeCache", true);

		this.set("output", "call", (value, options) => {
			if(typeof value === "string") {
				return {
					filename: value
				};
			} else if(typeof value !== "object") {
				return {};
			} else {
				return Object.assign({}, value);
			}
		});
		this.set("output.filename", "[name].js");
		this.set("output.chunkFilename", "make", (options) => {
			const filename = options.output.filename;
			return filename.indexOf("[name]") >= 0 ? filename.replace("[name]", "[id]") : "[id]." + filename;
		});
		this.set("output.library", "");
		this.set("output.hotUpdateFunction", "make", (options) => {
			return Template.toIdentifier("webpackHotUpdate" + options.output.library);
		});
		this.set("output.jsonpFunction", "make", (options) => {
			return Template.toIdentifier("webpackJsonp" + options.output.library);
		});
		this.set("output.libraryTarget", "var");
		this.set("output.path", process.cwd());
		this.set("output.sourceMapFilename", "[file].map[query]");
		this.set("output.hotUpdateChunkFilename", "[id].[hash].hot-update.js");
		this.set("output.hotUpdateMainFilename", "[hash].hot-update.json");
		this.set("output.crossOriginLoading", false);
		this.set("output.jsonpScriptType", "text/javascript");
		this.set("output.chunkLoadTimeout", 120000);
		this.set("output.hashFunction", "md5");
		this.set("output.hashDigest", "hex");
		this.set("output.hashDigestLength", 20);
		this.set("output.devtoolLineToLine", false);
		this.set("output.strictModuleExceptionHandling", false);

		this.set("node", "call", value => {
			if(typeof value === "boolean") {
				return value;
			} else {
				return Object.assign({}, value);
			}
		});
		this.set("node.console", false);
		this.set("node.process", true);
		this.set("node.global", true);
		this.set("node.Buffer", true);
		this.set("node.setImmediate", true);
		this.set("node.__filename", "mock");
		this.set("node.__dirname", "mock");

		this.set("performance", "call", value => {
			if(typeof value === "boolean") {
				return value;
			} else {
				return Object.assign({}, value);
			}
		});
		this.set("performance.maxAssetSize", 250000);
		this.set("performance.maxEntrypointSize", 250000);
		this.set("performance.hints", false);

		this.set("resolve", "call", value => Object.assign({}, value));
		this.set("resolve.unsafeCache", true);
		this.set("resolve.modules", ["node_modules"]);
		this.set("resolve.extensions", [".js", ".json"]);
		this.set("resolve.mainFiles", ["index"]);
		this.set("resolve.aliasFields", "make", (options) => {
			if(options.target === "web" || options.target === "webworker")
				return ["browser"];
			else
				return [];
		});
		this.set("resolve.mainFields", "make", (options) => {
			if(options.target === "web" || options.target === "webworker")
				return ["browser", "module", "main"];
			else
				return ["module", "main"];
		});
		this.set("resolve.cacheWithContext", "make", (options) => {
			return Array.isArray(options.resolve.plugins) && options.resolve.plugins.length > 0;
		});

		this.set("resolveLoader", "call", value => Object.assign({}, value));
		this.set("resolveLoader.unsafeCache", true);
		this.set("resolveLoader.mainFields", ["loader", "main"]);
		this.set("resolveLoader.extensions", [".js", ".json"]);
		this.set("resolveLoader.mainFiles", ["index"]);
		this.set("resolveLoader.cacheWithContext", "make", (options) => {
			return Array.isArray(options.resolveLoader.plugins) && options.resolveLoader.plugins.length > 0;
		});
	}
}

module.exports = WebpackOptionsDefaulter;

}, function(modId) { var map = {"./OptionsDefaulter":1602510872325,"./Template":1602510872137}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872325, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


function getProperty(obj, name) {
	name = name.split(".");
	for(let i = 0; i < name.length - 1; i++) {
		obj = obj[name[i]];
		if(typeof obj !== "object" || !obj) return;
	}
	return obj[name.pop()];
}

function setProperty(obj, name, value) {
	name = name.split(".");
	for(let i = 0; i < name.length - 1; i++) {
		if(typeof obj[name[i]] !== "object" && typeof obj[name[i]] !== "undefined") return;
		if(!obj[name[i]]) obj[name[i]] = {};
		obj = obj[name[i]];
	}
	obj[name.pop()] = value;
}

class OptionsDefaulter {
	constructor() {
		this.defaults = {};
		this.config = {};
	}

	process(options) {
		// TODO: change this for webpack 4: options = Object.assign({}, options);
		for(let name in this.defaults) {
			switch(this.config[name]) {
				case undefined:
					if(getProperty(options, name) === undefined)
						setProperty(options, name, this.defaults[name]);
					break;
				case "call":
					setProperty(options, name, this.defaults[name].call(this, getProperty(options, name), options), options);
					break;
				case "make":
					if(getProperty(options, name) === undefined)
						setProperty(options, name, this.defaults[name].call(this, options), options);
					break;
				case "append":
					{
						let oldValue = getProperty(options, name);
						if(!Array.isArray(oldValue)) oldValue = [];
						oldValue.push.apply(oldValue, this.defaults[name]);
						setProperty(options, name, oldValue);
						break;
					}
				default:
					throw new Error("OptionsDefaulter cannot process " + this.config[name]);
			}
		}
		// TODO: change this for webpack 4: return options;
	}

	set(name, config, def) {
		if(arguments.length === 3) {
			this.defaults[name] = def;
			this.config[name] = config;
		} else {
			this.defaults[name] = config;
			delete this.config[name];
		}
	}
}

module.exports = OptionsDefaulter;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872326, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Gajus Kuizinas @gajus
*/


const Ajv = require("ajv");
const ajv = new Ajv({
	errorDataPath: "configuration",
	allErrors: true,
	verbose: true
});
require("ajv-keywords")(ajv, ["instanceof"]);
require("../schemas/ajv.absolutePath")(ajv);

function validateSchema(schema, options) {
	if(Array.isArray(options)) {
		const errors = options.map((options) => validateObject(schema, options));
		errors.forEach((list, idx) => {
			list.forEach(function applyPrefix(err) {
				err.dataPath = `[${idx}]${err.dataPath}`;
				if(err.children) {
					err.children.forEach(applyPrefix);
				}
			});
		});
		return errors.reduce((arr, items) => {
			return arr.concat(items);
		}, []);
	} else {
		return validateObject(schema, options);
	}
}

function validateObject(schema, options) {
	const validate = ajv.compile(schema);
	const valid = validate(options);
	return valid ? [] : filterErrors(validate.errors);
}

function filterErrors(errors) {
	let newErrors = [];
	errors.forEach((err) => {
		const dataPath = err.dataPath;
		let children = [];
		newErrors = newErrors.filter((oldError) => {
			if(oldError.dataPath.includes(dataPath)) {
				if(oldError.children) {
					children = children.concat(oldError.children.slice(0));
				}
				oldError.children = undefined;
				children.push(oldError);
				return false;
			}
			return true;
		});
		if(children.length) {
			err.children = children;
		}
		newErrors.push(err);
	});

	return newErrors;
}

module.exports = validateSchema;

}, function(modId) { var map = {"../schemas/ajv.absolutePath":1602510872327}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872327, function(require, module, exports) {


const getErrorFor = (shouldBeAbsolute, data, schema) => {
	const message = shouldBeAbsolute ?
		`The provided value ${JSON.stringify(data)} is not an absolute path!`
		: `A relative path is expected. However the provided value ${JSON.stringify(data)} is an absolute path!`;

	return {
		keyword: "absolutePath",
		params: { absolutePath: data },
		message: message,
		parentSchema: schema,
	};
};
module.exports = (ajv) => ajv.addKeyword("absolutePath", {
	errors: true,
	type: "string",
	compile(expected, schema) {
		function callback(data) {
			const passes = expected === /^(?:[A-Za-z]:\\|\/)/.test(data);
			if(!passes) {
				callback.errors = [getErrorFor(expected, data, schema)];
			}
			return passes;
		}
		callback.errors = [];
		return callback;
	}
});

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872328, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Gajus Kuizinas @gajus
*/


const WebpackError = require("./WebpackError");
const webpackOptionsSchema = require("../schemas/webpackOptionsSchema.json");

const getSchemaPart = (path, parents, additionalPath) => {
	parents = parents || 0;
	path = path.split("/");
	path = path.slice(0, path.length - parents);
	if(additionalPath) {
		additionalPath = additionalPath.split("/");
		path = path.concat(additionalPath);
	}
	let schemaPart = webpackOptionsSchema;
	for(let i = 1; i < path.length; i++) {
		const inner = schemaPart[path[i]];
		if(inner)
			schemaPart = inner;
	}
	return schemaPart;
};

const getSchemaPartText = (schemaPart, additionalPath) => {
	if(additionalPath) {
		for(let i = 0; i < additionalPath.length; i++) {
			const inner = schemaPart[additionalPath[i]];
			if(inner)
				schemaPart = inner;
		}
	}
	while(schemaPart.$ref) schemaPart = getSchemaPart(schemaPart.$ref);
	let schemaText = WebpackOptionsValidationError.formatSchema(schemaPart);
	if(schemaPart.description)
		schemaText += `\n-> ${schemaPart.description}`;
	return schemaText;
};

const getSchemaPartDescription = schemaPart => {
	while(schemaPart.$ref) schemaPart = getSchemaPart(schemaPart.$ref);
	if(schemaPart.description)
		return `\n-> ${schemaPart.description}`;
	return "";
};

const filterChildren = children => {
	return children.filter(err => err.keyword !== "anyOf" && err.keyword !== "allOf" && err.keyword !== "oneOf");
};

const indent = (str, prefix, firstLine) => {
	if(firstLine) {
		return prefix + str.replace(/\n(?!$)/g, "\n" + prefix);
	} else {
		return str.replace(/\n(?!$)/g, `\n${prefix}`);
	}
};

class WebpackOptionsValidationError extends WebpackError {
	constructor(validationErrors) {
		super();

		this.name = "WebpackOptionsValidationError";
		this.message = "Invalid configuration object. " +
			"Webpack has been initialised using a configuration object that does not match the API schema.\n" +
			validationErrors.map(err => " - " + indent(WebpackOptionsValidationError.formatValidationError(err), "   ", false)).join("\n");
		this.validationErrors = validationErrors;

		Error.captureStackTrace(this, this.constructor);
	}

	static formatSchema(schema, prevSchemas) {
		prevSchemas = prevSchemas || [];

		const formatInnerSchema = (innerSchema, addSelf) => {
			if(!addSelf) return WebpackOptionsValidationError.formatSchema(innerSchema, prevSchemas);
			if(prevSchemas.indexOf(innerSchema) >= 0) return "(recursive)";
			return WebpackOptionsValidationError.formatSchema(innerSchema, prevSchemas.concat(schema));
		};

		if(schema.type === "string") {
			if(schema.minLength === 1)
				return "non-empty string";
			else if(schema.minLength > 1)
				return `string (min length ${schema.minLength})`;
			return "string";
		} else if(schema.type === "boolean") {
			return "boolean";
		} else if(schema.type === "number") {
			return "number";
		} else if(schema.type === "object") {
			if(schema.properties) {
				const required = schema.required || [];
				return `object { ${Object.keys(schema.properties).map(property => {
					if(required.indexOf(property) < 0) return property + "?";
					return property;
				}).concat(schema.additionalProperties ? ["..."] : []).join(", ")} }`;
			}
			if(schema.additionalProperties) {
				return `object { <key>: ${formatInnerSchema(schema.additionalProperties)} }`;
			}
			return "object";
		} else if(schema.type === "array") {
			return `[${formatInnerSchema(schema.items)}]`;
		}

		switch(schema.instanceof) {
			case "Function":
				return "function";
			case "RegExp":
				return "RegExp";
		}
		if(schema.$ref) return formatInnerSchema(getSchemaPart(schema.$ref), true);
		if(schema.allOf) return schema.allOf.map(formatInnerSchema).join(" & ");
		if(schema.oneOf) return schema.oneOf.map(formatInnerSchema).join(" | ");
		if(schema.anyOf) return schema.anyOf.map(formatInnerSchema).join(" | ");
		if(schema.enum) return schema.enum.map(item => JSON.stringify(item)).join(" | ");
		return JSON.stringify(schema, 0, 2);
	}

	static formatValidationError(err) {
		const dataPath = `configuration${err.dataPath}`;
		if(err.keyword === "additionalProperties") {
			const baseMessage = `${dataPath} has an unknown property '${err.params.additionalProperty}'. These properties are valid:\n${getSchemaPartText(err.parentSchema)}`;
			if(!err.dataPath) {
				switch(err.params.additionalProperty) {
					case "debug":
						return `${baseMessage}\n` +
							"The 'debug' property was removed in webpack 2.\n" +
							"Loaders should be updated to allow passing this option via loader options in module.rules.\n" +
							"Until loaders are updated one can use the LoaderOptionsPlugin to switch loaders into debug mode:\n" +
							"plugins: [\n" +
							"  new webpack.LoaderOptionsPlugin({\n" +
							"    debug: true\n" +
							"  })\n" +
							"]";
				}
				return baseMessage + "\n" +
					"For typos: please correct them.\n" +
					"For loader options: webpack 2 no longer allows custom properties in configuration.\n" +
					"  Loaders should be updated to allow passing options via loader options in module.rules.\n" +
					"  Until loaders are updated one can use the LoaderOptionsPlugin to pass these options to the loader:\n" +
					"  plugins: [\n" +
					"    new webpack.LoaderOptionsPlugin({\n" +
					"      // test: /\\.xxx$/, // may apply this only for some modules\n" +
					"      options: {\n" +
					`        ${err.params.additionalProperty}: ...\n` +
					"      }\n" +
					"    })\n" +
					"  ]";
			}
			return baseMessage;
		} else if(err.keyword === "oneOf" || err.keyword === "anyOf") {
			if(err.children && err.children.length > 0) {
				if(err.schema.length === 1) {
					const lastChild = err.children[err.children.length - 1];
					const remainingChildren = err.children.slice(0, err.children.length - 1);
					return WebpackOptionsValidationError.formatValidationError(Object.assign({}, lastChild, {
						children: remainingChildren,
						parentSchema: Object.assign({}, err.parentSchema, lastChild.parentSchema)
					}));
				}
				return `${dataPath} should be one of these:\n${getSchemaPartText(err.parentSchema)}\n` +
					`Details:\n${filterChildren(err.children).map(err => " * " + indent(WebpackOptionsValidationError.formatValidationError(err), "   ", false)).join("\n")}`;
			}
			return `${dataPath} should be one of these:\n${getSchemaPartText(err.parentSchema)}`;

		} else if(err.keyword === "enum") {
			if(err.parentSchema && err.parentSchema.enum && err.parentSchema.enum.length === 1) {
				return `${dataPath} should be ${getSchemaPartText(err.parentSchema)}`;
			}
			return `${dataPath} should be one of these:\n${getSchemaPartText(err.parentSchema)}`;
		} else if(err.keyword === "allOf") {
			return `${dataPath} should be:\n${getSchemaPartText(err.parentSchema)}`;
		} else if(err.keyword === "type") {
			switch(err.params.type) {
				case "object":
					return `${dataPath} should be an object.${getSchemaPartDescription(err.parentSchema)}`;
				case "string":
					return `${dataPath} should be a string.${getSchemaPartDescription(err.parentSchema)}`;
				case "boolean":
					return `${dataPath} should be a boolean.${getSchemaPartDescription(err.parentSchema)}`;
				case "number":
					return `${dataPath} should be a number.${getSchemaPartDescription(err.parentSchema)}`;
				case "array":
					return `${dataPath} should be an array:\n${getSchemaPartText(err.parentSchema)}`;
			}
			return `${dataPath} should be ${err.params.type}:\n${getSchemaPartText(err.parentSchema)}`;
		} else if(err.keyword === "instanceof") {
			return `${dataPath} should be an instance of ${getSchemaPartText(err.parentSchema)}`;
		} else if(err.keyword === "required") {
			const missingProperty = err.params.missingProperty.replace(/^\./, "");
			return `${dataPath} misses the property '${missingProperty}'.\n${getSchemaPartText(err.parentSchema, ["properties", missingProperty])}`;
		} else if(err.keyword === "minimum") {
			return `${dataPath} ${err.message}.${getSchemaPartDescription(err.parentSchema)}`;
		} else if(err.keyword === "uniqueItems") {
			return `${dataPath} should not contain the item '${err.data[err.params.i]}' twice.${getSchemaPartDescription(err.parentSchema)}`;
		} else if(err.keyword === "minLength" || err.keyword === "minItems" || err.keyword === "minProperties") {
			if(err.params.limit === 1)
				return `${dataPath} should not be empty.${getSchemaPartDescription(err.parentSchema)}`;
			else
				return `${dataPath} ${err.message}${getSchemaPartDescription(err.parentSchema)}`;
		} else if(err.keyword === "absolutePath") {
			const baseMessage = `${dataPath}: ${err.message}${getSchemaPartDescription(err.parentSchema)}`;
			if(dataPath === "configuration.output.filename") {
				return `${baseMessage}\n` +
					"Please use output.path to specify absolute path and output.filename for the file name.";
			}
			return baseMessage;
		} else {
			// eslint-disable-line no-fallthrough
			return `${dataPath} ${err.message} (${JSON.stringify(err, 0, 2)}).\n${getSchemaPartText(err.parentSchema)}`;
		}
	}
}

module.exports = WebpackOptionsValidationError;

}, function(modId) { var map = {"./WebpackError":1602510872127,"../schemas/webpackOptionsSchema.json":1602510872329}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872329, function(require, module, exports) {
module.exports = {
  "additionalProperties": false,
  "definitions": {
    "common.arrayOfStringOrStringArrayValues": {
      "items": {
        "description": "string or array of strings",
        "anyOf": [
          {
            "minLength": 1,
            "type": "string"
          },
          {
            "items": {
              "description": "A non-empty string",
              "minLength": 1,
              "type": "string"
            },
            "type": "array"
          }
        ]
      },
      "type": "array"
    },
    "common.arrayOfStringValues": {
      "items": {
        "description": "A non-empty string",
        "minLength": 1,
        "type": "string"
      },
      "type": "array"
    },
    "common.nonEmptyArrayOfUniqueStringValues": {
      "items": {
        "description": "A non-empty string",
        "minLength": 1,
        "type": "string"
      },
      "minItems": 1,
      "type": "array",
      "uniqueItems": true
    },
    "entry": {
      "oneOf": [
        {
          "minProperties": 1,
          "additionalProperties": {
            "description": "An entry point with name",
            "oneOf": [
              {
                "description": "The string is resolved to a module which is loaded upon startup.",
                "minLength": 1,
                "type": "string"
              },
              {
                "description": "All modules are loaded upon startup. The last one is exported.",
                "anyOf": [
                  {
                    "$ref": "#/definitions/common.nonEmptyArrayOfUniqueStringValues"
                  }
                ]
              }
            ]
          },
          "description": "Multiple entry bundles are created. The key is the chunk name. The value can be a string or an array.",
          "type": "object"
        },
        {
          "description": "An entry point without name. The string is resolved to a module which is loaded upon startup.",
          "minLength": 1,
          "type": "string"
        },
        {
          "description": "An entry point without name. All modules are loaded upon startup. The last one is exported.",
          "anyOf": [
            {
              "$ref": "#/definitions/common.nonEmptyArrayOfUniqueStringValues"
            }
          ]
        },
        {
          "description": "A Function returning an entry object, an entry string, an entry array or a promise to these things.",
          "instanceof": "Function"
        }
      ]
    },
    "externals": {
      "anyOf": [
        {
          "description": "An exact matched dependency becomes external. The same string is used as external dependency.",
          "type": "string"
        },
        {
          "additionalProperties": {
            "description": "The dependency used for the external",
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "object"
              },
              {
                "type": "boolean"
              }
            ]
          },
          "description": "If an dependency matches exactly a property of the object, the property value is used as dependency.",
          "type": "object"
        },
        {
          "description": "`function(context, request, callback(err, result))` The function is called on each dependency.",
          "instanceof": "Function"
        },
        {
          "description": "Every matched dependency becomes external.",
          "instanceof": "RegExp"
        },
        {
          "items": {
            "description": "External configuration",
            "anyOf": [
              {
                "$ref": "#/definitions/externals"
              }
            ]
          },
          "type": "array"
        }
      ]
    },
    "module": {
      "additionalProperties": false,
      "properties": {
        "exprContextCritical": {
          "description": "Enable warnings for full dynamic dependencies",
          "type": "boolean"
        },
        "exprContextRecursive": {
          "description": "Enable recursive directory lookup for full dynamic dependencies",
          "type": "boolean"
        },
        "exprContextRegExp": {
          "description": "Sets the default regular expression for full dynamic dependencies",
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "instanceof": "RegExp"
            }
          ]
        },
        "exprContextRequest": {
          "description": "Set the default request for full dynamic dependencies",
          "type": "string"
        },
        "loaders": {
          "description": "An array of automatically applied loaders.",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-rules"
            }
          ]
        },
        "noParse": {
          "description": "Don't parse files matching. It's matched against the full resolved request.",
          "anyOf": [
            {
              "items": {
                "description": "A regular expression, when matched the module is not parsed",
                "instanceof": "RegExp"
              },
              "minItems": 1,
              "type": "array"
            },
            {
              "instanceof": "RegExp"
            },
            {
              "instanceof": "Function"
            },
            {
              "items": {
                "description": "An absolute path, when the module starts with this path it is not parsed",
                "type": "string",
                "absolutePath": true
              },
              "minItems": 1,
              "type": "array"
            },
            {
              "type": "string",
              "absolutePath": true
            }
          ]
        },
        "rules": {
          "allOf": [
            {
              "$ref": "#/definitions/ruleSet-rules"
            }
          ],
          "description": "An array of rules applied for modules."
        },
        "unknownContextCritical": {
          "description": "Enable warnings when using the require function in a not statically analyse-able way",
          "type": "boolean"
        },
        "unknownContextRecursive": {
          "description": "Enable recursive directory lookup when using the require function in a not statically analyse-able way",
          "type": "boolean"
        },
        "unknownContextRegExp": {
          "description": "Sets the regular expression when using the require function in a not statically analyse-able way",
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "instanceof": "RegExp"
            }
          ]
        },
        "unknownContextRequest": {
          "description": "Sets the request when using the require function in a not statically analyse-able way",
          "type": "string"
        },
        "unsafeCache": {
          "description": "Cache the resolving of module requests",
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "instanceof": "Function"
            }
          ]
        },
        "wrappedContextCritical": {
          "description": "Enable warnings for partial dynamic dependencies",
          "type": "boolean"
        },
        "wrappedContextRecursive": {
          "description": "Enable recursive directory lookup for partial dynamic dependencies",
          "type": "boolean"
        },
        "wrappedContextRegExp": {
          "description": "Set the inner regular expression for partial dynamic dependencies",
          "instanceof": "RegExp"
        },
        "strictExportPresence": {
          "description": "Emit errors instead of warnings when imported names don't exist in imported module",
          "type": "boolean"
        },
        "strictThisContextOnImports": {
          "description": "Handle the this context correctly according to the spec for namespace objects",
          "type": "boolean"
        }
      },
      "type": "object"
    },
    "output": {
      "additionalProperties": false,
      "properties": {
        "auxiliaryComment": {
          "description": "Add a comment in the UMD wrapper.",
          "anyOf": [
            {
              "description": "Append the same comment above each import style.",
              "type": "string"
            },
            {
              "additionalProperties": false,
              "description": "Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.",
              "properties": {
                "amd": {
                  "description": "Set comment for `amd` section in UMD",
                  "type": "string"
                },
                "commonjs": {
                  "description": "Set comment for `commonjs` (exports) section in UMD",
                  "type": "string"
                },
                "commonjs2": {
                  "description": "Set comment for `commonjs2` (module.exports) section in UMD",
                  "type": "string"
                },
                "root": {
                  "description": "Set comment for `root` (global variable) section in UMD",
                  "type": "string"
                }
              },
              "type": "object"
            }
          ]
        },
        "chunkFilename": {
          "description": "The filename of non-entry chunks as relative path inside the `output.path` directory.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ],
          "absolutePath": false
        },
        "crossOriginLoading": {
          "description": "This option enables cross-origin loading of chunks.",
          "enum": [
            false,
            "anonymous",
            "use-credentials"
          ]
        },
        "jsonpScriptType": {
          "description": "This option enables loading async chunks via a custom script type, such as script type=\"module\"",
          "enum": [
            "text/javascript",
            "module"
          ]
        },
        "chunkLoadTimeout": {
          "description": "Number of milliseconds before chunk request expires",
          "type": "number"
        },
        "devtoolFallbackModuleFilenameTemplate": {
          "description": "Similar to `output.devtoolModuleFilenameTemplate`, but used in the case of duplicate module identifiers.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ]
        },
        "devtoolLineToLine": {
          "description": "Enable line to line mapped mode for all/specified modules. Line to line mapped mode uses a simple SourceMap where each line of the generated source is mapped to the same line of the original source. It’s a performance optimization. Only use it if your performance need to be better and you are sure that input lines match which generated lines.",
          "anyOf": [
            {
              "description": "`true` enables it for all modules (not recommended)",
              "type": "boolean"
            },
            {
              "description": "An object similar to `module.loaders` enables it for specific files.",
              "type": "object"
            }
          ]
        },
        "devtoolModuleFilenameTemplate": {
          "description": "Filename template string of function for the sources array in a generated SourceMap.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ]
        },
        "filename": {
          "description": "Specifies the name of each output file on disk. You must **not** specify an absolute path here! The `output.path` option determines the location on disk the files are written to, filename is used solely for naming the individual files.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ],
          "absolutePath": false
        },
        "hashDigest": {
          "description": "Digest type used for the hash",
          "enum": [
            "latin1",
            "hex",
            "base64"
          ]
        },
        "hashDigestLength": {
          "description": "Number of chars which are used for the hash",
          "minimum": 1,
          "type": "number"
        },
        "hashFunction": {
          "description": "Algorithm used for generation the hash (see node.js crypto package)",
          "minLength": 1,
          "type": "string"
        },
        "hashSalt": {
          "description": "Any string which is added to the hash to salt it",
          "minLength": 1,
          "type": "string"
        },
        "hotUpdateChunkFilename": {
          "description": "The filename of the Hot Update Chunks. They are inside the output.path directory.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ],
          "absolutePath": false
        },
        "hotUpdateFunction": {
          "description": "The JSONP function used by webpack for async loading of hot update chunks.",
          "type": "string"
        },
        "hotUpdateMainFilename": {
          "description": "The filename of the Hot Update Main File. It is inside the `output.path` directory.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ],
          "absolutePath": false
        },
        "jsonpFunction": {
          "description": "The JSONP function used by webpack for async loading of chunks.",
          "type": "string"
        },
        "library": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "description": "A part of the library name",
                "type": "string"
              },
              "type": "array"
            },
            {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "root": {
                  "description": "Name of the property exposed globally by a UMD library",
                  "type": "string"
                },
                "amd": {
                  "description": "Name of the exposed AMD library in the UMD",
                  "type": "string"
                },
                "commonjs": {
                  "description": "Name of the exposed commonjs export in the UMD",
                  "type": "string"
                }
              }
            }
          ],
          "description": "If set, export the bundle as library. `output.library` is the name."
        },
        "libraryTarget": {
          "description": "Type of library",
          "enum": [
            "var",
            "assign",
            "this",
            "window",
            "global",
            "commonjs",
            "commonjs2",
            "commonjs-module",
            "amd",
            "umd",
            "umd2",
            "jsonp"
          ]
        },
        "libraryExport": {
          "description": "Specify which export should be exposed as library",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/common.arrayOfStringValues"
            }
          ]
        },
        "path": {
          "description": "The output directory as **absolute path** (required).",
          "type": "string",
          "absolutePath": true
        },
        "pathinfo": {
          "description": "Include comments with information about the modules.",
          "type": "boolean"
        },
        "publicPath": {
          "description": "The `publicPath` specifies the public URL address of the output files when referenced in a browser.",
          "anyOf": [
            {
              "type": "string"
            },
            {
              "instanceof": "Function"
            }
          ]
        },
        "sourceMapFilename": {
          "description": "The filename of the SourceMaps for the JavaScript files. They are inside the `output.path` directory.",
          "type": "string",
          "absolutePath": false
        },
        "sourcePrefix": {
          "description": "Prefixes every line of the source in the bundle with this string.",
          "type": "string"
        },
        "strictModuleExceptionHandling": {
          "description": "Handles exceptions in module loading correctly at a performance cost.",
          "type": "boolean"
        },
        "umdNamedDefine": {
          "description": "If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.",
          "type": "boolean"
        }
      },
      "type": "object"
    },
    "resolve": {
      "additionalProperties": false,
      "properties": {
        "alias": {
          "description": "Redirect module requests",
          "anyOf": [
            {
              "additionalProperties": {
                "description": "New request",
                "type": "string"
              },
              "type": "object"
            },
            {
              "items": {
                "description": "Alias configuration",
                "additionalProperties": false,
                "properties": {
                  "alias": {
                    "description": "New request",
                    "type": "string"
                  },
                  "name": {
                    "description": "Request to be redirected",
                    "type": "string"
                  },
                  "onlyModule": {
                    "description": "Redirect only exact matching request",
                    "type": "boolean"
                  }
                },
                "type": "object"
              },
              "type": "array"
            }
          ]
        },
        "aliasFields": {
          "description": "Fields in the description file (package.json) which are used to redirect requests inside the module",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringOrStringArrayValues"
            }
          ]
        },
        "cachePredicate": {
          "description": "Predicate function to decide which requests should be cached",
          "instanceof": "Function"
        },
        "cacheWithContext": {
          "description": "Include the context information in the cache identifier when caching",
          "type": "boolean"
        },
        "descriptionFiles": {
          "description": "Filenames used to find a description file",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringValues"
            }
          ]
        },
        "enforceExtension": {
          "description": "Enforce using one of the extensions from the extensions option",
          "type": "boolean"
        },
        "enforceModuleExtension": {
          "description": "Enforce using one of the module extensions from the moduleExtensions option",
          "type": "boolean"
        },
        "extensions": {
          "description": "Extensions added to the request when trying to find the file",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringValues"
            }
          ]
        },
        "fileSystem": {
          "description": "Filesystem for the resolver"
        },
        "mainFields": {
          "description": "Field names from the description file (package.json) which are used to find the default entry point",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringOrStringArrayValues"
            }
          ]
        },
        "mainFiles": {
          "description": "Filenames used to find the default entry point if there is no description file or main field",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringValues"
            }
          ]
        },
        "moduleExtensions": {
          "description": "Extenstions added to the module request when trying to find the module",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringValues"
            }
          ]
        },
        "modules": {
          "description": "Folder names or directory paths where to find modules",
          "anyOf": [
            {
              "$ref": "#/definitions/common.arrayOfStringValues"
            }
          ]
        },
        "plugins": {
          "description": "Plugins for the resolver",
          "type": "array"
        },
        "resolver": {
          "description": "Custom resolver"
        },
        "symlinks": {
          "description": "Enable resolving symlinks to the original location",
          "type": "boolean"
        },
        "unsafeCache": {
          "description": "Enable caching of successfully resolved requests",
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "additionalProperties": true,
              "type": "object"
            }
          ]
        },
        "useSyncFileSystemCalls": {
          "description": "Use synchronous filesystem calls for the resolver",
          "type": "boolean"
        }
      },
      "type": "object"
    },
    "ruleSet-condition": {
      "anyOf": [
        {
          "instanceof": "RegExp"
        },
        {
          "minLength": 1,
          "type": "string"
        },
        {
          "instanceof": "Function"
        },
        {
          "$ref": "#/definitions/ruleSet-conditions"
        },
        {
          "additionalProperties": false,
          "properties": {
            "and": {
              "description": "Logical AND",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-conditions"
                }
              ]
            },
            "exclude": {
              "description": "Exclude all modules matching any of these conditions",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-condition"
                }
              ]
            },
            "include": {
              "description": "Exclude all modules matching not any of these conditions",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-condition"
                }
              ]
            },
            "not": {
              "description": "Logical NOT",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-conditions"
                }
              ]
            },
            "or": {
              "description": "Logical OR",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-conditions"
                }
              ]
            },
            "test": {
              "description": "Exclude all modules matching any of these conditions",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-condition"
                }
              ]
            }
          },
          "type": "object"
        }
      ]
    },
    "ruleSet-conditions": {
      "items": {
        "description": "A rule condition",
        "anyOf": [
          {
            "$ref": "#/definitions/ruleSet-condition"
          }
        ]
      },
      "type": "array"
    },
    "ruleSet-loader": {
      "minLength": 1,
      "type": "string"
    },
    "ruleSet-query": {
      "anyOf": [
        {
          "type": "object"
        },
        {
          "type": "string"
        }
      ]
    },
    "ruleSet-rule": {
      "additionalProperties": false,
      "properties": {
        "enforce": {
          "description": "Enforce this rule as pre or post step",
          "enum": [
            "pre",
            "post"
          ]
        },
        "exclude": {
          "description": "Shortcut for resource.exclude",
          "allOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            },
            {
              "absolutePath": true
            }
          ]
        },
        "include": {
          "description": "Shortcut for resource.include",
          "allOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            },
            {
              "absolutePath": true
            }
          ]
        },
        "issuer": {
          "description": "Match the issuer of the module (The module pointing to this module)",
          "allOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            },
            {
              "absolutePath": true
            }
          ]
        },
        "loader": {
          "description": "Shortcut for use.loader",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-loader"
            },
            {
              "$ref": "#/definitions/ruleSet-use"
            }
          ]
        },
        "loaders": {
          "description": "Shortcut for use.loader",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-use"
            }
          ]
        },
        "oneOf": {
          "description": "Only execute the first matching rule in this array",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-rules"
            }
          ]
        },
        "options": {
          "description": "Shortcut for use.options",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-query"
            }
          ]
        },
        "parser": {
          "description": "Options for parsing",
          "additionalProperties": true,
          "type": "object"
        },
        "query": {
          "description": "Shortcut for use.query",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-query"
            }
          ]
        },
        "resource": {
          "description": "Match the resource path of the module",
          "allOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            },
            {
              "absolutePath": true
            }
          ]
        },
        "resourceQuery": {
          "description": "Match the resource query of the module",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            }
          ]
        },
        "compiler": {
          "description": "Match the child compiler name",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            }
          ]
        },
        "rules": {
          "description": "Match and execute these rules when this rule is matched",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-rules"
            }
          ]
        },
        "test": {
          "description": "Shortcut for resource.test",
          "allOf": [
            {
              "$ref": "#/definitions/ruleSet-condition"
            },
            {
              "absolutePath": true
            }
          ]
        },
        "use": {
          "description": "Modifiers applied to the module when rule is matched",
          "anyOf": [
            {
              "$ref": "#/definitions/ruleSet-use"
            }
          ]
        }
      },
      "type": "object"
    },
    "ruleSet-rules": {
      "items": {
        "description": "A rule",
        "anyOf": [
          {
            "$ref": "#/definitions/ruleSet-rule"
          }
        ]
      },
      "type": "array"
    },
    "ruleSet-use": {
      "anyOf": [
        {
          "$ref": "#/definitions/ruleSet-use-item"
        },
        {
          "instanceof": "Function"
        },
        {
          "items": {
            "description": "An use item",
            "anyOf": [
              {
                "$ref": "#/definitions/ruleSet-use-item"
              }
            ]
          },
          "type": "array"
        }
      ]
    },
    "ruleSet-use-item": {
      "anyOf": [
        {
          "$ref": "#/definitions/ruleSet-loader"
        },
        {
          "instanceof": "Function"
        },
        {
          "additionalProperties": false,
          "properties": {
            "loader": {
              "description": "Loader name",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-loader"
                }
              ]
            },
            "options": {
              "description": "Loader options",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-query"
                }
              ]
            },
            "ident": {
              "description": "Unique loader identifier",
              "type": "string"
            },
            "query": {
              "description": "Loader query",
              "anyOf": [
                {
                  "$ref": "#/definitions/ruleSet-query"
                }
              ]
            }
          },
          "type": "object"
        }
      ]
    },
    "filter-item-types": {
      "anyOf": [
        {
          "instanceof": "RegExp"
        },
        {
          "type": "string"
        },
        {
          "instanceof": "Function"
        }
      ]
    },
    "filter-types": {
      "anyOf": [
        {
          "$ref": "#/definitions/filter-item-types"
        },
        {
          "type": "array",
          "items": {
            "description": "Rule to filter",
            "anyOf": [
              {
                "$ref": "#/definitions/filter-item-types"
              }
            ]
          }
        }
      ]
    }
  },
  "properties": {
    "amd": {
      "description": "Set the value of `require.amd` and `define.amd`."
    },
    "bail": {
      "description": "Report the first error as a hard error instead of tolerating it.",
      "type": "boolean"
    },
    "cache": {
      "description": "Cache generated modules and chunks to improve performance for multiple incremental builds.",
      "anyOf": [
        {
          "description": "You can pass `false` to disable it.",
          "type": "boolean"
        },
        {
          "description": "You can pass an object to enable it and let webpack use the passed object as cache. This way you can share the cache object between multiple compiler calls.",
          "type": "object"
        }
      ]
    },
    "context": {
      "description": "The base directory (absolute path!) for resolving the `entry` option. If `output.pathinfo` is set, the included pathinfo is shortened to this directory.",
      "type": "string",
      "absolutePath": true
    },
    "dependencies": {
      "description": "References to other configurations to depend on.",
      "items": {
        "description": "References to another configuration to depend on.",
        "type": "string"
      },
      "type": "array"
    },
    "devServer": {
      "description": "Options for the webpack-dev-server",
      "type": "object"
    },
    "devtool": {
      "description": "A developer tool to enhance debugging.",
      "anyOf": [
        {
          "type": "string"
        },
        {
          "enum": [
            false
          ]
        }
      ]
    },
    "entry": {
      "description": "The entry point(s) of the compilation.",
      "anyOf": [
        {
          "$ref": "#/definitions/entry"
        }
      ]
    },
    "externals": {
      "description": "Specify dependencies that shouldn't be resolved by webpack, but should become dependencies of the resulting bundle. The kind of the dependency depends on `output.libraryTarget`.",
      "anyOf": [
        {
          "$ref": "#/definitions/externals"
        }
      ]
    },
    "loader": {
      "description": "Custom values available in the loader context.",
      "type": "object"
    },
    "module": {
      "description": "Options affecting the normal modules (`NormalModuleFactory`).",
      "anyOf": [
        {
          "$ref": "#/definitions/module"
        }
      ]
    },
    "name": {
      "description": "Name of the configuration. Used when loading multiple configurations.",
      "type": "string"
    },
    "node": {
      "description": "Include polyfills or mocks for various node stuff.",
      "anyOf": [
        {
          "enum": [
            false
          ]
        },
        {
          "additionalProperties": {
            "description": "Include a polyfill for the node.js module",
            "enum": [
              false,
              true,
              "mock",
              "empty"
            ]
          },
          "properties": {
            "Buffer": {
              "description": "Include a polyfill for the 'Buffer' variable",
              "enum": [
                false,
                true,
                "mock"
              ]
            },
            "__dirname": {
              "description": "Include a polyfill for the '__dirname' variable",
              "enum": [
                false,
                true,
                "mock"
              ]
            },
            "__filename": {
              "description": "Include a polyfill for the '__filename' variable",
              "enum": [
                false,
                true,
                "mock"
              ]
            },
            "console": {
              "description": "Include a polyfill for the 'console' variable",
              "enum": [
                false,
                true,
                "mock"
              ]
            },
            "global": {
              "description": "Include a polyfill for the 'global' variable",
              "type": "boolean"
            },
            "process": {
              "description": "Include a polyfill for the 'process' variable",
              "enum": [
                false,
                true,
                "mock"
              ]
            }
          },
          "type": "object"
        }
      ]
    },
    "output": {
      "description": "Options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.",
      "anyOf": [
        {
          "$ref": "#/definitions/output"
        }
      ]
    },
    "parallelism": {
      "description": "The number of parallel processed modules in the compilation.",
      "minimum": 1,
      "type": "number"
    },
    "performance": {
      "description": "Configuration for web performance recommendations.",
      "anyOf": [
        {
          "enum": [
            false
          ]
        },
        {
          "additionalProperties": false,
          "properties": {
            "assetFilter": {
              "description": "Filter function to select assets that are checked",
              "instanceof": "Function"
            },
            "hints": {
              "description": "Sets the format of the hints: warnings, errors or nothing at all",
              "enum": [
                false,
                "warning",
                "error"
              ]
            },
            "maxEntrypointSize": {
              "description": "Total size of an entry point (in bytes)",
              "type": "number"
            },
            "maxAssetSize": {
              "description": "Filesize limit (in bytes) when exceeded, that webpack will provide performance hints",
              "type": "number"
            }
          },
          "type": "object"
        }
      ]
    },
    "plugins": {
      "description": "Add additional plugins to the compiler.",
      "type": "array"
    },
    "profile": {
      "description": "Capture timing information for each module.",
      "type": "boolean"
    },
    "recordsInputPath": {
      "description": "Store compiler state to a json file.",
      "type": "string",
      "absolutePath": true
    },
    "recordsOutputPath": {
      "description": "Load compiler state from a json file.",
      "type": "string",
      "absolutePath": true
    },
    "recordsPath": {
      "description": "Store/Load compiler state from/to a json file. This will result in persistent ids of modules and chunks. An absolute path is expected. `recordsPath` is used for `recordsInputPath` and `recordsOutputPath` if they left undefined.",
      "type": "string",
      "absolutePath": true
    },
    "resolve": {
      "description": "Options for the resolver",
      "anyOf": [
        {
          "$ref": "#/definitions/resolve"
        }
      ]
    },
    "resolveLoader": {
      "description": "Options for the resolver when resolving loaders",
      "anyOf": [
        {
          "$ref": "#/definitions/resolve"
        }
      ]
    },
    "stats": {
      "description": "Used by the webpack CLI program to pass stats options.",
      "anyOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "all": {
              "type": "boolean",
              "description": "fallback value for stats options when an option is not defined (has precedence over local webpack defaults)"
            },
            "context": {
              "type": "string",
              "description": "context directory for request shortening",
              "absolutePath": true
            },
            "hash": {
              "type": "boolean",
              "description": "add the hash of the compilation"
            },
            "version": {
              "type": "boolean",
              "description": "add webpack version information"
            },
            "timings": {
              "type": "boolean",
              "description": "add timing information"
            },
            "performance": {
              "type": "boolean",
              "description": "add performance hint flags"
            },
            "depth": {
              "type": "boolean",
              "description": "add module depth in module graph"
            },
            "assets": {
              "type": "boolean",
              "description": "add assets information"
            },
            "env": {
              "type": "boolean",
              "description": "add --env information"
            },
            "colors": {
              "description": "Enables/Disables colorful output",
              "oneOf": [
                {
                  "type": "boolean",
                  "description": "`webpack --colors` equivalent"
                },
                {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "bold": {
                      "description": "Custom color for bold text",
                      "type": "string"
                    },
                    "red": {
                      "description": "Custom color for red text",
                      "type": "string"
                    },
                    "green": {
                      "description": "Custom color for green text",
                      "type": "string"
                    },
                    "cyan": {
                      "description": "Custom color for cyan text",
                      "type": "string"
                    },
                    "magenta": {
                      "description": "Custom color for magenta text",
                      "type": "string"
                    },
                    "yellow": {
                      "description": "Custom color for yellow text",
                      "type": "string"
                    }
                  }
                }
              ]
            },
            "maxModules": {
              "type": "number",
              "description": "Set the maximum number of modules to be shown"
            },
            "chunks": {
              "type": "boolean",
              "description": "add chunk information"
            },
            "chunkModules": {
              "type": "boolean",
              "description": "add built modules information to chunk information"
            },
            "modules": {
              "type": "boolean",
              "description": "add built modules information"
            },
            "children": {
              "type": "boolean",
              "description": "add children information"
            },
            "cached": {
              "type": "boolean",
              "description": "add also information about cached (not built) modules"
            },
            "cachedAssets": {
              "type": "boolean",
              "description": "Show cached assets (setting this to `false` only shows emitted files)"
            },
            "reasons": {
              "type": "boolean",
              "description": "add information about the reasons why modules are included"
            },
            "source": {
              "type": "boolean",
              "description": "add the source code of modules"
            },
            "warnings": {
              "type": "boolean",
              "description": "add warnings"
            },
            "errors": {
              "type": "boolean",
              "description": "add errors"
            },
            "warningsFilter": {
              "description": "Suppress warnings that match the specified filters. Filters can be Strings, RegExps or Functions",
              "anyOf": [
                {
                  "$ref": "#/definitions/filter-types"
                }
              ]
            },
            "excludeAssets": {
              "description": "Suppress assets that match the specified filters. Filters can be Strings, RegExps or Functions",
              "anyOf": [
                {
                  "$ref": "#/definitions/filter-types"
                }
              ]
            },
            "excludeModules": {
              "description": "Suppress modules that match the specified filters. Filters can be Strings, RegExps or Functions",
              "anyOf": [
                {
                  "$ref": "#/definitions/filter-types"
                }
              ]
            },
            "exclude": {
              "description": "Please use excludeModules instead.",
              "anyOf": [
                {
                  "$ref": "#/definitions/filter-types"
                }
              ]
            },
            "entrypoints": {
              "type": "boolean",
              "description": "Display the entry points with the corresponding bundles"
            },
            "errorDetails": {
              "type": "boolean",
              "description": "add details to errors (like resolving log)"
            },
            "chunkOrigins": {
              "type": "boolean",
              "description": "add the origins of chunks and chunk merging info"
            },
            "modulesSort": {
              "type": "string",
              "description": "sort the modules by that field"
            },
            "moduleTrace": {
              "type": "boolean",
              "description": "add dependencies and origin of warnings/errors"
            },
            "chunksSort": {
              "type": "string",
              "description": "sort the chunks by that field"
            },
            "assetsSort": {
              "type": "string",
              "description": "sort the assets by that field"
            },
            "publicPath": {
              "type": "boolean",
              "description": "Add public path information"
            },
            "providedExports": {
              "type": "boolean",
              "description": "show exports provided by modules"
            },
            "usedExports": {
              "type": "boolean",
              "description": "show exports used by modules"
            },
            "optimizationBailout": {
              "type": "boolean",
              "description": "show reasons why optimization bailed out for modules"
            }
          }
        },
        {
          "type": "boolean"
        },
        {
          "enum": [
            "none",
            "errors-only",
            "minimal",
            "normal",
            "detailed",
            "verbose"
          ]
        }
      ]
    },
    "target": {
      "description": "Environment to build for",
      "anyOf": [
        {
          "enum": [
            "web",
            "webworker",
            "node",
            "async-node",
            "node-webkit",
            "atom",
            "electron",
            "electron-main",
            "electron-renderer"
          ]
        },
        {
          "instanceof": "Function"
        }
      ]
    },
    "watch": {
      "description": "Enter watch mode, which rebuilds on file change.",
      "type": "boolean"
    },
    "watchOptions": {
      "description": "Options for the watcher",
      "additionalProperties": false,
      "properties": {
        "aggregateTimeout": {
          "description": "Delay the rebuilt after the first change. Value is a time in ms.",
          "type": "number"
        },
        "ignored": {
          "description": "Ignore some files from watching"
        },
        "stdin": {
          "description": "Stop watching when stdin stream has ended",
          "type": "boolean"
        },
        "poll": {
          "description": "Enable polling mode for watching",
          "anyOf": [
            {
              "description": "`true`: use polling.",
              "type": "boolean"
            },
            {
              "description": "`number`: use polling with specified interval.",
              "type": "number"
            }
          ]
        }
      },
      "type": "object"
    }
  },
  "required": [
    "entry"
  ],
  "type": "object"
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872330, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConstDependency = require("./dependencies/ConstDependency");
const BasicEvaluatedExpression = require("./BasicEvaluatedExpression");
const ParserHelpers = require("./ParserHelpers");
const NullFactory = require("./NullFactory");

class DefinePlugin {
	constructor(definitions) {
		this.definitions = definitions;
	}

	apply(compiler) {
		const definitions = this.definitions;
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

			params.normalModuleFactory.plugin("parser", (parser) => {
				(function walkDefinitions(definitions, prefix) {
					Object.keys(definitions).forEach((key) => {
						const code = definitions[key];
						if(code && typeof code === "object" && !(code instanceof RegExp)) {
							walkDefinitions(code, prefix + key + ".");
							applyObjectDefine(prefix + key, code);
							return;
						}
						applyDefineKey(prefix, key);
						applyDefine(prefix + key, code);
					});
				}(definitions, ""));

				function stringifyObj(obj) {
					return "Object({" + Object.keys(obj).map((key) => {
						const code = obj[key];
						return JSON.stringify(key) + ":" + toCode(code);
					}).join(",") + "})";
				}

				function toCode(code) {
					if(code === null) return "null";
					else if(code === undefined) return "undefined";
					else if(code instanceof RegExp && code.toString) return code.toString();
					else if(typeof code === "function" && code.toString) return "(" + code.toString() + ")";
					else if(typeof code === "object") return stringifyObj(code);
					else return code + "";
				}

				function applyDefineKey(prefix, key) {
					const splittedKey = key.split(".");
					splittedKey.slice(1).forEach((_, i) => {
						const fullKey = prefix + splittedKey.slice(0, i + 1).join(".");
						parser.plugin("can-rename " + fullKey, ParserHelpers.approve);
					});
				}

				function applyDefine(key, code) {
					const isTypeof = /^typeof\s+/.test(key);
					if(isTypeof) key = key.replace(/^typeof\s+/, "");
					let recurse = false;
					let recurseTypeof = false;
					code = toCode(code);
					if(!isTypeof) {
						parser.plugin("can-rename " + key, ParserHelpers.approve);
						parser.plugin("evaluate Identifier " + key, (expr) => {
							/**
							 * this is needed in case there is a recursion in the DefinePlugin
							 * to prevent an endless recursion
							 * e.g.: new DefinePlugin({
							 * "a": "b",
							 * "b": "a"
							 * });
							 */
							if(recurse) return;
							recurse = true;
							const res = parser.evaluate(code);
							recurse = false;
							res.setRange(expr.range);
							return res;
						});
						parser.plugin("expression " + key, ParserHelpers.toConstantDependency(code));
					}
					const typeofCode = isTypeof ? code : "typeof (" + code + ")";
					parser.plugin("evaluate typeof " + key, (expr) => {
						/**
						 * this is needed in case there is a recursion in the DefinePlugin
						 * to prevent an endless recursion
						 * e.g.: new DefinePlugin({
						 * "typeof a": "tyepof b",
						 * "typeof b": "typeof a"
						 * });
						 */
						if(recurseTypeof) return;
						recurseTypeof = true;
						const res = parser.evaluate(typeofCode);
						recurseTypeof = false;
						res.setRange(expr.range);
						return res;
					});
					parser.plugin("typeof " + key, (expr) => {
						const res = parser.evaluate(typeofCode);
						if(!res.isString()) return;
						return ParserHelpers.toConstantDependency(JSON.stringify(res.string)).bind(parser)(expr);
					});
				}

				function applyObjectDefine(key, obj) {
					const code = stringifyObj(obj);
					parser.plugin("can-rename " + key, ParserHelpers.approve);
					parser.plugin("evaluate Identifier " + key, (expr) => new BasicEvaluatedExpression().setTruthy().setRange(expr.range));
					parser.plugin("evaluate typeof " + key, ParserHelpers.evaluateToString("object"));
					parser.plugin("expression " + key, ParserHelpers.toConstantDependency(code));
					parser.plugin("typeof " + key, ParserHelpers.toConstantDependency(JSON.stringify("object")));
				}
			});
		});
	}
}
module.exports = DefinePlugin;

}, function(modId) { var map = {"./dependencies/ConstDependency":1602510872201,"./BasicEvaluatedExpression":1602510872165,"./ParserHelpers":1602510872203,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872331, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");

class NormalModuleReplacementPlugin {
	constructor(resourceRegExp, newResource) {
		this.resourceRegExp = resourceRegExp;
		this.newResource = newResource;
	}

	apply(compiler) {
		const resourceRegExp = this.resourceRegExp;
		const newResource = this.newResource;
		compiler.plugin("normal-module-factory", (nmf) => {
			nmf.plugin("before-resolve", (result, callback) => {
				if(!result) return callback();
				if(resourceRegExp.test(result.request)) {
					if(typeof newResource === "function") {
						newResource(result);
					} else {
						result.request = newResource;
					}
				}
				return callback(null, result);
			});
			nmf.plugin("after-resolve", (result, callback) => {
				if(!result) return callback();
				if(resourceRegExp.test(result.resource)) {
					if(typeof newResource === "function") {
						newResource(result);
					} else {
						result.resource = path.resolve(path.dirname(result.resource), newResource);
					}
				}
				return callback(null, result);
			});
		});
	}
}

module.exports = NormalModuleReplacementPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872332, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const ContextElementDependency = require("./dependencies/ContextElementDependency");

class ContextReplacementPlugin {
	constructor(resourceRegExp, newContentResource, newContentRecursive, newContentRegExp) {
		this.resourceRegExp = resourceRegExp;

		if(typeof newContentResource === "function") {
			this.newContentCallback = newContentResource;
		} else if(typeof newContentResource === "string" && typeof newContentRecursive === "object") {
			this.newContentResource = newContentResource;
			this.newContentCreateContextMap = (fs, callback) => {
				callback(null, newContentRecursive);
			};
		} else if(typeof newContentResource === "string" && typeof newContentRecursive === "function") {
			this.newContentResource = newContentResource;
			this.newContentCreateContextMap = newContentRecursive;
		} else {
			if(typeof newContentResource !== "string") {
				newContentRegExp = newContentRecursive;
				newContentRecursive = newContentResource;
				newContentResource = undefined;
			}
			if(typeof newContentRecursive !== "boolean") {
				newContentRegExp = newContentRecursive;
				newContentRecursive = undefined;
			}
			this.newContentResource = newContentResource;
			this.newContentRecursive = newContentRecursive;
			this.newContentRegExp = newContentRegExp;
		}
	}

	apply(compiler) {
		const resourceRegExp = this.resourceRegExp;
		const newContentCallback = this.newContentCallback;
		const newContentResource = this.newContentResource;
		const newContentRecursive = this.newContentRecursive;
		const newContentRegExp = this.newContentRegExp;
		const newContentCreateContextMap = this.newContentCreateContextMap;

		compiler.plugin("context-module-factory", (cmf) => {
			cmf.plugin("before-resolve", (result, callback) => {
				if(!result) return callback();
				if(resourceRegExp.test(result.request)) {
					if(typeof newContentResource !== "undefined")
						result.request = newContentResource;
					if(typeof newContentRecursive !== "undefined")
						result.recursive = newContentRecursive;
					if(typeof newContentRegExp !== "undefined")
						result.regExp = newContentRegExp;
					if(typeof newContentCallback === "function") {
						newContentCallback(result);
					} else {
						result.dependencies.forEach((d) => {
							if(d.critical)
								d.critical = false;
						});
					}
				}
				return callback(null, result);
			});
			cmf.plugin("after-resolve", (result, callback) => {
				if(!result) return callback();
				if(resourceRegExp.test(result.resource)) {
					if(typeof newContentResource !== "undefined")
						result.resource = path.resolve(result.resource, newContentResource);
					if(typeof newContentRecursive !== "undefined")
						result.recursive = newContentRecursive;
					if(typeof newContentRegExp !== "undefined")
						result.regExp = newContentRegExp;
					if(typeof newContentCreateContextMap === "function")
						result.resolveDependencies = createResolveDependenciesFromContextMap(newContentCreateContextMap);
					if(typeof newContentCallback === "function") {
						const origResource = result.resource;
						newContentCallback(result);
						if(result.resource !== origResource) {
							result.resource = path.resolve(origResource, result.resource);
						}
					} else {
						result.dependencies.forEach((d) => {
							if(d.critical)
								d.critical = false;
						});
					}
				}
				return callback(null, result);
			});
		});
	}
}

const createResolveDependenciesFromContextMap = (createContextMap) => {
	return function resolveDependenciesFromContextMap(fs, resource, recursive, regExp, callback) {
		createContextMap(fs, (err, map) => {
			if(err) return callback(err);
			const dependencies = Object.keys(map).map((key) => {
				return new ContextElementDependency(map[key], key);
			});
			callback(null, dependencies);
		});
	};
};

module.exports = ContextReplacementPlugin;

}, function(modId) { var map = {"./dependencies/ContextElementDependency":1602510872171}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872333, function(require, module, exports) {


class ContextExclusionPlugin {
	constructor(negativeMatcher) {
		this.negativeMatcher = negativeMatcher;
	}

	apply(compiler) {
		compiler.plugin("context-module-factory", (cmf) => {
			cmf.plugin("context-module-files", (files) => {
				return files.filter(filePath => !this.negativeMatcher.test(filePath));
			});
		});
	}
}

module.exports = ContextExclusionPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872334, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class IgnorePlugin {
	constructor(resourceRegExp, contextRegExp) {
		this.resourceRegExp = resourceRegExp;
		this.contextRegExp = contextRegExp;

		this.checkIgnore = this.checkIgnore.bind(this);
	}

	/*
	 * Only returns true if a "resourceRegExp" exists
	 * and the resource given matches the regexp.
	 */
	checkResource(resource) {
		if(!this.resourceRegExp) {
			return false;
		}
		return this.resourceRegExp.test(resource);
	}

	/*
	 * Returns true if contextRegExp does not exist
	 * or if context matches the given regexp.
	 */
	checkContext(context) {
		if(!this.contextRegExp) {
			return true;
		}
		return this.contextRegExp.test(context);
	}

	/*
	 * Returns true if result should be ignored.
	 * false if it shouldn't.
	 *
	 * Not that if "contextRegExp" is given, both the "resourceRegExp"
	 * and "contextRegExp" have to match.
	 */
	checkResult(result) {
		if(!result) {
			return true;
		}
		return this.checkResource(result.request) && this.checkContext(result.context);
	}

	checkIgnore(result, callback) {
		// check if result is ignored
		if(this.checkResult(result)) {
			return callback();
		}
		return callback(null, result);
	}

	apply(compiler) {
		compiler.plugin("normal-module-factory", (nmf) => {
			nmf.plugin("before-resolve", this.checkIgnore);
		});
		compiler.plugin("context-module-factory", (cmf) => {
			cmf.plugin("before-resolve", this.checkIgnore);
		});
	}
}

module.exports = IgnorePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872335, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class WatchIgnorePlugin {
	constructor(paths) {
		this.paths = paths;
	}

	apply(compiler) {
		compiler.plugin("after-environment", () => {
			compiler.watchFileSystem = new IgnoringWatchFileSystem(compiler.watchFileSystem, this.paths);
		});
	}
}

module.exports = WatchIgnorePlugin;

class IgnoringWatchFileSystem {
	constructor(wfs, paths) {
		this.wfs = wfs;
		this.paths = paths;
	}

	watch(files, dirs, missing, startTime, options, callback, callbackUndelayed) {
		const ignored = path => this.paths.some(p => p instanceof RegExp ? p.test(path) : path.indexOf(p) === 0);

		const notIgnored = path => !ignored(path);

		const ignoredFiles = files.filter(ignored);
		const ignoredDirs = dirs.filter(ignored);

		this.wfs.watch(files.filter(notIgnored), dirs.filter(notIgnored), missing, startTime, options, (err, filesModified, dirsModified, missingModified, fileTimestamps, dirTimestamps) => {
			if(err) return callback(err);

			ignoredFiles.forEach(path => {
				fileTimestamps[path] = 1;
			});

			ignoredDirs.forEach(path => {
				dirTimestamps[path] = 1;
			});

			callback(err, filesModified, dirsModified, missingModified, fileTimestamps, dirTimestamps);
		}, callbackUndelayed);
	}
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872336, function(require, module, exports) {
/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */



const ConcatSource = require("webpack-sources").ConcatSource;
const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");

const wrapComment = (str) => {
	if(!str.includes("\n")) return `/*! ${str} */`;
	return `/*!\n * ${str.split("\n").join("\n * ")}\n */`;
};

class BannerPlugin {
	constructor(options) {
		if(arguments.length > 1)
			throw new Error("BannerPlugin only takes one argument (pass an options object)");
		if(typeof options === "string")
			options = {
				banner: options
			};
		this.options = options || {};
		this.banner = this.options.raw ? options.banner : wrapComment(options.banner);
	}

	apply(compiler) {
		const options = this.options;
		const banner = this.banner;

		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
				chunks.forEach((chunk) => {
					if(options.entryOnly && !chunk.isInitial()) return;
					chunk.files
						.filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
						.forEach((file) => {
							let basename;
							let query = "";
							let filename = file;
							const hash = compilation.hash;
							const querySplit = filename.indexOf("?");

							if(querySplit >= 0) {
								query = filename.substr(querySplit);
								filename = filename.substr(0, querySplit);
							}

							const lastSlashIndex = filename.lastIndexOf("/");

							if(lastSlashIndex === -1) {
								basename = filename;
							} else {
								basename = filename.substr(lastSlashIndex + 1);
							}

							const comment = compilation.getPath(banner, {
								hash,
								chunk,
								filename,
								basename,
								query,
							});

							return compilation.assets[file] = new ConcatSource(comment, "\n", compilation.assets[file]);
						});
				});
				callback();
			});
		});
	}
}

module.exports = BannerPlugin;

}, function(modId) { var map = {"./ModuleFilenameHelpers":1602510872186}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872337, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const PrefetchDependency = require("./dependencies/PrefetchDependency");

class PrefetchPlugin {

	constructor(context, request) {
		if(!request) {
			this.request = context;
		} else {
			this.context = context;
			this.request = request;
		}
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(PrefetchDependency, normalModuleFactory);
		});
		compiler.plugin("make", (compilation, callback) => {
			compilation.prefetch(this.context || compiler.context, new PrefetchDependency(this.request), callback);
		});
	}

}
module.exports = PrefetchPlugin;

}, function(modId) { var map = {"./dependencies/PrefetchDependency":1602510872338}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872338, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class PrefetchDependency extends ModuleDependency {
	constructor(request) {
		super(request);
	}

	get type() {
		return "prefetch";
	}
}

module.exports = PrefetchDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872339, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const asyncLib = require("async");
const PrefetchDependency = require("./dependencies/PrefetchDependency");
const NormalModule = require("./NormalModule");

class AutomaticPrefetchPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(PrefetchDependency, normalModuleFactory);
		});
		let lastModules = null;
		compiler.plugin("after-compile", (compilation, callback) => {
			lastModules = compilation.modules
				.filter(m => m instanceof NormalModule)
				.map(m => ({
					context: m.context,
					request: m.request
				}));
			callback();
		});
		compiler.plugin("make", (compilation, callback) => {
			if(!lastModules) return callback();
			asyncLib.forEach(lastModules, (m, callback) => {
				compilation.prefetch(m.context || compiler.context, new PrefetchDependency(m.request), callback);
			}, callback);
		});
	}
}
module.exports = AutomaticPrefetchPlugin;

}, function(modId) { var map = {"./dependencies/PrefetchDependency":1602510872338,"./NormalModule":1602510872156}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872340, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ParserHelpers = require("./ParserHelpers");
const ConstDependency = require("./dependencies/ConstDependency");

const NullFactory = require("./NullFactory");

class ProvidePlugin {
	constructor(definitions) {
		this.definitions = definitions;
	}

	apply(compiler) {
		const definitions = this.definitions;
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {
				Object.keys(definitions).forEach(name => {
					var request = [].concat(definitions[name]);
					var splittedName = name.split(".");
					if(splittedName.length > 0) {
						splittedName.slice(1).forEach((_, i) => {
							const name = splittedName.slice(0, i + 1).join(".");
							parser.plugin(`can-rename ${name}`, ParserHelpers.approve);
						});
					}
					parser.plugin(`expression ${name}`, function(expr) {
						let nameIdentifier = name;
						const scopedName = name.indexOf(".") >= 0;
						let expression = `require(${JSON.stringify(request[0])})`;
						if(scopedName) {
							nameIdentifier = `__webpack_provided_${name.replace(/\./g, "_dot_")}`;
						}
						if(request.length > 1) {
							expression += request.slice(1).map(r => `[${JSON.stringify(r)}]`).join("");
						}
						if(!ParserHelpers.addParsedVariableToModule(this, nameIdentifier, expression)) {
							return false;
						}
						if(scopedName) {
							ParserHelpers.toConstantDependency(nameIdentifier).bind(this)(expr);
						}
						return true;
					});
				});
			});
		});
	}
}
module.exports = ProvidePlugin;

}, function(modId) { var map = {"./ParserHelpers":1602510872203,"./dependencies/ConstDependency":1602510872201,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872341, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Template = require("./Template");
const ModuleHotAcceptDependency = require("./dependencies/ModuleHotAcceptDependency");
const ModuleHotDeclineDependency = require("./dependencies/ModuleHotDeclineDependency");
const RawSource = require("webpack-sources").RawSource;
const ConstDependency = require("./dependencies/ConstDependency");
const NullFactory = require("./NullFactory");
const ParserHelpers = require("./ParserHelpers");

module.exports = class HotModuleReplacementPlugin {
	constructor(options) {
		this.options = options || {};
		this.multiStep = this.options.multiStep;
		this.fullBuildTimeout = this.options.fullBuildTimeout || 200;
		this.requestTimeout = this.options.requestTimeout || 10000;
	}

	apply(compiler) {
		const multiStep = this.multiStep;
		const fullBuildTimeout = this.fullBuildTimeout;
		const requestTimeout = this.requestTimeout;
		const hotUpdateChunkFilename = compiler.options.output.hotUpdateChunkFilename;
		const hotUpdateMainFilename = compiler.options.output.hotUpdateMainFilename;
		compiler.plugin("additional-pass", callback => {
			if(multiStep)
				return setTimeout(callback, fullBuildTimeout);
			return callback();
		});
		compiler.plugin("compilation", (compilation, params) => {
			const hotUpdateChunkTemplate = compilation.hotUpdateChunkTemplate;
			if(!hotUpdateChunkTemplate) return;

			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

			compilation.dependencyFactories.set(ModuleHotAcceptDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(ModuleHotAcceptDependency, new ModuleHotAcceptDependency.Template());

			compilation.dependencyFactories.set(ModuleHotDeclineDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(ModuleHotDeclineDependency, new ModuleHotDeclineDependency.Template());

			compilation.plugin("record", function(compilation, records) {
				if(records.hash === this.hash) return;
				records.hash = compilation.hash;
				records.moduleHashs = {};
				this.modules.forEach(module => {
					const identifier = module.identifier();
					const hash = require("crypto").createHash("md5");
					module.updateHash(hash);
					records.moduleHashs[identifier] = hash.digest("hex");
				});
				records.chunkHashs = {};
				this.chunks.forEach(chunk => {
					records.chunkHashs[chunk.id] = chunk.hash;
				});
				records.chunkModuleIds = {};
				this.chunks.forEach(chunk => {
					records.chunkModuleIds[chunk.id] = chunk.mapModules(m => m.id);
				});
			});
			let initialPass = false;
			let recompilation = false;
			compilation.plugin("after-hash", function() {
				let records = this.records;
				if(!records) {
					initialPass = true;
					return;
				}
				if(!records.hash)
					initialPass = true;
				const preHash = records.preHash || "x";
				const prepreHash = records.prepreHash || "x";
				if(preHash === this.hash) {
					recompilation = true;
					this.modifyHash(prepreHash);
					return;
				}
				records.prepreHash = records.hash || "x";
				records.preHash = this.hash;
				this.modifyHash(records.prepreHash);
			});
			compilation.plugin("should-generate-chunk-assets", () => {
				if(multiStep && !recompilation && !initialPass)
					return false;
			});
			compilation.plugin("need-additional-pass", () => {
				if(multiStep && !recompilation && !initialPass)
					return true;
			});
			compilation.plugin("additional-chunk-assets", function() {
				const records = this.records;
				if(records.hash === this.hash) return;
				if(!records.moduleHashs || !records.chunkHashs || !records.chunkModuleIds) return;
				this.modules.forEach(module => {
					const identifier = module.identifier();
					let hash = require("crypto").createHash("md5");
					module.updateHash(hash);
					hash = hash.digest("hex");
					module.hotUpdate = records.moduleHashs[identifier] !== hash;
				});
				const hotUpdateMainContent = {
					h: this.hash,
					c: {},
				};
				Object.keys(records.chunkHashs).forEach(function(chunkId) {
					chunkId = isNaN(+chunkId) ? chunkId : +chunkId;
					const currentChunk = this.chunks.find(chunk => chunk.id === chunkId);
					if(currentChunk) {
						const newModules = currentChunk.getModules().filter(module => module.hotUpdate);
						const allModules = {};
						currentChunk.forEachModule(module => {
							allModules[module.id] = true;
						});
						const removedModules = records.chunkModuleIds[chunkId].filter(id => !allModules[id]);
						if(newModules.length > 0 || removedModules.length > 0) {
							const source = hotUpdateChunkTemplate.render(chunkId, newModules, removedModules, this.hash, this.moduleTemplate, this.dependencyTemplates);
							const filename = this.getPath(hotUpdateChunkFilename, {
								hash: records.hash,
								chunk: currentChunk
							});
							this.additionalChunkAssets.push(filename);
							this.assets[filename] = source;
							hotUpdateMainContent.c[chunkId] = true;
							currentChunk.files.push(filename);
							this.applyPlugins("chunk-asset", currentChunk, filename);
						}
					} else {
						hotUpdateMainContent.c[chunkId] = false;
					}
				}, this);
				const source = new RawSource(JSON.stringify(hotUpdateMainContent));
				const filename = this.getPath(hotUpdateMainFilename, {
					hash: records.hash
				});
				this.assets[filename] = source;
			});

			compilation.mainTemplate.plugin("hash", hash => {
				hash.update("HotMainTemplateDecorator");
			});

			compilation.mainTemplate.plugin("module-require", (_, chunk, hash, varModuleId) => {
				return `hotCreateRequire(${varModuleId})`;
			});

			compilation.mainTemplate.plugin("require-extensions", function(source) {
				const buf = [source];
				buf.push("");
				buf.push("// __webpack_hash__");
				buf.push(this.requireFn + ".h = function() { return hotCurrentHash; };");
				return this.asString(buf);
			});

			compilation.mainTemplate.plugin("bootstrap", function(source, chunk, hash) {
				source = this.applyPluginsWaterfall("hot-bootstrap", source, chunk, hash);
				return this.asString([
					source,
					"",
					hotInitCode
					.replace(/\$require\$/g, this.requireFn)
					.replace(/\$hash\$/g, JSON.stringify(hash))
					.replace(/\$requestTimeout\$/g, requestTimeout)
					.replace(/\/\*foreachInstalledChunks\*\//g, chunk.chunks.length > 0 ? "for(var chunkId in installedChunks)" : `var chunkId = ${JSON.stringify(chunk.id)};`)
				]);
			});

			compilation.mainTemplate.plugin("global-hash", () => true);

			compilation.mainTemplate.plugin("current-hash", (_, length) => {
				if(isFinite(length))
					return `hotCurrentHash.substr(0, ${length})`;
				else
					return "hotCurrentHash";
			});

			compilation.mainTemplate.plugin("module-obj", function(source, chunk, hash, varModuleId) {
				return this.asString([
					`${source},`,
					`hot: hotCreateModule(${varModuleId}),`,
					"parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),",
					"children: []"
				]);
			});

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {
				parser.plugin("expression __webpack_hash__", ParserHelpers.toConstantDependency("__webpack_require__.h()"));
				parser.plugin("evaluate typeof __webpack_hash__", ParserHelpers.evaluateToString("string"));
				parser.plugin("evaluate Identifier module.hot", function(expr) {
					return ParserHelpers.evaluateToIdentifier("module.hot", !!this.state.compilation.hotUpdateChunkTemplate)(expr);
				});
				parser.plugin("call module.hot.accept", function(expr) {
					if(!this.state.compilation.hotUpdateChunkTemplate) return false;
					if(expr.arguments.length >= 1) {
						const arg = this.evaluateExpression(expr.arguments[0]);
						let params = [];
						let requests = [];
						if(arg.isString()) {
							params = [arg];
						} else if(arg.isArray()) {
							params = arg.items.filter(param => param.isString());
						}
						if(params.length > 0) {
							params.forEach((param, idx) => {
								const request = param.string;
								const dep = new ModuleHotAcceptDependency(request, param.range);
								dep.optional = true;
								dep.loc = Object.create(expr.loc);
								dep.loc.index = idx;
								this.state.module.addDependency(dep);
								requests.push(request);
							});
							if(expr.arguments.length > 1) {
								this.applyPluginsBailResult("hot accept callback", expr.arguments[1], requests);
								parser.walkExpression(expr.arguments[1]); // other args are ignored
							} else {
								this.applyPluginsBailResult("hot accept without callback", expr, requests);
							}
							return true;
						}
					}
				});
				parser.plugin("call module.hot.decline", function(expr) {
					if(!this.state.compilation.hotUpdateChunkTemplate) return false;
					if(expr.arguments.length === 1) {
						const arg = this.evaluateExpression(expr.arguments[0]);
						let params = [];
						if(arg.isString()) {
							params = [arg];
						} else if(arg.isArray()) {
							params = arg.items.filter(param => param.isString());
						}
						params.forEach((param, idx) => {
							const dep = new ModuleHotDeclineDependency(param.string, param.range);
							dep.optional = true;
							dep.loc = Object.create(expr.loc);
							dep.loc.index = idx;
							this.state.module.addDependency(dep);
						});
					}
				});
				parser.plugin("expression module.hot", ParserHelpers.skipTraversal);
			});
		});
	}

};

const hotInitCode = Template.getFunctionContent(require("./HotModuleReplacement.runtime.js"));

}, function(modId) { var map = {"./Template":1602510872137,"./dependencies/ModuleHotAcceptDependency":1602510872342,"./dependencies/ModuleHotDeclineDependency":1602510872343,"./dependencies/ConstDependency":1602510872201,"./NullFactory":1602510872205,"./ParserHelpers":1602510872203,"./HotModuleReplacement.runtime.js":1602510872344}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872342, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyTemplateAsId = require("./ModuleDependencyTemplateAsId");

class ModuleHotAcceptDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
		this.weak = true;
	}

	get type() {
		return "module.hot.accept";
	}
}

ModuleHotAcceptDependency.Template = ModuleDependencyTemplateAsId;

module.exports = ModuleHotAcceptDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./ModuleDependencyTemplateAsId":1602510872218}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872343, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyTemplateAsId = require("./ModuleDependencyTemplateAsId");

class ModuleHotDeclineDependency extends ModuleDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
		this.weak = true;
	}

	get type() {
		return "module.hot.decline";
	}
}

ModuleHotDeclineDependency.Template = ModuleDependencyTemplateAsId;

module.exports = ModuleHotDeclineDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172,"./ModuleDependencyTemplateAsId":1602510872218}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872344, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*global $hash$ $requestTimeout$ installedModules $require$ hotDownloadManifest hotDownloadUpdateChunk hotDisposeChunk modules */
module.exports = function() {

	var hotApplyOnUpdate = true;
	var hotCurrentHash = $hash$; // eslint-disable-line no-unused-vars
	var hotRequestTimeout = $requestTimeout$;
	var hotCurrentModuleData = {};
	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars

	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
		var me = installedModules[moduleId];
		if(!me) return $require$;
		var fn = function(request) {
			if(me.hot.active) {
				if(installedModules[request]) {
					if(installedModules[request].parents.indexOf(moduleId) < 0)
						installedModules[request].parents.push(moduleId);
				} else {
					hotCurrentParents = [moduleId];
					hotCurrentChildModule = request;
				}
				if(me.children.indexOf(request) < 0)
					me.children.push(request);
			} else {
				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
				hotCurrentParents = [];
			}
			return $require$(request);
		};
		var ObjectFactory = function ObjectFactory(name) {
			return {
				configurable: true,
				enumerable: true,
				get: function() {
					return $require$[name];
				},
				set: function(value) {
					$require$[name] = value;
				}
			};
		};
		for(var name in $require$) {
			if(Object.prototype.hasOwnProperty.call($require$, name) && name !== "e") {
				Object.defineProperty(fn, name, ObjectFactory(name));
			}
		}
		fn.e = function(chunkId) {
			if(hotStatus === "ready")
				hotSetStatus("prepare");
			hotChunksLoading++;
			return $require$.e(chunkId).then(finishChunkLoading, function(err) {
				finishChunkLoading();
				throw err;
			});

			function finishChunkLoading() {
				hotChunksLoading--;
				if(hotStatus === "prepare") {
					if(!hotWaitingFilesMap[chunkId]) {
						hotEnsureUpdateChunk(chunkId);
					}
					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
						hotUpdateDownloaded();
					}
				}
			}
		};
		return fn;
	}

	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
		var hot = {
			// private stuff
			_acceptedDependencies: {},
			_declinedDependencies: {},
			_selfAccepted: false,
			_selfDeclined: false,
			_disposeHandlers: [],
			_main: hotCurrentChildModule !== moduleId,

			// Module API
			active: true,
			accept: function(dep, callback) {
				if(typeof dep === "undefined")
					hot._selfAccepted = true;
				else if(typeof dep === "function")
					hot._selfAccepted = dep;
				else if(typeof dep === "object")
					for(var i = 0; i < dep.length; i++)
						hot._acceptedDependencies[dep[i]] = callback || function() {};
				else
					hot._acceptedDependencies[dep] = callback || function() {};
			},
			decline: function(dep) {
				if(typeof dep === "undefined")
					hot._selfDeclined = true;
				else if(typeof dep === "object")
					for(var i = 0; i < dep.length; i++)
						hot._declinedDependencies[dep[i]] = true;
				else
					hot._declinedDependencies[dep] = true;
			},
			dispose: function(callback) {
				hot._disposeHandlers.push(callback);
			},
			addDisposeHandler: function(callback) {
				hot._disposeHandlers.push(callback);
			},
			removeDisposeHandler: function(callback) {
				var idx = hot._disposeHandlers.indexOf(callback);
				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
			},

			// Management API
			check: hotCheck,
			apply: hotApply,
			status: function(l) {
				if(!l) return hotStatus;
				hotStatusHandlers.push(l);
			},
			addStatusHandler: function(l) {
				hotStatusHandlers.push(l);
			},
			removeStatusHandler: function(l) {
				var idx = hotStatusHandlers.indexOf(l);
				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
			},

			//inherit from previous dispose call
			data: hotCurrentModuleData[moduleId]
		};
		hotCurrentChildModule = undefined;
		return hot;
	}

	var hotStatusHandlers = [];
	var hotStatus = "idle";

	function hotSetStatus(newStatus) {
		hotStatus = newStatus;
		for(var i = 0; i < hotStatusHandlers.length; i++)
			hotStatusHandlers[i].call(null, newStatus);
	}

	// while downloading
	var hotWaitingFiles = 0;
	var hotChunksLoading = 0;
	var hotWaitingFilesMap = {};
	var hotRequestedFilesMap = {};
	var hotAvailableFilesMap = {};
	var hotDeferred;

	// The update info
	var hotUpdate, hotUpdateNewHash;

	function toModuleId(id) {
		var isNumber = (+id) + "" === id;
		return isNumber ? +id : id;
	}

	function hotCheck(apply) {
		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
		hotApplyOnUpdate = apply;
		hotSetStatus("check");
		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
			if(!update) {
				hotSetStatus("idle");
				return null;
			}
			hotRequestedFilesMap = {};
			hotWaitingFilesMap = {};
			hotAvailableFilesMap = update.c;
			hotUpdateNewHash = update.h;

			hotSetStatus("prepare");
			var promise = new Promise(function(resolve, reject) {
				hotDeferred = {
					resolve: resolve,
					reject: reject
				};
			});
			hotUpdate = {};
			/*foreachInstalledChunks*/
			{ // eslint-disable-line no-lone-blocks
				/*globals chunkId */
				hotEnsureUpdateChunk(chunkId);
			}
			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
				hotUpdateDownloaded();
			}
			return promise;
		});
	}

	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
			return;
		hotRequestedFilesMap[chunkId] = false;
		for(var moduleId in moreModules) {
			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
				hotUpdate[moduleId] = moreModules[moduleId];
			}
		}
		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
			hotUpdateDownloaded();
		}
	}

	function hotEnsureUpdateChunk(chunkId) {
		if(!hotAvailableFilesMap[chunkId]) {
			hotWaitingFilesMap[chunkId] = true;
		} else {
			hotRequestedFilesMap[chunkId] = true;
			hotWaitingFiles++;
			hotDownloadUpdateChunk(chunkId);
		}
	}

	function hotUpdateDownloaded() {
		hotSetStatus("ready");
		var deferred = hotDeferred;
		hotDeferred = null;
		if(!deferred) return;
		if(hotApplyOnUpdate) {
			// Wrap deferred object in Promise to mark it as a well-handled Promise to
			// avoid triggering uncaught exception warning in Chrome.
			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
			Promise.resolve().then(function() {
				return hotApply(hotApplyOnUpdate);
			}).then(
				function(result) {
					deferred.resolve(result);
				},
				function(err) {
					deferred.reject(err);
				}
			);
		} else {
			var outdatedModules = [];
			for(var id in hotUpdate) {
				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
					outdatedModules.push(toModuleId(id));
				}
			}
			deferred.resolve(outdatedModules);
		}
	}

	function hotApply(options) {
		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
		options = options || {};

		var cb;
		var i;
		var j;
		var module;
		var moduleId;

		function getAffectedStuff(updateModuleId) {
			var outdatedModules = [updateModuleId];
			var outdatedDependencies = {};

			var queue = outdatedModules.slice().map(function(id) {
				return {
					chain: [id],
					id: id
				};
			});
			while(queue.length > 0) {
				var queueItem = queue.pop();
				var moduleId = queueItem.id;
				var chain = queueItem.chain;
				module = installedModules[moduleId];
				if(!module || module.hot._selfAccepted)
					continue;
				if(module.hot._selfDeclined) {
					return {
						type: "self-declined",
						chain: chain,
						moduleId: moduleId
					};
				}
				if(module.hot._main) {
					return {
						type: "unaccepted",
						chain: chain,
						moduleId: moduleId
					};
				}
				for(var i = 0; i < module.parents.length; i++) {
					var parentId = module.parents[i];
					var parent = installedModules[parentId];
					if(!parent) continue;
					if(parent.hot._declinedDependencies[moduleId]) {
						return {
							type: "declined",
							chain: chain.concat([parentId]),
							moduleId: moduleId,
							parentId: parentId
						};
					}
					if(outdatedModules.indexOf(parentId) >= 0) continue;
					if(parent.hot._acceptedDependencies[moduleId]) {
						if(!outdatedDependencies[parentId])
							outdatedDependencies[parentId] = [];
						addAllToSet(outdatedDependencies[parentId], [moduleId]);
						continue;
					}
					delete outdatedDependencies[parentId];
					outdatedModules.push(parentId);
					queue.push({
						chain: chain.concat([parentId]),
						id: parentId
					});
				}
			}

			return {
				type: "accepted",
				moduleId: updateModuleId,
				outdatedModules: outdatedModules,
				outdatedDependencies: outdatedDependencies
			};
		}

		function addAllToSet(a, b) {
			for(var i = 0; i < b.length; i++) {
				var item = b[i];
				if(a.indexOf(item) < 0)
					a.push(item);
			}
		}

		// at begin all updates modules are outdated
		// the "outdated" status can propagate to parents if they don't accept the children
		var outdatedDependencies = {};
		var outdatedModules = [];
		var appliedUpdate = {};

		var warnUnexpectedRequire = function warnUnexpectedRequire() {
			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
		};

		for(var id in hotUpdate) {
			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
				moduleId = toModuleId(id);
				var result;
				if(hotUpdate[id]) {
					result = getAffectedStuff(moduleId);
				} else {
					result = {
						type: "disposed",
						moduleId: id
					};
				}
				var abortError = false;
				var doApply = false;
				var doDispose = false;
				var chainInfo = "";
				if(result.chain) {
					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
				}
				switch(result.type) {
					case "self-declined":
						if(options.onDeclined)
							options.onDeclined(result);
						if(!options.ignoreDeclined)
							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
						break;
					case "declined":
						if(options.onDeclined)
							options.onDeclined(result);
						if(!options.ignoreDeclined)
							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
						break;
					case "unaccepted":
						if(options.onUnaccepted)
							options.onUnaccepted(result);
						if(!options.ignoreUnaccepted)
							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
						break;
					case "accepted":
						if(options.onAccepted)
							options.onAccepted(result);
						doApply = true;
						break;
					case "disposed":
						if(options.onDisposed)
							options.onDisposed(result);
						doDispose = true;
						break;
					default:
						throw new Error("Unexception type " + result.type);
				}
				if(abortError) {
					hotSetStatus("abort");
					return Promise.reject(abortError);
				}
				if(doApply) {
					appliedUpdate[moduleId] = hotUpdate[moduleId];
					addAllToSet(outdatedModules, result.outdatedModules);
					for(moduleId in result.outdatedDependencies) {
						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
							if(!outdatedDependencies[moduleId])
								outdatedDependencies[moduleId] = [];
							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
						}
					}
				}
				if(doDispose) {
					addAllToSet(outdatedModules, [result.moduleId]);
					appliedUpdate[moduleId] = warnUnexpectedRequire;
				}
			}
		}

		// Store self accepted outdated modules to require them later by the module system
		var outdatedSelfAcceptedModules = [];
		for(i = 0; i < outdatedModules.length; i++) {
			moduleId = outdatedModules[i];
			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
				outdatedSelfAcceptedModules.push({
					module: moduleId,
					errorHandler: installedModules[moduleId].hot._selfAccepted
				});
		}

		// Now in "dispose" phase
		hotSetStatus("dispose");
		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
			if(hotAvailableFilesMap[chunkId] === false) {
				hotDisposeChunk(chunkId);
			}
		});

		var idx;
		var queue = outdatedModules.slice();
		while(queue.length > 0) {
			moduleId = queue.pop();
			module = installedModules[moduleId];
			if(!module) continue;

			var data = {};

			// Call dispose handlers
			var disposeHandlers = module.hot._disposeHandlers;
			for(j = 0; j < disposeHandlers.length; j++) {
				cb = disposeHandlers[j];
				cb(data);
			}
			hotCurrentModuleData[moduleId] = data;

			// disable module (this disables requires from this module)
			module.hot.active = false;

			// remove module from cache
			delete installedModules[moduleId];

			// when disposing there is no need to call dispose handler
			delete outdatedDependencies[moduleId];

			// remove "parents" references from all children
			for(j = 0; j < module.children.length; j++) {
				var child = installedModules[module.children[j]];
				if(!child) continue;
				idx = child.parents.indexOf(moduleId);
				if(idx >= 0) {
					child.parents.splice(idx, 1);
				}
			}
		}

		// remove outdated dependency from module children
		var dependency;
		var moduleOutdatedDependencies;
		for(moduleId in outdatedDependencies) {
			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
				module = installedModules[moduleId];
				if(module) {
					moduleOutdatedDependencies = outdatedDependencies[moduleId];
					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
						dependency = moduleOutdatedDependencies[j];
						idx = module.children.indexOf(dependency);
						if(idx >= 0) module.children.splice(idx, 1);
					}
				}
			}
		}

		// Not in "apply" phase
		hotSetStatus("apply");

		hotCurrentHash = hotUpdateNewHash;

		// insert new code
		for(moduleId in appliedUpdate) {
			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
				modules[moduleId] = appliedUpdate[moduleId];
			}
		}

		// call accept handlers
		var error = null;
		for(moduleId in outdatedDependencies) {
			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
				module = installedModules[moduleId];
				if(module) {
					moduleOutdatedDependencies = outdatedDependencies[moduleId];
					var callbacks = [];
					for(i = 0; i < moduleOutdatedDependencies.length; i++) {
						dependency = moduleOutdatedDependencies[i];
						cb = module.hot._acceptedDependencies[dependency];
						if(cb) {
							if(callbacks.indexOf(cb) >= 0) continue;
							callbacks.push(cb);
						}
					}
					for(i = 0; i < callbacks.length; i++) {
						cb = callbacks[i];
						try {
							cb(moduleOutdatedDependencies);
						} catch(err) {
							if(options.onErrored) {
								options.onErrored({
									type: "accept-errored",
									moduleId: moduleId,
									dependencyId: moduleOutdatedDependencies[i],
									error: err
								});
							}
							if(!options.ignoreErrored) {
								if(!error)
									error = err;
							}
						}
					}
				}
			}
		}

		// Load self accepted modules
		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
			var item = outdatedSelfAcceptedModules[i];
			moduleId = item.module;
			hotCurrentParents = [moduleId];
			try {
				$require$(moduleId);
			} catch(err) {
				if(typeof item.errorHandler === "function") {
					try {
						item.errorHandler(err);
					} catch(err2) {
						if(options.onErrored) {
							options.onErrored({
								type: "self-accept-error-handler-errored",
								moduleId: moduleId,
								error: err2,
								orginalError: err, // TODO remove in webpack 4
								originalError: err
							});
						}
						if(!options.ignoreErrored) {
							if(!error)
								error = err2;
						}
						if(!error)
							error = err;
					}
				} else {
					if(options.onErrored) {
						options.onErrored({
							type: "self-accept-errored",
							moduleId: moduleId,
							error: err
						});
					}
					if(!options.ignoreErrored) {
						if(!error)
							error = err;
					}
				}
			}
		}

		// handle errors in accept handlers and self accepted module load
		if(error) {
			hotSetStatus("fail");
			return Promise.reject(error);
		}

		hotSetStatus("idle");
		return new Promise(function(resolve) {
			resolve(outdatedModules);
		});
	}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872345, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ConstDependency = require("./dependencies/ConstDependency");
const ParserHelpers = require("./ParserHelpers");
const NullFactory = require("./NullFactory");

const REPLACEMENTS = {
	__webpack_hash__: "__webpack_require__.h", // eslint-disable-line camelcase
	__webpack_chunkname__: "__webpack_require__.cn" // eslint-disable-line camelcase
};
const REPLACEMENT_TYPES = {
	__webpack_hash__: "string", // eslint-disable-line camelcase
	__webpack_chunkname__: "string" // eslint-disable-line camelcase
};

class ExtendedAPIPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			compilation.dependencyFactories.set(ConstDependency, new NullFactory());
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
			compilation.mainTemplate.plugin("require-extensions", function(source, chunk, hash) {
				const buf = [source];
				buf.push("");
				buf.push("// __webpack_hash__");
				buf.push(`${this.requireFn}.h = ${JSON.stringify(hash)};`);
				buf.push("");
				buf.push("// __webpack_chunkname__");
				buf.push(`${this.requireFn}.cn = ${JSON.stringify(chunk.name)};`);
				return this.asString(buf);
			});
			compilation.mainTemplate.plugin("global-hash", () => true);

			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {
				Object.keys(REPLACEMENTS).forEach(key => {
					parser.plugin(`expression ${key}`, ParserHelpers.toConstantDependency(REPLACEMENTS[key]));
					parser.plugin(`evaluate typeof ${key}`, ParserHelpers.evaluateToString(REPLACEMENT_TYPES[key]));
				});
			});
		});
	}
}

module.exports = ExtendedAPIPlugin;

}, function(modId) { var map = {"./dependencies/ConstDependency":1602510872201,"./ParserHelpers":1602510872203,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872346, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = require("memory-fs");

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872347, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class ProgressPlugin {

	constructor(options) {
		if(typeof options === "function") {
			options = {
				handler: options
			};
		}
		options = options || {};
		this.profile = options.profile;
		this.handler = options.handler;
	}

	apply(compiler) {
		const handler = this.handler || defaultHandler;
		const profile = this.profile;
		if(compiler.compilers) {
			const states = new Array(compiler.compilers.length);
			compiler.compilers.forEach(function(compiler, idx) {
				compiler.apply(new ProgressPlugin(function(p, msg) {
					states[idx] = Array.prototype.slice.apply(arguments);
					handler.apply(null, [
						states.map(state => state && state[0] || 0).reduce((a, b) => a + b) / states.length,
						`[${idx}] ${msg}`
					].concat(Array.prototype.slice.call(arguments, 2)));
				}));
			});
		} else {
			let lastModulesCount = 0;
			let moduleCount = 500;
			let doneModules = 0;
			const activeModules = [];

			const update = function update(module) {
				handler(
					0.1 + (doneModules / Math.max(lastModulesCount, moduleCount)) * 0.6,
					"building modules",
					`${doneModules}/${moduleCount} modules`,
					`${activeModules.length} active`,
					activeModules[activeModules.length - 1]
				);
			};

			const moduleDone = function moduleDone(module) {
				doneModules++;
				const ident = module.identifier();
				if(ident) {
					const idx = activeModules.indexOf(ident);
					if(idx >= 0) activeModules.splice(idx, 1);
				}
				update();
			};
			compiler.plugin("compilation", function(compilation) {
				if(compilation.compiler.isChild()) return;
				lastModulesCount = moduleCount;
				moduleCount = 0;
				doneModules = 0;
				handler(0, "compiling");
				compilation.plugin("build-module", function(module) {
					moduleCount++;
					const ident = module.identifier();
					if(ident) {
						activeModules.push(ident);
					}
					update();
				});
				compilation.plugin("failed-module", moduleDone);
				compilation.plugin("succeed-module", moduleDone);
				const syncHooks = {
					"seal": [0.71, "sealing"],
					"optimize": [0.72, "optimizing"],
					"optimize-modules-basic": [0.73, "basic module optimization"],
					"optimize-modules": [0.74, "module optimization"],
					"optimize-modules-advanced": [0.75, "advanced module optimization"],
					"optimize-chunks-basic": [0.76, "basic chunk optimization"],
					"optimize-chunks": [0.77, "chunk optimization"],
					"optimize-chunks-advanced": [0.78, "advanced chunk optimization"],
					// optimize-tree
					"optimize-chunk-modules": [0.80, "chunk modules optimization"],
					"optimize-chunk-modules-advanced": [0.81, "advanced chunk modules optimization"],
					"revive-modules": [0.82, "module reviving"],
					"optimize-module-order": [0.83, "module order optimization"],
					"optimize-module-ids": [0.84, "module id optimization"],
					"revive-chunks": [0.85, "chunk reviving"],
					"optimize-chunk-order": [0.86, "chunk order optimization"],
					"optimize-chunk-ids": [0.87, "chunk id optimization"],
					"before-hash": [0.88, "hashing"],
					"before-module-assets": [0.89, "module assets processing"],
					"before-chunk-assets": [0.90, "chunk assets processing"],
					"additional-chunk-assets": [0.91, "additional chunk assets processing"],
					"record": [0.92, "recording"]
				};
				Object.keys(syncHooks).forEach(name => {
					let pass = 0;
					const settings = syncHooks[name];
					compilation.plugin(name, () => {
						if(pass++ > 0)
							handler(settings[0], settings[1], `pass ${pass}`);
						else
							handler(settings[0], settings[1]);
					});
				});
				compilation.plugin("optimize-tree", (chunks, modules, callback) => {
					handler(0.79, "module and chunk tree optimization");
					callback();
				});
				compilation.plugin("additional-assets", callback => {
					handler(0.91, "additional asset processing");
					callback();
				});
				compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
					handler(0.92, "chunk asset optimization");
					callback();
				});
				compilation.plugin("optimize-assets", (assets, callback) => {
					handler(0.94, "asset optimization");
					callback();
				});
			});
			compiler.plugin("emit", (compilation, callback) => {
				handler(0.95, "emitting");
				callback();
			});
			compiler.plugin("done", () => {
				handler(1, "");
			});
		}

		let lineCaretPosition = 0,
			lastState, lastStateTime;

		function defaultHandler(percentage, msg) {
			let state = msg;
			const details = Array.prototype.slice.call(arguments, 2);
			if(percentage < 1) {
				percentage = Math.floor(percentage * 100);
				msg = `${percentage}% ${msg}`;
				if(percentage < 100) {
					msg = ` ${msg}`;
				}
				if(percentage < 10) {
					msg = ` ${msg}`;
				}
				details.forEach(detail => {
					if(!detail) return;
					if(detail.length > 40) {
						detail = `...${detail.substr(detail.length - 37)}`;
					}
					msg += ` ${detail}`;
				});
			}
			if(profile) {
				state = state.replace(/^\d+\/\d+\s+/, "");
				if(percentage === 0) {
					lastState = null;
					lastStateTime = Date.now();
				} else if(state !== lastState || percentage === 1) {
					const now = Date.now();
					if(lastState) {
						const stateMsg = `${now - lastStateTime}ms ${lastState}`;
						goToLineStart(stateMsg);
						process.stderr.write(stateMsg + "\n");
						lineCaretPosition = 0;
					}
					lastState = state;
					lastStateTime = now;
				}
			}
			goToLineStart(msg);
			process.stderr.write(msg);
		}

		function goToLineStart(nextMessage) {
			let str = "";
			for(; lineCaretPosition > nextMessage.length; lineCaretPosition--) {
				str += "\b \b";
			}
			for(var i = 0; i < lineCaretPosition; i++) {
				str += "\b";
			}
			lineCaretPosition = nextMessage.length;
			if(str) process.stderr.write(str);
		}
	}
}
module.exports = ProgressPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872348, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


let deprecationReported = false;

class NoErrorsPlugin {
	apply(compiler) {
		compiler.plugin("should-emit", (compilation) => {
			if(!deprecationReported) {
				compilation.warnings.push("webpack: Using NoErrorsPlugin is deprecated.\n" +
					"Use NoEmitOnErrorsPlugin instead.\n");
				deprecationReported = true;
			}
			if(compilation.errors.length > 0)
				return false;
		});
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("should-record", () => {
				if(compilation.errors.length > 0)
					return false;
			});
		});
	}
}

module.exports = NoErrorsPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872349, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class NoEmitOnErrorsPlugin {
	apply(compiler) {
		compiler.plugin("should-emit", (compilation) => {
			if(compilation.getStats().hasErrors())
				return false;
		});
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("should-record", () => {
				if(compilation.getStats().hasErrors())
					return false;
			});
		});
	}
}

module.exports = NoEmitOnErrorsPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872350, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class NewWatchingPlugin {
	apply(compiler) {
		compiler.plugin("compilation", function(compilation) {
			compilation.warnings.push(new Error("The 'NewWatchingPlugin' is no longer necessary (now default)"));
		});
	}
}

module.exports = NewWatchingPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872351, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Authors Simen Brekken @simenbrekken, Einar Löve @einarlove
*/



const DefinePlugin = require("./DefinePlugin");

const needsEnvVarFix = ["8", "9"].indexOf(process.versions.node.split(".")[0]) >= 0 &&
	process.platform === "win32";

class EnvironmentPlugin {
	constructor(keys) {
		if(Array.isArray(keys)) {
			this.keys = keys;
			this.defaultValues = {};
		} else if(keys && typeof keys === "object") {
			this.keys = Object.keys(keys);
			this.defaultValues = keys;
		} else {
			this.keys = Array.prototype.slice.call(arguments);
			this.defaultValues = {};
		}
	}

	apply(compiler) {
		const definitions = this.keys.reduce((defs, key) => {
			// TODO remove once the fix has made its way into Node 8.
			// Work around https://github.com/nodejs/node/pull/18463,
			// affecting Node 8 & 9 by performing an OS-level
			// operation that always succeeds before reading
			// environment variables:
			if(needsEnvVarFix) require("os").cpus();

			const value = process.env[key] !== undefined ? process.env[key] : this.defaultValues[key];

			if(value === undefined) {
				compiler.plugin("this-compilation", compilation => {
					const error = new Error(
						`EnvironmentPlugin - ${key} environment variable is undefined.\n\n` +
						"You can pass an object with default values to suppress this warning.\n" +
						"See https://webpack.js.org/plugins/environment-plugin for example."
					);

					error.name = "EnvVariableNotDefinedError";
					compilation.warnings.push(error);
				});
			}

			defs[`process.env.${key}`] = typeof value === "undefined" ? "undefined" : JSON.stringify(value);

			return defs;
		}, {});

		compiler.apply(new DefinePlugin(definitions));
	}
}

module.exports = EnvironmentPlugin;

}, function(modId) { var map = {"./DefinePlugin":1602510872330}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872352, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
	*/


const DllEntryPlugin = require("./DllEntryPlugin");
const LibManifestPlugin = require("./LibManifestPlugin");
const FlagInitialModulesAsUsedPlugin = require("./FlagInitialModulesAsUsedPlugin");

class DllPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.plugin("entry-option", (context, entry) => {
			function itemToPlugin(item, name) {
				if(Array.isArray(item))
					return new DllEntryPlugin(context, item, name);
				else
					throw new Error("DllPlugin: supply an Array as entry");
			}
			if(typeof entry === "object" && !Array.isArray(entry)) {
				Object.keys(entry).forEach(name => {
					compiler.apply(itemToPlugin(entry[name], name));
				});
			} else {
				compiler.apply(itemToPlugin(entry, "main"));
			}
			return true;
		});
		compiler.apply(new LibManifestPlugin(this.options));
		compiler.apply(new FlagInitialModulesAsUsedPlugin());
	}
}

module.exports = DllPlugin;

}, function(modId) { var map = {"./DllEntryPlugin":1602510872353,"./LibManifestPlugin":1602510872357,"./FlagInitialModulesAsUsedPlugin":1602510872358}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872353, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const DllEntryDependency = require("./dependencies/DllEntryDependency");
const SingleEntryDependency = require("./dependencies/SingleEntryDependency");
const DllModuleFactory = require("./DllModuleFactory");

class DllEntryPlugin {
	constructor(context, entries, name) {
		this.context = context;
		this.entries = entries;
		this.name = name;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const dllModuleFactory = new DllModuleFactory();
			const normalModuleFactory = params.normalModuleFactory;

			compilation.dependencyFactories.set(DllEntryDependency, dllModuleFactory);

			compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
		});
		compiler.plugin("make", (compilation, callback) => {
			compilation.addEntry(this.context, new DllEntryDependency(this.entries.map((e, idx) => {
				const dep = new SingleEntryDependency(e);
				dep.loc = `${this.name}:${idx}`;
				return dep;
			}), this.name), this.name, callback);
		});
	}
}

module.exports = DllEntryPlugin;

}, function(modId) { var map = {"./dependencies/DllEntryDependency":1602510872354,"./dependencies/SingleEntryDependency":1602510872193,"./DllModuleFactory":1602510872355}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872354, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = require("../Dependency");

class DllEntryDependency extends Dependency {
	constructor(dependencies, name) {
		super();
		this.dependencies = dependencies;
		this.name = name;
	}

	get type() {
		return "dll entry";
	}
}

module.exports = DllEntryDependency;

}, function(modId) { var map = {"../Dependency":1602510872145}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872355, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Tapable = require("tapable");
const DllModule = require("./DllModule");

class DllModuleFactory extends Tapable {
	constructor() {
		super();
	}
	create(data, callback) {
		const dependency = data.dependencies[0];
		callback(null, new DllModule(data.context, dependency.dependencies, dependency.name, dependency.type));
	}
}

module.exports = DllModuleFactory;

}, function(modId) { var map = {"./DllModule":1602510872356}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872356, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
	*/


const Module = require("./Module");
const RawSource = require("webpack-sources").RawSource;

class DllModule extends Module {
	constructor(context, dependencies, name, type) {
		super();
		this.context = context;
		this.dependencies = dependencies;
		this.name = name;
		this.built = false;
		this.cacheable = true;
		this.type = type;
	}

	identifier() {
		return `dll ${this.name}`;
	}

	readableIdentifier() {
		return `dll ${this.name}`;
	}

	disconnect() {
		this.built = false;
		super.disconnect();
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		return callback();
	}

	source() {
		return new RawSource("module.exports = __webpack_require__;");
	}

	needRebuild() {
		return false;
	}

	size() {
		return 12;
	}

	updateHash(hash) {
		hash.update("dll module");
		hash.update(this.name || "");
		super.updateHash(hash);
	}
}

module.exports = DllModule;

}, function(modId) { var map = {"./Module":1602510872132}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872357, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const path = require("path");
const asyncLib = require("async");

class LibManifestPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.plugin("emit", (compilation, callback) => {
			asyncLib.forEach(compilation.chunks, (chunk, callback) => {
				if(!chunk.isInitial()) {
					callback();
					return;
				}
				const targetPath = compilation.getPath(this.options.path, {
					hash: compilation.hash,
					chunk
				});
				const name = this.options.name && compilation.getPath(this.options.name, {
					hash: compilation.hash,
					chunk
				});
				const manifest = {
					name,
					type: this.options.type,
					content: chunk.mapModules(module => {
						if(module.libIdent) {
							const ident = module.libIdent({
								context: this.options.context || compiler.options.context
							});
							if(ident) {
								return {
									ident,
									data: {
										id: module.id,
										meta: module.meta,
										exports: Array.isArray(module.providedExports) ? module.providedExports : undefined
									}
								};
							}
						}
					}).filter(Boolean).reduce((obj, item) => {
						obj[item.ident] = item.data;
						return obj;
					}, Object.create(null))
				};
				const content = new Buffer(JSON.stringify(manifest), "utf8"); //eslint-disable-line
				compiler.outputFileSystem.mkdirp(path.dirname(targetPath), err => {
					if(err) return callback(err);
					compiler.outputFileSystem.writeFile(targetPath, content, callback);
				});
			}, callback);
		});
	}
}
module.exports = LibManifestPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872358, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class FlagInitialModulesAsUsedPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("after-optimize-chunks", (chunks) => {
				chunks.forEach((chunk) => {
					if(!chunk.isInitial()) {
						return;
					}
					chunk.forEachModule((module) => {
						module.usedExports = true;
					});
				});
			});
		});
	}
}

module.exports = FlagInitialModulesAsUsedPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872359, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const DelegatedSourceDependency = require("./dependencies/DelegatedSourceDependency");
const DelegatedModuleFactoryPlugin = require("./DelegatedModuleFactoryPlugin");
const ExternalModuleFactoryPlugin = require("./ExternalModuleFactoryPlugin");
const DelegatedExportsDependency = require("./dependencies/DelegatedExportsDependency");
const NullFactory = require("./NullFactory");

class DllReferencePlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			const normalModuleFactory = params.normalModuleFactory;
			compilation.dependencyFactories.set(DelegatedSourceDependency, normalModuleFactory);
			compilation.dependencyFactories.set(DelegatedExportsDependency, new NullFactory());
		});

		compiler.plugin("before-compile", (params, callback) => {
			const manifest = this.options.manifest;
			if(typeof manifest === "string") {
				params.compilationDependencies.push(manifest);
				compiler.inputFileSystem.readFile(manifest, function(err, result) {
					if(err) return callback(err);
					params["dll reference " + manifest] = JSON.parse(result.toString("utf-8"));
					return callback();
				});
			} else {
				return callback();
			}
		});

		compiler.plugin("compile", (params) => {
			let manifest = this.options.manifest;
			if(typeof manifest === "string") {
				manifest = params["dll reference " + manifest];
			}
			const name = this.options.name || manifest.name;
			const sourceType = this.options.sourceType || (manifest && manifest.type) || "var";
			const externals = {};
			const source = "dll-reference " + name;
			externals[source] = name;
			params.normalModuleFactory.apply(new ExternalModuleFactoryPlugin(sourceType, externals));
			params.normalModuleFactory.apply(new DelegatedModuleFactoryPlugin({
				source: source,
				type: this.options.type,
				scope: this.options.scope,
				context: this.options.context || compiler.options.context,
				content: this.options.content || manifest.content,
				extensions: this.options.extensions
			}));
		});
	}
}

module.exports = DllReferencePlugin;

}, function(modId) { var map = {"./dependencies/DelegatedSourceDependency":1602510872360,"./DelegatedModuleFactoryPlugin":1602510872361,"./ExternalModuleFactoryPlugin":1602510872315,"./dependencies/DelegatedExportsDependency":1602510872363,"./NullFactory":1602510872205}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872360, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const ModuleDependency = require("./ModuleDependency");

class DelegatedSourceDependency extends ModuleDependency {
	constructor(request) {
		super(request);
	}

	get type() {
		return "delegated source";
	}
}

module.exports = DelegatedSourceDependency;

}, function(modId) { var map = {"./ModuleDependency":1602510872172}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872361, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const DelegatedModule = require("./DelegatedModule");

// options.source
// options.type
// options.context
// options.scope
// options.content
class DelegatedModuleFactoryPlugin {
	constructor(options) {
		this.options = options;
		options.type = options.type || "require";
		options.extensions = options.extensions || ["", ".js"];
	}

	apply(normalModuleFactory) {
		const scope = this.options.scope;
		if(scope) {
			normalModuleFactory.plugin("factory", factory => (data, callback) => {
				const dependency = data.dependencies[0];
				const request = dependency.request;
				if(request && request.indexOf(scope + "/") === 0) {
					const innerRequest = "." + request.substr(scope.length);
					let resolved;
					if(innerRequest in this.options.content) {
						resolved = this.options.content[innerRequest];
						return callback(null, new DelegatedModule(this.options.source, resolved, this.options.type, innerRequest, request));
					}
					for(let i = 0; i < this.options.extensions.length; i++) {
						const extension = this.options.extensions[i];
						const requestPlusExt = innerRequest + extension;
						if(requestPlusExt in this.options.content) {
							resolved = this.options.content[requestPlusExt];
							return callback(null, new DelegatedModule(this.options.source, resolved, this.options.type, requestPlusExt, request + extension));
						}
					}
				}
				return factory(data, callback);
			});
		} else {
			normalModuleFactory.plugin("module", module => {
				if(module.libIdent) {
					const request = module.libIdent(this.options);
					if(request && request in this.options.content) {
						const resolved = this.options.content[request];
						return new DelegatedModule(this.options.source, resolved, this.options.type, request, module);
					}
				}
				return module;
			});
		}
	}
}
module.exports = DelegatedModuleFactoryPlugin;

}, function(modId) { var map = {"./DelegatedModule":1602510872362}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872362, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Module = require("./Module");
const OriginalSource = require("webpack-sources").OriginalSource;
const RawSource = require("webpack-sources").RawSource;
const WebpackMissingModule = require("./dependencies/WebpackMissingModule");
const DelegatedSourceDependency = require("./dependencies/DelegatedSourceDependency");
const DelegatedExportsDependency = require("./dependencies/DelegatedExportsDependency");

class DelegatedModule extends Module {
	constructor(sourceRequest, data, type, userRequest, originalRequest) {
		super();
		this.sourceRequest = sourceRequest;
		this.request = data.id;
		this.meta = data.meta;
		this.type = type;
		this.originalRequest = originalRequest;
		this.userRequest = userRequest;
		this.built = false;
		this.delegated = true;
		this.delegateData = data;
	}

	libIdent(options) {
		return typeof this.originalRequest === "string" ? this.originalRequest : this.originalRequest.libIdent(options);
	}

	identifier() {
		return `delegated ${JSON.stringify(this.request)} from ${this.sourceRequest}`;
	}

	readableIdentifier() {
		return `delegated ${this.userRequest} from ${this.sourceRequest}`;
	}

	needRebuild() {
		return false;
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		this.builtTime = Date.now();
		this.cacheable = true;
		this.dependencies.length = 0;
		this.addDependency(new DelegatedSourceDependency(this.sourceRequest));
		this.addDependency(new DelegatedExportsDependency(this, this.delegateData.exports || true));
		callback();
	}

	unbuild() {
		this.built = false;
		super.unbuild();
	}

	source() {
		const sourceModule = this.dependencies[0].module;
		let str;

		if(!sourceModule) {
			str = WebpackMissingModule.moduleCode(this.sourceRequest);
		} else {
			str = `module.exports = (__webpack_require__(${JSON.stringify(sourceModule.id)}))`;

			switch(this.type) {
				case "require":
					str += `(${JSON.stringify(this.request)})`;
					break;
				case "object":
					str += `[${JSON.stringify(this.request)}]`;
					break;
			}

			str += ";";
		}

		if(this.useSourceMap) {
			return new OriginalSource(str, this.identifier());
		} else {
			return new RawSource(str);
		}
	}

	size() {
		return 42;
	}

	updateHash(hash) {
		hash.update(this.type);
		hash.update(JSON.stringify(this.request));
		super.updateHash(hash);
	}
}

module.exports = DelegatedModule;

}, function(modId) { var map = {"./Module":1602510872132,"./dependencies/WebpackMissingModule":1602510872219,"./dependencies/DelegatedSourceDependency":1602510872360,"./dependencies/DelegatedExportsDependency":1602510872363}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872363, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = require("./NullDependency");

class DelegatedExportsDependency extends NullDependency {
	constructor(originModule, exports) {
		super();
		this.originModule = originModule;
		this.exports = exports;
	}

	get type() {
		return "delegated exports";
	}

	getReference() {
		return {
			module: this.originModule,
			importedNames: true
		};
	}

	getExports() {
		return {
			exports: this.exports
		};
	}
}

module.exports = DelegatedExportsDependency;

}, function(modId) { var map = {"./NullDependency":1602510872202}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872364, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");

class LoaderOptionsPlugin {
	constructor(options) {
		if(typeof options !== "object") options = {};
		if(!options.test) options.test = {
			test: () => true
		};
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("normal-module-loader", (context, module) => {
				const resource = module.resource;
				if(!resource) return;
				const i = resource.indexOf("?");
				if(ModuleFilenameHelpers.matchObject(options, i < 0 ? resource : resource.substr(0, i))) {
					const filterSet = new Set(["include", "exclude", "test"]);
					Object.keys(options)
						.filter((key) => !filterSet.has(key))
						.forEach((key) => context[key] = options[key]);
				}
			});
		});
	}
}

module.exports = LoaderOptionsPlugin;

}, function(modId) { var map = {"./ModuleFilenameHelpers":1602510872186}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872365, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class NamedModulesPlugin {
	constructor(options) {
		this.options = options || {};
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("before-module-ids", (modules) => {
				modules.forEach((module) => {
					if(module.id === null && module.libIdent) {
						module.id = module.libIdent({
							context: this.options.context || compiler.options.context
						});
					}
				});
			});
		});
	}
}

module.exports = NamedModulesPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872366, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class NamedChunksPlugin {

	static defaultNameResolver(chunk) {
		return chunk.name || null;
	}

	constructor(nameResolver) {
		this.nameResolver = nameResolver || NamedChunksPlugin.defaultNameResolver;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("before-chunk-ids", (chunks) => {
				chunks.forEach((chunk) => {
					if(chunk.id === null) {
						chunk.id = this.nameResolver(chunk);
					}
				});
			});
		});
	}
}

module.exports = NamedChunksPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872367, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const createHash = require("crypto").createHash;

class HashedModuleIdsPlugin {
	constructor(options) {
		this.options = Object.assign({
			hashFunction: "md5",
			hashDigest: "base64",
			hashDigestLength: 4
		}, options);
	}

	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation) => {
			const usedIds = new Set();
			compilation.plugin("before-module-ids", (modules) => {
				modules.forEach((module) => {
					if(module.id === null && module.libIdent) {
						const id = module.libIdent({
							context: this.options.context || compiler.options.context
						});
						const hash = createHash(options.hashFunction);
						hash.update(id);
						const hashId = hash.digest(options.hashDigest);
						let len = options.hashDigestLength;
						while(usedIds.has(hashId.substr(0, len)))
							len++;
						module.id = hashId.substr(0, len);
						usedIds.add(module.id);
					}
				});
			});
		});
	}
}

module.exports = HashedModuleIdsPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872368, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class AggressiveMergingPlugin {
	constructor(options) {
		if(options !== undefined && typeof options !== "object" || Array.isArray(options)) {
			throw new Error("Argument should be an options object. To use defaults, pass in nothing.\nFor more info on options, see https://webpack.js.org/plugins/");
		}
		this.options = options || {};
	}

	apply(compiler) {
		const options = this.options;
		const minSizeReduce = options.minSizeReduce || 1.5;

		function getParentsWeight(chunk) {
			return chunk.parents.map((p) => {
				return p.isInitial() ? options.entryChunkMultiplicator || 10 : 1;
			}).reduce((a, b) => {
				return a + b;
			}, 0);
		}
		compiler.plugin("this-compilation", (compilation) => {
			compilation.plugin("optimize-chunks-advanced", (chunks) => {
				let combinations = [];
				chunks.forEach((a, idx) => {
					if(a.isInitial()) return;
					for(let i = 0; i < idx; i++) {
						const b = chunks[i];
						if(b.isInitial()) continue;
						combinations.push({
							a,
							b,
							improvement: undefined
						});
					}
				});

				combinations.forEach((pair) => {
					const a = pair.b.size({
						chunkOverhead: 0
					});
					const b = pair.a.size({
						chunkOverhead: 0
					});
					const ab = pair.b.integratedSize(pair.a, {
						chunkOverhead: 0
					});
					let newSize;
					if(ab === false) {
						pair.improvement = false;
						return;
					} else if(options.moveToParents) {
						const aOnly = ab - b;
						const bOnly = ab - a;
						const common = a + b - ab;
						newSize = common + getParentsWeight(pair.b) * aOnly + getParentsWeight(pair.a) * bOnly;
					} else {
						newSize = ab;
					}

					pair.improvement = (a + b) / newSize;
				});
				combinations = combinations.filter((pair) => {
					return pair.improvement !== false;
				});
				combinations.sort((a, b) => {
					return b.improvement - a.improvement;
				});

				const pair = combinations[0];

				if(!pair) return;
				if(pair.improvement < minSizeReduce) return;

				if(options.moveToParents) {
					const commonModules = pair.b.modules.filter((m) => {
						return pair.a.modules.indexOf(m) >= 0;
					});
					const aOnlyModules = pair.b.modules.filter((m) => {
						return commonModules.indexOf(m) < 0;
					});
					const bOnlyModules = pair.a.modules.filter((m) => {
						return commonModules.indexOf(m) < 0;
					});
					aOnlyModules.forEach((m) => {
						pair.b.removeModule(m);
						m.removeChunk(pair.b);
						pair.b.parents.forEach((c) => {
							c.addModule(m);
							m.addChunk(c);
						});
					});
					bOnlyModules.forEach((m) => {
						pair.a.removeModule(m);
						m.removeChunk(pair.a);
						pair.a.parents.forEach((c) => {
							c.addModule(m);
							m.addChunk(c);
						});
					});
				}
				if(pair.b.integrate(pair.a, "aggressive-merge")) {
					chunks.splice(chunks.indexOf(pair.a), 1);
					return true;
				}
			});
		});
	}
}

module.exports = AggressiveMergingPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872369, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const identifierUtils = require("../util/identifier");

function moveModuleBetween(oldChunk, newChunk) {
	return function(module) {
		oldChunk.moveModule(module, newChunk);
	};
}

function isNotAEntryModule(entryModule) {
	return function(module) {
		return entryModule !== module;
	};
}

function copyWithReason(obj) {
	const newObj = {};
	Object.keys(obj).forEach((key) => {
		newObj[key] = obj[key];
	});
	if(!newObj.reasons || newObj.reasons.indexOf("aggressive-splitted") < 0)
		newObj.reasons = (newObj.reasons || []).concat("aggressive-splitted");
	return newObj;
}

class AggressiveSplittingPlugin {
	constructor(options) {
		this.options = options || {};
		if(typeof this.options.minSize !== "number") this.options.minSize = 30 * 1024;
		if(typeof this.options.maxSize !== "number") this.options.maxSize = 50 * 1024;
		if(typeof this.options.chunkOverhead !== "number") this.options.chunkOverhead = 0;
		if(typeof this.options.entryChunkMultiplicator !== "number") this.options.entryChunkMultiplicator = 1;
	}
	apply(compiler) {
		compiler.plugin("this-compilation", (compilation) => {
			compilation.plugin("optimize-chunks-advanced", (chunks) => {
				// Precompute stuff
				const nameToModuleMap = new Map();
				compilation.modules.forEach(m => {
					const name = identifierUtils.makePathsRelative(compiler.context, m.identifier(), compilation.cache);
					nameToModuleMap.set(name, m);
				});

				const savedSplits = compilation.records && compilation.records.aggressiveSplits || [];
				const usedSplits = compilation._aggressiveSplittingSplits ?
					savedSplits.concat(compilation._aggressiveSplittingSplits) : savedSplits;

				const minSize = this.options.minSize;
				const maxSize = this.options.maxSize;
				// 1. try to restore to recorded splitting
				for(let j = 0; j < usedSplits.length; j++) {
					const splitData = usedSplits[j];
					const selectedModules = splitData.modules.map(name => nameToModuleMap.get(name));

					// Does the modules exist at all?
					if(selectedModules.every(Boolean)) {

						// Find all chunks containing all modules in the split
						for(let i = 0; i < chunks.length; i++) {
							const chunk = chunks[i];

							// Cheap check if chunk is suitable at all
							if(chunk.getNumberOfModules() < splitData.modules.length)
								continue;

							// Check if all modules are in the chunk
							if(selectedModules.every(m => chunk.containsModule(m))) {

								// Is chunk identical to the split or do we need to split it?
								if(chunk.getNumberOfModules() > splitData.modules.length) {
									// split the chunk into two parts
									const newChunk = compilation.addChunk();
									selectedModules.forEach(moveModuleBetween(chunk, newChunk));
									chunk.split(newChunk);
									chunk.name = null;
									newChunk._fromAggressiveSplitting = true;
									if(j < savedSplits.length)
										newChunk._fromAggressiveSplittingIndex = j;
									if(splitData.id !== null && splitData.id !== undefined) {
										newChunk.id = splitData.id;
									}
									newChunk.origins = chunk.origins.map(copyWithReason);
									chunk.origins = chunk.origins.map(copyWithReason);
									return true;
								} else { // chunk is identical to the split
									if(j < savedSplits.length)
										chunk._fromAggressiveSplittingIndex = j;
									chunk.name = null;
									if(splitData.id !== null && splitData.id !== undefined) {
										chunk.id = splitData.id;
									}
								}
							}
						}
					}
				}

				// 2. for any other chunk which isn't splitted yet, split it
				for(let i = 0; i < chunks.length; i++) {
					const chunk = chunks[i];
					const size = chunk.size(this.options);
					if(size > maxSize && chunk.getNumberOfModules() > 1) {
						const newChunk = compilation.addChunk();
						const modules = chunk.getModules()
							.filter(isNotAEntryModule(chunk.entryModule))
							.sort((a, b) => {
								a = a.identifier();
								b = b.identifier();
								if(a > b) return 1;
								if(a < b) return -1;
								return 0;
							});
						for(let k = 0; k < modules.length; k++) {
							chunk.moveModule(modules[k], newChunk);
							const newSize = newChunk.size(this.options);
							const chunkSize = chunk.size(this.options);
							// break early if it's fine
							if(chunkSize < maxSize && newSize < maxSize && newSize >= minSize && chunkSize >= minSize)
								break;
							if(newSize > maxSize && k === 0) {
								// break if there is a single module which is bigger than maxSize
								break;
							}
							if(newSize > maxSize || chunkSize < minSize) {
								// move it back
								newChunk.moveModule(modules[k], chunk);
								// check if it's fine now
								if(newSize < maxSize && newSize >= minSize && chunkSize >= minSize)
									break;
							}
						}
						if(newChunk.getNumberOfModules() > 0) {
							chunk.split(newChunk);
							chunk.name = null;
							newChunk.origins = chunk.origins.map(copyWithReason);
							chunk.origins = chunk.origins.map(copyWithReason);
							compilation._aggressiveSplittingSplits = (compilation._aggressiveSplittingSplits || []).concat({
								modules: newChunk.mapModules(m => identifierUtils.makePathsRelative(compiler.context, m.identifier(), compilation.cache))
							});
							return true;
						} else {
							chunks.splice(chunks.indexOf(newChunk), 1);
						}
					}
				}
			});
			compilation.plugin("record-hash", (records) => {
				// 3. save to made splittings to records
				const minSize = this.options.minSize;
				if(!records.aggressiveSplits) records.aggressiveSplits = [];
				compilation.chunks.forEach((chunk) => {
					if(chunk.hasEntryModule()) return;
					const size = chunk.size(this.options);
					const incorrectSize = size < minSize;
					const modules = chunk.mapModules(m => identifierUtils.makePathsRelative(compiler.context, m.identifier(), compilation.cache));
					if(typeof chunk._fromAggressiveSplittingIndex === "undefined") {
						if(incorrectSize) return;
						chunk.recorded = true;
						records.aggressiveSplits.push({
							modules: modules,
							hash: chunk.hash,
							id: chunk.id
						});
					} else {
						const splitData = records.aggressiveSplits[chunk._fromAggressiveSplittingIndex];
						if(splitData.hash !== chunk.hash || incorrectSize) {
							if(chunk._fromAggressiveSplitting) {
								chunk._aggressiveSplittingInvalid = true;
								splitData.invalid = true;
							} else {
								splitData.hash = chunk.hash;
							}
						}
					}
				});
				records.aggressiveSplits = records.aggressiveSplits.filter((splitData) => {
					return !splitData.invalid;
				});
			});
			compilation.plugin("need-additional-seal", (callback) => {
				const invalid = compilation.chunks.some((chunk) => {
					return chunk._aggressiveSplittingInvalid;
				});
				if(invalid)
					return true;
			});
		});
	}
}
module.exports = AggressiveSplittingPlugin;

}, function(modId) { var map = {"../util/identifier":1602510872151}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872370, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

let nextIdent = 0;

class CommonsChunkPlugin {
	constructor(options) {
		if(arguments.length > 1) {
			throw new Error(`Deprecation notice: CommonsChunkPlugin now only takes a single argument. Either an options
object *or* the name of the chunk.
Example: if your old code looked like this:
	new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
You would change it to:
	new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' })
The available options are:
	name: string
	names: string[]
	filename: string
	minChunks: number
	chunks: string[]
	children: boolean
	async: boolean
	minSize: number`);
		}

		const normalizedOptions = this.normalizeOptions(options);

		this.chunkNames = normalizedOptions.chunkNames;
		this.filenameTemplate = normalizedOptions.filenameTemplate;
		this.minChunks = normalizedOptions.minChunks;
		this.selectedChunks = normalizedOptions.selectedChunks;
		this.children = normalizedOptions.children;
		this.deepChildren = normalizedOptions.deepChildren;
		this.async = normalizedOptions.async;
		this.minSize = normalizedOptions.minSize;
		this.ident = __filename + (nextIdent++);
	}

	normalizeOptions(options) {
		if(Array.isArray(options)) {
			return {
				chunkNames: options,
			};
		}

		if(typeof options === "string") {
			return {
				chunkNames: [options],
			};
		}

		// options.children and options.chunk may not be used together
		if(options.children && options.chunks) {
			throw new Error("You can't and it does not make any sense to use \"children\" and \"chunk\" options together.");
		}

		/**
		 * options.async and options.filename are also not possible together
		 * as filename specifies how the chunk is called but "async" implies
		 * that webpack will take care of loading this file.
		 */
		if(options.async && options.filename) {
			throw new Error(`You can not specify a filename if you use the "async" option.
You can however specify the name of the async chunk by passing the desired string as the "async" option.`);
		}

		/**
		 * Make sure this is either an array or undefined.
		 * "name" can be a string and
		 * "names" a string or an array
		 */
		const chunkNames = options.name || options.names ? [].concat(options.name || options.names) : undefined;
		return {
			chunkNames: chunkNames,
			filenameTemplate: options.filename,
			minChunks: options.minChunks,
			selectedChunks: options.chunks,
			children: options.children,
			deepChildren: options.deepChildren,
			async: options.async,
			minSize: options.minSize
		};
	}

	apply(compiler) {
		compiler.plugin("this-compilation", (compilation) => {
			compilation.plugin(["optimize-chunks", "optimize-extracted-chunks"], (chunks) => {
				// only optimize once
				if(compilation[this.ident]) return;
				compilation[this.ident] = true;

				/**
				 * Creates a list of "common"" chunks based on the options.
				 * The list is made up of preexisting or newly created chunks.
				 * - If chunk has the name as specified in the chunkNames it is put in the list
				 * - If no chunk with the name as given in chunkNames exists a new chunk is created and added to the list
				 *
				 * These chunks are the "targets" for extracted modules.
				 */
				const targetChunks = this.getTargetChunks(chunks, compilation, this.chunkNames, this.children, this.async);

				// iterate over all our new chunks
				targetChunks.forEach((targetChunk, idx) => {

					/**
					 * These chunks are subject to get "common" modules extracted and moved to the common chunk
					 */
					const affectedChunks = this.getAffectedChunks(compilation, chunks, targetChunk, targetChunks, idx, this.selectedChunks, this.async, this.children, this.deepChildren);

					// bail if no chunk is affected
					if(!affectedChunks) {
						return;
					}

					// If we are async create an async chunk now
					// override the "commonChunk" with the newly created async one and use it as commonChunk from now on
					let asyncChunk;
					if(this.async) {
						// If async chunk is one of the affected chunks, just use it
						asyncChunk = affectedChunks.filter(c => c.name === this.async)[0];
						// Elsewise create a new one
						if(!asyncChunk) {
							asyncChunk = this.createAsyncChunk(
								compilation,
								targetChunks.length <= 1 || typeof this.async !== "string" ? this.async :
								targetChunk.name ? `${this.async}-${targetChunk.name}` :
								true,
								targetChunk
							);
						}
						targetChunk = asyncChunk;
					}

					/**
					 * Check which modules are "common" and could be extracted to a "common" chunk
					 */
					const extractableModules = this.getExtractableModules(this.minChunks, affectedChunks, targetChunk);

					// If the minSize option is set check if the size extracted from the chunk is reached
					// else bail out here.
					// As all modules/commons are interlinked with each other, common modules would be extracted
					// if we reach this mark at a later common chunk. (quirky I guess).
					if(this.minSize) {
						const modulesSize = this.calculateModulesSize(extractableModules);
						// if too small, bail
						if(modulesSize < this.minSize)
							return;
					}

					// Remove modules that are moved to commons chunk from their original chunks
					// return all chunks that are affected by having modules removed - we need them later (apparently)
					const chunksWithExtractedModules = this.extractModulesAndReturnAffectedChunks(extractableModules, affectedChunks);

					// connect all extracted modules with the common chunk
					this.addExtractedModulesToTargetChunk(targetChunk, extractableModules);

					// set filenameTemplate for chunk
					if(this.filenameTemplate)
						targetChunk.filenameTemplate = this.filenameTemplate;

					// if we are async connect the blocks of the "reallyUsedChunk" - the ones that had modules removed -
					// with the commonChunk and get the origins for the asyncChunk (remember "asyncChunk === commonChunk" at this moment).
					// bail out
					if(this.async) {
						this.moveExtractedChunkBlocksToTargetChunk(chunksWithExtractedModules, targetChunk);
						asyncChunk.origins = this.extractOriginsOfChunksWithExtractedModules(chunksWithExtractedModules);
						return;
					}

					// we are not in "async" mode
					// connect used chunks with commonChunk - shouldnt this be reallyUsedChunks here?
					this.makeTargetChunkParentOfAffectedChunks(affectedChunks, targetChunk);
				});
				return true;
			});
		});
	}

	getTargetChunks(allChunks, compilation, chunkNames, children, asyncOption) {
		const asyncOrNoSelectedChunk = children || asyncOption;

		// we have specified chunk names
		if(chunkNames) {
			// map chunks by chunkName for quick access
			const allChunksNameMap = allChunks.reduce((map, chunk) => {
				if(chunk.name) {
					map.set(chunk.name, chunk);
				}
				return map;
			}, new Map());

			// Ensure we have a chunk per specified chunk name.
			// Reuse existing chunks if possible
			return chunkNames.map(chunkName => {
				if(allChunksNameMap.has(chunkName)) {
					return allChunksNameMap.get(chunkName);
				}
				// add the filtered chunks to the compilation
				return compilation.addChunk(chunkName);
			});
		}

		// we dont have named chunks specified, so we just take all of them
		if(asyncOrNoSelectedChunk) {
			return allChunks;
		}

		/**
		 * No chunk name(s) was specified nor is this an async/children commons chunk
		 */
		throw new Error(`You did not specify any valid target chunk settings.
Take a look at the "name"/"names" or async/children option.`);
	}

	getAffectedUnnamedChunks(affectedChunks, targetChunk, rootChunk, asyncOption, deepChildrenOption) {
		let chunks = targetChunk.chunks;
		chunks && chunks.forEach((chunk) => {
			if(chunk.isInitial()) {
				return;
			}
			// If all the parents of a chunk are either
			// a) the target chunk we started with
			// b) themselves affected chunks
			// we can assume that this chunk is an affected chunk too, as there is no way a chunk that
			// isn't only depending on the target chunk is a parent of the chunk tested
			if(asyncOption || chunk.parents.every((parentChunk) => parentChunk === rootChunk || affectedChunks.has(parentChunk))) {
				// This check not only dedupes the affectedChunks but also guarantees we avoid endless loops
				if(!affectedChunks.has(chunk)) {
					// We mutate the affected chunks before going deeper, so the deeper levels and other branches
					// have the information of this chunk being affected for their assertion if a chunk should
					// not be affected
					affectedChunks.add(chunk);

					// We recurse down to all the children of the chunk, applying the same assumption.
					// This guarantees that if a chunk should be an affected chunk,
					// at the latest the last connection to the same chunk meets the
					// condition to add it to the affected chunks.
					if(deepChildrenOption === true) {
						this.getAffectedUnnamedChunks(affectedChunks, chunk, rootChunk, asyncOption, deepChildrenOption);
					}
				}
			}
		});
	}

	getAffectedChunks(compilation, allChunks, targetChunk, targetChunks, currentIndex, selectedChunks, asyncOption, childrenOption, deepChildrenOption) {
		const asyncOrNoSelectedChunk = childrenOption || asyncOption;

		if(Array.isArray(selectedChunks)) {
			return allChunks.filter(chunk => {
				const notCommmonChunk = chunk !== targetChunk;
				const isSelectedChunk = selectedChunks.indexOf(chunk.name) > -1;
				return notCommmonChunk && isSelectedChunk;
			});
		}

		if(asyncOrNoSelectedChunk) {
			let affectedChunks = new Set();
			this.getAffectedUnnamedChunks(affectedChunks, targetChunk, targetChunk, asyncOption, deepChildrenOption);
			return Array.from(affectedChunks);
		}

		/**
		 * past this point only entry chunks are allowed to become commonChunks
		 */
		if(targetChunk.parents.length > 0) {
			compilation.errors.push(new Error("CommonsChunkPlugin: While running in normal mode it's not allowed to use a non-entry chunk (" + targetChunk.name + ")"));
			return;
		}

		/**
		 * If we find a "targetchunk" that is also a normal chunk (meaning it is probably specified as an entry)
		 * and the current target chunk comes after that and the found chunk has a runtime*
		 * make that chunk be an 'affected' chunk of the current target chunk.
		 *
		 * To understand what that means take a look at the "examples/chunkhash", this basically will
		 * result in the runtime to be extracted to the current target chunk.
		 *
		 * *runtime: the "runtime" is the "webpack"-block you may have seen in the bundles that resolves modules etc.
		 */
		return allChunks.filter((chunk) => {
			const found = targetChunks.indexOf(chunk);
			if(found >= currentIndex) return false;
			return chunk.hasRuntime();
		});
	}

	createAsyncChunk(compilation, asyncOption, targetChunk) {
		const asyncChunk = compilation.addChunk(typeof asyncOption === "string" ? asyncOption : undefined);
		asyncChunk.chunkReason = "async commons chunk";
		asyncChunk.extraAsync = true;
		asyncChunk.addParent(targetChunk);
		targetChunk.addChunk(asyncChunk);
		return asyncChunk;
	}

	// If minChunks is a function use that
	// otherwhise check if a module is used at least minChunks or 2 or usedChunks.length time
	getModuleFilter(minChunks, targetChunk, usedChunksLength) {
		if(typeof minChunks === "function") {
			return minChunks;
		}
		const minCount = (minChunks || Math.max(2, usedChunksLength));
		const isUsedAtLeastMinTimes = (module, count) => count >= minCount;
		return isUsedAtLeastMinTimes;
	}

	getExtractableModules(minChunks, usedChunks, targetChunk) {
		if(minChunks === Infinity) {
			return [];
		}

		// count how many chunks contain a module
		const commonModulesToCountMap = usedChunks.reduce((map, chunk) => {
			for(const module of chunk.modulesIterable) {
				const count = map.has(module) ? map.get(module) : 0;
				map.set(module, count + 1);
			}
			return map;
		}, new Map());

		// filter by minChunks
		const moduleFilterCount = this.getModuleFilter(minChunks, targetChunk, usedChunks.length);
		// filter by condition
		const moduleFilterCondition = (module, chunk) => {
			if(!module.chunkCondition) {
				return true;
			}
			return module.chunkCondition(chunk);
		};

		return Array.from(commonModulesToCountMap).filter(entry => {
			const module = entry[0];
			const count = entry[1];
			// if the module passes both filters, keep it.
			return moduleFilterCount(module, count) && moduleFilterCondition(module, targetChunk);
		}).map(entry => entry[0]);
	}

	calculateModulesSize(modules) {
		return modules.reduce((totalSize, module) => totalSize + module.size(), 0);
	}

	extractModulesAndReturnAffectedChunks(reallyUsedModules, usedChunks) {
		return reallyUsedModules.reduce((affectedChunksSet, module) => {
			for(const chunk of usedChunks) {
				// removeChunk returns true if the chunk was contained and succesfully removed
				// false if the module did not have a connection to the chunk in question
				if(module.removeChunk(chunk)) {
					affectedChunksSet.add(chunk);
				}
			}
			return affectedChunksSet;
		}, new Set());
	}

	addExtractedModulesToTargetChunk(chunk, modules) {
		for(const module of modules) {
			chunk.addModule(module);
			module.addChunk(chunk);
		}
	}

	makeTargetChunkParentOfAffectedChunks(usedChunks, commonChunk) {
		for(const chunk of usedChunks) {
			// set commonChunk as new sole parent
			chunk.parents = [commonChunk];
			// add chunk to commonChunk
			commonChunk.addChunk(chunk);

			for(const entrypoint of chunk.entrypoints) {
				entrypoint.insertChunk(commonChunk, chunk);
			}
		}
	}

	moveExtractedChunkBlocksToTargetChunk(chunks, targetChunk) {
		for(const chunk of chunks) {
			if(chunk === targetChunk) continue;
			for(const block of chunk.blocks) {
				if(block.chunks.indexOf(targetChunk) === -1) {
					block.chunks.unshift(targetChunk);
				}
				targetChunk.addBlock(block);
			}
		}
	}

	extractOriginsOfChunksWithExtractedModules(chunks) {
		const origins = [];
		for(const chunk of chunks) {
			for(const origin of chunk.origins) {
				const newOrigin = Object.create(origin);
				newOrigin.reasons = (origin.reasons || []).concat("async commons");
				origins.push(newOrigin);
			}
		}
		return origins;
	}
}

module.exports = CommonsChunkPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872371, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

class ChunkModuleIdRangePlugin {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("module-ids", (modules) => {
				const chunk = this.chunks.find((chunk) => chunk.name === options.name);
				if(!chunk) throw new Error("ChunkModuleIdRangePlugin: Chunk with name '" + options.name + "' was not found");
				let currentId = options.start;
				let chunkModules;
				if(options.order) {
					chunkModules = chunk.modules.slice();
					switch(options.order) {
						case "index":
							chunkModules.sort((a, b) => {
								return a.index - b.index;
							});
							break;
						case "index2":
							chunkModules.sort((a, b) => {
								return a.index2 - b.index2;
							});
							break;
						default:
							throw new Error("ChunkModuleIdRangePlugin: unexpected value of order");
					}

				} else {
					chunkModules = modules.filter((m) => {
						return m.chunks.indexOf(chunk) >= 0;
					});
				}

				for(let i = 0; i < chunkModules.length; i++) {
					const m = chunkModules[i];
					if(m.id === null) {
						m.id = currentId++;
					}
					if(options.end && currentId > options.end)
						break;
				}
			});
		});
	}
}
module.exports = ChunkModuleIdRangePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872372, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class DedupePlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.warnings.push(new Error("DedupePlugin: This plugin was removed from webpack. Remove it from your configuration."));
		});
	}
}

module.exports = DedupePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872373, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class LimitChunkCountPlugin {
	constructor(options) {
		if(options !== undefined && typeof options !== "object" || Array.isArray(options)) {
			throw new Error("Argument should be an options object.\nFor more info on options, see https://webpack.js.org/plugins/");
		}
		this.options = options || {};
	}
	apply(compiler) {
		const options = this.options;
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-chunks-advanced", (chunks) => {
				const maxChunks = options.maxChunks;
				if(!maxChunks) return;
				if(maxChunks < 1) return;
				if(chunks.length <= maxChunks) return;

				if(chunks.length > maxChunks) {
					const sortedExtendedPairCombinations = chunks.reduce((combinations, a, idx) => {
						// create combination pairs
						for(let i = 0; i < idx; i++) {
							const b = chunks[i];
							combinations.push([b, a]);
						}
						return combinations;
					}, []).map((pair) => {
						// extend combination pairs with size and integrated size
						const a = pair[0].size(options);
						const b = pair[1].size(options);
						const ab = pair[0].integratedSize(pair[1], options);
						return [a + b - ab, ab, pair[0], pair[1], a, b];
					}).filter((extendedPair) => {
						// filter pairs that do not have an integratedSize
						// meaning they can NOT be integrated!
						return extendedPair[1] !== false;
					}).sort((a, b) => { // sadly javascript does an inplace sort here
						// sort them by size
						const diff = b[0] - a[0];
						if(diff !== 0) return diff;
						return a[1] - b[1];
					});

					const pair = sortedExtendedPairCombinations[0];

					if(pair && pair[2].integrate(pair[3], "limit")) {
						chunks.splice(chunks.indexOf(pair[3]), 1);
						return true;
					}
				}
			});
		});
	}
}
module.exports = LimitChunkCountPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872374, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


class MinChunkSizePlugin {
	constructor(options) {
		if(typeof options !== "object" || Array.isArray(options)) {
			throw new Error("Argument should be an options object.\nFor more info on options, see https://webpack.js.org/plugins/");
		}
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		const minChunkSize = options.minChunkSize;
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-chunks-advanced", (chunks) => {
				const equalOptions = {
					chunkOverhead: 1,
					entryChunkMultiplicator: 1
				};

				const sortedSizeFilteredExtendedPairCombinations = chunks.reduce((combinations, a, idx) => {
					// create combination pairs
					for(let i = 0; i < idx; i++) {
						const b = chunks[i];
						combinations.push([b, a]);
					}
					return combinations;
				}, []).filter((pair) => {
					// check if one of the chunks sizes is smaller than the minChunkSize
					const p0SmallerThanMinChunkSize = pair[0].size(equalOptions) < minChunkSize;
					const p1SmallerThanMinChunkSize = pair[1].size(equalOptions) < minChunkSize;
					return p0SmallerThanMinChunkSize || p1SmallerThanMinChunkSize;
				}).map((pair) => {
					// extend combination pairs with size and integrated size
					const a = pair[0].size(options);
					const b = pair[1].size(options);
					const ab = pair[0].integratedSize(pair[1], options);
					return [a + b - ab, ab, pair[0], pair[1]];
				}).filter((pair) => {
					// filter pairs that do not have an integratedSize
					// meaning they can NOT be integrated!
					return pair[1] !== false;
				}).sort((a, b) => { // sadly javascript does an inplace sort here
					// sort by size
					const diff = b[0] - a[0];
					if(diff !== 0) return diff;
					return a[1] - b[1];
				});

				if(sortedSizeFilteredExtendedPairCombinations.length === 0) return;

				const pair = sortedSizeFilteredExtendedPairCombinations[0];

				pair[2].integrate(pair[3], "min-size");
				chunks.splice(chunks.indexOf(pair[3]), 1);
				return true;
			});
		});
	}
}
module.exports = MinChunkSizePlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872375, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const HarmonyImportDependency = require("../dependencies/HarmonyImportDependency");
const ModuleHotAcceptDependency = require("../dependencies/ModuleHotAcceptDependency");
const ModuleHotDeclineDependency = require("../dependencies/ModuleHotDeclineDependency");
const ConcatenatedModule = require("./ConcatenatedModule");
const HarmonyExportImportedSpecifierDependency = require("../dependencies/HarmonyExportImportedSpecifierDependency");
const HarmonyCompatibilityDependency = require("../dependencies/HarmonyCompatibilityDependency");

function formatBailoutReason(msg) {
	return "ModuleConcatenation bailout: " + msg;
}

class ModuleConcatenationPlugin {
	constructor(options) {
		if(typeof options !== "object") options = {};
		this.options = options;
	}

	apply(compiler) {
		compiler.plugin("compilation", (compilation, params) => {
			params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {
				parser.plugin("call eval", () => {
					parser.state.module.meta.hasEval = true;
				});
			});
			const bailoutReasonMap = new Map();

			function setBailoutReason(module, reason) {
				bailoutReasonMap.set(module, reason);
				module.optimizationBailout.push(typeof reason === "function" ? (rs) => formatBailoutReason(reason(rs)) : formatBailoutReason(reason));
			}

			function getBailoutReason(module, requestShortener) {
				const reason = bailoutReasonMap.get(module);
				if(typeof reason === "function") return reason(requestShortener);
				return reason;
			}

			compilation.plugin("optimize-chunk-modules", (chunks, modules) => {
				const relevantModules = [];
				const possibleInners = new Set();
				for(const module of modules) {
					// Only harmony modules are valid for optimization
					if(!module.meta || !module.meta.harmonyModule || !module.dependencies.some(d => d instanceof HarmonyCompatibilityDependency)) {
						setBailoutReason(module, "Module is not an ECMAScript module");
						continue;
					}

					// Because of variable renaming we can't use modules with eval
					if(module.meta && module.meta.hasEval) {
						setBailoutReason(module, "Module uses eval()");
						continue;
					}

					// Exports must be known (and not dynamic)
					if(!Array.isArray(module.providedExports)) {
						setBailoutReason(module, "Module exports are unknown");
						continue;
					}

					// Using dependency variables is not possible as this wraps the code in a function
					if(module.variables.length > 0) {
						setBailoutReason(module, `Module uses injected variables (${module.variables.map(v => v.name).join(", ")})`);
						continue;
					}

					// Hot Module Replacement need it's own module to work correctly
					if(module.dependencies.some(dep => dep instanceof ModuleHotAcceptDependency || dep instanceof ModuleHotDeclineDependency)) {
						setBailoutReason(module, "Module uses Hot Module Replacement");
						continue;
					}

					relevantModules.push(module);

					// Module must not be the entry points
					if(module.getChunks().some(chunk => chunk.entryModule === module)) {
						setBailoutReason(module, "Module is an entry point");
						continue;
					}

					// Module must only be used by Harmony Imports
					const nonHarmonyReasons = module.reasons.filter(reason => !(reason.dependency instanceof HarmonyImportDependency));
					if(nonHarmonyReasons.length > 0) {
						const importingModules = new Set(nonHarmonyReasons.map(r => r.module));
						const importingModuleTypes = new Map(Array.from(importingModules).map(m => [m, new Set(nonHarmonyReasons.filter(r => r.module === m).map(r => r.dependency.type).sort())]));
						setBailoutReason(module, (requestShortener) => {
							const names = Array.from(importingModules).map(m => `${m.readableIdentifier(requestShortener)} (referenced with ${Array.from(importingModuleTypes.get(m)).join(", ")})`).sort();
							return `Module is referenced from these modules with unsupported syntax: ${names.join(", ")}`;
						});
						continue;
					}

					possibleInners.add(module);
				}
				// sort by depth
				// modules with lower depth are more likely suited as roots
				// this improves performance, because modules already selected as inner are skipped
				relevantModules.sort((a, b) => {
					return a.depth - b.depth;
				});
				const concatConfigurations = [];
				const usedAsInner = new Set();
				for(const currentRoot of relevantModules) {
					// when used by another configuration as inner:
					// the other configuration is better and we can skip this one
					if(usedAsInner.has(currentRoot))
						continue;

					// create a configuration with the root
					const currentConfiguration = new ConcatConfiguration(currentRoot);

					// cache failures to add modules
					const failureCache = new Map();

					// try to add all imports
					for(const imp of this.getImports(currentRoot)) {
						const problem = this.tryToAdd(currentConfiguration, imp, possibleInners, failureCache);
						if(problem) {
							failureCache.set(imp, problem);
							currentConfiguration.addWarning(imp, problem);
						}
					}
					if(!currentConfiguration.isEmpty()) {
						concatConfigurations.push(currentConfiguration);
						for(const module of currentConfiguration.modules) {
							if(module !== currentConfiguration.rootModule)
								usedAsInner.add(module);
						}
					}
				}
				// HACK: Sort configurations by length and start with the longest one
				// to get the biggers groups possible. Used modules are marked with usedModules
				// TODO: Allow to reuse existing configuration while trying to add dependencies.
				// This would improve performance. O(n^2) -> O(n)
				concatConfigurations.sort((a, b) => {
					return b.modules.size - a.modules.size;
				});
				const usedModules = new Set();
				for(const concatConfiguration of concatConfigurations) {
					if(usedModules.has(concatConfiguration.rootModule))
						continue;
					const newModule = new ConcatenatedModule(concatConfiguration.rootModule, Array.from(concatConfiguration.modules));
					concatConfiguration.sortWarnings();
					for(const warning of concatConfiguration.warnings) {
						newModule.optimizationBailout.push((requestShortener) => {
							const reason = getBailoutReason(warning[0], requestShortener);
							const reasonWithPrefix = reason ? ` (<- ${reason})` : "";
							if(warning[0] === warning[1])
								return formatBailoutReason(`Cannot concat with ${warning[0].readableIdentifier(requestShortener)}${reasonWithPrefix}`);
							else
								return formatBailoutReason(`Cannot concat with ${warning[0].readableIdentifier(requestShortener)} because of ${warning[1].readableIdentifier(requestShortener)}${reasonWithPrefix}`);
						});
					}
					const chunks = concatConfiguration.rootModule.getChunks();
					for(const m of concatConfiguration.modules) {
						usedModules.add(m);
						chunks.forEach(chunk => chunk.removeModule(m));
					}
					chunks.forEach(chunk => {
						chunk.addModule(newModule);
						newModule.addChunk(chunk);
						if(chunk.entryModule === concatConfiguration.rootModule)
							chunk.entryModule = newModule;
					});
					compilation.modules.push(newModule);
					newModule.reasons.forEach(reason => reason.dependency.module = newModule);
					newModule.dependencies.forEach(dep => {
						if(dep.module) {
							dep.module.reasons.forEach(reason => {
								if(reason.dependency === dep)
									reason.module = newModule;
							});
						}
					});
				}
				compilation.modules = compilation.modules.filter(m => !usedModules.has(m));
			});
		});
	}

	getImports(module) {
		return Array.from(new Set(module.dependencies

			// Only harmony Dependencies
			.filter(dep => dep instanceof HarmonyImportDependency && dep.module)

			// Dependencies are simple enough to concat them
			.filter(dep => {
				return !module.dependencies.some(d =>
					d instanceof HarmonyExportImportedSpecifierDependency &&
					d.importDependency === dep &&
					!d.id &&
					!Array.isArray(dep.module.providedExports)
				);
			})

			// Take the imported module
			.map(dep => dep.module)
		));
	}

	tryToAdd(config, module, possibleModules, failureCache) {
		const cacheEntry = failureCache.get(module);
		if(cacheEntry) {
			return cacheEntry;
		}

		// Already added?
		if(config.has(module)) {
			return null;
		}

		// Not possible to add?
		if(!possibleModules.has(module)) {
			failureCache.set(module, module); // cache failures for performance
			return module;
		}

		// module must be in the same chunks
		if(!config.rootModule.hasEqualsChunks(module)) {
			failureCache.set(module, module); // cache failures for performance
			return module;
		}

		// Clone config to make experimental changes
		const testConfig = config.clone();

		// Add the module
		testConfig.add(module);

		// Every module which depends on the added module must be in the configuration too.
		for(const reason of module.reasons) {
			const problem = this.tryToAdd(testConfig, reason.module, possibleModules, failureCache);
			if(problem) {
				failureCache.set(module, problem); // cache failures for performance
				return problem;
			}
		}

		// Eagerly try to add imports too if possible
		for(const imp of this.getImports(module)) {
			const problem = this.tryToAdd(testConfig, imp, possibleModules, failureCache);
			if(problem) {
				config.addWarning(module, problem);
			}
		}

		// Commit experimental changes
		config.set(testConfig);
		return null;
	}
}

class ConcatConfiguration {
	constructor(rootModule) {
		this.rootModule = rootModule;
		this.modules = new Set([rootModule]);
		this.warnings = new Map();
	}

	add(module) {
		this.modules.add(module);
	}

	has(module) {
		return this.modules.has(module);
	}

	isEmpty() {
		return this.modules.size === 1;
	}

	addWarning(module, problem) {
		this.warnings.set(module, problem);
	}

	sortWarnings() {
		this.warnings = new Map(Array.from(this.warnings).sort((a, b) => {
			const ai = a[0].identifier();
			const bi = b[0].identifier();
			if(ai < bi) return -1;
			if(ai > bi) return 1;
			return 0;
		}));
	}

	clone() {
		const clone = new ConcatConfiguration(this.rootModule);
		for(const module of this.modules)
			clone.add(module);
		for(const pair of this.warnings)
			clone.addWarning(pair[0], pair[1]);
		return clone;
	}

	set(config) {
		this.rootModule = config.rootModule;
		this.modules = new Set(config.modules);
		this.warnings = new Map(config.warnings);
	}
}

module.exports = ModuleConcatenationPlugin;

}, function(modId) { var map = {"../dependencies/HarmonyImportDependency":1602510872236,"../dependencies/ModuleHotAcceptDependency":1602510872342,"../dependencies/ModuleHotDeclineDependency":1602510872343,"./ConcatenatedModule":1602510872376,"../dependencies/HarmonyExportImportedSpecifierDependency":1602510872242,"../dependencies/HarmonyCompatibilityDependency":1602510872238}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872376, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const Module = require("../Module");
const Template = require("../Template");
const Parser = require("../Parser");
const crypto = require("crypto");
const acorn = require("acorn");
const escope = require("escope");
const ReplaceSource = require("webpack-sources/lib/ReplaceSource");
const ConcatSource = require("webpack-sources/lib/ConcatSource");
const HarmonyImportDependency = require("../dependencies/HarmonyImportDependency");
const HarmonyImportSpecifierDependency = require("../dependencies/HarmonyImportSpecifierDependency");
const HarmonyExportSpecifierDependency = require("../dependencies/HarmonyExportSpecifierDependency");
const HarmonyExportExpressionDependency = require("../dependencies/HarmonyExportExpressionDependency");
const HarmonyExportImportedSpecifierDependency = require("../dependencies/HarmonyExportImportedSpecifierDependency");
const HarmonyCompatibilityDependency = require("../dependencies/HarmonyCompatibilityDependency");

function ensureNsObjSource(info, moduleToInfoMap, requestShortener) {
	if(!info.hasNamespaceObject) {
		info.hasNamespaceObject = true;
		const name = info.exportMap.get(true);
		const nsObj = [`var ${name} = {};`];
		for(const exportName of info.module.providedExports) {
			const finalName = getFinalName(info, exportName, moduleToInfoMap, requestShortener, false);
			nsObj.push(`__webpack_require__.d(${name}, ${JSON.stringify(exportName)}, function() { return ${finalName}; });`);
		}
		info.namespaceObjectSource = nsObj.join("\n") + "\n";
	}
}

function getExternalImport(importedModule, info, exportName, asCall) {
	if(exportName === true) return info.name;
	const used = importedModule.isUsed(exportName);
	if(!used) return "/* unused reexport */undefined";
	if(info.interop && exportName === "default") {
		return asCall ? `${info.interopName}()` : `${info.interopName}.a`;
	}
	// TODO use Template.toNormalComment when merging with pure-module
	const comment = used !== exportName ? ` /* ${exportName} */` : "";
	const reference = `${info.name}[${JSON.stringify(used)}${comment}]`;
	if(asCall)
		return `Object(${reference})`;
	return reference;
}

function getFinalName(info, exportName, moduleToInfoMap, requestShortener, asCall) {
	switch(info.type) {
		case "concatenated":
			{
				const directExport = info.exportMap.get(exportName);
				if(directExport) {
					if(exportName === true)
						ensureNsObjSource(info, moduleToInfoMap, requestShortener);
					const name = info.internalNames.get(directExport);
					if(!name)
						throw new Error(`The export "${directExport}" in "${info.module.readableIdentifier(requestShortener)}" has no internal name`);
					return name;
				}
				const reexport = info.reexportMap.get(exportName);
				if(reexport) {
					const refInfo = moduleToInfoMap.get(reexport.module);
					if(refInfo) {
						// module is in the concatenation
						return getFinalName(refInfo, reexport.exportName, moduleToInfoMap, requestShortener, asCall);
					}
				}
				const problem = `Cannot get final name for export "${exportName}" in "${info.module.readableIdentifier(requestShortener)}"` +
					` (known exports: ${Array.from(info.exportMap.keys()).filter(name => name !== true).join(" ")}, ` +
					`known reexports: ${Array.from(info.reexportMap.keys()).join(" ")})`;
				// TODO use Template.toNormalComment when merging with pure-module
				return `/* ${problem} */ undefined`;
			}
		case "external":
			{
				const importedModule = info.module;
				return getExternalImport(importedModule, info, exportName, asCall);
			}
	}
}

function getSymbolsFromScope(s, untilScope) {
	const allUsedNames = new Set();
	let scope = s;
	while(scope) {
		if(untilScope === scope) break;
		scope.variables.forEach(variable => allUsedNames.add(variable.name));
		scope = scope.upper;
	}
	return allUsedNames;
}

function getAllReferences(variable) {
	let set = variable.references;
	// Look for inner scope variables too (like in class Foo { t() { Foo } })
	const identifiers = new Set(variable.identifiers);
	for(const scope of variable.scope.childScopes) {
		for(const innerVar of scope.variables) {
			if(innerVar.identifiers.some(id => identifiers.has(id))) {
				set = set.concat(innerVar.references);
				break;
			}
		}
	}
	return set;
}

function reduceSet(a, b) {
	for(const item of b)
		a.add(item);
	return a;
}

function getPathInAst(ast, node) {
	if(ast === node) {
		return [];
	}
	const nr = node.range;
	var i;
	if(Array.isArray(ast)) {
		for(i = 0; i < ast.length; i++) {
			const enterResult = enterNode(ast[i]);
			if(typeof enterResult !== "undefined")
				return enterResult;
		}
	} else if(ast && typeof ast === "object") {
		const keys = Object.keys(ast);
		for(i = 0; i < keys.length; i++) {
			const value = ast[keys[i]];
			if(Array.isArray(value)) {
				const pathResult = getPathInAst(value, node);
				if(typeof pathResult !== "undefined")
					return pathResult;
			} else if(value && typeof value === "object") {
				const enterResult = enterNode(value);
				if(typeof enterResult !== "undefined")
					return enterResult;
			}
		}
	}

	function enterNode(n) {
		if(!n) return undefined;
		const r = n.range;
		if(r) {
			if(r[0] <= nr[0] && r[1] >= nr[1]) {
				const path = getPathInAst(n, node);
				if(path) {
					path.push(n);
					return path;
				}
			}
		}
		return undefined;
	}
}

class ConcatenatedModule extends Module {
	constructor(rootModule, modules) {
		super();
		super.setChunks(rootModule._chunks);
		this.rootModule = rootModule;
		this.usedExports = rootModule.usedExports;
		this.providedExports = rootModule.providedExports;
		this.optimizationBailout = rootModule.optimizationBailout;
		this.used = rootModule.used;
		this.index = rootModule.index;
		this.index2 = rootModule.index2;
		this.depth = rootModule.depth;
		this.built = modules.some(m => m.built);
		this.cacheable = modules.every(m => m.cacheable);
		const modulesSet = new Set(modules);
		this.reasons = rootModule.reasons.filter(reason => !(reason.dependency instanceof HarmonyImportDependency) || !modulesSet.has(reason.module));
		this.meta = rootModule.meta;
		this.moduleArgument = rootModule.moduleArgument;
		this.exportsArgument = rootModule.exportsArgument;
		this.strict = true;
		this._numberOfConcatenatedModules = modules.length;

		this.dependencies = [];
		this.dependenciesWarnings = [];
		this.dependenciesErrors = [];
		this.fileDependencies = [];
		this.contextDependencies = [];
		this.warnings = [];
		this.errors = [];
		this.assets = {};
		this._orderedConcatenationList = this._createOrderedConcatenationList(rootModule, modulesSet);
		for(const info of this._orderedConcatenationList) {
			if(info.type === "concatenated") {
				const m = info.module;

				// populate dependencies
				m.dependencies.filter(dep => !(dep instanceof HarmonyImportDependency) || !modulesSet.has(dep.module))
					.forEach(d => this.dependencies.push(d));
				// populate dep warning
				m.dependenciesWarnings.forEach(depWarning => this.dependenciesWarnings.push(depWarning));
				// populate dep errors
				m.dependenciesErrors.forEach(depError => this.dependenciesErrors.push(depError));
				// populate file dependencies
				if(m.fileDependencies) m.fileDependencies.forEach(file => this.fileDependencies.push(file));
				// populate context dependencies
				if(m.contextDependencies) m.contextDependencies.forEach(context => this.contextDependencies.push(context));
				// populate warnings
				m.warnings.forEach(warning => this.warnings.push(warning));
				// populate errors
				m.errors.forEach(error => this.errors.push(error));

				Object.assign(this.assets, m.assets);
			}
		}
		this._identifier = this._createIdentifier();
	}

	get modules() {
		return this._orderedConcatenationList
			.filter(info => info.type === "concatenated")
			.map(info => info.module);
	}

	identifier() {
		return this._identifier;
	}

	readableIdentifier(requestShortener) {
		return this.rootModule.readableIdentifier(requestShortener) + ` + ${this._numberOfConcatenatedModules - 1} modules`;
	}

	libIdent(options) {
		return this.rootModule.libIdent(options);
	}

	nameForCondition() {
		return this.rootModule.nameForCondition();
	}

	build(options, compilation, resolver, fs, callback) {
		throw new Error("Cannot build this module. It should be already built.");
	}

	size() {
		// Guess size from embedded modules
		return this._orderedConcatenationList.reduce((sum, info) => {
			switch(info.type) {
				case "concatenated":
					return sum + info.module.size();
				case "external":
					return sum + 5;
			}
			return sum;
		}, 0);
	}

	_createOrderedConcatenationList(rootModule, modulesSet) {
		const list = [];
		const set = new Set();

		function getConcatenatedImports(module) {
			// TODO need changes when merging with the pure-module branch
			const allDeps = module.dependencies
				.filter(dep => dep instanceof HarmonyImportDependency && dep.module);

			return allDeps.map(dep => () => dep.module);
		}

		function enterModule(getModule) {
			const module = getModule();
			if(set.has(module)) return;
			set.add(module);
			if(modulesSet.has(module)) {
				const imports = getConcatenatedImports(module);
				imports.forEach(enterModule);
				list.push({
					type: "concatenated",
					module
				});
			} else {
				list.push({
					type: "external",
					get module() {
						// We need to use a getter here, because the module in the dependency
						// could be replaced by some other process (i. e. also replaced with a
						// concatenated module)
						return getModule();
					}
				});
			}
		}

		enterModule(() => rootModule);

		return list;
	}

	_createIdentifier() {
		let orderedConcatenationListIdentifiers = "";
		for(let i = 0; i < this._orderedConcatenationList.length; i++) {
			if(this._orderedConcatenationList[i].type === "concatenated") {
				orderedConcatenationListIdentifiers += this._orderedConcatenationList[i].module.identifier();
				orderedConcatenationListIdentifiers += " ";
			}
		}
		const hash = crypto.createHash("md5");
		hash.update(orderedConcatenationListIdentifiers);
		return this.rootModule.identifier() + " " + hash.digest("hex");
	}

	source(dependencyTemplates, outputOptions, requestShortener) {
		// Metainfo for each module
		const modulesWithInfo = this._orderedConcatenationList.map((info, idx) => {
			switch(info.type) {
				case "concatenated":
					{
						const exportMap = new Map();
						const reexportMap = new Map();
						info.module.dependencies.forEach(dep => {
							if(dep instanceof HarmonyExportSpecifierDependency) {
								if(!exportMap.has(dep.name))
									exportMap.set(dep.name, dep.id);
							} else if(dep instanceof HarmonyExportExpressionDependency) {
								if(!exportMap.has("default"))
									exportMap.set("default", "__WEBPACK_MODULE_DEFAULT_EXPORT__");
							} else if(dep instanceof HarmonyExportImportedSpecifierDependency) {
								const exportName = dep.name;
								const importName = dep.id;
								const importedModule = dep.importDependency.module;
								if(exportName && importName) {
									if(!reexportMap.has(exportName)) {
										reexportMap.set(exportName, {
											module: importedModule,
											exportName: importName,
											dependency: dep
										});
									}
								} else if(exportName) {
									if(!reexportMap.has(exportName)) {
										reexportMap.set(exportName, {
											module: importedModule,
											exportName: true,
											dependency: dep
										});
									}
								} else if(importedModule) {
									importedModule.providedExports.forEach(name => {
										if(dep.activeExports.has(name) || name === "default")
											return;
										if(!reexportMap.has(name)) {
											reexportMap.set(name, {
												module: importedModule,
												exportName: name,
												dependency: dep
											});
										}
									});
								}
							}
						});
						return {
							type: "concatenated",
							module: info.module,
							index: idx,
							ast: undefined,
							source: undefined,
							globalScope: undefined,
							moduleScope: undefined,
							internalNames: new Map(),
							exportMap: exportMap,
							reexportMap: reexportMap,
							hasNamespaceObject: false,
							namespaceObjectSource: null
						};
					}
				case "external":
					return {
						type: "external",
						module: info.module,
						index: idx,
						name: undefined,
						interopName: undefined,
						interop: undefined
					};
				default:
					throw new Error(`Unsupported concatenation entry type ${info.type}`);
			}
		});

		// Create mapping from module to info
		const moduleToInfoMap = new Map();
		modulesWithInfo.forEach(m => moduleToInfoMap.set(m.module, m));

		// Configure template decorators for dependencies
		const innerDependencyTemplates = new Map(dependencyTemplates);

		innerDependencyTemplates.set(HarmonyImportSpecifierDependency, new HarmonyImportSpecifierDependencyConcatenatedTemplate(
			dependencyTemplates.get(HarmonyImportSpecifierDependency),
			moduleToInfoMap
		));
		innerDependencyTemplates.set(HarmonyImportDependency, new HarmonyImportDependencyConcatenatedTemplate(
			dependencyTemplates.get(HarmonyImportDependency),
			moduleToInfoMap
		));
		innerDependencyTemplates.set(HarmonyExportSpecifierDependency, new HarmonyExportSpecifierDependencyConcatenatedTemplate(
			dependencyTemplates.get(HarmonyExportSpecifierDependency),
			this.rootModule
		));
		innerDependencyTemplates.set(HarmonyExportExpressionDependency, new HarmonyExportExpressionDependencyConcatenatedTemplate(
			dependencyTemplates.get(HarmonyExportExpressionDependency),
			this.rootModule,
			moduleToInfoMap
		));
		innerDependencyTemplates.set(HarmonyExportImportedSpecifierDependency, new HarmonyExportImportedSpecifierDependencyConcatenatedTemplate(
			dependencyTemplates.get(HarmonyExportImportedSpecifierDependency),
			this.rootModule,
			moduleToInfoMap
		));
		innerDependencyTemplates.set(HarmonyCompatibilityDependency, new HarmonyCompatibilityDependencyConcatenatedTemplate(
			dependencyTemplates.get(HarmonyCompatibilityDependency),
			this.rootModule,
			moduleToInfoMap
		));
		innerDependencyTemplates.set("hash", innerDependencyTemplates.get("hash") + this.rootModule.identifier());

		// Generate source code and analyse scopes
		// Prepare a ReplaceSource for the final source
		modulesWithInfo.forEach(info => {
			if(info.type === "concatenated") {
				const m = info.module;
				const source = m.source(innerDependencyTemplates, outputOptions, requestShortener);
				const code = source.source();
				let ast;
				try {
					ast = acorn.parse(code, {
						ranges: true,
						locations: true,
						ecmaVersion: Parser.ECMA_VERSION,
						sourceType: "module"
					});
				} catch(err) {
					if(err.loc && typeof err.loc === "object" && typeof err.loc.line === "number") {
						const lineNumber = err.loc.line;
						const lines = code.split("\n");
						err.message += "\n| " + lines.slice(Math.max(0, lineNumber - 3), lineNumber + 2).join("\n| ");
					}
					throw err;
				}
				const scopeManager = escope.analyze(ast, {
					ecmaVersion: 6,
					sourceType: "module",
					optimistic: true,
					ignoreEval: true,
					impliedStrict: true
				});
				const globalScope = scopeManager.acquire(ast);
				const moduleScope = globalScope.childScopes[0];
				const resultSource = new ReplaceSource(source);
				info.ast = ast;
				info.source = resultSource;
				info.globalScope = globalScope;
				info.moduleScope = moduleScope;
			}
		});

		// List of all used names to avoid conflicts
		const allUsedNames = new Set([
			"__WEBPACK_MODULE_DEFAULT_EXPORT__", // avoid using this internal name

			"abstract", "arguments", "async", "await", "boolean", "break", "byte", "case", "catch", "char", "class",
			"const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval",
			"export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if",
			"implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new",
			"null", "package", "private", "protected", "public", "return", "short", "static", "super",
			"switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof",
			"var", "void", "volatile", "while", "with", "yield",

			"module", "__dirname", "__filename", "exports",

			"Array", "Date", "eval", "function", "hasOwnProperty", "Infinity", "isFinite", "isNaN",
			"isPrototypeOf", "length", "Math", "NaN", "name", "Number", "Object", "prototype", "String",
			"toString", "undefined", "valueOf",

			"alert", "all", "anchor", "anchors", "area", "assign", "blur", "button", "checkbox",
			"clearInterval", "clearTimeout", "clientInformation", "close", "closed", "confirm", "constructor",
			"crypto", "decodeURI", "decodeURIComponent", "defaultStatus", "document", "element", "elements",
			"embed", "embeds", "encodeURI", "encodeURIComponent", "escape", "event", "fileUpload", "focus",
			"form", "forms", "frame", "innerHeight", "innerWidth", "layer", "layers", "link", "location",
			"mimeTypes", "navigate", "navigator", "frames", "frameRate", "hidden", "history", "image",
			"images", "offscreenBuffering", "open", "opener", "option", "outerHeight", "outerWidth",
			"packages", "pageXOffset", "pageYOffset", "parent", "parseFloat", "parseInt", "password", "pkcs11",
			"plugin", "prompt", "propertyIsEnum", "radio", "reset", "screenX", "screenY", "scroll", "secure",
			"select", "self", "setInterval", "setTimeout", "status", "submit", "taint", "text", "textarea",
			"top", "unescape", "untaint", "window",

			"onblur", "onclick", "onerror", "onfocus", "onkeydown", "onkeypress", "onkeyup", "onmouseover",
			"onload", "onmouseup", "onmousedown", "onsubmit"
		]);

		// get all global names
		modulesWithInfo.forEach(info => {
			if(info.globalScope) {
				info.globalScope.through.forEach(reference => {
					const name = reference.identifier.name;
					if(/^__WEBPACK_MODULE_REFERENCE__\d+_([\da-f]+|ns)(_call)?__$/.test(name)) {
						for(const s of getSymbolsFromScope(reference.from, info.moduleScope)) {
							allUsedNames.add(s);
						}
					} else {
						allUsedNames.add(name);
					}
				});
			}
		});

		// generate names for symbols
		modulesWithInfo.forEach(info => {
			switch(info.type) {
				case "concatenated":
					{
						const namespaceObjectName = this.findNewName("namespaceObject", allUsedNames, null, info.module.readableIdentifier(requestShortener));
						allUsedNames.add(namespaceObjectName);
						info.internalNames.set(namespaceObjectName, namespaceObjectName);
						info.exportMap.set(true, namespaceObjectName);
						info.moduleScope.variables.forEach(variable => {
							const name = variable.name;
							if(allUsedNames.has(name)) {
								const references = getAllReferences(variable);
								const symbolsInReferences = references.map(ref => getSymbolsFromScope(ref.from, info.moduleScope)).reduce(reduceSet, new Set());
								const newName = this.findNewName(name, allUsedNames, symbolsInReferences, info.module.readableIdentifier(requestShortener));
								allUsedNames.add(newName);
								info.internalNames.set(name, newName);
								const source = info.source;
								const allIdentifiers = new Set(references.map(r => r.identifier).concat(variable.identifiers));
								for(const identifier of allIdentifiers) {
									const r = identifier.range;
									const path = getPathInAst(info.ast, identifier);
									if(path && path.length > 1 && path[1].type === "Property" && path[1].shorthand) {
										source.insert(r[1], `: ${newName}`);
									} else {
										source.replace(r[0], r[1] - 1, newName);
									}
								}
							} else {
								allUsedNames.add(name);
								info.internalNames.set(name, name);
							}
						});
						break;
					}
				case "external":
					{
						info.interop = info.module.meta && !info.module.meta.harmonyModule;
						const externalName = this.findNewName("", allUsedNames, null, info.module.readableIdentifier(requestShortener));
						allUsedNames.add(externalName);
						info.name = externalName;
						if(info.interop) {
							const externalNameInterop = this.findNewName("default", allUsedNames, null, info.module.readableIdentifier(requestShortener));
							allUsedNames.add(externalNameInterop);
							info.interopName = externalNameInterop;
						}
						break;
					}
			}
		});

		// Find and replace referenced to modules
		modulesWithInfo.forEach(info => {
			if(info.type === "concatenated") {
				info.globalScope.through.forEach(reference => {
					const name = reference.identifier.name;
					const match = /^__WEBPACK_MODULE_REFERENCE__(\d+)_([\da-f]+|ns)(_call)?__$/.exec(name);
					if(match) {
						const referencedModule = modulesWithInfo[+match[1]];
						let exportName;
						if(match[2] === "ns") {
							exportName = true;
						} else {
							const exportData = match[2];
							exportName = new Buffer(exportData, "hex").toString("utf-8"); // eslint-disable-line node/no-deprecated-api
						}
						const asCall = !!match[3];
						const finalName = getFinalName(referencedModule, exportName, moduleToInfoMap, requestShortener, asCall);
						const r = reference.identifier.range;
						const source = info.source;
						source.replace(r[0], r[1] - 1, finalName);
					}
				});
			}
		});

		const result = new ConcatSource();

		// add harmony compatibility flag (must be first because of possible circular dependencies)
		const usedExports = this.rootModule.usedExports;
		if(usedExports === true) {
			result.add(`Object.defineProperty(${this.exportsArgument || "exports"}, "__esModule", { value: true });\n`);
		}

		// define required namespace objects (must be before evaluation modules)
		modulesWithInfo.forEach(info => {
			if(info.namespaceObjectSource) {
				result.add(info.namespaceObjectSource);
			}
		});

		// evaluate modules in order
		modulesWithInfo.forEach(info => {
			switch(info.type) {
				case "concatenated":
					result.add(`\n// CONCATENATED MODULE: ${info.module.readableIdentifier(requestShortener)}\n`);
					result.add(info.source);
					break;
				case "external":
					result.add(`\n// EXTERNAL MODULE: ${info.module.readableIdentifier(requestShortener)}\n`);
					result.add(`var ${info.name} = __webpack_require__(${JSON.stringify(info.module.id)});\n`);
					if(info.interop) {
						result.add(`var ${info.interopName} = /*#__PURE__*/__webpack_require__.n(${info.name});\n`);
					}
					break;
				default:
					throw new Error(`Unsupported concatenation entry type ${info.type}`);
			}
		});

		return result;
	}

	findNewName(oldName, usedNamed1, usedNamed2, extraInfo) {
		let name = oldName;

		if(name === "__WEBPACK_MODULE_DEFAULT_EXPORT__")
			name = "";

		// Remove uncool stuff
		extraInfo = extraInfo.replace(/\.+\/|(\/index)?\.([a-zA-Z0-9]{1,4})($|\s|\?)|\s*\+\s*\d+\s*modules/g, "");

		const splittedInfo = extraInfo.split("/");
		while(splittedInfo.length) {
			name = splittedInfo.pop() + (name ? "_" + name : "");
			const nameIdent = Template.toIdentifier(name);
			if(!usedNamed1.has(nameIdent) && (!usedNamed2 || !usedNamed2.has(nameIdent))) return nameIdent;
		}

		let i = 0;
		let nameWithNumber = Template.toIdentifier(`${name}_${i}`);
		while(usedNamed1.has(nameWithNumber) || (usedNamed2 && usedNamed2.has(nameWithNumber))) {
			i++;
			nameWithNumber = Template.toIdentifier(`${name}_${i}`);
		}
		return nameWithNumber;
	}

	updateHash(hash) {
		for(const info of this._orderedConcatenationList) {
			switch(info.type) {
				case "concatenated":
					info.module.updateHash(hash);
					break;
				case "external":
					hash.update(`${info.module.id}`);
					break;
			}
		}
		super.updateHash(hash);
	}

}

class HarmonyImportSpecifierDependencyConcatenatedTemplate {
	constructor(originalTemplate, modulesMap) {
		this.originalTemplate = originalTemplate;
		this.modulesMap = modulesMap;
	}

	apply(dep, source, outputOptions, requestShortener, dependencyTemplates) {
		const module = dep.importDependency.module;
		const info = this.modulesMap.get(module);
		if(!info) {
			this.originalTemplate.apply(dep, source, outputOptions, requestShortener, dependencyTemplates);
			return;
		}
		let content;
		if(dep.id === null) {
			content = `__WEBPACK_MODULE_REFERENCE__${info.index}_ns__`;
		} else if(dep.namespaceObjectAsContext) {
			content = `__WEBPACK_MODULE_REFERENCE__${info.index}_ns__[${JSON.stringify(dep.id)}]`;
		} else {
			const exportData = new Buffer(dep.id, "utf-8").toString("hex"); // eslint-disable-line node/no-deprecated-api
			content = `__WEBPACK_MODULE_REFERENCE__${info.index}_${exportData}${dep.call ? "_call" : ""}__`;
		}
		if(dep.shorthand) {
			content = dep.name + ": " + content;
		}
		source.replace(dep.range[0], dep.range[1] - 1, content);
	}
}

class HarmonyImportDependencyConcatenatedTemplate {
	constructor(originalTemplate, modulesMap) {
		this.originalTemplate = originalTemplate;
		this.modulesMap = modulesMap;
	}

	apply(dep, source, outputOptions, requestShortener, dependencyTemplates) {
		const module = dep.module;
		const info = this.modulesMap.get(module);
		if(!info) {
			this.originalTemplate.apply(dep, source, outputOptions, requestShortener, dependencyTemplates);
			return;
		}
		source.replace(dep.range[0], dep.range[1] - 1, "");
	}
}

class HarmonyExportSpecifierDependencyConcatenatedTemplate {
	constructor(originalTemplate, rootModule) {
		this.originalTemplate = originalTemplate;
		this.rootModule = rootModule;
	}

	apply(dep, source, outputOptions, requestShortener, dependencyTemplates) {
		if(dep.originModule === this.rootModule) {
			this.originalTemplate.apply(dep, source, outputOptions, requestShortener, dependencyTemplates);
		}
	}
}

class HarmonyExportExpressionDependencyConcatenatedTemplate {
	constructor(originalTemplate, rootModule) {
		this.originalTemplate = originalTemplate;
		this.rootModule = rootModule;
	}

	apply(dep, source, outputOptions, requestShortener, dependencyTemplates) {
		let content = "/* harmony default export */ var __WEBPACK_MODULE_DEFAULT_EXPORT__ = ";
		if(dep.originModule === this.rootModule) {
			const used = dep.originModule.isUsed("default");
			const exportsName = dep.originModule.exportsArgument || "exports";
			if(used) content += `${exportsName}[${JSON.stringify(used)}] = `;
		}

		if(dep.range) {
			source.replace(dep.rangeStatement[0], dep.range[0] - 1, content + "(");
			source.replace(dep.range[1], dep.rangeStatement[1] - 1, ");");
			return;
		}

		source.replace(dep.rangeStatement[0], dep.rangeStatement[1] - 1, content);
	}
}

class HarmonyExportImportedSpecifierDependencyConcatenatedTemplate {
	constructor(originalTemplate, rootModule, modulesMap) {
		this.originalTemplate = originalTemplate;
		this.rootModule = rootModule;
		this.modulesMap = modulesMap;
	}

	getExports(dep) {
		const importModule = dep.importDependency.module;
		if(dep.id) {
			// export { named } from "module"
			return [{
				name: dep.name,
				id: dep.id,
				module: importModule
			}];
		}
		if(dep.name) {
			// export * as abc from "module"
			return [{
				name: dep.name,
				id: true,
				module: importModule
			}];
		}
		// export * from "module"
		return importModule.providedExports.filter(exp => exp !== "default" && !dep.activeExports.has(exp)).map(exp => {
			return {
				name: exp,
				id: exp,
				module: importModule
			};
		});
	}

	apply(dep, source, outputOptions, requestShortener, dependencyTemplates) {
		if(dep.originModule === this.rootModule) {
			if(this.modulesMap.get(dep.importDependency.module)) {
				const exportDefs = this.getExports(dep);
				exportDefs.forEach(def => {
					const info = this.modulesMap.get(def.module);
					const used = dep.originModule.isUsed(def.name);
					if(!used) {
						source.insert(-1, `/* unused concated harmony import ${dep.name} */\n`);
					}
					let finalName;
					if(def.id === true) {
						finalName = `__WEBPACK_MODULE_REFERENCE__${info.index}_ns__`;
					} else {
						const exportData = new Buffer(def.id, "utf-8").toString("hex"); // eslint-disable-line node/no-deprecated-api
						finalName = `__WEBPACK_MODULE_REFERENCE__${info.index}_${exportData}__`;
					}
					const exportsName = this.rootModule.exportsArgument || "exports";
					const content = `/* concated harmony reexport */__webpack_require__.d(${exportsName}, ${JSON.stringify(used)}, function() { return ${finalName}; });\n`;
					source.insert(-1, content);
				});
			} else {
				this.originalTemplate.apply(dep, source, outputOptions, requestShortener, dependencyTemplates);
			}
		}
	}
}

class HarmonyCompatibilityDependencyConcatenatedTemplate {
	constructor(originalTemplate, rootModule, modulesMap) {
		this.originalTemplate = originalTemplate;
		this.rootModule = rootModule;
		this.modulesMap = modulesMap;
	}

	apply(dep, source, outputOptions, requestShortener, dependencyTemplates) {
		// do nothing
	}
}

module.exports = ConcatenatedModule;

}, function(modId) { var map = {"../Module":1602510872132,"../Template":1602510872137,"../Parser":1602510872164,"../dependencies/HarmonyImportDependency":1602510872236,"../dependencies/HarmonyImportSpecifierDependency":1602510872237,"../dependencies/HarmonyExportSpecifierDependency":1602510872241,"../dependencies/HarmonyExportExpressionDependency":1602510872240,"../dependencies/HarmonyExportImportedSpecifierDependency":1602510872242,"../dependencies/HarmonyCompatibilityDependency":1602510872238}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872377, function(require, module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/


const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = UglifyJsPlugin;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510872123);
})()
//# sourceMappingURL=index.js.map