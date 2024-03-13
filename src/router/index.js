
import { createRouter, createWebHashHistory } from "vue-router"
 
const routes = [
  {
    path: "/",
    name: "panel",
    component: () => import("../components/panel.vue"),
  },
  {
    path: "/p2",
    name: "p2",
    component: () => import("../components/canvas.vue"),
  },
  {
    path: "/p3",
    name: "p3",
    component: () => import("../components/threejs.vue"),
  },
  {
    path: "/p4",
    name: "p4",
    component: () => import("../components/canvas2.vue"),
  },
  {
    path: "/p3-3",
    name: "p3-3",
    component: () => import("../components/threejs2.vue"),
  },
];
export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})



export default router;