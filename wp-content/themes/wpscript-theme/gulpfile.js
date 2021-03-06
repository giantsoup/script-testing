/**
 * Gulpfile.
 *
 * Gulp with WordPress.
 *
 * Implements:
 *      1. Live reloads browser with BrowserSync.
 *      2. CSS: Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps,
 *         CSS minification, and Merge Media Queries.
 *      3. JS: Concatenates & uglifies Vendor and Custom JS files.
 *      4. Images: Minifies PNG, JPEG, GIF and SVG images.
 *      5. Watches files for changes in CSS or JS.
 *      6. Watches files for changes in PHP.
 *      7. Corrects the line endings.
 *      8. InjectCSS instead of browser page reload.
 *      9. Generates .pot file for i18n and l10n.
 *
 * @author Ahmad Awais (@ahmadawais)
 * @version 1.0.3
 */

/**
 * Configuration.
 *
 * Project Configuration for gulp tasks.
 *
 * In paths you can add <<glob or array of globs>>. Edit the variables as per your project requirements.
 */

// START Editing Project Variables.
// Project related.
var project                 = 'wpscript'; // Project Name, all lowercase, no spaces
var projectURL              = 'local.wpscript.com'; // Project URL. Could be something like dev.yoursite
var productURL              = './'; // Theme/Plugin URL. Leave it like it is, since our gulpfile.js lives in the root folder.
var tunnelname              = project.toLowerCase();

// Translation related.
var text_domain             = 'WPGULP'; // Your textdomain here.
var destFile                = 'WPGULP.pot'; // Name of the transalation file.
var packageName             = 'WPGULP'; // Package name.
var bugReport               = 'https://AhmadAwais.com/contact/'; // Where can users report bugs.
var lastTranslator          = 'Ahmad Awais <your_email@email.com>'; // Last translator Email ID.
var team                    = 'WPTie <your_email@email.com>'; // Team's Email ID.
var translatePath           = './languages' // Where to save the translation files.

// Style related.
var styleSRC                = './assets/src/sass/main.scss'; // Path to main .scss file.
var styleDestination        = './assets/dist/css/'; // Path to place the compiled CSS file.
// Defualt set to root folder.

// JS Vendor related.
var jsVendorSRC             = './assets/src/js/plugins/*.js'; // Path to JS vendor folder.
var jsVendorDestination     = './assets/dist/js/'; // Path to place the compiled JS vendors file.
var jsVendorFile            = 'plugins'; // Compiled JS vendors file name.
// Default set to vendors i.e. vendors.js.

// JS Custom related.
var jsCustomSRC             = './assets/src/js/*.js'; // Path to JS custom scripts folder.
var jsCustomDestination     = './assets/dist/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile            = 'main'; // Compiled JS custom file name.
// Default set to custom i.e. custom.js.

var jsModernizrSRC          = './assets/src/js/plugins/vendor/modernizr-3.0.0.min.js'; // Path to Modernizr file.
var jsModernizrDestination  = './assets/dist/js/plugins/'; // Path to place the Modernizr file.

// Images related.
var imagesSRC               = './assets/src/img/**/*.{png,jpg,jpeg,gif,svg}'; // Source folder of images which should be optimized.
var imagesDestination       = './assets/dist/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

// Fonts relate.
var fontsSRC                = './bower_components/font-awesome/fonts/**/*.{eot,woff,woff2,otf,svg,ttf}'; // Source folder of images which should be optimized.
var fontsDestination       = './assets/dist/fonts/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

// Watch files paths.
var styleWatchFiles         = './assets/src/sass/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var vendorJSWatchFiles      = './assets/src/js/plugins/*.js'; // Path to all vendor JS files.
var customJSWatchFiles      = './assets/src/js/*.js'; // Path to all custom JS files.
var projectPHPWatchFiles    = './**/*.php'; // Path to all PHP files.
var imagesWatchFiles        = 'assets/src/img/**/*.{png,jpg,jpeg,gif,svg}';
var fontsWatchFiles        = fontsSRC;
var watchAllFiles           = './**/*.{css,scss,js,php,png,jpg,jpef,gif,svg,eot,woff,woff2,otf,svg,ttf}';


// Browsers you care about for autoprefixing.
// Browserlist https        ://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
    'last 2 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
  ];

// STOP Editing Project Variables.

/**
 * Load Plugins.
 *
 * Load gulp plugins and assing them semantic names.
 */
var gulp         = require('gulp'); // Gulp of-course
var runSequence = require('run-sequence');

// CSS related plugins.
var sass         = require('gulp-sass'); // Gulp pluign for Sass compilation.
var purge        = require('gulp-css-purge'); // Gulp pluign for Sass compilation.
var minifycss    = require('gulp-uglifycss'); // Minifies CSS files.
var autoprefixer = require('gulp-autoprefixer'); // Autoprefixing magic.
var cssnano      = require('gulp-cssnano'); // Autoprefixing magic.
var mmq          = require('gulp-merge-media-queries'); // Combine matching media queries into one media query definition.

// JS related plugins.
var concat       = require('gulp-concat'); // Concatenates JS files
var gutil        = require('gulp-util');
var stripDebug   = require('gulp-strip-debug');
var uglify       = require('gulp-uglify'); // Minifies JS files
var jshint       = require('gulp-jshint');
var stylish      = require('jshint-stylish');

// Image realted plugins.
var imagemin     = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images with imagemin.
var del          = require('del');
var newer        = require('gulp-newer');

// Utility related plugins.
var rename       = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var lineec       = require('gulp-line-ending-corrector'); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings)
var filter       = require('gulp-filter'); // Enables you to work on a subset of the original files by filtering them using globbing.
var sourcemaps   = require('gulp-sourcemaps'); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css)
var notify       = require('gulp-notify'); // Sends message notification to you
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.
var wpPot        = require('gulp-wp-pot'); // For generating the .pot file.
var sort         = require('gulp-sort'); // Recommended to prevent unnecessary changes in pot-file.

/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 * This task does the following:
 *    1. Sets the project URL
 *    2. Sets inject CSS
 *    3. You may define a custom port
 *    4. You may want to stop the browser from openning automatically
 */
gulp.task( 'browser-sync', function() {
  return browserSync.init( {

    // For more options
    // @link http://www.browsersync.io/docs/options/
    // files: [
    //   watchAllFiles,
    // ],
    open: 'local',
    // logConnections: false,
    // host: projectURL,
    proxy: projectURL,
    injectChanges: true
    // online: true,
    // tunnel: tunnelname
  })
  // console.log('Watching Files...🔭');
});

/**
 * Task: `styles`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 *    1. Gets the source scss file
 *    2. Compiles Sass to CSS
 *    3. Writes Sourcemaps for it
 *    4. Autoprefixes it and generates style.css
 *    5. Renames the CSS file with suffix .min.css
 *    6. Minifies the CSS file and generates style.min.css
 *    7. Injects CSS or reloads the browser via browserSync
 */





 gulp.task('styles', function () {

    return gulp.src( styleSRC )


    // .pipe( sourcemaps.init() )
    .pipe( sass( {
      errLogToConsole: true,
      // outputStyle: 'compact',
      // outputStyle: 'compressed',
      outputStyle: 'nested',
      // outputStyle: 'expanded',
      precision: 10
    } ).on('error', sass.logError) )
    .pipe(purge())
    // .pipe( sourcemaps.write( { includeContent: false } ) )
    // .pipe( sourcemaps.init( { loadMaps: true } ) )
    .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )

    // .pipe( sourcemaps.write ( '.' ) )
    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
    .pipe( gulp.dest( styleDestination ) )

    .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
    .pipe( mmq() ) // Merge Media Queries only for .min.css version.

    .pipe( browserSync.stream() ) // Reloads style.css if that is enqueued.

    .pipe( rename( { suffix: '.min' } ) )

    .pipe(cssnano())

    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.

    .pipe( gulp.dest( styleDestination ) )

    .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
    // .pipe( browserSync.stream() )// Reloads style.min.css if that is enqueued.
    .pipe( notify( { message: 'TASK: "styles" Completed! 💯', onLast: true } ) )

 });



 /**
  * Task: `vendorJS`.
  *
  * Concatenate and uglify vendor JS scripts.
  *
  * This task does the following:
  *     1. Gets the source folder for JS vendor files
  *     2. Concatenates all the files and generates vendors.js
  *     3. Renames the JS file with suffix .min.js
  *     4. Uglifes/Minifies the JS file and generates vendors.min.js
  */
 gulp.task( 'vendorsJs', function() {
  return gulp.src( jsVendorSRC )

    .pipe( concat( jsVendorFile + '.js' ) )
    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
    .pipe( gulp.dest( jsVendorDestination ) )
    .pipe( rename( {
      basename: jsVendorFile,
      suffix: '.min'
    }))
    .pipe( uglify().on('error', gutil.log) )
    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
    .pipe( gulp.dest( jsVendorDestination ) )
    .pipe( notify( { message: 'TASK: "plugins.min.js" Completed! 💯', onLast: true } ) )

 });


 /**
  * Task: `customJS`.
  *
  * Concatenate and uglify custom JS scripts.
  *
  * This task does the following:
  *     1. Gets the source folder for JS custom files
  *     2. Concatenates all the files and generates custom.js
  *     3. Renames the JS file with suffix .min.js
  *     4. Uglifes/Minifies the JS file and generates custom.min.js
  */
 gulp.task( 'lintJS', function() {
    return gulp.src( jsCustomSRC )
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
 });
 gulp.task( 'customJS', function() {
    return gulp.src( jsCustomSRC )
    .pipe( concat( jsCustomFile + '.js' ) )
    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
    .pipe( gulp.dest( jsCustomDestination ) )
    .pipe( rename( {
      basename: jsCustomFile,
      suffix: '.min'
    }))
    .pipe( uglify().on('error', gutil.log) )
    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
    .pipe( gulp.dest( jsCustomDestination ) )
    .pipe( notify( { message: 'TASK: "main.min.js" Completed! 💯', onLast: true } ) )

 });


 /**
  * Task: `copy`.
  *
  * Move Modernizr file into the dist folder to be enqued.
  *
  * This task does the following:
  *     1. Gets the Modernizr file from source js plugins folder
  *     2. Copies and moves it to the dist folder
  *
  */
 gulp.task('copy', function () {
   return gulp.src( jsModernizrSRC )
     .pipe(gulp.dest( jsModernizrDestination ));
 });


 /**
  * Task: `images`.
  *
  * Minifies PNG, JPEG, GIF and SVG images.
  *
  * This task does the following:
  *     1. Gets the source of images raw folder
  *     2. Minifies PNG, JPEG, GIF and SVG images
  *     3. Generates and saves the optimized images
  *
  * This task will run only once, if you want to run it
  * again, do it with the command `gulp images`.
  */
gulp.task('clean-img', function (cb) {
  return del(imagesDestination,cb);
});


 gulp.task( 'images', function() {
  return gulp.src( imagesSRC )
    .pipe(newer(imagesDestination))
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 7}),
        imagemin.svgo({plugins: [{removeViewBox: true}]})
    ], {
      verbose:true
    }))

    .pipe(gulp.dest( imagesDestination ))
    .pipe( notify( { message: 'TASK: "images" Completed! 💯', onLast: true } ) )

 });

 gulp.task( 'fonts', function() {
  return gulp.src( fontsSRC )
    .pipe(gulp.dest( fontsDestination ))
    .pipe( notify( { message: 'TASK: "fonts" Completed! 💯', onLast: true } ) )
 });


 /**
  * WP POT Translation File Generator.
  *
  * * This task does the following:
  *     1. Gets the source of all the PHP files
  *     2. Sort files in stream by path or any custom sort comparator
  *     3. Applies wpPot with the variable set at the top of this file
  *     4. Generate a .pot file of i18n that can be used for l10n to build .mo file
  */
 gulp.task( 'translate', function () {
     return gulp.src( projectPHPWatchFiles )
         .pipe(sort())
         .pipe(wpPot( {
             domain        : text_domain,
             destFile      : destFile,
             package       : packageName,
             bugReport     : bugReport,
             lastTranslator: lastTranslator,
             team          : team
         } ))
        .pipe(gulp.dest(destFile))
        .pipe( notify( { message: 'TASK: "translate" Completed! 💯', onLast: true } ) )
 });

 /**
  * Watch Tasks.
  *
  * Watches for file changes and runs specific tasks.
*/


 /**
  * Build Task
  *
  * Processes and builds out distribution files without spinning up browsersync.
  */

// gulp.task( 'default', ['browser-sync', 'styles', 'vendorsJs', 'customJS', 'images', ], function () {


// });



gulp.task('default', ['styles', 'vendorsJs', 'customJS', 'images'], function(done) {
  runSequence('browser-sync', function() {


        gulp.watch(['assets/src/sass/**/*'], ['styles']);
        gulp.watch(['assets/src/js/**/*'], ['vendorsJs', 'customJS', 'lintJS', reload]);
        gulp.watch([imagesWatchFiles], ['images', 'fonts', 'clean-img', reload]);
        gulp.watch([fontsWatchFiles], ['fonts']);
        gulp.watch(['**/*.php'], reload);

        done();
  });

});


gulp.task( 'build', [ 'lintJS', 'vendorsJs', 'copy', 'customJS', 'styles', 'images', 'fonts', 'clean-img' ], function() {

});
