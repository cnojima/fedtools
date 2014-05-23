/**
 * Utilities methods that can be used by multiple modules.
 *
 * @class utilities
 * @static
 * @module fedtools
 */
var _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  findit = require('findit'),
  treeify = require('treeify'),
  os = require('osenv'),
  log = require('fedtools-logs'),
  cmd = require('fedtools-commands'),

  timeTrackerStart,
  fedtoolsEnvRcFile,
  fedtoolsRcKeys,

  PROMPT_PASSWORD = 'password',
  PROMPT_CONFIRM = 'confirm',
  PROMPT_PROMPT = 'prompt',

  ALIVE_SIGNAL = 0,
  KILL_SIGNAL = 'SIGINT';

fedtoolsEnvRcFile = path.join(process.env.HOME, '.fedtoolsrc');

exports.FEDTOOLSRCKEYS = fedtoolsRcKeys = {
  username: 'username',
  useremail: 'useremail',
  userbranch: 'userbranch',
  yuibranch: 'yuibranch'
};


// -- P R O P E R T I E S

/**
 * Use this signal to check if a process is running.
 *
 * @property ALIVE_SIGNAL
 * @type String
 * @static
 */
exports.ALIVE_SIGNAL = ALIVE_SIGNAL;
/**
 * Use this signal to kill a running process.
 *
 * @property KILL_SIGNAL
 * @type String
 * @static
 */
exports.KILL_SIGNAL = KILL_SIGNAL;
/**
 * Use this property in conjunction with promptAndContinue.
 *
 * @property PROMPT_PASSWORD
 * @type String
 * @static
 */
exports.PROMPT_PASSWORD = PROMPT_PASSWORD;
/**
 * Use this property in conjunction with promptAndContinue.
 *
 * @property PROMPT_CONFIRM
 * @type String
 * @static
 */
exports.PROMPT_CONFIRM = PROMPT_CONFIRM;
/**
 * Use this property in conjunction with promptAndContinue.
 *
 * @property PROMPT_PROMPT
 * @type String
 * @static
 */
exports.PROMPT_PROMPT = PROMPT_PROMPT;

// -- P R I V A T E  M E T H O D S

function _objectSort(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  var keys = Object.keys(obj).sort(),
    o = {};
  keys.forEach(function (i) {
    o[i] = _objectSort(obj[i]);
  });
  return o;
}


// -- P U B L I C  M E T H O D S

/**
 * Start or stop a timer.
 * Stopping the timer will also log the result in minutes, seconds and milliseconds.
 * The default introductory text ('Elapsed time:') can be overridden.
 *
 * @method timeTracker
 * @param {String} type    The timeTracker action type ('start' or 'stop')
 * @param {String} [label] The introductory text to display when the timer stops.
 * Default to "Elapsed time: "
 *
 * @example
 *     utilities.timeTracker('start');
 *     longRunningTask();
 *     utilities.timeTracker('stop');
 */

exports.timeTracker = function (type, label) {
  if (type === 'start') {
    timeTrackerStart = process.hrtime();
  }
  if (type === 'stop') {
    var precision = 3,
      elapsedTotal = process.hrtime(timeTrackerStart)[0] * 1000 + process.hrtime(
        timeTrackerStart)[1] / 1000000,
      duration = require('moment').duration(elapsedTotal, 'milliseconds'),
      arrElapse = [
        duration.get('minutes') ? duration.get('minutes') + 'm' : '',
        duration.get('seconds') ? duration.get('seconds') + 's' : '',
        duration.get('ms') ? duration.get('ms').toFixed(precision) + 'ms' : ''
      ],
      intro = label ? label : 'Elapsed time: ';

    log.echo(intro + _.compact(arrElapse).join(', '));

    // reset the timer
    timeTrackerStart = process.hrtime();
  }
};

/**
 * Finds the `wf2/src` path of a wria2 git repository.
 *
 * @method getWF2srcPath
 * @async
 * @param {Object}  options
 * @param {String}  options.cwd             The path where to run the command.
 * @param {Boolean} [options.silent=false]  If true, do no log the command line.
 * @param {Boolean} [options.verbose=false] If true, log stderr/stdout.
 
 * @param {Function} done Callback to execute when done. It gets 2 arguments:
 * @param {String}   done.error     On success, this will be null.
 * @param {String}   done.srcPath   The path to wf2/src of the wria2 repository.
 */

function _getWF2srcPath(options, done) {
  var srcPath;
  require('./git-helper').findGitRootPath(options, function (err, rootPath) {
    if (err) {
      done(err);
    } else {
      srcPath = path.join(rootPath, 'wf2', 'src');
      if (fs.existsSync(srcPath)) {
        done(null, srcPath);
      } else {
        done(1);
      }
    }
  });
}

/**
 * Provides a helper method to display a prompt and expect an answer.
 * Depending on the type of prompt requested, it will either accept
 * a simple Y/y/yes or N/n/no answer, or a more complex validation
 * scheme (that can be passed via the configuration).
 *
 * @method promptAndContinue
 * @async
 * @param {Object}   config
 * @param {String}   [config.infoMsg]    A heading message to be displayed
 *                                                  before the actual prompt.
 * @param {String}   config.promptType   PROMPT_PASSWORD PROMPT_CONFIRM PROMPT_PROMPT
 * @param {String}   config.promptMsg    The prompt message (it will end with an input caret).
 * @param {String}   [config.defaultValue] A default value in case the user presses ENTER.
 * @param {Function} [config.validator]    A function to validate the user input passed as
 * argument. Throw an error to invalidate the user entry and prompt again or return a value
 * (which could be what the user entered or a modified version of it).
 *
 * @param {Function} done Callback to execute when done. It gets 2 arguments:
 * @param {String}   done.error     On success, this will be null.
 * @param {String}   done.value     The value the user entered, or the default value, or the
 *                                  value returned by the validator function.
 *
 * @example
 *     utilities.promptAndContinue({
 *       promptType: utilities.PROMPT_PROMPT,
 *       promptMsg: 'Type an existing path where you want to clone, or ENTER to use the current path:',
 *       defaultValue: process.cwd(),
 *       validator: function (value) {
 *         var pathForClone;
 *         value = utilities.resolvePath(value);
 *         pathForClone = path.resolve(value);
 *         if (!fs.existsSync(pathForClone)) {
 *           log.error('Invalid path: ', value);
 *           // prompt again
 *           throw new Error();
 *         } else {
 *           return pathForClone;
 *         }
 *       }
 *     }, callback);
 *
 *     utilities.promptAndContinue({
 *      promptType: utilities.PROMPT_CONFIRM,
 *      promptMsg: 'Do you want to clone the wria2 git repository locally? [Y|n]',
 *      defaultValue: true
 *     }, callback);
 *
 *     utilities.promptAndContinue({
 *       promptType: utilities.PROMPT_PASSWORD,
 *       promptMsg: msg,
 *       validator: function (value) {
 *         if (value === '') {
 *           throw new Error();
 *         } else {
 *           return value;
 *         }
 *       }
 *     }, function (err, value) {
 *       if (value) {
 *         userChoices.jenkinsuserpassword = value;
 *       }
 *       callback();
 *     });
 */
function _promptAndContinue(config, done) {
  var prompt = require('promptly');

  if (config.infoMsg) {
    log.info(config.infoMsg);
    log.echo();
  }
  if (config.promptType === PROMPT_PASSWORD) {
    prompt.prompt(config.promptMsg, {
      validator: config.validator,
      silent: true
    }, done);
  } else if (config.promptType === PROMPT_CONFIRM) {
    prompt.confirm(config.promptMsg, {
      'default': (config.defaultValue !== undefined) ? config.defaultValue : false
    }, done);
  } else if (config.promptType === PROMPT_PROMPT) {
    if (config.defaultValue !== undefined) {
      prompt.prompt(config.promptMsg, {
        'default': config.defaultValue,
        validator: config.validator,
      }, done);
    } else {
      prompt.prompt(config.promptMsg, {
        validator: config.validator,
      }, done);
    }

  }
}

/**
 * Resolve a path and replace "~" with $HOME if needed
 *
 * @method resolvePath
 * @param {String} pathString A path that can contain '~'.
 * @return {String} A resolved path.
 */
exports.resolvePath = function (pathString) {
  var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  return path.resolve(pathString.replace('~', home));
};

/**
 * Generates a string representing a tree of the folder structure passed
 * in argument.
 *
 * @method parseTree
 * @async
 * @param {String} start The path to parse.
 * @param {String} root The root path to base the tree from.
 *
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.tree    A string representing a tree.
 */
exports.parseTree = function (start, root, done) {
  var finder = findit(start),
    tree = {};

  finder.on('path', function (file, stat) {
    var relativePath = path.relative(start, file),
      node = tree,
      parts = relativePath.split(path.sep);

    if (relativePath.indexOf('..') !== 0) {
      parts.forEach(function (part, key) {
        if (key < (parts.length - 1) || stat.isDirectory()) {
          part += path.sep;
        }
        if (typeof node[part] !== 'object') {
          node[part] = {};
        }
        node = node[part];
      });
    }
  });

  finder.on('end', function () {
    tree = _objectSort(tree);
    var str = treeify.asTree(tree, true),
      out = '',
      rel = path.relative(path.join(root, '../'), start),
      len = rel.split(path.sep)[0].length,
      pad = function (str) {
        for (var i = 0; i <= len; i += 1) {
          str = ' ' + str;
        }
        str = str.replace('─', '──');
        return str;
      };

    str = str.split('\n');

    out += '   ' + rel + '\n';
    str.forEach(function (s) {
      out += '   ' + pad(s) + '\n';
    });
    done(out);
  });
};

/**
 * Checks if the current OS is Windows based.
 *
 * @method isWindows
 * @return {Boolean} True on if the OS is Windows.
 */
exports.isWindows = function () {
  return (process.platform === 'win32');
};

/**
 * Wrap a string given a maximum length, trying not to break words.
 *
 * @method wordWrap
 * @param  {String} str The string to wrap
 * @param  {String} [width=75] The maximum length of the desired width.
 * @return {String} The wrapped string.
 */
exports.wordWrap = function (str, width) {
  var regex;

  width = width || 75;
  if (!str) {
    return str;
  }
  regex = '.{1,' + width + '}(\\s|$)|\\S+?(\\s|$)';
  return str.match(new RegExp(regex, 'g'));
};

/**
 * Transform a string to setCamelCase.
 *
 * @method setCamelCase
 * @param  {String} input The string to convert to camelCase.
 * @return {String} The input string converted into camelCase format.
 */
exports.setCamelCase = function (input) {
  var str = input.toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Runs `npm install` in the provided folder if `node_modules` doesn't exist.
 *
 * @method installLocalNpmPackages
 * @async
 * @param {String} srcPath The path where a package.json file exists.
 *
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.error On success, this will be null.
 */
exports.installLocalNpmPackages = function (srcPath, done) {
  var nodeModulesPath = path.join(srcPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    cmd.run('npm install', {
      status: true,
      verbose: false,
      pwd: srcPath
    }, function (err) {
      if (err) {
        log.error('Unable to install npm packages!');
        done(err);
      } else {
        done(null);
      }
    });
  } else {
    done(null);
  }
};

/**
 * Finds a temporary folder based on the OS. If /repo exists,
 * it will be used on Linux/Mac.
 *
 * @method getTemporaryDir
 * @return {String} Path to a temporary folder.
 */
exports.getTemporaryDir = function () {
  var osTmpDir, tmpDir;

  // forcing /repo or /tmp on linux and mac
  if (process.platform === 'linux' || process.platform === 'darwin') {
    if (fs.existsSync('/repo')) {
      osTmpDir = '/repo';
    } else {
      osTmpDir = '/tmp';
    }
  } else {
    osTmpDir = os.tmpdir();
  }
  tmpDir = path.join(osTmpDir, 'fedtools-tmp');
  if (!fs.existsSync(tmpDir)) {
    require('mkdirp').sync(tmpDir);
  }
  return tmpDir;
};

/**
 * Finds the HOME directory based on the OS.
 *
 * @method getHomeDir
 * @return {String} Path to the home directory.
 */
exports.getHomeDir = function () {
  return os.home();
};

/**
 * Helper method to update the framework version string in all the relevant files.
 * It updates `.shifter.json` and uses Maven for the rest.
 * This method must be run within a WF-RIA2 folder.
 * It will display the current version and prompt the user to enter a new one.
 *
 * __NOTE__: local combo loader
 *
 * if the user enters 'build' or 'combo', the `replace-wf2_combopath` key in the
 * `.shifter.json` file will be updated with `../../../wria/combo?basePath=build&`
 *
 * @method wria2bump
 * @async
 *
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.error On success, this will be null.
 */
exports.wria2bump = function (done) {
  var msg = 'Type the new version number you want to set: ',
    shifterCfg, currentVersion;

  _getWF2srcPath({
    cwd: process.cwd()
  }, function (err, srcPath) {
    if (!err && srcPath) {
      var shifterJsonFile = path.join(srcPath, '.shifter.json');

      if (!fs.existsSync(shifterJsonFile)) {
        log.error('Ooops! It looks like you\'re missing a .shifter.json configuration file!');
        done(-1);
      } else {
        shifterCfg = JSON.parse(fs.readFileSync(shifterJsonFile, 'utf8'));
        currentVersion = shifterCfg['replace-wf2_version'];
        log.info('The current version is: ', currentVersion);

        _promptAndContinue({
          promptType: PROMPT_PROMPT,
          promptMsg: msg
        }, function (err, newVersion) {
          shifterCfg['replace-wf2_version'] = newVersion;
          // special combo loader
          // if version is 'build' or 'combo', replace
          // ../../../wria/combo?basePath=@WF2_VERSION@/build&
          // with
          // ../../../wria/combo?basePath=build&
          if (newVersion === 'build' || newVersion === 'combo') {
            shifterCfg['replace-wf2_combopath'] = '../../../wria/combo?basePath=build&';
          } else
          if (shifterCfg['replace-wf2_combopath'] ===
            '../../../wria/combo?basePath=build&') {
            log.notice('Restoring replace-wf2_combopath...');
            shifterCfg['replace-wf2_combopath'] =
              '../../../wria/combo?basePath=@WF2_VERSION@/build&';
          }
          fs.writeFileSync(shifterJsonFile, JSON.stringify(shifterCfg, null, 2));

          require('async').waterfall([

            function (callback) {
              var cmdline = 'mvn versions:set -DnewVersion=' + newVersion +
                ' -DgenerateBackupPoms=false';
              cmd.run(cmdline, {
                pwd: path.join(srcPath, '..', '..')
              }, function (err) {
                callback(err);
              });
            }
          ], function (err) {
            if (!err) {
              log.echo();
              log.info('All files have been updated with the new version.');
              log.info('Make sure it looks fine, then stage, commit and push!');
              log.info('You can commit by typing the following:');
              log.echo();
              log.echo('git commit -am "Version bump to ' + newVersion + '. NO TICKET"');
              log.echo();
            }
            done(err);
          });

        });
      }

    } else {
      log.error('Is the current folder a wria2 path?');
      log.echo();
      done(-1);
    }
  });
};

/**
 * Checks if a program or a list of programs are available.
 *
 * @method isAppInstalled
 * @param {Array|Object} options An object or an array of objects.
 * @param {String} options.name The name of the program to check.
 * @param {String} options.error An optional error message to display if
 *                              the given program cannot be found.
 * @return {Boolean} True on success (all programs are available).
 *
 * @example
 *     utilities.isAppInstalled([{
 *       name: 'mvn',
 *       error: 'Maven is not installed on this machine'
 *     }, {
 *       name: 'java',
 *       error: 'Java cannot be executed on this machine'
 *     }]);
 */
exports.isAppInstalled = function (options) {
  var cmdline, tmpRes, result = true;

  if (options && !_.isArray(options)) {
    options = [options];
  }
  options.forEach(function (option) {
    if (process.platform === 'win32') {
      cmdline = option.name + ' -h';
    } else {
      cmdline = 'type ' + option.name;
    }
    tmpRes = cmd.run([cmdline], {
      status: false,
      verbose: false
    });
    if (tmpRes.code !== 0 && option.error) {
      log.error(option.error);
      result = false;
    }
  });
  return result;
};

/**
 * Helper method to download a file over ssh.
 *
 * @method downloadFileOverSSH
 * @async
 * @param {Object} options
 * @param {String} options.srcFile    The remote file path + name.
 * @param {String} options.dstFile    The local file path + name.
 * @param {String} options.username   Username to ssh to the remote host.
 * @param {String} options.password   Password of the username.
 * @param {String} options.host       The remote hostname.
 * @param {String} [options.port=22]  The remote ssh port.
 *
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.error    On success, this will be null.
 */
exports.downloadFileOverSSH = function (options, done) {
  var readStream, writeStream, fs = require('fs'),
    Connection = require('ssh2'),
    c = new Connection();

  c.on(
    'ready',
    function () {
      c.sftp(
        function (err, sftp) {
          if (err) {
            log.error('Error, problem starting SFTP: %s', err);
            done(err);
          }

          readStream = sftp.createReadStream(options.srcFile);
          writeStream = fs.createWriteStream(options.dstFile);

          // what to do when transfer finishes
          writeStream.on(
            'close',
            function () {
              sftp.end();
              c.end();
            }
          );

          // initiate transfer of file
          readStream.pipe(writeStream);
        }
      );
    }
  );

  c.on(
    'error',
    function (err) {
      log.error('Connection error: %s', err);
      done(err);
    }
  );

  c.on(
    'end',
    function () {
      done();
    }
  );

  c.connect({
    host: options.host,
    port: options.port || 22,
    username: options.username,
    password: options.password
  });
};

/**
 * Helper method to send a POSIX signal to a running process.
 *
 * @method sendSignal
 * @param  {String|Number} pid   The recipient process id.
 * @param  {String}        signal The signal to send.
 * @return {Boolean} True on success.
 */
exports.sendSignal = function (pid, signal) {
  try {
    return process.kill(pid, signal);
  } catch (e) {
    return false;
  }
};

/**
 * Helper method to send an email. It is hard coded to use the local WF SMTP host.
 *
 * @method sendEmail
 * @async
 * @param {Object} options
 * @param {String} options.attachments  The path + filename of a local file to attach.
 * @param {String} options.from         The email 'From' field.
 * @param {String|Array} options.to     The email 'To' field (can be a string or an array of string).
 * @param {String} options.subject      The email 'Subject' field.
 * @param {String} options.htmlBody     The email 'Body' field in HTML format.
 *
 * @param {Function} done Callback to execute when done. It gets 1 argument:
 * @param {String}   done.error    On success, this will be null.
 */
exports.sendEmail = function (options, done) {
  // create reusable transport method (opens pool of SMTP connections)
  var mailOptions,
    smtpTransport,
    attachments,
    nodemailer = require('nodemailer');

  if (process.env.FEDTOOLS_PASSWORD) {
    smtpTransport = nodemailer.createTransport('SMTP', {
      service: 'Gmail',
      auth: {
        user: 'wfportal@gmail.com',
        pass: process.env.FEDTOOLS_PASSWORD
      }
    });
  } else {
    smtpTransport = nodemailer.createTransport('SMTP', {
      host: 'cpowhl.wellsfargo.com'
    });
  }

  if (options.attachments) {
    attachments = [{
      filePath: options.attachments
    }];
  }

  // setup e-mail data with unicode symbols
  mailOptions = {
    from: options.from || 'Fedtools <arno.versini@wellsfargo.com>',
    to: options.to,
    subject: options.subject,
    html: options.htmlBody,
    attachments: attachments ? attachments : [],
    generateTextFromHTML: true
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function (error) {
    if (error) {
      log.red(error);
    }
    smtpTransport.close(); // shut down the connection pool, no more messages
    done();
  });
};

/**
 * Helper method to set a user fedtools configuration into the global fedtools
 * configuration file. This file is located in the current user home directory.
 *
 * @method fedtoolsRcSet
 * @param {String} key    A valid fedtools key (ex: username, useremail, etc.)
 * @param {String} value  The value to set the key to.
 */
exports.fedtoolsRcSet = function (key, value) {
  if (_.contains(fedtoolsRcKeys, key)) {
    var json = {};
    if (fs.existsSync(fedtoolsEnvRcFile)) {
      json = JSON.parse(fs.readFileSync(fedtoolsEnvRcFile, 'utf8'));
    }
    json[key] = value;
    fs.writeFileSync(fedtoolsEnvRcFile, JSON.stringify(json, null, 2));
  }
};

/**
 * Helper method to get a user fedtools configuration from the global fedtools
 * configuration file. This file is located in the current user home directory.
 *
 * @method fedtoolsRcGet
 * @param {String}  key    A valid fedtools key (ex: username, useremail, etc.)
 * @return {string} The value corresponding to the key or undefined if not found.
 */
exports.fedtoolsRcGet = function (key) {
  var json = {};
  if (_.contains(fedtoolsRcKeys, key)) {
    if (fs.existsSync(fedtoolsEnvRcFile)) {
      json = JSON.parse(fs.readFileSync(fedtoolsEnvRcFile, 'utf8'));
    }
  }
  return json[key];
};

/**
 * Helper method to move a file. It uses pipes to circumvent the `mv` limits on
 * temporary folders (like /tmp).
 *
 * @method copyThenEraseSync
 * @param {String} src The source path + file to move.
 * @param {String} dst The destination path + file.
 */
exports.copyThenEraseSync = function (src, dst) {
  var is = fs.createReadStream(src),
    os = fs.createWriteStream(dst);

  is.pipe(os);
  is.on('end', function () {
    fs.unlinkSync(src);
  });
};

exports.unicorn = function () {
  // var unicornAscii = fs.readFileSync(path.join(__dirname, '..', 'data', 'unicorn.txt'), 'utf8');
  // log.echo();
  // log.echo(unicornAscii);
  // log.echo();
  return;
};

exports.getWF2srcPath = _getWF2srcPath;
exports.promptAndContinue = _promptAndContinue;
