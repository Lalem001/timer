$(document).ready(function () {
    'use strict';
    module('Timer');
    test('basic ops', 14, function () {
        var Timer = window.Timer,
            timer = new Timer(100, 200);

        equal(timer._isStarted, false, 'New timer indicates it is not started');
        equal(timer._isPaused, false, 'New timer indicates it is not paused');

        ok(timer.start(), 'Start timer');
        equal(timer._isStarted, true, 'New timer indicates it is started');
        equal(timer._isPaused, false, 'New timer indicates it is not paused');

        ok(timer.pause(), 'Pause timer');
        equal(timer._isStarted, true, 'New timer indicates it is started');
        equal(timer._isPaused, true, 'New timer indicates it is paused');

        ok(timer.resume(), 'Resume timer');
        equal(timer._isStarted, true, 'New timer indicates it is started');
        equal(timer._isPaused, false, 'New timer indicates it is not paused');

        ok(timer.stop(), 'Stop timer');
        equal(timer._isStarted, false, 'New timer indicates it is not started');
        equal(timer._isPaused, false, 'New timer indicates it is not paused');
    });

    asyncTest('events', 2, function () {
        var Timer = window.Timer,
            timer = new Timer(1, 5);
        timer.on('completed', function () {
            ok(true, '"completed" event fired');
        });
        timer.on('timedout', function () {
            ok(true, '"timedout" event fired');
            start();
        });
        timer.start();
    });

    asyncTest('extension', 4, function () {
        var min = 100, max = 200, extend = 50,
            tolerance = 5,
            Timer = window.Timer,
            timer = new Timer(min, max);
        timer.on('completed', function () {
            ok(
                Math.abs(timer.elapsed() - (min + extend)) <= tolerance,
                ['Completed at ', timer.elapsed(), 'ms (', (min + extend), '±', tolerance, 'ms)'].join('')
            );
        });
        timer.on('timedout', function () {
            ok(
                Math.abs(timer.elapsed() - max) <= tolerance,
                ['Timedout at ', timer.elapsed(), 'ms (',max, '±', tolerance, 'ms)'].join('')
            );
            start();
        });
        ok(timer.start(), ['Starting ', min, '/', max, ' Timer'].join(''));
        ok(timer.extend(extend), 'Extend timer by ' + extend + 'ms');
    });
});
