;
'use strict';
var compteur = (function(max, start_after_sec, callBack) {
    var _one_second = 1_000;    
    var _default_second = _one_second * 2;
    var _max = max || 10;    
    console.log(max);
    var _start_until = _get_ms_sec(start_after_sec);
    var _interval;
    var Operator = {
        PLUS: 1,
        MINUS: -1
    };
    if (!callBack || typeof callBack !== 'function') {
        throw new Error('le callBack est obligatoire');
    }
    var _callBack = callBack;
    function _get_ms_sec(sec) {        
        if (sec) {
            return _one_second * sec;
        }
        return _default_second;
    }
    var _print = function(i, text = 'count =>') {
        console.log(`${text} ${i}`);
    };
    var _iifeCallback = (function(_cnt) {
        _print(_cnt);
        _callBack(_cnt);
    });
    var _iifeCondition = function(condition, n, operator, interval) {
        console.log(n);
        console.log(condition);
        if (condition) {
            _iifeCallback(n);
            return n + operator;
        } else {
            clearInterval(interval);
        }
    };
    var _stop_count = function() {
        if(_interval) {
            clearInterval(_interval);
        }
    }
    var _decount_from = function(max) {
        var _i = max || _max; 
        _interval = setInterval(function() {
            _i = _iifeCondition(_i >= 0, _i, Operator.MINUS, _interval);
        }, _one_second);                        
    };
    var _count_to = function(max) {
        var _to = max || _max;
        var _i = 1;
        _interval = setInterval(function() {
            _i = _iifeCondition(_i <= _to, _i, Operator.PLUS, _interval);  
        }, _one_second);    
    };
    var _start = function(_start_after_sec) {
        _start_until = _get_ms_sec(_start_after_sec);
        for (var i = 0; i < _max; i++) {
            (function(_i) {
                setTimeout(function() { _print(_i, 'count => ') }, _start_until);
            })(i);                          
        }
    }
    return ({
        count: _count_to,
        decount: _decount_from,
        stop: _stop_count,
        start: _start
    });
}); // compteur