#!/usr/bin/env node

/**
 * This is the internal Fedtools API documentation. It is not intended to be
 * used by Fedtools users, but rather by Fedtools developers.
 * It is an easily accessible repository of all the methods
 * available in one centralized document (automatically generated
 * via yuidoc).
 *
 * @module fedtools
 */

var fs = require('fs'),
  path = require('path'),
  log = require('fedtools-logs'),
  utilities = require('fedtools-utilities'),
  i18n = require('fedtools-i18n'),
  notifier = require('fedtools-notifier'),

  build = require('../lib/wria2-build'),

  program,
  argv,
  debug = false,
  remote = false,
  write = true,
  command = '',
  packageFileJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')),
  pkgVersion = packageFileJson.version,
  pkgConfig = packageFileJson.config,
  pkgName = packageFileJson.name,

  commandList = [],
  fedToolsCommands = {};

// load common phrases
i18n.loadPhrases(path.resolve(__dirname, '..', 'data', 'i18n', 'common'));

fedToolsCommands = {
  'af': {
    'full': 'app-flow',
    'description': i18n.t('commands.af')
  },
  'ai': {
    'full': 'app-init',
    'description': i18n.t('commands.ai')
  },
  'bump': {
    'description': i18n.t('commands.bump')
  },
  'war': {
    'full': 'wria2-war',
    'description': i18n.t('commands.war')
  },
  'wss': {
    'full': 'wria2-sel',
    'description': i18n.t('commands.wss')
  },
  'wa': {
    'full': 'wria2-api',
    'description': i18n.t('commands.wa')
  },
  'ws': {
    'full': 'wria2-soy',
    'description': 'Build all the Soy templates.'
  },
  'wi': {
    'full': 'wria2-init',
    'description': i18n.t('commands.wi')
  },
  'wb': {
    'full': 'wria2-build',
    'description': i18n.t('commands.wb')
  },
  'ww': {
    'full': 'wria2-watch',
    'description': i18n.t('commands.ww')
  },
  'wy': {
    'full': 'wria2-yui3',
    'description': i18n.t('commands.wy')
  },
  'wm': {
    'full': 'wria2-mod',
    'description': i18n.t('commands.wm')
  },
  'serve': {
    'description': i18n.t('commands.serve')
  }
};

for (var prop in fedToolsCommands) {
  if (fedToolsCommands.hasOwnProperty(prop) && prop) {
    commandList.push(prop);
  }
}
commandList.sort();

function showParametersHelp() {
  log.echo(i18n.t('prompt.parameters'));

  var cmdtmp, cmdtmplen, cmdt, cmdl, cmdd, cmddlen, i, j,
    len = commandList.length,
    descArray, descArrayLen,
    buffer = '',
    CMD_PRE_BUFFER = '    ',
    CMD_MAX_LEN = 22,
    CMD_DESC_MAX = 50;
  log.echo(new Array(CMD_MAX_LEN + CMD_DESC_MAX + 1).join('─'));

  for (i = 0; i < len; i += 1) {
    cmdt = commandList[i];
    cmdl = fedToolsCommands[commandList[i]].full;
    cmdd = fedToolsCommands[commandList[i]].description;

    if (cmdl) {
      cmdtmp = CMD_PRE_BUFFER + cmdt + ' (' + cmdl + ')';
    } else {
      cmdtmp = CMD_PRE_BUFFER + cmdt;
    }
    cmdtmplen = cmdtmp.length;
    cmddlen = cmdd.length;

    buffer = cmdtmp + new Array(CMD_MAX_LEN - cmdtmplen + 1).join(' ');
    descArray = utilities.wordWrap(cmdd, CMD_DESC_MAX);

    console.log(log.strToColor('cyan', buffer) + descArray[0]);
    descArrayLen = descArray.length;
    for (j = 1; j < descArrayLen; j += 1) {
      console.log(new Array(CMD_MAX_LEN + 1).join(' ') + descArray[j]);
    }
    console.log(new Array(CMD_MAX_LEN + CMD_DESC_MAX + 1).join('─'));
  }
}

function displayHelp() {
  console.log(argv.help());
  showParametersHelp();
  process.exit(0);
}

argv = require('optimist')
  .usage('\nUsage: ' + pkgName + ' [options] ' + commandList.join('|'))
  .alias('h', 'help')
  .describe('h', i18n.t('help.h'))
  .alias('v', 'version')
  .describe('v', i18n.t('help.v'))
  .alias('b', 'boring')
  .describe('b', i18n.t('help.b'))
  .alias('d', 'debug')
  .describe('d', i18n.t('help.d'))
  .boolean(['b', 'd', 'V', 'v', 'h', 'n']);

program = argv.argv;

/*******************/
/* Parsing options */
/*******************/
if (program.help) {
  displayHelp();
}

if (program.version || program.V) {
  console.log(pkgVersion);
  process.exit(0);
}

if (program.boring) {
  log.boring = true;
}

if (program.debug) {
  debug = true;
  log.verbose = true;
}

/**************************/
/* Parsing hidden options */
/**************************/
if (program.r || program.remote) {
  remote = true;
  log.remote = true;
}

if (program.write !== undefined && program.write === false) {
  write = false;
}

// Other hidden options for remote action (building a WAR file).
// These options are hidden because users should not use them.
// They are only intended for the remote fedtools job that runs on
// the Jenkins server.
// -e [email]       The email where notifications should be sent
// -u [username]    The username (fork) of the repository to extract
// -w [wria-branch] The WF-RIA2 branch to build
// -y [yui-branch]  The YUI3 branch to use for the build
// -S               Prints the status of all current WAR jobs
// -A               Adds a jenkins WAR job to the queue
// -R               Removes a jenkins WAR job from the queue
// -P               Runs the oldest WAR job from the queue if no other is running

/********************/
/* Parsing commands */
/********************/
if (program._.length === 0 || program._.length > 1) {
  displayHelp();
} else {
  command = program._[0];
}

// Debug if needed
log.debug('program: ', program);
log.debug('command: ', command);

/*******************/
/* Geronimo!       */
/*******************/
switch (command) {
case 'app-flow':
case 'af': // hidden menu
  var app = require('../lib/app-bootstrap');
  log.echo();
  app.run(app.TYPE_FLOW, function (err) {
    if (err && err !== -1) {
      log.echo(err);
    }
  });
  break;

case 'app-init':
case 'ai': // hidden menu
  var app = require('../lib/app-bootstrap');
  utilities.timeTracker('start');
  log.echo();
  app.run(app.TYPE_APP, function (err) {
    if (err && err !== -1) {
      log.echo(err);
    }
    if (err !== -1) {
      utilities.timeTracker('stop');
    }
  });
  break;

case 'wria2-bump':
case 'bump':
case 'wbp': // hidden menu
  log.echo();
  utilities.wria2bump(function () {});
  break;

case 'wria2-selleck':
case 'wria2-sel':
case 'wss': // hidden menu
  log.echo();
  build.run(debug, {
    type: build.TYPE_SERVER,
    server: build.SERVER_TYPE_SELLECK
  }, function () {});
  break;

case 'wria2-api':
case 'wa': // hidden menu
  log.echo();
  build.run(debug, {
    type: build.TYPE_SERVER,
    server: build.SERVER_TYPE_YUIDOC
  }, function () {});
  break;

case 'wria2-soy':
case 'ws': // hidden menu
  log.echo();
  build.run(debug, {
    cwd: process.cwd(),
    prompt: true,
    type: build.TYPE_SOY
  }, function (err) {
    if (err && err !== -1) {
      log.echo(err);
    }
  });
  break;

case 'wria2-watch':
case 'ww': // hidden menu
  log.echo();
  build.run(debug, {
    cwd: process.cwd(),
    prompt: true,
    type: build.TYPE_WATCH
  }, function (err) {
    if (err && err !== -1) {
      log.echo(err);
    }
  });
  break;

case 'wria2-war':
case 'war': // hidden menu
case 'tar': // hidden menu
case 'tgz': // hidden menu
  utilities.timeTracker('start');
  log.echo();
  build.run(debug, {
    i18n: i18n,
    write: write,
    remote: remote,
    username: program.u,
    useremail: program.e,
    wriaBranch: program.w,
    yuiBranch: program.y,
    statusJob: program.S,
    addJob: program.A,
    removeJob: program.R,
    processJob: program.P,
    pkgConfig: pkgConfig,
    cwd: process.cwd(),
    prompt: true,
    type: build.TYPE_WAR
  }, function (err, msg) {
    if (err && err !== -1) {
      log.echo(err);
      process.exit(127);
    }
    if (!remote) {
      if (!err) {
        notifier.notify({
          message: (typeof msg === 'string') ? msg : i18n.t('results.build.success'),
          sound: 'Glass'
        });
        utilities.timeTracker('stop');
      }
      log.echo();
    }
  });
  break;

case 'wria2-build':
case 'wb': // hidden menu
  utilities.timeTracker('start');
  log.echo();
  build.run(debug, {
    cwd: process.cwd(),
    prompt: true,
    type: build.TYPE_BUILD
  }, function (err, stderr) {
    if (err && err !== -1) {
      notifier.notify({
        message: i18n.t('results.build.error'),
        sound: 'Blow'
      });
      log.echo(stderr);
    }
    if (!err) {
      notifier.notify({
        message: i18n.t('results.build.success'),
        sound: 'Glass'
      });
      utilities.timeTracker('stop');
    }
    log.echo();
  });
  break;

case 'wria2-init':
case 'wi': // hidden menu
  log.echo();
  require('../lib/wria2-bootstrap').bootstrapRepository(debug, pkgConfig, function (err) {
    if (err) {
      notifier.notify({
        message: i18n.t('results.bootstrap.error'),
        sound: 'Blow'
      });
      log.error(err);
    } else {
      notifier.notify({
        message: i18n.t('results.bootstrap.success'),
        sound: 'Glass'
      });
    }
    log.echo();
  });
  break;

case 'wria2-yui3':
case 'wy': // hidden menu
  log.echo();
  utilities.yui3.promptAndSync(debug, pkgConfig, function (err) {
    if (err && err !== -1) {
      log.error(err);
    }
    log.echo();
  });
  break;

case 'wria2-mod':
case 'wm': // hidden menu
  log.echo();
  require('../lib/wria2-modules').run(function () {});
  break;

case 'serve':
case 'server': // hidden menu
  if (!program.f) {
    log.echo(i18n.t('prompt.serve.usage', {
      command: command
    }));
    break;
  } else {
    log.echo();
    require('../lib/wria2-serve').serveApi(debug, {
      file: program.f,
      i18n: i18n
    }, function () {});
  }
  break;

  // case 'test':
case 'wt':

  break;

default:
  displayHelp();
  break;
}
