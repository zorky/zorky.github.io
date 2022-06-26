;
'use strict';
function FormCounter() {
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
            console.log('click !');
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

var InitFormCounter = {
    formCounter: null,
    initialize: function() {
        var formCounter = new FormCounter();
        this.formCounter = formCounter;
        formCounter.init();
        return formCounter;
    },
    getFormCounter: function() {
        return this.formCounter;
    }
};
(function() {        
  InitFormCounter.initialize();
})();