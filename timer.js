(
    function (factory) {
        'use strict';
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['underscore', 'backbone'], factory);
        } else if (typeof exports === 'object') {
            module.exports = factory(require('underscore'), require('backbone'));
        } else {
            // Browser globals (root is window)
            window.Timer = factory(window._, window.Backbone);
        }
    }(function (_, Backbone) {
        'use strict';
        var Timer;

        // Timer
        // Inspired by the timer logic used in Ubuntu's NotifyOSD
        // --------------------------------------------------------------------------------
        Timer = function (scheduledDuration, maxDuration) {
            if (_.isUndefined(scheduledDuration) || !_.isNumber(scheduledDuration)) {
                throw new TypeError('Timer: Scheduled duration is required and must be a number');
            }
            if (_.isUndefined(maxDuration) || !_.isNumber(maxDuration)) {
                throw new TypeError('Timer: Max duration is required and must be a number');
            }
            if (scheduledDuration > maxDuration) {
                throw new Error('Scheduled duration should be less than the max duration.');
            }
            this._pausedDuration = 0;
            this._scheduledDuration = scheduledDuration;
            this._maxDuration = maxDuration;
            this._isStarted = false;
            this._isPaused = false;

            return this;
        };

        _.extend(Timer.prototype, Backbone.Events, {
            start: function () {
                if (this._isStarted) { return false; }
                var that = this;
                this.scheduledTimer = this.setTimeout(function () {
                    return that.emitCompleted();
                }, this._scheduledDuration);
                this.timedOutTimer = this.setTimeout(function () {
                    that.stop();
                    return that.emitTimeOut();
                }, this._maxDuration);
                this._isStarted = true;
                this._startTime = Date.now();
                this._stopTime = undefined;
                return true;
            },
            stop: function () {
                if (!this._isStarted) { return false; }
                this.scheduledTimer.clear();
                this.timedOutTimer.clear();
                this._isStarted = false;
                this._isPaused = false;
                this._stopTime = Date.now();
                return true;
            },
            pause: function () {
                if (!this._isStarted || this._isPaused) { return false; }
                this._isPaused = true;
                this.scheduledTimer.clear();
                this._pausedTime = Date.now();
                return true;
            },
            resume: function () {
                if (!this._isStarted || !this._isPaused) { return false; }
                this._isPaused = false;
                this._pausedDuration += Date.now() - this._pausedTime;
                this._pausedTime = undefined;
                var that = this,
                    extension = this._scheduledDuration - this.scheduledTimer.elapsed();
                this.scheduledTimer = this.setTimeout(function () { return that.emitCompleted(); }, extension);

                return true;
            },
            extend: function (extension) {
                if (!this._isStarted) { return false; }
                if (this._isPaused) {
                    if (this._scheduledDuration + extension > this._maxDuration) {
                        this._scheduledDuration = this._maxDuration;
                    } else {
                        this._scheduledDuration += extension;
                    }
                    return true;
                }

                this.scheduledTimer.clear();

                var that = this,
                    onScreenTime = this.scheduledTimer.elapsed();
                if (this._scheduledDuration + extension > this._maxDuration) {
                    extension = this._maxDuration - onScreenTime;
                    this._scheduledDuration = this._maxDuration;
                } else {
                    this._scheduledDuration += extension;
                    extension = this._scheduledDuration - onScreenTime;
                }

                this.scheduledTimer = this.setTimeout(function () { return that.emitCompleted(); }, extension);

                return true;
            },
            emitCompleted: function () {
                this.trigger('completed');
                return false;
            },
            emitTimeOut: function () {
                this.trigger('timedout');
                return false;
            },
            setTimeout: function (callback, milliseconds) {
                if (!_.isFunction(callback) || !_.isNumber(milliseconds)) {
                    return undefined;
                }
                var exports = function () {},
                    startTime = Date.now(),
                    stopTime,
                    updateTimeout,
                    updateFrequency = Math.min(Math.ceil(milliseconds / 10), 1000), // every x milliseconds
                    cleared = false,
                    timeout;
                updateTimeout = function () {
                    if (!cleared) {
                        var nextInterval = Math.min(updateFrequency, milliseconds + startTime - Date.now());
                        if (nextInterval <= 0) {
                            stopTime = Date.now();
                            callback.call(this);
                        } else {
                            timeout = setTimeout(updateTimeout, nextInterval);
                        }
                    }
                };
                updateTimeout();
                exports.elapsed = function () {
                    return stopTime ? stopTime - startTime : -startTime + Date.now();
                };
                exports.clear = function () {
                    clearTimeout(timeout);
                    stopTime = Date.now();
                    cleared = true;
                    return true;
                };
                return exports;
            },
            elapsed: function () {
                return this.timedOutTimer.elapsed();
            }
        });

        return Timer;
    })
);
