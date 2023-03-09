/**
 * @author Haydon Zinner
 * @description Creates an animated object with textures. Vertices, texture coordinates, bone indices, and bone
 * weight are stored in the model object and bound to unique webgl buffers.
 * weights.
 *
 * @param colladaFile - The collada file to load.
 * @param textureFile - The texture file to load.
 * @param trackID - The animation track to use.
 * @param frameSpeed - The speed at which the animation should play.
 * @param scale - The scale of the object as an integer.
 * @param position - The position of the object as a vec3.
 * @param rotation - The rotation of the object as a vec3.
 * @param id - The id of the object as a String.
 */
function AnimatedObject(colladaFile, textureFile, trackID, frameSpeed, scale, position, rotation, id) {
	this.id = id;
	this.model = new ColladaParser(colladaFile);
	this.texture = new TGAParser(textureFile);
	this.trackId = trackID;
	this.frameId = 0;
	this.frameSpeed = frameSpeed;
	this.rot = 0;

	this.scaleSize = scale / this.model.radius;
	this.position = position;

	// Create the model matrix.
	this.scaleMatrix = scalem(this.scaleSize , this.scaleSize , this.scaleSize );
	this.translateMatrix = position;
	this.rotateMatrix = rotation;
	this.offsetMatrix = translate(-this.model.center[0], -this.model.center[1], -this.model.center[2]);
	this.modelMatrix = mult(this.translateMatrix, mult(this.rotateMatrix, mult(this.scaleMatrix, this.offsetMatrix)));

	//Move the center of the object with respect to view coordinate
	this.model.center = vec3(mult(this.translateMatrix, this.offsetMatrix)[0][3], mult(this.translateMatrix, this.offsetMatrix)[1][3], mult(this.translateMatrix, this.offsetMatrix)[2][3]);

	//Scale the radius with transformation
	this.model.radius *= this.scaleSize;

	//Vertex buffer
	this.posBufferId = gl.createBuffer();
	this.model.positionBufferId = this.posBufferId;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.posBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.model.vertexPositionDataRead), gl.STATIC_DRAW);

	//Texture Buffer
	this.textureBufferId = gl.createBuffer();
	this.model.textureBufferId = this.textureBufferId;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.model.vertexTextureDataRead), gl.STATIC_DRAW);

	//Bone Index Buffer
	this.idxBufferId = gl.createBuffer();
	this.model.indexBufferId = this.idxBufferId;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.idxBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.model.vertexBoneIndexDataRead), gl.STATIC_DRAW);

	//Bone Weight Buffer
	this.wgtBufferId = gl.createBuffer();
	this.model.weightBufferId = this.wgtBufferId;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.wgtBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.model.vertexBoneWeightDataRead), gl.STATIC_DRAW);

}

/**
 * @description Draws the object.
 */
AnimatedObject.prototype.draw = function () {
	let aPos = gl.getAttribLocation(program, "aPosition");
	let aCol = gl.getAttribLocation(program, "aTexture");
	let aIdx = gl.getAttribLocation(program, "boneIndex");
	let aWgt = gl.getAttribLocation(program, "boneWeight");

	gl.enableVertexAttribArray(aPos);
	gl.enableVertexAttribArray(aCol);
	gl.enableVertexAttribArray(aIdx);
	gl.enableVertexAttribArray(aWgt);

	colladaParser_MakeVertexDataCopy(this.model);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.positionBufferId);
	gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.textureBufferId);
	gl.vertexAttribPointer(aCol, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.indexBufferId);
	gl.vertexAttribPointer(aIdx, 4, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.weightBufferId);
	gl.vertexAttribPointer(aWgt, 4, gl.FLOAT, false, 0, 0);

	//Update the bone matrix array
	this.pushBoneMatrixArray();

	//Update the world matrix
	this.worldMatrix = mult(projectionMatrix, mult(viewMatrix, this.modelMatrix));

	//Rotate the object if it is selected
	if (pickingEnabled){
		if (this.checkIntersection(this.model.center, this.model.radius , nearPoint, farPoint)) {
			this.rot += 0.5;
			this.worldMatrix = mult(projectionMatrix, mult(viewMatrix, mult(this.modelMatrix, rotate(this.rot, [0, 0, 1]))));
			console.log("Selected: " + this.id);
		} else {
			this.rot = 0;
			this.worldMatrix = mult(projectionMatrix, mult(viewMatrix, this.modelMatrix));
		}
	}

	//Finally, draw the object
	gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(this.worldMatrix));
	gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
	gl.drawArrays(gl.TRIANGLES, this.model.subMeshIndex[0], this.model.subMeshIndex[1]);
};
/**
 * @description Helper function that updates the bone matrix array.
 * @author Tanmoy Debnath
 */
AnimatedObject.prototype.pushBoneMatrixArray = function () {
	this.updateSkeleton();

	for (let i = 0; i < this.model.bones.length; i++) {
		let location = gl.getUniformLocation(program, "boneMatrices[" + String(i) + "]");
		gl.uniformMatrix4fv(location, false, flatten(this.model.bones[i].skinningMatrix));
	}
};
/**
 * @description Helper function that updates the skeleton.
 * @author Tanmoy Debnath
 */
AnimatedObject.prototype.updateSkeleton = function () {
	let jointMatrix;
	let IBM;
	let SM;
	let frameCount;
	this.frameId += this.frameSpeed;
	for (let boneIdx = 0; boneIdx < this.model.bones.length; boneIdx++) {
		frameCount = this.model.bones[boneIdx].animationTracks[this.trackId].keyFrameTransform.length;
		if (frameCount > 0) {
			jointMatrix = this.calJointMatrix4Bone(this.model.bones[boneIdx], this.trackId, Math.floor(this.frameId) % frameCount);
		} else {
			jointMatrix = this.calJointMatrix4Bone(this.model.bones[boneIdx], this.trackId, -1);
		}
		IBM = this.model.bones[boneIdx].inverseBindMatrix;
		SM = mult(jointMatrix, IBM);
		this.model.bones[boneIdx].jointMatrix = jointMatrix;
		this.model.bones[boneIdx].skinningMatrix = SM;
	}
};
/**
 * @description Helper function that calculates the joint matrix for a bone.
 * @author Tanmoy Debnath
 * @param bone The bone for which the joint matrix is to be calculated.
 * @param trackIdx The track index.
 * @param frameIdx The frame index.
 * @returns {[]|*|*[]} The joint matrix.
 */
AnimatedObject.prototype.calJointMatrix4Bone = function (bone, trackIdx, frameIdx) {
	let jointMatrix;

	if (bone.animationTracks[trackIdx].keyFrameTransform.length === 0 || frameIdx >= bone.animationTracks[trackIdx].keyFrameTransform.length) {
		jointMatrix = bone.bindPoseMatrix;
	} else {
		jointMatrix = bone.animationTracks[trackIdx].keyFrameTransform[frameIdx];
	}
	if (bone.parent == null) {
		return jointMatrix;
	} else {
		return mult(this.calJointMatrix4Bone(bone.parent, trackIdx, frameIdx), jointMatrix);
	}
};
/**
 * @description Helper function that checks if the object is intersected by the ray.
 * @author Tanmoy Debnath
 * @param C Center of the object
 * @param radius Radius of the object
 * @param P1 Start point of the ray
 * @param P2 End point of the ray
 * @returns {boolean} True if the object is intersected by the ray, false otherwise.
 */
AnimatedObject.prototype.checkIntersection = function (C, radius, P1, P2) {
	if (typeof P1 == "undefined" || typeof P2 == "undefined")
		return false;


	//console.log("P1: " + P1);

	let PC = subractPoints(C, P1);
	let P12 = subractPoints(P2, P1);
	let P12Normalised = normaliseVector(P12);
	let t = dotProduct(PC, P12) / Math.sqrt(dotProduct(P12, P12));
	let Q = addPoints(P1, multiplyPoint(P12Normalised, t));
	let diff = subractPoints(C, Q);
	let dist = Math.sqrt(dotProduct(diff, diff));

	return dist <= radius;   // intersection present
};

