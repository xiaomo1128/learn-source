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

        // 矩形面光源uniforms工具库，包含矩形面光源常用数据，矩形区域光源位置、方向、颜色、强度，只适用于矩形的区域光源，即RectAreaLight
        RectAreaLightUniformsLib.init()
        
        // 面光源
        const rectLight = new THREE.RectAreaLight(0xffffff, 10, 2, 4)
        rectLight.position.set(0, 1, 5)

        const rectHelper = new RectAreaLightHelper(rectLight)

        this.scene.add(ambientLight, rectLight, rectHelper);
        this.ambientLight = ambientLight
        this.rectLight = rectLight
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
        const photoTexture = this.textureLoader.load('/src/assets/textures/4.jpg')

        this.floorTexture = floorTexture
        this.wallTexture = wallTexture
        this.photoTexture = photoTexture

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({
            color: 0x1890ff,
          })
        )

        // 地板
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 20),
          new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0,
          })
        )
        // 墙面
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({
          map: wallTexture,
          roughness: 0,
        }) )

        floor.rotation.x = -Math.PI / 2
        floor.position.y = -0.8
        floor.position.z = -2
        wall.position.z = -2
        box.castShadow = true // 产生阴影

        // 添加相框
        const frameGeometry = new THREE.PlaneGeometry(4.4, 6.4)
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0xd08a38,
        })
        const frame = new THREE.Mesh(frameGeometry, frameMaterial)
        const photoGeometry = new THREE.PlaneGeometry(4, 6)
        const photoMaterial = new THREE.MeshStandardMaterial({
          map: photoTexture,
          roughness: 0,
        })
        const photo = new THREE.Mesh(photoGeometry, photoMaterial)

        const group = new THREE.Group()
        group.add(frame, photo)
        frame.position.z = 0.001
        photo.position.z = 0.002
        group.position.z = -2
        group.position.y = 5

        this.scene.add(box, floor, wall, group)
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
        watcherCamera.position.set(-4, 4, 10)
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
        boxFolder.add(_this.box.position, 'x', -20, 20,  0.1).onChange(val =>{
          _this.rectLight.lookAt(_this.box.position)
        })
        boxFolder.add(_this.box.position, 'y', -20, 20,  0.1).onChange(val =>{
          _this.rectLight.lookAt(_this.box.position)
        })
        boxFolder.add(_this.box.position, 'z', -20, 20,  0.1).onChange(val =>{
          _this.rectLight.lookAt(_this.box.position)
        })

        const r = gui.addFolder('矩形面光源')
        r.add(_this.rectLight, 'visible')
        r.add(_this.rectLight, 'intensity', 0, 20, 0.1)
        r.addColor(_this.rectLight, 'color').onChange(val => {
          _this.rectLight.color = new THREE.Color(val.r, val.g, val.b)
        })
        r.add(_this.rectLight, 'width', 0, 10, 0.1)
        r.add(_this.rectLight, 'height', 0, 10, 0.1)
        r.add(_this.rectLight.position, 'x', -10, 10, 0.1)
        r.add(_this.rectLight.position, 'y', -10, 10, 0.1)
        r.add(_this.rectLight.position, 'z', -10, 10, 0.1)
        r.add(_this.rectLight.rotation, 'x', -Math.PI, Math.PI, 0.1)
        r.add(_this.rectLight.rotation, 'y', -Math.PI, Math.PI, 0.1)
        r.add(_this.rectLight.rotation, 'z', -Math.PI, Math.PI, 0.1)
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
