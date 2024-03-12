<template>
  <div class="w-full relative p-[10px]">
    <!-- <el-row>
      <el-col :span="12"> 11 </el-col>
      <el-col :span="12"> >22 </el-col>
    </el-row> -->
    <el-form label-width="80px">
      <el-form-item label="工具">
        <el-radio-group v-model="shapeType">
          <el-radio-button label="画笔" value="画笔" />
          <el-radio-button label="拖动" value="拖动" />
          <el-radio-button label="矩形" value="矩形" />
          <el-radio-button label="圆形" value="圆形" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="调色板">
        <input type="color" v-model="brushColor" class="h-8" />
      </el-form-item>
      <el-form-item label="贴图">
        <input type="file" @change="uploadImage" accept="image/*" />
      </el-form-item>
    </el-form>
    <el-button @click="toggleDrawingMode(true)"> 画笔 </el-button>
    <el-button @click="toggleDrawingMode(false)"> 拖动 </el-button>

    <canvas id="c" class="border ml-30" width="800" height="600"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { fabric } from "fabric";
import { Canvas } from "fabric";
// import hand from "./../assets/static/hand.svg";

const isDrawingMode = ref(false);
// let canvas: fabric.Canvas | null = null;
const canvas = ref<fabric.Canvas | null>(null);
const brushColor = ref<string>("#ff0000");
const shapeType = ref<string>("画笔");

const drawCvs = () => {
  // canvas = new fabric.Canvas("c");
  canvas.value = new fabric.Canvas('c');
  if (!canvas.value) return;
  // 加载图片
  fabric.Image.fromURL(
    "https://hkroom.oss-cn-shenzhen.aliyuncs.com/Snipaste_2024-01-24_05-28-56.png",
    function (oImg) {
      // 缩放图片至合适大小
      oImg.scale(1.3).set({
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
      canvas.value.add(oImg).setActiveObject(oImg);
    }
  );

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
  canvas.value.add(rect);
  canvas.value.add(circle);

  // 初始时禁用自由绘图模式
  canvas.value.isDrawingMode = isDrawingMode.value;

  // 设置画笔样式
  canvas.value.freeDrawingBrush.color = brushColor.value; // 画笔颜色
  canvas.value.freeDrawingBrush.width = 5; // 画笔宽度

  // 渲染画布
  canvas.value.renderAll();
};

// 观察画笔颜色的变化
watch(brushColor, (newValue) => {
  canvas.value.freeDrawingBrush.color = newValue;
});

watch(shapeType, (newValue) => {
  if (!canvas.value) return;

  // 根据选中的形状类型，切换画布的行为
  switch (newValue) {
    case "画笔":
      canvas.value.isDrawingMode = true;
      break;
    case "拖动":
      canvas.value.isDrawingMode = false;
      canvas.value.selection = true; // 允许选择和拖动对象
      canvas.value.forEachObject((obj) => obj.set({ selectable: true }));
      break;
    case "矩形":
    case "圆形":
      canvas.value.isDrawingMode = false;
      canvas.value.selection = false; // 在绘制形状时禁止选择和拖动对象
      canvas.value.forEachObject((obj) => obj.set({ selectable: false }));
      break;
  }
});

// let startX = 0;
// let startY = 0;
// let isDrawing = false;
// let shape;

// canvas.value.on("mouse:down", (options) => {
//   if (shapeType.value !== "矩形" && shapeType.value !== "圆形") return;

//   isDrawing = true;
//   let pointer = canvas.value.getPointer(options.e);
//   startX = pointer.x;
//   startY = pointer.y;

//   if (shapeType.value === "矩形") {
//     shape = new fabric.Rect({
//       left: startX,
//       top: startY,
//       originX: "left",
//       originY: "top",
//       width: pointer.x - startX,
//       height: pointer.y - startY,
//       fill: "transparent",
//       stroke: brushColor.value,
//       strokeWidth: 2,
//     });
//   } else if (shapeType.value === "圆形") {
//     shape = new fabric.Circle({
//       left: startX,
//       top: startY,
//       originX: "left",
//       originY: "top",
//       radius: 0,
//       fill: "transparent",
//       stroke: brushColor.value,
//       strokeWidth: 2,
//     });
//   }

//   canvas.value.add(shape);
// });

// canvas.value.on("mouse:move", (options) => {
//   if (!isDrawing) return;

//   let pointer = canvas.value.getPointer(options.e);

//   if (shapeType.value === "矩形") {
//     if (pointer.x > startX) {
//       shape.set({ width: pointer.x - startX });
//     } else {
//       shape.set({ left: pointer.x, width: startX - pointer.x });
//     }

//     if (pointer.y > startY) {
//       shape.set({ height: pointer.y - startY });
//     } else {
//       shape.set({ top: pointer.y, height: startY - pointer.y });
//     }
//   } else if (shapeType.value === "圆形") {
//     shape.set({
//       radius:
//         Math.max(Math.abs(startY - pointer.y), Math.abs(startX - pointer.x)) /
//         2,
//     });
//     if (pointer.x < startX) {
//       shape.set({ originX: "right" });
//     } else {
//       shape.set({ originX: "left" });
//     }

//     if (pointer.y < startY) {
//       shape.set({ originY: "bottom" });
//     } else {
//       shape.set({ originY: "top" });
//     }
//   }

//   canvas.value.renderAll();
// });

// canvas.value.on("mouse:up", () => {
//   isDrawing = false;
// });

const toggleDrawingMode = (val: boolean) => {
  if (canvas.value) {
    canvas.value.isDrawingMode = val;
  }
};

function uploadImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !canvas.value) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    fabric.Image.fromURL(e.target?.result as string, (oImg) => {
      oImg.scale(0.2).set({
        left: 10,
        top: 10,
        angle: 0,
        borderColor: "red",
        cornerColor: "green",
        hasRotatingPoint: true,
        cornerSize: 10,
      });
      canvas.value?.add(oImg);
    });
  };

  reader.readAsDataURL(file);
}

// 初始化
onMounted(() => {
  drawCvs();
});
</script>
