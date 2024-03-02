import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
          wireframe: false,
          switchCamera () {
            console.log(this.camera);
            if (_this.camera.type === 'OrthographicCamera') {
              // 透视相机
              _this.camera = _this.watcherCamera;
              // 轨道控制器启用 消除切换之间的干扰
              _this.orbitControls.enabled = true;
            } else {
              _this.camera = _this.orthoCamera;
              _this.orbitControls.enabled = false;
            }
          },
        }

        gui.add(this.camera.position, 'x', 0.1, 100, 0.1).name('positionX')
        gui.add(this.camera.rotation, 'x', 0.1, 100, 0.1).name('rotationX')
        gui.add(this.camera, 'near', 0.01, 10, 0.01).onChange(val => {
          this.camera.near = val
          this.camera.updateProjectionMatrix();
        })
        gui.add(this.camera, 'far', 1, 100, 1).onChange(val => {
          this.camera.far = val
          this.camera.updateProjectionMatrix();
        })
        // 缩放
        gui.add(this.camera, 'zoom', 0.1, 10, 0.1).onChange(val => {
          this.camera.zoom = val
          this.camera.updateProjectionMatrix();
        })
        // 透视线框
        gui.add(params, 'wireframe').onChange(val => {
          this.mesh.material.wireframe = val;
        })
        // 相机切换
        gui.add(params, 'switchCamera');
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
        // 开启惯性
        orbitControls.enableDamping = true;
        this.orbitControls = orbitControls
      },
      tick () {
        this.mesh.rotation.y += 0.01
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
