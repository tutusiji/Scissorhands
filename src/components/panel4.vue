<template>
  <div class="w-full relative p-[10px]">
    <el-form :model="form" label-width="120px">
      <el-form-item label="工具类型"> 长图合并&&图片裁剪 </el-form-item>
      <el-form-item label="合并方向">
        <el-radio-group v-model="form.direction">
          <el-radio label="横向" />
          <el-radio label="竖向" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="宽度/高度" class="w-[260px]">
        <el-input v-model="form.whd"
          ><span>px</span>
          <template #append>px</template>
        </el-input>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :multiple="true"
          :drag="true"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-change="handleChange"
          v-model:file-list="fileList"
        >
          <el-icon><Upload /></el-icon>
          <div class="el-upload__text">Drop or click</div>
          <template #tip>
            <div class="el-upload__tip">
              <!-- jpg/png files with a size less than 10mb -->
              (注意图片顺序)
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="操作">
        <el-button>重置</el-button>
        <el-button @click="splitImg"> 切割图像 </el-button>
        <el-button type="primary" @click="confirmCropAndSave">
          确定裁剪并保存图像
        </el-button>
      </el-form-item>

      <!-- <input class="" type="file" multiple @change="handleFileChange" /> -->
      <el-form-item label="画布">
        <div
          ref="canvasContainer"
          class="canvas-container"
          style="position: relative"
        >
          <canvas
            class="border ml-30"
            ref="canvasRef"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            :width="form.whd"
            height="200"
          />
          <div
          ref="cropLine"
            id="crop-line"
            style="
              cursor: pointer;
              position: absolute;
              top: 100px;
              left: 0;
              width: 100%;
              height: 2px;
              background-color: red;
            "
          ></div>
        </div>
      </el-form-item>
    </el-form>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { Upload } from "@element-plus/icons-vue";
import type { UploadFile } from "element-plus";
const fileList = ref<UploadUserFile[]>([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
// const disabled = ref(false);

// const canvasRef = ref(null);
// const canvas = canvasRef.value;
const canvasContainer = ref<HTMLElement | null>(null);
const cropLine = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
const form = reactive({
  direction: "",
  whd: 360,
});

const handleRemove = (file: UploadFile) => {
  console.log(file);
};

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
};

const handleChange: UploadProps["onChange"] = async (
  files: any,
  uploadFiles: Iterable<unknown> | ArrayLike<unknown>
) => {
  console.log("files", files);
  console.log("uploadFiles", uploadFiles);
  const images = Array.from(uploadFiles).map((file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file.raw);
    });
  });
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext("2d");
  // const width = 500; // 固定宽度

  // 计算 canvas 的总高度,并重新绘制
  let totalHeight = 0;
  for (let image of await Promise.all(images)) {
    totalHeight += image.height * (form.whd / image.width);
  }

  // 设置 canvas 的宽度和高度
  canvasRef.value.width = form.whd;
  canvasRef.value.height = totalHeight;

  // 将图片绘制到 canvas 上
  let y = 0;
  for (const image of await Promise.all(images)) {
    const scaledHeight = image.height * (form.whd / image.width);
    ctx.drawImage(image, 0, y, form.whd, scaledHeight);
    y += scaledHeight;
    console.log(y, scaledHeight);
  }
  saveCanvas(); // 保存当前 Canvas 状态
  drawLine();
  eventCvs();
};

let isDragging = false;
let draggingPart: "top" | "bottom" | null = null;
let isDraggingBottom = false;
let isDraggingTop = false;
let lineDraggable = true;
let line = { x1: 0, y1: 100, x2: 500, y2: 100 }; // 初始线条位置
let dragStartPoint: { y: number; x: number };
let savedImageData: object; // 用于保存 Canvas 的图像数据
let dragStartY = 0;
let topImageY = 0;
let topImage: object, bottomImage: object;
let bottomImageY = 0;
let lineY = 200; // 线条的 y 坐标位置，可根据实际情况调整

let isDraggingLine = false;

const cropLineY = ref(0); // 裁剪线的y坐标

onMounted(() => {
  const container = canvasContainer.value;
  const line = cropLine.value;
  if (container && line) {
    let isDragging = false;
    let startY = 0;
    
    line.style.top = '0px'; // 初始化位置
    line.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY - line.getBoundingClientRect().top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        let newY = e.clientY - container.getBoundingClientRect().top - startY;
        // 限制移动区间
        newY = Math.max(0, Math.min(newY, container.offsetHeight - line.offsetHeight));
        line.style.top = `${newY}px`;
        cropLineY.value = newY; // 更新裁剪线的y坐标
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
});

// 绘制线条的函数
const drawLine = () => {
  // ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布
  ctx.beginPath();
  ctx.lineWidth = 2; // 设置线条宽度为2px
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
};

// 确定是否点击了线条
const isOnLine = (x: number, y: number) => {
  const distance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const totalLength = distance(line.x1, line.y1, line.x2, line.y2);
  const toStart = distance(x, y, line.x1, line.y1);
  const toEnd = distance(x, y, line.x2, line.y2);
  return (
    totalLength >= toStart + toEnd - 5 && totalLength <= toStart + toEnd + 5
  );
};

const eventCvs = () => {
  // 处理鼠标按下事件
  canvasRef.value.addEventListener(
    "mousedown",
    (event: { clientX: number; clientY: number }) => {
      const rect = canvasRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (isOnLine(x, y)) {
        isDragging = true;
        dragStartPoint = { x, y };
      }
    }
  );

  // 处理鼠标移动事件
  canvasRef.value.addEventListener(
    "mousemove",
    (event: { clientY: number }) => {
      if (isDragging) {
        const rect = canvasRef.value.getBoundingClientRect();
        // const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // const dx = x - dragStartPoint.x;
        const dy = y - dragStartPoint.y;

        restoreCanvas(); // 恢复到保存的状态
        // line.x1 += dx;
        line.y1 += dy;
        // line.x2 += dx;
        line.y2 += dy;
        lineY = y;

        // dragStartPoint = { x, y };
        dragStartPoint = { x: dragStartPoint.x, y: y };
        drawLine();
      }
    }
  );

  // 处理鼠标释放事件
  canvasRef.value.addEventListener("mouseup", () => {
    isDragging = false;
    // saveCanvas(); // 拖动结束后再次保存 Canvas 状态（更新为包含新线条的状态）
  });
};

// 保存当前 Canvas 的状态
const saveCanvas = () => {
  savedImageData = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );
};

// 恢复保存的 Canvas 状态
const restoreCanvas = () => {
  ctx.putImageData(savedImageData, 0, 0);
};

const splitImg = () => {
  splitAndSaveImages();
};

// 保存并切割图像
const splitAndSaveImages = () => {
  // 确保 canvas 和 ctx 都是有效的
  if (!canvasRef.value || !ctx) return;

  // 保存并切割图像
  savedImageData = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );
  topImage = ctx.getImageData(0, 0, canvasRef.value.width, lineY);
  bottomImage = ctx.getImageData(
    0,
    lineY,
    canvasRef.value.width,
    canvasRef.value.height - lineY
  );
  bottomImageY = lineY;
  redrawImages();
};

const handleMouseDown = (event: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect();
  const y = event.clientY - (rect?.top ?? 0);

  // 检查点击位置是否在上半部分或下半部分图像内
  if (y < lineY) {
    // 假设lineY是分割线的y坐标
    isDraggingTop = true;
  } else {
    isDraggingBottom = true;
  }
  dragStartY = y;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDraggingTop && !isDraggingBottom) return; // 如果没有在拖动，就直接返回

  const rect = canvasRef.value?.getBoundingClientRect();
  let newY = event.clientY - (rect?.top ?? 0);

  if (isDraggingTop) {
    let deltaY = newY - dragStartY;
    topImageY += deltaY;
    // 添加边界条件检查
    topImageY = Math.max(0, Math.min(topImageY, lineY - 1));
  } else if (isDraggingBottom) {
    let deltaY = newY - dragStartY;
    bottomImageY += deltaY;
    // 添加边界条件检查
    bottomImageY = Math.max(
      lineY + 1,
      Math.min(bottomImageY, canvasRef.value.height)
    );
  }

  dragStartY = newY; // 更新拖动起点

  // 重新绘制图像
  redrawImages();
};

const redrawImages = () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  if (topImage) ctx.putImageData(topImage, 0, topImageY);
  if (bottomImage) ctx.putImageData(bottomImage, 0, bottomImageY);
};

// 确定裁剪并保存图像
const confirmCropAndSave = () => {
  // 禁止线条拖动
  lineDraggable = false;

  // 保存裁剪后的图像（不包含线条）
  // ...保存逻辑...
};

// 在需要的时候，重新启用线条拖动
const enableLineDragging = () => {
  lineDraggable = true;
};

const handleMouseUp = () => {
  isDragging = false;
  draggingPart = null;
  isDraggingTop = false;
  isDraggingBottom = false;
};
</script>
