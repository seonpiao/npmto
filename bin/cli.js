#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');
var _ = require('underscore');
var mkdirp = require('mkdirp');
var path = require('path');
var Url = require('url');

var argv = process.argv;

var installAll = function() {
  var cpArgv = process.argv.slice(2);
  try {
    cp.spawnSync('npm', cpArgv, {
      env: process.env,
      stdio: 'inherit'
    });
  } catch (e) {
    console.warn('npm install all failed');
  }
};

var installPackage = function(package) {
  try {
    cp.spawnSync('npm', ['install', package], {
      env: process.env,
      stdio: 'inherit'
    });
  } catch (e) {
    console.warn('npm install ' + package + ' failed');
  }
};

if (argv[2] === 'install') {
  //npmto install
  if (argv.length === 3) {
    installAll();
    var settings = JSON.parse(fs.readFileSync('package.json'));
    var npmtoPackage = settings.npmto || {};
    _.each(npmtoPackage, function(config, name) {
      var package = name + '@' + config.version;
      var oldName = name;
      if (config.url) {
        package = config.url;
        oldName = path.basename(Url.parse(config.url).pathname, '.git');
      }
      installPackage(package);
      var to = path.join(config.to, name);
      var old = path.join('node_modules', oldName);
      mkdirp.sync(to);
      //空项目没有package.json
      try {
        if (!fs.existsSync(to) || JSON.parse(fs.readFileSync(path.join(to, 'package.json'))).version !== JSON.parse(fs.readFileSync(path.join(old, 'package.json'))).version) {
          fs.renameSync(old, to);
        }
      } catch (e) {}
    });
  } else {
    //当存在--save类参数时，commander会把后面的第一个package name当做参数值一块去掉
    argv = argv.filter(function(arg) {
      return arg.indexOf('--save') !== 0;
    });
    program
      .version('0.0.1')
      .command('install [otherPackages...]')
      .allowUnknownOption(true)
      .action(function(packages) {
        if (packages) {
          packages.forEach(function(oPackage) {
            console.log('package %s', oPackage);
          });
        }
      });
    program.parse(argv);
  }
}
