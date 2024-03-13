# 基于 fabric.js 的 canvas 画板工具

安装 fabric.js：

```js
npm install fabric
```

引入 fabric.js：

```js
<canvas id="c" class="border ml-30" width="800" height="600"></canvas>;

import { fabric } from "fabric";
import { Canvas } from "fabric";
```

使用 fabric.js 创建画布

```js
const isDrawingMode = ref(false); // 定义一个变量来控制画笔模式
// let canvas: fabric.Canvas | null = null;
const canvas = (ref < fabric.Canvas) | (null > null); // 定义一个ref变量来保存canvas实例
const brushColor = ref < string > "#ff0000"; // 定义一个变量来保存画笔颜色
const shapeType = ref < string > "画笔"; // 定义一个变量来保存形状类型
canvas.value = new fabric.Canvas("c"); // 创建canvas实例
```

加载图片对象：

```js
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
```

创建矩形对象：

```js
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
```

创建圆形对象：

```js
// 创建圆形
const circle = new fabric.Circle({
  radius: 50, // 半径
  fill: "blue", // 填充颜色
  left: 300, // X 坐标
  top: 150, // Y 坐标
  // 设置控制点的样式，使其可缩放和旋转
  hasRotatingPoint: true,
});
```

将图形对象添加到画布上：

```js
canvas.value.add(rect);
canvas.value.add(circle);
```

其它设置：

```js
// 初始时禁用自由绘图模式
canvas.value.isDrawingMode = isDrawingMode.value;

// 设置画笔样式
canvas.value.freeDrawingBrush.color = brushColor.value; // 画笔颜色
canvas.value.freeDrawingBrush.width = 5; // 画笔宽度
```

渲染画布:

```js
canvas.value.renderAll();
```

通过调色板选择颜色：

```js
<el-form-item label="调色板">
  <input type="color" v-model="brushColor" class="h-8" />
</el-form-item>;

// 观察画笔颜色的变化
watch(brushColor, (newValue) => {
  canvas.value.freeDrawingBrush.color = newValue;
});
```

通过工具栏选择绘制不同的图形和操作：

```js
<el-radio-group v-model="shapeType">
  <el-radio-button label="画笔" value="画笔" />
  <el-radio-button label="拖动" value="拖动" />
  <el-radio-button label="矩形" value="矩形" />
  <el-radio-button label="圆形" value="圆形" />
</el-radio-group>;

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
```

如果是选择的绘制图形，则需要使用`canvas.value.add(new fabric.Rect({}))`来绘制矩形，`canvas.value.add(new fabric.Circle({}))`来绘制圆形。

并且捕捉 mouse:down、mouse:move 事件，获取鼠标拖动的 x,y 坐标值计算出距离长度，赋值给到新建的图形以实现拖动生成对应大小的图形。

```js
let startX = 0;     // 起始点 x
let startY = 0;     // 起始点 y
let isDrawing = false;   // 绘制开关
let shape; // 定义图形变量，用于存储新建的图形对象

// 监听鼠标事件
canvas.value.on("mouse:down", (e) => {
    isDrawing = true;
    let pointer = canvas.value.getPointer(options.e);
    startX = pointer.x;
    startY = pointer.y;

    if (shapeType.value === "矩形") {
        shape = new fabric.Rect({
        left: startX,
        top: startY,
        originX: "left",
        originY: "top",
        width: pointer.x - startX,
        height: pointer.y - startY,
        fill: "transparent",
        stroke: brushColor.value,
        strokeWidth: 2,
        });
    } else if (shapeType.value === "圆形") {
        shape = new fabric.Circle({
        left: startX,
        top: startY,
        originX: "left",
        originY: "top",
        radius: 0,
        fill: "transparent",
        stroke: brushColor.value,
        strokeWidth: 2,
        });
    }
    canvas.value.add(shape);
}

canvas.value.on("mouse:move", (options) => {

}

canvas.value.renderAll();

```

如果有贴图需求，可以使用上传操作：

```js
<el-form-item label="贴图">
    <input type="file" @change="uploadImage" accept="image/*" />
</el-form-item>


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

```

体验地址(https://tuziki.com/demo/threejs/#/p2)
