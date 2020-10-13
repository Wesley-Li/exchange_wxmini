module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1602510871162, function(require, module, exports) {


var cp = require('child_process');
var parse = require('./lib/parse');
var enoent = require('./lib/enoent');

var cpSpawnSync = cp.spawnSync;

function spawn(command, args, options) {
    var parsed;
    var spawned;

    // Parse the arguments
    parsed = parse(command, args, options);

    // Spawn the child process
    spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    var parsed;
    var result;

    if (!cpSpawnSync) {
        try {
            cpSpawnSync = require('spawn-sync');  // eslint-disable-line global-require
        } catch (ex) {
            throw new Error(
                'In order to use spawnSync on node 0.10 or older, you must ' +
                'install spawn-sync:\n\n' +
                '  npm install spawn-sync --save'
            );
        }
    }

    // Parse the arguments
    parsed = parse(command, args, options);

    // Spawn the child process
    result = cpSpawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

module.exports = spawn;
module.exports.spawn = spawn;
module.exports.sync = spawnSync;

module.exports._parse = parse;
module.exports._enoent = enoent;

}, function(modId) {var map = {"./lib/parse":1602510871163,"./lib/enoent":1602510871169}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871163, function(require, module, exports) {


var resolveCommand = require('./util/resolveCommand');
var hasEmptyArgumentBug = require('./util/hasEmptyArgumentBug');
var escapeArgument = require('./util/escapeArgument');
var escapeCommand = require('./util/escapeCommand');
var readShebang = require('./util/readShebang');

var isWin = process.platform === 'win32';
var skipShellRegExp = /\.(?:com|exe)$/i;

// Supported in Node >= 6 and >= 4.8
var supportsShellOption = parseInt(process.version.substr(1).split('.')[0], 10) >= 6 ||
 parseInt(process.version.substr(1).split('.')[0], 10) === 4 && parseInt(process.version.substr(1).split('.')[1], 10) >= 8;

function parseNonShell(parsed) {
    var shebang;
    var needsShell;
    var applyQuotes;

    if (!isWin) {
        return parsed;
    }

    // Detect & add support for shebangs
    parsed.file = resolveCommand(parsed.command);
    parsed.file = parsed.file || resolveCommand(parsed.command, true);
    shebang = parsed.file && readShebang(parsed.file);

    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        needsShell = hasEmptyArgumentBug || !skipShellRegExp.test(resolveCommand(shebang) || resolveCommand(shebang, true));
    } else {
        needsShell = hasEmptyArgumentBug || !skipShellRegExp.test(parsed.file);
    }

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    if (needsShell) {
        // Escape command & arguments
        applyQuotes = (parsed.command !== 'echo');  // Do not quote arguments for the special "echo" command
        parsed.command = escapeCommand(parsed.command);
        parsed.args = parsed.args.map(function (arg) {
            return escapeArgument(arg, applyQuotes);
        });

        // Make use of cmd.exe
        parsed.args = ['/d', '/s', '/c', '"' + parsed.command + (parsed.args.length ? ' ' + parsed.args.join(' ') : '') + '"'];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true;  // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parseShell(parsed) {
    var shellCommand;

    // If node supports the shell option, there's no need to mimic its behavior
    if (supportsShellOption) {
        return parsed;
    }

    // Mimic node shell option, see: https://github.com/nodejs/node/blob/b9f6a2dc059a1062776133f3d4fd848c4da7d150/lib/child_process.js#L335
    shellCommand = [parsed.command].concat(parsed.args).join(' ');

    if (isWin) {
        parsed.command = typeof parsed.options.shell === 'string' ? parsed.options.shell : process.env.comspec || 'cmd.exe';
        parsed.args = ['/d', '/s', '/c', '"' + shellCommand + '"'];
        parsed.options.windowsVerbatimArguments = true;  // Tell node's spawn that the arguments are already escaped
    } else {
        if (typeof parsed.options.shell === 'string') {
            parsed.command = parsed.options.shell;
        } else if (process.platform === 'android') {
            parsed.command = '/system/bin/sh';
        } else {
            parsed.command = '/bin/sh';
        }

        parsed.args = ['-c', shellCommand];
    }

    return parsed;
}

// ------------------------------------------------

function parse(command, args, options) {
    var parsed;

    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : [];  // Clone array to avoid changing the original
    options = options || {};

    // Build our parsed object
    parsed = {
        command: command,
        args: args,
        options: options,
        file: undefined,
        original: command,
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parseShell(parsed) : parseNonShell(parsed);
}

module.exports = parse;

}, function(modId) { var map = {"./util/resolveCommand":1602510871164,"./util/hasEmptyArgumentBug":1602510871165,"./util/escapeArgument":1602510871166,"./util/escapeCommand":1602510871167,"./util/readShebang":1602510871168}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871164, function(require, module, exports) {


var path = require('path');
var which = require('which');
var LRU = require('lru-cache');

var commandCache = new LRU({ max: 50, maxAge: 30 * 1000 });  // Cache just for 30sec

function resolveCommand(command, noExtension) {
    var resolved;

    noExtension = !!noExtension;
    resolved = commandCache.get(command + '!' + noExtension);

    // Check if its resolved in the cache
    if (commandCache.has(command)) {
        return commandCache.get(command);
    }

    try {
        resolved = !noExtension ?
            which.sync(command) :
            which.sync(command, { pathExt: path.delimiter + (process.env.PATHEXT || '') });
    } catch (e) { /* empty */ }

    commandCache.set(command + '!' + noExtension, resolved);

    return resolved;
}

module.exports = resolveCommand;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871165, function(require, module, exports) {


// See: https://github.com/IndigoUnited/node-cross-spawn/pull/34#issuecomment-221623455
function hasEmptyArgumentBug() {
    var nodeVer;

    if (process.platform !== 'win32') {
        return false;
    }

    nodeVer = process.version.substr(1).split('.').map(function (num) {
        return parseInt(num, 10);
    });

    return (nodeVer[0] === 0 && nodeVer[1] < 12);
}

module.exports = hasEmptyArgumentBug();

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871166, function(require, module, exports) {


function escapeArgument(arg, quote) {
    // Convert to string
    arg = '' + arg;

    // If we are not going to quote the argument,
    // escape shell metacharacters, including double and single quotes:
    if (!quote) {
        arg = arg.replace(/([()%!^<>&|;,"'\s])/g, '^$1');
    } else {
        // Sequence of backslashes followed by a double quote:
        // double up all the backslashes and escape the double quote
        arg = arg.replace(/(\\*)"/g, '$1$1\\"');

        // Sequence of backslashes followed by the end of the string
        // (which will become a double quote later):
        // double up all the backslashes
        arg = arg.replace(/(\\*)$/, '$1$1');

        // All other backslashes occur literally

        // Quote the whole thing:
        arg = '"' + arg + '"';
    }

    return arg;
}

module.exports = escapeArgument;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871167, function(require, module, exports) {


var escapeArgument = require('./escapeArgument');

function escapeCommand(command) {
    // Do not escape if this command is not dangerous..
    // We do this so that commands like "echo" or "ifconfig" work
    // Quoting them, will make them unaccessible
    return /^[a-z0-9_-]+$/i.test(command) ? command : escapeArgument(command, true);
}

module.exports = escapeCommand;

}, function(modId) { var map = {"./escapeArgument":1602510871166}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871168, function(require, module, exports) {


var fs = require('fs');
var LRU = require('lru-cache');
var shebangCommand = require('shebang-command');

var shebangCache = new LRU({ max: 50, maxAge: 30 * 1000 });  // Cache just for 30sec

function readShebang(command) {
    var buffer;
    var fd;
    var shebang;

    // Check if it is in the cache first
    if (shebangCache.has(command)) {
        return shebangCache.get(command);
    }

    // Read the first 150 bytes from the file
    buffer = new Buffer(150);

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, 150, 0);
        fs.closeSync(fd);
    } catch (e) { /* empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    shebang = shebangCommand(buffer.toString());

    // Store the shebang in the cache
    shebangCache.set(command, shebang);

    return shebang;
}

module.exports = readShebang;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1602510871169, function(require, module, exports) {


var isWin = process.platform === 'win32';
var resolveCommand = require('./util/resolveCommand');

var isNode10 = process.version.indexOf('v0.10.') === 0;

function notFoundError(command, syscall) {
    var err;

    err = new Error(syscall + ' ' + command + ' ENOENT');
    err.code = err.errno = 'ENOENT';
    err.syscall = syscall + ' ' + command;

    return err;
}

function hookChildProcess(cp, parsed) {
    var originalEmit;

    if (!isWin) {
        return;
    }

    originalEmit = cp.emit;
    cp.emit = function (name, arg1) {
        var err;

        // If emitting "exit" event and exit code is 1, we need to check if
        // the command exists and emit an "error" instead
        // See: https://github.com/IndigoUnited/node-cross-spawn/issues/16
        if (name === 'exit') {
            err = verifyENOENT(arg1, parsed, 'spawn');

            if (err) {
                return originalEmit.call(cp, 'error', err);
            }
        }

        return originalEmit.apply(cp, arguments);
    };
}

function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawn');
    }

    return null;
}

function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawnSync');
    }

    // If we are in node 10, then we are using spawn-sync; if it exited
    // with -1 it probably means that the command does not exist
    if (isNode10 && status === -1) {
        parsed.file = isWin ? parsed.file : resolveCommand(parsed.original);

        if (!parsed.file) {
            return notFoundError(parsed.original, 'spawnSync');
        }
    }

    return null;
}

module.exports.hookChildProcess = hookChildProcess;
module.exports.verifyENOENT = verifyENOENT;
module.exports.verifyENOENTSync = verifyENOENTSync;
module.exports.notFoundError = notFoundError;

}, function(modId) { var map = {"./util/resolveCommand":1602510871164}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1602510871162);
})()
//# sourceMappingURL=index.js.map