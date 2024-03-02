import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras';
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
        // 创建立方体的几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        // 创建立方体材质
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
        })
        // 创建3D物体对象
        const mesh = new THREE.Mesh(geometry, material);
        // const mesh1 = new THREE.Mesh(geometry, material);
        mesh.geometry.computeBoundingBox();

        // mesh1.position.set(-10, 0, 0);
        this.scene.add(mesh,)
        this.mesh = mesh;
      },
      createCamera () {
        const pCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10)

        pCamera.position.set(0, 0, 10)
        pCamera.lookAt(this.scene.position)
        this.scene.add(pCamera)
        this.pCamera = pCamera;
        this.camera = pCamera;

        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(2, 2, 20)
        // 设置相机朝向
        watcherCamera.lookAt(this.scene.position)
        // 将相机添加到场景中
        this.watcherCamera = watcherCamera
        this.camera = watcherCamera
        // this.scene.add(watcherCamera)
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
      },
      // 绘制心形
      curveGenerator () {
        const curve = new HeartCurve(1)
        // 管道缓冲几何体
        const tubeGeometry = new THREE.TubeGeometry(curve, 200, 0.01, 8, true)
        const material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
        })
        const tubeMesh = new THREE.Mesh(tubeGeometry, material)
        // 绕xz轴旋转90度
        tubeMesh.rotation.x = -Math.PI / 2

        // 把曲线分割成3000段
        this.points = curve.getPoints(3000)
        this.scene.add(tubeMesh)
        this.curve = curve;

        // 球体
        const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 64)
        const sphereMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
        })
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
        // 球体位置
        sphereMesh.position.copy(this.pCamera.position)
        this.sphereMesh = sphereMesh;
        
        this.scene.add(sphereMesh);
      },
      datGui () {
        const _this = this;
        const gui = new dat.GUI();
        const params = {
          color: 0x1890ff,
          wireframe: false,
          switchCamera() {
            // 销毁旧的控制器
            _this.orbitControls.dispose()
            if ( _this.cameraIndex === 0 ) {
              _this.camera = _this.watcherCamera;
              _this.cameraIndex = 1;
            } else {
              _this.camera = _this.pCamera;
              _this.cameraIndex = 0
            }
            _this.obtitControls = new OrbitControls(_this.camera, _this.canvas)
          },
        }

        gui.add(this.camera.position, 'x', 0.1, 100, 0.1).name('positionX')
        gui.add(this.camera, 'near', 0.01, 10, 0.01).onChange(val => {
          this.camera.near = val
          this.camera.updateProjectionMatrix();
          // this.frustumResult()
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
      count: 0, // 当前点的索引
      moveCamera () {
        const index = this.count % this.points.length;
        const point = this.points[index]
        const nextPoint = this.points[index + 1 >= this.points.length ? 0 : index + 1]

        this.pCamera.position.set(point.x, 0, -point.y)
        // 让人眼视角沿着路径观察，即 曲线上的切线
        this.pCamera.lookAt(nextPoint.x, 0, -nextPoint.y)
        this.sphereMesh.position.set(point.x, 0, -point.y)
        this.count++
      },
      tick () {
        // this.mesh.rotation.y += 0.01
        // 更新
        this.orbitControls.update()
        this.moveCamera()
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
        this.curveGenerator()
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
