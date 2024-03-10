import { useEffect } from 'react';
import * as THREE from 'three';
import vertShader from './snowflack-shader/shader.vert';
import fragShader from './snowflack-shader/shader.frag';
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
      createGeometry (numbers) {
        const geometry = new THREE.BufferGeometry()
        const position = new Float32Array(numbers * 3)
        const colors = new Float32Array(numbers * 3)
        const size = new Float32Array(numbers) 
        const opacity = new Float32Array(numbers)
        const speed = new Float32Array(numbers) // 每个粒子运动的初始速度
        const delta = new Float32Array(numbers)

        // 创建顶点
        for ( let i = 0; i < numbers; i++) { 
          const x = Math.random()
          const y = Math.random()
          const z = Math.random()

          position[i * 3] = x * 60 - 30;
          position[i * 3 + 1] = y * 60 - 30;
          position[i * 3 + 2] = z * 60 - 30;

          colors[i * 3] = x;
          colors[i * 3 + 1] = y;
          colors[i * 3 + 2] = z;

          size[i] * Math.random() // 随机的大小
          opacity[i] * Math.random() // 透明度随机
          speed[i] * Math.random() // 初始速度随机
          delta[i] * Math.random() // 初始速度随机
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute('size', new THREE.BufferAttribute(size, 1))
        // 透明度的修改是自定义属性，默认属性无法修改
        geometry.setAttribute('alpha', new THREE.BufferAttribute(opacity, 1)) 
        geometry.setAttribute('speed', new THREE.BufferAttribute(speed, 1)) 
        geometry.setAttribute('delta', new THREE.BufferAttribute(delta, 1)) 
        geometry.computeBoundingSphere()

        return geometry;
      },
      // 创建立方体对象
      createObjects (numbers = 10000) {
        // 雪花纹理
        const texture = new THREE.TextureLoader().load('/src/assets/textures/snowflake.png')
        // webgl默认雪花粒子都是相同的层级，会互相遮挡，出现小黑块

        const material = new THREE.ShaderMaterial({ 
          // const material = new THREE.PointsMaterial({ 
          // size: 0.5,
          vertexColors: true, // 是否使用顶点着色，默认是false
          vertexShader: vertShader,
          fragmentShader: fragShader,
          transparent: true,
          depthTest: true, // 深度测试 默认是true
          // webgl渲染时，会检测当前物体的深度 与之前渲染物体的深度 进行对比，已渲染的物体会存在depthBuffer中。depthWrite: false，即 发现更近的粒子不要写入depthBuffer中
          depthWrite: false, // 默认是true，材质是否对深度缓冲区有影响 解决物体表面有许多粒子存在
          // map: texture,
          blending: THREE.AdditiveBlending, // 混合模式，Material对象中属性
          // 通过uniforms，向shader传递数据
          uniforms: {
            pointTexture: {
              value: texture,
            }
          },
        })

        const point = new THREE.Points(this.createGeometry(numbers), material)
        // 问题：出现雪花纹理都在box的前面，是由于关闭深度测试depthTest导致的
        // const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 1))

        this.scene.add(point, )
        this.point = point
      },
      params: {
        particles: 1000,
        vertexColors: true,
      },
      createCamera () {
        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(5, 5, 80)
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

        gui.add(_this.params, 'vertexColors').name('顶点着色').onChange(val => {
          _this.point.material.vertexColors = val
          _this.point.material.needsUpdate = true
        })

        gui.add(_this.params, 'particles', 1, 50000, 1).name('粒子数量').onChange(val => {
          // 先销毁旧的粒子
          const point = _this.scene.children.find(child => child.isPoints)

          point.removeFromParent() // 销毁point对象

          // 新的粒子系统
          _this.createObjects(val)
        })

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
        const point = this.scene.children.find(x => x.isPoints)
        const { attributes: attrs } = point.geometry;
        const position = attrs.position.array;
        const speed = attrs.speed.array;
        const delta = attrs.speed.array;

        for ( let i = 0; i < position.length; i++ ) {
          // 更新x坐标
          position[i * 3] += speed[i] / 30;
          // 更新y坐标
          position[i * 3 + 1] -= speed[i] / 20 / delta[i] + delta[i] / 40;

          if ( position[i * 3] >= 50 ) {
            position[i * 3] = Math.random() * 60 - 40;
            position[i * 3 + 1] = Math.random() * 60 + 30;
          }

          if ( position[i * 3 + 1] <= -30 ) {
            position[i * 3 + 1] = Math.random() * 60 + 60;
          }
        }
        attrs.position.needsUpdate = true;

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
        this.createObjects(this.params.particles)
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
