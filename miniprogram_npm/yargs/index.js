module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510872396, function(require, module, exports) {
// classic singleton yargs API, to use yargs
// without running as a singleton do:
// require('yargs/yargs')(process.argv.slice(2))
const yargs = require('./yargs')

Argv(process.argv.slice(2))

module.exports = Argv

function Argv (processArgs, cwd) {
  const argv = yargs(processArgs, cwd, require)
  singletonify(argv)
  return argv
}

/*  Hack an instance of Argv with process.argv into Argv
    so people can do
    require('yargs')(['--beeble=1','-z','zizzle']).argv
    to parse a list of args and
    require('yargs').argv
    to get a parsed version of process.argv.
*/
function singletonify (inst) {
  Object.keys(inst).forEach(function (key) {
    if (key === 'argv') {
      Argv.__defineGetter__(key, inst.__lookupGetter__(key))
    } else {
      Argv[key] = typeof inst[key] === 'function' ? inst[key].bind(inst) : inst[key]
    }
  })
}

}, function(modId) {var map = {"./yargs":1602510872397}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872397, function(require, module, exports) {
const argsert = require('./lib/argsert')
const assign = require('./lib/assign')
const Command = require('./lib/command')
const Completion = require('./lib/completion')
const Parser = require('yargs-parser')
const path = require('path')
const Usage = require('./lib/usage')
const Validation = require('./lib/validation')
const Y18n = require('y18n')
const objFilter = require('./lib/obj-filter')
const setBlocking = require('set-blocking')
const applyExtends = require('./lib/apply-extends')
const YError = require('./lib/yerror')

var exports = module.exports = Yargs
function Yargs (processArgs, cwd, parentRequire) {
  processArgs = processArgs || [] // handle calling yargs().

  const self = {}
  var command = null
  var completion = null
  var groups = {}
  var output = ''
  var preservedGroups = {}
  var usage = null
  var validation = null

  const y18n = Y18n({
    directory: path.resolve(__dirname, './locales'),
    updateFiles: false
  })

  if (!cwd) cwd = process.cwd()

  self.$0 = process.argv
    .slice(0, 2)
    .map(function (x, i) {
      // ignore the node bin, specify this in your
      // bin file with #!/usr/bin/env node
      if (i === 0 && /\b(node|iojs)(\.exe)?$/.test(x)) return
      var b = rebase(cwd, x)
      return x.match(/^(\/|([a-zA-Z]:)?\\)/) && b.length < x.length ? b : x
    })
    .join(' ').trim()

  if (process.env._ !== undefined && process.argv[1] === process.env._) {
    self.$0 = process.env._.replace(
      path.dirname(process.execPath) + '/', ''
    )
  }

  // use context object to keep track of resets, subcommand execution, etc
  // submodules should modify and check the state of context as necessary
  const context = { resets: -1, commands: [], files: [] }
  self.getContext = function () {
    return context
  }

  // puts yargs back into an initial state. any keys
  // that have been set to "global" will not be reset
  // by this action.
  var options
  self.resetOptions = self.reset = function (aliases) {
    context.resets++
    aliases = aliases || {}
    options = options || {}
    // put yargs back into an initial state, this
    // logic is used to build a nested command
    // hierarchy.
    var tmpOptions = {}
    tmpOptions.local = options.local ? options.local : []
    tmpOptions.configObjects = options.configObjects ? options.configObjects : []

    // if a key has been explicitly set as local,
    // we should reset it before passing options to command.
    var localLookup = {}
    tmpOptions.local.forEach(function (l) {
      localLookup[l] = true
      ;(aliases[l] || []).forEach(function (a) {
        localLookup[a] = true
      })
    })

    // preserve all groups not set to local.
    preservedGroups = Object.keys(groups).reduce(function (acc, groupName) {
      var keys = groups[groupName].filter(function (key) {
        return !(key in localLookup)
      })
      if (keys.length > 0) {
        acc[groupName] = keys
      }
      return acc
    }, {})
    // groups can now be reset
    groups = {}

    var arrayOptions = [
      'array', 'boolean', 'string', 'requiresArg', 'skipValidation',
      'count', 'normalize', 'number'
    ]

    var objectOptions = [
      'narg', 'key', 'alias', 'default', 'defaultDescription',
      'config', 'choices', 'demandedOptions', 'demandedCommands', 'coerce'
    ]

    arrayOptions.forEach(function (k) {
      tmpOptions[k] = (options[k] || []).filter(function (k) {
        return !localLookup[k]
      })
    })

    objectOptions.forEach(function (k) {
      tmpOptions[k] = objFilter(options[k], function (k, v) {
        return !localLookup[k]
      })
    })

    tmpOptions.envPrefix = options.envPrefix
    options = tmpOptions

    // if this is the first time being executed, create
    // instances of all our helpers -- otherwise just reset.
    usage = usage ? usage.reset(localLookup) : Usage(self, y18n)
    validation = validation ? validation.reset(localLookup) : Validation(self, usage, y18n)
    command = command ? command.reset() : Command(self, usage, validation)
    if (!completion) completion = Completion(self, usage, command)

    completionCommand = null
    output = ''
    exitError = null
    hasOutput = false
    self.parsed = false

    return self
  }
  self.resetOptions()

  // temporary hack: allow "freezing" of reset-able state for parse(msg, cb)
  var frozen
  function freeze () {
    frozen = {}
    frozen.options = options
    frozen.configObjects = options.configObjects.slice(0)
    frozen.exitProcess = exitProcess
    frozen.groups = groups
    usage.freeze()
    validation.freeze()
    command.freeze()
    frozen.strict = strict
    frozen.completionCommand = completionCommand
    frozen.output = output
    frozen.exitError = exitError
    frozen.hasOutput = hasOutput
    frozen.parsed = self.parsed
  }
  function unfreeze () {
    options = frozen.options
    options.configObjects = frozen.configObjects
    exitProcess = frozen.exitProcess
    groups = frozen.groups
    output = frozen.output
    exitError = frozen.exitError
    hasOutput = frozen.hasOutput
    self.parsed = frozen.parsed
    usage.unfreeze()
    validation.unfreeze()
    command.unfreeze()
    strict = frozen.strict
    completionCommand = frozen.completionCommand
    parseFn = null
    parseContext = null
    frozen = undefined
  }

  self.boolean = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('boolean', keys)
    return self
  }

  self.array = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('array', keys)
    return self
  }

  self.number = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('number', keys)
    return self
  }

  self.normalize = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('normalize', keys)
    return self
  }

  self.count = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('count', keys)
    return self
  }

  self.string = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('string', keys)
    return self
  }

  self.requiresArg = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('requiresArg', keys)
    return self
  }

  self.skipValidation = function (keys) {
    argsert('<array|string>', [keys], arguments.length)
    populateParserHintArray('skipValidation', keys)
    return self
  }

  function populateParserHintArray (type, keys, value) {
    keys = [].concat(keys)
    keys.forEach(function (key) {
      options[type].push(key)
    })
  }

  self.nargs = function (key, value) {
    argsert('<string|object|array> [number]', [key, value], arguments.length)
    populateParserHintObject(self.nargs, false, 'narg', key, value)
    return self
  }

  self.choices = function (key, value) {
    argsert('<object|string|array> [string|array]', [key, value], arguments.length)
    populateParserHintObject(self.choices, true, 'choices', key, value)
    return self
  }

  self.alias = function (key, value) {
    argsert('<object|string|array> [string|array]', [key, value], arguments.length)
    populateParserHintObject(self.alias, true, 'alias', key, value)
    return self
  }

  // TODO: actually deprecate self.defaults.
  self.default = self.defaults = function (key, value, defaultDescription) {
    argsert('<object|string|array> [*] [string]', [key, value, defaultDescription], arguments.length)
    if (defaultDescription) options.defaultDescription[key] = defaultDescription
    if (typeof value === 'function') {
      if (!options.defaultDescription[key]) options.defaultDescription[key] = usage.functionDescription(value)
      value = value.call()
    }
    populateParserHintObject(self.default, false, 'default', key, value)
    return self
  }

  self.describe = function (key, desc) {
    argsert('<object|string|array> [string]', [key, desc], arguments.length)
    populateParserHintObject(self.describe, false, 'key', key, true)
    usage.describe(key, desc)
    return self
  }

  self.demandOption = function (keys, msg) {
    argsert('<object|string|array> [string]', [keys, msg], arguments.length)
    populateParserHintObject(self.demandOption, false, 'demandedOptions', keys, msg)
    return self
  }

  self.coerce = function (keys, value) {
    argsert('<object|string|array> [function]', [keys, value], arguments.length)
    populateParserHintObject(self.coerce, false, 'coerce', keys, value)
    return self
  }

  function populateParserHintObject (builder, isArray, type, key, value) {
    if (Array.isArray(key)) {
      // an array of keys with one value ['x', 'y', 'z'], function parse () {}
      var temp = {}
      key.forEach(function (k) {
        temp[k] = value
      })
      builder(temp)
    } else if (typeof key === 'object') {
      // an object of key value pairs: {'x': parse () {}, 'y': parse() {}}
      Object.keys(key).forEach(function (k) {
        builder(k, key[k])
      })
    } else {
      // a single key value pair 'x', parse() {}
      if (isArray) {
        options[type][key] = (options[type][key] || []).concat(value)
      } else {
        options[type][key] = value
      }
    }
  }

  self.config = function (key, msg, parseFn) {
    argsert('[object|string] [string|function] [function]', [key, msg, parseFn], arguments.length)
    // allow a config object to be provided directly.
    if (typeof key === 'object') {
      key = applyExtends(key, cwd)
      options.configObjects = (options.configObjects || []).concat(key)
      return self
    }

    // allow for a custom parsing function.
    if (typeof msg === 'function') {
      parseFn = msg
      msg = null
    }

    key = key || 'config'
    self.describe(key, msg || usage.deferY18nLookup('Path to JSON config file'))
    ;(Array.isArray(key) ? key : [key]).forEach(function (k) {
      options.config[k] = parseFn || true
    })

    return self
  }

  self.example = function (cmd, description) {
    argsert('<string> [string]', [cmd, description], arguments.length)
    usage.example(cmd, description)
    return self
  }

  self.command = function (cmd, description, builder, handler) {
    argsert('<string|array|object> [string|boolean] [function|object] [function]', [cmd, description, builder, handler], arguments.length)
    command.addHandler(cmd, description, builder, handler)
    return self
  }

  self.commandDir = function (dir, opts) {
    argsert('<string> [object]', [dir, opts], arguments.length)
    const req = parentRequire || require
    command.addDirectory(dir, self.getContext(), req, require('get-caller-file')(), opts)
    return self
  }

  // TODO: deprecate self.demand in favor of
  // .demandCommand() .demandOption().
  self.demand = self.required = self.require = function (keys, max, msg) {
    // you can optionally provide a 'max' key,
    // which will raise an exception if too many '_'
    // options are provided.
    if (Array.isArray(max)) {
      max.forEach(function (key) {
        self.demandOption(key, msg)
      })
      max = Infinity
    } else if (typeof max !== 'number') {
      msg = max
      max = Infinity
    }

    if (typeof keys === 'number') {
      self.demandCommand(keys, max, msg, msg)
    } else if (Array.isArray(keys)) {
      keys.forEach(function (key) {
        self.demandOption(key, msg)
      })
    } else {
      if (typeof msg === 'string') {
        self.demandOption(keys, msg)
      } else if (msg === true || typeof msg === 'undefined') {
        self.demandOption(keys)
      }
    }

    return self
  }

  self.demandCommand = function (min, max, minMsg, maxMsg) {
    argsert('[number] [number|string] [string|null] [string|null]', [min, max, minMsg, maxMsg], arguments.length)

    if (typeof min === 'undefined') min = 1

    if (typeof max !== 'number') {
      minMsg = max
      max = Infinity
    }

    self.global('_', false)

    options.demandedCommands._ = {
      min: min,
      max: max,
      minMsg: minMsg,
      maxMsg: maxMsg
    }

    return self
  }

  self.getDemandedOptions = function () {
    argsert([], 0)
    return options.demandedOptions
  }

  self.getDemandedCommands = function () {
    argsert([], 0)
    return options.demandedCommands
  }

  self.implies = function (key, value) {
    argsert('<string|object> [string]', [key, value], arguments.length)
    validation.implies(key, value)
    return self
  }

  self.conflicts = function (key1, key2) {
    argsert('<string|object> [string]', [key1, key2], arguments.length)
    validation.conflicts(key1, key2)
    return self
  }

  self.usage = function (msg, opts) {
    argsert('<string|null|object> [object]', [msg, opts], arguments.length)

    if (!opts && typeof msg === 'object') {
      opts = msg
      msg = null
    }

    usage.usage(msg)

    if (opts) self.options(opts)

    return self
  }

  self.epilogue = self.epilog = function (msg) {
    argsert('<string>', [msg], arguments.length)
    usage.epilog(msg)
    return self
  }

  self.fail = function (f) {
    argsert('<function>', [f], arguments.length)
    usage.failFn(f)
    return self
  }

  self.check = function (f, _global) {
    argsert('<function> [boolean]', [f, _global], arguments.length)
    validation.check(f, _global !== false)
    return self
  }

  self.global = function (globals, global) {
    argsert('<string|array> [boolean]', [globals, global], arguments.length)
    globals = [].concat(globals)
    if (global !== false) {
      options.local = options.local.filter(function (l) {
        return globals.indexOf(l) === -1
      })
    } else {
      globals.forEach(function (g) {
        if (options.local.indexOf(g) === -1) options.local.push(g)
      })
    }
    return self
  }

  self.pkgConf = function (key, path) {
    argsert('<string> [string]', [key, path], arguments.length)
    var conf = null
    // prefer cwd to require-main-filename in this method
    // since we're looking for e.g. "nyc" config in nyc consumer
    // rather than "yargs" config in nyc (where nyc is the main filename)
    var obj = pkgUp(path || cwd)

    // If an object exists in the key, add it to options.configObjects
    if (obj[key] && typeof obj[key] === 'object') {
      conf = applyExtends(obj[key], path || cwd)
      options.configObjects = (options.configObjects || []).concat(conf)
    }

    return self
  }

  var pkgs = {}
  function pkgUp (path) {
    var npath = path || '*'
    if (pkgs[npath]) return pkgs[npath]
    const readPkgUp = require('read-pkg-up')

    var obj = {}
    try {
      obj = readPkgUp.sync({
        cwd: path || require('require-main-filename')(parentRequire || require),
        normalize: false
      })
    } catch (noop) {}

    pkgs[npath] = obj.pkg || {}
    return pkgs[npath]
  }

  var parseFn = null
  var parseContext = null
  self.parse = function (args, shortCircuit, _parseFn) {
    argsert('<string|array> [function|boolean|object] [function]', [args, shortCircuit, _parseFn], arguments.length)

    // a context object can optionally be provided, this allows
    // additional information to be passed to a command handler.
    if (typeof shortCircuit === 'object') {
      parseContext = shortCircuit
      shortCircuit = _parseFn
    }

    // by providing a function as a second argument to
    // parse you can capture output that would otherwise
    // default to printing to stdout/stderr.
    if (typeof shortCircuit === 'function') {
      parseFn = shortCircuit
      shortCircuit = null
    }
    // completion short-circuits the parsing process,
    // skipping validation, etc.
    if (!shortCircuit) processArgs = args

    freeze()
    if (parseFn) exitProcess = false

    var parsed = self._parseArgs(args, shortCircuit)
    if (parseFn) parseFn(exitError, parsed, output)
    unfreeze()

    return parsed
  }

  self._getParseContext = function () {
    return parseContext || {}
  }

  self._hasParseCallback = function () {
    return !!parseFn
  }

  self.option = self.options = function (key, opt) {
    argsert('<string|object> [object]', [key, opt], arguments.length)
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.options(k, key[k])
      })
    } else {
      if (typeof opt !== 'object') {
        opt = {}
      }

      options.key[key] = true // track manually set keys.

      if (opt.alias) self.alias(key, opt.alias)

      var demand = opt.demand || opt.required || opt.require

      // deprecated, use 'demandOption' instead
      if (demand) {
        self.demand(key, demand)
      }

      if (opt.demandOption) {
        self.demandOption(key, typeof opt.demandOption === 'string' ? opt.demandOption : undefined)
      }

      if ('config' in opt) {
        self.config(key, opt.configParser)
      }

      if ('conflicts' in opt) {
        self.conflicts(key, opt.conflicts)
      }

      if ('default' in opt) {
        self.default(key, opt.default)
      }

      if ('implies' in opt) {
        self.implies(key, opt.implies)
      }

      if ('nargs' in opt) {
        self.nargs(key, opt.nargs)
      }

      if ('normalize' in opt) {
        self.normalize(key)
      }

      if ('choices' in opt) {
        self.choices(key, opt.choices)
      }

      if ('coerce' in opt) {
        self.coerce(key, opt.coerce)
      }

      if ('group' in opt) {
        self.group(key, opt.group)
      }

      if (opt.boolean || opt.type === 'boolean') {
        self.boolean(key)
        if (opt.alias) self.boolean(opt.alias)
      }

      if (opt.array || opt.type === 'array') {
        self.array(key)
        if (opt.alias) self.array(opt.alias)
      }

      if (opt.number || opt.type === 'number') {
        self.number(key)
        if (opt.alias) self.number(opt.alias)
      }

      if (opt.string || opt.type === 'string') {
        self.string(key)
        if (opt.alias) self.string(opt.alias)
      }

      if (opt.count || opt.type === 'count') {
        self.count(key)
      }

      if (typeof opt.global === 'boolean') {
        self.global(key, opt.global)
      }

      if (opt.defaultDescription) {
        options.defaultDescription[key] = opt.defaultDescription
      }

      if (opt.skipValidation) {
        self.skipValidation(key)
      }

      var desc = opt.describe || opt.description || opt.desc
      if (desc) {
        self.describe(key, desc)
      }

      if (opt.requiresArg) {
        self.requiresArg(key)
      }
    }

    return self
  }
  self.getOptions = function () {
    return options
  }

  self.group = function (opts, groupName) {
    argsert('<string|array> <string>', [opts, groupName], arguments.length)
    var existing = preservedGroups[groupName] || groups[groupName]
    if (preservedGroups[groupName]) {
      // we now only need to track this group name in groups.
      delete preservedGroups[groupName]
    }

    var seen = {}
    groups[groupName] = (existing || []).concat(opts).filter(function (key) {
      if (seen[key]) return false
      return (seen[key] = true)
    })
    return self
  }
  self.getGroups = function () {
    // combine explicit and preserved groups. explicit groups should be first
    return assign(groups, preservedGroups)
  }

  // as long as options.envPrefix is not undefined,
  // parser will apply env vars matching prefix to argv
  self.env = function (prefix) {
    argsert('[string|boolean]', [prefix], arguments.length)
    if (prefix === false) options.envPrefix = undefined
    else options.envPrefix = prefix || ''
    return self
  }

  self.wrap = function (cols) {
    argsert('<number|null>', [cols], arguments.length)
    usage.wrap(cols)
    return self
  }

  var strict = false
  self.strict = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length)
    strict = enabled !== false
    return self
  }
  self.getStrict = function () {
    return strict
  }

  self.showHelp = function (level) {
    argsert('[string|function]', [level], arguments.length)
    if (!self.parsed) self._parseArgs(processArgs) // run parser, if it has not already been executed.
    usage.showHelp(level)
    return self
  }

  var versionOpt = null
  self.version = function (opt, msg, ver) {
    argsert('[string|function] [string|function] [string]', [opt, msg, ver], arguments.length)
    if (arguments.length === 0) {
      ver = guessVersion()
      opt = 'version'
    } else if (arguments.length === 1) {
      ver = opt
      opt = 'version'
    } else if (arguments.length === 2) {
      ver = msg
      msg = null
    }

    versionOpt = opt
    msg = msg || usage.deferY18nLookup('Show version number')

    usage.version(ver || undefined)
    self.boolean(versionOpt)
    self.describe(versionOpt, msg)
    return self
  }

  function guessVersion () {
    var obj = pkgUp()

    return obj.version || 'unknown'
  }

  var helpOpt = null
  var useHelpOptAsCommand = false // a call to .help() will enable this
  self.addHelpOpt = self.help = function (opt, msg, addImplicitCmd) {
    argsert('[string|boolean] [string|boolean] [boolean]', [opt, msg, addImplicitCmd], arguments.length)

    // argument shuffle
    if (arguments.length === 0) {
      useHelpOptAsCommand = true
    } else if (arguments.length === 1) {
      if (typeof opt === 'boolean') {
        useHelpOptAsCommand = opt
        opt = null
      } else {
        useHelpOptAsCommand = true
      }
    } else if (arguments.length === 2) {
      if (typeof msg === 'boolean') {
        useHelpOptAsCommand = msg
        msg = null
      } else {
        useHelpOptAsCommand = true
      }
    } else {
      useHelpOptAsCommand = Boolean(addImplicitCmd)
    }
    // use arguments, fallback to defaults for opt and msg
    helpOpt = opt || 'help'
    self.boolean(helpOpt)
    self.describe(helpOpt, msg || usage.deferY18nLookup('Show help'))
    return self
  }

  self.showHelpOnFail = function (enabled, message) {
    argsert('[boolean|string] [string]', [enabled, message], arguments.length)
    usage.showHelpOnFail(enabled, message)
    return self
  }

  var exitProcess = true
  self.exitProcess = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length)
    if (typeof enabled !== 'boolean') {
      enabled = true
    }
    exitProcess = enabled
    return self
  }
  self.getExitProcess = function () {
    return exitProcess
  }

  var completionCommand = null
  self.completion = function (cmd, desc, fn) {
    argsert('[string] [string|boolean|function] [function]', [cmd, desc, fn], arguments.length)

    // a function to execute when generating
    // completions can be provided as the second
    // or third argument to completion.
    if (typeof desc === 'function') {
      fn = desc
      desc = null
    }

    // register the completion command.
    completionCommand = cmd || 'completion'
    if (!desc && desc !== false) {
      desc = 'generate bash completion script'
    }
    self.command(completionCommand, desc)

    // a function can be provided
    if (fn) completion.registerFunction(fn)

    return self
  }

  self.showCompletionScript = function ($0) {
    argsert('[string]', [$0], arguments.length)
    $0 = $0 || self.$0
    _logger.log(completion.generateCompletionScript($0))
    return self
  }

  self.getCompletion = function (args, done) {
    argsert('<array> <function>', [args, done], arguments.length)
    completion.getCompletion(args, done)
  }

  self.locale = function (locale) {
    argsert('[string]', [locale], arguments.length)
    if (arguments.length === 0) {
      guessLocale()
      return y18n.getLocale()
    }
    detectLocale = false
    y18n.setLocale(locale)
    return self
  }

  self.updateStrings = self.updateLocale = function (obj) {
    argsert('<object>', [obj], arguments.length)
    detectLocale = false
    y18n.updateLocale(obj)
    return self
  }

  var detectLocale = true
  self.detectLocale = function (detect) {
    argsert('<boolean>', [detect], arguments.length)
    detectLocale = detect
    return self
  }
  self.getDetectLocale = function () {
    return detectLocale
  }

  var hasOutput = false
  var exitError = null
  // maybe exit, always capture
  // context about why we wanted to exit.
  self.exit = function (code, err) {
    hasOutput = true
    exitError = err
    if (exitProcess) process.exit(code)
  }

  // we use a custom logger that buffers output,
  // so that we can print to non-CLIs, e.g., chat-bots.
  var _logger = {
    log: function () {
      const args = []
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i])
      if (!self._hasParseCallback()) console.log.apply(console, args)
      hasOutput = true
      if (output.length) output += '\n'
      output += args.join(' ')
    },
    error: function () {
      const args = []
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i])
      if (!self._hasParseCallback()) console.error.apply(console, args)
      hasOutput = true
      if (output.length) output += '\n'
      output += args.join(' ')
    }
  }
  self._getLoggerInstance = function () {
    return _logger
  }
  // has yargs output an error our help
  // message in the current execution context.
  self._hasOutput = function () {
    return hasOutput
  }

  self._setHasOutput = function () {
    hasOutput = true
  }

  var recommendCommands
  self.recommendCommands = function (recommend) {
    argsert('[boolean]', [recommend], arguments.length)
    recommendCommands = typeof recommend === 'boolean' ? recommend : true
    return self
  }

  self.getUsageInstance = function () {
    return usage
  }

  self.getValidationInstance = function () {
    return validation
  }

  self.getCommandInstance = function () {
    return command
  }

  self.terminalWidth = function () {
    argsert([], 0)
    return typeof process.stdout.columns !== 'undefined' ? process.stdout.columns : null
  }

  Object.defineProperty(self, 'argv', {
    get: function () {
      return self._parseArgs(processArgs)
    },
    enumerable: true
  })

  self._parseArgs = function (args, shortCircuit, _skipValidation, commandIndex) {
    var skipValidation = !!_skipValidation
    args = args || processArgs

    options.__ = y18n.__
    options.configuration = pkgUp()['yargs'] || {}
    const parsed = Parser.detailed(args, options)
    var argv = parsed.argv
    if (parseContext) argv = assign(argv, parseContext)
    var aliases = parsed.aliases

    argv.$0 = self.$0
    self.parsed = parsed

    try {
      guessLocale() // guess locale lazily, so that it can be turned off in chain.

      // while building up the argv object, there
      // are two passes through the parser. If completion
      // is being performed short-circuit on the first pass.
      if (shortCircuit) {
        return argv
      }

      if (argv._.length) {
        // check for helpOpt in argv._ before running commands
        // assumes helpOpt must be valid if useHelpOptAsCommand is true
        if (useHelpOptAsCommand) {
          // consider any multi-char helpOpt alias as a valid help command
          // unless all helpOpt aliases are single-char
          // note that parsed.aliases is a normalized bidirectional map :)
          var helpCmds = [helpOpt].concat(aliases[helpOpt] || [])
          var multiCharHelpCmds = helpCmds.filter(function (k) {
            return k.length > 1
          })
          if (multiCharHelpCmds.length) helpCmds = multiCharHelpCmds
          // look for and strip any helpCmds from argv._
          argv._ = argv._.filter(function (cmd) {
            if (~helpCmds.indexOf(cmd)) {
              argv[helpOpt] = true
              return false
            }
            return true
          })
        }

        // if there's a handler associated with a
        // command defer processing to it.
        var handlerKeys = command.getCommands()
        if (handlerKeys.length) {
          var firstUnknownCommand
          for (var i = (commandIndex || 0), cmd; argv._[i] !== undefined; i++) {
            cmd = String(argv._[i])
            if (~handlerKeys.indexOf(cmd) && cmd !== completionCommand) {
              setPlaceholderKeys(argv)
              // commands are executed using a recursive algorithm that executes
              // the deepest command first; we keep track of the position in the
              // argv._ array that is currently being executed.
              return command.runCommand(cmd, self, parsed, i + 1)
            } else if (!firstUnknownCommand && cmd !== completionCommand) {
              firstUnknownCommand = cmd
              break
            }
          }

          // run the default command, if defined
          if (command.hasDefaultCommand() && !argv[helpOpt]) {
            setPlaceholderKeys(argv)
            return command.runCommand(null, self, parsed)
          }

          // recommend a command if recommendCommands() has
          // been enabled, and no commands were found to execute
          if (recommendCommands && firstUnknownCommand && !argv[helpOpt]) {
            validation.recommendCommands(firstUnknownCommand, handlerKeys)
          }
        }

        // generate a completion script for adding to ~/.bashrc.
        if (completionCommand && ~argv._.indexOf(completionCommand) && !argv[completion.completionKey]) {
          if (exitProcess) setBlocking(true)
          self.showCompletionScript()
          self.exit(0)
        }
      } else if (command.hasDefaultCommand() && !argv[helpOpt]) {
        setPlaceholderKeys(argv)
        return command.runCommand(null, self, parsed)
      }

      // we must run completions first, a user might
      // want to complete the --help or --version option.
      if (completion.completionKey in argv) {
        if (exitProcess) setBlocking(true)

        // we allow for asynchronous completions,
        // e.g., loading in a list of commands from an API.
        var completionArgs = args.slice(args.indexOf('--' + completion.completionKey) + 1)
        completion.getCompletion(completionArgs, function (completions) {
          ;(completions || []).forEach(function (completion) {
            _logger.log(completion)
          })

          self.exit(0)
        })
        return setPlaceholderKeys(argv)
      }

      // Handle 'help' and 'version' options
      // if we haven't already output help!
      if (!hasOutput) {
        Object.keys(argv).forEach(function (key) {
          if (key === helpOpt && argv[key]) {
            if (exitProcess) setBlocking(true)

            skipValidation = true
            self.showHelp('log')
            self.exit(0)
          } else if (key === versionOpt && argv[key]) {
            if (exitProcess) setBlocking(true)

            skipValidation = true
            usage.showVersion()
            self.exit(0)
          }
        })
      }

      // Check if any of the options to skip validation were provided
      if (!skipValidation && options.skipValidation.length > 0) {
        skipValidation = Object.keys(argv).some(function (key) {
          return options.skipValidation.indexOf(key) >= 0 && argv[key] === true
        })
      }

      // If the help or version options where used and exitProcess is false,
      // or if explicitly skipped, we won't run validations.
      if (!skipValidation) {
        if (parsed.error) throw new YError(parsed.error.message)

        // if we're executed via bash completion, don't
        // bother with validation.
        if (!argv[completion.completionKey]) {
          self._runValidation(argv, aliases, {}, parsed.error)
        }
      }
    } catch (err) {
      if (err instanceof YError) usage.fail(err.message, err)
      else throw err
    }

    return setPlaceholderKeys(argv)
  }

  self._runValidation = function (argv, aliases, positionalMap, parseErrors) {
    if (parseErrors) throw new YError(parseErrors.message)
    validation.nonOptionCount(argv)
    validation.missingArgumentValue(argv)
    validation.requiredArguments(argv)
    if (strict) validation.unknownArguments(argv, aliases, positionalMap)
    validation.customChecks(argv, aliases)
    validation.limitedChoices(argv)
    validation.implications(argv)
    validation.conflicting(argv)
  }

  function guessLocale () {
    if (!detectLocale) return

    try {
      const osLocale = require('os-locale')
      self.locale(osLocale.sync({ spawn: false }))
    } catch (err) {
      // if we explode looking up locale just noop
      // we'll keep using the default language 'en'.
    }
  }

  function setPlaceholderKeys (argv) {
    Object.keys(options.key).forEach(function (key) {
      // don't set placeholder keys for dot
      // notation options 'foo.bar'.
      if (~key.indexOf('.')) return
      if (typeof argv[key] === 'undefined') argv[key] = undefined
    })
    return argv
  }

  return self
}

// rebase an absolute path to a relative one with respect to a base directory
// exported for tests
exports.rebase = rebase
function rebase (base, dir) {
  return path.relative(base, dir)
}

}, function(modId) { var map = {"./lib/argsert":1602510872398,"./lib/assign":1602510872401,"./lib/command":1602510872399,"./lib/completion":1602510872402,"./lib/usage":1602510872403,"./lib/validation":1602510872405,"./lib/obj-filter":1602510872404,"./lib/apply-extends":1602510872407,"./lib/yerror":1602510872400}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872398, function(require, module, exports) {
const command = require('./command')()
const YError = require('./yerror')

const positionName = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']

module.exports = function (expected, callerArguments, length) {
  // TODO: should this eventually raise an exception.
  try {
    // preface the argument description with "cmd", so
    // that we can run it through yargs' command parser.
    var position = 0
    var parsed = {demanded: [], optional: []}
    if (typeof expected === 'object') {
      length = callerArguments
      callerArguments = expected
    } else {
      parsed = command.parseCommand('cmd ' + expected)
    }
    const args = [].slice.call(callerArguments)

    while (args.length && args[args.length - 1] === undefined) args.pop()
    length = length || args.length

    if (length < parsed.demanded.length) {
      throw new YError('Not enough arguments provided. Expected ' + parsed.demanded.length +
        ' but received ' + args.length + '.')
    }

    const totalCommands = parsed.demanded.length + parsed.optional.length
    if (length > totalCommands) {
      throw new YError('Too many arguments provided. Expected max ' + totalCommands +
        ' but received ' + length + '.')
    }

    parsed.demanded.forEach(function (demanded) {
      const arg = args.shift()
      const observedType = guessType(arg)
      const matchingTypes = demanded.cmd.filter(function (type) {
        return type === observedType || type === '*'
      })
      if (matchingTypes.length === 0) argumentTypeError(observedType, demanded.cmd, position, false)
      position += 1
    })

    parsed.optional.forEach(function (optional) {
      if (args.length === 0) return
      const arg = args.shift()
      const observedType = guessType(arg)
      const matchingTypes = optional.cmd.filter(function (type) {
        return type === observedType || type === '*'
      })
      if (matchingTypes.length === 0) argumentTypeError(observedType, optional.cmd, position, true)
      position += 1
    })
  } catch (err) {
    console.warn(err.stack)
  }
}

function guessType (arg) {
  if (Array.isArray(arg)) {
    return 'array'
  } else if (arg === null) {
    return 'null'
  }
  return typeof arg
}

function argumentTypeError (observedType, allowedTypes, position, optional) {
  throw new YError('Invalid ' + (positionName[position] || 'manyith') + ' argument.' +
    ' Expected ' + allowedTypes.join(' or ') + ' but received ' + observedType + '.')
}

}, function(modId) { var map = {"./command":1602510872399,"./yerror":1602510872400}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872399, function(require, module, exports) {
const path = require('path')
const inspect = require('util').inspect
const camelCase = require('camelcase')

const DEFAULT_MARKER = '*'

// handles parsing positional arguments,
// and populating argv with said positional
// arguments.
module.exports = function (yargs, usage, validation) {
  const self = {}

  var handlers = {}
  var aliasMap = {}
  var defaultCommand
  self.addHandler = function (cmd, description, builder, handler) {
    var aliases = []
    handler = handler || function () {}

    if (Array.isArray(cmd)) {
      aliases = cmd.slice(1)
      cmd = cmd[0]
    } else if (typeof cmd === 'object') {
      var command = (Array.isArray(cmd.command) || typeof cmd.command === 'string') ? cmd.command : moduleName(cmd)
      if (cmd.aliases) command = [].concat(command).concat(cmd.aliases)
      self.addHandler(command, extractDesc(cmd), cmd.builder, cmd.handler)
      return
    }

    // allow a module to be provided instead of separate builder and handler
    if (typeof builder === 'object' && builder.builder && typeof builder.handler === 'function') {
      self.addHandler([cmd].concat(aliases), description, builder.builder, builder.handler)
      return
    }

    // parse positionals out of cmd string
    var parsedCommand = self.parseCommand(cmd)

    // remove positional args from aliases only
    aliases = aliases.map(function (alias) {
      return self.parseCommand(alias).cmd
    })

    // check for default and filter out '*''
    var isDefault = false
    var parsedAliases = [parsedCommand.cmd].concat(aliases).filter(function (c) {
      if (c === DEFAULT_MARKER) {
        isDefault = true
        return false
      }
      return true
    })

    // short-circuit if default with no aliases
    if (isDefault && parsedAliases.length === 0) {
      defaultCommand = {
        original: cmd.replace(DEFAULT_MARKER, '').trim(),
        handler: handler,
        builder: builder || {},
        demanded: parsedCommand.demanded,
        optional: parsedCommand.optional
      }
      return
    }

    // shift cmd and aliases after filtering out '*'
    if (isDefault) {
      parsedCommand.cmd = parsedAliases[0]
      aliases = parsedAliases.slice(1)
      cmd = cmd.replace(DEFAULT_MARKER, parsedCommand.cmd)
    }

    // populate aliasMap
    aliases.forEach(function (alias) {
      aliasMap[alias] = parsedCommand.cmd
    })

    if (description !== false) {
      usage.command(cmd, description, isDefault, aliases)
    }

    handlers[parsedCommand.cmd] = {
      original: cmd,
      handler: handler,
      builder: builder || {},
      demanded: parsedCommand.demanded,
      optional: parsedCommand.optional
    }

    if (isDefault) defaultCommand = handlers[parsedCommand.cmd]
  }

  self.addDirectory = function (dir, context, req, callerFile, opts) {
    opts = opts || {}
    // disable recursion to support nested directories of subcommands
    if (typeof opts.recurse !== 'boolean') opts.recurse = false
    // exclude 'json', 'coffee' from require-directory defaults
    if (!Array.isArray(opts.extensions)) opts.extensions = ['js']
    // allow consumer to define their own visitor function
    const parentVisit = typeof opts.visit === 'function' ? opts.visit : function (o) { return o }
    // call addHandler via visitor function
    opts.visit = function (obj, joined, filename) {
      const visited = parentVisit(obj, joined, filename)
      // allow consumer to skip modules with their own visitor
      if (visited) {
        // check for cyclic reference
        // each command file path should only be seen once per execution
        if (~context.files.indexOf(joined)) return visited
        // keep track of visited files in context.files
        context.files.push(joined)
        self.addHandler(visited)
      }
      return visited
    }
    require('require-directory')({ require: req, filename: callerFile }, dir, opts)
  }

  // lookup module object from require()d command and derive name
  // if module was not require()d and no name given, throw error
  function moduleName (obj) {
    const mod = require('which-module')(obj)
    if (!mod) throw new Error('No command name given for module: ' + inspect(obj))
    return commandFromFilename(mod.filename)
  }

  // derive command name from filename
  function commandFromFilename (filename) {
    return path.basename(filename, path.extname(filename))
  }

  function extractDesc (obj) {
    for (var keys = ['describe', 'description', 'desc'], i = 0, l = keys.length, test; i < l; i++) {
      test = obj[keys[i]]
      if (typeof test === 'string' || typeof test === 'boolean') return test
    }
    return false
  }

  self.parseCommand = function (cmd) {
    var extraSpacesStrippedCommand = cmd.replace(/\s{2,}/g, ' ')
    var splitCommand = extraSpacesStrippedCommand.split(/\s+(?![^[]*]|[^<]*>)/)
    var bregex = /\.*[\][<>]/g
    var parsedCommand = {
      cmd: (splitCommand.shift()).replace(bregex, ''),
      demanded: [],
      optional: []
    }
    splitCommand.forEach(function (cmd, i) {
      var variadic = false
      cmd = cmd.replace(/\s/g, '')
      if (/\.+[\]>]/.test(cmd) && i === splitCommand.length - 1) variadic = true
      if (/^\[/.test(cmd)) {
        parsedCommand.optional.push({
          cmd: cmd.replace(bregex, '').split('|'),
          variadic: variadic
        })
      } else {
        parsedCommand.demanded.push({
          cmd: cmd.replace(bregex, '').split('|'),
          variadic: variadic
        })
      }
    })
    return parsedCommand
  }

  self.getCommands = function () {
    return Object.keys(handlers).concat(Object.keys(aliasMap))
  }

  self.getCommandHandlers = function () {
    return handlers
  }

  self.hasDefaultCommand = function () {
    return !!defaultCommand
  }

  self.runCommand = function (command, yargs, parsed, commandIndex) {
    var aliases = parsed.aliases
    var commandHandler = handlers[command] || handlers[aliasMap[command]] || defaultCommand
    var currentContext = yargs.getContext()
    var numFiles = currentContext.files.length
    var parentCommands = currentContext.commands.slice()

    // what does yargs look like after the buidler is run?
    var innerArgv = parsed.argv
    var innerYargs = null
    var positionalMap = {}

    if (command) currentContext.commands.push(command)
    if (typeof commandHandler.builder === 'function') {
      // a function can be provided, which builds
      // up a yargs chain and possibly returns it.
      innerYargs = commandHandler.builder(yargs.reset(parsed.aliases))
      // if the builder function did not yet parse argv with reset yargs
      // and did not explicitly set a usage() string, then apply the
      // original command string as usage() for consistent behavior with
      // options object below.
      if (yargs.parsed === false) {
        if (typeof yargs.getUsageInstance().getUsage() === 'undefined') {
          yargs.usage('$0 ' + (parentCommands.length ? parentCommands.join(' ') + ' ' : '') + commandHandler.original)
        }
        innerArgv = innerYargs ? innerYargs._parseArgs(null, null, true, commandIndex) : yargs._parseArgs(null, null, true, commandIndex)
      } else {
        innerArgv = yargs.parsed.argv
      }

      if (innerYargs && yargs.parsed === false) aliases = innerYargs.parsed.aliases
      else aliases = yargs.parsed.aliases
    } else if (typeof commandHandler.builder === 'object') {
      // as a short hand, an object can instead be provided, specifying
      // the options that a command takes.
      innerYargs = yargs.reset(parsed.aliases)
      innerYargs.usage('$0 ' + (parentCommands.length ? parentCommands.join(' ') + ' ' : '') + commandHandler.original)
      Object.keys(commandHandler.builder).forEach(function (key) {
        innerYargs.option(key, commandHandler.builder[key])
      })
      innerArgv = innerYargs._parseArgs(null, null, true, commandIndex)
      aliases = innerYargs.parsed.aliases
    }

    if (!yargs._hasOutput()) {
      positionalMap = populatePositionals(commandHandler, innerArgv, currentContext, yargs)
    }

    // we apply validation post-hoc, so that custom
    // checks get passed populated positional arguments.
    if (!yargs._hasOutput()) yargs._runValidation(innerArgv, aliases, positionalMap, yargs.parsed.error)

    if (commandHandler.handler && !yargs._hasOutput()) {
      yargs._setHasOutput()
      commandHandler.handler(innerArgv)
    }

    if (command) currentContext.commands.pop()
    numFiles = currentContext.files.length - numFiles
    if (numFiles > 0) currentContext.files.splice(numFiles * -1, numFiles)

    return innerArgv
  }

  // transcribe all positional arguments "command <foo> <bar> [apple]"
  // onto argv.
  function populatePositionals (commandHandler, argv, context, yargs) {
    argv._ = argv._.slice(context.commands.length) // nuke the current commands
    var demanded = commandHandler.demanded.slice(0)
    var optional = commandHandler.optional.slice(0)
    var positionalMap = {}

    validation.positionalCount(demanded.length, argv._.length)

    while (demanded.length) {
      var demand = demanded.shift()
      populatePositional(demand, argv, yargs, positionalMap)
    }

    while (optional.length) {
      var maybe = optional.shift()
      populatePositional(maybe, argv, yargs, positionalMap)
    }

    argv._ = context.commands.concat(argv._)
    return positionalMap
  }

  // populate a single positional argument and its
  // aliases onto argv.
  function populatePositional (positional, argv, yargs, positionalMap) {
    // "positional" consists of the positional.cmd, an array representing
    // the positional's name and aliases, and positional.variadic
    // indicating whether or not it is a variadic array.
    var variadics = null
    var value = null
    for (var i = 0, cmd; (cmd = positional.cmd[i]) !== undefined; i++) {
      if (positional.variadic) {
        if (variadics) argv[cmd] = variadics.slice(0)
        else argv[cmd] = variadics = argv._.splice(0)
      } else {
        if (!value && !argv._.length) continue
        if (value) argv[cmd] = value
        else argv[cmd] = value = argv._.shift()
      }
      positionalMap[cmd] = true
      postProcessPositional(yargs, argv, cmd)
      addCamelCaseExpansions(argv, cmd)
    }
  }

  // TODO move positional arg logic to yargs-parser and remove this duplication
  function postProcessPositional (yargs, argv, key) {
    var coerce = yargs.getOptions().coerce[key]
    if (typeof coerce === 'function') {
      try {
        argv[key] = coerce(argv[key])
      } catch (err) {
        yargs.getUsageInstance().fail(err.message, err)
      }
    }
  }

  function addCamelCaseExpansions (argv, option) {
    if (/-/.test(option)) {
      const cc = camelCase(option)
      if (typeof argv[option] === 'object') argv[cc] = argv[option].slice(0)
      else argv[cc] = argv[option]
    }
  }

  self.reset = function () {
    handlers = {}
    aliasMap = {}
    defaultCommand = undefined
    return self
  }

  // used by yargs.parse() to freeze
  // the state of commands such that
  // we can apply .parse() multiple times
  // with the same yargs instance.
  var frozen
  self.freeze = function () {
    frozen = {}
    frozen.handlers = handlers
    frozen.aliasMap = aliasMap
    frozen.defaultCommand = defaultCommand
  }
  self.unfreeze = function () {
    handlers = frozen.handlers
    aliasMap = frozen.aliasMap
    defaultCommand = frozen.defaultCommand
    frozen = undefined
  }

  return self
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872400, function(require, module, exports) {
function YError (msg) {
  this.name = 'YError'
  this.message = msg || 'yargs error'
  Error.captureStackTrace(this, YError)
}

YError.prototype = Object.create(Error.prototype)
YError.prototype.constructor = YError

module.exports = YError

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872401, function(require, module, exports) {
// lazy Object.assign logic that only works for merging
// two objects; eventually we should replace this with Object.assign.
module.exports = function assign (defaults, configuration) {
  var o = {}
  configuration = configuration || {}

  Object.keys(defaults).forEach(function (k) {
    o[k] = defaults[k]
  })
  Object.keys(configuration).forEach(function (k) {
    o[k] = configuration[k]
  })

  return o
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872402, function(require, module, exports) {
const fs = require('fs')
const path = require('path')

// add bash completions to your
//  yargs-powered applications.
module.exports = function (yargs, usage, command) {
  const self = {
    completionKey: 'get-yargs-completions'
  }

  // get a list of completion commands.
  // 'args' is the array of strings from the line to be completed
  self.getCompletion = function (args, done) {
    const completions = []
    const current = args.length ? args[args.length - 1] : ''
    const argv = yargs.parse(args, true)
    const aliases = yargs.parsed.aliases

    // a custom completion function can be provided
    // to completion().
    if (completionFunction) {
      if (completionFunction.length < 3) {
        var result = completionFunction(current, argv)

        // promise based completion function.
        if (typeof result.then === 'function') {
          return result.then(function (list) {
            process.nextTick(function () { done(list) })
          }).catch(function (err) {
            process.nextTick(function () { throw err })
          })
        }

        // synchronous completion function.
        return done(result)
      } else {
        // asynchronous completion function
        return completionFunction(current, argv, function (completions) {
          done(completions)
        })
      }
    }

    var handlers = command.getCommandHandlers()
    for (var i = 0, ii = args.length; i < ii; ++i) {
      if (handlers[args[i]] && handlers[args[i]].builder) {
        const builder = handlers[args[i]].builder
        if (typeof builder === 'function') {
          const y = yargs.reset()
          builder(y)
          return y.argv
        }
      }
    }

    if (!current.match(/^-/)) {
      usage.getCommands().forEach(function (command) {
        if (args.indexOf(command[0]) === -1) {
          completions.push(command[0])
        }
      })
    }

    if (current.match(/^-/)) {
      Object.keys(yargs.getOptions().key).forEach(function (key) {
        // If the key and its aliases aren't in 'args', add the key to 'completions'
        var keyAndAliases = [key].concat(aliases[key] || [])
        var notInArgs = keyAndAliases.every(function (val) {
          return args.indexOf('--' + val) === -1
        })
        if (notInArgs) {
          completions.push('--' + key)
        }
      })
    }

    done(completions)
  }

  // generate the completion script to add to your .bashrc.
  self.generateCompletionScript = function ($0) {
    var script = fs.readFileSync(
      path.resolve(__dirname, '../completion.sh.hbs'),
      'utf-8'
    )
    var name = path.basename($0)

    // add ./to applications not yet installed as bin.
    if ($0.match(/\.js$/)) $0 = './' + $0

    script = script.replace(/{{app_name}}/g, name)
    return script.replace(/{{app_path}}/g, $0)
  }

  // register a function to perform your own custom
  // completions., this function can be either
  // synchrnous or asynchronous.
  var completionFunction = null
  self.registerFunction = function (fn) {
    completionFunction = fn
  }

  return self
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872403, function(require, module, exports) {
// this file handles outputting usage instructions,
// failures, etc. keeps logging in one place.
const stringWidth = require('string-width')
const objFilter = require('./obj-filter')
const setBlocking = require('set-blocking')
const YError = require('./yerror')

module.exports = function (yargs, y18n) {
  const __ = y18n.__
  const self = {}

  // methods for ouputting/building failure message.
  var fails = []
  self.failFn = function (f) {
    fails.push(f)
  }

  var failMessage = null
  var showHelpOnFail = true
  self.showHelpOnFail = function (enabled, message) {
    if (typeof enabled === 'string') {
      message = enabled
      enabled = true
    } else if (typeof enabled === 'undefined') {
      enabled = true
    }
    failMessage = message
    showHelpOnFail = enabled
    return self
  }

  var failureOutput = false
  self.fail = function (msg, err) {
    const logger = yargs._getLoggerInstance()

    if (fails.length) {
      for (var i = fails.length - 1; i >= 0; --i) {
        fails[i](msg, err, self)
      }
    } else {
      if (yargs.getExitProcess()) setBlocking(true)

      // don't output failure message more than once
      if (!failureOutput) {
        failureOutput = true
        if (showHelpOnFail) yargs.showHelp('error')
        if (msg) logger.error(msg)
        if (failMessage) {
          if (msg) logger.error('')
          logger.error(failMessage)
        }
      }

      err = err || new YError(msg)
      if (yargs.getExitProcess()) {
        return yargs.exit(1)
      } else if (yargs._hasParseCallback()) {
        return yargs.exit(1, err)
      } else {
        throw err
      }
    }
  }

  // methods for ouputting/building help (usage) message.
  var usage
  self.usage = function (msg) {
    usage = msg
  }
  self.getUsage = function () {
    return usage
  }

  var examples = []
  self.example = function (cmd, description) {
    examples.push([cmd, description || ''])
  }

  var commands = []
  self.command = function (cmd, description, isDefault, aliases) {
    // the last default wins, so cancel out any previously set default
    if (isDefault) {
      commands = commands.map(function (cmdArray) {
        cmdArray[2] = false
        return cmdArray
      })
    }
    commands.push([cmd, description || '', isDefault, aliases])
  }
  self.getCommands = function () {
    return commands
  }

  var descriptions = {}
  self.describe = function (key, desc) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.describe(k, key[k])
      })
    } else {
      descriptions[key] = desc
    }
  }
  self.getDescriptions = function () {
    return descriptions
  }

  var epilog
  self.epilog = function (msg) {
    epilog = msg
  }

  var wrapSet = false
  var wrap
  self.wrap = function (cols) {
    wrapSet = true
    wrap = cols
  }

  function getWrap () {
    if (!wrapSet) {
      wrap = windowWidth()
      wrapSet = true
    }

    return wrap
  }

  var deferY18nLookupPrefix = '__yargsString__:'
  self.deferY18nLookup = function (str) {
    return deferY18nLookupPrefix + str
  }

  var defaultGroup = 'Options:'
  self.help = function () {
    normalizeAliases()

    // handle old demanded API
    var demandedOptions = yargs.getDemandedOptions()
    var demandedCommands = yargs.getDemandedCommands()
    var groups = yargs.getGroups()
    var options = yargs.getOptions()
    var keys = Object.keys(
      Object.keys(descriptions)
      .concat(Object.keys(demandedOptions))
      .concat(Object.keys(demandedCommands))
      .concat(Object.keys(options.default))
      .reduce(function (acc, key) {
        if (key !== '_') acc[key] = true
        return acc
      }, {})
    )

    var theWrap = getWrap()
    var ui = require('cliui')({
      width: theWrap,
      wrap: !!theWrap
    })

    // the usage string.
    if (usage) {
      var u = usage.replace(/\$0/g, yargs.$0)
      ui.div(u + '\n')
    }

    // your application's commands, i.e., non-option
    // arguments populated in '_'.
    if (commands.length) {
      ui.div(__('Commands:'))

      commands.forEach(function (command) {
        ui.span(
          {text: command[0], padding: [0, 2, 0, 2], width: maxWidth(commands, theWrap) + 4},
          {text: command[1]}
        )
        var hints = []
        if (command[2]) hints.push('[' + __('default:').slice(0, -1) + ']') // TODO hacking around i18n here
        if (command[3] && command[3].length) {
          hints.push('[' + __('aliases:') + ' ' + command[3].join(', ') + ']')
        }
        if (hints.length) {
          ui.div({text: hints.join(' '), padding: [0, 0, 0, 2], align: 'right'})
        } else {
          ui.div()
        }
      })

      ui.div()
    }

    // perform some cleanup on the keys array, making it
    // only include top-level keys not their aliases.
    var aliasKeys = (Object.keys(options.alias) || [])
      .concat(Object.keys(yargs.parsed.newAliases) || [])

    keys = keys.filter(function (key) {
      return !yargs.parsed.newAliases[key] && aliasKeys.every(function (alias) {
        return (options.alias[alias] || []).indexOf(key) === -1
      })
    })

    // populate 'Options:' group with any keys that have not
    // explicitly had a group set.
    if (!groups[defaultGroup]) groups[defaultGroup] = []
    addUngroupedKeys(keys, options.alias, groups)

    // display 'Options:' table along with any custom tables:
    Object.keys(groups).forEach(function (groupName) {
      if (!groups[groupName].length) return

      ui.div(__(groupName))

      // if we've grouped the key 'f', but 'f' aliases 'foobar',
      // normalizedKeys should contain only 'foobar'.
      var normalizedKeys = groups[groupName].map(function (key) {
        if (~aliasKeys.indexOf(key)) return key
        for (var i = 0, aliasKey; (aliasKey = aliasKeys[i]) !== undefined; i++) {
          if (~(options.alias[aliasKey] || []).indexOf(key)) return aliasKey
        }
        return key
      })

      // actually generate the switches string --foo, -f, --bar.
      var switches = normalizedKeys.reduce(function (acc, key) {
        acc[key] = [ key ].concat(options.alias[key] || [])
          .map(function (sw) {
            return (sw.length > 1 ? '--' : '-') + sw
          })
          .join(', ')

        return acc
      }, {})

      normalizedKeys.forEach(function (key) {
        var kswitch = switches[key]
        var desc = descriptions[key] || ''
        var type = null

        if (~desc.lastIndexOf(deferY18nLookupPrefix)) desc = __(desc.substring(deferY18nLookupPrefix.length))

        if (~options.boolean.indexOf(key)) type = '[' + __('boolean') + ']'
        if (~options.count.indexOf(key)) type = '[' + __('count') + ']'
        if (~options.string.indexOf(key)) type = '[' + __('string') + ']'
        if (~options.normalize.indexOf(key)) type = '[' + __('string') + ']'
        if (~options.array.indexOf(key)) type = '[' + __('array') + ']'
        if (~options.number.indexOf(key)) type = '[' + __('number') + ']'

        var extra = [
          type,
          (key in demandedOptions) ? '[' + __('required') + ']' : null,
          options.choices && options.choices[key] ? '[' + __('choices:') + ' ' +
            self.stringifiedValues(options.choices[key]) + ']' : null,
          defaultString(options.default[key], options.defaultDescription[key])
        ].filter(Boolean).join(' ')

        ui.span(
          {text: kswitch, padding: [0, 2, 0, 2], width: maxWidth(switches, theWrap) + 4},
          desc
        )

        if (extra) ui.div({text: extra, padding: [0, 0, 0, 2], align: 'right'})
        else ui.div()
      })

      ui.div()
    })

    // describe some common use-cases for your application.
    if (examples.length) {
      ui.div(__('Examples:'))

      examples.forEach(function (example) {
        example[0] = example[0].replace(/\$0/g, yargs.$0)
      })

      examples.forEach(function (example) {
        if (example[1] === '') {
          ui.div(
            {
              text: example[0],
              padding: [0, 2, 0, 2]
            }
          )
        } else {
          ui.div(
            {
              text: example[0],
              padding: [0, 2, 0, 2],
              width: maxWidth(examples, theWrap) + 4
            }, {
              text: example[1]
            }
          )
        }
      })

      ui.div()
    }

    // the usage string.
    if (epilog) {
      var e = epilog.replace(/\$0/g, yargs.$0)
      ui.div(e + '\n')
    }

    return ui.toString()
  }

  // return the maximum width of a string
  // in the left-hand column of a table.
  function maxWidth (table, theWrap) {
    var width = 0

    // table might be of the form [leftColumn],
    // or {key: leftColumn}
    if (!Array.isArray(table)) {
      table = Object.keys(table).map(function (key) {
        return [table[key]]
      })
    }

    table.forEach(function (v) {
      width = Math.max(stringWidth(v[0]), width)
    })

    // if we've enabled 'wrap' we should limit
    // the max-width of the left-column.
    if (theWrap) width = Math.min(width, parseInt(theWrap * 0.5, 10))

    return width
  }

  // make sure any options set for aliases,
  // are copied to the keys being aliased.
  function normalizeAliases () {
    // handle old demanded API
    var demandedOptions = yargs.getDemandedOptions()
    var options = yargs.getOptions()

    ;(Object.keys(options.alias) || []).forEach(function (key) {
      options.alias[key].forEach(function (alias) {
        // copy descriptions.
        if (descriptions[alias]) self.describe(key, descriptions[alias])
        // copy demanded.
        if (alias in demandedOptions) yargs.demandOption(key, demandedOptions[alias])
        // type messages.
        if (~options.boolean.indexOf(alias)) yargs.boolean(key)
        if (~options.count.indexOf(alias)) yargs.count(key)
        if (~options.string.indexOf(alias)) yargs.string(key)
        if (~options.normalize.indexOf(alias)) yargs.normalize(key)
        if (~options.array.indexOf(alias)) yargs.array(key)
        if (~options.number.indexOf(alias)) yargs.number(key)
      })
    })
  }

  // given a set of keys, place any keys that are
  // ungrouped under the 'Options:' grouping.
  function addUngroupedKeys (keys, aliases, groups) {
    var groupedKeys = []
    var toCheck = null
    Object.keys(groups).forEach(function (group) {
      groupedKeys = groupedKeys.concat(groups[group])
    })

    keys.forEach(function (key) {
      toCheck = [key].concat(aliases[key])
      if (!toCheck.some(function (k) {
        return groupedKeys.indexOf(k) !== -1
      })) {
        groups[defaultGroup].push(key)
      }
    })
    return groupedKeys
  }

  self.showHelp = function (level) {
    const logger = yargs._getLoggerInstance()
    if (!level) level = 'error'
    var emit = typeof level === 'function' ? level : logger[level]
    emit(self.help())
  }

  self.functionDescription = function (fn) {
    var description = fn.name ? require('decamelize')(fn.name, '-') : __('generated-value')
    return ['(', description, ')'].join('')
  }

  self.stringifiedValues = function (values, separator) {
    var string = ''
    var sep = separator || ', '
    var array = [].concat(values)

    if (!values || !array.length) return string

    array.forEach(function (value) {
      if (string.length) string += sep
      string += JSON.stringify(value)
    })

    return string
  }

  // format the default-value-string displayed in
  // the right-hand column.
  function defaultString (value, defaultDescription) {
    var string = '[' + __('default:') + ' '

    if (value === undefined && !defaultDescription) return null

    if (defaultDescription) {
      string += defaultDescription
    } else {
      switch (typeof value) {
        case 'string':
          string += JSON.stringify(value)
          break
        case 'object':
          string += JSON.stringify(value)
          break
        default:
          string += value
      }
    }

    return string + ']'
  }

  // guess the width of the console window, max-width 80.
  function windowWidth () {
    var maxWidth = 80
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
      return Math.min(maxWidth, process.stdout.columns)
    } else {
      return maxWidth
    }
  }

  // logic for displaying application version.
  var version = null
  self.version = function (ver) {
    version = ver
  }

  self.showVersion = function () {
    const logger = yargs._getLoggerInstance()
    if (typeof version === 'function') logger.log(version())
    else logger.log(version)
  }

  self.reset = function (localLookup) {
    // do not reset wrap here
    // do not reset fails here
    failMessage = null
    failureOutput = false
    usage = undefined
    epilog = undefined
    examples = []
    commands = []
    descriptions = objFilter(descriptions, function (k, v) {
      return !localLookup[k]
    })
    return self
  }

  var frozen
  self.freeze = function () {
    frozen = {}
    frozen.failMessage = failMessage
    frozen.failureOutput = failureOutput
    frozen.usage = usage
    frozen.epilog = epilog
    frozen.examples = examples
    frozen.commands = commands
    frozen.descriptions = descriptions
  }
  self.unfreeze = function () {
    failMessage = frozen.failMessage
    failureOutput = frozen.failureOutput
    usage = frozen.usage
    epilog = frozen.epilog
    examples = frozen.examples
    commands = frozen.commands
    descriptions = frozen.descriptions
    frozen = undefined
  }

  return self
}

}, function(modId) { var map = {"./obj-filter":1602510872404,"./yerror":1602510872400}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872404, function(require, module, exports) {
module.exports = function (original, filter) {
  const obj = {}
  filter = filter || function (k, v) { return true }
  Object.keys(original || {}).forEach(function (key) {
    if (filter(key, original[key])) {
      obj[key] = original[key]
    }
  })
  return obj
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872405, function(require, module, exports) {
const objFilter = require('./obj-filter')
const specialKeys = ['$0', '--', '_']

// validation-type-stuff, missing params,
// bad implications, custom checks.
module.exports = function (yargs, usage, y18n) {
  const __ = y18n.__
  const __n = y18n.__n
  const self = {}

  // validate appropriate # of non-option
  // arguments were provided, i.e., '_'.
  self.nonOptionCount = function (argv) {
    const demandedCommands = yargs.getDemandedCommands()
    // don't count currently executing commands
    const _s = argv._.length - yargs.getContext().commands.length

    if (demandedCommands._ && (_s < demandedCommands._.min || _s > demandedCommands._.max)) {
      if (_s < demandedCommands._.min) {
        if (demandedCommands._.minMsg !== undefined) {
          usage.fail(
            // replace $0 with observed, $1 with expected.
            demandedCommands._.minMsg ? demandedCommands._.minMsg.replace(/\$0/g, _s).replace(/\$1/, demandedCommands._.min) : null
          )
        } else {
          usage.fail(
            __('Not enough non-option arguments: got %s, need at least %s', _s, demandedCommands._.min)
          )
        }
      } else if (_s > demandedCommands._.max) {
        if (demandedCommands._.maxMsg !== undefined) {
          usage.fail(
            // replace $0 with observed, $1 with expected.
            demandedCommands._.maxMsg ? demandedCommands._.maxMsg.replace(/\$0/g, _s).replace(/\$1/, demandedCommands._.max) : null
          )
        } else {
          usage.fail(
          __('Too many non-option arguments: got %s, maximum of %s', _s, demandedCommands._.max)
          )
        }
      }
    }
  }

  // validate the appropriate # of <required>
  // positional arguments were provided:
  self.positionalCount = function (required, observed) {
    if (observed < required) {
      usage.fail(
        __('Not enough non-option arguments: got %s, need at least %s', observed, required)
      )
    }
  }

  // make sure that any args that require an
  // value (--foo=bar), have a value.
  self.missingArgumentValue = function (argv) {
    const defaultValues = [true, false, '']
    const options = yargs.getOptions()

    if (options.requiresArg.length > 0) {
      const missingRequiredArgs = []

      options.requiresArg.forEach(function (key) {
        const value = argv[key]

        // if a value is explicitly requested,
        // flag argument as missing if it does not
        // look like foo=bar was entered.
        if (~defaultValues.indexOf(value) ||
          (Array.isArray(value) && !value.length)) {
          missingRequiredArgs.push(key)
        }
      })

      if (missingRequiredArgs.length > 0) {
        usage.fail(__n(
          'Missing argument value: %s',
          'Missing argument values: %s',
          missingRequiredArgs.length,
          missingRequiredArgs.join(', ')
        ))
      }
    }
  }

  // make sure all the required arguments are present.
  self.requiredArguments = function (argv) {
    const demandedOptions = yargs.getDemandedOptions()
    var missing = null

    Object.keys(demandedOptions).forEach(function (key) {
      if (!argv.hasOwnProperty(key) || typeof argv[key] === 'undefined') {
        missing = missing || {}
        missing[key] = demandedOptions[key]
      }
    })

    if (missing) {
      const customMsgs = []
      Object.keys(missing).forEach(function (key) {
        const msg = missing[key]
        if (msg && customMsgs.indexOf(msg) < 0) {
          customMsgs.push(msg)
        }
      })

      const customMsg = customMsgs.length ? '\n' + customMsgs.join('\n') : ''

      usage.fail(__n(
        'Missing required argument: %s',
        'Missing required arguments: %s',
        Object.keys(missing).length,
        Object.keys(missing).join(', ') + customMsg
      ))
    }
  }

  // check for unknown arguments (strict-mode).
  self.unknownArguments = function (argv, aliases, positionalMap) {
    const aliasLookup = {}
    const descriptions = usage.getDescriptions()
    const demandedOptions = yargs.getDemandedOptions()
    const commandKeys = yargs.getCommandInstance().getCommands()
    const unknown = []
    const currentContext = yargs.getContext()

    Object.keys(aliases).forEach(function (key) {
      aliases[key].forEach(function (alias) {
        aliasLookup[alias] = key
      })
    })

    Object.keys(argv).forEach(function (key) {
      if (specialKeys.indexOf(key) === -1 &&
        !descriptions.hasOwnProperty(key) &&
        !demandedOptions.hasOwnProperty(key) &&
        !positionalMap.hasOwnProperty(key) &&
        !yargs._getParseContext().hasOwnProperty(key) &&
        !aliasLookup.hasOwnProperty(key)) {
        unknown.push(key)
      }
    })

    if (commandKeys.length > 0) {
      argv._.slice(currentContext.commands.length).forEach(function (key) {
        if (commandKeys.indexOf(key) === -1) {
          unknown.push(key)
        }
      })
    }

    if (unknown.length > 0) {
      usage.fail(__n(
        'Unknown argument: %s',
        'Unknown arguments: %s',
        unknown.length,
        unknown.join(', ')
      ))
    }
  }

  // validate arguments limited to enumerated choices
  self.limitedChoices = function (argv) {
    const options = yargs.getOptions()
    const invalid = {}

    if (!Object.keys(options.choices).length) return

    Object.keys(argv).forEach(function (key) {
      if (specialKeys.indexOf(key) === -1 &&
        options.choices.hasOwnProperty(key)) {
        [].concat(argv[key]).forEach(function (value) {
          // TODO case-insensitive configurability
          if (options.choices[key].indexOf(value) === -1) {
            invalid[key] = (invalid[key] || []).concat(value)
          }
        })
      }
    })

    const invalidKeys = Object.keys(invalid)

    if (!invalidKeys.length) return

    var msg = __('Invalid values:')
    invalidKeys.forEach(function (key) {
      msg += '\n  ' + __(
        'Argument: %s, Given: %s, Choices: %s',
        key,
        usage.stringifiedValues(invalid[key]),
        usage.stringifiedValues(options.choices[key])
      )
    })
    usage.fail(msg)
  }

  // custom checks, added using the `check` option on yargs.
  var checks = []
  self.check = function (f, global) {
    checks.push({
      func: f,
      global: global
    })
  }

  self.customChecks = function (argv, aliases) {
    for (var i = 0, f; (f = checks[i]) !== undefined; i++) {
      var func = f.func
      var result = null
      try {
        result = func(argv, aliases)
      } catch (err) {
        usage.fail(err.message ? err.message : err, err)
        continue
      }

      if (!result) {
        usage.fail(__('Argument check failed: %s', func.toString()))
      } else if (typeof result === 'string' || result instanceof Error) {
        usage.fail(result.toString(), result)
      }
    }
  }

  // check implications, argument foo implies => argument bar.
  var implied = {}
  self.implies = function (key, value) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.implies(k, key[k])
      })
    } else {
      yargs.global(key)
      implied[key] = value
    }
  }
  self.getImplied = function () {
    return implied
  }

  self.implications = function (argv) {
    const implyFail = []

    Object.keys(implied).forEach(function (key) {
      var num
      const origKey = key
      var value = implied[key]

      // convert string '1' to number 1
      num = Number(key)
      key = isNaN(num) ? key : num

      if (typeof key === 'number') {
        // check length of argv._
        key = argv._.length >= key
      } else if (key.match(/^--no-.+/)) {
        // check if key doesn't exist
        key = key.match(/^--no-(.+)/)[1]
        key = !argv[key]
      } else {
        // check if key exists
        key = argv[key]
      }

      num = Number(value)
      value = isNaN(num) ? value : num

      if (typeof value === 'number') {
        value = argv._.length >= value
      } else if (value.match(/^--no-.+/)) {
        value = value.match(/^--no-(.+)/)[1]
        value = !argv[value]
      } else {
        value = argv[value]
      }

      if (key && !value) {
        implyFail.push(origKey)
      }
    })

    if (implyFail.length) {
      var msg = __('Implications failed:') + '\n'

      implyFail.forEach(function (key) {
        msg += ('  ' + key + ' -> ' + implied[key])
      })

      usage.fail(msg)
    }
  }

  var conflicting = {}
  self.conflicts = function (key, value) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.conflicts(k, key[k])
      })
    } else {
      yargs.global(key)
      conflicting[key] = value
    }
  }
  self.getConflicting = function () {
    return conflicting
  }

  self.conflicting = function (argv) {
    var args = Object.getOwnPropertyNames(argv)

    args.forEach(function (arg) {
      if (conflicting[arg] && args.indexOf(conflicting[arg]) !== -1) {
        usage.fail(__('Arguments %s and %s are mutually exclusive', arg, conflicting[arg]))
      }
    })
  }

  self.recommendCommands = function (cmd, potentialCommands) {
    const distance = require('./levenshtein')
    const threshold = 3 // if it takes more than three edits, let's move on.
    potentialCommands = potentialCommands.sort(function (a, b) { return b.length - a.length })

    var recommended = null
    var bestDistance = Infinity
    for (var i = 0, candidate; (candidate = potentialCommands[i]) !== undefined; i++) {
      var d = distance(cmd, candidate)
      if (d <= threshold && d < bestDistance) {
        bestDistance = d
        recommended = candidate
      }
    }
    if (recommended) usage.fail(__('Did you mean %s?', recommended))
  }

  self.reset = function (localLookup) {
    implied = objFilter(implied, function (k, v) {
      return !localLookup[k]
    })
    conflicting = objFilter(conflicting, function (k, v) {
      return !localLookup[k]
    })
    checks = checks.filter(function (c) {
      return c.global
    })
    return self
  }

  var frozen
  self.freeze = function () {
    frozen = {}
    frozen.implied = implied
    frozen.checks = checks
    frozen.conflicting = conflicting
  }
  self.unfreeze = function () {
    implied = frozen.implied
    checks = frozen.checks
    conflicting = frozen.conflicting
    frozen = undefined
  }

  return self
}

}, function(modId) { var map = {"./obj-filter":1602510872404,"./levenshtein":1602510872406}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872406, function(require, module, exports) {
/*
Copyright (c) 2011 Andrei Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// levenshtein distance algorithm, pulled from Andrei Mackenzie's MIT licensed.
// gist, which can be found here: https://gist.github.com/andrei-m/982927

// Compute the edit distance between the two given strings
module.exports = function (a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  var matrix = []

  // increment along the first column of each row
  var i
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  // increment each column in the first row
  var j
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                Math.min(matrix[i][j - 1] + 1, // insertion
                                         matrix[i - 1][j] + 1)) // deletion
      }
    }
  }

  return matrix[b.length][a.length]
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510872407, function(require, module, exports) {
var fs = require('fs')
var path = require('path')
var assign = require('./assign')
var YError = require('./yerror')

var previouslyVisitedConfigs = []

function checkForCircularExtends (path) {
  if (previouslyVisitedConfigs.indexOf(path) > -1) {
    throw new YError("Circular extended configurations: '" + path + "'.")
  }
}

function getPathToDefaultConfig (cwd, pathToExtend) {
  return path.resolve(cwd, pathToExtend)
}

function applyExtends (config, cwd) {
  var defaultConfig = {}

  if (config.hasOwnProperty('extends')) {
    if (typeof config.extends !== 'string') return defaultConfig
    var isPath = /\.json$/.test(config.extends)
    var pathToDefault = null
    if (!isPath) {
      try {
        pathToDefault = require.resolve(config.extends)
      } catch (err) {
        // most likely this simply isn't a module.
      }
    } else {
      pathToDefault = getPathToDefaultConfig(cwd, config.extends)
    }
    // maybe the module uses key for some other reason,
    // err on side of caution.
    if (!pathToDefault && !isPath) return config

    checkForCircularExtends(pathToDefault)

    previouslyVisitedConfigs.push(pathToDefault)

    defaultConfig = isPath ? JSON.parse(fs.readFileSync(pathToDefault, 'utf8')) : require(config.extends)
    delete config.extends
    defaultConfig = applyExtends(defaultConfig, path.dirname(pathToDefault))
  }

  previouslyVisitedConfigs = []

  return assign(defaultConfig, config)
}

module.exports = applyExtends

}, function(modId) { var map = {"./assign":1602510872401,"./yerror":1602510872400}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510872396);
})()
//# sourceMappingURL=index.js.map