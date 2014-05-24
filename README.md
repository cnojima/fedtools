# FED helper tools

## Installation

```
npm install -g fedtools
```

## Usage

### Bootstrap a WF-RIA2 repository

```
cd ~/projects
fedtools wria2-init
```
This will:

  - Ask for several options:
    - Do you want to clone or use an existing repository
    - Where do you want to clone (if you choose to clone)
    - Where is the local repository (if you choose not to clone)
    - Which branch do you want to checkout
    - Do you want to start a full build when the repo is ready
  - It will then bootstrap a wria2 repository:
    - Clone under the path you chose if you decided to clone
    - Install git hooks to lint your code at commit time
    - Switch to the branch you provided
    - Copy YUI3 source files into your repository
    - Start a full build if you chose to

### Build a full WF-RIA2 repository

```
cd ~/projects/wria2-git
fedtools wria2-build
```

### Build a single component

```
cd ~/projects/wria2-git/wf2/src/wf2-simplemenu
fedtools wria2-build
```
This will:

  - Build wf2-simplemenu
  - Rebuild yui and loader to take any meta configuration changes into account

### Create a wria2 module from scratch
```
cd ~/projects/wria2-git
fedtools wria2-mod
```
This will:

  - Ask for several options:
    - Do you want to create a widget (skinnable) or a simple js module
    - Do you also want to create a JSP tag template
    - What are the name, base class and namespace to be used
  - It will then generate the code of a functioning module
    - It will have support for skin NX and NXT
    - It will have a simple example page
    - It will have a simple unit test page
    - It will have a JSP tag template

## API for developers

An API documentation can be generated via YUIdoc. Since the API documentation is referring to not only fedtools, but also fedtools-commands and fedtools-logs, the generator has been moved to its own project: fedtools-api.

To generate the latest API, type the following commands:

```
git clone https://github.com/aversini/fedtools-api.git
cd fedtools-api
npm install
sudo npm install -g grunt-cli # if you don't already have it
grunt
```

That's it! This will spawn a local server and open the main page in your default browser.
