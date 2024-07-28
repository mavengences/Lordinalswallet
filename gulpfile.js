var webpack = require('webpack');
var webpackConfigFunc = require('./webpack.config');
var gulp = require('gulp');
var zip = require('gulp-zip');
var clean = require('gulp-clean');
var minimist = require('minimist');
var packageConfig = require('./package.json');
const { exit } = require('process');
const uglify = require('gulp-uglify');
const fs = require('fs');

// Parse arguments
var knownOptions = {
  string: ['env', 'browser', 'manifest', 'channel'],
  default: {
    env: 'dev',
    browser: 'chrome',
    manifest: 'mv3',
    channel: 'store'
  }
};

var supported_envs = ['dev', 'pro'];
var supported_browsers = ['chrome', 'firefox', 'edge', 'brave'];
var supported_mvs = ['mv2', 'mv3'];
var brandName = 'lordinals';
var version = packageConfig.version;
var validVersion = version.split('-beta')[0];
var options = {
  env: knownOptions.default.env,
  browser: knownOptions.default.browser,
  manifest: knownOptions.default.manifest
};
options = minimist(process.argv.slice(2), knownOptions);
if (!supported_envs.includes(options.env)) {
  console.error(`not supported env: [${options.env}]. It should be one of ${supported_envs.join(', ')}.`);
  exit(0);
}
if (!supported_browsers.includes(options.browser)) {
  console.error(`not supported browser: [${options.browser}]. It should be one of ${supported_browsers.join(', ')}.`);
  exit(0);
}
if (!supported_mvs.includes(options.manifest)) {
  console.error(`not supported manifest version: [${options.manifest}]. It should be one of ${supported_mvs.join(', ')}.`);
  exit(0);
}

// Tasks
function task_clean() {
  return gulp.src(`dist/${options.browser}/*`, { read: false }).pipe(clean());
}

function task_prepare() {
  return gulp.src('build/_raw/**/*').pipe(gulp.dest(`dist/${options.browser}`));
}

function task_write_manifest() {
  const manifestV3 = {
    "manifest_version": 3,
    "name": "__MSG_appName__",
    "version": validVersion,
    "default_locale": "en",
    "description": "__MSG_appDescription__",
    "icons": {
      "16": "/images/logo/logo@16x.png",
      "32": "/images/logo/logo@32x.png",
      "48": "/images/logo/logo@48x.png",
      "128": "/images/logo/logo@128x.png"
    },
    "action": {
      "default_popup": "index.html",
      "default_icon": {
        "16": "/images/logo/logo@16x.png",
        "32": "/images/logo/logo@32x.png",
        "48": "/images/logo/logo@48x.png",
        "128": "/images/logo/logo@128x.png"
      },
      "default_title": "__MSG_appName__"
    },
    "author": "https://lordinal.io",
    "background": {
      "service_worker": "background.js"
    },
    "homepage_url": "https://lordinal.io",
    "permissions": [
      "storage",
      "unlimitedStorage",
      "activeTab"
    ],
    "short_name": "__MSG_appName__",
    "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": ["content-script.js"],
        "run_at": "document_start",
        "all_frames": true
      }
    ],
    "content_security_policy": {
      "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
    },
    "web_accessible_resources": [
      {
        "resources": ["pageProvider.js"],
        "matches": ["<all_urls>"]
      }
    ],
    "externally_connectable": {
      "matches": ["https://lordinal.io/*"]
    },
    "minimum_chrome_version": "88"
  };

  const manifestFile = JSON.stringify(manifestV3, null, 2); // Pretty print the JSON
  return fs.promises.writeFile(`dist/${options.browser}/manifest.json`, manifestFile);
}

function task_clean_tmps() {
  return gulp.src(`dist/${options.browser}/manifest`, { read: false }).pipe(clean());
}

function task_webpack(cb) {
  webpack(
    webpackConfigFunc({
      version: validVersion,
      config: options.env,
      browser: options.browser,
      manifest: options.manifest,
      channel: options.channel
    }),
    cb
  );
}

function task_uglify(cb) {
  if (options.env === 'pro') {
    return gulp
      .src(`dist/${options.browser}/**/*.js`)
      .pipe(uglify())
      .pipe(gulp.dest(`dist/${options.browser}`));
  }
  cb();
}

function task_package(cb) {
  if (options.env === 'pro') {
    if (options.browser === 'firefox') {
      return gulp
        .src(`dist/${options.browser}/**/*`)
        .pipe(zip(`${brandName}-${options.browser}-${options.manifest}-v${version}.xpi`))
        .pipe(gulp.dest('./dist'));
    } else {
      return gulp
        .src(`dist/${options.browser}/**/*`)
        .pipe(zip(`${brandName}-${options.browser}-${options.manifest}-v${version}.zip`))
        .pipe(gulp.dest('./dist'));
    }
  }
  cb();
}

exports.build = gulp.series(
  task_clean,
  task_prepare,
  task_write_manifest,
  task_clean_tmps,
  task_webpack,
  task_uglify,
  task_package
);
