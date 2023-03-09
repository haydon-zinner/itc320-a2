attribute vec4 aPosition;
attribute vec2 aTexture;
varying vec2 vTex;
uniform mat4 mWorldMatrix;

attribute vec4 boneWeight;
attribute vec4 boneIndex;
uniform mat4 boneMatrices[30];

void main()
{
    vTex = aTexture;
    vec4 finalPosition = vec4(0,0,0,0);
    finalPosition += boneMatrices[int(boneIndex.x)] * boneWeight.x * aPosition;
    finalPosition += boneMatrices[int(boneIndex.y)] * boneWeight.y * aPosition;
    finalPosition += boneMatrices[int(boneIndex.z)] * boneWeight.z * aPosition;
    finalPosition += boneMatrices[int(boneIndex.w)] * boneWeight.w * aPosition;
    gl_Position = mWorldMatrix * finalPosition;
}