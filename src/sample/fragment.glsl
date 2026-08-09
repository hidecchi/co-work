precision mediump float;

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D texRipple;

vec3 linearToSRGB(vec3 c) {
  return mix(
    1.055 * pow(c, vec3(0.41666)) - 0.055,
    12.92 * c,
    step(c, vec3(0.0031308))
  );
}

void main() {
    vec4 ripple = texture(texRipple, vUv);
    vec2 rippleUv = vUv + ripple.r * .1225;
    vec4 color = texture(tDiffuse, rippleUv);
    gl_FragColor = vec4(linearToSRGB(color.rgb), color.a);
}