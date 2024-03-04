import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

const Page = () => {
  useEffect(() => {
    const $ = {
      cameraIndex: 0,
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
        // 创建线性平面
        const geometry = new THREE.BufferGeometry()
        const vertices = new Float32Array([
          // 表示由6个顶点
          -1.0, -1.0, 1.0, //0
          1.0, -1.0, 1.0, //1
          1.0, 1.0, 1.0, //2

          1.0, 1.0, 1.0, //3
          -1.0, 1.0, 1.0, //4
          -1.0, -1.0, 1.0, //5
        ])
        
        const index = new Uint16Array([
          0, 1, 2, 
          3, 4, 5,
          0, 2, 
        ])

        geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3))
        geometry.index = new THREE.BufferAttribute( index, 1)
        const material = new THREE.MeshBasicMaterial({
          color: 0x1890ff,
          side: THREE.DoubleSide, // 渲染双面, 平面物体看不到背面问题
        })
        const line = new THREE.Line(geometry, material)

        // 创建平面
        const planeGeometry = new THREE.PlaneGeometry(1, 1, 1)
        const plane = new THREE.Mesh(planeGeometry, material)
        // 通过mesh对象实现旋转
        plane.rotation.x = -Math.PI / 2
        // 位移
        plane.position.y = -0.5
        // 缩放
        plane.scale.x = 0.5

        // 创建立方体
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
        const box = new THREE.Mesh(boxGeometry, material)
        // 位移
        box.position.x = -2;

        // 创建圆锥体
        const coneGeometry = new THREE.ConeGeometry(1, 2, 32)
        const cone = new THREE.Mesh(coneGeometry, material)

        // 位移
        cone.position.x = 2;

        // 创建圆柱体
        const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 32)
        const cylinder = new THREE.Mesh(cylinderGeometry, material)

        // 位移
        cylinder.position.x = 4;

        this.scene.add( line, plane, box, cone, cylinder )
      },
      createCamera () {
        const pCamera = new THREE.PerspectiveCamera(80, this.width / this.height, 1, 1000)

        pCamera.position.set(0, 0, 5)
        pCamera.lookAt(this.scene.position)
        this.scene.add(pCamera)
        this.pCamera = pCamera;
        this.camera = pCamera;

        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(120, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(2, 2, 6)
        // 设置相机朝向
        watcherCamera.lookAt(this.scene.position)
        // 将相机添加到场景中
        this.watcherCamera = watcherCamera
        // this.camera = watcherCamera
        this.scene.add(watcherCamera)
      },
      // 判断是否在视锥体内
      frustumResult () {
        // 通过camera计算视锥
        const frustum = new THREE.Frustum()
        // 更新以保证拿到最终结果
        this.pCamera.updateProjectionMatrix()
        frustum.setFromProjectionMatrix(
          // 得到视锥体的矩阵
          new THREE.Matrix4().multiplyMatrices(
            this.pCamera.projectionMatrix,
            this.pCamera.matrixWorldInverse,
          )
        )

        const result = frustum.intersectsBox(this.mesh.geometry.boundingBox)
        console.log(result);  // true false 
      },
      datGui () {
        const _this = this;
        const gui = new dat.GUI();
        const params = {
          color: 0x1890ff,
          wireframe: false,
          switchCamera() {
            if ( _this.cameraIndex === 0 ) {
              _this.camera = _this.watcherCamera;
              _this.cameraIndex = 1;
            } else {
              _this.camera = _this.pCamera;
              _this.cameraIndex = 0
            }
          },
        }

        gui.add(this.camera.position, 'x', 0.1, 100, 0.1).name('positionX')
        gui.add(this.camera, 'near', 0.01, 10, 0.01).onChange(val => {
          this.camera.near = val
          this.camera.updateProjectionMatrix();
          this.frustumResult()
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
        gui.add(this.camera, 'fov', 40, 150, 1).onChange(val => {
          this.camera.fov = val;
          this.camera.updateProjectionMatrix();
        })
        gui.add(params, 'switchCamera');
        // 颜色
        gui.addColor(params, 'color').onChange(val => {
          _this.mesh.material.color.set(val)
        })
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        // 相机辅助 观察正交相机
        const cameraHelper = new THREE.CameraHelper(this.pCamera)
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
        // this.mesh.rotation.y += 0.01
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
