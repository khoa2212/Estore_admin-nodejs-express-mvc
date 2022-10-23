function disableEmptyInputs(form) {
    var controls = form.elements;
    for (var i=0, iLen=controls.length; i<iLen; i++) {
        if (controls[i].value == '') controls[i].disabled = true;
    }
}