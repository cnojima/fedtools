/**
 * Deprecated APIs. Use at your own risk.
 *
 * @class deprecated
 * @static
 * @module fedtools
 */
var utilities = require('fedtools-utilities'),
  log = require('fedtools-logs'),
  cmd = require('fedtools-commands'),

  cwd = process.cwd(),
  TYPE_SERVER = 'Server',
  SERVER_TYPE_SELLECK = 'selleck',
  SERVER_TYPE_YUIDOC = 'yuidoc',
  servers = {};

exports.TYPE_SERVER = TYPE_SERVER;
exports.SERVER_TYPE_SELLECK = SERVER_TYPE_SELLECK;
exports.SERVER_TYPE_YUIDOC = SERVER_TYPE_YUIDOC;

servers[SERVER_TYPE_SELLECK] = {
  'name': 'Selleck',
  'command': 'selleck',
  'args': '-s -p wf2-common/docs/',
  'url': 'http://localhost:3000'
};
servers[SERVER_TYPE_YUIDOC] = {
  'name': 'YUI docs',
  'command': 'yuidoc',
  'args': '. --server 3030 -c .yuidoc.json -N',
  'url': 'http://localhost:3030'
};

exports.startServer = function (verbose, silent, options, done) {
  utilities.getWF2srcPath({
    cwd: (options && options.cwd) ? options.cwd : cwd
  }, function (err, wf2srcPath) {
    if (err) {
      // nothing we can do there...
      log.error('The current path cannot be served. Is it a wria2 path?');
      log.echo();
      done(-1);
    } else {
      var name = servers[options.server].name,
        command = servers[options.server].command,
        args = servers[options.server].args,
        url = servers[options.server].url,
        _afterServerStarted;

      _afterServerStarted = function (url) {
        log.success('Local server is up. Type CTRL+C to stop it.');
        log.blue('URL is now available here:');
        log.echo(url);
        log.echo();

        utilities.openInBrowser({
          confirm: true,
          url: url,
          message: 'Open it in your default browser?'
        });
      };

      if (options && options.args) {
        args = options.args;
      }

      cmd.run(command + ' ' + args, {
        pwd: wf2srcPath,
        foreground: true,
        trigger: {
          regex: (options.server === SERVER_TYPE_SELLECK) ? new RegExp(/Ferrari rides/) : new RegExp(
            /Starting server/),
          callback: function () {
            _afterServerStarted(url);
          }
        },
        verbose: true,
        name: name
      }, done);
    }
  });
};
