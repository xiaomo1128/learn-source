import { useEffect } from 'react';
import * as THREE from 'three';
import vertShader from './star-shader/shader.vert';
import fragShader from './star-shader/shader.frag';
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

        // 添加雾，使远处物体显得模糊
        // scene.fog = new THREE.Fog(0x000000, 0, 20);
        this.scene = scene
      },
      // 生成两数之间的随机数
      random: (min, max) => min + Math.random() * (max - min),
      createGeometry (numbers) {
        const geometry = new THREE.BufferGeometry()
        const position = new Float32Array(numbers * 3)

        // 创建顶点
        for ( let i = 0; i < numbers; i++) { 
          position[i * 3] = Math.sin(i);
          position[i * 3 + 1] = Math.cos(i);
          position[i * 3 + 2] = this.random(-50, 0); //随机数
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
        geometry.computeBoundingSphere()

        return geometry;
      },
      // 创建立方体对象
      createObjects (numbers = 10000) {
        // 星星纹理
        const texture = new THREE.TextureLoader().load('/src/assets/textures/star.png')
        // webgl默认雪花粒子都是相同的层级，会互相遮挡，出现小黑块

        const material = new THREE.ShaderMaterial({ 
          // const material = new THREE.PointsMaterial({ 
          // size: 0.2,
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
            color: {
              value: new THREE.Color(0xffffff)
            },
            pointTexture: {
              value: texture
            },
            fogColor: { value: new THREE.Color(0x000000) },
            fogNear: { value: 0 },
            fogFar: { value: 20 },
          },
        })

        const point = new THREE.Points(this.createGeometry(numbers), material)

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
        watcherCamera.position.set(0, 0, 0)
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

        gui.add(_this.params, 'particles', 1, 5000, 1).name('粒子数量').onChange(val => {
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
        const point = this.scene.children.find(x => x.type === 'Points')
        const { attributes: attrs } = point.geometry;
        
        point.rotation.z += 0.01;

        for( let i = 0; i < attrs.position.array.length; i++ ) {
          if (i % 3 === 2) {
            // 判断当前粒子是否在相机后面
            const z = attrs.position.array[i];
            const distance = z - this.camera.position.z;
            if ( distance >= 0) {
              attrs.position.array[i] = -50 + Math.random() * 2;
            }

            // 移动粒子z轴坐标
            attrs.position.array[i] += 0.05;
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
