
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
];
export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})



export default router;