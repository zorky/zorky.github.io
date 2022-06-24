(function() {    
    var forms = Init.initialize();
    console.log(forms.formColor.item);
    console.log(forms.formColor.getItem());
    var form2 = Init.getFormColor();
    console.log(form2);

    // var count = compteur(10, 2);    
    // count.start(10);
    // count.decount(20);    
})();