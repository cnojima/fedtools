var build = require('../lib/wria2-build'),
  wria2Bootstrap = require('../lib/wria2-bootstrap'),
  serve = require('../lib/wria2-serve'),
  modules = require('../lib/wria2-modules'),
  appBootstrap = require('fedtools-apps'),
  war = require('../lib/wria2-package'),
  logs = require('fedtools-logs'),
  utilities = require('fedtools-utilities'),
  i18n = require('fedtools-i18n'),
  chai = require('chai');

chai.should();

global.build = build;
global.wria2Bootstrap = wria2Bootstrap;
global.appBootstrap = appBootstrap;
global.serve = serve;
global.modules = modules;
global.logs = logs;
global.war = war;
global.utilities = utilities;
global.i18n = i18n;

global.expect = chai.expect;
