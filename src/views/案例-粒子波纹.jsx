import { useEffect } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
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
      // 创建立方体对象
      createObjects () {
        const geometry = new THREE.BufferGeometry()
        const position = [] // 顶点位置
        const colors = [] // 颜色
        const color = new THREE.Color()

        // 生成所有顶点坐标+颜色值
        for ( let i = 0; i < 100; i++ ) {
          for ( let j = 0; j < 100; j++ ) {
            const x = i - 50
            const y = j - 50

            position.push(x, y, 0)
            color.setRGB(i / 100, j / 100, Math.random())
            colors.push(color.r, color.g, color.b)
          }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        geometry.computeBoundingSphere() // 包围盒的创建，不需要重新调用，避免问题出现

        const material = new THREE.PointsMaterial({
          // color: 0xffffff, 
          size: 0.1,
          vertexColors: true, // 是否使用顶点着色，默认是false
        })

        const point = new THREE.Points(geometry, material)
        point.rotation.x = -Math.PI / 3

        this.scene.add(point)
        this.point = point
      },
      createCamera () {
        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(5, 5, 25)
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
        // const axesHelper = new THREE.AxesHelper();

        // const gridHelper = new THREE.GridHelper(20, 20, 0xf0f0f0)
        // gridHelper.position.y = -1
        
        // this.scene.add(axesHelper, gridHelper, )
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
      clock: new THREE.Clock(),
      tick () {
        const elapsedTime = this.clock.getElapsedTime() * 2

        const { position } = this.point.geometry.attributes

        for ( let i = 0; i < position.count; i++ ) {
          const x = position.getX(i)
          const y = position.getY(i)
          const z = Math.sin(x * 0.5 + elapsedTime) * 0.5 + Math.cos(y * 0.5 + elapsedTime) * 0.5
          position.setXYZ(i, x, y, z)
        }
        position.needsUpdate = true
        this.point.rotation.z += 0.006

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
