;
'use strict';
var Action = Action || {};
(function() {
    var _changeColor = function(color) {
        var msg = `change color to ${color}`;
        alert(msg)        
    };
    var _disabled = function button_submit_disabled(selector, disabled) {
        $(`#${selector}`).prop('disabled', disabled);
    }
    Action.ChangeColor = function(color) {
        _changeColor(color);
    }
    Action.ButtonDisabled = function(selector, disabled) {
        _disabled(selector, disabled);
    }    
})(); // forme 1

var FormColor = function() {           
    var item = 'none';
    var select_selector = 'select_color';
    var change_color = 'btn_change_color';
    var _onSelect = function(selector) {
        $(`#${selector}`).on('click', function() {                                           
            item = $(`#${selector}>option:selected`).val();
            Action.ButtonDisabled(change_color, item === 'none');                        
        });
    };
    var _onSubmit = function(selector) {
        $(`#${selector}`).click(function() {
            Action.ChangeColor(item);
        }); 
    };
    var _init = function() {        
        _onSelect(select_selector);
        _onSubmit(change_color);
    };
    var _getitem = function() {
        return item;
    };
    
    return ({
        init: _init,
        getItem: _getitem,
        onSubmit: _onSubmit,
        onSelect: _onSelect
    });       
}; // forme 2

var compteur = (function(max, start_after_sec, callBack) {
    var _one_second = 1000;    
    var _default_second = _one_second * 2;
    var _max = max || 10;    
    var _start_until = _get_ms_sec(start_after_sec);
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
    var _iifeCondition = function(condition, n, interval) {
        if (condition) {
            _iifeCallback(n);
        } else {
            clearInterval(interval);
        }
    };
    var _decount_from = function(max) {
        var _i = max || _max; 
        var _interval = setInterval(function() {
            _iifeCondition(_i >= 0, _i--, _interval);
        }, _one_second);                        
    };
    var _count_to = function(max) {
        var _to = max || _max;
        var _i = 1;
        var _interval = setInterval(function() {
            _iifeCondition(_i <= _to, _i++, _interval);  
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
        start: _start
    });
}); // compteur

function FormNumber() {
    var number = 10;
    var number_selector = 'number';
    var number_display_selector = 'display_count';
    var btn_countdown = 'btn_countdown';
    var btn_countup = 'btn_countup';
    var Strategie = {
        COUNT_DOWN: 1,
        COUNT_UP: 2
    };
    var _toggleButtons = function(disabled) {
        $(`#${btn_countup}`).prop('disabled', disabled);
        $(`#${btn_countdown}`).prop('disabled', disabled);
    };
    var _displayNumber = function(conditionBoom, text) {
        if (conditionBoom) {
            text = 'Boom ! 💣';
            _toggleButtons(false);
        } else {
            text = `🔥 ${text} 🔥`;
        }
        $(`#${number_display_selector}`).text(text);
    }
    var _displayCountDown = function(_number) {
        _displayNumber(_number === 0, _number.toString());
    };
    var _displayCountUp = function(_number) {
        _displayNumber(_number === number, _number.toString());
    };

    var _onSubmit = function(selector, strategie) {
        $(`#${selector}`).click(function() {
            var val = $(`#${number_selector}`).val();
            var number = Number(val) || number;
            _toggleButtons(true);
            if (strategie === Strategie.COUNT_DOWN) {
                compteur(number, 1, _displayCountDown).decount();
            }
            if (strategie === Strategie.COUNT_UP) {
                compteur(number, 1, _displayCountUp).count();
            }
        }); 
    };
    var _init = function() {        
        _onSubmit(btn_countdown, Strategie.COUNT_DOWN);
        _onSubmit(btn_countup, Strategie.COUNT_UP);
    };
    this.init = function() {
        _init();
    };
    this.getNumber = function() {
        return number;
    };
    this.onSubmit = function() {
        _onSubmit();
    };
} // forme 3

var Init = {
    formColor: null,
    formNumber: null,
    initialize: function() {
        var formColor = FormColor();
        this.formColor = formColor;
        formColor.init();
        var formNumber = new FormNumber();
        this.formNumber = formNumber;
        formNumber.init();
        return { formColor: formColor, formNumber: formNumber };
    },
    getFormColor: function() {
        return this.formColor;
    },
    getFormNumber: function() {
        return this.formNumber;
    }
}; // forme 4
