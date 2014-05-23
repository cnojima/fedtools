/**
 * Provides the git-helper class.
 *
 * @class git-helper
 * @static
 * @module fedtools
 */

var _ = require('underscore'),
  cmd = require('fedtools-commands');

/**
 * Helper method to execute a git command and trap the result.
 *
 * @method _runGitCommand
 * @private
 * @param {String} cmdline  A git command line.
 * @param {Object} options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
function _runGitCommand(cmdline, options, done) {
  cmd.run(cmdline, {
    pwd: options.cwd,
    status: (_.isBoolean(options.silent)) ? !options.silent : false,
    verbose: (options.verbose) ? true : false
  }, function (err, stderr, stdout) {
    if (!err && stdout) {
      stdout = stdout.toString().replace(/\n$/, '');
    }
    done(err, stdout);
  });
}

/**
 * Extract the most recent local SHA.
 *
 * @method getCurrentSHA
 * @async
 * @param {Object} options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {String}  [options.short=false]   Flag to get the short or full SHA.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.getCurrentSHA = function (options, done) {
  var cmdline = (options && options.short) ? 'git log --pretty=format:%h -1' :
    'git log --pretty=format:%H -1';
  _runGitCommand(cmdline, options, done);
};

/**
 * Checks out a branch (fetching before in case the branch is not known locally yet).
 *
 * Runs `git fetch && git checkout <branch>`
 *
 * @method checkoutBranch
 * @async
 * @param {Object} options
 * @param {String}  options.branch          The branch to checkout.
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.checkoutBranch = function (options, done) {
  _runGitCommand('git fetch', options, function () {
    _runGitCommand('git checkout ' + options.branch, options, done);
  });
};

/**
 * Clones a git repository.
 *
 * Runs `git clone [options]`
 *
 * @method cloneGitRepository
 * @async
 * @param {Object} options
 * @param {String}  options.url             The git repository URL.
 * @param {String}  options.cwd             The path where to run the command.
 * @param {String}  [options.cloneArgs]     Possible options to be passed to the clone command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.cloneGitRepository = function (options, done) {
  var cmdClone = 'git clone';
  if (options && options.cloneArgs) {
    cmdClone = cmdClone.trim() + ' ' + options.cloneArgs.trim();
  }
  _runGitCommand(cmdClone.trim() + ' ' + options.url.trim() + ' ' + (options.name.trim() || ''),
    options, done);
};

/**
 * Runs `git fetch`
 *
 * @method gitFetchLatestFromOrigin
 * @async
 * @param {Object} options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.gitFetchLatestFromOrigin = function (options, done) {
  _runGitCommand('git fetch', options, done);
};

/**
 * Add the provided URL as the 'upstream' remote.
 *
 * Runs `git remote add upstream options.url`
 *
 * @method gitAddUpstreamRemote
 * @async
 * @param {Object} options
 * @param {String}  options.url             The upstream URL.
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.gitAddUpstreamRemote = function (options, done) {
  _runGitCommand('git remote add upstream ' + options.url, options, done);
};

/**
 * Checks if the current path is a git repository.
 *
 * Runs `git symbolic-ref HEAD`
 *
 * @method isGitRepository
 * @async
 * @param {Object} options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.isGitRepository = function (options, done) {
  _runGitCommand('git symbolic-ref HEAD', options, done);
};

/**
 * Find the current branch of a git repository.
 *
 * Runs `git rev-parse --abbrev-ref HEAD`
 *
 * @method getCurrentBranch
 * @async
 * @param {Object} options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.getCurrentBranch = function (options, done) {
  _runGitCommand('git rev-parse --abbrev-ref HEAD', options, done);
};

/**
 * Finds the root path of a git repository.
 *
 * Runs `git rev-parse --show-toplevel`
 *
 * @method findGitRootPath
 * @async
 * @param {Object} options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.findGitRootPath = function (options, done) {
  _runGitCommand('git rev-parse --show-toplevel', options, done);
};
