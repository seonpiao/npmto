#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');
var _ = require('underscore');
var mkdirp = require('mkdirp');
var path = require('path');

var argv = process.argv;

var installAll = function() {
  var cpArgv = process.argv.slice(2);
  cp.spawnSync('npm', cpArgv, {
    env: process.env,
    stdio: 'inherit'
  });
};

var installPackage = function(package) {
  cp.spawnSync('npm', ['install', package], {
    env: process.env,
    stdio: 'inherit'
  });
};

if (argv[2] === 'install') {
  //npmto install
  if (argv.length === 3) {
    installAll();
    var settings = JSON.parse(fs.readFileSync('package.json'));
    var npmtoPackage = settings.npmto || {
      "padnum": {
        "version": "~0.0.1",
        "to": "pages"
      }
    };
    _.each(npmtoPackage, function(config, name) {
      var package = config.url || (name + '@' + config.version)
      installPackage(package);
      var to = path.join(config.to, name);
      mkdirp.sync(to);
      fs.renameSync(path.join('node_modules', name), to);
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
