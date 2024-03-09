import { useEffect } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
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
        scene.background = new THREE.Color(0xf0f0f0)
        this.scene = scene
      },
      // 创建光照
      createLights () {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95)
        ambientLight.visible = false // 关闭

        // 方向光
        const dirLight = new THREE.DirectionalLight(0xffffaa, 0.95)
        dirLight.position.set(0, 3, 1.5)
        dirLight.castShadow = true // 让方向光产生阴影
        dirLight.visible = false // 关闭

        // 方向光辅助工具
        const dirHelper = new THREE.DirectionalLightHelper(dirLight, 3)

        // 点光源
        const pointLight1 = new THREE.PointLight(0xf3ae3d, 0.8)
        const pointLight2 = new THREE.PointLight(0xa1fc8f, 0.8)

        // 光源位置默认在原点
        pointLight1.position.set(-1, 1, 2)
        pointLight2.position.set(1, 1, 2)
        // 开启阴影
        pointLight1.castShadow = true
        pointLight2.castShadow = true

        // 创建小球标示光源位置
        const sphere1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 64, 64),
          new THREE.MeshBasicMaterial({
            color: 0xf3ae3d,
          })
        );
        const sphere2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 64, 64),
          new THREE.MeshBasicMaterial({
            color: 0xa1fc8f,
          })
        );
        sphere1.position.copy(pointLight1.position)
        sphere2.position.copy(pointLight2.position)
        
        this.scene.add(ambientLight, dirLight, dirHelper,sphere1, sphere2, pointLight1, pointLight2, )
        this.ambientLight = ambientLight
        this.dirLight = dirLight
        this.dirHelper = dirHelper
        this.pointLight1 = pointLight1
        this.pointLight2 = pointLight2
        this.sphere1 = sphere1
        this.sphere2 = sphere2
      },
      // 纹理
      loadTextures () {
        // -----------------方法一
        // const img = new Image()
        // // 创建纹理
        // const texture = new THREE.Texture(img)

        // img.onload = function () {
        //   console.log(texture);
        //   // 更新纹理
        //   texture.needsUpdate = true
        // }
        // img.src = '/src/assets/textures/Wood_Ceiling_Coffers_003_basecolor.Cu38ry6v.jpg';
        // this.texture = texture;

        // ------------------方法二
        // setCrossOrigin('anonymous') 跨域方法
        // const textLoader = new THREE.TextureLoader()
        // this.texture =  textLoader.setCrossOrigin('anonymous').load(
        //   // this.texture =  textLoader.load(
        //   // 'https://3dbooks.netlify.app/assets/Wood_Ceiling_Coffers_003_basecolor.Cu38ry6v.jpg',
        //   '/src/assets/textures/Wood_Ceiling_Coffers_003_basecolor.Cu38ry6v.jpg',
        //   // onLoad回调
        //   function (texture) {},
        //   null,
        //   // onError回调
        //   (error) => {
        //     console.log('error', error);
        //   }
        // )

        // --------------------方法三
        const manager = new THREE.LoadingManager()
        manager.onStart = function( url, itemsLoaded, itemsTotal) {
          console.log( 'Start loading file: '+url +'.\nLoaded' + itemsLoaded+'of '+ itemsTotal+'files.');
        }

        manager.onLoad = function() {
          console.log('Loading complete !');
        }

        manager.onProgress = function( url, itemsLoaded, itemsTotal ){
          console.log('Loading file: '+ url+ '.\Loaded ' +itemsLoaded+ ' of '+itemsTotal+' files. ');
        }

        manager.onError = (url) =>{
          console.log('There was an error loading '+ url);
        }
        
        const textureLoader = new THREE.TextureLoader(manager)
        this.textureLoader = textureLoader
      },
      // 创建立方体对象
      createObjects () {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshLambertMaterial({
            color: 0x1890ff
          })
        )
        const geometry = new THREE.PlaneGeometry(10000, 10000)
        const material = new THREE.MeshLambertMaterial({
          side: THREE.DoubleSide
        })
        const floor = new THREE.Mesh(geometry, material)
        const wall = new THREE.Mesh(geometry, material)

        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1
        wall.position.y = 4
        wall.position.z = -5

        this.dirLight.target = box // 方向光照向物体
        box.castShadow = true // 物体产生阴影
        floor.receiveShadow = true // 地面接收阴影
        wall.receiveShadow = true // 墙面接收阴影

        this.scene.add(box, floor, wall)
        this.box = box
      },
      createCamera () {
        const size = 4;
        // 创建正交相机
        const orthoCamera = new THREE.OrthographicCamera(-size, size, size / 2, -size / 2, 0.1, 10);
        // 相机位置
        orthoCamera.position.set(0, 1, 3)
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
        watcherCamera.position.set(-4, 2, 6)
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

        const ambientFolder = gui.addFolder('环境光')
        ambientFolder.add(_this.ambientLight, 'intensity', 0, 1, 0.1).name('环境光强度')
        ambientFolder.add(_this.ambientLight, 'visible').name('环境光可见性')
        ambientFolder.addColor({ color: 0xffffff }, 'color').onChange(val =>{
          _this.ambientLight.color = new THREE.Color(val)
        })
        // ambientFolder.open()

        const dirLightFolder = gui.addFolder('方向光')
        dirLightFolder.add(_this.dirLight, 'intensity',  0, 1, 0.1)
        dirLightFolder.add(_this.dirLight, 'visible')
        dirLightFolder.add(_this.dirLight.position, 'x', -20, 20, 0.1)
        dirLightFolder.add(_this.dirLight.position, 'y', -20, 20, 0.1)
        dirLightFolder.add(_this.dirLight.position, 'z', -20, 20, 0.1)
        // dirLightFolder.open()

        const boxFolder = gui.addFolder('box')
        boxFolder.add(_this.box.position, 'x', -20, 20, 0.1).onChange(val =>{
          _this.dirHelper.update()
        })
        boxFolder.add(_this.box.position, 'y', -20, 20, 0.1).onChange(val =>{
          _this.dirHelper.update()
        })
        boxFolder.add(_this.box.position, 'z', -20, 20, 0.1).onChange(val =>{
          _this.dirHelper.update()
        })
        boxFolder.open()

        const pointsFolder = gui.addFolder('点光源')
        pointsFolder.add(_this.pointLight1, 'intensity', 0, 1, 0.1).name('P1光照强度')
        pointsFolder.add(_this.pointLight1, 'distance', 0, 20, 0.1).name('P1照射距离')
        pointsFolder.add(_this.pointLight1, 'decay', 0, 20, 0.1).name('P1衰减率')
        pointsFolder.add(_this.pointLight1.position, 'x', -20, 20, 0.1).onChange(val => {
          _this.sphere1.position.x = val
        })
        pointsFolder.add(_this.pointLight1.position, 'y', -20, 20, 0.1).onChange(val => {
          _this.sphere1.position.y = val
        })
        pointsFolder.add(_this.pointLight1.position, 'z', -20, 20, 0.1).onChange(val => {
          _this.sphere1.position.z = val
        })
        pointsFolder.add(_this.pointLight2, 'intensity', 0, 1, 0.1).name('P2光照强度')
        pointsFolder.add(_this.pointLight2, 'distance', 0, 20, 0.1).name('P2照射距离')
        pointsFolder.add(_this.pointLight2, 'decay', 0, 20, 0.1).name('P2衰减率')
        pointsFolder.add(_this.pointLight2.position, 'x', -20, 20, 0.1).onChange(val => {
          _this.sphere2.position.x = val
        })
        pointsFolder.add(_this.pointLight2.position, 'y', -20, 20, 0.1).onChange(val => {
          _this.sphere2.position.y = val
        })
        pointsFolder.add(_this.pointLight2.position, 'z', -20, 20, 0.1).onChange(val => {
          _this.sphere2.position.z = val
        })
        pointsFolder.open()
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();

        const gridHelper = new THREE.GridHelper(20, 20, 0xf0f0f0)
        gridHelper.position.y = -1
        
        this.scene.add(axesHelper, gridHelper)
      },
      render () {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true
        })
        renderer.shadowMap.enabled = true;
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
        // 让点光源运动
        const elapsedTime = this.clock.getElapsedTime()
        this.pointLight1.position.x = Math.sin(elapsedTime)
        this.pointLight1.position.z = Math.cos(elapsedTime)
        this.sphere1.position.copy(this.pointLight1.position)

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
        this.createLights()
        this.loadTextures()
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
    <canvas id="c" />;
  </>
};

export default Page;
