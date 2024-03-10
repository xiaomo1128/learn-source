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
        const ambient = new THREE.AmbientLight(0xffffff,) // 环境光
        const directional = new THREE.DirectionalLight(0xffffff,) // 方向光
        directional.position.set(5, 5, 2)

        scene.add(ambient, directional)
        this.scene = scene
      },
      // 创建立方体对象
      createObjects () {
        const texture = new THREE.TextureLoader().load('/src/assets/textures/1.jpg')

        texture.colorSpace = THREE.SRGBColorSpace; // 开启空间色彩管理

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(4, 4, 4),
          new THREE.MeshLambertMaterial({
            map: texture,
          })
        )
        box.position.y = 1;

        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(4, 4, 4),
          new THREE.MeshLambertMaterial({
            color: 0x1890ff,
            map: texture,
          })
        )
        cube.position.y = 1
        cube.position.x = -5

        // 地板
        const groud = new THREE.Mesh(
          new THREE.PlaneGeometry(100, 100), 
          new THREE.MeshLambertMaterial({
            color: 0xdce776,
          })
        )
        groud.rotation.x = -Math.PI / 2;
        groud.position.y = -1.02;

        this.box = box;
        this.cube = cube;
        this.scene.add(box, groud, cube);
      },
      createCamera () {
        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(4, 14, 10)
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
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();

        const gridHelper = new THREE.GridHelper(20, 20, 0xf0f0f0)
        gridHelper.position.y = -1.01
        
        this.scene.add(axesHelper, gridHelper, )
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
        // 拖拽控制器
        const dragControls = new DragControls([this.box], this.camera, this.canvas)

        // 创建轨道控制器
        const orbitControls = new OrbitControls(this.camera, this.canvas)
        // 开启惯性
        orbitControls.enableDamping = true;
        this.orbitControls = orbitControls

        // 拖拽与轨道同时开启有冲突
        dragControls.addEventListener('dragstart', e => {
          orbitControls.enabled = false
        })
        dragControls.addEventListener('dragend', e => {
          orbitControls.enabled = true
        })
      },
      pointer: new THREE.Vector2(-1000, -1000), // 参数给大，防止自动触发Raycaster射线
      flag: false, // 是否碰撞
      speedX: 0.05, // 运动速度
      tick () {
        // 网格中心
        const centerCoord = this.box.position.clone() // clone方法不会影响原物体本身
        // 顶点坐标
        const { position } = this.box.geometry.attributes;
        // 转换成顶点的三维坐标，position转为顶点向量
        const vertices = []

        for (let i = 0; i < position.count; i++) {
          vertices.push(new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i)))
        }

        // 四阶矩阵作用；物体在世界坐标中，会进行旋转、位移等，使用四阶矩阵后，可获取到网格在世界坐标下变化后的新坐标
        for (let i = 0; i < vertices.length; i++) {
          // 向量 = 获取网格在应用变换后的世界坐标
          const worldCoord = vertices[i].clone().applyMatrix4(this.box.matrixWorld)

          // 距离 = 获取由中心->顶点的向量
          const dir = worldCoord.clone().sub(centerCoord)

          // 发起射线
          const raycaster = new THREE.Raycaster(centerCoord, dir.clone().normalize())

          // 判断该射线，是否与物体相交，获取交互物体
          const intersects = raycaster.intersectObjects([this.cube], true)
          if ( intersects.length ) {
            const cube = intersects[0].object

            if ( intersects[0].distance <= dir.length() ) {
              cube.material.opacity = 0.5
              cube.material.transparent = true;
              this.flag = true // 碰撞
            } else {
              cube.material.opacity = 1
            }
            cube.material.needsUpdate = true;
          }
        }

        if(this.flag) {
          this.box.position.x += this.speedX;
        } else {
          this.box.position.x -= this.speedX;
        }

        if(this.box.position.x >= 5) {
          this.flag = false
        }

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
        this.createObjects()
        this.createCamera()
        this.helpers()
        this.render()
        this.controls()
        this.datGui()
        this.tick()
        this.fitView()
      }
    }

    $.init();
  }, []);

  return <>
    <canvas id="c" />;
  </>
};

export default Page;
