import { useEffect } from 'react';
import * as THREE from 'three';
import vertShader from './star-shader/shader.vert';
import fragShader from './star-shader/shader.frag';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
      createMeshes(matcapTexture) {
        const geometry = new THREE.TorusGeometry(
          Math.random() * 2,
          Math.abs(Math.random() - 0.5), // [0 - 0.5)
          64
        );
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshMatcapMaterial({
            color: 0xffffff,
            matcap: matcapTexture,
          }),
        )

        mesh.position.x = (Math.random() - 0.5) * 50;
        mesh.position.y = (Math.random() - 0.5) * 50;
        mesh.position.z = (Math.random() - 0.5) * 50;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        mesh.scale.x = Math.random() * 0.3 + 0.5;
        mesh.scale.y = Math.random() * 0.3 + 0.5;
        mesh.scale.z = Math.random() * 0.3 + 0.5;

        mesh.name = 'torus-mesh';
        this.scene.add(mesh);
      },
      // 创建立方体对象
      createObjects () {
        const textureLoader = new THREE.TextureLoader()
        const matcapTexture = textureLoader.load('/src/assets/textures/matcap.jpg')

        matcapTexture.colorSpace = THREE.SRGBColorSpace; // 开启空间色彩管理

        for ( let i = 0; i < 300; i++ ) {
          this.createMeshes(matcapTexture)
        }
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({
            color: 0x1890ff,
          })
        )
        box.position.x = -3;
        gsap.to(
          box.position, // 变化的属性
          {
            duration: 4, // 动画时常
            repeat: -1, // 动画循环次数，-1是无限循环
            x: 4, // 移动到这个位置
          }
        )

        const sphere = new THREE.SphereGeometry(1);
        const sphereMaterial = new THREE.MeshBasicMaterial({
          color: 0x1890ff,
        })
        const sphereMesh = new THREE.Mesh(sphere, sphereMaterial)

        sphereMesh.position.x = 3;

        this.box = box;
        this.scene.add(box);
      },
      createCamera () {
        // 透视相机 第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(0, 2, 5)
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
      // 射线
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(-1000, -1000), // 参数给大，防止自动触发Raycaster射线
      currentIntersect: null, // 当前交互对象
      tick () {
        // 更新射线
        this.raycaster.setFromCamera(this.pointer, this.camera);
        // 获取场景中，所有与鼠标交互的物体
        const objects = this.raycaster.intersectObjects([this.scene.children])

        const target = objects[0]?.object; // 与鼠标交互的第一个物体对象
        if (target) {
          if (!this.currentIntersect) {
            this.currentIntersect = target;
          } 
        } else {
          if (this.currentIntersect) {
            this.currentIntersect = null;
          }
        }

        // if (target?.name === 'torus-mesh') {
        //   target.material.transparent = true; // 开启透明度
        //   target.material.needsUpdate = true; // 更新
        //   target.material.opacity = 0.5;
        // }

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

        // 先触发pointer的更新，点击时，物体的透明度就会变化了
        window.addEventListener('mousemove', (e) => {
          this.pointer.x = e.clientX / window.innerWidth * 2 - 1; // -1 ~ 1
          this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; // -1 ~ 1
        })

        // click 事件未生效，是由于 AxesHelper 对象做了更新拦截
        window.addEventListener('pointerdown', (e) => {
          // this.pointer.x = e.clientX / window.innerWidth * 2 - 1; // -1 ~ 1
          // this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; // -1 ~ 1

          if (this.currentIntersect) {
            const { material } = this.currentIntersect;
            
            if (material.opacity === 0.5) {
              material.opacity = 1;
            } else {
              material.opacity = 0.5;
            }
            
            material.transparent = true;
            material.needsUpdate = true;
          }
        })
      }
    }

    $.init();
  }, []);

  return <>
    <canvas id="c" />;
  </>
};

export default Page;
