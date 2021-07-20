const hiddenCanvasId = 'hiddenCanvas';
// pattern image resample levels
const resampleLevels = 4;
// pattern image width
var patternFrameWidth;
// pattern image height
var patternFrameHeight;
// pattern image max width
const patternFrameMaxWidth = 375;
// image tracker.
var tracker = null;
// pattern Image Array
var patternImageArray = [];
// magic number
const sc_inc = Math.sqrt(2.0);
// pattern image url: relative url,temp url and network url.
const patternImageUrl = '../../assets/face_pattern.jpg';

function detect(frame, width, height, callback) {
    if (!tracker) {
        console.log('detect:', 'waiting for the tracker initing to complete.');
        return;
    }
    var result = tracker.track(frame, width, height);
    if (callback) {
        callback(result);
    }

}

function drawPatternImageCallback(ctx) {
    var imageX = 0;
    var newWidth = patternFrameWidth;
    var newHeight = patternFrameHeight;
    // init
    patternImageArray = [];

    for (var i = 0; i < resampleLevels; i++) {
        var canvasRes = ctx.getImageData(imageX, 0, newWidth, newHeight);

        console.log('resample pattern image', canvasRes.width, canvasRes.height);
        patternImageArray.push({
            pixels: canvasRes.data,
            width: canvasRes.width,
            height: canvasRes.height,
        });

        // resample
        imageX += newWidth;
        newWidth = Math.round(newWidth / sc_inc);
        newHeight = Math.round(newHeight / sc_inc);
    }

    // init ImageTracker
    tracker = new ImageTracker(patternImageArray);

}

function initTrackerCallback(patternImage, newWidth, newHeight) {
    const ctx = document.getElementById(hiddenCanvasId).getContext('2d');

    var imageX = 0;

    for (var i = 0; i < resampleLevels; i++) {
        // draw image on canvas
        ctx.drawImage(patternImage, imageX, 0, newWidth, newHeight);
        // resample
        imageX += newWidth;
        newWidth = Math.round(newWidth / sc_inc);
        newHeight = Math.round(newHeight / sc_inc);
    }

    drawPatternImageCallback(ctx);
}

// get patter image
function initTracker() {
    // set pattern image
    var patternImage = document.getElementById("patternImage");
    patternImage.src = patternImageUrl;
    patternImage.addEventListener("load", function () {
        // pattern image width
        patternFrameWidth = patternImage.width;
        // pattern image height
        patternFrameHeight = patternImage.height;
        
        // reduce image size to increase image process speed
        if (patternFrameWidth > patternFrameMaxWidth) {
            patternFrameWidth = patternFrameMaxWidth;
            patternFrameHeight = (patternImage.height / patternImage.width) * patternFrameMaxWidth;
        }
        // resample width and height
        var newWidth = patternFrameWidth;
        var newHeight = patternFrameHeight;
        initTrackerCallback(patternImage, newWidth, newHeight);
    });
}

export {
    initTracker,
    detect,
};
