/*jshint mocha:true*/
/*global expect,build,wria2Bootstrap,appBootstrap,serve,modules*/

describe('build#api', function () {
  it('should be a function', function () {
    expect(build.run).to.be.a('function');
  });
});

describe('wria2-bootstrap#api', function () {
  it('should be a function', function () {
    expect(wria2Bootstrap.bootstrapRepository).to.be.a('function');
  });
});

describe('serve#api', function () {
  it('should be a function', function () {
    expect(serve.serveApi).to.be.a('function');
  });
});

describe('modules#api', function () {
  it('should be a function', function () {
    expect(modules.run).to.be.a('function');
  });
});

describe('appBootstrap#api', function () {
  it('should be a function', function () {
    expect(appBootstrap.run).to.be.a('function');
  });
});
