describe('chai-signals', function() {
	var signal, spy, listenerSpy, result;
    var expect = chai.expect;
    var fnStub = function(){}; // stub function to create chai spies
    
	beforeEach(function () {
		signal = new signals.Signal();
		spy = chai.signals.spyOnSignal(signal);
        var result = ''; // for message tests
	});

	it('should fail if not spying on signal', function() {
		expect(function() {
			chai.signals.spyOnSignal({ });
		}).to.throw('spyOnSignal requires a signal as a parameter');
	});

	it('should fail if signal to spy on not specified', function() {
		expect(function() {
			chai.signals.spyOnSignal();
		}).to.throw('spyOnSignal requires a signal as a parameter');
	});

	it('should fail if signal to spy on is null', function() {
		expect(function() {
			chai.signals.spyOnSignal(null);
		}).to.throw('spyOnSignal requires a signal as a parameter');
	});

	it('should subscribe to signal on spy', function() {
		expect(signal.getNumListeners()).to.equal(1);
	});

	it('should accept signal in expectations', function () {
		signal.dispatch();

		expect(signal).to.have.been.dispatched();
	});

    it('should halt dispatch before it reaches listeners added before spy invocation', function () {
        var signal = new signals.Signal();
        listenerSpy = chai.spy(fnStub);
        signal.add(listenerSpy);
        spy = chai.signals.spyOnSignal(signal);
        signal.dispatch();

        expect(spy).to.have.been.dispatched();
        expect(listenerSpy).not.to.have.been.called();
    });

    it('should halt dispatch before it reaches listeners added after spy invocation', function () {
        listenerSpy = chai.spy(fnStub);
        signal.add(listenerSpy);
        signal.dispatch();

        expect(spy).to.have.been.dispatched();
        expect(listenerSpy).not.to.have.been.called();
    });

    describe('stop', function() {
        it('should unsubscribe from the signal', function() {
            spy.stop();

            expect(signal.getNumListeners()).to.equal(0);
        });
        it('should resume normal dispatch to listeners', function () {
            listenerSpy = chai.spy(fnStub);
            signal.add(listenerSpy);
            spy.stop();
            signal.dispatch();

            expect(spy).not.to.have.been.dispatched();
            expect(listenerSpy).to.have.been.called();
        });
    });

    describe('andThrow', function() {
        it('should throw the correct exception', function() {
            var exceptionMsg = 'test exception';
            spy.andThrow(exceptionMsg);

            expect(spy).not.to.have.been.dispatched();
            expect(signal.dispatch).to.throw(exceptionMsg);
        });
        it('should not throw an exception after the spy has been stopped', function () {
            var exceptionMsg = 'test exception';
            spy.andThrow(exceptionMsg);
            spy.stop();

            expect(spy).not.to.have.been.dispatched();
            expect(signal.dispatch).not.to.throw(exceptionMsg);
        });
    });

    describe('andCallFake', function() {
        it('should call the mock function on signal dispatch', function() {
            listenerSpy = chai.spy(fnStub);
            spy.andCallFake(listenerSpy);
            signal.dispatch();

            expect(spy).to.have.been.dispatched();
            expect(listenerSpy).to.have.been.called();
        });
        it('should not call the mock function after the spy has been stopped', function () {
            listenerSpy = chai.spy(fnStub);
            spy.andCallFake(listenerSpy);
            spy.stop();
            signal.dispatch();

            expect(spy).not.to.have.been.dispatched();
            expect(listenerSpy).not.to.have.been.called();
        });
    });

    describe('andCallThrough', function() {
        it('should call through to listeners added before spy invocation', function () {
            var signal = new signals.Signal();
            listenerSpy = chai.spy(fnStub);
            signal.add(listenerSpy);
            spy = chai.signals.spyOnSignal(signal).andCallThrough();
            signal.dispatch();

            expect(spy).to.have.been.dispatched();
            expect(listenerSpy).to.have.been.called();
        });

        it('should call through to listeners added after spy invocation', function () {
            listenerSpy = chai.spy(fnStub);
            signal.add(listenerSpy);
            spy.andCallThrough();
            signal.dispatch();

            expect(spy).to.have.been.dispatched();
            expect(listenerSpy).to.have.been.called();
        });
    });


    describe('to.have.been.dispatched', function() {

		it('should know if signal dispatched', function() {
			signal.dispatch();

			expect(spy).to.have.been.dispatched();
		});

		it('should know if signal not dispatched', function() {
			expect(spy).not.to.have.been.dispatched();
		});

		it('should pass if dispatched specified number of times', function() {
			signal.dispatch();
			signal.dispatch();
			signal.dispatch();

			expect(spy).to.have.been.dispatched(3);
		});

		it('should fail if signal count wrong', function() {
			signal.dispatch();

			expect(spy).not.to.have.been.dispatched(3);
		});

        describe('messages', function () {

            it('should show message when signal expected', function () {
                try {
                    chai.expect(signal).to.have.been.dispatched();
                }
                catch(err){
                    result = err.message;
                }
                finally {
                    expect(result).to.equal('Expected [Signal active:true numListeners:1] to have been dispatched');
                }
            });

            it('should show message when signal not expected', function () {
                try {
                    signal.dispatch();
                    chai.expect(signal).to.not.have.been.dispatched();
                }
                catch(err){
                    result = err.message;
                }
                finally {
                    expect(result).to.equal('Expected [Signal active:true numListeners:1] not to have been dispatched');
                }
            });

            it('should show message when signal expected with count', function () {
                try {
                    chai.expect(signal).to.have.been.dispatched(2);
                }
                catch(err){
                    result = err.message;
                }
                finally {
                    expect(result).to.equal('Expected [Signal active:true numListeners:1] to have been dispatched 2 times but was 0');
                }
            });

            it('should show message when signal not expected with count', function () {
                try {
                    signal.dispatch();
                    signal.dispatch();
                    chai.expect(signal).to.not.have.been.dispatched(2);
                }
                catch(err){
                    result = err.message;
                }
                finally {
                    expect(result).to.equal('Expected [Signal active:true numListeners:1] not to have been dispatched 2 times but was 2');
                }
            });

        });

	});

	describe('to.have.been.dispatchedWith', function() {

		it('should know if signal dispatched with parameters', function() {
			signal.dispatch(1, 5);
			signal.dispatch(2, 6);

			expect(spy).to.have.been.dispatchedWith(1, 5);
			expect(spy).to.have.been.dispatchedWith(2, 6);
		});

		it('should know if signal not dispatched', function() {
			signal.dispatch(1, 5);

			expect(spy).not.to.have.been.dispatchedWith(2, 3);
		});

		it('should know if signal dispatched with same parameters', function() {
			signal.dispatch(1);

			expect(spy).not.to.have.been.dispatchedWith(1, 5);
		});

		it('supports simple object equality', function () {
			signal.dispatch({foo: 'bar'});

			expect(spy).to.have.been.dispatchedWith({foo: 'bar'});
		});


        describe('messages', function () {
            it('should show message when signal expected with matching values', function () {
                try {
                    signal.dispatch(3, 4);
                    signal.dispatch(5, 6);
                    expect(spy).to.have.been.dispatchedWith(1,2);
                }
                catch(err) {
                    result = err.message;
                }
                finally {
                expect(result).to.equal('Expected [Signal active:true numListeners:1] to have been dispatched with (1, 2) but was with (3,4)(5,6)');
                }
            });

            it('should show message when signal not expected with matching values', function () {
                try {
                    signal.dispatch(1, 2);
                    signal.dispatch(3, 4);
                    expect(spy).to.not.have.been.dispatchedWith(1,2);
                }
                catch(err) {
                    result = err.message;
                }
                finally {
                    expect(result).to.equal('Expected [Signal active:true numListeners:1] not to have been dispatched with (1, 2) but was with (1,2)(3,4)');
                }
            });
        });

	});

	describe('matching', function() {

		it('should chai.signals.spyOnSignal with function matcher', function() {
			spy.matching(function(signalInfo) {
				return signalInfo === 1;
			});

			signal.dispatch(1);
			signal.dispatch(5);
			signal.dispatch(1);

			expect(spy).to.have.been.dispatched();
			expect(spy).to.have.been.dispatched(2);
		});

	});

    describe('createSignalSpyObj', function() {
        var error_msg = 'createSignalSpyObj requires a non-empty array of method names to create spies for';

        it('should throw an error if methodNames is an empty array', function() {
            expect(function() {
                chai.signals.createSignalSpyObj([]);
            }).to.throw(error_msg);
        });
        it('should throw an error if methodNames is not an array', function() {
            expect(function() {
                chai.signals.createSignalSpyObj({});
            }).to.throw(error_msg);
        });
        it('should return an object of SignalSpies', function() {
            var methodNames = ['test1', 'test2', 'test3'],
                spies = chai.signals.createSignalSpyObj(methodNames);

            methodNames.forEach(function(spy_name) {
                expect(spies[spy_name] instanceof chai.signals.SignalSpy).to.equal(true);
            });
        });
    });

});

