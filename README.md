# chai-signals
Adds [chai](https://github.com/chaijs/chai) assertions for the [js-signals](https://github.com/millermedeiros/js-signals) library.

Adds the following assertions to chai:
 * dispatched()
 * dispatchedWith()

How to use
--------------
### Create
First define which signals you're interested in.

```js
var signal = new signals.Signal();
var signalSpy = chai.signals.spyOnSignal(signal);
var signalSpies = chai.signals.createSignalSpyObj([signal1, signal2]);
```

### Filtering signals
You can pass a boolean function to specify which dispatches to register.

```js
var signal = new signals.Signal();
var signalSpy = chai.signals.spyOnSignal(signal).matching(function (dispatchInfo) {
	return dispatchInfo !== null;
});
signal.dispatch();  // ignored
signal.dispatch(5); // registered
```

### Expectations
After defining the spy you can set expectations in your tests.

```js
expect(signalSpy).to.have.been.dispatched();        // the spy's signal has been dispatched at least once
expect(signalSpy).to.have.been.dispatched(n);       // the spy's signal has been dispatched n times
expect(signal).to.have.been.dispatched();           // the signal has been dispatched at least once
expect(signal).to.have.been.dispatched(n);          // the signal has been dispatched n times
expect(signalSpy).to.not.have.been.dispatched();    // the spy's signal has not been dispatched at all
expect(signalSpy).to.not.have.been.dispatched(n);   // the spy's signal has not been dispatched n times
expect(signal).to.not.have.been.dispatched();       // the signal has not been dispatched at all
expect(signal).to.not.have.been.dispatched(n);      // the signal has not been dispatched at all

expect(signalSpy).to.have.been.dispatchedWith(n);          // the spy's signal has been dispatched using n
expect(signalSpy).to.have.been.dispatchedWith(m, n);       // the spy's signal has been dispatched using (m, n)
expect(signalSpy).to.have.been.dispatchedWith(<object>);   // the spy's signal has been dispatched with using object
expect(signal).to.have.been.dispatchedWith(n);          // the signal has been dispatched using n
expect(signal).to.have.been.dispatchedWith(m, n);       // the signal has been dispatched using (m, n)
expect(signal).to.have.been.dispatchedWith(<object>);   // the signal has been dispatched with using object
expect(signalSpy).to.not.have.been.dispatchedWith(n);          // the spy's signal has not been dispatched using n
expect(signalSpy).to.not.have.been.dispatchedWith(m, n);       // the spy's signal has not been dispatched using (m, n)
expect(signalSpy).to.not.have.been.dispatchedWith(<object>);   // the spy's signal has not been dispatched with using object
expect(signal).to.not.have.been.dispatchedWith(n);          // the signal has not been dispatched using n
expect(signal).to.not.have.been.dispatchedWith(m, n);       // the signal has not been dispatched using (m, n)
expect(signal).to.not.have.been.dispatchedWith(<object>);   // the signal has not been dispatched with using object
```

AMD
-------------
It's possible to use `chai-signals` as an AMD (Asynchronous Module Definition) module.

`chai-signals` depends on JS-Signals, so first define `signals` path:

```js
require.config({
	paths: {
		signals: 'components/js-signals/signals',
		chai-signals: 'components/chai-signals/lib/chai-signals'
	}
});
```

Then use it in `Chai` tests like this:

```js
define(['myClass', 'chaiSignals'], function(myClass, chaiSignals) {
	it('should signal completed', function () {
		chai.signals.spyOnSignal(myClass.completed);

		myClass.doSomething();

		expect(myClass.completed).to.have.been.dispatched();
	});
});
```

If you are using karma to run tests make sure to include `chai.use(chaiSignals);` in each of your test files.

Examples
--------
See tests for usage:

[chai-signals.test.js](https://github.com/StephenDavidson/chai-signals/blob/master/chai-signals.test.js)

Development
-----------
Install node.js, [bower](http://twitter.github.com/bower), get sources from git

```js
npm install
bower install
npm test
```

License
-------
This code is distributed under the MIT license.
