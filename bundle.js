/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const vertexshader = `\n  attribute vec2 a_position;\n  attribute vec2 a_texcoord;\n  varying vec2 v_texcoord;\n  void main() {\n    gl_Position = vec4(a_position,0.,1.);\n    v_texcoord = a_texcoord;\n  }`\n\nconst fragmentshaderDisplay = `\n  varying vec2 v_texcoord;\n  uniform sampler2D u_texture;\n  void main() {\n    gl_FragColor = vec4(texture2D(u_texture, v_texcoord).rgb, 1.);\n  }`\n\nconst fragmentshaderEvolve = `\n  varying vec2 v_texcoord;\n  uniform sampler2D u_texture;\n\n  bool eq(float a, float b) {\n    return abs(a - b) < 0.001;\n  }\n\n  bool is_live(sampler2D texture, vec2 texcoord) {\n    return eq(texture2D(texture, texcoord).a, 1.);\n  }\n\n  vec4 is_livev(sampler2D texture, vec2 texcoord) {\n    if (is_live(texture, texcoord)) {\n      return vec4(texture2D(texture,texcoord).rgb/3. + vec3(.00008),1.);\n    }\n    return vec4(0.);\n  }\n\n  void main() {\n    float x = v_texcoord.x;\n    float y = v_texcoord.y;\n    vec4 c0 = is_livev(u_texture, vec2(x-1./255.,y-1./255.));\n    vec4 c1 = is_livev(u_texture, vec2(x-1./255.,y-0./255.));\n    vec4 c2 = is_livev(u_texture, vec2(x-1./255.,y+1./255.));\n    vec4 c3 = is_livev(u_texture, vec2(x-0./255.,y+1./255.));\n    vec4 c4 = is_livev(u_texture, vec2(x+1./255.,y+1./255.));\n    vec4 c5 = is_livev(u_texture, vec2(x+1./255.,y-0./255.));\n    vec4 c6 = is_livev(u_texture, vec2(x+1./255.,y-1./255.));\n    vec4 c7 = is_livev(u_texture, vec2(x-0./255.,y-1./255.));\n    vec4 me = texture2D(u_texture, v_texcoord);\n    bool live = is_live(u_texture, v_texcoord);\n    vec4 liveNeighbors = c0 + c1 + c2 + c3 + c4 + c5 + c6 + c7;\n    float num = liveNeighbors.a;\n    if (live  && (num < 2. || num > 3.)) {\n      gl_FragColor = vec4(me.rgb,0.);\n    }\n    else if (!live && eq(num,3.)) {\n      gl_FragColor = vec4(liveNeighbors.rgb,1.);\n    } \n    else if (live) {\n      gl_FragColor = vec4(me);\n    } else {\n      gl_FragColor = vec4(me) - vec4(0.005);\n    }\n  }\n`\n\nfunction createShader( gl, src, type ) {\n\tconst shader = gl.createShader( type );\n\tgl.shaderSource( shader, src );\n\tgl.compileShader( shader );\n\tif ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {\n\t\talert( ( type == gl.VERTEX_SHADER ? \"VERTEX\" : \"FRAGMENT\" ) + \" SHADER:\\n\" + gl.getShaderInfoLog( shader ) );\n\t\treturn null;\n\t}\n\treturn shader;\n}\n\nfunction createProgram( gl, vertex, fragment ) {\n\tconst program = gl.createProgram();\n\tconst vs = createShader( gl, vertex, gl.VERTEX_SHADER );\n\tconst fs = createShader( gl, '#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\n' + fragment, gl.FRAGMENT_SHADER );\n\tif ( vs == null || fs == null ) return null;\n\tgl.attachShader( program, vs );\n\tgl.attachShader( program, fs );\n\tgl.deleteShader( vs );\n\tgl.deleteShader( fs );\n\tgl.linkProgram( program );\n\tif ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {\n\t\talert( \"ERROR:\\n\" +\n\t\t\"VALIDATE_STATUS: \" + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + \"\\n\" +\n\t\t\"ERROR: \" + gl.getError() + \"\\n\\n\" +\n\t\t\"- Vertex Shader -\\n\" + vertex + \"\\n\\n\" +\n\t\t\"- Fragment Shader -\\n\" + fragment );\n\t\treturn null;\n\t}\n\treturn program;\n}\n\nclass ShaderProgram {\n  constructor(gl, vertexShader, fragmentShader, attribList, uniformList) {\n    this.program = createProgram(gl, vertexShader, fragmentShader)\n    this.a = {}\n    this.u = {}\n    this.buffer = {}\n    for (var attrib of attribList) {\n      this.a[attrib] = gl.getAttribLocation(this.program, attrib)\n    }\n    for (var uniform of uniformList) {\n      this.u[uniform] = gl.getUniformLocation(this.program, uniform)\n    }\n  }\n}\n\nwindow.requestAnimationFrame = window.requestAnimationFrame || ( function() {\n\treturn  window.webkitRequestAnimationFrame ||\n\t        window.mozRequestAnimationFrame ||\n\t        window.oRequestAnimationFrame ||\n\t        window.msRequestAnimationFrame ||\n\t        function(  callback ) {\n\t\t        window.setTimeout( callback, 1000 / 60 )\n\t        }\n})()\n\nconst SIZE = 256;\nvar canvas, gl\nvar programDisplay, programEvolve\nvar textureFront, textureBack\nvar framebuffer, attachmentPoint\n\nfunction init() {\n  canvas = document.querySelector( 'canvas' )\n  gl = canvas.getContext( 'experimental-webgl' )\n  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)\n\n  const arr = []\n  for (var i = 0; i < SIZE; i++) {\n    for (var j = 0; j < SIZE; j++) {\n      arr.push(Math.random() * 255)\n      arr.push(Math.random() * 255)\n      arr.push(Math.random() * 255)\n      arr.push(Math.random() > 0.5 ? 255 : 254)\n    }\n  }\n  const data = new Uint8Array(arr)\n\n  textureFront = gl.createTexture()\n  gl.bindTexture(gl.TEXTURE_2D, textureFront)\n  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)\n\n  textureBack = gl.createTexture()\n  gl.bindTexture(gl.TEXTURE_2D, textureBack)\n  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)\n  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)\n\n  framebuffer = gl.createFramebuffer()\n  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)\n\n  programDisplay = new ShaderProgram(gl, vertexshader, fragmentshaderDisplay, ['a_position','a_texcoord'], ['u_texture'] )\n  programDisplay.buffer.a_position = gl.createBuffer()\n  gl.bindBuffer(gl.ARRAY_BUFFER,programDisplay.buffer.a_position)\n  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)\n  programDisplay.buffer.a_texcoord = gl.createBuffer()\n  gl.bindBuffer(gl.ARRAY_BUFFER,programDisplay.buffer.a_texcoord)\n  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]), gl.STATIC_DRAW)\n  programDisplay.buffer.index = gl.createBuffer()\n  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, programDisplay.buffer.index)\n  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,2,1,1,2,3]), gl.STATIC_DRAW)\n\n  programEvolve = new ShaderProgram(gl, vertexshader, fragmentshaderEvolve, ['a_position','a_texcoord'], ['u_texture'] )\n  programEvolve.buffer.a_position = gl.createBuffer()\n  gl.bindBuffer(gl.ARRAY_BUFFER,programEvolve.buffer.a_position)\n  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)\n  programEvolve.buffer.a_texcoord = gl.createBuffer()\n  gl.bindBuffer(gl.ARRAY_BUFFER,programEvolve.buffer.a_texcoord)\n  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]), gl.STATIC_DRAW)\n  programEvolve.buffer.index = gl.createBuffer()\n  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, programEvolve.buffer.index)\n  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,2,1,1,2,3]), gl.STATIC_DRAW)\n}\n\nfunction animate() {\n  resizeCanvas()\n  const tmp = textureFront\n  textureFront = textureBack\n  textureBack = tmp\n  gl.bindFramebuffer(gl.FRAMEBUFFER, null)\n\tgl.viewport( 0, 0, canvas.width, canvas.height )\n  render(programDisplay, textureFront)\n  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)\n  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureFront, 0)\n  gl.viewport(0, 0, SIZE, SIZE)\n  render(programEvolve, textureBack)\n  requestAnimationFrame( animate )\n}\n\nfunction render(program, texture) {\n  gl.useProgram( program.program )\n  gl.uniform1i(program.u.u_texture, 0)\n  gl.activeTexture(gl.TEXTURE0)\n  gl.bindTexture(gl.TEXTURE_2D, texture)\n  gl.enableVertexAttribArray(program.a.a_position)\n  gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer.a_position )\n  gl.vertexAttribPointer(program.a.a_position,2,gl.FLOAT,false,0,0)\n  gl.enableVertexAttribArray(program.a.a_texcoord)\n  gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer.a_texcoord)\n  gl.vertexAttribPointer(program.a.a_texcoord,2,gl.FLOAT,false,0,0)\n  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.buffer.index )\n  gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0)\n}\n\nfunction resizeCanvas( event ) {\n\tif ( canvas.width != canvas.clientWidth ||\n\t\tcanvas.height != canvas.clientHeight ) {\n\t\tcanvas.width = canvas.clientWidth\n\t\tcanvas.height = canvas.clientHeight\n\t}\n}\n\ninit()\nanimate()\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });