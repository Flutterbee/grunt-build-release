/*
 * grunt-build-release
 * https://github.com/vishwanath/grunt-build-release
 *
 * Copyright (c) 2015 Vishwanath
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var exec = require('child_process').exec;


  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('build_release', 'Grunt plugin for build releases, tagging and raygun deployment', function(CONTAINER) {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      createTag : true,
      push : true,
      pushTo : 'origin',
      CONTAINER : CONTAINER || 'RELEASE'
    });


    var done = this.async();
    var queue = [];
    var next = function() {
      if (!queue.length) {
        return done();
      }
      queue.shift()();
    };
    var runIf = function(condition, behavior) {
      if (condition) {
        queue.push(behavior);
      }
    };



    var gitDescribeOptions = '$(git for-each-ref refs/tags --sort=-taggerdate --format="%(refname)" --count=1)';
    var done = this.async();
    var dryRun = false;

    var tagName = null;
    var tagMessage = null;
    var lastTag = null;

    runIf(true, function(){
      exec('git describe ' + gitDescribeOptions, function(err, stdout) {
        if (err) {
          grunt.fatal('Can not get a version number using `git describe`' + JSON.stringify(err) );
        }

        var currBuildNumber = 1;
        lastTag = stdout.trim();

        var lastVersion = lastTag.substr(lastTag.length-10); //Take last 10 digits

        var now = new Date();
        var today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

        var currYear = today.getYear()-100+"";
        var currMonth = (today.getMonth() + 1)<10 ? "0" + (today.getMonth() + 1): ""+(today.getMonth() + 1);
        var currDate = today.getDate()<10 ? "0" + today.getDate() : "" + today.getDate();

        if(lastVersion && (/^\d\d\.\d\d\.\d\d\.\d{1,2}$/).test(lastVersion)){
          var splitVersion = lastVersion.split(".");
          var gitYear = splitVersion[0];
          var gitMonth = splitVersion[1];
          var gitDate = splitVersion[2];
          var gitBuildNumber = splitVersion[3];

          if(gitYear==currYear && gitMonth==currMonth && gitDate==currDate){
            currBuildNumber = ++gitBuildNumber;
          }
        }

        var version = currYear+"." + currMonth + "." + currDate + "." +  currBuildNumber;
        tagName = "v" + options.CONTAINER + "-" + version;

        next();
      });
    });

    runIf(true, function(){
      var cmd = 'git shortlog --oneline --no-merges -n ' + lastTag + '..HEAD';

      exec(cmd , function(err, stdout, stderr) {
        tagMessage = stdout.trim().replace(/"/g, '');
        tagMessage = tagMessage.replace(/`/g, '');
        next();
      });


    })

    // CREATE TAG
    runIf(options.createTag, function() {

      var cmd = 'git tag -a ' + tagName + ' -m "' + tagMessage + '"';
      if (dryRun) {
        grunt.log.ok('bump-dry: ' + cmd);
        next();
      } else {
        exec(cmd , function(err, stdout, stderr) {
          if (err) {
            grunt.fatal('Can not create the tag:\n  ' + stderr);
          }
          grunt.log.ok('Tagged as "' + tagName + '"');
          next();
        });
      }
    });

    // PUSH CHANGES
    runIf(options.push, function() {

      var cmd = 'git push ' + options.pushTo + ' ' + tagName;
      if (dryRun) {
        grunt.log.ok('bump-dry: ' + cmd);
        next();
      } else {
        exec(cmd, function(err, stdout, stderr) {
          if (err) {
            grunt.fatal('Can not push to ' + options.pushTo + ':\n  ' + stderr);
          }
          grunt.log.ok('Pushed to ' + options.pushTo);
          next();
        });
      }
    });

    //First trigger
    next();

  });

};
