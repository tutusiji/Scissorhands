<template>
  <div class="wraper" id="sketchpad-template" ref="wraper">
    <div class="canvas-wraper">
      <canvas id="canvas" ref="canvas"></canvas>
    </div>
    <div class="controlPanel">
      <div class="text">
        <p>视点涂鸦工具</p>
      </div>
      <div class="tool">
        <div
          :class="[initIdx == idx ? 'contro-item active' : 'contro-item']"
          v-for="(item, idx) in toolsArr"
          :key="idx"
          @click="handleTools(item, idx)"
        >
          <i :class="'iconfont' + item.icon" :title="item.title"></i>
        </div>
        <colorPicker
          class="color-list"
          v-model="drawColor"
          v-on:change="headleChangeColor"
        />
        <Slider
          v-model="drawWidth"
          :min="0"
          :max="50"
          style="width: 150px; padding: 0px 10px"
        ></Slider>
      </div>
    </div>
    <div class="download">
      <img :src="imageBase64" v-show="imageBase64 != ''" alt="" />
    </div>
  </div>
</template>
<script>
import { fabric } from "fabric";
export default {
  name: "Sketchpad",
  props: {
    imgSrc: {
      type: String,
    },
    canvasHeight: {
      type: Number,
    },
  },
  data() {
    return {
      onRemoveVaule: false,
      onStartvalue: false,
      currentTool: "",
      done: false,
      fabricObj: null,
      initIdx: 0,
      toolsArr: [
        {
          name: "pencil",
          icon: " iconhuabi",
          title: "铅笔",
        },
        {
          name: "line",
          icon: " iconline",
          title: "直线",
        },
        {
          name: "arrow",
          icon: " iconhj2",
          title: "箭头",
        },
        {
          name: "xuxian",
          icon: " icon-xiaoxuxian",
          title: "虚线",
        },
        {
          name: "text",
          icon: " iconwenzi1",
          title: "文本",
        },
        {
          name: "juxing",
          icon: " iconjuxing",
          title: "矩形",
        },
        {
          name: "cricle",
          icon: " iconyuanxingxuankuang",
          title: "圆形",
        },
        {
          name: "ellipse",
          icon: " icontuoyuanxing",
          title: "椭圆形",
        },
        {
          name: "equilateral", //三角形
          icon: " iconxingzhuang-sanjiaoxing",
          title: "三角形",
        },
        {
          name: "remove",
          icon: " iconqingchu1",
          title: "清除",
        },
        {
          name: "undo",
          icon: " iconzhixiang-houtui",
          title: "上一步",
        },
        {
          name: "redo",
          icon: " iconzhixiang-qianjin",
          title: "下一步",
        },
        {
          name: "reset",
          icon: " iconzhongzhi",
          title: "重置",
        },
        {
          name: "test",
          icon: " iconicon-test",
          title: "选中",
        },
        {
          name: "baocun",
          icon: " iconbaocun",
          title: "保存",
        },
      ],
      mouseFrom: {},
      mouseTo: {},
      moveCount: 1,
      doDrawing: false,
      fabricHistoryJson: [],
      mods: 0,
      drawingObject: null, //绘制对象
      // drawColor: '#E34F51',
      drawWidth: 4,
      drawColor: "#E34F51",
      imageBase64: "",
      zoom: window.zoom ? window.zoom : 1,
    };
  },
  mounted() {
    //初始化canvas
    setTimeout(() => {
      this.initCanvas();
    }, 500);
  },
  watch: {
    drawWidth: function (newVal) {
      this.drawWidth = newVal;
      this.fabricObj.freeDrawingBrush.width = newVal;
    },
  },
  computed: {
    canvasWidth() {
      return window.innerWidth;
    },
  },
  methods: {
    initCanvas() {
      // let _this = this;
      this.fabricObj = new fabric.Canvas("canvas", {
        isDrawingMode: true, // 开启画笔
        selectable: false,
        selection: false,
        //   perPixelTargetFind: true,
        devicePixelRatio: true, //Retina 高清屏 屏幕支持
      });
      this.fabricObj.setBackgroundImage(
        this.imgSrc,
        this.fabricObj.renderAll.bind(this.fabricObj),
        {
          backgroundImageOpacity: 0.5, // should the image be resized to fit the container?
          backgroundImageStretch: false,
        }
      );
      // console.log(this.$parent.canvasHeight)
      this.fabricObj.freeDrawingBrush.color = "#E34F51";
      this.fabricObj.freeDrawingBrush.width = this.drawWidth;
      this.fabricObj.setWidth(this.canvasWidth);
      this.fabricObj.setHeight(this.$parent.canvasHeight);
      console.log(this.canvasWidth, this.$parent.canvasHeight);
      this.fabricObj
        .add
        // new fabric.Rect({ top: 100, left: 100, width: 50, height: 50, fill: '#f55' }),
        // new fabric.Circle({ top: 140, left: 230, radius: 75, fill: 'green' }),
        // new fabric.Triangle({ top: 300, left: 210, width: 100, height: 100, fill: 'blue' }),
        ();
      //绑定画板事件
      this.fabricObjAddEvent();
      // console.log(this.fabricObj._onSelected)
    },
    //事件监听
    fabricObjAddEvent() {
      this.fabricObj.on({
        "mouse:down": (o) => {
          this.mouseFrom.x = o.pointer.x;
          this.mouseFrom.y = o.pointer.y;
          this.doDrawing = true;
          if (this.currentTool == "text") {
            this.drawText();
          }
        },
        "mouse:up": (o) => {
          this.mouseTo.x = o.pointer.x;
          this.mouseTo.y = o.pointer.y;
          this.drawingObject = null;
          this.moveCount = 1;
          this.doDrawing = false;
          this.updateModifications(true);
        },
        "mouse:move": (o) => {
          if (this.moveCount % 2 && !this.doDrawing) {
            //减少绘制频率
            return;
          }
          this.moveCount++;
          this.mouseTo.x = o.pointer.x;
          this.mouseTo.y = o.pointer.y;
          if (this.onStartvalue) {
            this.drawing();
          }
        },
        //对象移动事件
        "object:moving": (e) => {
          e.target.opacity = 0.5;
        },
        "object:added": (e) => {
          console.log(e);
        },
        //增加对象
        "object:added": () => {
          // debugger
        },
        "object:modified": (e) => {
          e.target.opacity = 1;
          let object = e.target;
          this.updateModifications(true);
        },
        "selection:created": (e) => {
          console.log(e);
          if (this.onRemoveVaule) {
            if (e.target._objects) {
              //多选删除
              var etCount = e.target._objects.length;
              for (var etindex = 0; etindex < etCount; etindex++) {
                this.fabricObj.remove(e.target._objects[etindex]);
              }
            } else {
              //单选删除
              this.fabricObj.remove(e.target);
            }
            this.fabricObj.discardActiveObject(); //清除选中框
            this.updateModifications(true);
          } else {
            // this.onRemoveVaule = false;
            // this.fabricObj.isDrawingMode = false;
            // this.fabricObj.skipTargetFind  = false;
          }
        },
      });
    },
    //储存历史记录
    updateModifications(savehistory) {
      if (savehistory == true) {
        this.fabricHistoryJson.push(JSON.stringify(this.fabricObj));
      }
    },
    //canvas 历史后退
    undo() {
      let state = this.fabricHistoryJson;
      if (this.mods < state.length) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods - 1]);
        this.fabricObj.renderAll();
        this.mods += 1;
        if (this.mods == state.length) {
          this.fabricObj.setBackgroundImage(
            this.imgSrc,
            this.fabricObj.renderAll.bind(this.fabricObj),
            {
              // Optionally add an opacity lvl to the image
              backgroundImageOpacity: 0.5, // should the image be resized to fit the container?
              backgroundImageStretch: false,
            }
          );
        }
      }
    },
    //前进
    redo() {
      let state = this.fabricHistoryJson;
      if (this.mods > 0) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods + 1]);
        this.fabricObj.renderAll();
        this.mods -= 1;
      }
    },
    transformMouse(mouseX, mouseY) {
      return { x: mouseX / this.zoom, y: mouseY / this.zoom };
    },
    resetObj() {
      this.fabricObj.selectable = false;
      this.fabricObj.selection = false;
      this.fabricObj.skipTargetFind = true;
      //清除文字对象
      if (this.textboxObj) {
        this.textboxObj.exitEditing();
        this.textboxObj = null;
      }
    },
    handleTools(tools, idx) {
      console.log(tools.name);
      this.initIdx = idx;
      this.currentTool = tools.name;
      this.fabricObj.isDrawingMode = false;
      this.resetObj();
      switch (tools.name) {
        case "pencil":
          this.fabricObj.isDrawingMode = true;
          break;
        case "remove":
          this.fabricObj.discardActiveObject().renderAll(); //清除画布选中元素
          this.onRemoveVaule = true;
          this.fabricObj.selection = true;
          this.fabricObj.skipTargetFind = false;
          this.fabricObj.selectable = true;
          break;
        case "reset":
          this.onStartvalue = true;
          this.fabricObj.clear();
          this.fabricObj.setBackgroundImage(
            this.imgSrc,
            this.fabricObj.renderAll.bind(this.fabricObj),
            {
              // Optionally add an opacity lvl to the image
              backgroundImageOpacity: 0.5, // should the image be resized to fit the container?
              backgroundImageStretch: false,
            }
          );
          break;
        case "redo":
          this.onStartvalue = true;
          this.redo();
          break;
        case "undo":
          this.onStartvalue = true;
          this.undo();
          break;
        case "xuxian":
          this.onStartvalue = true;
          break;
        case "arrow":
          this.onStartvalue = true;
          break;
        case "line":
          this.onStartvalue = true;
          break;
        case "juxing":
          this.onStartvalue = true;
          break;
        case "cricle":
          this.onStartvalue = true;
          break;
        case "ellipse":
          this.onStartvalue = true;
          break;
        case "equilateral":
          this.onStartvalue = true;
          break;
        case "test":
          this.onSelect();
          break;
        case "baocun":
          this.downLoadImage();
          break;
        default:
          break;
      }
    },
    //绘制文字对象
    drawText() {
      this.textboxObj = new fabric.Textbox(" ", {
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        width: 220,
        fontSize: 22,
        fill: this.drawColor,
        hasControls: true,
      });
      this.fabricObj.add(this.textboxObj);
      this.textboxObj.enterEditing();
      this.textboxObj.hiddenTextarea.focus();
      this.updateModifications(true);
    },
    drawing() {
      // let _this = this;
      if (this.drawingObject) {
        this.fabricObj.remove(this.drawingObject);
      }
      let fabricObject = null;
      switch (this.currentTool) {
        case "pencil":
          this.fabricObj.isDrawingMode = true;
          break;
        case "line":
          fabricObject = new fabric.Line(
            [
              this.mouseFrom.x,
              this.mouseFrom.y,
              this.mouseTo.x,
              this.mouseTo.y,
            ],
            {
              stroke: this.drawColor,
              strokeWidth: this.drawWidth,
            }
          );
          break;
        case "arrow":
          fabricObject = new fabric.Path(
            this.drawArrow(
              this.mouseFrom.x,
              this.mouseFrom.y,
              this.mouseTo.x,
              this.mouseTo.y,
              17.5,
              17.5
            ),
            {
              stroke: this.drawColor,
              fill: "rgba(255,255,255,0)",
              strokeWidth: this.drawWidth,
            }
          );
          break;
        case "xuxian": //doshed line
          fabricObject = new fabric.Line(
            [
              this.mouseFrom.x,
              this.mouseFrom.y,
              this.mouseTo.x,
              this.mouseTo.y,
            ],
            {
              strokeDashArray: [10, 3],
              stroke: this.drawColor,
              strokeWidth: this.drawWidth,
            }
          );
          break;
        case "juxing": //矩形
          var path =
            "M " +
            this.mouseFrom.x +
            " " +
            this.mouseFrom.y +
            " L " +
            this.mouseTo.x +
            " " +
            this.mouseFrom.y +
            " L " +
            this.mouseTo.x +
            " " +
            this.mouseTo.y +
            " L " +
            this.mouseFrom.x +
            " " +
            this.mouseTo.y +
            " L " +
            this.mouseFrom.x +
            " " +
            this.mouseFrom.y +
            " z";
          fabricObject = new fabric.Path(path, {
            left: this.mouseFrom.x,
            top: this.mouseFrom.y,
            stroke: this.drawColor,
            strokeWidth: this.drawWidth,
            fill: "rgba(255, 255, 255, 0)",
          });
          break;
        case "cricle": //正圆
          var radius =
            Math.sqrt(
              (this.mouseTo.x - this.mouseFrom.x) *
                (this.mouseTo.x - this.mouseFrom.x) +
                (this.mouseTo.y - this.mouseFrom.y) *
                  (this.mouseTo.y - this.mouseFrom.y)
            ) / 2;
          fabricObject = new fabric.Circle({
            left: this.mouseFrom.x,
            top: this.mouseFrom.y,
            stroke: this.drawColor,
            fill: "rgba(255, 255, 255, 0)",
            radius: radius,
            strokeWidth: this.drawWidth,
          });
          break;
        case "ellipse": //椭圆
          var left = this.mouseFrom.x;
          var top = this.mouseFrom.y;
          var ellipse =
            Math.sqrt(
              (this.mouseTo.x - left) * (this.mouseTo.x - left) +
                (this.mouseTo.y - top) * (this.mouseTo.y - top)
            ) / 2;
          fabricObject = new fabric.Ellipse({
            left: left,
            top: top,
            stroke: this.drawColor,
            fill: "rgba(255, 255, 255, 0)",
            originX: "center",
            originY: "center",
            rx: Math.abs(left - this.mouseTo.x),
            ry: Math.abs(top - this.mouseTo.y),
            strokeWidth: this.drawWidth,
          });
          break;
        case "equilateral": //等边三角形
          var height = this.mouseTo.y - this.mouseFrom.y;
          fabricObject = new fabric.Triangle({
            top: this.mouseFrom.y,
            left: this.mouseFrom.x,
            width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
            height: height,
            stroke: this.drawColor,
            strokeWidth: this.drawWidth,
            fill: "rgba(255,255,255,0)",
          });
          break;
        case "remove":
          break;
        default:
          // statements_def'
          break;
      }
      if (fabricObject) {
        this.fabricObj.add(fabricObject);
        this.drawingObject = fabricObject;
      }
    },
    //书写箭头的方法
    drawArrow(fromX, fromY, toX, toY, theta, headlen) {
      theta = typeof theta != "undefined" ? theta : 30;
      headlen = typeof theta != "undefined" ? headlen : 10;
      // 计算各角度和对应的P2,P3坐标
      let angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
        angle1 = ((angle + theta) * Math.PI) / 180,
        angle2 = ((angle - theta) * Math.PI) / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2);
      let arrowX = fromX - topX,
        arrowY = fromY - topY;
      let path = " M " + fromX + " " + fromY;
      path += " L " + toX + " " + toY;
      arrowX = toX + topX;
      arrowY = toY + topY;
      path += " M " + arrowX + " " + arrowY;
      path += " L " + toX + " " + toY;
      arrowX = toX + botX;
      arrowY = toY + botY;
      path += " L " + arrowX + " " + arrowY;
      return path;
    },
    downLoadImage() {
      // this.done = true;
      //生成双倍像素比的图片
      let base64URl = this.fabricObj.toDataURL({
        formart: "png",
        multiplier: 2,
      });
      this.imageBase64 = base64URl;
      this.$emit("onChang", { type: base64URl });
      // this.done = false;
    },
    onSelect() {
      this.onRemoveVaule = false;
      this.onStartvalue = false;
      this.fabricObj.isDrawingMode = false;
      this.fabricObj.skipTargetFind = false;
    },
    headleChangeColor(value) {
      this.drawColor = value;
      console.log(value);
      this.fabricObj.freeDrawingBrush.color = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.wraper {
  position: relative;
  width: 100%;
  height: 100%;
  .canvas-wraper {
    //   height: 50%;
    height: 100%;
    width: 100%;
    // margin-bottom: 10px;
    overflow: hidden;
  }
  .controlPanel {
    position: absolute;
    width: 800px;
    bottom: 30px;
    // width: 100%;
    // height: 32px;
    // background: #ddd;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 1px 3px 10px 0 rgba(150, 150, 150, 0.4);
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    // justify-content: center;
    // align-items: center;
    //   margin-bottom: 15px;
    .text {
      display: inline-block;
      padding-left: 15px;
      font-size: 12px;
      letter-spacing: 1px;
      color: #aaaaaa;
      line-height: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .tool {
      display: flex;
    }
    .contro-item {
      width: 38px;
      // flex-basis: 100px;
      // border-right: 1px solid #dad7d9;
      text-align: center;
      cursor: pointer;
      background: #fefefe;
      i {
        height: 100%;
        font-size: 22px;
        line-height: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      &.active {
        // background: #e34f51;
        color: #00bfff;
        border-radius: 3px;
        i {
          font-size: 26px;
        }
      }
    }
    .color-list {
      width: 38px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .spn {
    display: block;
    width: 20px;
    height: 20px;
  }
  .download {
    img {
      width: 100%;
    }
  }
}
</style>
<style>
.controlPanel .box {
  bottom: 0px;
}
.wraper .el-slider__button-wrapper {
  z-index: 0 !important;
}
</style>
