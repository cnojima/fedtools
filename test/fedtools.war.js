/*jshint mocha:true, expr:true*/
/*global expect,war,logs,utilities*/

var _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  mkdirp = require('mkdirp'),
  warJobQueueFile = path.join(__dirname, 'mockdata', 'war.json');

describe('build#war', function () {

  // create mockdata folder if needed
  var mockdataDir = path.join(__dirname, 'mockdata'),
    tmpDir = utilities.getTemporaryDir();
  mkdirp.sync(mockdataDir);

  beforeEach(function () {
    // remove the file
    rimraf.sync(warJobQueueFile);
  });

  it('should be a function', function () {
    expect(war.processRemoteCommands).to.be.a('function');
  });
  it('should be a function', function () {
    expect(war.processLocalCommands).to.be.a('function');
  });

  it('should add a job to an empty queue', function (done) {
    var res, jobs;

    // add the job
    war.private.addJobToQueue(warJobQueueFile, {
      username: 'arno',
      useremail: 'toto@titi.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    }, function () {
      expect(fs.existsSync(warJobQueueFile)).to.be.true;
      jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
      expect(jobs).to.be.an('Array');
      expect(jobs.length).to.equal(1);

      // checking if the job exists
      res = _.find(jobs, function (obj) {
        if (obj.username === 'arno' &&
          obj.useremail === 'toto@titi.fr' &&
          obj.wriaBranch === 'some-branch' &&
          obj.yuiBranch === 'some-yui-branch') {
          return true;
        }
      });
      expect(res).to.be.an('Object');
      done();
    });
  });

  it('should append a job to an existing queue', function (done) {
    var res, jobs = [];

    // create the file
    jobs.push({
      username: 'arno',
      useremail: 'toto@titi.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    });
    fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));

    // add the job
    war.private.addJobToQueue(warJobQueueFile, {
      username: 'eva',
      useremail: 'tata@tutu.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    }, function () {
      expect(fs.existsSync(warJobQueueFile)).to.be.true;
      jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
      expect(jobs).to.be.an('Array');
      expect(jobs.length).to.equal(2);

      // checking if the job exists
      res = _.find(jobs, function (obj) {
        if (obj.username === 'eva' &&
          obj.useremail === 'tata@tutu.fr' &&
          obj.wriaBranch === 'some-branch' &&
          obj.yuiBranch === 'some-yui-branch') {
          return true;
        }
      });
      expect(res).to.be.an('Object');
      done();
    });
  });

  it('should not add the same job twice', function (done) {
    var res, jobs = [];

    // silence!
    logs.silent = true;

    // create the file
    jobs.push({
      username: 'arno',
      useremail: 'toto@titi.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    });
    fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));

    // add the job
    war.private.addJobToQueue(warJobQueueFile, {
      username: 'arno',
      useremail: 'toto@titi.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    }, function () {
      expect(fs.existsSync(warJobQueueFile)).to.be.true;
      jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
      expect(jobs).to.be.an('Array');
      expect(jobs.length).to.equal(1);

      // checking if the job exists
      res = _.find(jobs, function (obj) {
        if (obj.username === 'arno' &&
          obj.useremail === 'toto@titi.fr' &&
          obj.wriaBranch === 'some-branch' &&
          obj.yuiBranch === 'some-yui-branch') {
          return true;
        }
      });
      expect(res).to.be.an('Object');
      logs.silent = false;
      done();
    });
  });

  it('should remove a job from an existing queue', function (done) {
    var res, jobs = [];

    // create the file
    jobs.push({
      username: 'arno',
      useremail: 'toto@titi.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    });
    fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));

    // remove the job
    war.private.removeJobFromQueue(warJobQueueFile, {
      username: 'arno',
      useremail: 'toto@titi.fr',
      wriaBranch: 'some-branch',
      yuiBranch: 'some-yui-branch',
      queueTime: new Date()
    }, true, function () {
      expect(fs.existsSync(warJobQueueFile)).to.be.true;
      jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
      expect(jobs).to.be.an('Array');
      expect(jobs.length).to.equal(0);

      // checking if the job exists
      res = _.find(jobs, function (obj) {
        if (obj.username === 'arno' &&
          obj.useremail === 'toto@titi.fr' &&
          obj.wriaBranch === 'some-branch' &&
          obj.yuiBranch === 'some-yui-branch') {
          return true;
        }
      });
      expect(res).to.be.undefined;
      done();
    });
  });

  it('should generate a temporary folder for the user', function (done) {
    war.private.generateTemporaryFolderName({
      username: 'my-name-is-bond'
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(data.tmpBuildDirName).to.equal('build_tmp_my-name-is-bond');
      done(err);
    });
  });

  it('should remove the user\'s temporary folder', function (done) {
    // silence!
    logs.silent = true;
    // need to create a user temporary folder
    var tmpClonePath = path.join(tmpDir, 'build_tmp_temporary-folder-tester');
    mkdirp.sync(tmpClonePath);
    expect(fs.existsSync(tmpClonePath)).to.be.true;

    // then use the API to remove that user sub-folder
    war.private.removeTemporaryFolder({
      tmpClonePath: tmpClonePath
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(fs.existsSync(tmpClonePath)).to.be.false;
      logs.silent = false;
      done(err);
    });
  });

  it('should clone WF-RIA repository to a temporary folder', function (done) {
    var tmpClonePath = path.join(tmpDir, 'some-folder');
    // silence!
    logs.silent = true;
    war.private.shallowCloneWFRIA({
      write: false,
      tmpBuildDirName: 'some-folder'
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(fs.existsSync(tmpClonePath)).to.be.true;
      // cleanup
      rimraf.sync(tmpClonePath);
      logs.silent = false;
      done(err);
    });
  });

  it('should find a WAR file, move it and remove the job from the queue (remote)', function (
    done) {
    var tmpClonePath = path.join(mockdataDir, '' + parseInt(Math.random() * 100000)),
      targetDir = path.join(tmpClonePath, 'wt2', 'wria2-documentation', 'target'),
      sha = '123',
      wriaBranch = 'some-branch',
      username = 'some-username',
      yuiBranch = 'some-special-yui-branch',
      fileName = sha + '-' + wriaBranch + '-' + username + '.war',
      res, jobs = [];

    // silence!
    logs.silent = true;

    mkdirp.sync(targetDir);
    fs.writeFileSync(path.join(targetDir, fileName), '');
    expect(fs.existsSync(path.join(targetDir, fileName))).to.be.true;
    expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.false;

    // create the file
    jobs.push({
      username: 'user1',
      useremail: 'toto@titi.fr',
      wriaBranch: wriaBranch,
      yuiBranch: yuiBranch,
      queueTime: new Date()
    }, {
      username: username,
      useremail: 'toto@titi.fr',
      wriaBranch: wriaBranch,
      yuiBranch: yuiBranch,
      queueTime: new Date()
    }, {
      username: 'user2',
      useremail: 'toto@titi.fr',
      wriaBranch: wriaBranch,
      yuiBranch: yuiBranch,
      queueTime: new Date()
    });
    fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));

    war.private.postMavenBuild({
      write: false,
      remote: true,
      tmpClonePath: tmpClonePath,
      sha: sha,
      wriaBranch: wriaBranch,
      username: username,
      warJobQueueFile: warJobQueueFile
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
      expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.true;
      expect(fs.existsSync(warJobQueueFile)).to.be.true;

      jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
      expect(jobs).to.be.an('Array');
      expect(jobs.length).to.equal(2);

      // checking if the job exists
      res = _.find(jobs, function (obj) {
        if (obj.username === username &&
          obj.wriaBranch === wriaBranch &&
          obj.yuiBranch === yuiBranch) {
          return true;
        }
      });
      expect(res).to.be.undefined;

      // cleanup
      rimraf.sync(tmpClonePath);
      logs.silent = false;
      done(err);
    });
  });

  it('should find a TGZ file, move it and remove the job from the queue (remote)', function (
    done) {
    var tmpClonePath = path.join(mockdataDir, '' + parseInt(Math.random() * 100000)),
      targetDir = path.join(tmpClonePath, 'wt2', 'wria2-documentation', 'target'),
      sha = '123',
      wriaBranch = 'some-branch',
      username = 'some-username',
      yuiBranch = 'some-special-yui-branch',
      fileName = sha + '-' + wriaBranch + '-' + username + '-package.tar.gz',
      res, jobs = [];

    // silence!
    logs.silent = true;

    mkdirp.sync(targetDir);
    fs.writeFileSync(path.join(targetDir, fileName), '');
    expect(fs.existsSync(path.join(targetDir, fileName))).to.be.true;
    expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.false;

    // create the file
    jobs.push({
      username: 'user1',
      useremail: 'toto@titi.fr',
      wriaBranch: wriaBranch,
      yuiBranch: yuiBranch,
      queueTime: new Date()
    }, {
      username: username,
      useremail: 'toto@titi.fr',
      wriaBranch: wriaBranch,
      yuiBranch: yuiBranch,
      queueTime: new Date()
    }, {
      username: 'user2',
      useremail: 'toto@titi.fr',
      wriaBranch: wriaBranch,
      yuiBranch: yuiBranch,
      queueTime: new Date()
    });
    fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));

    war.private.postMavenBuild({
      write: false,
      remote: true,
      tmpClonePath: tmpClonePath,
      sha: sha,
      wriaBranch: wriaBranch,
      username: username,
      warJobQueueFile: warJobQueueFile
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
      expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.true;
      expect(fs.existsSync(warJobQueueFile)).to.be.true;

      jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
      expect(jobs).to.be.an('Array');
      expect(jobs.length).to.equal(2);

      // checking if the job exists
      res = _.find(jobs, function (obj) {
        if (obj.username === username &&
          obj.wriaBranch === wriaBranch &&
          obj.yuiBranch === yuiBranch) {
          return true;
        }
      });
      expect(res).to.be.undefined;

      // cleanup
      rimraf.sync(tmpClonePath);
      logs.silent = false;
      done(err);
    });
  });

  it('should find a WAR file and move it (local)', function (done) {
    var tmpClonePath = path.join(mockdataDir, '' + parseInt(Math.random() * 100000)),
      targetDir = path.join(tmpClonePath, 'wt2', 'wria2-documentation', 'target'),
      sha = '123',
      wriaBranch = 'some-branch',
      username = 'some-username',
      fileName = sha + '-' + wriaBranch + '-' + username + '.war';

    // silence!
    logs.silent = true;

    mkdirp.sync(targetDir);
    fs.writeFileSync(path.join(targetDir, fileName), '');
    expect(fs.existsSync(path.join(targetDir, fileName))).to.be.true;
    expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.false;

    war.private.postMavenBuild({
      write: false,
      remote: false,
      tmpClonePath: tmpClonePath,
      sha: sha,
      wriaBranch: wriaBranch,
      username: username,
      warJobQueueFile: warJobQueueFile
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
      expect(fs.existsSync(path.join(process.cwd(), fileName))).to.be.true;

      // cleanup
      rimraf.sync(tmpClonePath);
      rimraf.sync(path.join(process.cwd(), fileName));
      logs.silent = false;
      done(err);
    });
  });

  it('should find a TGZ file and move it (local)', function (done) {
    var tmpClonePath = path.join(mockdataDir, '' + parseInt(Math.random() * 100000)),
      targetDir = path.join(tmpClonePath, 'wt2', 'wria2-documentation', 'target'),
      sha = '123',
      wriaBranch = 'some-branch',
      username = 'some-username',
      fileName = sha + '-' + wriaBranch + '-' + username + '-package.tar.gz';

    // silence!
    logs.silent = true;

    mkdirp.sync(targetDir);
    fs.writeFileSync(path.join(targetDir, fileName), '');
    expect(fs.existsSync(path.join(targetDir, fileName))).to.be.true;
    expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.false;

    war.private.postMavenBuild({
      write: false,
      remote: false,
      tmpClonePath: tmpClonePath,
      sha: sha,
      wriaBranch: wriaBranch,
      username: username,
      warJobQueueFile: warJobQueueFile
    }, function (err, data) {
      expect(data).to.be.an('Object');
      expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
      expect(fs.existsSync(path.join(process.cwd(), fileName))).to.be.true;

      // cleanup
      rimraf.sync(tmpClonePath);
      rimraf.sync(path.join(process.cwd(), fileName));
      logs.silent = false;
      done(err);
    });
  });

  it('should not find a WAR file and return an error code (local)', function (done) {
    var tmpClonePath = path.join(mockdataDir, '' + parseInt(Math.random() * 100000)),
      targetDir = path.join(tmpClonePath, 'wt2', 'wria2-documentation', 'target'),
      sha = '123',
      wriaBranch = 'some-branch',
      username = 'some-username',
      fileName = sha + '-' + wriaBranch + '-' + username + '.war';

    // silence!
    logs.silent = true;

    mkdirp.sync(targetDir);
    // fs.writeFileSync(path.join(targetDir, fileName), '');
    expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
    expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.false;

    war.private.postMavenBuild({
      write: false,
      remote: false,
      tmpClonePath: tmpClonePath,
      sha: sha,
      wriaBranch: wriaBranch,
      username: username,
      warJobQueueFile: warJobQueueFile
    }, function (err, data) {
      expect(data).to.be.undefined;
      expect(err).to.equal(127);
      expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
      expect(fs.existsSync(path.join(process.cwd(), fileName))).to.be.false;

      // cleanup
      rimraf.sync(tmpClonePath);
      rimraf.sync(path.join(process.cwd(), fileName));
      logs.silent = false;
      done();
    });
  });

  it('should not find a TGZ file and return an error code (local)', function (done) {
    var tmpClonePath = path.join(mockdataDir, '' + parseInt(Math.random() * 100000)),
      targetDir = path.join(tmpClonePath, 'wt2', 'wria2-documentation', 'target'),
      sha = '123',
      wriaBranch = 'some-branch',
      username = 'some-username',
      fileName = sha + '-' + wriaBranch + '-' + username + '-package.tar.gz';

    // silence!
    logs.silent = true;

    mkdirp.sync(targetDir);
    // fs.writeFileSync(path.join(targetDir, fileName), '');
    expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
    expect(fs.existsSync(path.join(tmpClonePath, fileName))).to.be.false;

    war.private.postMavenBuild({
      write: false,
      remote: false,
      tmpClonePath: tmpClonePath,
      sha: sha,
      wriaBranch: wriaBranch,
      username: username,
      warJobQueueFile: warJobQueueFile
    }, function (err, data) {
      expect(data).to.be.undefined;
      expect(err).to.equal(127);
      expect(fs.existsSync(path.join(targetDir, fileName))).to.be.false;
      expect(fs.existsSync(path.join(process.cwd(), fileName))).to.be.false;

      // cleanup
      rimraf.sync(tmpClonePath);
      rimraf.sync(path.join(process.cwd(), fileName));
      logs.silent = false;
      done();
    });
  });

});
