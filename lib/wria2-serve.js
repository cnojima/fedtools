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

// -- P R I V A T E  M E T H O D S

function _checkForFile(options, done) {
  if (!fs.existsSync(options.file)) {
    log.error(options.i18n.t('serve.errors.fileIO'), options.file);
    log.echo();
    done(1);
  } else {
    done(null, options);
  }
}

function _extractTarball(options, done) {
  var tgz = new targz();
  options.destPath = path.resolve(path.dirname(options.file),
    path.basename(options.file, '-package.tar.gz'));
  if (fs.existsSync(options.destPath)) {
    // already extracted
    log.notice(options.i18n.t('serve.usingExisting'));
    done(null, options);
  } else {
    // need to extract
    log.info(options.i18n.t('serve.extracting'));
    tgz.extract(options.file, path.dirname(options.file), function (err) {
      done(err, options);
    });
  }
}

function _startServer(options, done) {
  var cmdline, url, _afterServerStarted,
    destJar = glob.sync(options.destPath + '/wria2-documentation-*.jar');

  if (destJar.length > 0) {
    log.info(options.i18n.t('serve.starting'));
    url = 'http://localhost:8090/' + path.basename(options.destPath) +
      '/examples/index.html';

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
      path.basename(options.destPath) + '/' + path.basename(destJar[0]);

    cmd.run(cmdline, {
      pwd: path.resolve(options.destPath, '..'),
      foreground: true,
      verbose: options.debug,
      status: false,
      trigger: {
        onlyOnce: true,
        regex: new RegExp(/STARTED.*org.eclipse.jetty.server.Server/),
        callback: function () {
          _afterServerStarted(url);
        }
      }
    }, done);

  } else {
    done();
  }
}

// -- P U B L I C  M E T H O D S

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

  // save debug option
  options.debug = debug;

  // load content
  options.i18n.loadPhrases(path.resolve(__dirname, '..', 'data', 'i18n', 'wria2-serve'));

  function _checkForJava(done) {
    var hazJava = utilities.isAppInstalled([{
      'name': 'java',
      'error': options.i18n.t('serve.errors.java')
    }]);
    if (hazJava) {
      done(null, options);
    } else {
      log.echo();
      done(1);
    }
  }
  async.waterfall([
    _checkForJava,
    _checkForFile,
    _extractTarball,
    _startServer
  ], function (err) {
    done(err);
  });
};

exports.private = {
  checkForFile: _checkForFile,
  extractTarball: _extractTarball
};
