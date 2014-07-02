var _ = require('underscore'),
  async = require('async'),
  mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  mustache = require('mustache'),
  moment = require('moment'),
  rimraf = require('rimraf'),
  cmd = require('fedtools-commands'),
  log = require('fedtools-logs'),
  utilities = require('fedtools-utilities'),
  gith = utilities.git,
  yui3 = utilities.yui3,

  tmpDir = utilities.getTemporaryDir(),
  runDir = path.join(tmpDir, 'run'),

  emailHeaderTpl = fs.readFileSync(path.join(__dirname, '..',
    'data', 'templates', 'war', 'header.mustache'), 'utf8'),
  emailFooterTpl = fs.readFileSync(path.join(__dirname, '..',
    'data', 'templates', 'war', 'footer.mustache'), 'utf8'),

  REMOTE_ADD = 'a',
  REMOTE_REMOVE = 'r',
  REMOTE_STATUS = 's',
  TYPE_WAR_BUILD_REMOTE = 'j',
  TYPE_WAR_BUILD_LOCAL = 'l',
  JOB_ETA_MINUTES = 15,
  PACKAGE_BUILD_TYPE = {
    WAR: 'war',
    TAR: 'tar'
  };


// -- P R I V A T E  M E T H O D S

function _sendErrorEmail(options, done) {
  var htmlBodytpl = fs.readFileSync(path.join(__dirname,
    '..', 'data', 'templates', 'war', 'error.mustache'), 'utf8');

  if (options.remote) {
    utilities.sendEmail({
      to: options.useremail + ', arno.versini@wellsfargo.com',
      subject: options.i18n.t('email.subject', {
        status: '[ FAILED ]'
      }),
      attachments: (options.attachments) ? options.attachments : null,
      htmlBody: mustache.render(htmlBodytpl, {
        msg: (options.msg) ? options.msg : ''
      }, {
        header: emailHeaderTpl,
        footer: emailFooterTpl
      })
    }, done);
  }
}

function _addJobToQueue(warJobQueueFile, options, done) {
  var msg, totalJobs, res, htmlBodytpl,
    jobs = [],
    now = new Date();

  if (fs.existsSync(warJobQueueFile)) {
    jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
    // checking if this job already exists
    res = _.find(jobs, function (obj) {
      if (obj.username === options.username &&
        obj.wriaBranch === options.wriaBranch) {
        return true;
      }
    });
    if (res) {
      log.notice(options.i18n.t('The same job already exists!'));
      done();
      return;
    }
  }

  // keep track of how many jobs are in the current jobs list
  totalJobs = jobs.length;

  // need to create a job that doesn't exit
  jobs.push({
    username: options.username,
    useremail: options.useremail,
    wriaBranch: options.wriaBranch,
    yuiBranch: options.yuiBranch,
    queueTime: now
  });
  fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));

  // job has been scheduled, we're done here.
  // need to send an email to notify the user,
  // but let's not wait for it...
  done();

  if (totalJobs <= 0) {
    msg = options.i18n.t('Your job is the first in the queue! ');
  } else {
    msg = options.i18n.t('totalJobsBefore', totalJobs);
  }

  msg += ' ' + options.i18n.t('maxWaitTime', {
    minutes: parseInt(JOB_ETA_MINUTES * (totalJobs + 1), 10)
  });

  htmlBodytpl = fs.readFileSync(path.join(__dirname,
    '..', 'data', 'templates', 'war',
    'addjobtoqueue.mustache'), 'utf8');

  log.debug('msg: ', msg);

  utilities.sendEmail({
    to: options.useremail,
    subject: options.i18n.t('email.subject', {
      status: '[ SCHEDULED ]'
    }),
    htmlBody: mustache.render(htmlBodytpl, {
      username: options.username,
      wriaBranch: options.wriaBranch,
      yuiBranch: options.yuiBranch,
      msg: msg
    }, {
      header: emailHeaderTpl,
      footer: emailFooterTpl
    })
  }, function () {});
}

function _removeJobFromQueue(warJobQueueFile, options, dontCheckIfAlive, done) {
  var jobs, job, index;
  if (fs.existsSync(warJobQueueFile)) {
    jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));

    // loop through all jobs
    job = _.find(jobs, function (obj, key) {
      if (obj.username === options.username &&
        obj.wriaBranch === options.wriaBranch) {
        index = key;
        return true;
      }
    });

    if (job) {
      if (!dontCheckIfAlive && job.pid) {
        // check if it's still running...
        if (utilities.sendSignal(job.pid, utilities.ALIVE_SIGNAL)) {
          // it's alive! kill it!
          utilities.sendSignal(job.pid, utilities.KILL_SIGNAL);
        }
        // removing the job from the file
        jobs.splice(index, 1);
        fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));
      } else {
        if (jobs[index]) {
          jobs.splice(index, 1);
          fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));
        }
      }
    } else {
      log.notice(options.i18n.t('Job does not exist'));
    }
  }

  if (typeof done === 'function') {
    done();
  }
}

function _checkJobFromQueue(warJobQueueFile, options, done) {
  var jobs = [];

  if (fs.existsSync(warJobQueueFile)) {
    jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));
    if (jobs.length > 0) {
      jobs.forEach(function (job, index) {
        log.echo();
        log.echo('Job #' + index);
        log.echo(options.i18n.t('checkJobStatus.userFork'), job.username);
        log.echo(options.i18n.t('checkJobStatus.wriaBranch'), job.wriaBranch);
        log.echo(options.i18n.t('checkJobStatus.yuiBranch'), job.yuiBranch);
        log.echo(options.i18n.t('checkJobStatus.addedInQ'),
          moment(job.queueTime).fromNow());
        log.echo(options.i18n.t('checkJobStatus.total'), job.pid ? 'yes' : 'no');
        if (job.startTime) {
          log.echo(options.i18n.t('checkJobStatus.startTime'),
            moment(job.startTime).format('MMM Do YYYY, h:mm:ss a'));
          log.echo(options.i18n.t('checkJobStatus.eta'),
            moment(job.startTime).add('minutes', JOB_ETA_MINUTES).fromNow());
        }
      });
    } else {
      log.echo(options.i18n.t('checkJobStatus.noJobs'));
    }
    log.echo();
    done();
  } else {
    log.echo(options.i18n.t('checkJobStatus.noJobs'));
    log.echo();
    done();
  }
}

function _generateTemporaryFolderName(options, done) {
  // setting up the temporary build folder
  // making it unique to the user
  if (options.nightly) {
    options.tmpBuildDirName = 'build_tmp_nightly';
  } else {
    options.tmpBuildDirName = 'build_tmp_' + options.username;
  }
  options.tmpClonePath = path.join(tmpDir, options.tmpBuildDirName);
  done(null, options);
}

function _removeTemporaryFolder(options, done) {
  log.info(options.i18n.t('Cleaning up temporary directory'));
  rimraf(options.tmpClonePath, function (err) {
    done(err, options);
  });
}

function _shallowCloneWFRIA(options, done) {
  // check for dry-run
  if (!options.write) {
    log.info('dry-run: creating temporary build folder');
    log.info('dry-run: should clone WF-RIA repository');
    mkdirp(path.join(tmpDir, options.tmpBuildDirName), function () {
      done(null, options);
    });
  } else {
    // need to do a shallow clone into a temporary directory
    gith.cloneGitRepository({
      cloneArgs: '--depth 1 --branch ' + options.wriaBranch,
      cwd: tmpDir,
      verbose: true,
      status: true,
      name: options.tmpBuildDirName,
      url: mustache.render(options.pkgConfig.wria2giturl, {
        gitlabId: options.username
      })
    }, function (err, data) {
      var msg = options.i18n.t('Cannot clone WF-RIA2 branch for fork', {
        branch: options.wriaBranch,
        fork: options.username
      });
      if (!err) {
        log.success(options.i18n.t('Repository cloned in temporary location'));
        done(null, options);
      } else {
        _sendErrorEmail(_.extend(options, {
          msg: msg
        }), function () {
          done(err, data);
        });
      }
    });
  }
}

function _shallowCloneYUI(options, done) {
  // need to do a shallow clone of yui3
  yui3.cloneTemporaryYui({
    branch: options.yuiBranch,
    url: options.pkgConfig.wria2yui3giturl
  }, function (err, yui3path) {
    var msg = options.i18n.t('Cannot clone YUI3 branch', {
      branch: options.yuiBranch
    });
    if (!err) {
      log.success(options.i18n.t('YUI3 cloned successfully'));
      options.yui3path = yui3path;
      done(null, options);
    } else {
      _sendErrorEmail(_.extend(options, {
        msg: msg
      }), function () {
        done(err);
      });
    }
  });
}

function _installNPM(options, done) {
  // need to build the npm packages under build
  var msg, buildPath = path.join(options.tmpClonePath, 'build');

  msg = options.i18n.t('Cannot install NPM packages', {
    build: buildPath
  });
  utilities.installLocalNpmPackages(buildPath, function (err) {
    if (err) {
      _sendErrorEmail(_.extend(options, {
        msg: msg
      }), function () {
        done(err);
      });
    } else {
      done(null, options);
    }
  });
}

function _syncYUI(options, done) {
  // copy the yui source files to wf2/src
  yui3.copyYUItoWF2(options.yui3path, options.tmpClonePath, function (err) {
    if (!err) {
      // need to cleanup the temporary directory if it exists
      log.info(options.i18n.t('Cleaning up temporary directory'));
      rimraf(options.yui3path, function () {
        // success even in case of error
        done(null, options);
      });
    } else {
      done(err);
    }
  });
}

function _getSHA(options, done) {
  if (options.customPackageId) {
    done(null, options);
  } else {
    gith.getCurrentSHA({
      cwd: options.tmpClonePath,
      short: true
    }, function (err, sha) {
      if (!err) {
        options.sha = sha;
      }
      done(null, options);
    });
  }
}

function _mavenHack(options, done) {
  var m2Path = path.resolve(utilities.getHomeDir(), '.m2');
  cmd.run('chmod -R 777 ' + m2Path, {
    status: false,
    verbose: false
  }, function () {
    // success even in case of error
    done(null, options);
  });
}

function _mavenBuild(options, done) {
  // start the build with maven
  log.info(options.i18n.t('Running maven package build'));

  var dstOut = (options.remote) ? options.tmpClonePath : process.cwd(),
    logFile = path.join(options.tmpClonePath, options.username + '.log'),
    cmdline =
    'node build/lib/package.js -c ../../../wria/combo?basePath=@WF2_VERSION@/build&' +
    ' -l -i ' + options.sha + '-' + options.wriaBranch + '-' + options.username +
    ' -v ' + options.sha + ' -o ' + dstOut;

  options.logFile = logFile;

  cmd.run(cmdline, {
    pwd: options.tmpClonePath,
    verbose: false,
    status: false,
    logFile: logFile
  }, function (err, stderr) {
    var msg = options.i18n.t('Maven build failed');
    if (err) {
      if (stderr) {
        log.echo(stderr);
      }
      _sendErrorEmail(_.extend(options, {
        msg: msg,
        attachments: logFile,
      }), function () {
        done(err);
      });
    } else {
      done(null, options);
    }
  });
}

function _postMavenBuild(options, done) {
  var fileName, war, tgz, srcWar, srcTgz, dstWar, dstTgz,
    targetDir, fileNameTPL, htmlBodytpl,
    pkgTypeTAR = true,
    warJobQueueFile = options.warJobQueueFile ||
    path.join(runDir, 'war-jobs.json');

  function _logSuccess(type, name) {
    log.success(options.i18n.t('postBuild.buildSuccess'));
    log.echo();

    if (type === PACKAGE_BUILD_TYPE.WAR) {
      log.echo(options.i18n.t('postBuild.fileName') + name);
      log.echo(options.i18n.t('postBuild.localPath') + process.cwd());
      log.echo(options.i18n.t('postBuild.uploadURL', {
        url: 'https://wfdev01upload.abcv.com/upload/index.php'
      }));
    } else {
      log.echo(options.i18n.t('postBuild.fileName') + path.basename(name));
      log.echo(options.i18n.t('postBuild.localPath') + process.cwd());
      log.echo(options.i18n.t('postBuild.uploadURL', {
        url: 'https://wli-svr0148a.wellsfargo.com'
      }));
    }

    log.echo();
    log.notice(options.i18n.t('postBuild.sageAdvice'));
    log.echo(path.resolve(options.tmpClonePath));
    if (options.username === 'jonathanrubstein') {
      utilities.unicorn();
    }
  }

  targetDir = path.join(options.tmpClonePath,
    'wt2', 'wria2-documentation', 'target');
  fileNameTPL = '{{sha}}-{{branch}}-{{username}}';

  fileName = mustache.render(fileNameTPL, {
    sha: options.sha,
    branch: options.wriaBranch,
    username: options.username
  });

  war = fileName + '.war';
  tgz = fileName + '-package.tar.gz';

  srcWar = path.join(targetDir, war);
  srcTgz = path.join(targetDir, tgz);

  if (options.remote) {
    dstWar = path.join(options.tmpClonePath, war);
    dstTgz = path.join(options.tmpClonePath, tgz);
    // if file was not moved, let's do it
    if (fs.existsSync(srcWar)) {
      pkgTypeTAR = false;
      dstTgz = null;
      fs.renameSync(srcWar, dstWar);
    } else if (fs.existsSync(srcTgz)) {
      pkgTypeTAR = true;
      dstWar = null;
      fs.renameSync(srcTgz, dstTgz);
    }
    // removing job from queue file and kill runaway process if any
    if (!options.executeJob) {
      _removeJobFromQueue(warJobQueueFile, options, true, function () {});
    }

    if (options.write) {
      log.info(options.i18n.t('postBuild.remoteJobDone'));

      htmlBodytpl = fs.readFileSync(path.join(__dirname,
        '..', 'data', 'templates', 'war', 'jobcomplete.mustache'), 'utf8');

      utilities.sendEmail({
        to: options.useremail,
        subject: options.i18n.t('email.subject', {
          status: '[ COMPLETE ]'
        }),
        attachments: options.logFile,
        htmlBody: mustache.render(htmlBodytpl, {
          username: options.username,
          wriaBranch: options.wriaBranch,
          yuiBranch: options.yuiBranch,
          pkgTypeTAR: pkgTypeTAR,
          war: (dstWar) ? war : tgz,
          elapsedTime: moment().from(moment(options.startTime), true),
          srcWar: (dstWar) ? dstWar : dstTgz,
          jenkinsusername: options.pkgConfig.jenkinsusername,
          jenkinshostname: options.pkgConfig.jenkinshostname
        }, {
          header: emailHeaderTpl,
          footer: emailFooterTpl
        })
      }, function () {});
    } else {
      log.info('dry-run: should be sending an email');
    }
    done(null, options);
  } else {
    dstWar = path.join(process.cwd(), war);
    dstTgz = path.join(process.cwd(), tgz);
    if (fs.existsSync(srcWar)) {
      // file was not moved, let's do it
      fs.renameSync(srcWar, dstWar);
      _logSuccess(PACKAGE_BUILD_TYPE.WAR, dstWar);
      done(null, options);
    } else if (fs.existsSync(srcTgz)) {
      fs.renameSync(srcTgz, dstTgz);
      _logSuccess(PACKAGE_BUILD_TYPE.TAR, dstTgz);
      done(null, options);
    } else if (fs.existsSync(dstWar)) {
      _logSuccess(PACKAGE_BUILD_TYPE.WAR, dstWar);
      done(null, options);
    } else if (fs.existsSync(dstTgz)) {
      _logSuccess(PACKAGE_BUILD_TYPE.TAR, dstTgz);
      done(null, options);
    } else {
      log.warning(options.i18n.t('postBuild.warning1'));
      log.warning(options.i18n.t('postBuild.warning2'));
      log.warning(options.i18n.t('postBuild.warning3'));
      log.echo(path.resolve(options.tmpClonePath));
      done(127);
    }
  }
}

function _buildRemotePackage(options, done) {
  log.debug('_buildRemotePackage: ', options);

  function _updateJobStatusInQueue(done) {
    var now = new Date();
    if (!options.executeJob) {
      // our job is the first in the queue
      options.jobs[0].startTime = now;
      options.jobs[0].estimatedEndTime = moment(now).add('minutes', 25);
      options.jobs[0].pid = process.pid;
      // updating the whole file (with all the jobs, including the first one)
      fs.writeFileSync(options.warJobQueueFile, JSON.stringify(options.jobs, null, 2));
    }
    options.startTime = now;
    done(null, options);
  }

  async.waterfall([
    _updateJobStatusInQueue,
    _generateTemporaryFolderName,
    _removeTemporaryFolder,
    _shallowCloneWFRIA,
    _installNPM,
    _shallowCloneYUI,
    _syncYUI,
    _getSHA,
    _mavenHack,
    _mavenBuild,
    _postMavenBuild
  ], done);
}

function _processJobFromQueue(warJobQueueFile, options, done) {
  var msg, index, htmlBodytpl, job, jobs = [],
    JOB_TTL_MINUTES = 40;

  if (fs.existsSync(warJobQueueFile)) {
    jobs = JSON.parse(fs.readFileSync(warJobQueueFile, 'utf8'));

    job = _.find(jobs, function (obj, key) {
      if (obj.pid) {
        index = key;
        return true;
      }
    });

    if (job) {
      // check if it's still running...
      // if not remove the entry from the queue
      if (utilities.sendSignal(job.pid, utilities.ALIVE_SIGNAL)) {
        // need to check if it's too old
        // if it is, kill it!
        if (moment(job.startTime).add('minutes', JOB_TTL_MINUTES) - moment() < 0) {
          // job is too old, killing it
          utilities.sendSignal(job.pid, utilities.KILL_SIGNAL);
          // not cleaning the queue file to give the process time to stop
          // cleanly. it will be removed next time.
          // Still need to send an email to the requester...
          htmlBodytpl = fs.readFileSync(path.join(__dirname, '..', 'data', 'templates',
            'war',
            'error.mustache'), 'utf8');
          msg = options.i18n.t('email.body', {
            ttl: JOB_TTL_MINUTES
          });

          utilities.sendEmail({
            to: job.useremail + ', arno.versini@wellsfargo.com',
            subject: options.i18n.t('email.subject', {
              status: '[ FAILED ]'
            }),
            htmlBody: mustache.render(htmlBodytpl, {
              msg: msg
            }, {
              header: emailHeaderTpl,
              footer: emailFooterTpl
            })
          }, done);
        } else {
          done();
        }
      } else {
        // not alive, removing from the queue
        jobs.splice(index, 1);
        fs.writeFileSync(warJobQueueFile, JSON.stringify(jobs, null, 2));
        done();
      }
    } else {
      job = _.find(jobs, function (obj, key) {
        if (!obj.pid) {
          index = key;
          return true;
        }
      });
      if (job) {
        // need to run this job
        htmlBodytpl = fs.readFileSync(path.join(__dirname, '..', 'data', 'templates', 'war',
          'jobstarted.mustache'), 'utf8');

        utilities.sendEmail({
          to: job.useremail,
          subject: options.i18n.t('email.subject', {
            status: '[ STARTED ]'
          }),
          htmlBody: mustache.render(htmlBodytpl, {
            username: job.username,
            wriaBranch: job.wriaBranch,
            yuiBranch: job.yuiBranch
          }, {
            header: emailHeaderTpl,
            footer: emailFooterTpl
          })
        }, function () {
          var extra = {
            username: job.username,
            useremail: job.useremail,
            wriaBranch: job.wriaBranch,
            yuiBranch: job.yuiBranch,
            jobs: jobs,
            warJobQueueFile: warJobQueueFile
          };
          _buildRemotePackage(_.extend(options, extra), done);
        });

      } else {
        done();
      }
    }
  }
}

function _gatherBuildLocation(options, done) {
  if (!options.buildLocation) {
    var msg = options.i18n.t('choices.runLocallyOrRemote', {
      local: TYPE_WAR_BUILD_LOCAL.toUpperCase(),
      remote: TYPE_WAR_BUILD_REMOTE.toUpperCase()
    });
    utilities.promptAndContinue({
      promptType: utilities.PROMPT_PROMPT,
      promptMsg: msg,
      validator: function (value) {
        value = value.toLowerCase();
        if (value !== TYPE_WAR_BUILD_REMOTE && value !== TYPE_WAR_BUILD_LOCAL) {
          throw new Error();
        } else {
          return value;
        }
      }
    }, function (err, value) {
      if (value) {
        options.buildLocation = value;
      }
      done(null, options);
    });
  } else {
    done(null, options);
  }
}

function _gatherBuildRequest(options, done) {
  if (options.buildLocation === TYPE_WAR_BUILD_REMOTE) {
    // it's a request for a remote job, but which one?
    var msg = options.i18n.t('choices.remoteOptions', {
      add: REMOTE_ADD,
      remove: REMOTE_REMOVE,
      status: REMOTE_STATUS
    });

    utilities.promptAndContinue({
      promptType: utilities.PROMPT_PROMPT,
      promptMsg: msg,
      validator: function (value) {
        value = value.toLowerCase();
        if (value !== REMOTE_ADD && value !== REMOTE_REMOVE && value !== REMOTE_STATUS) {
          throw new Error();
        } else {
          return value;
        }
      }
    }, function (err, value) {
      if (value) {
        options.queueRequest = value;
      }
      done(null, options);
    });
  } else {
    // this is local, so it's an actual build
    done(null, options);
  }
}

function _gatherUserEmail(options, done) {
  if (options.queueRequest === REMOTE_ADD) {
    var useremail = utilities.fedtoolsRcGet(utilities.FEDTOOLSRCKEYS.useremail),
      msg = options.i18n.t('Type your email');

    if (useremail) {
      msg = msg + options.i18n.t('choices.enterForDefault', {
        data: useremail
      });
    }
    msg += ':';

    utilities.promptAndContinue({
      promptType: utilities.PROMPT_PROMPT,
      promptMsg: msg,
      defaultValue: useremail || null
    }, function (err, value) {
      if (value) {
        options.useremail = value;
        utilities.fedtoolsRcSet(utilities.FEDTOOLSRCKEYS.useremail, value);
      }
      done(null, options);
    });
  } else {
    done(null, options);
  }
}

function _gatherUserFork(options, done) {
  if (options.queueRequest === REMOTE_ADD ||
    options.queueRequest === REMOTE_REMOVE ||
    options.buildLocation === TYPE_WAR_BUILD_LOCAL) {
    var username = utilities.fedtoolsRcGet(utilities.FEDTOOLSRCKEYS.username),
      msg = options.i18n.t('Type your git username (your fork name)');
    if (username) {
      msg = msg + options.i18n.t('choices.enterForDefault', {
        data: username
      });
    }

    msg += ':';
    utilities.promptAndContinue({
      promptType: utilities.PROMPT_PROMPT,
      promptMsg: msg,
      defaultValue: username || null
    }, function (err, value) {
      if (value) {
        options.username = value;
        utilities.fedtoolsRcSet(utilities.FEDTOOLSRCKEYS.username, value);
      }
      done(null, options);
    });
  } else {
    done(null, options);
  }
}

function _gatherUserBranch(options, done) {
  if (options.queueRequest === REMOTE_ADD ||
    options.queueRequest === REMOTE_REMOVE ||
    options.buildLocation === TYPE_WAR_BUILD_LOCAL) {
    var userbranch = utilities.fedtoolsRcGet(utilities.FEDTOOLSRCKEYS.userbranch),
      msg = options.i18n.t('Type the WF-RIA² branch you want to build');
    if (userbranch) {
      msg = msg + options.i18n.t('choices.enterForDefault', {
        data: userbranch
      });
    }

    msg += ':';
    utilities.promptAndContinue({
      promptType: utilities.PROMPT_PROMPT,
      promptMsg: msg,
      defaultValue: userbranch || null
    }, function (err, value) {
      if (value) {
        options.wriaBranch = value;
        utilities.fedtoolsRcSet(utilities.FEDTOOLSRCKEYS.userbranch, value);
      }
      done(null, options);
    });
  } else {
    done(null, options);
  }
}

function _gatherYUIBranch(options, done) {
  if (options.queueRequest === REMOTE_ADD ||
    options.queueRequest === REMOTE_REMOVE ||
    options.buildLocation === TYPE_WAR_BUILD_LOCAL) {
    var yuiBranch = utilities.fedtoolsRcGet(utilities.FEDTOOLSRCKEYS.yuibranch),
      msg = options.i18n.t('Type the YUI3 branch you need');

    if (yuiBranch) {
      msg = msg + options.i18n.t('choices.enterForDefault', {
        data: yuiBranch
      });
    } else {
      msg = msg + options.i18n.t('choices.enterForDefault', {
        data: 'wf2-' + options.pkgConfig.defaultBranch
      });
    }

    msg += ':';
    utilities.promptAndContinue({
      promptType: utilities.PROMPT_PROMPT,
      promptMsg: msg,
      defaultValue: yuiBranch || null
    }, function (err, value) {
      if (value) {
        options.yuiBranch = value;
        utilities.fedtoolsRcSet(utilities.FEDTOOLSRCKEYS.yuibranch, value);
      }
      done(null, options);
    });
  } else {
    done(null, options);
  }
}

function _gatherCustomPackageId(options, done) {
  if (process.env.FEDTOOLS_PASSWORD &&
    options.buildLocation === TYPE_WAR_BUILD_LOCAL) {
    var msg = options.i18n.t('choices.customSha');
    utilities.promptAndContinue({
      promptType: utilities.PROMPT_CONFIRM,
      promptMsg: msg,
      defaultValue: true
    }, function (err, value) {
      options.customPackageId = value;
      done(null, options);
    });
  } else {
    done(null, options);
  }
}

function _gatherRemoteUserPassword(options, done) {
  var msg, rcInfo, hasCachedPassword = false;

  if (options.buildLocation === TYPE_WAR_BUILD_REMOTE) {
    // either get the password from the .fedtoolsrc file if
    // not expired, or ask the user...
    rcInfo = utilities.fedtoolsRcGet(utilities.FEDTOOLSRCKEYS.warbuilder);
    if (rcInfo && rcInfo.password && rcInfo.expiration) {
      // all the keys are here, let's check the expiration
      if (moment().isBefore(rcInfo.expiration)) {
        // we're good!
        hasCachedPassword = true;
      }
    }
    if (hasCachedPassword) {
      options.jenkinsuserpassword = utilities.unObfuscate(rcInfo.password);
      done(null, options);
    } else {
      msg = options.i18n.t('choices.remotePassword');
      utilities.promptAndContinue({
        promptType: utilities.PROMPT_PASSWORD,
        promptMsg: msg,
        validator: function (value) {
          if (value === '') {
            throw new Error();
          } else {
            return value;
          }
        }
      }, function (err, value) {
        if (value) {
          options.jenkinsuserpassword = value;
          // save it
          utilities.fedtoolsRcSet(utilities.FEDTOOLSRCKEYS.warbuilder, {
            password: utilities.obfuscate(value),
            expiration: moment().add('d', 7)
          });
        }
        done(null, options);
      });
    }
  } else {
    done(null, options);
  }
}

function _gatherUserPreferences(options, done) {
  function _findDefaultBuildLocation(callback) {

    if (!process.env.FEDTOOLS_PASSWORD) {
      if (process.platform === 'win32') {
        log.notice(options.i18n.t('The package will be built remotely'));
        options.buildLocation = TYPE_WAR_BUILD_REMOTE;
        callback(null, options);
      } else {
        log.notice(options.i18n.t('The package will be built directly on your machine'));
        options.buildLocation = TYPE_WAR_BUILD_LOCAL;
        callback(null, options);
      }
    } else {
      callback(null, options);
    }
  }
  async.waterfall([
    _findDefaultBuildLocation,
    _gatherBuildLocation,
    _gatherBuildRequest,
    _gatherUserEmail,
    _gatherUserFork,
    _gatherUserBranch,
    _gatherYUIBranch,
    _gatherCustomPackageId,
    _gatherRemoteUserPassword
  ], function (err, opt) {
    done(err, opt);
  });
}

function _displaySummaryAndConfirmation(options, done) {
  var defaultAnswer = true,
    defaultMessage = options.i18n.t('summary.defaultMessageY');

  if (options.buildLocation && options.queueRequest &&
    options.buildLocation === TYPE_WAR_BUILD_REMOTE &&
    options.queueRequest === REMOTE_STATUS) {
    done(null, options);
    return;
  }
  log.echo();
  log.title(options.i18n.t('summary.title'));
  log.echo();

  log.blue(options.i18n.t('summary.userName'), options.username);
  if (options.useremail) {
    log.blue(options.i18n.t('summary.userEmail'), options.useremail);
  }
  log.blue(options.i18n.t('summary.wriaBranch'), options.wriaBranch);
  log.blue(options.i18n.t('summary.yuiBranch'), options.yuiBranch);
  if (options.customPackageId) {
    log.blue(options.i18n.t('summary.customSha'), options.i18n.t('yes'));
  }
  if (options.buildLocation === TYPE_WAR_BUILD_REMOTE) {
    if (options.queueRequest === REMOTE_ADD) {
      log.blue(options.i18n.t('summary.location'), options.i18n.t('remote'));
      log.blue(options.i18n.t('summary.eta1'));
    }
    if (options.queueRequest === REMOTE_REMOVE) {
      log.blue(options.i18n.t('summary.scheduled'), options.i18n.t('yes'));
    }
  } else {
    log.blue(options.i18n.t('summary.location'), options.i18n.t('local'));
    log.blue(options.i18n.t('summary.eta2'));
  }

  log.echo();
  if (options.buildLocation === TYPE_WAR_BUILD_REMOTE &&
    options.queueRequest === REMOTE_ADD) {
    log.notice(options.i18n.t('summary.warning1'));
    log.echo();
  }
  if (!options.yuiBranch.match(/^wf2-/)) {
    defaultAnswer = false;
    defaultMessage = options.i18n.t('summary.defaultMessageN');
    log.notice(options.i18n.t('summary.warning1'));
    log.echo();
  }
  utilities.promptAndContinue({
    promptType: utilities.PROMPT_CONFIRM,
    promptMsg: options.i18n.t('continue') + '? ' + defaultMessage,
    defaultValue: defaultAnswer
  }, function (err, value) {
    if (!value) {
      log.echo(options.i18n.t('bye'));
      log.echo();
      done(-1);
    } else {
      done(null, options);
    }
  });
}

function _setStartTime(options, done) {
  options.startTime = new Date();
  done(null, options);
}

function _buildLocalPackage(options, done) {
  function _checkLocalDevConfiguration(callback) {
    var result = utilities.isAppInstalled([{
      'name': 'mvn',
      'error': options.i18n.t('error.mvn')
    }, {
      'name': 'shifter',
      'error': options.i18n.t('error.shifter')
    }, {
      'name': 'yogi',
      'error': options.i18n.t('error.yogi')
    }, {
      'name': 'selleck',
      'error': options.i18n.t('error.selleck')
    }, {
      'name': 'yuidoc',
      'error': options.i18n.t('error.yuidoc')
    }]);
    if (!result) {
      callback(-1);
    } else {
      callback(null, options);
    }
  }

  async.waterfall([
    _checkLocalDevConfiguration,
    _displaySummaryAndConfirmation,
    _setStartTime,
    _generateTemporaryFolderName,
    _removeTemporaryFolder,
    _shallowCloneWFRIA,
    _installNPM,
    _shallowCloneYUI,
    _syncYUI,
    _getSHA,
    _mavenHack,
    _mavenBuild,
    _postMavenBuild
  ], function (err, opt) {
    done(err, opt);
  });
}

function _sendRemoteRequest(options, done) {
  var res, msg, cmdline, cmdlineTpl = 'source ~/.bash_profile; ' +
    'fedtools war -r -u {{username}} -e {{useremail}} -w {{wriaBranch}} -y {{yuiBranch}} {{queueRequest}}';

  cmdline = mustache.render(cmdlineTpl, {
    queueRequest: (options.queueRequest) ? '-' + options.queueRequest.toUpperCase() : '',
    jenkinsusername: options.pkgConfig.jenkinsusername,
    jenkinshostname: options.pkgConfig.jenkinshostname,
    username: options.username,
    useremail: options.useremail,
    wriaBranch: options.wriaBranch,
    yuiBranch: options.yuiBranch
  });

  log.echo();
  if (options.queueRequest === REMOTE_STATUS) {
    log.info(options.i18n.t('remoteRequest.status.info'));
    msg = options.i18n.t('remoteRequest.status.success');
  } else if (options.queueRequest === REMOTE_ADD) {
    log.info(options.i18n.t('remoteRequest.add.info', {
      username: options.username
    }));
    msg = options.i18n.t('remoteRequest.add.success');
  } else if (options.queueRequest === REMOTE_REMOVE) {
    log.notice(options.i18n.t('remoteRequest.remove.info'));
    msg = options.i18n.t('remoteRequest.remove.success');
  }

  res = cmd.runRemote(cmdline, {
    username: options.pkgConfig.jenkinsusername,
    host: options.pkgConfig.jenkinshostname,
    password: options.jenkinsuserpassword
  }, function (err, code) {
    if (code !== 0) {
      log.error(options.i18n.t('remoteRequest.error'));
      // need to wipe out the warbuilder info from the fedtoolsrc file
      utilities.fedtoolsRcSet(utilities.FEDTOOLSRCKEYS.warbuilder, {});
      done(-1);
    } else {
      done(null, msg);
    }
  });
}

// -- P U B L I C  M E T H O D S

exports.processRemoteCommands = function (options, done) {

  options.i18n.loadPhrases(path.resolve(__dirname,
    '..', 'data', 'i18n', 'wria2-package'));

  // if needed, create the 'run' folder where
  // we store job requests (warJobQueueFile)
  mkdirp.sync(runDir);
  var warJobQueueFile = path.join(runDir, 'war-jobs.json');

  // need to add a job to the queue (-A)
  if (options.addJob) {
    _addJobToQueue(warJobQueueFile, options, done);
    return;
  }

  // need to check if a job exits (-S)
  if (options.statusJob) {
    _checkJobFromQueue(warJobQueueFile, options, done);
    return;
  }

  // need to remove job from queue (-R), without checking if
  // it's alive, it's a user request...
  if (options.removeJob) {
    _removeJobFromQueue(warJobQueueFile, options, false, done);
    return;
  }

  // need to process jobs from the queue (-P)
  if (options.processJob) {
    _processJobFromQueue(warJobQueueFile, options, done);
    return;
  }

  // need to execute the job directly (-E)
  if (options.executeJob) {
    if (options.nightly) {
      options.customPackageId = true;
      options.sha = 'nightly';
    }
    _buildRemotePackage(options, done);
    return;
  }
};

exports.processLocalCommands = function (options, done) {
  log.debug('options: ', options);

  options.i18n.loadPhrases(path.resolve(__dirname,
    '..', 'data', 'i18n', 'wria2-package'));

  async.waterfall([

    function (callback) {
      _gatherUserPreferences(options, callback);
    },
    function (options, callback) {
      if (options.buildLocation === TYPE_WAR_BUILD_LOCAL) {
        _buildLocalPackage(options, callback);
      } else if (options.buildLocation === TYPE_WAR_BUILD_REMOTE) {
        _displaySummaryAndConfirmation(options, function (err, opts) {
          if (err !== -1) {
            _sendRemoteRequest(opts, callback);
          } else {
            callback(-1);
          }
        });
      } else {
        callback(-1);
      }
    }
  ], done);
};

exports.private = {
  addJobToQueue: _addJobToQueue,
  removeJobFromQueue: _removeJobFromQueue,
  generateTemporaryFolderName: _generateTemporaryFolderName,
  removeTemporaryFolder: _removeTemporaryFolder,
  shallowCloneWFRIA: _shallowCloneWFRIA,
  postMavenBuild: _postMavenBuild
};
