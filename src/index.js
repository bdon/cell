const vertexshader = `
  attribute vec2 a_position;
  attribute vec2 a_texcoord;
  varying vec2 v_texcoord;
  void main() {
    gl_Position = vec4(a_position,0.,1.);
    v_texcoord = a_texcoord;
  }`

const fragmentshaderDisplay = `
  varying vec2 v_texcoord;
  uniform sampler2D u_texture;
  void main() {
    gl_FragColor = vec4(texture2D(u_texture, v_texcoord).rgb, 1.);
  }`

const fragmentshaderEvolve = `
  varying vec2 v_texcoord;
  uniform sampler2D u_texture;

  bool eq(float a, float b) {
    return abs(a - b) < 0.001;
  }

  bool is_live(sampler2D texture, vec2 texcoord) {
    return eq(texture2D(texture, texcoord).a, 1.);
  }

  vec4 is_livev(sampler2D texture, vec2 texcoord) {
    if (is_live(texture, texcoord)) {
      return vec4(texture2D(texture,texcoord).rgb/3.,1.);
    }
    return vec4(0.);
  }

  void main() {
    float x = v_texcoord.x;
    float y = v_texcoord.y;
    vec4 c0 = is_livev(u_texture, vec2(x-1./255.,y-1./255.));
    vec4 c1 = is_livev(u_texture, vec2(x-1./255.,y-0./255.));
    vec4 c2 = is_livev(u_texture, vec2(x-1./255.,y+1./255.));
    vec4 c3 = is_livev(u_texture, vec2(x-0./255.,y+1./255.));
    vec4 c4 = is_livev(u_texture, vec2(x+1./255.,y+1./255.));
    vec4 c5 = is_livev(u_texture, vec2(x+1./255.,y-0./255.));
    vec4 c6 = is_livev(u_texture, vec2(x+1./255.,y-1./255.));
    vec4 c7 = is_livev(u_texture, vec2(x-0./255.,y-1./255.));
    vec4 me = texture2D(u_texture, v_texcoord);
    bool live = is_live(u_texture, v_texcoord);
    vec4 liveNeighbors = c0 + c1 + c2 + c3 + c4 + c5 + c6 + c7;
    float num = liveNeighbors.a;
    if (live  && (num < 2. || num > 3.)) {
      gl_FragColor = vec4(me.rgb,0.);
    }
    else if (!live && eq(num,3.)) {
      gl_FragColor = vec4(liveNeighbors.rgb,1.);
    } 
    else if (live) {
      gl_FragColor = vec4(me);
    } else {
      gl_FragColor = vec4(me) - vec4(0.005);
    }
  }
`

function createShader( gl, src, type ) {
	const shader = gl.createShader( type );
	gl.shaderSource( shader, src );
	gl.compileShader( shader );
	if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
		alert( ( type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog( shader ) );
		return null;
	}
	return shader;
}

function createProgram( gl, vertex, fragment ) {
	const program = gl.createProgram();
	const vs = createShader( gl, vertex, gl.VERTEX_SHADER );
	const fs = createShader( gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment, gl.FRAGMENT_SHADER );
	if ( vs == null || fs == null ) return null;
	gl.attachShader( program, vs );
	gl.attachShader( program, fs );
	gl.deleteShader( vs );
	gl.deleteShader( fs );
	gl.linkProgram( program );
	if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
		alert( "ERROR:\n" +
		"VALIDATE_STATUS: " + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + "\n" +
		"ERROR: " + gl.getError() + "\n\n" +
		"- Vertex Shader -\n" + vertex + "\n\n" +
		"- Fragment Shader -\n" + fragment );
		return null;
	}
	return program;
}

class ShaderProgram {
  constructor(gl, vertexShader, fragmentShader, attribList, uniformList) {
    this.program = createProgram(gl, vertexShader, fragmentShader)
    this.a = {}
    this.u = {}
    this.buffer = {}
    for (var attrib of attribList) {
      this.a[attrib] = gl.getAttribLocation(this.program, attrib)
    }
    for (var uniform of uniformList) {
      this.u[uniform] = gl.getUniformLocation(this.program, uniform)
    }
  }
}

window.requestAnimationFrame = window.requestAnimationFrame || ( function() {
	return  window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame ||
	        window.oRequestAnimationFrame ||
	        window.msRequestAnimationFrame ||
	        function(  callback ) {
		        window.setTimeout( callback, 1000 / 60 )
	        }
})()

const SIZE = 256;
var canvas, gl
var programDisplay, programEvolve
var textureFront, textureBack
var framebuffer, attachmentPoint

function init() {
  canvas = document.querySelector( 'canvas' )
  gl = canvas.getContext( 'experimental-webgl' )
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

  const arr = []
  for (var i = 0; i < SIZE; i++) {
    for (var j = 0; j < SIZE; j++) {
      arr.push(Math.random() * 255)
      arr.push(Math.random() * 255)
      arr.push(Math.random() * 255)
      arr.push(Math.random() > 0.5 ? 255 : 254)
    }
  }
  const data = new Uint8Array(arr)

  textureFront = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, textureFront)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)

  textureBack = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, textureBack)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)

  framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

  programDisplay = new ShaderProgram(gl, vertexshader, fragmentshaderDisplay, ['a_position','a_texcoord'], ['u_texture'] )
  programDisplay.buffer.a_position = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,programDisplay.buffer.a_position)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
  programDisplay.buffer.a_texcoord = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,programDisplay.buffer.a_texcoord)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]), gl.STATIC_DRAW)
  programDisplay.buffer.index = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, programDisplay.buffer.index)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,2,1,1,2,3]), gl.STATIC_DRAW)

  programEvolve = new ShaderProgram(gl, vertexshader, fragmentshaderEvolve, ['a_position','a_texcoord'], ['u_texture'] )
  programEvolve.buffer.a_position = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,programEvolve.buffer.a_position)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
  programEvolve.buffer.a_texcoord = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,programEvolve.buffer.a_texcoord)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]), gl.STATIC_DRAW)
  programEvolve.buffer.index = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, programEvolve.buffer.index)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,2,1,1,2,3]), gl.STATIC_DRAW)
}

function animate() {
  resizeCanvas()
  const tmp = textureFront
  textureFront = textureBack
  textureBack = tmp
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	gl.viewport( 0, 0, canvas.width, canvas.height )
  render(programDisplay, textureFront)
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureFront, 0)
  gl.viewport(0, 0, SIZE, SIZE)
  render(programEvolve, textureBack)
  requestAnimationFrame( animate )
}

function render(program, texture) {
  gl.useProgram( program.program )
  gl.uniform1i(program.u.u_texture, 0)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.enableVertexAttribArray(program.a.a_position)
  gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer.a_position )
  gl.vertexAttribPointer(program.a.a_position,2,gl.FLOAT,false,0,0)
  gl.enableVertexAttribArray(program.a.a_texcoord)
  gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer.a_texcoord)
  gl.vertexAttribPointer(program.a.a_texcoord,2,gl.FLOAT,false,0,0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.buffer.index )
  gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0)
}

function resizeCanvas( event ) {
	if ( canvas.width != canvas.clientWidth ||
		canvas.height != canvas.clientHeight ) {
		canvas.width = canvas.clientWidth
		canvas.height = canvas.clientHeight
	}
}

init()
animate()
