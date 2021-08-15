import * as image from '../utils/imageBusiness.js';
const canvasId = 'canvas2d';
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
// it should be more than detect time
const frameTimeout = 100;
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
            ctx.drawImage(frame, 0, 0, canvasWidth, canvasHeight);
            // get a video frame from a 2d canvas
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
        updateMaskVideoPosition(prediction) {
            console.log('prediction', prediction)
            var t = prediction.transform.data;
            var target = model.getTranslation(t, trackPoint.x, trackPoint.y)
            var x = target._x - canvasWidth / 2;
            var y = target._y - canvasHeight / 2;
            // convert 3x3 to 4x4
            var t_array = [t[0], t[3], 0, t[6],
            t[1], t[4], 0, t[7],
                0, 0, 1, 0,
                x, y, 0, t[8]];
            var t_matrix = 'matrix3d(' + t_array.join(',') + ')';

            var videoMask = document.getElementById(videoMaskId);
            videoMask.style.transform = t_matrix;
        },
        setMaskVideoDefaultPosition() {
            var videoMask = document.getElementById(videoMaskId);
            var t_matrix = 'matrix3d(0.65, 0, 0, 0,  0, 0.65, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1)';
            videoMask.style.transform = t_matrix;
        },
        getTranslation(td, x, y) {
            var m00 = td[0], m01 = td[1], m02 = td[2],
                m10 = td[3], m11 = td[4], m12 = td[5],
                m20 = td[6], m21 = td[7], m22 = td[8];
            var x2 = m00 * x + m01 * y + m02;
            var y2 = m10 * x + m11 * y + m12;
            var ws = m20 * x + m21 * y + m22;
            var sc = 1.0 / ws;
            var _x = x2 * sc;
            var _y = y2 * sc;

            // console.log('translation', _x, _y);
            return { _x, _y };
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

            this.playMaskVideo();

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
                await this.processVideo(inputData);
            }

            setTimeout(this.onVideoPlay, frameTimeout);
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

