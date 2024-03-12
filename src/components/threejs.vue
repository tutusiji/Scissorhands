<template>
  <div ref="container" class="w-full h-[100vh]"></div>
  <img src="http://localhost:5173/vite.svg" alt="" />
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

// import Koenigsegg from "../assets/model/Koenigsegg.obj";
// import Testarossa from "../assets/model/Testarossa.obj";

const container = ref<HTMLElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cube: THREE.Mesh;
let controls: OrbitControls;

// 初始化
onMounted(() => {
  if (!container.value) return;

  // 场景
  scene = new THREE.Scene();

  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);

  // 几何体
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement);

  // OBJ 模型加载
  const mtlLoader = new MTLLoader();
  mtlLoader.load("/model/IronMan.mtl", (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("/model/IronMan.obj", (object) => {
      object.scale.set(0.02, 0.02, 0.02);
      scene.add(object);
    });
  });

  // const loader = new OBJLoader();
  // const loader = new FBXLoader();
  // loader.load(
  //   // "/model/Koenigsegg.fbx", // 模型文件路径
  //   // "/model/Koenigsegg.obj", // 模型文件路径
  //   "/model/Testarossa.fbx", // 模型文件路径
  //   (object) => {
  //     object.scale.set(0.016, 0.016, 0.016); // 将模型缩小到原来的一半
  //     scene.add(object); // 将加载的模型添加到场景中
  //   },
  //   (xhr) => {
  //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //   },
  //   (error) => {
  //     console.log("An error happened");
  //   }
  // );

  // 添加光源
  const light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(50, 50, 50);
  scene.add(light);

  renderer.setClearColor(0xaaaaaa); // 设置为灰色背景

  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
});

onUnmounted(() => {
  if (container.value) {
    container.value.removeChild(renderer.domElement);
  }
});
</script>