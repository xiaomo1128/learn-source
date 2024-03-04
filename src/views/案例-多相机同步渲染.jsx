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
        // 正交相机 
        const frustumSize = 2 // 设置显示相机前方高为2的内容 视锥尺寸
        const aspect  = this.width / this.height
        const pCamera = new THREE.OrthographicCamera(-aspect*frustumSize, aspect*frustumSize, aspect, -aspect, 0.1, 1000)
        // 设置相机位置
        pCamera.position.set(1, 1, 2)
        // 设置相机朝向
        pCamera.lookAt(this.scene.position)
        // 将相机添加到场景中
        this.scene.add(pCamera)
        this.pCamera = pCamera
        this.camera = pCamera

        // 缩略图相机
        const thumbnailAspect = 150 / 200
        const thumbnailCamera = new THREE.OrthographicCamera(-thumbnailAspect*frustumSize, thumbnailAspect*frustumSize, thumbnailAspect, -thumbnailAspect, 0.1, 1000)
        // 位置
        thumbnailCamera.position.set(1, 1, 2)
        // 朝向
        thumbnailCamera.lookAt(this.scene.position)
        // 场景
        this.scene.add(thumbnailCamera)
        this.thumbnailCamera = thumbnailCamera
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
      // 全局裁剪
      clipScene(renderer) {
        const dpr = window.devicePixelRatio || 1

        // 裁剪
        renderer.setScissor(0, 0, this.width, this.height)
        // 背景色 透明度
        renderer.setClearColor(0x999999, 0.5)

        // 设置渲染器屏幕像素比 移动端解决像素问题
        renderer.setPixelRatio(dpr)
        // 设置渲染器大小
        // 调用setSize() 相当于使用了 setViewport(0, 0, this.width, this.height)
        renderer.setSize(this.width, this.height)
        // 执行渲染
        renderer.render(this.scene, this.camera)
      },
      // 裁剪缩略图
      clipThumbnail (renderer) {
        // 小窗口 w: 150  h: 200   margin: 10
        const w = this.width - 150 - 10

        // 更新位置
        this.thumbnailCamera.position.copy(this.camera.position)
        // 更新旋转 rotation = quaternion 物体触发旋转效果时，两个属性都会触发，仅用其一即可
        this.thumbnailCamera.rotation.copy(this.camera.rotation)
        // 更新四元数(更新旋转)
        // this.thumbnailCamera.quaternion.copy(this.camera.quaternion)
        // 更新缩放
        this.thumbnailCamera.zoom = this.camera.zoom
        // 更新相机矩阵
        this.thumbnailCamera.updateProjectionMatrix()

        renderer.setScissor(w, 20, 150, 200)
        // 设置原因：需要同步 全局裁剪 视口的变化
        renderer.setViewport(w, 20, 150, 200)
        // 背景色
        renderer.setClearColor(0x000000)

        //执行渲染
        renderer.render(this.scene, this.thumbnailCamera)
      },
      render () {
        // 创建渲染器
        if ( !this.renderer ) {
          // 避免重复
          this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
          })
        } 
        // 开启裁剪检测
        this.renderer.setScissorTest(true)

        // 全局裁剪
        this.clipScene(this.renderer)
        // 缩略图
        this.clipThumbnail(this.renderer)
      },
      controls () {
        // 创建轨道控制器
        const orbitControls = new OrbitControls(this.camera, this.canvas)
        // 开启惯性
        orbitControls.enableDamping = true;
        this.orbitControls = orbitControls

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

        this.render()
        // this.renderer.render(this.scene, this.camera)
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
        // this.datGui()
      }
    }

    $.init();
  }, []);

  return <>
    <canvas id="c" />;
  </>
};

export default Page;
