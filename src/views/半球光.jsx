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
        dirLight.position.set(0, 1, 2)
        dirLight.castShadow = true // 让方向光产生阴影

        // 方向光辅助工具
        const dirHelper = new THREE.DirectionalLightHelper(dirLight, 3)

        // 半球光
        const hemiLight = new THREE.HemisphereLight(0x00ffff, 0xffff55, 0.7)

        // 半球光辅助工具
        const hemiHelper = new THREE.HemisphereLightHelper(hemiLight, 1)
        
        this.scene.add(ambientLight, dirLight, dirHelper, hemiLight, hemiHelper)
        this.ambientLight = ambientLight
        this.dirLight = dirLight
        this.dirHelper = dirHelper
        this.hemiLight = hemiLight
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
        // const wall = new THREE.Mesh(geometry, material)

        // 天空
        const sky = new THREE.Mesh(
          geometry, 
          new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
          })
        )

        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1
        // wall.position.y = 4
        // wall.position.z = -5
        sky.position.y = 20
        sky.rotation.x = -Math.PI / 2

        this.dirLight.target = box // 方向光照向物体
        box.castShadow = true // 物体产生阴影
        floor.receiveShadow = true // 地面接收阴影
        // wall.receiveShadow = true // 墙面接收阴影

        this.scene.add(box, floor, sky)
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
        ambientFolder.open()

        const dirLightFolder = gui.addFolder('方向光')
        dirLightFolder.add(_this.dirLight, 'intensity',  0, 1, 0.1)
        dirLightFolder.add(_this.dirLight, 'visible')
        dirLightFolder.add(_this.dirLight.position, 'x', -20, 20, 0.1)
        dirLightFolder.add(_this.dirLight.position, 'y', -20, 20, 0.1)
        dirLightFolder.add(_this.dirLight.position, 'z', -20, 20, 0.1)
        dirLightFolder.open()

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

        const shadowMapFolder = gui.addFolder('阴影')
        // mapSize 改变阴影的位置
        shadowMapFolder.add(_this.dirLight.shadow.mapSize, 'x', [512, 1024, 2048, 4096])
        shadowMapFolder.add(_this.dirLight.shadow.mapSize, 'y', [512, 1024, 2048, 4096])
        // radius 改变阴影的模糊度
        shadowMapFolder.add(_this.dirLight.shadow, 'radius', 0, 30, 1)
        shadowMapFolder.open()

        const hemiFolder = gui.addFolder('半球光')
        hemiFolder.add(_this.hemiLight, 'intensity', 0, 1, 0.1 )
        hemiFolder.add(_this.hemiLight.position, 'x', -20, 20, 0.1)
        hemiFolder.add(_this.hemiLight.position, 'y', -20, 20, 0.1)
        hemiFolder.add(_this.hemiLight.position, 'z', -20, 20, 0.1)
        hemiFolder.add(_this.hemiLight, 'visible')
        hemiFolder.open()
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
