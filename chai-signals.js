(function () {
    "use strict";

    // Module compatibility.

    /* istanbul ignore else */
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // NodeJS
        module.exports = chaiSignals;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(function () {
            return chaiSignals;
        });
    } else {
        /*global self: false */

        // Other environment (usually <script> tag): plug in to global chai instance directly.
        chai.use(chaiSignals);

        // Expose as a property of the global object so that consumers can configure the `transferPromiseness` property.
        self.chaiSignals = chaiSignals;
    }

    function chaiSignals(chai, utils) {
        var spies = [];
        chai.signals = {};
        var Assertion = chai.Assertion;
        var assert = chai.assert;

        function assertIsAboutSignal(assertion) {
            if (typeof assertion._obj.dispatch !== "function") {
                throw new TypeError(utils.inspect(assertion._obj) + " is not a signal spy.");
            }
        }

        // add method wrapper
        function method(name, asserter) {
            utils.addMethod(Assertion.prototype, name, function () {
                //assertIsAboutSignal(this);
                return asserter.apply(this, arguments);
            });
        }

        // add property wrapper
        function property(name, asserter) {
            utils.addProperty(Assertion.prototype, name, function () {
                assertIsAboutSignal(this);
                return asserter.apply(this, arguments);
            });
        }

        // These are for clarity and to bypass Chai refusing to allow `undefined` as actual when used with `assert`.
        function assertIfNegated(assertion, message, extra) {
            assertion.assert(true, null, message, extra.expected, extra.actual);
        }

        function assertIfNotNegated(assertion, message, extra) {
            assertion.assert(false, message, null, extra.expected, extra.actual);
        }

        /**
         * Returns true if the signal has been dispatched
         *
         * Where n is the number of times the signal has been dispatched:
         *
         * expect(signalSpy).to.have.been.dispatched();
         * expect(signalSpy).to.have.been.dispatched(n);
         * expect(signal).to.have.been.dispatched();
         * expect(signal).to.have.been.dispatched(n);
         *
         * expect(signalSpy).to.not.have.been.dispatched();
         * expect(signalSpy).to.not.have.been.dispatched(n);
         * expect(signal).to.not.have.been.dispatched();
         * expect(signal).to.not.have.been.dispatched(n);
         *
         */
        method('dispatched', function(expectedCount) {
            var result, spy = getSpy(this._obj);
            if (!(spy instanceof chai.signals.SignalSpy)) {
                throw new Error('Expected a SignalSpy');
            }

            result = {
                pass: (expectedCount === undefined) ? !!(spy.count) : spy.count === expectedCount
            };

            result.message = result.pass ?
            'Expected ' + spy.signal.toString() + ' not to have been dispatched' :
            'Expected ' + spy.signal.toString() + ' to have been dispatched';

            if (expectedCount > 0) {
                result.message += ' ' + expectedCount + ' times but was ' + spy.count;
            }
            if (spy.expectedArgs !== undefined) {
                result.message += ' with (' + spy.expectedArgs.join(',') + ')';
                result.message += ' but was with ' + actualToString(spy);
            }

            this.assert(
                result.pass,
                result.message,
                result.message
            );
        });

        /**
         * Returns true if the signal has been dispatched with argument
         *
         * Where x and y are objects or primitives:
         *
         * expect(signalSpy).to.have.been.dispatched(x);
         * expect(signalSpy).to.have.been.dispatchedWith(x, y);
         * expect(signal).to.have.been.dispatched(x);
         * expect(signal).to.have.been.dispatchedWith(x, y);
         *
         * expect(signalSpy).to.not.have.been.dispatchedWith(x);
         * expect(signalSpy).to.not.have.been.dispatchedWith(x, y);
         * expect(signal).to.not.have.been.dispatchedWith(x);
         * expect(signal).to.not.have.been.dispatchedWith(x, y);
         *
         */
        method('dispatchedWith', function(expectedParam){
            var result, spy = getSpy(this._obj), args = [].slice.call(arguments);
            if (!(spy instanceof chai.signals.SignalSpy)) {
                throw new Error('Expected a SignalSpy');
            }

            result = {
                pass: spy.dispatches.filter(spy.signalMatcher).map(function (d) {
                    return utils.eql(d, args);
                }).reduce(function (a, b) {
                    return a || b;
                }, false)
            };

            result.message = result.pass ?
            'Expected ' + spy.signal.toString() + ' not to have been dispatched' :
            'Expected ' + spy.signal.toString() + ' to have been dispatched';


            if (expectedParam !== undefined) {
                result.message += ' with (' + args.join(', ') + ')';
                result.message += ' but was ' + (spy.dispatches.length ? 'with ' + actualToString(spy) : 'not dispatched');
            }

            this.assert(
                result.pass,
                result.message,
                result.message
            );
        });

        /*
         * Spies definitions
         */

        chai.signals.spyOnSignal = function (signal, matcher) {
            var spy = new chai.signals.SignalSpy(signal, matcher);
            spies.push(spy);
            return spy;
        };

        chai.signals.spyOnSignal.spyOnSignal = chai.signals.spyOnSignal;

        /*
         * Matchers
         */

        function actualToString(spy) {
            return spy.dispatches.map(function (d) {
                return '(' + d + ')';
            }).join('');
        }

        function getSpy(actual) {
            if (!(actual === undefined) && !(actual === null) && (typeof actual.dispatch == 'function')) {
                return spies.filter(function spiesForSignal(d) {
                    return d.signal === actual;
                })[0];
            }
            return actual;
        }
        /*
         * Spy implementation
         */

        (function (namespace) {
            namespace.SignalSpy = function (signal, matcher) {
                if ((signal === undefined) || (signal === null) || !(typeof signal.dispatch == 'function')) {
                    console.info("hit");
                    console.log(signal);
                    throw 'spyOnSignal requires a signal as a parameter';
                }
                this.signal = signal;
                this.signalMatcher = matcher || allSignalsMatcher;
                this.count = 0;
                this.dispatches = [];
                this.plan = function() {  };
                this.initialize();
            };

            function allSignalsMatcher() {
                return true;
            }

            function onSignal() {
                var paramArray = (arguments.length) ? Array.prototype.slice.call(arguments) : [];
                this.dispatches.push(paramArray);
                if (this.signalMatcher.apply(this, Array.prototype.slice.call(arguments))) {
                    this.count++;
                }
                this.signal.halt();
                return this.plan.apply(this, arguments);
            }

            namespace.SignalSpy.prototype.initialize = function () {
                this.signal.add(onSignal, this, 999);
            };

            namespace.SignalSpy.prototype.stop = function () {
                this.signal.remove(onSignal, this);
            };

            namespace.SignalSpy.prototype.matching = function (predicate) {
                this.signalMatcher = predicate;
                return this;
            };

            namespace.SignalSpy.prototype.andCallThrough = function() {
                this.plan = function() {
                    var planArgs = arguments;
                    this.stop();  //stop spying - remove the spy binding
                    this.signal._bindings && this.signal._bindings.forEach(function(binding) { //apply args to original listeners
                        var listener = binding.getListener();
                        listener.apply(this, planArgs);
                    }.bind(this));
                    this.initialize();  //start again - add our spy back
                }.bind(this);
                return this;
            };

            namespace.SignalSpy.prototype.andThrow = function(exceptionMsg) {
                this.plan = function() {
                    throw exceptionMsg;
                };
                return this;
            };

            namespace.SignalSpy.prototype.andCallFake = function(fakeFunc) {
                this.plan = fakeFunc;
                return this;
            };

        })(chai.signals);

        chai.signals.createSignalSpyObj = function(methodNames) {
            var obj = {};
            if (!Array.isArray(methodNames) || methodNames.length === 0) {
                throw new Error('createSignalSpyObj requires a non-empty array of method names to create spies for');
            }
            methodNames.forEach(function(name) {
                obj[name] = chai.signals.spyOnSignal(name);
            });
            return obj;
        };
    }

}());
