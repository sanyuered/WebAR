import * as image from '../utils/imageBusiness.js';
import * as model from '../utils/modelBusiness.js';
const canvasId = 'canvas2d';
const canvasWebGLId = 'canvasWebGL';
const maxCanvasWidth = 375;
// a url of a gltf model
const modelUrl = '../../assets/sunglass.glb';

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
      var canvasWidth = imageWidth;
      if (canvasWidth > maxCanvasWidth) {
        canvasWidth = maxCanvasWidth;
      }
      // canvas Height
      var canvasHeight = Math.floor(canvasWidth * (imageHeight / imageWidth));

      // draw image on canvas
      ctx.drawImage(photo,
        0, 0,canvasWidth,canvasHeight);
      var res = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

      // process start
      image.detect(res.data,
        canvasWidth,
        canvasHeight,
        function (event) {
          var result = event.data;

          if (result && result.prediction) {
            // set the rotation and position of the 3d model.    
            model.setModel(result.prediction,
              canvasWidth,
              canvasHeight);
            _that.notice = "detect: " + result.end + 'ms.';
          } else {
            var message = 'No results.';
            _that.notice = message;
            console.log('detect:', message);
          }
        });
      // process end
    },
    takePhoto() {
      if (this.isButtonDisabled) {
        return
      }
      const inputData = document.getElementById('inputData');
      this.processPhoto(inputData,
        inputData.width,
        inputData.height);
    },
    load() {
      this.isButtonDisabled = true;
      const inputData = document.getElementById("inputData");
      // load 3d model
      model.initThree(canvasWebGLId,
        modelUrl,
        inputData.width,
        inputData.height);
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
