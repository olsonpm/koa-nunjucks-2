'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * koa-nunjucks-2
 * Copyright (c) 2016 strawbrary
 * MIT Licensed
 */
var bluebird = require('bluebird');
var defaults = require('lodash.defaults');
var difference = require('lodash.difference');
var merge = require('lodash.merge');
var path = require('path');
var nunjucks = require('nunjucks');

/**
 * @type {Object}
 */
var defaultSettings = {
  ext: 'njk', // Extension that will be automatically appended to the file name in this.render calls. Set to a falsy value to disable.
  path: '', // Path to the templates.
  writeResponse: true, // If true, writes the rendered output to response.body.
  functionName: 'render', // The name of the function that will be called to render the template
  nunjucksConfig: {}, // Object of Nunjucks config options.
  configureEnvironment: null };

/**
 * @param {Object=} config
 */
exports = module.exports = function () {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  defaults(config, defaultSettings);

  // Sanity check for unknown config options
  var configKeysArr = (0, _keys2.default)(config);
  var knownConfigKeysArr = (0, _keys2.default)(defaultSettings);
  if (configKeysArr.length > knownConfigKeysArr.length) {
    var unknownConfigKeys = difference(configKeysArr, knownConfigKeysArr);
    throw new Error('Unknown config option: ' + unknownConfigKeys.join(', '));
  }

  if (Array.isArray(config.path)) {
    config.path = config.path.map(function (item) {
      return path.resolve(process.cwd(), item);
    });
  } else {
    config.path = path.resolve(process.cwd(), config.path);
  }

  if (config.ext) {
    config.ext = '.' + config.ext.replace(/^\./, '');
  } else {
    config.ext = '';
  }

  var env = nunjucks.configure(config.path, config.nunjucksConfig);
  env.renderAsync = bluebird.promisify(env.render);

  if (typeof config.configureEnvironment === 'function') {
    config.configureEnvironment(env);
  }

  return function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!ctx[config.functionName]) {
                _context2.next = 2;
                break;
              }

              throw new Error('ctx.' + config.functionName + ' is already defined');

            case 2:

              /**
               * @param {string} view
               * @param {Object=} context
               * @returns {string}
               */
              ctx[config.functionName] = function () {
                var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(view, context) {
                  var mergedContext;
                  return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          mergedContext = merge({}, ctx.state, context);


                          view += config.ext;

                          return _context.abrupt('return', env.renderAsync(view, mergedContext).then(function (html) {
                            if (config.writeResponse) {
                              ctx.type = 'html';
                              ctx.body = html;
                            }
                          }).catch({ name: 'Template render error' }, function (err) {
                            ctx.status = 500;
                            throw err;
                          }));

                        case 3:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, undefined);
                }));
                return function (_x4, _x5) {
                  return ref.apply(this, arguments);
                };
              }();

              _context2.next = 5;
              return next();

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));
    return function (_x2, _x3) {
      return ref.apply(this, arguments);
    };
  }();
};