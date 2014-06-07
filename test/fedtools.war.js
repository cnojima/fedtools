/*jshint mocha:true, expr:true*/
/*global expect,war,logs*/

var _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  mkdirp = require('mkdirp'),
  warJobQueueFile = path.join(__dirname, 'mockdata', 'war.json');

describe('build#war', function () {

  // create mockdata folder if needed
  mkdirp(path.join(__dirname, 'mockdata'));

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

});
