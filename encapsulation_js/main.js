(function() {    
    var form = Init.initialize();
    console.log(form.item);
    console.log(form.getItem());
    var form2 = Init.getForm();
    console.log(form2);

    var count = compteur(10, 2);    
    count.start(10);
    count.decount(20);    
})();