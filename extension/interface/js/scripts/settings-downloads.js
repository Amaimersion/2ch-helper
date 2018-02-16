function f() {


  var slider2 = new Slider('#downloadDelay', {
    tooltip: 'hide'
  });

  slider2.on("slide", function(value) {
    document.getElementById('downloadDelayValue').textContent = value + 'мс';
  });
}

document.addEventListener("DOMContentLoaded", f)