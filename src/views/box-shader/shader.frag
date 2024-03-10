varying vec3 vColor;
varying float vApha;

void main(){
    gl_FragColor = vec4(vColor, vApha);    
}