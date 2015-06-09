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

    console.log(CONTAINER);


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



    var gitDescribeOptions = '$(git rev-list --tags --max-count=1)';
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

        lastTag = stdout.trim();

        var lastVersion = lastTag.replace('v', '');
        lastVersion = lastVersion.split("-")[1];

        console.log('lastVersion : ', lastVersion);

        var splitVersion = lastVersion.split(".");
        var gitYear = splitVersion[0];
        var gitMonth = splitVersion[1];
        var gitDate = splitVersion[2];
        var gitBuildNumber = splitVersion[3];


        var today = new Date();
        var currYear = today.getYear()-100+"";
        var currMonth = (today.getMonth() + 1)<10 ? "0" + (today.getMonth() + 1): ""+(today.getMonth() + 1);
        var currDate = today.getDate()<10 ? "0" + today.getDate() : "" + today.getDate();


        var currBuildNumber = null;

        console.log(gitYear==currYear && gitMonth==currMonth && gitDate==currDate);

        console.log(gitYear);
        console.log(currYear)
        console.log(gitMonth==currMonth)
        console.log(gitDate==currDate)

        if(gitYear==currYear && gitMonth==currMonth && gitDate==currDate){
          currBuildNumber = ++gitBuildNumber;
        } else {
          currBuildNumber = 1;
        }

        var version = currYear+"." + currMonth + "." + currDate + "." +  currBuildNumber;

        console.log('version : ', version);

        tagName = "v" + options.CONTAINER + "-" + version;

        next();
      });
    });

    runIf(true, function(){
      var cmd = 'git shortlog --oneline --no-merges -n ' + lastTag + '..HEAD';

      exec(cmd , function(err, stdout, stderr) {
        tagMessage = stdout.trim();
        console.log('tagMessage : ', tagMessage);
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
