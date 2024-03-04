import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as dat from 'dat.gui';
import gsap from 'gsap';

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
        // 创建几何体
        // const geometry = new THREE.BoxGeometry(1, 1, 1)
        // 球体
        const sphereGeometry = new THREE.SphereGeometry(1, 16, 16)

        // 创建立方体材质
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
        })
        // 创建3D物体对象
        const mesh = new THREE.Mesh(sphereGeometry, material);

        this.scene.add(mesh)
        this.mesh = mesh;
      },
      createCamera () {
        const size = 4;
        // 创建正交相机
        const orthoCamera = new THREE.OrthographicCamera(-size, size, size / 2, -size / 2, 0.1, 10);
        // 相机位置
        orthoCamera.position.set(2, 2, 3)
        // 设置相机朝向
        orthoCamera.lookAt(this.scene.position)
        // 相机添加场景中
        this.scene.add(orthoCamera)
        this.orthoCamera = orthoCamera
        // this.camera = orthoCamera
        // console.log(orthoCamera);

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
        const params = {
          widthSegments: _this.mesh.geometry.parameters.widthSegments, 
          heightSegments: _this.mesh.geometry.parameters.heightSegments, 
          generateGeometry () {
            // 删除旧的球体
            _this.mesh.geometry.dispose()
            // 生成新的球体
            const geometry = new THREE.SphereGeometry(1, params.widthSegments, params.heightSegments)

            _this.mesh.geometry = geometry
          },
          // 旋转
          rotation () {
            // _this.mesh.rotation.x += 30
            // 添加动画效果
            gsap.to(_this.mesh.rotation, { duration: 1, delay: 0, x: _this.mesh.rotation.x + Math.PI })
          },
          x: 0,
        }

        // 是否开启轨道控制器
        gui.add(_this.orbitControls, 'enabled')
        // mesh的可见
        gui.add(_this.mesh, 'visible')
        // 物体的线框
        gui.add(_this.mesh.material, 'wireframe')

        // 调试球体
        gui.add(params, 'widthSegments', 3, 100, 1).onChange(val => {
          params.widthSegments = val
          params.generateGeometry()
        })
        gui.add(params, 'heightSegments', 3, 100, 1).onChange(val => {
          params.heightSegments = val
          params.generateGeometry()
        })
        // 球体旋转
        gui.add(params, 'rotation')
        // 球体位移
        gui.add(_this.mesh.position, 'x', -3, 3, 0.1)
        gui.add(params, 'x', -3, 3, 0.1).name('translateX').onChange(val => {
          params.x = val;
          _this.mesh.geometry.translate(params.x, 0, 0)
          console.log(_this.mesh.position);
          console.log(_this.mesh.geometry);
        })
        // 球体缩放
        gui.add(_this.mesh.scale, 'x', 1, 3, 0.1).name('scaleX')
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        // 相机辅助 观察正交相机
        const cameraHelper = new THREE.CameraHelper(this.orthoCamera)
        this.cameraHelper = cameraHelper
        this.scene.add(axesHelper, cameraHelper)
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

        const dragControls = new DragControls([this.mesh], this.camera, this.canvas)

        orbitControls.enabled = false
        // 开启惯性
        orbitControls.enableDamping = true;
        this.orbitControls = orbitControls
        this.dragControls = dragControls
      },
      tick () {
        // 更新
        this.orbitControls.update()
        //相机辅助
        this.cameraHelper.update()

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
