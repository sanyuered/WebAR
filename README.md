1. [Chinese README](https://zhuanlan.zhihu.com/p/72617098)  

2. [Chinese Source Code Analysis](https://zhuanlan.zhihu.com/p/74438078)

## Updated 

| Date　　　| Update |
| -- | -- |
| 2021-08-15 | New: Added a video mask mode for image AR. This is a CSS 3D transformation, which does not require three.js. |
| 2021-07-21 | New: This project is the same as https://github.com/sanyuered/WeChat-MiniProgram-WebAR, but it is a pure front-end website. |

## Visit a live example

https://sanyuered.github.io/WebAR/

## Introduction of Web AR 

This is a Web AR Demo. 

We can create AR effects by using "tracking.js" and "jsfeat" library. 

The "tracking.js" brings computer vision algorithms and techniques into browser environment. The "jsfeat" is also a JavaScript computer vision library. We can do real-time image and face detection.

[tracking.js](https://trackingjs.com/) and [JSFeat](https://inspirit.github.io/jsfeat/)

Index Page of the WeChat Mini-program

![avatar](screenshot/index.jpg)

## Image AR and 3D Mask

Use the demo to scan a pattern image below. 

![avatar](assets/face_pattern.jpg)

A cat beard is on the pattern image.

![avatar](screenshot/1-1.jpg)

A effect of translating and scaling.

![avatar](screenshot/1-2.jpg)

A effect of rotating.

![avatar](screenshot/1-3.jpg)

## Image AR and Video Mask

Use the demo to scan a rotating image below. 

![avatar](screenshot/4-1.jpg)

A video player is on and aligned with the image.

![avatar](screenshot/4-2.jpg)

## How to replace the 2D mask "cat beard" 

You may replace the default url of a image for 2D mask.

File: /package_image_tracker/photo/photo.js and
/package_image_tracker/camera/camera.js

```javascript
const modelUrl = '../../assets/cat_beard.png';
```

## How to replace the pattern image

File: /package_face_tracker/utils/imageBusiness.js

```javascript
const patternImageUrl = '../../assets/face_pattern.jpg';
```

A pattern image is below.

![avatar](assets/face_pattern.jpg)

## How to put a image on an other position

Select a track point on a pattern image, the point is used to set the "cat beard" image.

File: /package_image_tracker/utils/modelBusiness.js

```javascript
// a index of a track point on a pattern image
const trackPoint = { 
    x: 186, // the width of the pattern image is 375
    y: 140, // the height of the pattern image is 375
};
```

