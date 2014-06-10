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
  utilities = require('fedtools-utilities');


/**
 * Method to be called directly by the main command line library to:
 *    - Extract a packaged WF-RIA2 tarball.
 *    - Run an internal JSP container to serve examples/tests/API.
 *    - Optionaly open the default browser with the corresponding URL.
 *
 *
 * @method serveApi
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
exports.serveApi = function (debug, options, done) {
  var hazJava, tgz = new targz();

  // load content
  options.i18n.loadPhrases(path.resolve(__dirname, '..', 'data', 'i18n', 'wria2-serve'));

  async.waterfall([

    function (callback) {
      hazJava = utilities.isAppInstalled([{
        'name': 'java',
        'error': options.i18n.t('serve.errors.java')
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
        log.error(options.i18n.t('serve.errors.fileIO'), options.file);
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
        log.notice(options.i18n.t('serve.usingExisting'));
        callback(null, destPath);
      } else {
        log.info(options.i18n.t('serve.extracting'));
        tgz.extract(options.file, path.dirname(options.file), function (err) {
          callback(err, destPath);
        });
      }
    },
    function (destPath, callback) {
      var cmdline, url, _afterServerStarted,
        destJar = glob.sync(destPath + '/wria2-documentation-*.jar');

      if (destJar.length > 0) {
        log.info(options.i18n.t('serve.starting'));
        url = 'http://localhost:8090/' + path.basename(destPath) + '/examples/index.html';

        _afterServerStarted = function (url) {
          log.clearPreviousLine();
          log.success(options.i18n.t('serve.serverUp'));
          log.blue(options.i18n.t('serve.serverURL'));
          log.echo(url);
          log.echo();

          utilities.openInBrowser({
            confirm: true,
            url: url,
            message: options.i18n.t('serve.openInDefaultBrowser')
          });
        };

        cmdline = 'java -jar ' +
          path.join(path.basename(destPath), path.basename(destJar[0]));

        cmd.run(cmdline, {
          pwd: path.resolve(destPath, '..'),
          foreground: true,
          verbose: debug,
          status: false,
          trigger: {
            onlyOnce: true,
            regex: new RegExp(/STARTED.*org.eclipse.jetty.server.Server/),
            callback: function () {
              _afterServerStarted(url);
            }
          }
        }, callback);

      } else {
        callback();
      }
    }
  ], function (err) {
    done(err);
  });
};
