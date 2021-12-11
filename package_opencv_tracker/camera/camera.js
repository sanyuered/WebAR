import * as imageTracker from '../utils/imageTracker.js?v3';
import * as model from '../utils/modelBusiness.js';
const canvasId = 'canvas2d';
const canvasWebGLId = 'canvasWebGL';
const maxCanvasWidth = 375;
// a url of a image
const modelUrl = '../../assets/cat_beard.png';
// it should be more than detect time
const frameTimeout = 200;
const canvasWidth = 375;
const canvasHeight = 375;

var app = new Vue({
    el: '#app',
    data: {
        isShowLoadingToast: false,
        isButtonDisabled: false,
        notice: '',
        patternImageUrl: '../../assets/face_pattern.jpg',
    },
    methods: {
        async processVideo(frame) {
            var _that = this;
            var canvas1= document.getElementById(canvasId)
            const ctx = document.getElementById(canvasId).getContext('2d');
            // draw a video frame on a 2d canvas
            ctx.drawImage(frame, 0, 0, canvasWidth, canvasHeight);

            // process start
            var startTime = new Date();
            var result = imageTracker.detect(canvas1);
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
        async takePhoto() {
            if (!navigator.mediaDevices) {
                var msg = 'No navigator.mediaDevices, needs a https site.';
                this.notice = msg;
                console.log('takePhoto', msg);
                return
            }

            if (this.isButtonDisabled) {
                return
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: canvasWidth,
                    height: canvasHeight,
                    facingMode: 'environment',
                }
            });
            var inputData = document.getElementById("inputData");
            inputData.srcObject = stream;
            await this.onVideoPlay();
        },
        async onVideoPlay() {
            var inputData = document.getElementById("inputData");
            // check the state of the video player
            if (!inputData.paused && !inputData.ended) {
                if(!this.isButtonDisabled){
                    await this.processVideo(inputData);
                }
            }

            setTimeout(this.onVideoPlay, frameTimeout);
        },
        load() {
            var _that = this;
            _that.isButtonDisabled = true;
            // load 3d model
            model.initThree(canvasWebGLId,
                modelUrl,
                canvasWidth,
                canvasHeight);

            patternImage.addEventListener("load", function () {
                // waiting for OpenCV to be ready
                setTimeout(function () {
                    imageTracker.initTemplateImage('patternImage')
                    _that.isButtonDisabled = false;
                }, 1200)
            })
        },
    },
    mounted: function () {
        this.load();
    },
})

