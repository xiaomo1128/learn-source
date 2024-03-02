import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

const Page = () => {
  useEffect(() => {
    const canvas = document.getElementById('c');

    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // 创建3D场景对象
    const scene = new THREE.Scene()

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper();
    // 辅助平面
    const gridHelper = new THREE.GridHelper()
    scene.add(axesHelper, gridHelper)

    // 添加全局光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

    scene.add(ambientLight, directionalLight)

    // 创建立方体的几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    let faces = []

    for ( let i=0; i<geometry.groups.length; i++) {
      // 重新生成新的材质
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff
      })

      faces.push(material)
    }

    // 创建3D物体对象
    const mesh = new THREE.Mesh(geometry, faces)

    scene.add(mesh)

    // 创建相机对象
    const camera = new THREE.PerspectiveCamera(75, width / height)

    // 设置相机位置
    camera.position.set(2, 2, 3)
    // 设置相机朝向
    camera.lookAt(scene.position)
    // 将相机添加到场景中
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true, // 抗锯齿化
    })

    // 设置渲染器屏幕像素比  移动端解决像素问题
    renderer.setPixelRatio(window.devicePixelRatio || 1)

    // 设置渲染器大小
    renderer.setSize(width, height)
    // 执行渲染
    renderer.render(scene, camera)

    // 创建轨道控制器
    const orbitControls = new OrbitControls(camera, canvas)
    orbitControls.enableDamping = true; // 开启惯性

    // 添加性能监视器
    const stats = new Stats()
    // 三种性能面板   0: FPS; 1: ms; 2: mb
    stats.setMode(0)
    // 挂载dom上
    document.body.appendChild(stats.domElement);

    const clock = new THREE.Clock()
    const tick = ()=>{
      // 保留多为小数的秒级
      const elapsedTime = clock.getElapsedTime();
      // 旋转
      // mesh.rotation.y += elapsedTime / 1000;
      // 位移
      // mesh.position.x += elapsedTime / 1000;
      // 缩放
      // mesh.scale.x += elapsedTime / 1000;
      
      // 围绕坐标系原点 曲线运动
      // mesh.position.x = Math.cos(elapsedTime)
      // mesh.position.y = Math.sin(elapsedTime)

      // 镜头看向物体  曲线运动
      camera.position.x = Math.cos(elapsedTime)
      camera.position.y = Math.sin(elapsedTime)



      // 更新
      orbitControls.update()
      stats.update()
      renderer.render(scene, camera)
      window.requestAnimationFrame(tick)
    }
    
    tick()

    window.addEventListener('resize', ()=>{
      camera.aspect = window.innerWidth / window.innerHeight;
      // 更新相机投影矩阵
      camera.updateProjectionMatrix()

      // 更新渲染器大小
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }, []);

  return <>
    start your project
    <canvas id="c" />;
  </>
};

export default Page;
