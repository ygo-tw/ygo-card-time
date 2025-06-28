/*
MIT License

Copyright (c) 2017 Pavel Dobryakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

// Simulation section

// const canvas = document.getElementsByTagName('canvas')[0]
let canvas;

let config = {
  SIM_RESOLUTION: 256, // 模擬網格分辨率
  DYE_RESOLUTION: 1024, // 染料網格的分辨率
  CAPTURE_RESOLUTION: 512, //捕捉幀的分辨率
  DENSITY_DISSIPATION: 1, //密度消散的速率
  VELOCITY_DISSIPATION: 2, // 速度消散的速率( 數值越大，越容易跟著滑鼠的位置)
  PRESSURE: 1, //模擬中使用的壓力值( 數值越小，越容易擴散)
  PRESSURE_ITERATIONS: 20, //壓力迭代次數
  CURL: 0, //模擬中使用的旋度值(數值越小，越平滑)
  SPLAT_RADIUS: 0.3, //splats 的半徑(數值越大 畫出來的越大)
  SPLAT_FORCE: 6000, //splats 施加的力
  SHADING: true, //在視覺化中啟用著色
  COLORFUL: true, //允許快速改變顏色(換色)
  COLOR_UPDATE_SPEED: 4, //顏色更新速度(換色秒數)
  PAUSED: false,
  // BACK_COLOR: { r: 20, g: 20, b: 20 },
  BACK_COLOR: { r: 20, g: 20, b: 20 },
  TRANSPARENT: false, //如果為 true，則使畫布透明
  BLOOM: false, //啟用光暈效果
  BLOOM_ITERATIONS: 8, //光暈效果迭代次數
  BLOOM_RESOLUTION: 256, // 光暈效果的分辨率
  BLOOM_INTENSITY: 0.8, // 暈效果的強度
  BLOOM_THRESHOLD: 0.6, // 暈效果閾值
  BLOOM_SOFT_KNEE: 0.7, // 光暈效果的軟拐點值
  SUNRAYS: false, // 啟用太陽光線效果
  SUNRAYS_RESOLUTION: 196, // 太陽光線效果的分辨率
  SUNRAYS_WEIGHT: 1.0, // 太陽光線效果的權重
};

function pointerPrototype() {
  this.id = -1;
  this.texcoordX = 0;
  this.texcoordY = 0;
  this.prevTexcoordX = 0;
  this.prevTexcoordY = 0;
  this.deltaX = 0;
  this.deltaY = 0;
  this.down = false;
  this.moved = false;
  this.color = { r: 0, g: 0, b: 0 };
}

let pointers = [];
let splatStack = [];

let flag = 0;

//直線
let autoPathList = [
  {
    id: -1,
    posX: 43,
    posY: 663,
    texcoordX: 0.022970085470085472,
    texcoordY: 0.36494252873563215,
    prevTexcoordX: 0.019230769230769232,
    prevTexcoordY: 0.36494252873563215,
    deltaX: 0.00373931623931624,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 65,
    posY: 667,
    texcoordX: 0.034722222222222224,
    texcoordY: 0.36111111111111116,
    prevTexcoordX: 0.027243589743589744,
    prevTexcoordY: 0.3639846743295019,
    deltaX: 0.00747863247863248,
    deltaY: -0.0016025641025640542,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 99,
    posY: 669,
    texcoordX: 0.052884615384615384,
    texcoordY: 0.3591954022988506,
    prevTexcoordX: 0.042735042735042736,
    prevTexcoordY: 0.3591954022988506,
    deltaX: 0.010149572649572648,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 145,
    posY: 669,
    texcoordX: 0.07745726495726496,
    texcoordY: 0.3591954022988506,
    prevTexcoordX: 0.06570512820512821,
    prevTexcoordY: 0.3591954022988506,
    deltaX: 0.011752136752136752,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 200,
    posY: 669,
    texcoordX: 0.10683760683760683,
    texcoordY: 0.3591954022988506,
    prevTexcoordX: 0.09241452991452992,
    prevTexcoordY: 0.3591954022988506,
    deltaX: 0.014423076923076913,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 249,
    posY: 669,
    texcoordX: 0.1330128205128205,
    texcoordY: 0.3591954022988506,
    prevTexcoordX: 0.11858974358974358,
    prevTexcoordY: 0.3591954022988506,
    deltaX: 0.014423076923076927,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 293,
    posY: 669,
    texcoordX: 0.15651709401709402,
    texcoordY: 0.3591954022988506,
    prevTexcoordX: 0.14636752136752137,
    prevTexcoordY: 0.3591954022988506,
    deltaX: 0.010149572649572641,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 334,
    posY: 670,
    texcoordX: 0.17841880341880342,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.16826923076923078,
    prevTexcoordY: 0.3591954022988506,
    deltaX: 0.010149572649572641,
    deltaY: -0.0005341880341880387,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 370,
    posY: 670,
    texcoordX: 0.19764957264957264,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.1875,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.010149572649572641,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 409,
    posY: 670,
    texcoordX: 0.21848290598290598,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.2077991452991453,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.010683760683760674,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 455,
    posY: 670,
    texcoordX: 0.24305555555555555,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.23130341880341881,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.011752136752136738,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 496,
    posY: 670,
    texcoordX: 0.26495726495726496,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.2532051282051282,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.011752136752136766,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 559,
    posY: 670,
    texcoordX: 0.2986111111111111,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.28846153846153844,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.010149572649572669,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 605,
    posY: 670,
    texcoordX: 0.3231837606837607,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.31196581196581197,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.011217948717948734,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 649,
    posY: 670,
    texcoordX: 0.3466880341880342,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.33386752136752135,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.01282051282051283,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 698,
    posY: 670,
    texcoordX: 0.37286324786324787,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.36004273504273504,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.01282051282051283,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 747,
    posY: 670,
    texcoordX: 0.39903846153846156,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.38621794871794873,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.01282051282051283,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 799,
    posY: 670,
    texcoordX: 0.4268162393162393,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.4107905982905983,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.016025641025641024,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 856,
    posY: 670,
    texcoordX: 0.45726495726495725,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.4412393162393162,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.016025641025641024,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 914,
    posY: 670,
    texcoordX: 0.48824786324786323,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.4722222222222222,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.016025641025641024,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 960,
    posY: 670,
    texcoordX: 0.5128205128205128,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.49946581196581197,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.013354700854700807,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 1006,
    posY: 670,
    texcoordX: 0.5373931623931624,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.5245726495726496,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.012820512820512775,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 1048,
    posY: 670,
    texcoordX: 0.5598290598290598,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.5480769230769231,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.01175213675213671,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 1097,
    posY: 670,
    texcoordX: 0.5860042735042735,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.5742521367521367,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.011752136752136821,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 1157,
    posY: 670,
    texcoordX: 0.6180555555555556,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.6079059829059829,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.010149572649572725,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 1198,
    posY: 670,
    texcoordX: 0.6399572649572649,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.6298076923076923,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.010149572649572614,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.154, g: 0.078, b: 0.05 }, // 改成深金色
  },
  {
    id: -1,
    posX: 1242,
    posY: 670,
    texcoordX: 0.6634615384615384,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.6517094017094017,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.01175213675213671,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1277,
    posY: 670,
    texcoordX: 0.6821581196581197,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.6736111111111112,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.008547008547008517,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1319,
    posY: 670,
    texcoordX: 0.7045940170940171,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.6939102564102564,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.010683760683760757,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1357,
    posY: 670,
    texcoordX: 0.7248931623931624,
    texcoordY: 0.35823754789272033,
    prevTexcoordX: 0.7158119658119658,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.009081196581196549,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1388,
    posY: 671,
    texcoordX: 0.7414529914529915,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.7334401709401709,
    prevTexcoordY: 0.35823754789272033,
    deltaX: 0.008012820512820595,
    deltaY: -0.0005341880341880387,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1414,
    posY: 671,
    texcoordX: 0.7553418803418803,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.749465811965812,
    prevTexcoordY: 0.35727969348659006,
    deltaX: 0.005876068376068355,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1442,
    posY: 671,
    texcoordX: 0.7702991452991453,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.7633547008547008,
    prevTexcoordY: 0.35727969348659006,
    deltaX: 0.006944444444444531,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1467,
    posY: 671,
    texcoordX: 0.7836538461538461,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.7772435897435898,
    prevTexcoordY: 0.35727969348659006,
    deltaX: 0.0064102564102563875,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1489,
    posY: 671,
    texcoordX: 0.7954059829059829,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.7895299145299145,
    prevTexcoordY: 0.35727969348659006,
    deltaX: 0.005876068376068355,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1506,
    posY: 671,
    texcoordX: 0.8044871794871795,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.7996794871794872,
    prevTexcoordY: 0.35727969348659006,
    deltaX: 0.004807692307692291,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1520,
    posY: 671,
    texcoordX: 0.811965811965812,
    texcoordY: 0.35727969348659006,
    prevTexcoordX: 0.8108974358974359,
    prevTexcoordY: 0.35727969348659006,
    deltaX: 0.0010683760683760646,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1531,
    posY: 674,
    texcoordX: 0.8178418803418803,
    texcoordY: 0.3544061302681992,
    prevTexcoordX: 0.8162393162393162,
    prevTexcoordY: 0.3563218390804598,
    deltaX: 0.0016025641025640969,
    deltaY: -0.0010683760683760774,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1538,
    posY: 674,
    texcoordX: 0.8215811965811965,
    texcoordY: 0.3544061302681992,
    prevTexcoordX: 0.8199786324786325,
    prevTexcoordY: 0.3544061302681992,
    deltaX: 0.0016025641025640969,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.098, g: 0.06999999999999999, b: 0.05 },
  },
  {
    id: -1,
    posX: 1544,
    posY: 675,
    texcoordX: 0.8247863247863247,
    texcoordY: 0.35344827586206895,
    prevTexcoordX: 0.8226495726495726,
    prevTexcoordY: 0.35344827586206895,
    deltaX: 0.002136752136752129,
    deltaY: 0,
    down: true,
    moved: false,
    color: { r: 0.05, g: 0.07800000000000001, b: 0.15400000000000003 },
  },
];
let currentPathIndex = -1;
let autoPointer = new pointerPrototype();
autoPointer.color = generateColor();

pointers.push(new pointerPrototype());

let gl, ext;

let lastUpdateTime = Date.now();
let colorUpdateTimer = 0.0;

function getWebGLContext(canvas) {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  let _gl = canvas.getContext('webgl2', params);
  const isWebGL2 = !!_gl;
  if (!isWebGL2)
    _gl =
      canvas.getContext('webgl', params) ||
      canvas.getContext('experimental-webgl', params);

  let halfFloat;
  let supportLinearFiltering;
  if (isWebGL2) {
    _gl.getExtension('EXT_color_buffer_float');
    supportLinearFiltering = _gl.getExtension('OES_texture_float_linear');
  } else {
    halfFloat = _gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = _gl.getExtension('OES_texture_half_float_linear');
  }

  _gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const halfFloatTexType = isWebGL2 ? _gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
  let formatRGBA;
  let formatRG;
  let formatR;

  if (isWebGL2) {
    formatRGBA = getSupportedFormat(
      _gl,
      _gl.RGBA16F,
      _gl.RGBA,
      halfFloatTexType
    );
    formatRG = getSupportedFormat(_gl, _gl.RG16F, _gl.RG, halfFloatTexType);
    formatR = getSupportedFormat(_gl, _gl.R16F, _gl.RED, halfFloatTexType);
  } else {
    formatRGBA = getSupportedFormat(_gl, _gl.RGBA, _gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(_gl, _gl.RGBA, _gl.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(_gl, _gl.RGBA, _gl.RGBA, halfFloatTexType);
  }

  return {
    _gl,
    _ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering,
    },
  };
}

function getSupportedFormat(gl, internalFormat, format, type) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F:
        return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
      case gl.RG16F:
        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      default:
        return null;
    }
  }

  return {
    internalFormat,
    format,
  };
}

function supportRenderTextureFormat(gl, internalFormat, format, type) {
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

  let fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status == gl.FRAMEBUFFER_COMPLETE;
}

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

class Material {
  constructor(vertexShader, fragmentShaderSource) {
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
    this.programs = [];
    this.activeProgram = null;
    this.uniforms = [];
  }

  setKeywords(keywords) {
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);

    let program = this.programs[hash];
    if (program == null) {
      let fragmentShader = compileShader(
        gl.FRAGMENT_SHADER,
        this.fragmentShaderSource,
        keywords
      );
      program = createProgram(this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }

    if (program == this.activeProgram) return;

    this.uniforms = getUniforms(program);
    this.activeProgram = program;
  }

  bind() {
    gl.useProgram(this.activeProgram);
  }
}

class Program {
  constructor(vertexShader, fragmentShader) {
    this.uniforms = {};
    this.program = createProgram(vertexShader, fragmentShader);
    this.uniforms = getUniforms(this.program);
  }

  bind() {
    gl.useProgram(this.program);
  }
}

function createProgram(vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    console.trace(gl.getProgramInfoLog(program));

  return program;
}

function getUniforms(program) {
  let uniforms = [];
  let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    let uniformName = gl.getActiveUniform(program, i).name;
    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
  }
  return uniforms;
}

function compileShader(type, source, keywords) {
  source = addKeywords(source, keywords);

  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    console.trace(gl.getShaderInfoLog(shader));

  return shader;
}

function addKeywords(source, keywords) {
  if (keywords == null) return source;
  let keywordsString = '';
  keywords.forEach(keyword => {
    keywordsString += '#define ' + keyword + '\n';
  });
  return keywordsString + source;
}

let baseVertexShader;

let blurVertexShader;

let blurShader;

let copyShader;

let clearShader;

let colorShader;

let checkerboardShader;

const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);

        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`;

let bloomPrefilterShader;

let bloomBlurShader;

let bloomFinalShader;

let sunraysMaskShader;

let sunraysShader;

let splatShader;

let advectionShader;

let divergenceShader;

let curlShader;

let vorticityShader;

let pressureShader;

let gradientSubtractShader;

let blit;
let dye;
let velocity;
let divergence;
let curl;
let pressure;
let bloom;
let bloomFramebuffers = [];
let sunrays;
let sunraysTemp;

let ditheringTexture;

let blurProgram;
let copyProgram;
let clearProgram;
let colorProgram;
let checkerboardProgram;
let bloomPrefilterProgram;
let bloomBlurProgram;
let bloomFinalProgram;
let sunraysMaskProgram;
let sunraysProgram;
let splatProgram;
let advectionProgram;
let divergenceProgram;
let curlProgram;
let vorticityProgram;
let pressureProgram;
let gradienSubtractProgram;

let displayMaterial;

function initFramebuffers() {
  let simRes = getResolution(config.SIM_RESOLUTION);
  let dyeRes = getResolution(config.DYE_RESOLUTION);

  const texType = ext.halfFloatTexType;
  const rgba = ext.formatRGBA;
  const rg = ext.formatRG;
  const r = ext.formatR;
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  gl.disable(gl.BLEND);

  if (dye == null)
    dye = createDoubleFBO(
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
  else
    dye = resizeDoubleFBO(
      dye,
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );

  if (velocity == null)
    velocity = createDoubleFBO(
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering
    );
  else
    velocity = resizeDoubleFBO(
      velocity,
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering
    );

  divergence = createFBO(
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );
  curl = createFBO(
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );
  pressure = createDoubleFBO(
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );

  initBloomFramebuffers();
  initSunraysFramebuffers();
}

function initBloomFramebuffers() {
  let res = getResolution(config.BLOOM_RESOLUTION);

  const texType = ext.halfFloatTexType;
  const rgba = ext.formatRGBA;
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  bloom = createFBO(
    res.width,
    res.height,
    rgba.internalFormat,
    rgba.format,
    texType,
    filtering
  );

  bloomFramebuffers.length = 0;
  for (let i = 0; i < config.BLOOM_ITERATIONS; i++) {
    let width = res.width >> (i + 1);
    let height = res.height >> (i + 1);

    if (width < 2 || height < 2) break;

    let fbo = createFBO(
      width,
      height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
    bloomFramebuffers.push(fbo);
  }
}

function initSunraysFramebuffers() {
  let res = getResolution(config.SUNRAYS_RESOLUTION);

  const texType = ext.halfFloatTexType;
  const r = ext.formatR;
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  sunrays = createFBO(
    res.width,
    res.height,
    r.internalFormat,
    r.format,
    texType,
    filtering
  );
  sunraysTemp = createFBO(
    res.width,
    res.height,
    r.internalFormat,
    r.format,
    texType,
    filtering
  );
}

function createFBO(w, h, internalFormat, format, type, param) {
  gl.activeTexture(gl.TEXTURE0);
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  let fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let texelSizeX = 1.0 / w;
  let texelSizeY = 1.0 / h;

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

function createDoubleFBO(w, h, internalFormat, format, type, param) {
  let fbo1 = createFBO(w, h, internalFormat, format, type, param);
  let fbo2 = createFBO(w, h, internalFormat, format, type, param);

  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    get read() {
      return fbo1;
    },
    set read(value) {
      fbo1 = value;
    },
    get write() {
      return fbo2;
    },
    set write(value) {
      fbo2 = value;
    },
    swap() {
      let temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
    },
  };
}

function resizeFBO(target, w, h, internalFormat, format, type, param) {
  let newFBO = createFBO(w, h, internalFormat, format, type, param);
  copyProgram.bind();
  gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
  blit(newFBO);
  return newFBO;
}

function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
  if (target.width == w && target.height == h) return target;
  target.read = resizeFBO(
    target.read,
    w,
    h,
    internalFormat,
    format,
    type,
    param
  );
  target.write = createFBO(w, h, internalFormat, format, type, param);
  target.width = w;
  target.height = h;
  target.texelSizeX = 1.0 / w;
  target.texelSizeY = 1.0 / h;
  return target;
}

function updateKeywords() {
  let displayKeywords = [];
  if (config.SHADING) displayKeywords.push('SHADING');
  if (config.BLOOM) displayKeywords.push('BLOOM');
  if (config.SUNRAYS) displayKeywords.push('SUNRAYS');
  displayMaterial.setKeywords(displayKeywords);
}

function update() {
  const dt = calcDeltaTime();
  if (resizeCanvas()) initFramebuffers();
  updateColors(dt);
  applyInputs();
  if (!config.PAUSED) step(dt);
  render(null);
  requestAnimationFrame(update);
}

function calcDeltaTime() {
  let now = Date.now();
  let dt = (now - lastUpdateTime) / 1000;
  dt = Math.min(dt, 0.016666);
  lastUpdateTime = now;
  return dt;
}

function resizeCanvas() {
  let width = scaleByPixelRatio(canvas.clientWidth);
  let height = scaleByPixelRatio(canvas.clientHeight);
  if (canvas.width != width || canvas.height != height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

function updateColors(dt) {
  if (!config.COLORFUL) return;

  colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
  if (colorUpdateTimer >= 1) {
    colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
    pointers.forEach(p => {
      p.color = generateColor();
    });
  }
}

function applyInputs() {
  if (splatStack.length > 0) multipleSplats(splatStack.pop());

  // auto
  if (currentPathIndex != -1 && currentPathIndex < autoPathList.length) {
    let path = autoPathList[currentPathIndex];
    if (path) {
      splatPointer(path);
      currentPathIndex += 1;
    }
  }

  if (currentPathIndex == -1) {
    currentPathIndex = -2;
    setTimeout(function () {
      currentPathIndex = 0;
    }, 500);
  }

  // let path = autoPathList[currentPathIndex]
  // if (path) {
  //     splatPointer(path)
  //     currentPathIndex += 1
  // }
  // if (currentPathIndex !== -1 && currentPathIndex >= autoPathList.length) {
  //     currentPathIndex = -1
  //     setTimeout(function () {
  //         currentPathIndex = 0
  //     }, 1000)
  // }

  pointers.forEach(p => {
    if (p.moved) {
      p.moved = false;
      splatPointer(p);
    }
  });
}

function step(dt) {
  gl.disable(gl.BLEND);

  curlProgram.bind();
  gl.uniform2f(
    curlProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl);

  vorticityProgram.bind();
  gl.uniform2f(
    vorticityProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
  gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write);
  velocity.swap();

  divergenceProgram.bind();
  gl.uniform2f(
    divergenceProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(divergence);

  clearProgram.bind();
  gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
  gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
  blit(pressure.write);
  pressure.swap();

  pressureProgram.bind();
  gl.uniform2f(
    pressureProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
    blit(pressure.write);
    pressure.swap();
  }

  gradienSubtractProgram.bind();
  gl.uniform2f(
    gradienSubtractProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(
    gradienSubtractProgram.uniforms.uPressure,
    pressure.read.attach(0)
  );
  gl.uniform1i(
    gradienSubtractProgram.uniforms.uVelocity,
    velocity.read.attach(1)
  );
  blit(velocity.write);
  velocity.swap();

  advectionProgram.bind();
  gl.uniform2f(
    advectionProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  if (!ext.supportLinearFiltering)
    gl.uniform2f(
      advectionProgram.uniforms.dyeTexelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
  let velocityId = velocity.read.attach(0);
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
  gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    config.VELOCITY_DISSIPATION
  );
  blit(velocity.write);
  velocity.swap();

  if (!ext.supportLinearFiltering)
    gl.uniform2f(
      advectionProgram.uniforms.dyeTexelSize,
      dye.texelSizeX,
      dye.texelSizeY
    );
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    config.DENSITY_DISSIPATION
  );
  blit(dye.write);
  dye.swap();
}

function render(target) {
  if (config.BLOOM) applyBloom(dye.read, bloom);
  if (config.SUNRAYS) {
    applySunrays(dye.read, dye.write, sunrays);
    blur(sunrays, sunraysTemp, 1);
  }

  if (target == null || !config.TRANSPARENT) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
  } else {
    gl.disable(gl.BLEND);
  }

  if (!config.TRANSPARENT) drawColor(target, normalizeColor(config.BACK_COLOR));
  if (target == null && config.TRANSPARENT) drawCheckerboard(target);
  drawDisplay(target);
}

function drawColor(target, color) {
  colorProgram.bind();
  gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
  blit(target);
}

function drawCheckerboard(target) {
  checkerboardProgram.bind();
  gl.uniform1f(
    checkerboardProgram.uniforms.aspectRatio,
    canvas.width / canvas.height
  );
  blit(target);
}

function drawDisplay(target) {
  let width = target == null ? gl.drawingBufferWidth : target.width;
  let height = target == null ? gl.drawingBufferHeight : target.height;

  displayMaterial.bind();
  if (config.SHADING)
    gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
  gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
  if (config.BLOOM) {
    gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1));
    gl.uniform1i(
      displayMaterial.uniforms.uDithering,
      ditheringTexture.attach(2)
    );
    let scale = getTextureScale(ditheringTexture, width, height);
    gl.uniform2f(displayMaterial.uniforms.ditherScale, scale.x, scale.y);
  }
  if (config.SUNRAYS)
    gl.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3));
  blit(target);
}

function applyBloom(source, destination) {
  if (bloomFramebuffers.length < 2) return;

  let last = destination;

  gl.disable(gl.BLEND);
  bloomPrefilterProgram.bind();
  let knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
  let curve0 = config.BLOOM_THRESHOLD - knee;
  let curve1 = knee * 2;
  let curve2 = 0.25 / knee;
  gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
  gl.uniform1f(
    bloomPrefilterProgram.uniforms.threshold,
    config.BLOOM_THRESHOLD
  );
  gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
  blit(last);

  bloomBlurProgram.bind();
  for (let i = 0; i < bloomFramebuffers.length; i++) {
    let dest = bloomFramebuffers[i];
    gl.uniform2f(
      bloomBlurProgram.uniforms.texelSize,
      last.texelSizeX,
      last.texelSizeY
    );
    gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
    blit(dest);
    last = dest;
  }

  gl.blendFunc(gl.ONE, gl.ONE);
  gl.enable(gl.BLEND);

  for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
    let baseTex = bloomFramebuffers[i];
    gl.uniform2f(
      bloomBlurProgram.uniforms.texelSize,
      last.texelSizeX,
      last.texelSizeY
    );
    gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
    gl.viewport(0, 0, baseTex.width, baseTex.height);
    blit(baseTex);
    last = baseTex;
  }

  gl.disable(gl.BLEND);
  bloomFinalProgram.bind();
  gl.uniform2f(
    bloomFinalProgram.uniforms.texelSize,
    last.texelSizeX,
    last.texelSizeY
  );
  gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
  gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
  blit(destination);
}

function applySunrays(source, mask, destination) {
  gl.disable(gl.BLEND);
  sunraysMaskProgram.bind();
  gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, source.attach(0));
  blit(mask);

  sunraysProgram.bind();
  gl.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT);
  gl.uniform1i(sunraysProgram.uniforms.uTexture, mask.attach(0));
  blit(destination);
}

function blur(target, temp, iterations) {
  blurProgram.bind();
  for (let i = 0; i < iterations; i++) {
    gl.uniform2f(blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
    gl.uniform1i(blurProgram.uniforms.uTexture, target.attach(0));
    blit(temp);

    gl.uniform2f(blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
    gl.uniform1i(blurProgram.uniforms.uTexture, temp.attach(0));
    blit(target);
  }
}

function splatPointer(pointer) {
  let dx = pointer.deltaX * config.SPLAT_FORCE;
  let dy = pointer.deltaY * config.SPLAT_FORCE;
  splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
}

function multipleSplats(amount) {
  for (let i = 0; i < amount; i++) {
    const color = generateColor();
    color.r *= 10.0;
    color.g *= 10.0;
    color.b *= 10.0;
    const x = Math.random();
    const y = Math.random();
    const dx = 1000 * (Math.random() - 0.5);
    const dy = 1000 * (Math.random() - 0.5);
    splat(x, y, dx, dy, color);
  }
}

function splat(x, y, dx, dy, color) {
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
  gl.uniform1f(
    splatProgram.uniforms.radius,
    correctRadius(config.SPLAT_RADIUS / 100.0)
  );
  blit(velocity.write);
  velocity.swap();

  gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
  gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
  blit(dye.write);
  dye.swap();
}

function correctRadius(radius) {
  let aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1) radius *= aspectRatio;
  return radius;
}

function updatePointerMoveData(pointer, posX, posY) {
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.texcoordX = posX / canvas.width;
  pointer.texcoordY = 1.0 - posY / canvas.height;
  pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
  pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
  //移動閥值，太小就不著色
  pointer.moved =
    Math.abs(pointer.deltaX) > 0.001 || Math.abs(pointer.deltaY) > 0.001;
}

function correctDeltaX(delta) {
  let aspectRatio = canvas.width / canvas.height;
  if (aspectRatio < 1) delta *= aspectRatio;
  return delta;
}

function correctDeltaY(delta) {
  let aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1) delta /= aspectRatio;
  return delta;
}

function generateColor() {
  const tmp = 0.2;
  if (flag === 0) {
    flag = 1;
    // 將偏藍色改成金色系
    let c = { r: 0.77, g: 0.62, b: 0.15 }; // 金黃色
    c.r *= tmp;
    c.g *= tmp;
    c.b *= tmp;
    return c;
  } else {
    flag = 0;
    let c = { r: 0.49, g: 0.35, b: 0.25 };
    c.r *= tmp;
    c.g *= tmp;
    c.b *= tmp;
    return c;
  }
}

function normalizeColor(input) {
  let output = {
    r: input.r / 255,
    g: input.g / 255,
    b: input.b / 255,
  };
  return output;
}

function wrap(value, min, max) {
  let range = max - min;
  if (range == 0) return min;
  return ((value - min) % range) + min;
}

function getResolution(resolution) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

  let min = Math.round(resolution);
  let max = Math.round(resolution * aspectRatio);

  if (gl.drawingBufferWidth > gl.drawingBufferHeight)
    return { width: max, height: min };
  else return { width: min, height: max };
}

function getTextureScale(texture, width, height) {
  return {
    x: width / texture.width,
    y: height / texture.height,
  };
}

function scaleByPixelRatio(input) {
  let pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

function hashCode(s) {
  if (s.length == 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function init(_canvas) {
  canvas = _canvas;
  const { _gl, _ext } = getWebGLContext(canvas);
  gl = _gl;
  ext = _ext;
  resizeCanvas();
  if (isMobile()) {
    config.DYE_RESOLUTION = 512;
  }
  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 512;
    config.SHADING = false;
    config.BLOOM = false;
    config.SUNRAYS = false;
  }

  baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`
  );

  blurVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`
  );

  blurShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`
  );

  copyShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`
  );

  clearShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`
  );

  colorShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`
  );

  checkerboardShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;

    #define SCALE 25.0

    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`
  );
  bloomPrefilterShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`
  );

  bloomBlurShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`
  );

  bloomFinalShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`
  );

  sunraysMaskShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`
  );

  sunraysShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`
  );

  splatShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`
  );

  advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
  );

  divergenceShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`
  );

  curlShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`
  );

  vorticityShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`
  );

  pressureShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`
  );

  gradientSubtractShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`
  );

  blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  blurProgram = new Program(blurVertexShader, blurShader);
  copyProgram = new Program(baseVertexShader, copyShader);
  clearProgram = new Program(baseVertexShader, clearShader);
  colorProgram = new Program(baseVertexShader, colorShader);
  checkerboardProgram = new Program(baseVertexShader, checkerboardShader);
  bloomPrefilterProgram = new Program(baseVertexShader, bloomPrefilterShader);
  bloomBlurProgram = new Program(baseVertexShader, bloomBlurShader);
  bloomFinalProgram = new Program(baseVertexShader, bloomFinalShader);
  sunraysMaskProgram = new Program(baseVertexShader, sunraysMaskShader);
  sunraysProgram = new Program(baseVertexShader, sunraysShader);
  splatProgram = new Program(baseVertexShader, splatShader);
  advectionProgram = new Program(baseVertexShader, advectionShader);
  divergenceProgram = new Program(baseVertexShader, divergenceShader);
  curlProgram = new Program(baseVertexShader, curlShader);
  vorticityProgram = new Program(baseVertexShader, vorticityShader);
  pressureProgram = new Program(baseVertexShader, pressureShader);
  gradienSubtractProgram = new Program(
    baseVertexShader,
    gradientSubtractShader
  );

  displayMaterial = new Material(baseVertexShader, displayShaderSource);

  updateKeywords();
  initFramebuffers();
  // multipleSplats(parseInt(Math.random() * 10) + 5)

  update();

  canvas.addEventListener('mousemove', e => {
    let pointer = pointers[0];
    // if (!pointer.down) return
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    updatePointerMoveData(pointer, posX, posY);
  });
}
