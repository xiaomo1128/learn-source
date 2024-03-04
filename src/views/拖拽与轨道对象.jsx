import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import * as dat from 'dat.gui';

const Page = () => {
  useEffect(() => {
    const $ = {
      createScene () {
        const canvas = document.getElementById('c')

        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width
        canvas.height = height
        // 挂载全局上
        this.canvas = canvas
        this.width = width
        this.height = height

        // 创建3D场景对象
        const scene = new THREE.Scene();
        this.scene = scene
      },
      // 创建光照
      createLights () {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

        this.scene.add(ambientLight, directionalLight);
      },
      // 创建立方体对象
      createObjects () {
        // 创建立方体的几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        // 创建立方体材质
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
        })
        // 创建3D物体对象
        const mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh)
        this.mesh = mesh;
      },
      createCamera () {
        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100)
        // 设置相机位置
        watcherCamera.position.set(2, 2, 6)
        // 设置相机朝向
        watcherCamera.lookAt(this.scene.position)
        // 将相机添加到场景中
        this.scene.add(watcherCamera)
        this.watcherCamera = watcherCamera
        this.camera = watcherCamera
      },
      datGui () {
        const _this = this
        const gui = new dat.GUI();

        // 是否启用
        gui.add(_this.orbitControls, 'enabled')
        // 阻尼系数 物体运动的惯性大小
        gui.add(_this.orbitControls, 'dampingFactor', 0.01, 0.2, 0.01)
        // 相机平移的速度
        gui.add(_this.orbitControls, 'panSpeed', 1, 10, 1)
        // 实现物体自转
        gui.add(_this.orbitControls, 'autoRotate')
        // 物体自转速度
        gui.add(_this.orbitControls, 'autoRotateSpeed', 1, 10, 1)
        // 鼠标滚轮是否能缩放
        gui.add(_this.orbitControls, 'enableZoom')
        // 鼠标滚轮缩放速度 
        gui.add(_this.orbitControls, 'zoomSpeed')
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        this.scene.add(axesHelper, )
      },
      render () {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true
        })
        // 设置渲染器屏幕像素比 移动端解决像素问题
        renderer.setPixelRatio(window.devicePixelRatio || 1)
        // 设置渲染器大小
        renderer.setSize(this.width, this.height)
        // 执行渲染
        renderer.render(this.scene, this.camera)
        this.renderer = renderer
      },
      controls () {
        // 创建轨道控制器
        const orbitControls = new OrbitControls(this.camera, this.canvas)
        // 开启惯性
        orbitControls.enableDamping = true;
        this.orbitControls = orbitControls
        console.log(orbitControls);

        // 拖拽控制器
        const dragControls = new DragControls([this.mesh], this.camera, this.canvas)

        // 开启事件监听
        dragControls.addEventListener('dragstart', ()=>{
          // 拖拽开始事件
          orbitControls.enabled = false
        })
        dragControls.addEventListener('dragend',()=>{
          // 拖拽结束
          orbitControls.enabled = true
        })
      },
      tick () {
        // 更新
        this.orbitControls.update()

        this.renderer.render(this.scene, this.camera)
        window.requestAnimationFrame(()=> this.tick())
      },
      fitView () {
        // 监听窗口大小变化
        window.addEventListener('resize', () =>{
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight)
        }, false)
      },
      init () {
        this.createScene()
        this.createLights()
        this.createObjects()
        this.createCamera()
        this.helpers()
        this.render()
        this.controls()
        this.tick()
        this.fitView()
        this.datGui()
      }
    }

    $.init();
  }, []);

  return <>
    start your project
    <canvas id="c" />;
  </>
};

export default Page;
