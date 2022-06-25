;
'use strict';
var Action = Action || {};
(function() {
    var _changeColor = function(color) {
        var msg = `change color to ${color}`;
        console.log(msg);        
    };
    var _disabled = function button_submit_disabled(selector, disabled) {
        $(`#${selector}`).prop('disabled', disabled);
    }
    Action.ChangeColor = function(selector, color, choices) {
        if (choices.includes(color)) {
            _changeColor(color);
            $(`#${selector}`).removeClass(choices);
            $(`#${selector}`).addClass(color);
        }
    }

    Action.ButtonDisabled = function(selector, disabled) {
        _disabled(selector, disabled);
    }    
})(); // forme 1

var FormColor = function() {           
    var item = 'none';
    var select_selector = 'select_color';
    var change_color = 'btn_change_color';
    var choices_color = ['btn-light', 'btn-primary', 'btn-danger', 'btn-success'];
    var _onSelect = function(selector) {
        $(`#${selector}`).on('click', function() {                                           
            item = $(`#${selector}>option:selected`).val();
            Action.ButtonDisabled(change_color, item === 'none');                       
        });
    };
    var _onSubmit = function(selector) {
        $(`#${selector}`).click(function() {
            Action.ChangeColor('btn_change_color', item, choices_color);
        }); 
    };
    var _init = function() {        
        // `#${select_selector}.`
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

function FormNumber() {
    var number = 10;
    var number_selector = 'number';
    var number_display_selector = 'display_count';
    var btn_countdown = 'btn_countdown';
    var btn_countup = 'btn_countup';
    var btn_stop = 'btn_stopcount';
    var Strategie = {
        COUNT_DOWN: 1,
        COUNT_UP: 2
    };
    var _compteur;
    var _toggleButtons = function(disabled) {
        $(`#${btn_countup}`).prop('disabled', disabled);
        $(`#${btn_countdown}`).prop('disabled', disabled);
        $(`#${btn_stop}`).prop('disabled', !disabled);
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

    var _onClickButton = function(selector, strategie) {
        $(`#${selector}`).click(function() {
            var val = $(`#${number_selector}`).val();
            var number = Number(val) || number;
            _toggleButtons(true);
            if (strategie === Strategie.COUNT_DOWN) {
                _compteur = compteur(number, 1, _displayCountDown);
                _compteur.decount();
            }
            if (strategie === Strategie.COUNT_UP) {
                _compteur = compteur(number, 1, _displayCountUp);
                _compteur.count();
            }
        }); 
    };
    var _onClickStop = function(selector) {
        $(`#${selector}`).click(function() {
            if (_compteur) {
                _compteur.stop();
                $(`#${number_display_selector}`).text('');
                _toggleButtons(false);
            }
        });
    };
    var _init = function() {        
        _onClickButton(btn_countdown, Strategie.COUNT_DOWN);
        _onClickButton(btn_countup, Strategie.COUNT_UP);
        _onClickStop(btn_stop);
    };
    this.init = function() {
        _init();
    };
    this.getNumber = function() {
        return number;
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
