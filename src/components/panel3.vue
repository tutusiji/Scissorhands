<template>
  <div class="w-full relative">
    <button
      class="border p-[20px] mb-5"
      @click="splitImage"
      v-if="state.imagesLoaded && !state.imageSplit"
    >
      切割图像
    </button>
    <input
      class=""
      type="file"
      multiple
      @change="handleFileChange"
      v-if="!state.imagesLoaded"
    />
    <canvas
      class="border"
      ref="canvasRef"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      :width="canvasWidth"
      :height="state.canvasHeight"
    />
    <button v-if="state.imageSplit" @click="saveImage">合成图片</button>
  </div>
</template>

<script lang="ts" setup>
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
const canvasWidth = ref(window.innerWidth); // 设定canvas宽度
const state = reactive({
  canvasHeight: 300, // Canvas 高度，根据图片调整
  images: [] as HTMLImageElement[],
  imagesLoaded: false,
  imageSplit: false,
  isDragging: false,
  lineY: 200, // 线条的 y 坐标位置
  topImage: null as ImageData | null,
  bottomImage: null as ImageData | null,
  topImageY: 0,
  bottomImageY: 0,
});

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext("2d");
  }
  canvasWidth.value = Math.min(500, window.innerWidth - 20);
});

const handleFileChange = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;

  state.images = await Promise.all(
    Array.from(files).map((file) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    })
  );

  // 计算 canvas 的总高度,并重新绘制
  let totalHeight = 0;
  for (const image of await Promise.all(state.images)) {
    totalHeight += image.height * (canvasWidth.value / image.width);
  }

  // 设置 canvas 的宽度和高度
  state.canvasHeight = totalHeight;

  // 将图片绘制到 canvas 上
  let yOffset = 0;
  for (const image of await Promise.all(state.images)) {
    const scaledHeight = image.height * (canvasWidth.value / image.width);
    ctx?.drawImage(image, 0, yOffset, canvasWidth.value, scaledHeight);
    yOffset += scaledHeight;
  }
  state.imagesLoaded = true;  // 图像加载完成
  drawLine();
  saveCanvas(); // 保存当前 Canvas 状态

};

// 保存当前 Canvas 的状态
const saveCanvas = () => {
  // savedImageData = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
};


const drawLine = () => {
  if (ctx && state.imagesLoaded && !state.imageSplit) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, state.lineY);
    ctx.lineTo(canvasWidth.value, state.lineY);
    ctx.stroke();
  }
};

const handleTouchStart  = (event: TouchEvent) => {
  if (state.imageSplit || !state.imagesLoaded) return;
  state.isDragging = true;
  state.lineY = event.offsetY;
};

const handleTouchMove  = (event: TouchEvent) => {
  if (state.isDragging) {
    state.lineY = event.offsetY;
    drawImages();
  }
};

const handleTouchEnd = () => {
  state.isDragging = false;
  // if (state.imagesLoaded && !state.imageSplit) {
  //   splitImage();
  // }
};

const splitImage = () => {
  if (!ctx) return;
  state.topImage = ctx.getImageData(0, 0, canvasWidth.value, state.lineY);
  state.bottomImage = ctx.getImageData(
    0,
    state.lineY,
    canvasWidth.value,
    state.canvasHeight - state.lineY
  );
  state.topImageY = 0;
  state.bottomImageY = state.lineY;
  state.imageSplit = true;
};

const saveImage = () => {
  if (!ctx || !state.topImage || !state.bottomImage) return;

  ctx.clearRect(0, 0, canvasWidth.value, state.canvasHeight);
  ctx.putImageData(state.topImage, 0, state.topImageY);
  ctx.putImageData(state.bottomImage, 0, state.bottomImageY);
  const dataURL = canvasRef.value?.toDataURL("image/png");
  downloadImage(dataURL);
};

const downloadImage = (dataURL: string | undefined) => {
  if (!dataURL) return;

  const link = document.createElement("a");
  link.download = "image.png";
  link.href = dataURL;
  link.click();
};
</script>
