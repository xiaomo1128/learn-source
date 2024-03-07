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
        scene.background = new THREE.Color(0xffffff)
        this.scene = scene
      },
      // 创建光照
      createLights () {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)

        // 改变光照方向
        directionalLight.position.set(1, 2, 4)

        this.scene.add(ambientLight, directionalLight);
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

        // hdr 加载器
        const hdrLoader = new RGBELoader()
        const hdrTexture = hdrLoader.load('1.jpg', 
          // onLoad回调
          ()=> {
            // 场景添加背景图
            this.scene.background = hdrTexture
            // hdrTexture.mapping = THREE.EquirectangularReflectionMapping // 反射映射
            hdrTexture.mapping = THREE.EquirectangularReflectionMapping // 折射映射

            // 给所有物体设置环境贴图 仅支持环境贴图的材质，反射周围的环境  
            this.scene.environment = hdrTexture 
        })

        this.hdrTexture = hdrTexture
      },
      // 创建立方体对象
      createObjects () {
        const colorTexture = this.textureLoader.load('/src/assets/textures/1.jpg')

        const material = new THREE.MeshStandardMaterial({
          map: colorTexture,
        })

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material) // 球体
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          new THREE.MeshPhysicalMaterial({
            // 可结合环境光，呈现玻璃球中透出纹理图的效果
            // envMap:,
            // envMapIntensity:
            roughnessMap: colorTexture,
            roughness: 0.1,
            clearcoat: 1.0, // 具有反光特性
            transmission: 0.8, // 厚度
            ior: 1.0, // 非金属材质的反射率
            thickness: 1.0, // 曲面下体积的厚度
          })
        )

        sphere.position.x = -2
        mesh.position.x = 2

        this.scene.add(sphere, mesh)
        this.mesh = mesh
        this.material = material
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
        watcherCamera.position.set(0, 0, 4)
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

        // 物体外透明厚度
        gui.add(_this.mesh.material, 'clearcoat', 0, 1, 0.1)
        // 感光厚度 越小透光越强
        gui.add(_this.mesh.material, 'transmission', 0, 1, 0.1)
        gui.add(_this.mesh.material, 'ior', 1.0, 2.333, 0.01)
        gui.add(_this.mesh.material, 'thickness', 0, 1, 0.01)

        const sceneFolder = gui.addFolder('场景')
        sceneFolder.add(_this.scene, 'backgroundBlurriness', 0, 1, 0.1) // 背景模糊
        sceneFolder.add(_this.scene, 'backgroundIntensity', 0, 1, 0.1) // 背景强度

        // 调整整个场景曝光度，toneMapping属性 是色调的算法，如手机p图时，调整的全局色调，默认值是不生效
        gui.add({ exposure: 1 }, 'exposure', 0, 10, 0.1).onChange(val =>{
          _this.renderer.toneMapping = THREE.LinearToneMapping // 曝光度线性变化
          _this.renderer.toneMappingExposure = val;
        })
        gui.add(_this.renderer, 'toneMapping', [
          'NoToneMapping',
          'LinearToneMapping',
          'ReinhardToneMapping',
          'CineonToneMapping',
          'ACESFilmicToneMapping',
        ]).onChange(val => {
          _this.renderer.toneMapping = THREE[val]
        })

        //  webglrenderer对象中，outputEncoding属性：定义渲染器的输出编码
        gui.add(_this.renderer, 'outputEncoding', [
          'LinearEncoding',
          'sRGBEncoding',
          'BasicDepthPacking',
          'RGBADepthPacking',
        ]).onChange(val => {
          _this.renderer.outputEncoding = THREE[val]
        })

        // 环境贴图除了用 hdr实现，还可用cubeTexture立方纹理贴图实现，
        gui.add(_this.mesh.material, 'envMap', ['hdr', 'cube']).onChange(val =>{
          if (val === 'cube') {
            _this.scene.background = _this.envTexture
            _this.sphere.material.envMap = _this.envTexture
            _this.box.material.envMap = _this.envTexture
          } else {
            _this.scene.background = _this.hdrTexture
            _this.sphere.material.envMap = _this.hdrTexture
            _this.box.material.envMap = _this.hdrTexture
          }
          _this.sphere.material.needsUpdate = true
          _this.box.material.needsUpdate = true
        })

        // hdr加载器 缺点：纯粹的环境全景    若想要交互（室内装修，室内物体交互，点击、选中），可使用cubeTexture立方纹理贴图（适用于复杂交互场景）
      },
      // 添加辅助
      helpers () {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        this.scene.add(axesHelper, )
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
    start your project
    <canvas id="c" />;
  </>
};

export default Page;
