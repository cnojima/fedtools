
__0.0.141 / 2014-06-11__

    7b2a509 [Arno V]: More code/content separation
    9d7c5de [Arno V]: Extracting more content from war builder
    ab4066f [Arno V]: Refactoring serve to prevent folder pollution
    37a48b4 [Arno V]: Display summary even for remote WAR request (not for status though)
    5ffed58 [Arno V]: Content update for WAR summary
    b82de68 [Arno V]: Missing 'continue' text from i18n

__0.0.140 / 2014-06-11__

    ae21fc7 [Arno V]: Fix broken notification after WAR build

__0.0.139 / 2014-06-10__

    d5d0df7 [Arno V]: Removing debug logs from unit-tests

__0.0.138 / 2014-06-10__

    5df9a67 [Arno V]: Refactoring serve and adding unit tests for it

__0.0.137 / 2014-06-09__

    ddffe4c [Arno V]: Fixing 'serve' not serving anymore on Windows...

__0.0.136 / 2014-06-09__

    d779010 [Arno V]: Merge pull request #34 from aversini/i18n
    6af7a1d [Arno V]: Converting `serve` to i18n
    93da5cd [Arno V]: Fix duplicate prompt when starting server
    fa8d225 [Arno V]: Refactoring and now using fedtools-i18n
    b6f832d [Arno V]: First pass at i18n

__0.0.135 / 2014-06-08__

    273d078 [Arno V]: updating `glob` and `ncp` to latest stable version
    312cf33 [Arno V]: updating to latest stable version for `async`, `moment`, `mustache` and `underscore`
    03b4520 [Arno V]: Cleaning up more dependencies
    3ff65f8 [Arno V]: Removing extra dependency
    b962bf7 [Arno V]: Adding logic so that the warbuilder password is only asked once a week

__0.0.134 / 2014-06-08__

    0aeafae [Arno V]: Another casualty of the merge...

__0.0.133 / 2014-06-08__

    f9619e7 [Arno V]: Fixing merge gone rogue

__0.0.132 / 2014-06-07__

    18ed97e [Arno V]: well what do you know.. not working on f*ing windows so disabling for f*ing windows

__0.0.131 / 2014-06-07__

    d3edbe1 [Arno V]: Adding notifications to fedtools wria-watch

__0.0.130 / 2014-06-07__

    eb9f1c4 [Arno V]: Merge pull request #33 from aversini/builder
    d52cc59 [Arno V]: updating due to API change
    a17d453 [Arno V]: More unit tests for war builder + starting to add a 'dry-run' option
    1747087 [Arno V]: First pass at refactoring WAR building

__0.0.129 / 2014-06-04__

    4309b3b [Arno V]: Moving selleck and yuidoc server commands to 'deprecated' file - still available... for now
    a06231b [Arno V]: Adding notification after a war build

__0.0.128 / 2014-06-03__

    11e1884 [Arno V]: Adding visual notifications to build and bootstrap

__0.0.127 / 2014-06-02__

    ae624e4 [Arno V]: typo (missing space)

__0.0.126 / 2014-06-02__

    2e235c4 [Arno V]: Adding minimum unit-tests... need to come up with something to test real flows
    4048eef [Arno V]: Migrating to fedtools-logs v0.1.x

__0.0.125 / 2014-06-01__

    39c3046 [Arno V]: Locking fedtools-logs dependency

__0.0.124 / 2014-06-01__

    ec1903d [Arno V]: typo (thanks Skylar)

__0.0.123 / 2014-05-28__

    2961c3b [Arno V]: Using the new 'trigger' option from the cmd.run method (for serve and selleck)

__0.0.122 / 2014-05-28__

    9c8164a [Arno V]: Using utilities.openInBrowser() instead of re-inventing the wheel all the time

__0.0.121 / 2014-05-27__

    eaadf61 [Arno V]: Updating grunt history to ignore some commits

__0.0.120 / 2014-05-26__

    6893b66 [Arno V]: Adding 'pre-release' grunt task

__0.0.119 / 2014-05-26__

    4388a33 [Arno V]: Updating Grunfile with utilities.git.getChangelog

__0.0.118 / 2014-05-25__

    fed329f [Arno V]: Oops, missing fedtools-utilities dependency

__0.0.117 / 2014-05-25__

    da83b97 [Arno V]: Removing utilities/git-helper/yui3-utils (now using fedtools-utilities)

__0.0.116 / 2014-05-24__

    25e5982 [Arno V]: Removing all API doc generator from fedtools
    b814bd4 [Arno V]: removing API documentation generator from fedtools (see fedtools-api)
    ec4e520 [Arno V]: Simplifying 'grunt api', taking advantage of 'connect' awesomeness

__0.0.115 / 2014-05-24__

    80e4b35 [Arno V]: Oops, fixing out dir for docs
    50a2822 [Arno V]: moving 'docs' out of the deliverables
    f4e3ba9 [Arno V]: Better API url
    766f380 [Arno V]: Typo

__0.0.114 / 2014-05-23__

    f13afc9 [Arno V]: Fixing publishing + API docs

__0.0.113 / 2014-05-23__

    c708c05 [Arno V]: updating the API docs when publishing

__0.0.112 / 2014-05-23__

    263dfc1 [Arno V]: Fixing grunt api... again

__0.0.111 / 2014-05-23__

    168b624 [Arno V]: Fixing API + local examples in linux...

__0.0.110 / 2014-05-23__

    7b170b4 [Arno V]: updating grunt api to support other OS

__0.0.109 / 2014-05-23__

    0bbce8b [Arno V]: Adding the option to open the default browser with the examples/API

__0.0.108 / 2014-05-23__

    edf464f [Arno V]: Merge pull request #32 from aversini/yuidoc
    ed76a5a [Arno V]: yuidoc: done for now
    10cbefa [Arno V]: Merge branch 'yuidoc' of https://github.com/aversini/fedtools into yuidoc
    bd2a628 [Arno V]: yuidoc: wip
    3ee992c [Arno V]: yuidoc: wip
    cfb8a7e [Arno V]: yuidoc: wip
    bfc2021 [Arno V]: yuidoc: wip
    093bcdf [Arno V]: yuidoc: missing properties on utilities - not working yet
    20fbc7b [Arno V]: yuidoc: utilities done.
    befc2f4 [Arno V]: yuidoc: wip
    3d23b9b [Arno V]: yuidoc: wip
    592cc46 [Arno V]: yuidoc: wip
    90414e6 [Arno V]: yuidoc: wip
    acac24b [Arno V]: yuidoc: missing properties on utilities - not working yet
    c94f92f [Arno V]: yuidoc: utilities done.
    0e1c6de [Arno V]: yuidoc: wip

__0.0.107 / 2014-05-23__

    55174dd [Arno V]: Fix 'serve' issue when the user is not in the same folder

__0.0.106 / 2014-05-23__

    d037743 [Arno V]: Fixing 'serve' command to accept file or folder

__0.0.105 / 2014-05-21__

    49130f1 [Arno V]: fedtools serve: small visual tweak (if java not found)
    dd6ad5f [Arno V]: Adding 'compass watch' to module watch (on top of shifter --watch)
    2c0c5fd [Arno V]: Fix select command (due to previous refactor, it was silent)

__0.0.104 / 2014-05-20__

    db387fa [Arno V]: Fixing release version...
    ccdd074 [Arno V]: adding 'serve' option to serve the new tar.gz server automatically

__0.1.3 / 2014-05-20__

    260fa91 [Arno V]: builder: extra fix (if cannot play with .m2)

__0.1.2 / 2014-05-20__

    4465fff [Arno V]: Fix builder

__0.0.100 / 2014-05-19__

    361fde6 [Arno V]: Merge pull request #30 from aversini/builder
    7e184ee [Arno V]: builder: final touches

__0.0.101 / 2014-05-20__

    b4a79b6 [Arno V]: builder fix
    9776130 [Arno V]: builder: update for tar.gz

__0.0.99 / 2014-05-18__

    757d6d6 [Arno V]: bootstrap: removing yui clone vs existing to simplify usability

__0.0.98 / 2014-05-16__

    0bd0f0d [Arno V]: Relaxing jshint "plusplus" rule

__0.0.97 / 2014-05-07__

    6e19053 [Arno V]: unicorn

__0.0.96 / 2014-05-02__

    ec78084 [Arno V]: Removing extra quotes for Combo Loader

__0.0.94 / 2014-05-01__

    868610e [Arno V]: war: fixing tar.gz filename

__0.0.93 / 2014-04-18__

    9415490 [Arno V]: Warning if the name of the YUI branch doesn't start with 'wf2-'
    8427694 [Arno V]: removing obsolete code

__0.0.92 / 2014-04-17__

    04c5f99 [Arno V]: Merge branch 'refs/heads/yui-sync'
    7cebcab [Arno V]: Simplifying fedtools wria-yui (yui sync)
    59cff5a [Arno V]: Merge pull request #29 from gerardkcohen/nxs-update
    3a3948c [Gerard K. Cohen]: Update skin template with NXS skin

__0.0.88 / 2014-04-09__

    b8eefcb [Arno V]: Fixing issue #28

__0.0.87 / 2014-04-09__

    3530810 [Arno V]: war: fixing messing with tar.gz vs war

__0.0.86 / 2014-04-07__

    497b108 [Arno V]: war: adding tar.gz as a possible war file extension

__0.0.85 / 2014-03-30__

    b3fd4da [Arno V]: Merge pull request #26 from gerardkcohen/unit-test-template
    95d7da2 [Gerard K. Cohen]: Update unit test template
    90f3a61 [Arno V]: war: if /repo exists, use it instead of /tmp
    cd75f5d [Arno V]: war: adding extra details in email for user branch checkout issue
    03eb99e [Arno V]: war: adding warning about war life limit on jenkins
    18e670a [Arno V]: webapp: update lang files to concat instead of copy
    2163d20 [Arno V]: war: don't open the backdoor if remote build queue is 'status'

__0.0.84 / 2014-02-11__

    d19af89 [Arno V]: war: send email upon error
    82d161c [Arno V]: war: backdoor :)
    85c3499 [Arno V]: jshint!!

__0.0.83 / 2014-02-10__

    9bb760d [Arno V]: build: adding 'wf2' module special build - if needed
    85ed5db [Arno V]: war: Add upload url to success message for war build - fixes issue #24
    355d1f2 [Arno V]: WAR: replacing 'custom-' with git short sha as a unique identifier

__0.0.82 / 2014-02-09__

    33b3e21 [Arno V]: Attaching logs to war builds - fixes issue #23
    78f0071 [Arno V]: war: adding log file output
    7762be2 [Arno V]: Update content
    a152e2e [Arno V]: webapp: adding notification system for build system
    fad3883 [Arno V]: fixing session manager ping url
    67fe7d6 [Arno V]: webapp: adding session manager to common pages

__0.0.79 / 2014-02-02__

    040c682 [Arno V]: Moving from commanderjs to optimist
    54ed9e3 [Arno V]: Typo fix
    898e45d [Arno V]: webapp: Gruntfile cleanup
    1cfee04 [Arno V]: webapp: adding wf2-footer to main template
    dc22be7 [Arno V]: webapp: bypass shifter lint
    dc0aeeb [Arno V]: WAR: sending more error email notifications
    79407d7 [Arno V]: webapp: automatically generates lang/flow.js from lang/flow_en.js
    c3d548e [Arno V]: webapp: producing prod ready js files if needed
    386e679 [Arno V]: Merge branch 'master' of https://github.com/aversini/fedtools
    1027187 [Arno V]: webapp: adding lang support on the js side
    838273a [Arno V]: app: fix incorrect name spacing for code css
    af6b185 [Arno V]: app: update to latest jetty plugin
    8a7ad73 [Arno V]: app: add extra comment to tell 'do not modify, automatically generated file...'

__0.0.78 / 2014-01-24__

    d61e7ca [Arno V]: More explicit prompt for 'git username'
    d1c3f61 [Arno V]: Relaxing jshint requirements for single vs double quotes
    a4dc8f1 [Arno V]: Relaxing Jshint for single vs double quotes: now it's only checking for mixed
    da8dd2f [Arno V]: Small update for App bootstrap (remove extra navigation for basic flow)

__0.0.77 / 2014-01-20__

    69261fe [Arno V]: Command line optimization: delaying 'requires' until they're needed

__0.0.76 / 2014-01-19__

    7196119 [Arno V]: remote war: instead of trying (and failing) to move the war file to the home folder of the war builder, leave it in the tmp dir which will be automatically removed after a while.
    b036d72 [Arno V]: war: replacing fs.renameSync with own version to prevent error on linux and renaming on different partitions

__0.0.75 / 2014-01-18__

    b14e5b5 [Arno V]: war: make sure the file is where it's supposed to be...

__0.0.74 / 2014-01-18__

    ee23228 [Arno V]: Ooops, adding back maven build!
    f4f4429 [Arno V]: war: add completion time to notification
    012fe2b [Arno V]: war: fix email 'from' for WF rules
    80b1a92 [Arno V]: war: better notifications

__0.0.73 / 2014-01-17__

    69b5082 [Arno V]: webapp: minor typos
    ffe1fb5 [Arno V]: Moving jshint from shifter to grunt

__0.0.72 / 2014-01-17__

    f479895 [Arno V]: Remembering user name, user email and user branch for next time WAR build is run
    00de491 [Arno V]: Fixing history file...

__0.0.71 / 2014-01-17__

    d793c36 [Arno V]: war: final cleanup
    1a17f52 [Arno V]: war
    2ec7a99 [Arno V]: war
    784dede [Arno V]: war
    1515c08 [Arno V]: war
    a7d2d55 [Arno V]: waar
    460ed26 [Arno V]: war: final pass?
    76782ef [Arno V]: war
    ad7435c [Arno V]: war
    c2c1699 [Arno V]: waaarzaza
    a7e148e [Arno V]: war: debugging
    ce0297c [Arno V]: wwwaaarr
    98b60bd [Arno V]: warrr
    181365d [Arno V]: waar
    29a009e [Arno V]: war war war
    cc1e955 [Arno V]: War...
    e89ca17 [Arno V]: war: wip
    bc5a121 [Arno V]: war update
    d52c189 [Arno V]: war: wip
    7b9dbbd [Arno V]: war: fixes
    6ac8844 [Arno V]: war: work in progress

__0.0.70 / 2014-01-10__

    1d00561 [Arno V]: Merge pull request #22 from aversini/war
    f685c79 [Arno V]: remove test
    8a0f727 [Arno V]: war: fix display issue for ... windows!
    10c32df [Arno V]: war: do not scp on freaking windows, it doesn't work
    5a037a0 [Arno V]: war: missing package dependency
    7c33045 [Arno V]: war: fix typo
    526ed4d [Arno V]: WAR: using own version of scp (using ssh2) instead of scp2 which is buggy
    d174ef4 [Arno V]: WAR: cleanup
    a58ca3b [Arno V]: WAR: the name of the local WAR file has changed
    5c9979d [Arno V]: WAR: sh* load of changes
    9854131 [Arno V]: WAR: prevent remote and local build from reporting elapsed time twice
    dc0a12a [Arno V]: Fix prompt of type 'password' to prevent empty password
    b51163a [Arno V]: war: setting remote flag
    10710d5 [Arno V]: war: update
    065ae63 [Arno V]: war: update
    48d61b8 [Arno V]: war: update to use home directory if on remote
    be0fe5a [Arno V]: war: still work in progress :)
    5c81f44 [Arno V]: war: moar work in progress
    8a1f74a [Arno V]: war: work in progress
    5d3e9a3 [Arno V]: war: first pass at remote ssh fedtools

__0.0.69 / 2014-01-07__

    7e1f2dc [Arno V]: Fixing lint errors!
    eae3c39 [Arno V]: Removing obsolete script
    3c494d4 [Arno V]: Making sure that shifter, yogi and maven are installed to actually run a WAR build
    f9b519a [Arno V]: Adding 'isAppInstalled' to utilities and removing the script that was used to check yogi/shifter at installation time. This fixes issue #19
    7255d40 [Arno V]: webapp: fedtools helper update
    4822be3 [Arno V]: webapp: adding debug js files generation at build time (on top of min)
    c516e52 [Arno V]: webapp: using fedtools-maven-plugin 0.0.3
    3a00bde [Arno V]: webapp: updating jshint and calling it from 'build'
    14e057a [Arno V]: webapp: i18n java side
    de865ab [Arno V]: webapp: first pass at README.md

__0.0.68 / 2014-01-05__

    1239e6a [Arno V]: webapp: default tags are now 2.2.0-SNAPSHOT
    2fe5341 [Arno V]: webapp: refactoring the extended flow

__0.0.67 / 2014-01-05__

    fbf15b1 [Arno V]: webapp: adding an extended flow to showcase containers and grids
    5d9b4d2 [Arno V]: webapp: adding a few default css rules
    7798b22 [Arno V]: webapp: add scss to grunt watch
    5c93bd0 [Arno V]: webapp: grunt watch update
    345fcf8 [Arno V]: webapp: renaming pagex.js into modulex.js
    62859f9 [Arno V]: webapp: some cleanup for flow creation
    7d7795d [Arno V]: webapp: preventing creation of flow named 'common'
    ca1dcc4 [Arno V]: webapp: adding custom CSS support
    ab5e5b6 [Arno V]: webapp: change <head title> to name-version of app
    421446c [Arno V]: webapp: better final wording during skeleton bootstrap
    8f70542 [Arno V]: webapp: moving common js script from common template to flows (that need it)
    1905e70 [Arno V]: webapp: grunt-minifier more generic
    56b49ee [Arno V]: Adding a special option for 'fedtools bump': build or combo
    620d4ca [Arno V]: Fixing fedtools bump (invalid path option)
    abbc246 [Arno V]: Fixing json file update (to keep indentation instead of flattening the file)
    fe9e039 [Arno V]: Merge pull request #21 from aversini/webapp
    e6fa22f [Arno V]: webapp: fixing utf8 trailing character
    cfdfdbb [Arno V]: webapp: including 'mvn clean' to bootstrap
    1291176 [Arno V]: webapp: renaming default first flow to 'home'
    7c00955 [Arno V]: webapp: adding build time information
    4d584b5 [Arno V]: webapp: cleanup appnav example
    c3f1568 [Arno V]: webapp: fix multiple flows minification
    15f3d1a [Arno V]: webapp: fix flow dependency
    0c9b105 [Arno V]: webapp: removing duplicate
    04315c9 [Arno V]: webapp: Fix existing flow detection
    79aff8e [Arno V]: webapp: removing extra page
    68e88d4 [Arno V]: webapp: small cleanup
    56af254 [Arno V]: webapp: update
    03f0a35 [Arno V]: webapp work in progress
    b521337 [Arno V]: Merge branch 'refs/heads/master' into webapp
    9298da5 [Arno V]: work in progress
    77844dc [Arno V]: First commit for webapp

__0.0.65 / 2014-01-01__

    e4fd7ad [Arno V]: Better wording at the end of a WAR build
    77e2c61 [Arno V]: Merge pull request #20 from aversini/war
    7892bb9 [Arno V]: Fixing WAR build: new war location
    9ea8b52 [Arno V]: Some cleanup
    27c5de4 [Arno V]: Add a new git helper command: getCurrent SHA
    3fbead8 [Arno V]: Merge branch 'war' of https://github.com/aversini/fedtools into war
    7bf4469 [Arno V]: WAR: asking for branch and yui3 branch
    80eb6e8 [Arno V]: work in progress: trying to externalize wf2 build from maven
    18937ee [Arno V]: WAR: asking for branch and yui3 branch
    364fe66 [Arno V]: work in progress: trying to externalize wf2 build from maven

__0.0.63 / 2013-12-20__

    a7aebb7 [Arno V]: Adding utilities.wria2bump to increase the version of the framework

__0.0.62 / 2013-12-19__

    36e3b7f [Arno V]: Fix for Mac/Linux (bleed from windows previous fix…)

__0.0.60 / 2013-12-19__

    92cc37e [Arno V]: Enabling WAR creation for poor windows users
    6a343ff [Arno V]: Making windows commands happy

__0.0.58 / 2013-12-18__

    b5749fb [Arno V]: Minor typo
    adbc806 [Arno V]: Enabling WAR for linux/Mac
    5df3ba7 [Arno V]: Using 'utilities.getTemporaryDir()'
    1f20d68 [Arno V]: Creating API to create temporary dir for fedtools
    f542418 [Arno V]: typo
    04667e8 [Arno V]: Adding YUI3 clone to the WAR creation process
    5fc4a2d [Arno V]: Optimizing YUI3 clone (shallow copy instead of full)
    ecd3291 [Arno V]: Fixing git clone helper: trailing space was breaking the parsing
    6775db1 [Arno V]: Refactoring WAR creation
    d370a61 [Arno V]: Adding the option to have no default value from a prompt by passing undefined as the default value!
    9bd47b5 [Arno V]: Adding extra options to git clone
    acaf858 [Arno V]: Default branch is now 'develop'

__0.0.56 / 2013-12-16__

    fd24a53 [Arno V]: Updating README to talk about module creation
    63c7f59 [Arno V]: Adding gitignore file per created module
    d7157bf [Arno V]: Fix module creation if not wria2 repo
    adb6f4a [Arno V]: Fixing module creation issue #18
    3f7550a [Arno V]: If combo is disabled, default is to continue disabled

__0.0.54 / 2013-12-14__

    a38d0fb [Arno V]: Disabling WAR génération completely (wria2 repo is not ready)

__0.0.53 / 2013-12-14__

    296d18a [Arno V]: Merge pull request #17 from aversini/war
    eac634e [Arno V]: Temporarily disabling WAR generation for Windows
    1278681 [Arno V]: Using os specific tmp directory
    eb7a8ad [Arno V]: ignoring sublime project files
    7af9bce [Arno V]: making windows happy (gawk vs awk and \r\n vs \n)
    4e1c1f0 [Arno V]: Better wording for WAR build
    730d21e [Arno V]: Adding WAR generation as a new fedtools command
    0e8c2c5 [Arno V]: Merge pull request #16 from gurumvg/issue#14
    1bbc2b9 [Venkataguru Mitta]: Fixing issue#14
    7797ebd [Arno V]: Adding name and version to package to fix issue #15
    b30af0c [Arno V]: Merge branch 'master' of https://github.com/aversini/fedtools
    42aa02e [Arno V]: Removing hash from HISTORY... doesn't show up in github
    e9f2796 [Arno V]: Update HISTORY.md

__0.0.52 / 2013-12-10__

    3e802df [Arno V]: using full commit hash so that Github is happy

__0.0.51 / 2013-12-10__

    24056fe [Arno V]: Removing debug from Gruntfile
    dbaab82 [Arno V]: Adding abbreviated commit hash to HISTORY logs

__0.0.50 / 2013-12-10__

    755ef27 [Arno V]: Cleaning up package dependencies

__0.0.49 / 2013-12-10__

    68d1377 [Arno V]: fixing script to detect shifter and yogi
    22a4459 [Arno V]: missing script to check for yogi/shifter
    fbad9fa [Arno V]: Removing shifter and yogi dependency - just error message if not installed

__0.0.48 / 2013-12-10__

    c790a1f [Arno V]: Bundling shifter and yogi to try to ease the installation part of fedtools
    2636d7a [Arno V]: fix typo

__0.0.47 / 2013-12-10__

    9782f14 [Arno V]: Fix history versioning with the latest tag
    062243f [Arno V]: Fixing history version

__0.0.46 / 2013-12-10__

    baa584a [Arno V]: Merge pull request #13 from aversini/history
    fe2e83a [Arno V]: Adding commit history grunt task
    0698384 [Arno V]: work in progress
    01e0c93 [Arno V]: Adding HISTORY.md

__0.0.45 / 2013-12-09__

    9283f56 [Arno V]: release 0.0.45
    ad045eb [Arno V]: Component build optimization
    7df939b [Arno V]: Merge pull request #12 from gurumvg/issue#11
    08c34db [Venkataguru Mitta]: Removing even wf2-compass.js entry in build.json for js modules.
    a54256b [Venkataguru Mitta]: Removing even CSS_PREFIX template for js modules
    f6b698a [Venkataguru Mitta]: Fixing issue#11

__0.0.44 / 2013-12-06__

    4563368 [Arno V]: release 0.0.44
    3ba989a [Arno V]: Minor content update
    5764680 [Arno V]: Removing old unused files
    649c1de [Arno V]: Grunt release check task: proxy or no proxy option
    24b1bbe [Arno V]: Adding node:true to jshint options for git hooks
    b0250c1 [Arno V]: Externalizing 'installLocalNpmPackages' to utilities
    32bc240 [Arno V]: Refining help page a little bit

__0.0.43 / 2013-12-05__

    8477c0f [Arno V]: release 0.0.43

__0.0.42 / 2013-12-05__

    dc9d349 [Arno V]: release 0.0.42
    a181b4a [Arno V]: Merge pull request #8 from gurumvg/add-yuidoc-support
    a1d2adc [Arno V]: Merge pull request #10 from gerardkcohen/meta-json
    38925a9 [Gerard K. Cohen]: Issue #9: Add 'base-build' to meta.json requires
    2a95398 [Venkataguru Mitta]: #7 - Add a commad to View API Docs

__0.0.41 / 2013-12-04__

    5bb982c [Arno V]: release 0.0.41

__0.0.40 / 2013-12-04__

    01a1f05 [Arno V]: release 0.0.40
    9de1cb6 [Arno V]: moving wria2 module template to own directory
    529f146 [Arno V]: Moar explicit warning

__0.0.39 / 2013-12-04__

    9bc2c82 [Arno V]: release 0.0.39

__0.0.38 / 2013-12-04__

    695ad52 [Arno V]: release 0.0.38
    6a3b59f [Arno V]: moving upstream configuration step before yui3 syncing (just in case the yui3 part fails)

__0.0.37 / 2013-12-04__

    f14efc4 [Arno V]: release 0.0.37
    c8f53ba [Arno V]: Adding color to the help page
    26c9044 [Arno V]: add error message if check fails
    1a9b98f [Arno V]: dev tools update

__0.0.36 / 2013-12-04__

    5d35a80 [Arno V]: release 0.0.36
    15c2d39 [Arno V]: Adding dev grunt task to validate the published package

__0.0.35 / 2013-12-03__

    f4f5250 [Arno V]: release 0.0.35
    d8df660 [Arno V]: Cannot start selleck if path is not wria2 path

__0.0.34 / 2013-12-03__

    9b46920 [Arno V]: release 0.0.34
    4b6c593 [Arno V]: Adding 'wss' or 'wria2-selleck' to start Selleck to server example pages
    87e1a71 [Arno V]: Adding the possibility to start a server (selleck is the first one)

__0.0.33 / 2013-12-02__

    188673e [Arno V]: release 0.0.33

__0.0.32 / 2013-12-02__

    5643f0e [Arno V]: release 0.0.32
    4457ed7 [Arno V]: removing old commands.js
    eb17306 [Arno V]: moving to fedtools-commands
    81a5c3d [Arno V]: cleanup
    8300e21 [Arno V]: using fedtools-commands
    1983b27 [Arno V]: adding dependency to fedtools-commands
    a4e75e6 [Arno V]: move to fedtools-commands

__0.0.31 / 2013-12-01__

    ca64554 [Arno V]: release 0.0.31
    c1f9f03 [Arno V]: Adding soy templates compilation

__0.0.30 / 2013-12-01__

    74a3e05 [Arno V]: release 0.0.30
    7e2779c [Arno V]: Externalizing fedtools-logs

__0.0.29 / 2013-12-01__

    5e2e8f2 [Arno V]: release 0.0.29
    58f261e [Arno V]: Reorganization of the help results for narrower terminals (I'm looking at you Windows)
    9155f3f [Arno V]: Adding 2 new utilities: isWindows and wordWrap
    82aaa95 [Arno V]: Reducing the max length of a status message to accommodate windows shells (much narrower and not easy to resize)
    d7234c2 [Arno V]: More explicit message for commit failure on empty JIRA ticket

__0.0.28 / 2013-11-28__

    21ee358 [Arno Versini]: release 0.0.28
    1a5e2da [Arno Versini]: For a full build, always prompt for the combo loader flag

__0.0.27 / 2013-11-27__

    fd78872 [Arno V]: release 0.0.27
    7d30071 [Arno V]: replacing "rm -rf" and "mkdir -p" with native nodejs packages

__0.0.26 / 2013-11-27__

    c8e0a93 [Arno V]: release 0.0.26
    616090b [Arno V]: Adding nom install in build dir on init, even if not built

__0.0.25 / 2013-11-26__

    39a8743 [Arno V]: release 0.0.25
    4994b67 [Arno V]: Adding remote pointing to upstream during bootstrap

__0.0.24 / 2013-11-26__

    8b02d60 [Arno V]: release 0.0.24
    5e1b724 [Arno V]: Adding option to enter a 'gitlab id' for the git repo
    bd51d1a [Arno V]: Fixing missing path for full build

__0.0.23 / 2013-11-26__

    01a9db3 [Arno V]: release 0.0.23

__0.0.22 / 2013-11-26__

    ca8b6a3 [Arno V]: release 0.0.22
    3298428 [Arno V]: Fixing automatic build confirmation
    f784944 [Arno V]: Merge branch 'master' of https://github.com/aversini/fedtools
    707f836 [Arno V]: Better error handling of invalid YUI3 branch
    a6ce445 [Arno V]: Adding fetch to git checkout helper

__0.0.21 / 2013-11-25__

    73bf46d [Arno V]: release 0.0.21
    dfd06e9 [Arno V]: rewording at the end of init

__0.0.20 / 2013-11-25__

    42b9483 [Arno V]: release 0.0.20
    ec8a988 [Arno V]: Adding 'watch' option

__0.0.19 / 2013-11-25__

    1d237e2 [Arno V]: release 0.0.19
    b93e5a0 [Arno V]: shifter is fixed, no need to use my own version
    aee1665 [Arno V]: Externalize yui3utils variables

__0.0.18 / 2013-11-24__

    4f8064c [Arno V]: release 0.0.18
    e442b72 [Arno V]: Fix selleck log for windows

__0.0.17 / 2013-11-23__

    d3d2681 [Arno V]: release 0.0.17
    f131af2 [Arno V]: extra callback call removed

__0.0.16 / 2013-11-23__

    cc8a73d [Arno V]: release 0.0.16
    ec5c4fa [Arno V]: Adding extra info on how to start selleck on bootstrap
    1fe2301 [Arno V]: removing dead code
    68ecf6f [Arno V]: Adding the combo option to the bootstrap flow
    b7a9816 [Arno V]: Adding the option to bypass build confirmation, as well as to update the shifter.json if needed (for combo or not)
    95f9bb3 [Arno V]: Using my shifter until the gear/gear-lib dependency is fixed
    c8416a2 [Arno V]: If command is too long, display only the binary in the command execution
    a568028 [Arno V]: Addinf shifter and yogi to local dependencies
    69c397e [Arno Versini]: work in progress
    8876ad6 [Arno V]: work in progress
    6cb65b4 [Arno V]: Add option to build from another path
    7816cc1 [Arno V]: Better comments for the ATTRS property

__0.0.15 / 2013-11-21__

    7178774 [Arno V]: release 0.0.15
    d24ebe1 [Arno V]: Extra comment in the js template
    67fcfe4 [Arno V]: Adding the tree display for wt2 module creation

__0.0.14 / 2013-11-21__

    8635750 [Arno V]: release 0.0.14
    6261be8 [Arno V]: Adding comments to the generated js file

__0.0.13 / 2013-11-21__

    6732695 [Arno V]: release 0.0.13
    f1af52b [Arno V]: wria2-mod: name 'wf-xyz' is equivalent to 'xyz'
    cedb9ae [Arno V]: Adding wt2 creation

__0.0.12 / 2013-11-21__

    55c9fc8 [Arno V]: release 0.0.12
    129ff3d [Arno V]: Enabling release task… time to try it :)

__0.0.11 / 2013-11-21__

    a2faae0 [Arno V]: Updating release task
