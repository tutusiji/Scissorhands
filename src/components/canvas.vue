<template>
  <div class="w-full relative p-[10px]">
    <canvas id="c" class="border ml-30" width="800" height="600"></canvas>
  </div>
</template>

<script lang="ts" setup>
/** @type {HTMLCanvasElement} */

import { fabric } from "fabric";
import { Canvas, Rect } from "fabric";
import hand from "./../assets/static/hand.svg";

// 初始化
onMounted(() => {
  const canvas = new fabric.Canvas("c");
  // 加载图片
  fabric.Image.fromURL(hand, function (oImg) {
    // 缩放图片至合适大小
    oImg.scale(0.5).set({
      left: 550,
      top: 150,
      angle: 0, // 初始角度
      cornerSize: 10, // 控制角大小
      transparentCorners: false, // 透明角
      cornerColor: "blue", // 角颜色
      borderColor: "red", // 边框颜色
      hasRotatingPoint: true, // 允许旋转
    });

    // 将图片添加到 canvas 上
    canvas.add(oImg).setActiveObject(oImg);
  });

  // 创建矩形
  const rect = new fabric.Rect({
    left: 100, // X 坐标
    top: 100, // Y 坐标
    fill: "red", // 填充颜色
    width: 100, // 宽度
    height: 100, // 高度
    // 设置控制点的样式，使其可缩放和旋转
    hasRotatingPoint: true,
  });

  // 创建圆形
  const circle = new fabric.Circle({
    radius: 50, // 半径
    fill: "blue", // 填充颜色
    left: 300, // X 坐标
    top: 150, // Y 坐标
    // 设置控制点的样式，使其可缩放和旋转
    hasRotatingPoint: true,
  });

  // 将形状添加到画布上
  canvas.add(rect);
  canvas.add(circle);

  // 渲染画布
  canvas.renderAll();
});
</script>
