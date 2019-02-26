'use strict';

exports.__esModule = true;
exports.init = init;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immer = require('immer');

var _immer2 = _interopRequireDefault(_immer);

var _fastDeepEqual = require('fast-deep-equal');

var _fastDeepEqual2 = _interopRequireDefault(_fastDeepEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Wrapper = function (_React$Component) {
  _inherits(Wrapper, _React$Component);

  function Wrapper() {
    _classCallCheck(this, Wrapper);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Wrapper.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    return !(0, _fastDeepEqual2.default)(this.props.data, nextProps.data);
  };

  Wrapper.prototype.render = function render() {
    return this.props.fn(this.props.data);
  };

  return Wrapper;
}(_react2.default.Component);

function init(_store) {
  var store = _store;
  function createSubscribe() {
    var listener = [];
    return {
      listen: function listen(updator) {
        return listener.push(updator);
      },
      unListen: function unListen(l) {
        return listener.splice(listener.indexOf(l), 1);
      },
      update: function update(updator) {
        for (var i = 0; i < listener.length; i++) {
          listener[i](updator);
        }
        if (listener.length === 0) {
          if (typeof updator === 'function') {
            var newState = (0, _immer2.default)(store, function (draft) {
              updator(draft);
            });
            if (!(0, _fastDeepEqual2.default)(newState, store)) {
              store = newState;
            }
            return;
          }
        }
      }
    };
  }

  var _createSubscribe = createSubscribe(),
      listen = _createSubscribe.listen,
      unListen = _createSubscribe.unListen,
      update = _createSubscribe.update;

  var Provider = function (_React$PureComponent) {
    _inherits(Provider, _React$PureComponent);

    function Provider(props) {
      _classCallCheck(this, Provider);

      var _this2 = _possibleConstructorReturn(this, _React$PureComponent.call(this, props));

      _this2.reRender = function (updator) {
        if (typeof updator === 'function') {
          var newState = (0, _immer2.default)(_this2.state, function (draft) {
            updator(draft);
          });
          if (!(0, _fastDeepEqual2.default)(newState, _this2.state)) {
            _this2.setState(newState);
            store = newState;
          }
          return;
        }
      };

      _this2.state = store;
      return _this2;
    }

    Provider.prototype.componentWillUnmount = function componentWillUnmount() {
      unListen(this.reRender);
    };

    Provider.prototype.componentDidMount = function componentDidMount() {
      listen(this.reRender);
    };

    Provider.prototype.render = function render() {
      return this.props.children(this.state);
    };

    return Provider;
  }(_react2.default.PureComponent);

  return {
    Store: function Store() {
      return store;
    },
    Ctx: function Ctx(props) {
      return _react2.default.createElement(
        Provider,
        null,
        props.children
      );
    },
    Put: update,
    Auto: function Auto(selector) {
      return function (fn) {
        return _react2.default.createElement(
          Provider,
          null,
          function (state) {
            return _react2.default.createElement(Wrapper, { data: selector(state), fn: fn });
          }
        );
      };
    }
  };
}
