/**
 * Provides the wria2-serve class.
 *
 * @class wria2-serve
 * @static
 * @module fedtools
 */

var async = require('async'),
  fs = require('fs'),
  glob = require('glob'),
  path = require('path'),
  targz = require('tar.gz'),

  cmd = require('fedtools-commands'),
  log = require('fedtools-logs'),

  utilities = require('./utilities');


/**
 * Method to be called directly by the main command line library to:
 *    - Extract a packaged WF-RIA2 tarball.
 *    - Run an internal JSP container to serve examples/tests/API.
 *    - Optionaly open the default browser with the corresponding URL.
 *
 *
 * @method serve
 * @async
 * @param {Boolean} debug  True to display stderr/stdout in the console.
 * @param {Object} options
 * @param {String}  options.file The path+filename of the WF-RIA2 tarball or the
 *                               name of the already extracted folder.
 *
 * @param {Function}  done Callback to execute when done. It gets 2 arguments:
 * @param {String}    done.error Not null if there is a problem with the command.
 * @param {String}    done.stdOut The resulting output string without the trailing \n
 */
exports.serve = function (debug, options, done) {
  var hazJava, tgz = new targz();

  async.waterfall([

    function (callback) {
      hazJava = utilities.isAppInstalled([{
        'name': 'java',
        'error': 'Couldn\'t find Java... Please install it and try again'
      }]);
      if (hazJava) {
        callback();
      } else {
        log.echo();
        callback(1);
      }
    },
    function (callback) {
      if (!fs.existsSync(options.file)) {
        log.error('File is unreadable: ', options.file);
        log.echo();
        callback(1);
      } else {
        callback();
      }
    },
    function (callback) {
      var destPath = path.resolve(path.dirname(options.file), path.basename(options.file,
        '-package.tar.gz'));
      if (fs.existsSync(destPath)) {
        log.notice('Using existing extracted tar...');
        callback(null, destPath);
      } else {
        log.info('Extracting tarball...');
        tgz.extract(options.file, path.dirname(options.file), function (err) {
          callback(err, destPath);
        });
      }
    },
    function (destPath, callback) {
      var cmdline, url, _afterServerStarted,
        destJar = glob.sync(destPath + '/wria2-documentation-*.jar');

      if (destJar.length > 0) {
        log.info('Starting local server on port 8090...');
        url = 'http://localhost:8090/' + path.basename(destPath) + '/examples/index.html';

        _afterServerStarted = function (url) {
          var cmdline, msg;

          log.echo();
          log.blue('Local URL is now available here:');
          log.echo(url);
          log.echo();

          switch (process.platform) {
          case 'darwin':
          case 'linux':
            cmdline = 'open ' + url;
            break;
          case 'win32':
            cmdline = 'start ' + url;
            break;
          }

          if (cmdline) {
            msg = 'Open it in your default browser? [Y|n]';
            utilities.promptAndContinue({
              promptType: utilities.PROMPT_CONFIRM,
              promptMsg: msg,
              defaultValue: true
            }, function (err, value) {
              if (value) {
                log.echo('Opening...');
                cmd.run(cmdline, {
                  detached: true,
                  verbose: false,
                  status: false
                }, function () {});
              } else {
                log.echo('Bye then...');
              }
            });
          }
        };

        setTimeout(function () {
          _afterServerStarted(url);
        }, 2000);


        cmdline = 'java -jar ' +
          path.join(path.basename(destPath), path.basename(destJar[0]));

        cmd.run(cmdline, {
          pwd: path.resolve(destPath, '..'),
          foreground: true,
          verbose: debug,
          status: false
        }, function () {});

      }

      callback();


    }
  ], function (err) {
    done(err);
  });


};
