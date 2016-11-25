# My own way to customize a Boostrap 3 installed with Bower

I got a problematic at work today, how do you customize Boostrap when you installed it with bower ?

If you look in the Bootstrap repository, you'll see that the style is built with LESS files. And for his customization, it use a `variables.less` file which contain all useful variables. Also, the website [getbootstrap](http://getbootstrap.com/customize/) allow you to easily customize the variables, but directly compile a version of bootstrap and don't give you the `less` file likely generated, but a `config.json` file for their Grunt task. The problem is I don't use Grunt but Gulp, so how to handle this ?

Most of blog posts I've read, talked about using a *quite strange* `bootstrap-sass` dependencie, but why use it and not the default `bootstrap` dependencie ? I WANT MY DEFAULT BOOTSTRAP LIBRARY ! So here I am for my *real* first blog post.

## Bower
First, imagine a project where we got a `bower.json` like this :

```json
{
  "version": "1.0.0",
  "name": "customize-bootstrap-bower-install",
  "dependencies": {
    "bootstrap": "^3.3.6"
  }
}
```

We define as dependencie the version `3.x.x` of `bootstrap`. By default, Bootstrap define these main files in his `bower.json` :

```json
{
  "name": "bootstrap",
  "description": "The most popular front-end framework for developing responsive, mobile first projects on the web.",
  [...]
  "main": [
    "less/bootstrap.less",
    "dist/js/bootstrap.js"
  ],
  [...]
}
```

## LESS

If we look closer in the source of the library, we can found a `less` folder at the root, which contains many `less` files including the main file of the folder, the `bootstrap.less` file which merge all other `less` files :

```less
// Core variables and mixins
@import "variables.less";
@import "mixins.less";

// Reset and dependencies
@import "normalize.less";
[...]
```

I decided to use this file and create a Gulp task which gonna add the content of our `variables.less` file at the end before the compilation process, so that it will overrides the default variables. *I didn't specify it before, but you should copy the* `variables.less` *file from the bower_components folder of Bootstrap into your application assets folder, and edit it as you want.*

So for the style, by default, it's good ! We'll only need the `bootstrap.less` file. If you want to override the `main` key, you're free, but at least leave the `less/bootstrap.less` file, we need it ! And don't add other style files, it would be useless and could break the further Gulp task.

## Gulp
So, the goal of the task is to merge our 2 less files and then compile the result to CSS :
- `bootstrap.less` from the bootstrap library
- `variables.less` from our application

How to handle this in Gulp ? The solution I tought of was to merge the two files and compile them into CSS with a LESS compiler. The problem is that the `gulp-less` plugin handle each file independently, so it had no effect, the compiled file doesn't consider my `variables.less` revisions. So I needed a plugin which can create a temporary less file which handle to import, first the `bootstrap.less` file, and next my `variables.less` and **THEN** compile the result to CSS.

To do this, I found a plugin named [gulp-less-import](https://www.npmjs.com/package/gulp-plumber), which do exactly what I need, meaning create a temporary file which import my two file in the order I want, for a theoretical result like this :

```less
@import "bower_components/bootstrap/less/bootstrap.less";
@import "assets/style/variables.less";
```

Next, I just had to compile the result of the pipe to CSS with a LESS compiler, and it was done !
Here is the final task, use and edit it as you want !

```js
var gulp      = require('gulp');

var bower     = require('main-bower-files');
var merge     = require('merge2');
var filter    = require('gulp-filter');

var importify = require('gulp-less-import');
var less      = require('gulp-less');

gulp.task('bootstrap', function(){
  return merge(
      gulp.src(bower())
        // We filter to only get 'bootstrap.less' file defined in our overrides
        .pipe(filter('**/bootstrap.less')),
      // The path to the variables.less file, depend on your app structure
      gulp.src('./assets/style/variables.less')
    )
    .pipe(importify('bootstrap.css'))
    .pipe(less())
    // Set the destination you want !
    .pipe(gulp.dest('./dist/style'));
});
```

You can use [gulp-plumber](https://www.npmjs.com/package/gulp-plumber) and [gulp-print](https://www.npmjs.com/package/gulp-print) to debug the gulp task if you need !

## Issue

If we look closer, there could be an issue with our solution, imagine if another library has a `bootstrap.less` and we need to use it ? To be sure that we only use the `bootstrap.less` from the bootstrap library, we can use the key `group` in our `bower.json` file :

```json
{
  "name": "customize-bootstrap-bower-install",
  [...]
  "dependencies": {
    "bootstrap": "^3.3.7"
  },
  [...]
  "group": {
    "bootstrap": ["bootstrap"]
  }
}
```

By this way, we define a **group** with only the `bootstrap` library, and then, in our Gulp task, we can specify that we want to use only this group, and so the bootstrap library and his `bootstrap.less` file.

```js
var gulp      = require('gulp');

var bower     = require('main-bower-files');
var merge     = require('merge2');
var filter    = require('gulp-filter');

var importify = require('gulp-less-import');
var less      = require('gulp-less');

gulp.task('bootstrap', function(){
  return merge(
      gulp.src(bower({group: 'bootstrap'}))
        // We filter to only get bootstrap less file defined in our overrides
        .pipe(filter('**/*.less')),
      // The path to the variables.less file, depend on your app structure
      gulp.src('./assets/style/variables.less')
    )
    .pipe(importify('bootstrap.css'))
    .pipe(less())
    // Set the destination you want !
    .pipe(gulp.dest('./dist/style'));
});
```

You no longer need to be afraid of another library with a `bootstrap.less` file !
