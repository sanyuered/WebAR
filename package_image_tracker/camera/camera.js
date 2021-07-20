import * as image from '../utils/imageBusiness.js';
import * as model from '../utils/modelBusiness.js';
const canvasId = 'canvas2d';
const canvasWebGLId = 'canvasWebGL';
// a url of a sprite image
const modelUrl = '../../assets/sunglass.glb';
// it should be more than detect time
const frameSpeed = 50;
const canvasWidth = 375;
const canvasHeight = 375;

var app = new Vue({
    el: '#app',
    data: {
        isShowLoadingToast: false,
        isButtonDisabled: false,
        notice: '',
    },
    methods: {
        async processVideo(frame) {
            var _that = this;
            const ctx = document.getElementById(canvasId).getContext('2d');
            // draw a video frame on a 2d canvas
            ctx.drawImage(frame, 0, 0,canvasWidth,canvasHeight);
            // get a video frame from a 2d canvas
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
        async takePhoto() {
            if (!navigator.mediaDevices) {
                var msg = 'not support of navigator.mediaDevices';
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
                    facingMode:'environment',
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
                await this.processVideo(inputData);
            }

            setTimeout(this.onVideoPlay, frameSpeed);
        },
        load() {
            this.isButtonDisabled = true;

            // load 3d model
            model.initThree(canvasWebGLId,
                modelUrl,
                canvasWidth,
                canvasHeight);
            image.initTracker();

            this.isButtonDisabled = false;
        },
    },
    mounted: function () {
        this.load();
    },
})

