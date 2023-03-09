function ObjParser(fileName) {

	console.log("Now Loading file:", fileName);
	var modelStringData = loadFileAJAX(fileName);

	if (!modelStringData) { alert("Could not retrieve model data:" + fileName); }

	var lineSplit = modelStringData.split("\n");
	var tempVertexPositionList = [];
	var tempVertexTextureList = [];

	this.vertexPositions = [];
	this.vertexTextures = [];

	var minX, maxX, minY, maxY, minZ, maxZ;
	var vertexCount = 0;

	for (var lineId = 0; lineId < lineSplit.length; lineId++) { 														//Iterate over all the lines within the obj file

		if (lineSplit[lineId][0] === 'v' && lineSplit [lineId][1] === ' ') { 											//If the line begins with "v ". Defining

			vertexCount++;
			var posString = lineSplit[lineId].split(" ");  														//Split the current line by spaces to seperate the X Y and Z values within the string into an array
			var newPos = [parseFloat(posString[1]), parseFloat(posString[2]), parseFloat(posString[3])]; 				//Creates an array of three elements that are now floating point numbers and no longer ascii strings

			tempVertexPositionList.push(newPos); 																		//Push the current point onto the models temporary vertex position list

			if (vertexCount == 1) {
				minX = maxX = newPos[0];
				minY = maxY = newPos[1];
				minZ = maxZ = newPos[2];
			} else {
				if (minX > newPos[0]) minX = newPos[0];
				if (maxX < newPos[0]) maxX = newPos[0];
				if (minY > newPos[1]) minY = newPos[1];
				if (maxY < newPos[1]) maxY = newPos[1];
				if (minZ > newPos[2]) minZ = newPos[2];
				if (maxZ < newPos[2]) maxZ = newPos[2];
			}
		}

		if (lineSplit[lineId][0] === 'v' && lineSplit[lineId][1] === 't') {
			textString = lineSplit[lineId].split(" ");
			newText = [parseFloat(textString[1]), parseFloat(textString[2])];
			tempVertexTextureList.push(newText);
		}

		if (lineSplit[lineId][0] === 'f' && lineSplit [lineId][1] === ' ') { //If the line begins with "v ". Defining a vertex point in 3D

			var posString = lineSplit[lineId].split(" ");  //Split the current line by spaces to seperate the X Y and Z values within the string into an array

			for (var elementIdx = 1; elementIdx < posString.length; elementIdx++) {
				var vertex = posString[elementIdx].split("/");
				this.vertexPositions.push(tempVertexPositionList[vertex[0] - 1]);
				this.vertexTextures.push(tempVertexTextureList[vertex[1] - 1]);
			}
		}
	}
	this.span = [maxX - minX, maxY - minY, maxZ - minZ];
	this.offset = [(maxX + minX) / 2.0, (maxY + minY) / 2.0, (maxZ + minZ) / 2.0];

	console.log("Offset: " + this.offset + "\nSpan: " + this.span);
}