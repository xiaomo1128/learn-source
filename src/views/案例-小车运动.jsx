import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
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
        // 创建几何体
        const carGeometry = new THREE.BoxGeometry(2, 0.2, 1)

        // 创建立方体材质
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
        })
        // 创建3D物体对象
        const car = new THREE.Mesh(carGeometry, material);

        // 车轮
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10)
        const wheelMaterial = new THREE.MeshBasicMaterial({
          color: 0xff00ff,
        })
        const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial)
        const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial)
        const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial)
        const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial)

        wheel1.name = 'wheel'
        wheel2.name = 'wheel'
        wheel3.name = 'wheel'
        wheel4.name = 'wheel'
        wheel1.rotation.x = -Math.PI / 2;
        wheel1.position.set(-0.5, 0, 0.4)
        wheel2.rotation.x = -Math.PI / 2;
        wheel2.position.set(-0.5, 0, -0.4)
        wheel3.rotation.x = -Math.PI / 2;
        wheel3.position.set(0.5, 0, -0.4)
        wheel4.rotation.x = -Math.PI / 2;
        wheel4.position.set(0.5, 0, 0.4)

        // 车前小灯
        const lightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
        const lightMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
        })
        const light1 = new THREE.Mesh(lightGeometry, lightMaterial)
        const light2 = new THREE.Mesh(lightGeometry, lightMaterial)
        light1.position.set(-1.05, 0, 0.2)
        light2.position.set(-1.05, 0, -0.2)

        // 封装小车整体
        const group = new THREE.Group()
        group.add(car, wheel1, wheel2, wheel3, wheel4, light1, light2)
        group.position.y = 0.2
        this.group = group

        // 合并几何体
        const geometry = mergeBufferGeometries([
          carGeometry, wheelGeometry
        ])
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = -1;

        this.scene.add(group, mesh)
        this.mesh = car;
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
        watcherCamera.position.set(-2, 2, 4)
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

        // 是否开启轨道控制器
        gui.add(_this.orbitControls, 'enabled')
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        // 网格平面
        const gridHelper = new THREE.GridHelper(30, 10, 0xcd37aa, 0x4a4a4a)

        this.scene.add(axesHelper, gridHelper)
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
      // 让车动起来
      runCar () {
        const { children } = this.group
        // 车轮周长 / 360度 = 转速
        // 转速 * 角度 = 角速度
        const delta = 4; // 每帧车轮转动4度
        const speed = ( 2 * Math.PI * 0.2) / 360 * delta;

        for ( const i in children ) {
          const mesh = children[i]
          if (mesh.name === 'wheel') {
            // 车轮转动的角度
            mesh.rotation.y += THREE.MathUtils.radToDeg(delta);
          }
        }
        // 行进速度
        this.group.position.x -= speed;

        if (this.group.position.x < -10) {
          this.group.position.x = 10;
        }
      },
      tick () {
        // 更新
        this.orbitControls.update()
        this.runCar()

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
