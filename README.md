# My way to customize a Boostrap 3 bower install

I got a problematic at my work today, how do you customize a Boostrap bower install ?

For his customization, Bootstrap use a `variables.less` file which contain all useful variables. The website [getbootstrap](http://getbootstrap.com/customize/) allow you to easily customize

Most of blog posts I've read, talked about using a *quite strange* `bootstrap-sass` dependencie, why use it and not the default `bootstrap` dependencie ? I WANT MY DEFAULT BOOTSTRAP LIBRARY !

## Context :
- Bower : used to download dependencies (and of course Bootstrap)
- Gulp : used to customize our install
- LESS : to compile our install into CSS

## Bower
First, imagine we got a `bower.json` which look like this :

```json
{
  "version": "1.0.0",
  "name": "customize-bootstrap-bower-install",
  "dependencies": {
    "bootstrap": "^3.3.6"
  }
}
```

We define as dependencie the version `3.x.x` of `bootstrap`. The first problem we encounter is that by default, Bootstrap define these main files in his `bower.json` :

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

So we're gonna overrides them in our `bower.json` to only use his uncompiled less files, except the `variables.less` file, which we want to override by our :

```json
{
  "version": "1.0.0",
  "name": "customize-bootstrap-bower-install",
  "dependencies": {
    "bootstrap": "^3.3.6"
  },
  "overrides": {
    "bootstrap": {
      "main": [
        "./less/**/!(variables).less"
      ]
    }
  }
}
```

*If you want, you can add other needed main files, like the Javascript or the fonts, but don't add other style's files like CSS or SASS.*

## Gulp
Now we got our Bootstrap defined with the good main files, we can create a Gulp task which gonna build our `bootstrap.css` with **our** `variables.less`

```js
var gulp   = require('gulp');
var filter = require('gulp-filter');
var less   = require('gulp-less');
var concat = require('gulp-concat');

var bower  = require('main-bower-files');
var merge  = require('merge2');

gulp.task('bootstrap', function(){
  return merge(
      // The path to the variables.less depend on your app structure
      gulp.src('variables.less'),
      gulp.src(bower())
        // We filter to only get bootstrap less files defined in our overrides
        .pipe(filter('bower_components/bootstrap/**/*.less'))
    )
    .pipe(less())
    .pipe(concat('bootstrap.css'))
    // Set the destination you want !
    .pipe(gulp.dest('/tmp'));
});
```

You can use [gulp-plumber](https://www.npmjs.com/package/gulp-plumber) and [gulp-print](https://www.npmjs.com/package/gulp-print) to debug the gulp task if you need !
