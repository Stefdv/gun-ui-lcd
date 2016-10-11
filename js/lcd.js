/*
 * Copyright (c) 2013 by Gerrit Grunwald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 var Lcd = function(canvas,parameters) {
    var doc                     = document;

    var param                   = parameters                    || {};

    var upperCenterText         = param.upperCenterText || '';
    var upperCenterTextVisible  = param.upperCenterTextVisible === undefined ? false : param.upperCenterTextVisible;
    var unit                    = param.unitString || '';
    var unitVisible             = param.unitVisible === undefined ? false : param.unitVisible;
    var lowerRightText          = param.lowerRightText || '';
    var lowerRightTextVisible   = param.lowerRightTextVisible === undefined ? false : param.lowerRightTextVisible;
    var minValue                = param.minValue || 0;
    var maxValue                = param.maxValue || 100;
    var value                   = param.value || minValue;
    var decimals                = param.decimals || 2;
    var threshold               = param.threshold || 100;
    var thresholdVisible        = param.thresholdVisible === undefined ? false : param.thresholdVisible;
    var upperLeftText           = param.upperLeftText || 0;
    var upperLeftTextVisible    = param.upperLeftTextVisible === undefined ? false : param.upperLeftTextVisible;
    var upperRightText          = param.upperRightText || 0;
    var upperRightTextVisible   = param.upperRightTextVisible === undefined ? false : param.upperRightTextVisible;
    var lowerCenterText         = param.lowerCenterText == undefined ? '' : param.lowerCenterText;
    var lowerCenterTextVisible  = param.lowerCenterTextVisible === undefined ? false : param.lowerCenterTextVisible;
    var formerValueVisible      = param.formerValueVisible === undefined ? false : param.formerValueVisible;
    var battery                 = param.battery || 0;
    var batteryVisible          = param.batteryVisible === undefined ? false : param.batteryVisible;
    var trend                   = param.trend || '';
    var trendVisible            = param.trendVisible === undefined ? false : param.trendVisible;
    var alarmVisible            = param.alarmVisible === undefined ? false : param.alarmVisible;
    var signalVisible           = param.signalVisible === undefined ? false : clamp(0, 1, param.signalVisible);
    var signalStrength          = param.signalStrength === undefined ? 0 : param.signalStrength;
    var crystalEffectVisible    = param.crystalEffectVisible === undefined ? false : param.crystalEffectVisible;
    var width                   = param.width || window.innerWidth;
    var height                  = param.height || window.innerWidth * 0.2666666666;
    var scalable                = param.scalable || false;
    var design                  = param.design || 'standard';
    var animated                = param.animated === undefined ? false : param.animated;
    var duration                = clamp(0, 10, param.duration) || 0.8;
    var foregroundShadowEnabled = param.foregroundShadowEnabled === undefined ? false : param.foregroundShadowEnabled;

    var showThreshold           = false;

    var foregroundColor        = 'rgb(53, 42, 52)';
    var backgroundColor        = 'rgba(53, 42, 52, 0.1)';
     
   if (scalable) window.addEventListener("resize", onResize, false);

    const LCD_FONT_NAME = 'digital-7mono';
    var lcdFontHeight   = Math.floor(0.5833333333 * height);
    var lcdFont         = lcdFontHeight + 'px ' + LCD_FONT_NAME;

    const STD_FONT_NAME = 'Arial, sans-serif';
    var lcdUnitFont     = (0.26 * height) + 'px ' + STD_FONT_NAME;
    var lcdTitleFont    = (0.1666666667 * height) + 'px ' + STD_FONT_NAME;
    var lcdSmallFont    = (0.1666666667 * height) + 'px ' + STD_FONT_NAME;

    var aspectRatio   = height / width;

    var minMeasuredValue = 100;
    var maxMeasuredValue = 0;
    var formerValue      = 0;

    // Create <canvas> element

    var mainCtx     = getCanvasContext(canvas);
     // Set the size - also clears the canvas
    mainCtx.canvas.width = width;
    mainCtx.canvas.height = height;
    var lcdBuffer   = createBuffer(width,height);
    var textBuffer  = createBuffer(width,height);
    var iconsBuffer = createBuffer(width,height);
    var crystalBuffer = createBuffer(width,height);
    


    // ******************** private methods ************************************         
    var drawLcd = function() {

        var ctx    = lcdBuffer.getContext("2d");
        var width  = lcdBuffer.width;
        var height = lcdBuffer.height;

        var radius = 0.09375 * height;

        ctx.clearRect(0, 0, width, height);
                
        // adjust design
        var frame = ctx.createLinearGradient(0, 0, 0, height);
        frame.addColorStop(0.0, 'rgb(26, 26, 26)');
        frame.addColorStop(0.01, 'rgb(77, 77, 77)');
        frame.addColorStop(0.83, 'rgb(77, 77, 77)');
        frame.addColorStop(1.0, 'rgb(221, 221, 221)');
        
        var main = ctx.createLinearGradient(0, 0.021 * height, 0, 0.98 * height);
        switch(design) {
            case 'lcd-beige'        : main.addColorStop(0.0, 'rgb(200, 200, 177)'); main.addColorStop(0.005, 'rgb(241, 237, 207)'); main.addColorStop(0.5, 'rgb(234, 230, 194)'); main.addColorStop(0.5, 'rgb(225, 220, 183)'); main.addColorStop(1.0, 'rgb(237, 232, 191)'); foregroundColor = 'rgb(0, 0, 0)'; backgroundColor = 'rgba(0, 0, 0, 0.1)'; break; 
            case 'blue'             : main.addColorStop(0.0, 'rgb(200, 200, 177)'); main.addColorStop(0.005, 'rgb(241, 237, 207)'); main.addColorStop(0.5, 'rgb(234, 230, 194)'); main.addColorStop(0.5, 'rgb(225, 220, 183)'); main.addColorStop(1.0, 'rgb(237, 232, 191)'); foregroundColor = 'rgb(0, 0, 0)'; backgroundColor = 'rgba(0, 0, 0, 0.1)'; break;
            case 'orange'           : main.addColorStop(0.0, 'rgb(255, 255, 255)'); main.addColorStop(0.005, 'rgb(255, 245, 225)'); main.addColorStop(0.5, 'rgb(255, 217, 147)'); main.addColorStop(0.5, 'rgb(255, 201, 104)'); main.addColorStop(1.0, 'rgb(255, 227, 173)'); foregroundColor = 'rgb( 80, 55, 0)'; backgroundColor = 'rgba(80, 55, 0, 0.1)'; break; 
            case 'red'              : main.addColorStop(0.0, 'rgb(255, 255, 255)'); main.addColorStop(0.005, 'rgb(255, 225, 225)'); main.addColorStop(0.5, 'rgb(252, 114, 115)'); main.addColorStop(0.5, 'rgb(252, 114, 115)'); main.addColorStop(1.0, 'rgb(254, 178, 178)'); foregroundColor = 'rgb( 79, 12, 14)'; backgroundColor = 'rgba(79, 12, 14, 0.1)'; break;
            case 'yellow'           : main.addColorStop(0.0, 'rgb(255, 255, 255)'); main.addColorStop(0.005, 'rgb(245, 255, 186)'); main.addColorStop(0.5, 'rgb(158, 205,   0)'); main.addColorStop(0.5, 'rgb(158, 205,   0)'); main.addColorStop(1.0, 'rgb(210, 255,   0)'); foregroundColor = 'rgb( 64, 83, 0)'; backgroundColor = 'rgba(64, 83, 0, 0.1)'; break;
            case 'white'            : main.addColorStop(0.0, 'rgb(255, 255, 255)'); main.addColorStop(0.005, 'rgb(255, 255, 255)'); main.addColorStop(0.5, 'rgb(241, 246, 242)'); main.addColorStop(0.5, 'rgb(229, 239, 244)'); main.addColorStop(1.0, 'rgb(255, 255, 255)'); foregroundColor = 'rgb(0, 0, 0)'; backgroundColor = 'rgba(0, 0, 0, 0.1)'; break;
            case 'gray'             : main.addColorStop(0.0, 'rgb( 65,  65,  65)'); main.addColorStop(0.005, 'rgb(117, 117, 117)'); main.addColorStop(0.5, 'rgb( 87,  87,  87)'); main.addColorStop(0.5, 'rgb( 65,  65,  65)'); main.addColorStop(1.0, 'rgb( 81,  81,  81)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)'; break;
            case 'black'            : main.addColorStop(0.0, 'rgb( 65,  65,  65)'); main.addColorStop(0.005, 'rgb(102, 102, 102)'); main.addColorStop(0.5, 'rgb( 51,  51,  51)'); main.addColorStop(0.5, 'rgb(  0,   0,   0)'); main.addColorStop(1.0, 'rgb( 51,  51,  51)'); foregroundColor = 'rgb(204, 204, 204)'; backgroundColor = 'rgba(204, 204, 204, 0.1)'; break;
            case 'green'            : main.addColorStop(0.0, 'rgb( 33,  67,  67)'); main.addColorStop(0.005, 'rgb( 33,  67,  67)'); main.addColorStop(0.5, 'rgb( 29,  58,  58)'); main.addColorStop(0.5, 'rgb( 28,  57,  57)'); main.addColorStop(1.0, 'rgb( 23,  46,  46)'); foregroundColor = 'rgb(  0, 185, 165)'; backgroundColor = 'rgba(0,  185, 165, 0.1)'; break;
            case 'green-darkgreen'  : main.addColorStop(0.0, 'rgb( 27,  41,  17)'); main.addColorStop(0.005, 'rgb( 70,  84,  58)'); main.addColorStop(0.5, 'rgb( 36,  60,  14)'); main.addColorStop(0.5, 'rgb( 24,  50,   1)'); main.addColorStop(1.0, 'rgb(  8,  10,   7)'); foregroundColor = 'rgb(152,  255, 74)'; backgroundColor = 'rgba(152, 255, 74, 0.1)'; break;
            case 'blue2'            : main.addColorStop(0.0, 'rgb(  0,  68, 103)'); main.addColorStop(0.005, 'rgb(  8, 109, 165)'); main.addColorStop(0.5, 'rgb(  0,  72, 117)'); main.addColorStop(0.5, 'rgb(  0,  72, 117)'); main.addColorStop(1.0, 'rgb(  0,  68, 103)'); foregroundColor = 'rgb(111, 182, 228)'; backgroundColor = 'rgba(111, 182, 228, 0.1)'; break;
            case 'blue-black'       : main.addColorStop(0.0, 'rgb( 22, 125, 212)'); main.addColorStop(0.005, 'rgb(  3, 162, 254)'); main.addColorStop(0.5, 'rgb(  3, 162, 254)'); main.addColorStop(0.5, 'rgb(  3, 162, 254)'); main.addColorStop(1.0, 'rgb( 11, 172, 244)'); foregroundColor = 'rgb(  0,   0,   0)'; backgroundColor = 'rgba( 0,   0,   0, 0.1)'; break;
            case 'blue-darkblue'    : main.addColorStop(0.0, 'rgb( 18,  33,  88)'); main.addColorStop(0.005, 'rgb( 18,  33,  88)'); main.addColorStop(0.5, 'rgb( 19,  30,  90)'); main.addColorStop(0.5, 'rgb( 17,  31,  94)'); main.addColorStop(1.0, 'rgb( 21,  25,  90)'); foregroundColor = 'rgb( 23,  99, 221)'; backgroundColor = 'rgba(23,  99, 221, 0.1)';  break;
            case 'blue-lightblue'   : main.addColorStop(0.0, 'rgb( 88, 107, 132)'); main.addColorStop(0.005, 'rgb( 53,  74, 104)'); main.addColorStop(0.5, 'rgb( 27,  37,  65)'); main.addColorStop(0.5, 'rgb(  5,  12,  40)'); main.addColorStop(1.0, 'rgb( 32,  47,  79)'); foregroundColor = 'rgb( 71, 178, 254)'; backgroundColor = 'rgba(71, 178, 254, 0.1)';break;
            case 'blue-gray'        : main.addColorStop(0.0, 'rgb(135, 174, 255)'); main.addColorStop(0.005, 'rgb(101, 159, 255)'); main.addColorStop(0.5, 'rgb( 44,  93, 255)'); main.addColorStop(0.5, 'rgb( 27,  65, 254)'); main.addColorStop(1.0, 'rgb( 12,  50, 255)'); foregroundColor = 'rgb(178, 180, 237)'; backgroundColor = 'rgba(178, 180, 237, 0.1)';break;
            case 'standard'         : main.addColorStop(0.0, 'rgb(131, 133, 119)'); main.addColorStop(0.005, 'rgb(176, 183, 167)'); main.addColorStop(0.5, 'rgb(165, 174, 153)'); main.addColorStop(0.5, 'rgb(166, 175, 156)'); main.addColorStop(1.0, 'rgb(175, 184, 165)'); foregroundColor = 'rgb( 35,  42,  52)'; backgroundColor = 'rgba(35,  42,  52, 0.1)';break;
            case 'lightgreen'       : main.addColorStop(0.0, 'rgb(194, 212, 188)'); main.addColorStop(0.005, 'rgb(212, 234, 206)'); main.addColorStop(0.5, 'rgb(205, 224, 194)'); main.addColorStop(0.5, 'rgb(206, 225, 194)'); main.addColorStop(1.0, 'rgb(214, 233, 206)'); foregroundColor = 'rgb(  0,  12,   6)'; backgroundColor = 'rgba(0,   12,   6, 0.1)';break;
            case 'standard-green'   : main.addColorStop(0.0, 'rgb(255, 255, 255)'); main.addColorStop(0.005, 'rgb(219, 230, 220)'); main.addColorStop(0.5, 'rgb(179, 194, 178)'); main.addColorStop(0.5, 'rgb(153, 176, 151)'); main.addColorStop(1.0, 'rgb(114, 138, 109)'); foregroundColor = 'rgb(  0,  12,   6)'; backgroundColor = 'rgba(0,   12,   6, 0.1)';break; 
            case 'blue-blue'        : main.addColorStop(0.0, 'rgb(100, 168, 253)'); main.addColorStop(0.005, 'rgb(100, 168, 253)'); main.addColorStop(0.5, 'rgb( 95, 160, 250)'); main.addColorStop(0.5, 'rgb( 80, 144, 252)'); main.addColorStop(1.0, 'rgb( 74, 134, 255)'); foregroundColor = 'rgb(  0,  44, 187)'; backgroundColor = 'rgba( 0,  44, 187, 0.1)';break;
            case 'red-darkred'      : main.addColorStop(0.0, 'rgb( 72,  36,  50)'); main.addColorStop(0.005, 'rgb(185, 111, 110)'); main.addColorStop(0.5, 'rgb(148,  66,  72)'); main.addColorStop(0.5, 'rgb( 83,  19,  20)'); main.addColorStop(1.0, 'rgb(  7,   6,  14)'); foregroundColor = 'rgb(254, 139, 146)'; backgroundColor = 'rgba(254, 139, 146, 0.1)';break;
            case 'darkblue'         : main.addColorStop(0.0, 'rgb( 14,  24,  31)'); main.addColorStop(0.005, 'rgb( 46, 105, 144)'); main.addColorStop(0.5, 'rgb( 19,  64,  96)'); main.addColorStop(0.5, 'rgb(  6,  20,  29)'); main.addColorStop(1.0, 'rgb(  8,   9,  10)'); foregroundColor = 'rgb( 61, 179, 255)'; backgroundColor = 'rgba(61, 179, 255, 0.1)';break;
            case 'purple'           : main.addColorStop(0.0, 'rgb(175, 164, 255)'); main.addColorStop(0.005, 'rgb(188, 168, 253)'); main.addColorStop(0.5, 'rgb(176, 159, 255)'); main.addColorStop(0.5, 'rgb(174, 147, 252)'); main.addColorStop(1.0, 'rgb(168, 136, 233)'); foregroundColor = 'rgb(  7,  97,  72)'; backgroundColor = 'rgba( 7,  97,  72, 0.1)';break;
            case 'black-red'        : main.addColorStop(0.0, 'rgb(  8,  12,  11)'); main.addColorStop(0.005, 'rgb( 10,  11,  13)'); main.addColorStop(0.5, 'rgb( 11,  10,  15)'); main.addColorStop(0.5, 'rgb(  7,  13,   9)'); main.addColorStop(1.0, 'rgb(  9,  13,  14)'); foregroundColor = 'rgb(181,   0,  38)'; backgroundColor = 'rgba(181,  0,  38, 0.1)';break;
            case 'darkgreen'        : main.addColorStop(0.0, 'rgb( 25,  85,   0)'); main.addColorStop(0.005, 'rgb( 47, 154,   0)'); main.addColorStop(0.5, 'rgb( 30, 101,   0)'); main.addColorStop(0.5, 'rgb( 30, 101,   0)'); main.addColorStop(1.0, 'rgb( 25,  85,   0)'); foregroundColor = 'rgb( 35,  49,  35)'; backgroundColor = 'rgba(35,  49,  35, 0.1)';break;
            case 'amber'            : main.addColorStop(0.0, 'rgb(182,  71,   0)'); main.addColorStop(0.005, 'rgb(236, 155,  25)'); main.addColorStop(0.5, 'rgb(212,  93,   5)'); main.addColorStop(0.5, 'rgb(212,  93,   5)'); main.addColorStop(1.0, 'rgb(182,  71,   0)'); foregroundColor = 'rgb( 89,  58,  10)'; backgroundColor = 'rgba(89,  58,  10, 0.1)';break;
            case 'lightblue'        : main.addColorStop(0.0, 'rgb(125, 146, 184)'); main.addColorStop(0.005, 'rgb(197, 212, 231)'); main.addColorStop(0.5, 'rgb(138, 155, 194)'); main.addColorStop(0.5, 'rgb(138, 155, 194)'); main.addColorStop(1.0, 'rgb(125, 146, 184)'); foregroundColor = 'rgb(  9,   0,  81)'; backgroundColor = 'rgba( 9,   0,  81, 0.1)';break;
            case 'green-black'      : main.addColorStop(0.0, 'rgb(  1,  47,   0)'); main.addColorStop(0.005, 'rgb( 20, 106,  61)'); main.addColorStop(0.5, 'rgb( 33, 125,  84)'); main.addColorStop(0.5, 'rgb( 33, 125,  84)'); main.addColorStop(1.0, 'rgb( 33, 109,  63)'); foregroundColor = 'rgb(  3,  15,  11)'; backgroundColor = 'rgba(3, 15, 11, 0.1)';break;
            case 'yellow-black'     : main.addColorStop(0.0, 'rgb(223, 248,  86)'); main.addColorStop(0.005, 'rgb(222, 255,  28)'); main.addColorStop(0.5, 'rgb(213, 245,  24)'); main.addColorStop(0.5, 'rgb(213, 245,  24)'); main.addColorStop(1.0, 'rgb(224, 248,  88)'); foregroundColor = 'rgb(  9,  19,   0)'; backgroundColor = 'rgba( 9,  19,   0, 0.1)';break;
            case 'black-yellow'     : main.addColorStop(0.0, 'rgb( 43,   3,   3)'); main.addColorStop(0.005, 'rgb( 29,   0,   0)'); main.addColorStop(0.5, 'rgb( 26,   2,   2)'); main.addColorStop(0.5, 'rgb( 31,   5,   8)'); main.addColorStop(1.0, 'rgb( 30,   1,   3)'); foregroundColor = 'rgb(255, 254,  24)'; backgroundColor = 'rgba(255, 254, 24, 0.1)';break;
            case 'lightgreen-black' : main.addColorStop(0.0, 'rgb( 79, 121,  19)'); main.addColorStop(0.005, 'rgb( 96, 169,   0)'); main.addColorStop(0.5, 'rgb(120, 201,   2)'); main.addColorStop(0.5, 'rgb(118, 201,   0)'); main.addColorStop(1.0, 'rgb(105, 179,   4)'); foregroundColor = 'rgb(  0,  35,   0)'; backgroundColor = 'rgba( 0,  35,   0, 0.1)';break;
            case 'darkpurple'       : main.addColorStop(0.0, 'rgb( 35,  24,  75)'); main.addColorStop(0.005, 'rgb( 42,  20, 111)'); main.addColorStop(0.5, 'rgb( 40,  22, 103)'); main.addColorStop(0.5, 'rgb( 40,  22, 103)'); main.addColorStop(1.0, 'rgb( 41,  21, 111)'); foregroundColor = 'rgb(158, 167, 210)'; backgroundColor = 'rgba(158, 167, 210, 0.1)';break;
            case 'darkamber'        : main.addColorStop(0.0, 'rgb(134,  39,  17)'); main.addColorStop(0.005, 'rgb(120,  24,   0)'); main.addColorStop(0.5, 'rgb( 83,  15,  12)'); main.addColorStop(0.5, 'rgb( 83,  15,  12)'); main.addColorStop(1.0, 'rgb(120,  24,   0)'); foregroundColor = 'rgb(233, 140,  44)'; backgroundColor = 'rgba(233, 140, 44, 0.1)';break;
            case 'blue-lightblue2'  : main.addColorStop(0.0, 'rgb( 15,  84, 151)'); main.addColorStop(0.005, 'rgb( 60, 103, 198)'); main.addColorStop(0.5, 'rgb( 67, 109, 209)'); main.addColorStop(0.5, 'rgb( 67, 109, 209)'); main.addColorStop(1.0, 'rgb( 64, 101, 190)'); foregroundColor = 'rgb(193, 253, 254)'; backgroundColor = 'rgba(193, 253, 254, 0.1)';break;
            case 'gray-purple'      : main.addColorStop(0.0, 'rgb(153, 164, 161)'); main.addColorStop(0.005, 'rgb(203, 215, 213)'); main.addColorStop(0.5, 'rgb(202, 212, 211)'); main.addColorStop(0.5, 'rgb(202, 212, 211)'); main.addColorStop(1.0, 'rgb(198, 209, 213)'); foregroundColor = 'rgb( 99, 124, 204)'; backgroundColor = 'rgba(99, 124, 204, 0.1)';break;
            case 'sections'         : main.addColorStop(0.0, 'rgb(178, 178, 178)'); main.addColorStop(0.005, 'rgb(255, 255, 255)'); main.addColorStop(0.5, 'rgb(196, 196, 196)'); main.addColorStop(0.5, 'rgb(196, 196, 196)'); main.addColorStop(1.0, 'rgb(178, 178, 178)'); foregroundColor = 'rgb(0, 0, 0)'; backgroundColor = 'rgba(0, 0, 0, 0.1)';break;
            case 'yoctopuce'        : main.addColorStop(0.0, 'rgb(14, 24, 31)'); main.addColorStop(0.005, 'rgb(35, 35, 65)'); main.addColorStop(0.5, 'rgb(30, 30, 60)'); main.addColorStop(0.5, 'rgb(30, 30, 60)'); main.addColorStop(1.0, 'rgb(25, 25, 55)'); foregroundColor = 'rgb(153, 229, 255)'; backgroundColor = 'rgba(153,229,255, 0.1)';break;
            case 'flat-turqoise'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 31, 188, 156)'); main.addColorStop(0.005, 'rgb( 31, 188, 156)'); main.addColorStop(0.5, 'rgb( 31, 188, 156)'); main.addColorStop(0.5, 'rgb( 31, 188, 156)'); main.addColorStop(1.0, 'rgb( 31, 188, 156)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-green-sea'   : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 26, 188, 156)'); main.addColorStop(0.005, 'rgb( 26, 188, 156)'); main.addColorStop(0.5, 'rgb( 26, 188, 156)'); main.addColorStop(0.5, 'rgb( 26, 188, 156)'); main.addColorStop(1.0, 'rgb( 26, 188, 156)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-emerland'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 46, 204, 113)'); main.addColorStop(0.005, 'rgb( 46, 204, 113)'); main.addColorStop(0.5, 'rgb( 46, 204, 113)'); main.addColorStop(0.5, 'rgb( 46, 204, 113)'); main.addColorStop(1.0, 'rgb( 46, 204, 113)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-nephritis'   : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 39, 174,  96)'); main.addColorStop(0.005, 'rgb( 39, 174,  96)'); main.addColorStop(0.5, 'rgb( 39, 174,  96)'); main.addColorStop(0.5, 'rgb( 39, 174,  96)'); main.addColorStop(1.0, 'rgb( 39, 174,  96)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-peter-river' : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 52, 152, 219)'); main.addColorStop(0.005, 'rgb( 52, 152, 219)'); main.addColorStop(0.5, 'rgb( 52, 152, 219)'); main.addColorStop(0.5, 'rgb( 52, 152, 219)'); main.addColorStop(1.0, 'rgb( 52, 152, 219)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-belize-hole' : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 41, 128, 185)'); main.addColorStop(0.005, 'rgb( 41, 128, 185)'); main.addColorStop(0.5, 'rgb( 41, 128, 185)'); main.addColorStop(0.5, 'rgb( 41, 128, 185)'); main.addColorStop(1.0, 'rgb( 41, 128, 185)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-amythyst'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(155,  89, 182)'); main.addColorStop(0.005, 'rgb(155,  89, 182)'); main.addColorStop(0.5, 'rgb(155,  89, 182)'); main.addColorStop(0.5, 'rgb(155,  89, 182)'); main.addColorStop(1.0, 'rgb(155,  89, 182)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-wisteria'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(142,  68, 173)'); main.addColorStop(0.005, 'rgb(142,  68, 173)'); main.addColorStop(0.5, 'rgb(142,  68, 173)'); main.addColorStop(0.5, 'rgb(142,  68, 173)'); main.addColorStop(1.0, 'rgb(142,  68, 173)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-sunflower'   : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(241, 196,  15)'); main.addColorStop(0.005, 'rgb(241, 196,  15)'); main.addColorStop(0.5, 'rgb(241, 196,  15)'); main.addColorStop(0.5, 'rgb(241, 196,  15)'); main.addColorStop(1.0, 'rgb(241, 196,  15)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-orange'      : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(243, 156,  18)'); main.addColorStop(0.005, 'rgb(243, 156,  18)'); main.addColorStop(0.5, 'rgb(243, 156,  18)'); main.addColorStop(0.5, 'rgb(243, 156,  18)'); main.addColorStop(1.0, 'rgb(243, 156,  18)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-carrot'      : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(230, 126,  34)'); main.addColorStop(0.005, 'rgb(230, 126,  34)'); main.addColorStop(0.5, 'rgb(230, 126,  34)'); main.addColorStop(0.5, 'rgb(230, 126,  34)'); main.addColorStop(1.0, 'rgb(230, 126,  34)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-pumpkin'     : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(211,  84,   0)'); main.addColorStop(0.005, 'rgb(211,  84,   0)'); main.addColorStop(0.5, 'rgb(211,  84,   0)'); main.addColorStop(0.5, 'rgb(211,  84,   0)'); main.addColorStop(1.0, 'rgb(211,  84,   0)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-alizarin'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(231,  76,  60)'); main.addColorStop(0.005, 'rgb(231,  76,  60)'); main.addColorStop(0.5, 'rgb(231,  76,  60)'); main.addColorStop(0.5, 'rgb(231,  76,  60)'); main.addColorStop(1.0, 'rgb(231,  76,  60)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-pomegranate' : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(192,  57,  43)'); main.addColorStop(0.005, 'rgb(192,  57,  43)'); main.addColorStop(0.5, 'rgb(192,  57,  43)'); main.addColorStop(0.5, 'rgb(192,  57,  43)'); main.addColorStop(1.0, 'rgb(192,  57,  43)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-clouds'      : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(236, 240, 241)'); main.addColorStop(0.005, 'rgb(236, 240, 241)'); main.addColorStop(0.5, 'rgb(236, 240, 241)'); main.addColorStop(0.5, 'rgb(236, 240, 241)'); main.addColorStop(1.0, 'rgb(236, 240, 241)'); foregroundColor = 'rgb(  0,   0,   0)'; backgroundColor = 'rgba(  0,   0,   0, 0.1)';break;
            case 'flat-silver'      : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(189, 195, 199)'); main.addColorStop(0.005, 'rgb(189, 195, 199)'); main.addColorStop(0.5, 'rgb(189, 195, 199)'); main.addColorStop(0.5, 'rgb(189, 195, 199)'); main.addColorStop(1.0, 'rgb(189, 195, 199)'); foregroundColor = 'rgb(  0,   0,   0)'; backgroundColor = 'rgba(  0,   0,   0, 0.1)';break;
            case 'flat-concrete'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(149, 165, 166)'); main.addColorStop(0.005, 'rgb(149, 165, 166)'); main.addColorStop(0.5, 'rgb(149, 165, 166)'); main.addColorStop(0.5, 'rgb(149, 165, 166)'); main.addColorStop(1.0, 'rgb(149, 165, 166)'); foregroundColor = 'rgb(  0,   0,   0)'; backgroundColor = 'rgba(  0,   0,   0, 0.1)';break;
            case 'flat-asbestos'    : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb(127, 140, 141)'); main.addColorStop(0.005, 'rgb(127, 140, 141)'); main.addColorStop(0.5, 'rgb(127, 140, 141)'); main.addColorStop(0.5, 'rgb(127, 140, 141)'); main.addColorStop(1.0, 'rgb(127, 140, 141)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-wet-asphalt' : frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 52,  73,  94)'); main.addColorStop(0.005, 'rgb( 52,  73,  94)'); main.addColorStop(0.5, 'rgb( 52,  73,  94)'); main.addColorStop(0.5, 'rgb( 52,  73,  94)'); main.addColorStop(1.0, 'rgb( 52,  73,  94)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            case 'flat-midnight-blue': frame = 'rgb(255, 255, 255)'; main.addColorStop(0.0, 'rgb( 44,  62,  80)'); main.addColorStop(0.005, 'rgb( 44,  62,  80)'); main.addColorStop(0.5, 'rgb( 44,  62,  80)'); main.addColorStop(0.5, 'rgb( 44,  62,  80)'); main.addColorStop(1.0, 'rgb( 44,  62,  80)'); foregroundColor = 'rgb(255, 255, 255)'; backgroundColor = 'rgba(255, 255, 255, 0.1)';break;
            default                 : main.addColorStop(0.0, 'rgb(131, 133, 119)'); main.addColorStop(0.005, 'rgb(176, 183, 167)'); main.addColorStop(0.5, 'rgb(165, 174, 153)'); main.addColorStop(0.5, 'rgb(166, 175, 156)'); main.addColorStop(1.0, 'rgb(175, 184, 165)'); foregroundColor = 'rgb( 35,  42,  52)'; backgroundColor = 'rgba(35,  42,  52, 0.1)';
        }
        
        //frame
        roundedRectangle(ctx, 0, 0, width, height, radius);
        ctx.fillStyle   = frame;
        ctx.strokeStyle = 'transparent';
        ctx.fill();
        
        //main
        roundedRectangle(ctx, 1, 1, width - 2, height - 2, 0.0833333333 * height);
        ctx.fillStyle   = main;
        ctx.strokeStyle = 'transparent';
        ctx.fill();
    }

    var drawText = function() {
        var ctx    = textBuffer.getContext("2d");
        var width  = textBuffer.width;
        var height = textBuffer.height;

        ctx.clearRect(0, 0, width, height);
        
        lcdFontHeight = Math.floor(0.5833333333 * height);
        lcdFont = lcdFontHeight + 'px ' + LCD_FONT_NAME;

        lcdUnitFont  = Math.floor(0.26 * height) + 'px ' + STD_FONT_NAME;
        lcdTitleFont = Math.floor(0.1666666667 * height) + 'px ' + STD_FONT_NAME;
        lcdSmallFont = Math.floor(0.1666666667 * height) + 'px ' + STD_FONT_NAME;

        ctx.font = lcdUnitFont;
        var unitWidth = ctx.measureText(unit).width;
        ctx.font = lcdFont;
        var textWidth = ctx.measureText(Number(value).toFixed(2)).width;

        // calculate background text
        var oneSegmentWidth = ctx.measureText('8').width;

        // Width of decimals
        var widthOfDecimals = decimals == 0 ? 0 : decimals * oneSegmentWidth + oneSegmentWidth;

        // Available width
        var availableWidth = width - 2 - (unitWidth + height * 0.0833333333) - widthOfDecimals;

        // Number of segments
        var noOfSegments = Math.floor(availableWidth / oneSegmentWidth);

        // Add segments to background text
        var backgroundText = '';
        for (var i = 0 ; i < noOfSegments ; i++) {
            backgroundText += '8';
        }
        if (decimals != 0) {
            backgroundText += ".";
            for (var i = 0 ; i < decimals ; i++) {
                backgroundText += '8';
            }
        }
        var backgroundWidth = ctx.measureText(backgroundText).width;

        //dropshadow
        if (foregroundShadowEnabled) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur    = 2;
            ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
        }

        //valueBackground
        ctx.save();
        ctx.fillStyle = backgroundColor;
        ctx.font = lcdFont;
        ctx.textBaseline = 'bottom';
        if (unitVisible) {
            ctx.fillText(backgroundText, width - 2 - backgroundWidth - (unitWidth + height * 0.0833333333), 0.77 * height);
        } else {
            ctx.fillText(backgroundText, width - 2 - backgroundWidth - height * 0.0833333333, 0.77 * height);
        }

        ctx.fillStyle = foregroundColor;

        //valueText
        ctx.font = lcdFont;
        ctx.textBaseline = 'bottom';
        if (unitVisible) {
            ctx.fillText(Number(value).toFixed(decimals), width - 2 - textWidth - (unitWidth + height * 0.0833333333), 0.77 * height);
        } else {
            ctx.fillText(Number(value).toFixed(decimals), width - 2 - textWidth - height * 0.0833333333, 0.77 * height);
        }

        //unitText
        if (unitVisible) {
            ctx.fill();
            ctx.font = lcdUnitFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(unit, width - unitWidth - 0.04 * height, 0.745 * height);            
        }

        //lowerCenterText
        if (lowerCenterTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(Number(lowerCenterText).toFixed(decimals), (width - ctx.measureText(Number(lowerCenterText).toFixed(2)).width) * 0.5, 0.98 * height);
        }

        //upperLeftText
        if (upperLeftTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(Number(upperLeftText).toFixed(decimals), 0.0416666667 * height, 0.23 * height);
        }

        //upperRightText
        if (upperRightTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(Number(upperRightText).toFixed(decimals), width - 0.0416666667 * height - ctx.measureText(Number(upperRightText).toFixed(2)).width, 0.23 * height);
        }

        //upperCenterText
        if (upperCenterTextVisible) {
            ctx.font = 'bold ' + lcdTitleFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(upperCenterText, (width - ctx.measureText(upperCenterText).width) * 0.5, 0.23 * height);
        }

        //lowerRightText
        if (lowerRightTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(lowerRightText, width - 0.0416666667 * height - ctx.measureText(lowerRightText).width, 0.98 * height);
        }
    }

    var drawIcons = function() {
        var ctx    = iconsBuffer.getContext("2d");
        var width  = iconsBuffer.width;
        var height = iconsBuffer.height;

        ctx.clearRect(0, 0, width, height);

        //dropshadow
        if (foregroundShadowEnabled) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur    = 2;
            ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
        }
        
        ctx.fillStyle = foregroundColor;

        if (thresholdVisible && showThreshold) {
            //threshold
            ctx.beginPath();
            ctx.moveTo(0.07575757575757576 * width, 0.8958333333333334 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.8958333333333334 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.9166666666666666 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.9166666666666666 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.8958333333333334 * height);
            ctx.closePath();
            ctx.moveTo(0.07575757575757576 * width, 0.8125 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.8125 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.875 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.875 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.8125 * height);
            ctx.closePath();
            ctx.moveTo(0.11363636363636363 * width, 0.9375 * height);
            ctx.lineTo(0.08 * width, 0.75 * height);
            ctx.lineTo(0.045454545454545456 * width, 0.9375 * height);
            //ctx.lineTo(0.11363636363636363 * width, 0.9375 * height);
            ctx.closePath();
            ctx.fill();
        }

        if (trendVisible) {
            ctx.beginPath();
            switch(trend) {
                case  'down'    : ctx.moveTo(0.18181818181818182 * width, 0.8125 * height);             ctx.lineTo(0.21212121212121213 * width, 0.9375 * height); ctx.lineTo(0.24242424242424243 * width, 0.8125 * height); ctx.lineTo(0.18181818181818182 * width, 0.8125 * height); break; 
                case 'falling'  : ctx.moveTo(0.18181818181818182 * width, 0.8958333333333334 * height); ctx.lineTo(0.24242424242424243 * width, 0.9375 * height); ctx.lineTo(0.20454545454545456 * width, 0.8125 * height); ctx.lineTo(0.18181818181818182 * width, 0.8958333333333334 * height); break;
                case 'steady'   : ctx.moveTo(0.18181818181818182 * width, 0.8125 * height);             ctx.lineTo(0.24242424242424243 * width, 0.875 * height);  ctx.lineTo(0.18181818181818182 * width, 0.9375 * height); ctx.lineTo(0.18181818181818182 * width, 0.8125 * height); break;
                case 'rising'   : ctx.moveTo(0.18181818181818182 * width, 0.8541666666666666 * height); ctx.lineTo(0.24242424242424243 * width, 0.8125 * height); ctx.lineTo(0.20454545454545456 * width, 0.9375 * height); ctx.lineTo(0.18181818181818182 * width, 0.8541666666666666 * height); break;
                case  'up'      : ctx.moveTo(0.18181818181818182 * width, 0.9375 * height);             ctx.lineTo(0.21212121212121213 * width, 0.8125 * height); ctx.lineTo(0.24242424242424243 * width, 0.9375 * height); ctx.lineTo(0.18181818181818182 * width, 0.9375 * height);
            }
            ctx.closePath();
            ctx.fill();
        }

        if (batteryVisible) {
            if (battery === 0) {
            //empty
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (battery === 1) {
                // 30%
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (battery === 2) {
                // 60%
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (battery === 3) {
                //battery_1
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.7575757575757576 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7878787878787878 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7878787878787878 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7575757575757576 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7575757575757576 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            }
        }
         if (alarmVisible) {
        ctx.beginPath();
        ctx.moveTo(0.3333333333333333 * width, 0.9166666666666666 * height);
        ctx.bezierCurveTo(0.3333333333333333 * width, 0.9375 * height, 0.32575757575757575 * width, 0.9375 * height, 0.32575757575757575 * width, 0.9375 * height);
        ctx.bezierCurveTo(0.3181818181818182 * width, 0.9375 * height, 0.3106060606060606 * width, 0.9375 * height, 0.3106060606060606 * width, 0.9166666666666666 * height);
        ctx.bezierCurveTo(0.3106060606060606 * width, 0.9166666666666666 * height, 0.3333333333333333 * width, 0.9166666666666666 * height, 0.3333333333333333 * width, 0.9166666666666666 * height);
        ctx.closePath();
        ctx.moveTo(0.3560606060606061 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.3333333333333333 * width, 0.8541666666666666 * height, 0.3484848484848485 * width, 0.75 * height, 0.32575757575757575 * width, 0.75 * height);
        ctx.bezierCurveTo(0.32575757575757575 * width, 0.75 * height, 0.32575757575757575 * width, 0.75 * height, 0.32575757575757575 * width, 0.75 * height);
        ctx.bezierCurveTo(0.32575757575757575 * width, 0.75 * height, 0.32575757575757575 * width, 0.75 * height, 0.32575757575757575 * width, 0.75 * height);
        ctx.bezierCurveTo(0.29545454545454547 * width, 0.75 * height, 0.3106060606060606 * width, 0.8541666666666666 * height, 0.2878787878787879 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.2878787878787879 * width, 0.8958333333333334 * height, 0.2878787878787879 * width, 0.8958333333333334 * height, 0.2878787878787879 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.2878787878787879 * width, 0.8958333333333334 * height, 0.2878787878787879 * width, 0.8958333333333334 * height, 0.2878787878787879 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.2878787878787879 * width, 0.8958333333333334 * height, 0.2878787878787879 * width, 0.8958333333333334 * height, 0.2878787878787879 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.2878787878787879 * width, 0.8958333333333334 * height, 0.32575757575757575 * width, 0.8958333333333334 * height, 0.32575757575757575 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.32575757575757575 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height);
        ctx.bezierCurveTo(0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height, 0.3560606060606061 * width, 0.8958333333333334 * height);
        ctx.closePath();
        ctx.fill();
      }
       if (signalVisible) {
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.moveTo(0.015151515151515152 * width, 0.22916666666666666 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.3541666666666667 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.3541666666666667 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.22916666666666666 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.22916666666666666 * height);
        ctx.closePath();
        ctx.moveTo(0.015151515151515152 * width, 0.375 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.5 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.5 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.375 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.375 * height);
        ctx.closePath();
        ctx.moveTo(0.015151515151515152 * width, 0.5208333333333334 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.6458333333333334 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.6458333333333334 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.5208333333333334 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.5208333333333334 * height);
        ctx.closePath();
        ctx.moveTo(0.015151515151515152 * width, 0.6666666666666666 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.7916666666666666 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.7916666666666666 * height);
        ctx.lineTo(0.030303030303030304 * width, 0.6666666666666666 * height);
        ctx.lineTo(0.015151515151515152 * width, 0.6666666666666666 * height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = foregroundColor;
        if (signalStrength > 0.13) {
          ctx.beginPath();
          ctx.moveTo(0.015151515151515152 * width, 0.6666666666666666 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.6666666666666666 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.7916666666666666 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.7916666666666666 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.6666666666666666 * height);
          ctx.closePath();
          ctx.fill();
        }
        if (signalStrength > 0.38) {
          ctx.beginPath();
          ctx.moveTo(0.015151515151515152 * width, 0.5208333333333334 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.5208333333333334 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.6458333333333334 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.6458333333333334 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.5208333333333334 * height);
          ctx.closePath();
          ctx.fill();
        }
        if (signalStrength > 0.63) {
          ctx.beginPath();
          ctx.moveTo(0.015151515151515152 * width, 0.375 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.375 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.5 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.5 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.375 * height);
          ctx.closePath();
          ctx.fill();
        }
        if (signalStrength > 0.88) {
          ctx.beginPath();
          ctx.moveTo(0.015151515151515152 * width, 0.22916666666666666 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.22916666666666666 * height);
          ctx.lineTo(0.030303030303030304 * width, 0.3541666666666667 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.3541666666666667 * height);
          ctx.lineTo(0.015151515151515152 * width, 0.22916666666666666 * height);
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    var drawCrystalOverlay = function() {
      var ctx    = crystalBuffer.getContext("2d");
      var width  = crystalBuffer.width;
      var height = crystalBuffer.height;

      //crystal effect
      roundedRectangle(ctx, 2, 2, width - 4, height - 4, 0.0833333333 * height);
      ctx.clip();

      var darkNoise   = 'rgba(100, 100, 100, ';
      var brightNoise = 'rgba(200, 200, 200, ';
      var color;
      var noiseAlpha;
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          color         = Math.floor(Math.random()) === 0 ? darkNoise : brightNoise;
          noiseAlpha    = clamp(0, 1, 0.04 + Math.random() * 0.08);
          ctx.fillStyle = color + noiseAlpha + ')';
          ctx.fillRect(x, y, 2, 2);
        }
      }
    };
         
    function clamp(min, max, value) {
        if (value < min) { return min; }
        if (value > max) { return max; }
        return value;
    }

    function roundedRectangle(ctx, x, y, w, h, radius) {
        var r = x + w,
            b = y + h;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, y + h - radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
    }

    function onResize() {
      if (scalable) {
        width  = window.innerWidth * 0.98;
        height = width * aspectRatio; //window.innerHeight * 0.98;
      }

      canvas.width = width;
      canvas.height = height;

      lcdBuffer.width = width;
      lcdBuffer.height = height;
      textBuffer.width = width;
      textBuffer.height = height;
      iconsBuffer.width = width;
      iconsBuffer.height = height;
      crystalBuffer.width = width;
      crystalBuffer.height = height;

      drawLcd();
      drawText();
      drawIcons();
      if (crystalEffectVisible)
        drawCrystalOverlay();

      repaint();
    }

    function repaint() {
      mainCtx.clearRect(0, 0, canvas.width, canvas.height);
      mainCtx.drawImage(lcdBuffer, 0, 0);
      if (crystalEffectVisible) mainCtx.drawImage(crystalBuffer, 0, 0);
      mainCtx.drawImage(textBuffer, 0, 0);
      mainCtx.drawImage(iconsBuffer, 0, 0);
    }


    // ******************** public methods ************************************
    this.getUpperCenterText = function() { return upperCenterText; };
    this.setUpperCenterText = function(nUpperCenterText) {
      upperCenterText = nUpperCenterText;
      drawText();
      repaint();
    };

    this.isUpperCenterTextVisible = function() { return upperCenterTextVisible; };
    this.setUpperCenterTextVisible = function(nUpperCenterTextVisible) {
      upperCenterTextVisible = nUpperCenterTextVisible;
      drawText();
      repaint();
    };

    this.getUnit = function() { return unit; };
    this.setUnit = function(text) {
      unit = text;
      drawText();
      repaint();
    };

    this.isUnitVisible = function() { return unitVisible; };
    this.setUnitVisible = function(nUnitVisible) {
      unitVisible = nUnitVisible;
      drawText();
      repaint();
    };

    this.getLowerRightText = function() { return lowerRightText; };
    this.setLowerRightText = function(text) {
      lowerRightText = text;
      drawText();
      repaint();
    };

    this.isLowerRightTextVisible = function() { return lowerRightTextVisible; };
    this.setLowerRightTextVisible = function(nLowerRightTextVisible) {
      lowerRightTextVisible = nLowerRightTextVisible;
      drawText();
      repaint();
    };

    this.getMinValue = function() { return minValue; };
    this.setMinValue = function(nMinValue) {
      minValue = clamp(Number.MIN_VALUE, maxValue, nMinValue);
      drawText();
      repaint();
    };

    this.getMaxValue = function() { return maxValue; };
    this.setMaxValue = function(nMaxValue) {
      maxValue = clamp(minValue, Number.MAX_VALUE, nMaxValue);
      drawText();
      repaint();
    };

    this.getValue = function() {
      return value;
    };
    this.setValue = function(nValue) {
      var newValue = parseFloat(nValue);
      if (animated) {
        formerValue = value;
        if (formerValueVisible) { lowerCenterText = Number(value).toFixed(decimals); }
        var tween = new Tween(new Object(), '', Tween.regularEaseInOut, value, newValue, duration);
        tween.onMotionChanged = function(event) {
          value = event.target._pos;
          /*
          if (value < minMeasuredValue) {
            minMeasuredValue = value;
          }
          if (value > maxMeasuredValue) {
            maxMeasuredValue = value;
          }
          */
          showThreshold = value > threshold ? true : false;

          var delta = value - formerValue;
          if (delta >= 1.0) {
            trend = 'up';
          } else if (delta < 1.0 && delta > 0.1) {
            trend = 'rising';
          } else if (delta <= -1) {
            trend = 'down';
          } else if (delta > -1 && delta < -0.1) {
            trend = 'falling';
          } else {
            trend = 'steady';
          }
          drawText();
          drawIcons();

          repaint();
        };
        tween.onMotionFinished = function(event) {
          value = event.target._pos;
          if (value < minMeasuredValue) {
            minMeasuredValue = value;
          }
          if (value > maxMeasuredValue) {
            maxMeasuredValue = value;
          }
          drawText();
          repaint();
        };
        tween.start();
      } else {
        formerValue = value;
        if (formerValueVisible) { lowerCenterText = Number(value).toFixed(decimals); }
        value = newValue;
        if (value < minMeasuredValue) {
          minMeasuredValue = value;
        }
        if (value > maxMeasuredValue) {
          maxMeasuredValue = value;
        }
        thresholdVisible = value > threshold ? true : false;

        var delta = value - formerValue;
        if (delta >= 1.0) {
          trend = 'up';
        } else if (delta < 1.0 && delta > 0.1) {
          trend = 'rising';
        } else if (delta <= -1) {
          trend = 'down';
        } else if (delta > -1 && delta < -0.1) {
          trend = 'falling';
        } else {
          trend = 'steady';
        }
        drawText();
        drawIcons();

        repaint();
      }
    };

    this.getDecimals = function() { return decimals; };
    this.setDecimals = function(nDecimals) {
      decimals = clamp(0, 6, nDecimals);
      drawText();
      repaint();
    };

    this.getThreshold = function() { return threshold; };
    this.setThreshold = function(nThreshold) {
      threshold = clamp(minValue, maxValue, nThreshold);
      drawIcons();
      repaint();
    };

    this.istThresholdVisible = function() { return thresholdVisible; };
    this.setThresholdVisible = function(nThresholdVisible) {
      thresholdVisible = nThresholdVisible;
      drawIcons();
      repaint();
    };

    this.getUpperLeftText = function() { return upperLeftText; };
    this.setUpperLeftText = function(nUpperLeftText) {
      upperLeftText = nUpperLeftText;
      drawText();
      repaint();
    };
    
    this.isUpperLeftTextVisible = function() { return upperLeftTextVisible; };
    this.setUpperLeftTextVisible = function(nUpperLeftTextVisible) {
      upperLeftTextVisible = nUpperLeftTextVisible;
      drawText();
      repaint();
    };

    this.getUpperRightText = function() { return upperRightText; };
    this.setUpperRightText = function(nUpperRightText) {
      upperRightText = nUpperRightText;
      drawText();
      repaint();
    };

    this.isUpperRightTextVisible = function() { return upperRightTextVisible; };
    this.setUpperRightTextVisible = function(nUpperRightTextVisible) {
      upperRightTextVisible = nUpperRightTextVisible;
      drawText();
      repaint();
    };

    this.getLowerCenterText = function() { return lowerCenterText; };
    this.setLowerCenterText = function(nLowerCenterText) {
      lowerCenterText = nLowerCenterText;
      drawText();
      repaint();
    };

    this.isLowerCenterTextVisible = function() { return lowerCenterTextVisible; };
    this.setLowerCenterTextVisible = function(nLowerCenterTextVisible) {
      lowerCenterTextVisible = nLowerCenterTextVisible;
      drawText();
      repaint();
    };

    this.isFormerValueVisible = function() { return formerValueVisible; };
    this.setFormerValueVisible = function(nFormerValueVisible) {
      formerValueVisible = nFormerValueVisible;
      drawText();
      repaint();
    };

    this.getBattery = function() { return battery; };
    this.setBattery = function(nBattery) {
      battery = nBattery;
      drawIcons();
      repaint();
    };

    this.isBatteryVisible = function() { return batteryVisible; };
    this.setBatteryVisible = function(nBatteryVisible) {
      batteryVisible = nBatteryVisible;
      drawIcons();
      repaint();
    };

    this.getTrend = function() { return trend; };
    this.setTrend = function(nTrend) {
      trend = nTrend;
      drawIcons();
      repaint();
    };

    this.isTrendVisible = function() { return trendVisible; };
    this.setTrendVisible = function(nTrendVisible) {
      trendVisible = nTrendVisible;
      drawIcons();
      repaint();
    };

    this.isAlarmVisible = function() { return alarmVisible; };
    this.setAlarmVisible = function(nAlarmVisible) {
      alarmVisible = nAlarmVisible;
      drawIcons();
      repaint();
    };

    this.isSignalVisible = function() { return signalVisible; };
    this.setSignalVisible = function(nSignalVisible) {
      signalVisible = nSignalVisible;
      drawIcons();
      repaint();
    };

    this.getSignalStrength = function() { return signalStrength; };
    this.setSignalStrength = function(nSignalStrength) {
      signalStrength = clamp(0, 1, nSignalStrength);
      drawIcons();
      repaint();
    };

    this.isCrystalEffectVisible = function() { return crystalEffectVisible; };
    this.setCrystalEffectVisible = function(nCrystalEffectVisible) {
      crystalEffectVisible = nCrystalEffectVisible;
      drawLcd();
      repaint();
    };

    this.getWidth = function() { return width; };
    this.setWidth = function(nWidth) {
      width       = nWidth;
      aspectRatio = height / width;
      onResize();
    };

    this.getHeight = function() { return height; };
    this.setHeight = function(nHeight) {
      height      = nHeight;
      aspectRatio = height / width;
      onResize();
    };

    this.isScalable = function() { return scalable; };
    this.setScalable = function(nScalable) {
      scalable = nScalable;
      window.addEventListener("resize", onResize, false);
    };

    this.getDesign = function() { return design; };
    this.setDesign = function(nDesign) {
      design = nDesign;
      onResize();
    };

    this.isAnimated = function() { return animated; };
    this.setAnimated = function(nAnimated) { animated = nAnimated; };

    this.getDuration = function() { return duration; };
    this.setDuration = function(nDuration) {
      duration = clamp(0, 10, nDuration);
    };

    this.isForegroundShadowEnabled = function() { return foregroundShadowEnabled; };
    this.setForegroundShadowEnabled = function(nForegroundShadowEnabled) {
      foregroundShadowEnabled = nForegroundShadowEnabled;
      drawLcd();
      repaint();
    };

    this.getMinMeasuredValue = function() {
      return minMeasuredValue;
    };
    this.getMaxMeasuredValue = function() {
      return maxMeasuredValue;
    };
    this.resetMinMaxMeasuredValue = function() {
      minMeasuredValue = value;
      maxMeasuredValue = value;
      drawText();
      repaint();
    };

    this.setSize = function(newWidth, newHeight) {
      width = newWidth;
      height = newHeight;
      onResize();
    };

    this.update = function(newValue, newAbsMin, newAbsMax) {
      upperLeftText   = Number(newAbsMin).toFixed(decimals);
      upperRightText  = Number(newAbsMax).toFixed(decimals);
      if (formerValueVisible) { lowerCenterText = Number(value).toFixed(decimals); }
      formerValue     = value;
      value           = Number(newValue).toFixed(decimals);

      thresholdVisible = value > threshold ? true : false;

      var delta = value - formerValue;
      if (delta >= 1.0) {
        trend = 'up';
      } else if (delta < 1.0 && delta > 0.1) {
        trend = 'rising';
      } else if (delta <= -1) {
        trend = 'down';
      } else if (delta > -1 && delta < -0.1) {
        trend = 'falling';
      } else {
        trend = 'steady';
      }
      drawText();
      drawIcons();

      repaint();
    };

    // initial paint
    onResize();

    function getCanvasContext(elementOrId) {
        var element = (typeof elementOrId === 'string' || elementOrId instanceof String) ?
            doc.getElementById(elementOrId) : elementOrId;
        return element.getContext('2d');
    }
    function createBuffer(width, height) {
        var buffer = doc.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        return buffer;
    }
}
