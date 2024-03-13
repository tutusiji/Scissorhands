# 基于 three.js 的 web 端模型加载实例

安装 three.js：

```js
npm install three
```

引入 three.js：

```js
<div ref="container" class="w-full h-[100vh]"></div>;
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
```

创建容器，初始化场景、相机和渲染器：

```js
const container = (ref < HTMLElement) | (null > null);

let scene: THREE.Scene; // 声明一个场景
let camera: THREE.PerspectiveCamera; // 声明一个透视相机
let renderer: THREE.WebGLRenderer; // 声明一个渲染器
let cube: THREE.Mesh; // 声明一个立方体
let controls: OrbitControls; // 声明一个控制器
```

上述的插件都是模型渲染中所需要用到的工具类，需要初始化：

这里需要注意相机的参数决定了打开模型时所看到的角度，如果模型过大，需要调整参数，以适应屏幕。

```js
// 场景
scene = new THREE.Scene();

// 相机
camera = new THREE.PerspectiveCamera(
  90,
  container.value.clientWidth / container.value.clientHeight,
  0.1,
  1000
);
camera.position.x = 4;
camera.position.y = 3;
camera.position.z = 3;

// 渲染器
renderer = new THREE.WebGLRenderer();
renderer.setSize(container.value.clientWidth, container.value.clientHeight);
container.value.appendChild(renderer.domElement);

// 几何体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 控制器
controls = new OrbitControls(camera, renderer.domElement);
```

加载 OBJ 格式的模型：

```js
const loader = new OBJLoader();
loader.load(
  "./model/Testarossa.obj", // 模型文件路径
  (object) => {
    object.scale.set(0.016, 0.016, 0.016); // 将模型缩小到原来的一半
    scene.add(object); // 将加载的模型添加到场景中
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log("An error happened");
  }
);
```

加载其它模型文件需要用其他的模型加载器，fbx 格式的模型加载器为 FBXLoader，gltf 格式的模型加载器为 GLTFLoader。

```js
const loader = new FBXLoader();
loader.load(
  "./model/Koenigsegg.fbx", // 模型文件路径
  (object) => {
    object.scale.set(0.016, 0.016, 0.016); // 将模型缩小到原来的一半
    scene.add(object); // 将加载的模型添加到场景中
  }
);
```

### 材质

材质是决定物体外观效果的属性，材质可以设置颜色、透明度、纹理等属性。

对于 obj 的模型，没有自带模型纹理，颜色数据，需要加载 mtl 格式的文件，并设置材质属性。

而 fbx 格式的模型是自带纹理，颜色数据的。

```js
// OBJ 模型加载 mtl纹理加载
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
```

> 如果加载模型之后，模型是一个黑色，很有可能是没有添加光源，或者光源的角度、亮度不对

### 光源

光源是决定物体明暗效果的属性，光源可以设置颜色、位置、强度等属性。光源可以分为点光源、平行光、环境光等。

```js
// 创建一个 点光源 PointLight
const light = new THREE.PointLight(0xffffff, 10);
light.position.set(1, 3, 1);
scene.add(light);

// 创建一个环境光 AmbientLight
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 创建方向光（太阳光）
const directionalLight = new THREE.DirectionalLight(0xffffff, 7); // 白色光，亮度为 1
directionalLight.position.set(5, 3, 5); // 设置光源位置
scene.add(directionalLight);
```

这时基本的模型已经加载成功，还可以添加一些辅助的设置：

```js
// 可以添加一个对光源的辅助可视化对象，帮助调整光源位置
const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(helper);

renderer.setClearColor(0xaaaaaa); // 设置为灰色背景
```

设置完成之后，使用requestAnimationFrame函数来循环渲染场景：

```js
// 渲染循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
```

体验地址(https://tuziki.com/demo/threejs/#/p3)
