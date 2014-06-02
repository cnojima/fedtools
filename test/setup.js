var build = require('../lib/wria2-build'),
  wria2Bootstrap = require('../lib/wria2-bootstrap'),
  serve = require('../lib/wria2-serve'),
  modules = require('../lib/wria2-modules'),
  appBootstrap = require('../lib/app-bootstrap'),
  logs = require('fedtools-logs'),
  chai = require('chai');

chai.should();

global.build = build;
global.wria2Bootstrap = wria2Bootstrap;
global.appBootstrap = appBootstrap;
global.serve = serve;
global.modules = modules;
global.logs = logs;

global.expect = chai.expect;
