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

function getTranslation(td, x, y) {
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
}

function updateMaskVideoPosition(prediction,
    videoMaskId,
    trackPoint,
    canvasWidth,
    canvasHeight) {
    console.log('prediction', prediction)
    var t = prediction.transform.data;
    var target = getTranslation(t, trackPoint.x, trackPoint.y)
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
}

function setMaskVideoDefaultPosition(videoMaskId) {
    var videoMask = document.getElementById(videoMaskId);
    var t_matrix = 'matrix3d(0.65, 0, 0, 0,  0, 0.65, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1)';
    videoMask.style.transform = t_matrix;
}


export {
    initTracker,
    detect,
    updateMaskVideoPosition,
    setMaskVideoDefaultPosition,
    getTranslation,
};
