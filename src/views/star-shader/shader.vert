/*
    基本语法规则：
    1. 大小写敏感
    2. 语句末尾必须要有分号
    3. mian 函数 
    4. 支出单行注释及多行注释
    5. 基本数据类型：数值和布尔值，数值只有 整型int、浮点型float，布尔值只有true和false
    6. 复杂数据类型：矢量数据 vec2，vec3，vec4等

    变量声明：
    1. attribute
    2. varying     用来从顶点着色器向片元着色器传递数据
    3. uniform     全局变量

    逐顶点：每个顶点都要执行一次顶点着色器主函数main中的程序
    逐片元：设置每个像素的颜色 gl_FragColor：片元像素的颜色，vec4(r, g, b, a)

*/

varying float cameraDistance;

void main () {
    // 投影变换矩阵 * 模型视图矩阵 * 顶点坐标 => 将3D空间坐标转为屏幕空间坐标
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // modelMatrix 模型矩阵
    vec4 worldPosition = modelMatrix * vec4(position 1.0); // 每个顶点的世界坐标

    // 当前点坐标与相机之间的距离
    vec3 viewVector = cameraPosition - worldPosition.xyz;
    // distance = Math.sqrt(x * x + y * y + z * z)
    cameraDistance = length(viewVector); //计算当前点到相机的距离，三维向量的实际距离
    // 想要的效果是：距离相机越近物体越大，越远则越小

    gl_Position = 100.0 / cameraDistance;
}
