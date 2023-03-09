precision mediump float;
varying vec2 vTex;
uniform sampler2D uSampler;

void main()
{
    gl_FragColor = texture2D(uSampler, vTex);
}