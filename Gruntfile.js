/*jshint node:true */

module.exports = function (grunt) {

  var moment = require('moment'),
    mustache = require('mustache'),
    fs = require('fs'),
    semver = require('semver'),

    historyFile = 'HISTORY.md',
    PUBLISH_COMMIT_MSG = 'Publishing npm release',
    TPL_HISTORY_ENTRY = '\n##Release {{version}} ~ {{date}}\n' +
      '{{history}}';

  // load plugins
  require('load-grunt-tasks')(grunt);

  // helper callback for shell task
  // - Update the HISTORY.md file with the latest logs
  // - Update the API docs
  // - Stage, commit and publish the HISTORY.md file and the API docs
  function prePublish(err, stdout, stderr, cb) {
    var buffer,
      version = semver.inc(grunt.config.get('pkg').version, 'patch'),
      date = moment(new Date()).format('MMM DD YYYY HH:mm');

    if (stdout) {
      buffer = mustache.render(TPL_HISTORY_ENTRY, {
        version: version,
        date: date,
        history: stdout
      });

      if (buffer) {
        fs.appendFileSync(historyFile, buffer);
        grunt.util.spawn({
          cmd: 'git',
          args: ['add', historyFile, './data/docs']
        }, function (err) {
          if (err) {
            grunt.fail.fatal('Unable to run "git add" ' + err);
            cb();
          } else {
            grunt.util.spawn({
              cmd: 'git',
              args: ['commit', '-m', 'Updating HISTORY and API docs']
            }, function (err) {
              if (err) {
                grunt.fail.fatal('Unable to run "git commit" ' + err);
                cb();
              } else {
                grunt.util.spawn({
                  cmd: 'git',
                  args: ['push']
                }, function (err) {
                  if (err) {
                    grunt.fail.fatal('Unable to run "git push" ' + err);
                  }
                  cb();
                });
              }
            });
          }
        });
      } else {
        cb();
      }
    } else {
      cb();
    }
  }

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['./tmp/*'],

    curl: {
      proxy: {
        src: [{
          url: 'http://registry.npmjs.org/<%=pkg.name%>/-/<%=pkg.name%>-<%=pkg.version%>.tgz',
          proxy: 'http://proxy.wellsfargo.com'
        }],
        dest: './tmp/registry-<%=pkg.name%>-<%=pkg.version%>.tgz'
      },
      noproxy: {
        src: [{
          url: 'http://registry.npmjs.org/<%=pkg.name%>/-/<%=pkg.name%>-<%=pkg.version%>.tgz'
        }],
        dest: './tmp/registry-<%=pkg.name%>-<%=pkg.version%>.tgz'
      }
    },

    copy: {
      main: {
        files: [{
          src: '<%=pkg.name%>-<%=pkg.version%>.tgz',
          dest: 'tmp/local-<%=pkg.name%>-<%=pkg.version%>.tgz'
        }]
      }
    },

    mkdir: {
      all: {
        options: {
          create: ['tmp/local', 'tmp/registry']
        },
      },
    },

    shell: {
      getHistory: {
        command: 'git log <%=pkg.version%>..HEAD' +
          ' --pretty=format:\'* [ %an ] %s\' --no-merges | grep -v "' +
          PUBLISH_COMMIT_MSG + '"',
        options: {
          callback: prePublish
        }
      }
    },

    release: {
      options: {
        bump: true,
        add: true,
        commit: true,
        tag: true,
        push: true,
        pushTags: true,
        npm: true,
        commitMessage: PUBLISH_COMMIT_MSG + ' <%= version %>'
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        options: {
          paths: ['./bin', './lib'],
          outdir: './data/docs/',
          themedir: './data/yuidoc/themes/fedtools'
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 9090,
          protocol: 'http',
          debug: false,
          keepalive: true,
          base: ['./data/docs']
        }
      }
    }

  });

  // register running tasks
  grunt.registerTask('default', ['help']);
  grunt.registerTask('publish', ['yuidoc', 'shell', 'release']);

  grunt.registerTask('api', 'Serve the API documentation', function () {
    var done = this.async(),
      url = 'http://localhost:9090/modules/fedtools.html',
      _afterServerStarted;
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    grunt.task.run('connect');
    done();

    _afterServerStarted = function () {
      var cmdline;

      console.log();
      console.log('Local URL is now available here: ' + url.cyan);

      switch (process.platform) {
      case 'darwin':
        cmdline = 'open';
        break;
      case 'linux':
        cmdline = 'xdg-open';
        break;
      case 'win32':
        cmdline = 'start';
        break;
      }

      if (cmdline) {
        grunt.log.subhead('Opening in default browser...');
        grunt.util.spawn({
          cmd: cmdline,
          args: [url]
        }, function () {});
      }
    };

    setTimeout(function () {
      _afterServerStarted();
    }, 1000);


  });

  grunt.registerTask('pack', 'Create package', function () {
    var done = this.async();
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    grunt.util.spawn({
      cmd: 'npm',
      args: ['pack']
    }, function (err) {
      done(err);
    });
  });

  grunt.registerTask('pack-remove', 'Remove package', function () {
    var version = grunt.config.get('pkg').version,
      name = grunt.config.get('pkg').name;
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    grunt.file.delete(name + '-' + version + '.tgz');
  });

  grunt.registerTask('untar', 'Untar packages', function () {
    var done = this.async(),
      version = grunt.config.get('pkg').version,
      name = grunt.config.get('pkg').name,
      localName = 'local-' + name + '-' + version + '.tgz',
      regName = 'registry-' + name + '-' + version + '.tgz';
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    grunt.util.spawn({
      cmd: 'tar',
      args: ['xzf', regName, '-C', 'registry'],
      opts: {
        cwd: 'tmp'
      }
    }, function () {
      grunt.util.spawn({
        cmd: 'tar',
        args: ['xzf', localName, '-C', 'local'],
        opts: {
          cwd: 'tmp'
        }
      }, function (err) {
        done(err);
      });

    });
  });

  grunt.registerTask('diffd', 'Runs a diffd', function () {
    var done = this.async();
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    grunt.util.spawn({
      cmd: 'diff',
      args: ['-b', '-q', '-r', 'local', 'registry'],
      opts: {
        cwd: 'tmp'
      }
    }, function (err, data) {
      if (data.stdout) {
        console.log('\n', data.stdout);
      }
      done(err);
    });
  });

  // need to check the release
  grunt.registerTask('check', 'Check the release validity', function (env) {
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    grunt.task.run('clean');
    grunt.task.run('mkdir');
    if (env && env === 'noproxy') {
      grunt.task.run('curl:noproxy');
    } else {
      grunt.task.run('curl:proxy');
    }
    grunt.task.run('pack');
    grunt.task.run('copy');
    grunt.task.run('pack-remove');
    grunt.task.run('untar');
    grunt.task.run('diffd');
  });

  grunt.registerTask('help', 'Display help usage', function () {
    grunt.log.subhead('Grunt [ ' + this.name.cyan + ' ]');
    console.log();
    console.log('Type "grunt publish" to:');
    console.log(' - bump the version in package.json file.');
    console.log(' - stage the package.json file\'s change.');
    console.log(' - commit that change.');
    console.log(' - create a new git tag for the release.');
    console.log(' - push the changes out to github.');
    console.log(' - push the new tag out to github.');
    console.log(' - publish the new version to npm.');
    console.log();
    console.log('Type "grunt check" to:');
    console.log(' - check if the newly published package is valid.');
    console.log();
    console.log('Type "grunt yuidoc" to:');
    console.log(' - Re-build the API documentation.');
    console.log();
    console.log('Type "grunt api" to:');
    console.log(' - Serve the API documentation on localhost:9090');
  });
};
