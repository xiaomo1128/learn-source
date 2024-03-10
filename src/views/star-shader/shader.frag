uniform vec3 color;
uniform sampler2D pointTexture;
uniform vec3 fogColor;
uniform float fogNear, fogFar;

void main(){
    vec4 color = vec4(color, 1.0) * texture2D(pointTexture, gl_PointCoord);
    gl_FragColor = vec4(color, 1.0);

    float depth = gl_FragCoord.z / gl_FragCoord.w; // 计算片元到相机的距离

    float fogFactor = smoothstep(fogNear, fogFar, depth); // 得到0~1之间的数值，该值越接近1，表示当前片元越靠近雾的结束位置（即相机位置）,反之，越靠近雾的起始位置，雾的强度与雾化因子之间的关联关系

    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor); // 将当前片元的颜色与雾的颜色进行混合，从而实现雾化效果  当fogFactor=0时，片元的颜色=gl_FragColor，即不受雾化效果的影响，mix()函数返回自身颜色；反之fogFactor=1时，结果是fogColor颜色；介于两者之间属于混合色
}