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

var Form = function() {           
    var item = 'none';
    var select_selector = 'select_color';
    var change_color = 'change_color';
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

var Init = {
    form: null,
    initialize: function() {
        var form = Form();
        this.form = form;
        form.init();
        return form;
    },
    getForm: function() {
        return this.form;
    }
}; // forme 3

var compteur = (function(max, start_after_sec) {
    var _one_second = 1000;    
    var _default_second = _one_second * 2;
    var _max = max || 10;    
    var _start_until = _get_ms_sec(start_after_sec);        
    function _get_ms_sec(sec) {        
        if (sec) {
            return _one_second * sec;
        }
        return _default_second;
    }
    var _print = function(i, text = 'countdown =>') {
        console.log(`${text} ${i}`);
    };
    var _decount_from = function(max) {
        var _i = max || _max; 
        var _interval = setInterval(function() { 
            _i >= 0 ? _print(_i--) : clearInterval(_interval);            
        }, _one_second);                        
    };
    var _start = function(_start_after_sec) {
        _start_until = _get_ms_sec(_start_after_sec);
        for (var i = 0; i < _max; i++) {
            (function(_i) {
                setTimeout(function() { _print(_i, 'count => ') }, _start_until);
            })(i);  
            /* setTimeout trap
            setTimeout(function() {
                console.log(i);
            }, _start_until / 2); */                             
        }
    }
    return ({
        start: _start,
        decount: _decount_from
    });
}); // compteur

/* var Init = (function() {
    console.log('init !!');
    var _initialize = function() {
        var form = Form();
        form.init();
        return form;
    };
    var init = function() {
        this.initialize = function() {
            return _initialize();            
        };
    };
    return init;
});*/ // forme 4

