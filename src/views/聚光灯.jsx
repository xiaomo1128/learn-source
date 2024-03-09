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
        scene.background = new THREE.Color(0xf0f0f0)
        this.scene = scene
      },
      // 创建光照
      createLights () {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        ambientLight.visible = false

        // 添加聚光灯
        const spotLight = new THREE.SpotLight(0xff00ff, 0.95)
        const spotHelper = new THREE.SpotLightHelper(spotLight) 

        spotLight.intensity = 1
        spotLight.distance = 100 // 光源距离
        spotLight.angle = Math.PI / 4 // 照射角度
        spotLight.penumbra = 0.3 // 半影：阴影边缘模糊度
        spotLight.position.y = 10
        spotLight.castShadow = true // 开启阴影

        spotHelper.update() // 更新

        this.scene.add(ambientLight, spotLight, spotHelper );
        this.ambientLight = ambientLight
        this.spotLight = spotLight
        this.spotHelper = spotHelper
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
          new THREE.SphereGeometry(2, 64, 64),
          new THREE.MeshLambertMaterial({
            color: 0x1890ff
          })
        )
        
        const geometry = new THREE.PlaneGeometry(1000, 1000)
        const floor = new THREE.Mesh(
          geometry, 
          new THREE.MeshLambertMaterial({
            color: 0x666666, 
            // side: THREE.DoubleSide,
          })
        )

        const sky = new THREE.Mesh(
          geometry, 
          new THREE.MeshLambertMaterial({
            color: 0x666666, 
            side: THREE.DoubleSide,
          })
        )
        sky.rotation.x = -Math.PI / 2
        sky.position.y = 60
        sky.castShadow = true

        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1
        box.position.y = 3

        box.castShadow = true // 开启阴影
        floor.receiveShadow = true // 接收阴影
        this.spotLight.target = box // 聚光灯始终朝向物体

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
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        // 设置相机位置
        watcherCamera.position.set(-4, 15, 15)
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
        ambientFolder.add(_this.ambientLight, 'intensity', 0, 1, 0.1).name('强度')
        ambientFolder.add(_this.ambientLight, 'visible').name('可见性')

        const boxFolder = gui.addFolder('box')
        boxFolder.add(_this.box.position, 'x', -30, 30, 0.1).onChange(val =>{
          _this.spotHelper.update()
        })

        const spotFolder = gui.addFolder('聚光灯')
        spotFolder.add(_this.spotLight, 'intensity', 0, 1, 0.1).name('强度')
        spotFolder.add(_this.spotLight, 'visible').name('可见性')
        spotFolder.add(_this.spotLight, 'distance', 0, 100, 1).name('距离').onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight, 'angle', 0, Math.PI / 2, 0.1).name('角度').onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight, 'penumbra', 0, 1, 0.1).name('半影').onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight, 'decay', 0, 10, 0.1).name('衰减量').onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight, 'power', 0, 30, 0.1).name('光功率').onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight.position, 'x', -30, 30, 0.1).onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight.position, 'y', -30, 30, 0.1).onChange(val =>{
          _this.spotHelper.update()
        })
        spotFolder.add(_this.spotLight.position, 'z', -30, 30, 0.1).onChange(val =>{
          _this.spotHelper.update()
        })

        spotFolder.add(_this.spotLight, 'castShadow').name('阴影')
        spotFolder.add(_this.spotLight.shadow, 'radius', 0, 5, 0.01).name('阴影半径')
        const params = {
          near: _this.spotLight.shadow.camera.near,
          far: _this.spotLight.shadow.camera.far,
          fov: _this.spotLight.shadow.camera.fov,
        }
        spotFolder.add(params, 'near', 0.01, 10, 0.01).name('阴影相机near')
        spotFolder.add(params, 'far', 0.01, 10, 0.01).name('阴影相机far')
        this.params = params
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();

        const gridHelper = new THREE.GridHelper(20, 20, 0xf0f0f0)
        gridHelper.position.y = -1

        const cameraHelper = new THREE.CameraHelper(this.spotLight.shadow.camera)
        
        this.scene.add(axesHelper, gridHelper, cameraHelper)
        this.cameraHelper = cameraHelper
      },
      render () {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true
        })
        renderer.shadowMap.enabled = true;
        renderer.outputEncoding = THREE.sRGBEncoding 

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
        const _this = this
        const elapsedTime = this.clock.getElapsedTime()

        _this.box.position.x = Math.sin(elapsedTime) * 10
        _this.box.position.z = Math.cos(elapsedTime) * 4
        _this.spotLight.position.x = Math.sin(elapsedTime) * 10
        _this.spotLight.position.y = Math.sin(elapsedTime) * 2 + 10
        _this.spotLight.position.z = Math.sin(elapsedTime) * 2
        _this.spotLight.shadow.camera.near = _this.params.near
        _this.spotLight.shadow.camera.far = _this.params.far
        _this.spotLight.shadow.camera.fov = _this.params.fov
        this.cameraHelper.update()

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
