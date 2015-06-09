# grunt-build-release

> Grunt plugin for build releases.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-build-release --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-build-release');
```

### Overview
Task for git tagging releases. Tags are calculated on the basis of date with following format.

`v<ENV>-yy.MM.dd.<build-number>`

`<ENV>` - defaults to RELEASE but can be provided from outside.
`<build-number>` - starts with 1 and increased accordingly if there are more than one releases in the day.

build_release is not a multitask, you need to call it directly without any targets like in [Usage Examples](#Usage Examples) below

### Usage Examples
Subsequent calls will do following.

```shell
grunt build_release
```
Will create tag vRELEASE-15.06.09.1

```shell
grunt build_release:PROD
```
Will create tag vPROD-15.06.09.2

```shell
grunt build_release
```
Will create tag vRELEASE-15.06.09.3

```shell
grunt build_release:PRE-PROD
```
Will create tag vPRE-PROD-15.06.09.4

```shell
grunt build_release:RELEASE
```
Will create tag vRELEASE-15.06.09.5


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

