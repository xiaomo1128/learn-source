import { useEffect } from 'react';
import * as THREE from 'three';
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
      // 创建光照
      createLights () {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

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
        const texture = textureLoader.load('/src/assets/textures/1.jpg')

        this.texture = texture
        this.textureLoader = textureLoader
      },
      // 创建立方体对象
      createObjects () {
        // 创建立方体的几何体
        const geometry = new THREE.CylinderGeometry(1, 1, 1)
        // 创建立方体材质
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
          map: this.texture,
          transparent: true, //开启透明度
          opacity: 0.8,
          wireframe: true,
        })
        // 创建3D物体对象
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -2;

        // 立方体
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2)
        const boxMaterial = new THREE.MeshBasicMaterial({
          map: this.texture,
        })

        const materials = []
        for( let i = 0; i< boxGeometry.groups.length; i++ ){
          // 使用 textureLoader 加载每张纹理图片
          const texture = this.textureLoader.load(`/src/assets/textures/${i+1}.jpg`)

          materials.push(new THREE.MeshBasicMaterial({
            map: texture,
          }))
        }

        const box = new THREE.Mesh(boxGeometry, materials)

        box.position.x = 1;

        this.scene.add(mesh, box)
        this.mesh = mesh;
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
        watcherCamera.position.set(1, 2, 4)
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
