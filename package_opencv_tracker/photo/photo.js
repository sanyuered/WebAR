import * as imageTracker from '../utils/imageTracker.js?v3';
import * as model from '../utils/modelBusiness.js?v3';
const canvasId = 'canvas2d';
const canvasWebGLId = 'canvasWebGL';
const maxCanvasWidth = 375;
// a url of a image
const modelUrl = '../../assets/cat_beard.png';

var app = new Vue({
  el: '#app',
  data: {
    isShowLoadingToast: false,
    isButtonDisabled: false,
    notice: '',
    patternImageUrl: '../../assets/face_pattern.jpg',
  },
  methods: {
    processPhoto(inputData, imageWidth, imageHeight) {
      var _that = this;

      var canvasWidth = imageWidth;
      var canvasHeight = imageHeight;

      // process start
      var startTime = new Date();
      var result = imageTracker.detect(inputData);
      var end = new Date() - startTime

      if (result && result.prediction) {
        // set the rotation and position of the 3d model.    
        model.setModel(result.prediction,
          canvasWidth,
          canvasHeight);

        _that.notice = "detect: " + end + ' ms.';

      } else {
        // set the default position
        model.setModelOnDefaultposition();
        var message = 'No results.';
        _that.notice = message;
        console.log('detect:', message);
      }
      // process end
    },
    takePhoto() {
      if (this.isButtonDisabled) {
        return
      }
      // 因为有css样式表，所以元素inputData的宽度变为375px。
      const inputData = document.getElementById('inputData');
      this.processPhoto(inputData,
        inputData.width,
        inputData.height);
    },
    load() {
      var _that = this;
      _that.isButtonDisabled = true;
      const inputData = document.getElementById("inputData");
      // load 3d model
      model.initThree(canvasWebGLId,
        modelUrl,
        inputData.width,
        inputData.height);

      patternImage.addEventListener("load", function () {
        // waiting for OpenCV to be ready
        setTimeout(function(){  
          imageTracker.initTemplateImage('patternImage')
          _that.isButtonDisabled = false;
        },1200) 
      })  
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
