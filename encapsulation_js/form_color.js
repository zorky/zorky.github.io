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
})();

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
};