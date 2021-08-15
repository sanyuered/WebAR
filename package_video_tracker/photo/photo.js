import * as image from '../utils/imageBusiness.js';
const canvasId = 'canvas2d';
const maxCanvasWidth = 375;
// a url of a video
const videoUrl = '../../assets/sample.mp4';
const videoMaskId = "videoMask";
const videoMaskSourceId = "videoMaskSource";
// mask image
const trackPoint = {
  x: 187, // the width of the pattern image is 375
  y: 187, // the height of the pattern image is 375
};
// pattern image
const patternFrame = {
  w: '375px',
  h: '375px',
}

var canvasWidth;
var canvasHeight;

var app = new Vue({
  el: '#app',
  data: {
    isShowLoadingToast: false,
    isButtonDisabled: false,
    notice: '',
  },
  methods: {
    processPhoto(photo, imageWidth, imageHeight) {
      var _that = this;
      const ctx = document.getElementById(canvasId).getContext('2d');
      canvasWidth = imageWidth;
      if (canvasWidth > maxCanvasWidth) {
        canvasWidth = maxCanvasWidth;
      }
      // canvas Height
      canvasHeight = Math.floor(canvasWidth * (imageHeight / imageWidth));

      // draw image on canvas
      ctx.drawImage(photo,
        0, 0, canvasWidth, canvasHeight);
      var res = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

      // process start
      image.detect(res.data,
        canvasWidth,
        canvasHeight,
        function (event) {
          var result = event.data;

          if (result && result.prediction) {
            // set the position
            image.updateMaskVideoPosition(result.prediction,
              videoMaskId,
              trackPoint,
              canvasWidth,
              canvasHeight)
            _that.notice = "detect: " + result.prediction.goodMatch + " points, " + result.end + ' ms.';
          } else {
            // set the default position
            image.setMaskVideoDefaultPosition(videoMaskId);
            var message = 'No results.';
            _that.notice = message;
            console.log('detect:', message);
          }
        });
      // process end
    },
    playMaskVideo() {
      var videoMaskSource = document.getElementById(videoMaskSourceId);
      videoMaskSource.src = videoUrl;
      var videoMask = document.getElementById(videoMaskId);
      videoMask.style.width = patternFrame.w;
      videoMask.style.height = patternFrame.h;
      videoMask.load();
      videoMask.play();
    },
    takePhoto() {
      if (this.isButtonDisabled) {
        return
      }

      this.playMaskVideo();
      const inputData = document.getElementById('inputData');
      this.processPhoto(inputData,
        inputData.width,
        inputData.height);
    },
    load() {
      this.isButtonDisabled = true;
      image.initTracker();
      this.isButtonDisabled = false;
    },
  },
  mounted: function () {
    this.load();
  },
})

// change input image
document.getElementById("uploaderInput").addEventListener("change", function (e) {
  var files = e.target.files;
  if (files.length == 0) {
    return
  }
  var url = window.URL || window.webkitURL;
  var src;
  if (url) {
    src = url.createObjectURL(files[0]);
  }
  var inputData = document.getElementById("inputData");
  inputData.src = src;
});

