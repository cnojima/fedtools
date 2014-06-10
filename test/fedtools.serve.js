/*jshint mocha:true, expr:true*/
/*global expect,serve,i18n,logs*/

var path = require('path'),
  fs = require('fs'),
  rimraf = require('rimraf');

describe('wria2-serve#war', function () {
  var extractedFolder = path.resolve(__dirname, 'mockdata', 'example'),
    extractedTarFile = path.resolve(extractedFolder, 'wria2-documentation-giberish.jar');

  // set i18n
  i18n.loadPhrases(path.resolve(__dirname, '..', 'data', 'i18n', 'wria2-serve'));

  beforeEach(function () {
    // remove the extracted folder if any
    rimraf.sync(extractedFolder);
  });

  it('should be a function', function () {
    expect(serve.serveApi).to.be.a('function');
  });

  it('should return an error if the file is missing', function (done) {
    // silence!
    logs.silent = true;
    serve.private.checkForFile({
      file: 'not-a-file',
      i18n: i18n
    }, function (err) {
      expect(err).to.equal(1);
      logs.silent = false;
      done();
    });
  });

  it('should return no error if the file is found', function (done) {
    // silence!
    logs.silent = true;
    serve.private.checkForFile({
      file: path.resolve(__dirname, 'mockdata', 'example-package.tar.gz'),
      i18n: i18n
    }, function (err) {
      expect(err).to.be.null;
      logs.silent = false;
      done();
    });
  });

  it('should extract the file if the folder doesn\'t exist yet', function (done) {
    // silence!
    logs.silent = true;
    // make sure the file doesn't exists
    expect(fs.existsSync(extractedTarFile)).to.be.false;
    serve.private.extractTarball({
      file: path.resolve(__dirname, 'mockdata', 'example-package.tar.gz'),
      i18n: i18n
    }, function (err) {
      expect(err).to.be.null;
      expect(fs.existsSync(extractedTarFile)).to.be.true;
      logs.silent = false;
      done();
    });
  });

  it('should not extract the file if the folder already exist', function (done) {
    logs.silent = true; // hide stdout, we just need events
    // make sure the file does exists
    serve.private.extractTarball({
      file: path.resolve(__dirname, 'mockdata', 'example-package.tar.gz'),
      i18n: i18n
    }, function (err) {
      expect(err).to.be.null;
      expect(fs.existsSync(extractedTarFile)).to.be.true;
      // then try to extract again
      logs.once('logging', function (level, output) {
        var expectedMessage = i18n.t('serve.usingExisting');
        expect(output.rawMessage).to.match(new RegExp(expectedMessage));
        logs.silent = false;
        done();
      });
      serve.private.extractTarball({
        file: path.resolve(__dirname, 'mockdata', 'example-package.tar.gz'),
        i18n: i18n
      }, function (err) {
        expect(err).to.be.null;
        expect(fs.existsSync(extractedTarFile)).to.be.true;
      });
    });


  });

});
