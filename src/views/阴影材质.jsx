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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)

        // 改变光照方向
        directionalLight.position.set(1, 2, 2)
        directionalLight.castShadow = true 
        directionalLight.shadow.camera.near = 0.1
        directionalLight.shadow.camera.far = 40
        directionalLight.shadow.radius = 1.5 // 越小越清晰
        directionalLight.shadow.mapSize.x = 1024; // mapSize 影响阴影模糊，越大越清晰
        directionalLight.shadow.mapSize.y = 1024

        this.scene.add(ambientLight, directionalLight);
        this.directionalLight = directionalLight
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
        // 阴影材质特性：只有在有阴影的地方，才不是透明的，其他全是透明的
        // 生成阴影机制： 1. 物体castShadow属性产生阴影 2. 平面receiveShadow属性接收阴影（默认不开启） 3. 让平行光照castShadow属性产生阴影 4. render中开启shadowMap属性
        const floorTexture = this.textureLoader.load('/src/assets/textures/6.jpg')
        const wallTexture = this.textureLoader.load('/src/assets/textures/2.jpg')

        this.floorTexture = floorTexture
        this.wallTexture = wallTexture

        // 在展示阴影中，两个平面会重叠
        const material = new THREE.ShadowMaterial({
          opacity: 1,
          polygonOffset: true, // 开启多边形偏移
          polygonOffsetFactor: -1,// 多边形偏移系数，默认值是0
        }) 

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({
            color: 0x1890ff,
          })
        )

        // 平面阴影
        const planeShadow = new THREE.Mesh(
          new THREE.PlaneGeometry(10, 10),
          material
        )
        // 地板
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(10, 10),
          new THREE.MeshBasicMaterial({
            map: floorTexture,
          })
        )

        // 墙面阴影
        const wallShadow = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material)
        // 墙面
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({
          map: wallTexture,
        }) )

        planeShadow.rotation.x = -Math.PI / 2
        planeShadow.position.y = -0.8
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -0.8
        floor.position.z = -2
        wallShadow.position.y = 4
        wallShadow.position.z = -2
        wall.position.z = -2
        box.castShadow = true // 产生阴影
        wallShadow.receiveShadow = true // 墙面接收阴影
        planeShadow.receiveShadow = true // 平面接收阴影

        this.scene.add(box, planeShadow, floor, wallShadow, wall)
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
        watcherCamera.position.set(0, 2, 4)
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

        gui.add(_this.directionalLight.position, 'x', -10, 10, 0.1)
        gui.add(_this.directionalLight.position, 'y', -10, 10, 0.1)
        gui.add(_this.directionalLight.position, 'z', -10, 10, 0.1)
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
      tick () {
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
