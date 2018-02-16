function f() {
    var slider = new Slider('#screenshotQuality', {
      tooltip: 'hide'
    });

    slider.on("slide", function(value) {
      document.getElementById('screenshotQualityValue').textContent = value + '%';
    });

    var slider2 = new Slider('#screenshotDelay', {
      tooltip: 'hide'
    });

    slider2.on("slide", function(value) {
      document.getElementById('screenshotDelayValue').textContent = value + 'мс';
    });
  }

  document.addEventListener("DOMContentLoaded", f)