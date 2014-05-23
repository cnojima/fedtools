/**
 * Provides the yui3-utils class.
 *
 * @class yui3-utils
 * @static
 * @module fedtools
 */

var path = require('path'),
  fs = require('fs'),
  async = require('async'),
  ncp = require('ncp').ncp,
  log = require('fedtools-logs'),

  utilities = require('./utilities'),
  gith = require('./git-helper'),

  userChoices = {
    branch: '',
    yuiBranch: '',
    wf2Path: '',
    yui3Path: ''
  },
  cwd = process.cwd(),
  tmpDir = utilities.getTemporaryDir(),
  YUI3_CLONE,
  YUI3_EXISTING;

// -- P R O P E R T I E S

/**
 * Use this property in conjunction with _promptForCloneOrExisting.
 *
 * @property YUI3_CLONE
 * @type String
 * @static
 */
YUI3_CLONE = exports.YUI3_CLONE = 'C';
/**
 * Use this property in conjunction with _promptForCloneOrExisting.
 *
 * @property YUI3_EXISTING
 * @type String
 * @static
 */
YUI3_EXISTING = exports.YUI3_EXISTING = 'E';


// -- P U B L I C  M E T H O D S

/**
 * Clone the YUI3 git repository in a temporary folder. If a branch
 * is specified, a shallow clone will happen. This command is
 * verbose by design.
 *
 * @method cloneTemporaryYui
 * @async
 * @param {Object}  options
 * @param {String}  options.url      The YUI git repository URL.
 * @param {String} [options.branch]  The branch to checkout.
 
 * @param {Function} done Callback to execute when done. It gets 2 arguments:
 * @param {String}   done.error     On success, this will be null.
 * @param {String}   done.srcPath   The temporary path to the cloned YUI3
 * repository.
 */
function _cloneTemporaryYui(options, done) {
  var randomName = 'wf2-yui3-' + Math.random().toString(),
    temporaryPath = path.join(tmpDir, randomName);

  gith.cloneGitRepository({
    cloneArgs: (options.branch) ? '--depth 1 --branch ' + options.branch : null,
    cwd: path.resolve(tmpDir),
    verbose: true,
    url: options.url,
    name: randomName
  }, function (err, data) {
    if (!err) {
      done(null, temporaryPath);
    } else {
      done(err, data);
    }
  });
}

/**
 * Copy the `src` YUI3 folder to the WF-RIA2 `wf2/src` folder.
 *
 * @method copyYUItoWF2
 * @async
 * @param {String} yui3Path      The YUI3 local root path.
 * @param {String} wf2Path       The WF2 local root path.
 
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.error     On success, this will be null.
 */
function _copyYUItoWF2(yui3Path, wf2Path, done) {
  var srcPath = path.join(yui3Path, 'src'),
    dstPath = path.join(wf2Path, 'wf2', 'src');
  ncp(srcPath, dstPath, function (err) {
    if (err) {
      log.error(err);
      done(err);
    } else {
      log.success('YUI3 source copied successfully');
      done(null);
    }
  });
}


// -- P R I V A T E  M E T H O D S

function _promptForCloneOrExisting(done) {
  log.echo('Do you have an existing (' +
    YUI3_EXISTING + ') copy of YUI3 or do you want to clone (' +
    YUI3_CLONE + ') a temporary one?');

  utilities.promptAndContinue({
    promptType: utilities.PROMPT_PROMPT,
    promptMsg: 'Please make your choice [' +
      YUI3_CLONE + '|' + YUI3_EXISTING.toLowerCase() + ']:',
    defaultValue: YUI3_CLONE,
    validator: function (value) {
      value = value.toUpperCase();
      if (value !== YUI3_CLONE && value !== YUI3_EXISTING) {
        throw new Error();
      } else {
        return value;
      }
    }
  }, done);
}

function _promptForYUIPath(done) {
  utilities.promptAndContinue({
    promptType: utilities.PROMPT_PROMPT,
    promptMsg: 'Type the path to your local YUI3 repository, or ENTER to use the current path:',
    defaultValue: cwd,
    validator: function (value) {
      value = utilities.resolvePath(value);
      var yuiFile = path.join(value, 'src', 'yui', 'js', 'yui.js');
      if (!fs.existsSync(value) || !fs.existsSync(yuiFile)) {
        log.error('Invalid path, please enter an existing YUI3 path');
        throw new Error();
      } else {
        return value;
      }
    }
  }, done);
}

function _promptForYuiBranch(pkgConfig, done) {
  var msg = 'Type the name of the YUI3 branch you need,' +
    ' or ENTER to use the default';
  utilities.promptAndContinue({
    promptType: utilities.PROMPT_PROMPT,
    promptMsg: msg + ' [wf2-' + pkgConfig.defaultBranch + ']:',
    defaultValue: 'wf2-' + pkgConfig.defaultBranch
  }, done);
}

function _checkForRepoPathValidity(callback) {
  // Let's make sure it's a wria2 git repository...
  var msg = 'Invalid path! Make sure the current path is a wria2 path...';
  gith.findGitRootPath({
    cwd: cwd
  }, function (err, rootPath) {
    if (err) {
      log.fatal(msg);
      callback(-1);
    } else {
      var wf2SrcPath = path.join(rootPath, 'wf2', 'src');
      if (!fs.existsSync(wf2SrcPath)) {
        log.fatal(msg);
        callback(-1);
      } else {
        // valid path
        callback(null, rootPath);
      }
    }
  });
}

function _gatherYuiOptions(verbose, pkgConfig, done) {
  async.waterfall([

    function (callback) {
      _checkForRepoPathValidity(callback);
    },
    function (wf2Path, callback) {
      userChoices.wf2Path = wf2Path;
      _promptForYuiBranch(pkgConfig, function (err, yuiBranch) {
        if (!err && yuiBranch) {
          userChoices.yuiBranch = yuiBranch;
        }
        callback(err);
      });
    },
    function (callback) {
      _promptForCloneOrExisting(callback);
    },
    function (arg, callback) {
      if (arg === YUI3_EXISTING) {
        _promptForYUIPath(callback);
      } else {
        _cloneTemporaryYui({
          branch: userChoices.yuiBranch,
          url: pkgConfig.wria2yui3giturl
        }, function (err, data) {
          callback(err, data);
        });
      }
    }
  ], function (err, yui3Path) {
    done(err, yui3Path);
  });
}

// -- C O M M A N D  L I N E  E N T R Y  P O I N T

/**
 * Helper method supposed to be called only for a command line direct call.
 * It uses several public APIs that can be used independently.
 *
 * It will:
 *    - Prompt the user for some options (location, branch)
 *    - Clone YUI3 in a temporary location
 *    - Copy YUI3 src to WF2 src
 *
 * @method promptAndSync
 * @async
 * @param {Boolean} verbose    True to log stderr/stdout.
 * @param {Object}  pkgConfig  Object holding package.json 'config' properties.
 
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.error     On success, this will be null.
 */
exports.promptAndSync = function (verbose, pkgConfig, done) {
  async.waterfall([

    function (callback) {
      _gatherYuiOptions(verbose, pkgConfig, callback);
    },
    function (yui3Path, callback) {
      log.echo();
      log.echo('Spinning wheels, please be patient...');
      _copyYUItoWF2(yui3Path, userChoices.wf2Path, callback);
    }

  ], function (err) {
    done(err);
  });
};

exports.cloneTemporaryYui = _cloneTemporaryYui;
exports.copyYUItoWF2 = _copyYUItoWF2;
