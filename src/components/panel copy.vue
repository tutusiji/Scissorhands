<template>
  <el-upload
    v-model:file-list="fileList"
    :multiple="true"
    :drag="true"
    action="#"
    :auto-upload="false"
    :on-change="handleChange"
    :before-Upload="beforeUpload"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img class="w-full" :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
  <div class="flex box" id="box">
    <img
      class="aaa w-[50px] h-[40px]"
      :src="item.url"
      v-for="item in fileList"
      alt=""
    />
  </div>
  <canvas
    ref="canvasRef"
    id="myCanvas"
    :width="cvsWidth"
    :height="cvsHeight"
    class="border"
  ></canvas>
</template>
<!-- @mousedown="startDrag"
    @mousemove="dragImage"
    @mouseup="stopDrag" -->

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";

import type { UploadProps, UploadUserFile } from "element-plus";

const fileList = ref<UploadUserFile[]>([]);

const dialogImageUrl = ref("");
const dialogVisible = ref(false);

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles);
};

const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};
const canvasRef = ref<HTMLCanvasElement>();
const cvsWidth = ref<number>(400);
const cvsHeight = ref<number>(0);

const images = ref([]);
const draggingImage = ref(null);
let offsetX = 0;
let offsetY = 0;

onMounted(() => {
  // 绘制多张图片
  // images.value.push({ img: new Image(), x: 50, y: 50 });
  // images.value.push({ img: new Image(), x: 100, y: 100 });
  // images.value.forEach((image) => {
  //   image.img.src = "image.png"; // 设置图片路径
  //   image.img.onload = () => {
  //     ctx.drawImage(image.img, image.x, image.y);
  //   };
  // });
});

const startDrag = (e: { clientX: number; clientY: number }) => {
  const canvas = canvasRef.value;
  const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  const mouseY = e.clientY - canvas.getBoundingClientRect().top;

  // 检查鼠标是否在某张图片上
  for (const image of images.value) {
    if (
      mouseX >= image.x &&
      mouseX <= image.x + image.img.width &&
      mouseY >= image.y &&
      mouseY <= image.y + image.img.height
    ) {
      draggingImage.value = image;
      offsetX = mouseX - image.x;
      offsetY = mouseY - image.y;
      break;
    }
  }
};

const dragImage = (e: { clientX: number; clientY: number }) => {
  if (draggingImage.value) {
    const canvas = canvasRef.value;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    draggingImage.value.x = mouseX - offsetX;
    draggingImage.value.y = mouseY - offsetY;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制所有图片
    for (const image of images.value) {
      ctx.drawImage(image.img, image.x, image.y);
    }
  }
};

const stopDrag = () => {
  draggingImage.value = null;
};

const loadCvs = () => {
  const getCvs = document.getElementsByClassName("myCanvas");
  const ctx = getCvs.getContext("2d");
  const promises = fileList.value.map((file, index) => {
    console.log(file, index);
    const image = new Image();
    image.src = file.url;
    return new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });
  });

  Promise.all(promises)
    .then(() => {
      fileList.value.forEach((file, index) => {
        const image = new Image();
        image.src = file.url;
        image.onload = () => {
          let width = image.width;
          let height = image.height;
          const itemH = (height * cvsWidth.value) / width;
          console.log(image, 0, cvsHeight.value, cvsWidth.value, itemH);
          ctx.drawImage(image, 0, cvsHeight.value, cvsWidth.value, itemH);
          cvsHeight.value += itemH;
        };
      });
    })
    .catch((error) => console.error(error));
};

const drawCvs = () => {
  var images = document.getElementsByClassName("aaa");
  const getCvs = document.getElementById("myCanvas");
  const ctx = getCvs.getContext("2d");
  for (var i = 0; i < images.length; i++) {
    var image = images[i];
    let width = 200;
    let height = 200;
    const itemH = (height * cvsWidth.value) / width;
    ctx.drawImage(image, 0, 0, 300, 300);
    cvsHeight.value += itemH;
  }
};

watch(fileList, (newValue) => {
  console.log("watch 已触发", newValue);
  setTimeout(() => {
    // newValue.length > 0 && loadCvs();
    newValue.length > 0 && drawCvs();
  }, 2000);
});

watchEffect(() => {
  // console.log("fileList", fileList);
});

const handleChange: UploadProps["onChange"] = (files, uploadFiles) => {
  // console.log("onChange", uploadFiles);

  setTimeout(() => {}, 2000);

  return;
  const images = uploadFiles.map((item) => item.url); // 存储多张图片的数组
  images.forEach((blobUrl) => {
    const img = new Image(null);
    img.src = blobUrl;
    img.onload = () => {
      cvsHeight.value += img.height;
      console.log(canvasRef.value.width, img.height);
      canvasRef.value.getContext("2d").drawImage(img, 0, 0, 400, img.height);
    };
  });
};

const beforeUpload = (file: any) => {
  if (file) {
    console.log("file", file);
    function getFileData(file: Blob) {
      return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
          resolve(reader.result);
        };
      });
    }
    function getImage(result: unknown) {
      return new Promise(function (resolve, reject) {
        let img = new Image();
        img.src = result;
        img.onload = function () {
          //注意只有onload以后才可以拿到图片信息
          resolve({
            width: img.width,
            height: img.height,
          });
        };
      });
    }
    getFileData(file).then((res) => {
      getImage(res).then((r) => {
        let afterFileHeight = r.height;
        let afterFileWidth = r.width;
        console.log(afterFileHeight, afterFileWidth, "afterFileWidth");
      });
    });
  }
  return false;
};
</script>
