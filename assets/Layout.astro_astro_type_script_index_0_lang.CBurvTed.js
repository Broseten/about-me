import{b as U,c as B}from"./config.CuhYByMn.js";const V=`#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`,j=`#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
uniform float u_isDark;
uniform vec3 u_seed;

out vec4 fragColor;

// Rotate 2D
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// 2D Noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// Fractional Brownian Motion
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rotMat = rot(0.5 + u_seed.x);
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rotMat * p * 2.0 + vec2(100.0 * u_seed.y);
        a *= 0.5;
    }
    return v;
}

// Pass dynamic colors from the theme instead of hardcoded
uniform vec3 u_baseColor;
uniform vec3 u_midColor;
uniform vec3 u_topColor;
uniform vec3 u_glowColor;

void main() {
    // Normalize coordinates and adjust for aspect ratio
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    // Mouse interaction parameters
    vec2 mouse = u_mouse.xy;
    float activity = u_mouse.z; // 0.0 when static, up to 1.0 when moving
    float scrollFade = u_mouse.w; // 1.0 at origin, dims as scrolling down
    
    vec2 mouseDiff = p - mouse;
    float mouseDist = length(mouseDiff);

    // Dynamic time (faster generation)
    float t = u_time * 0.4 + u_seed.z * 10.0;

    // Base distortion (sleeker, larger waves)
    vec2 q = vec2(0.);
    q.x = fbm(p * 0.8 + vec2(t * 0.1, 1.0));
    q.y = fbm(p * 0.8 + vec2(1.0, t * 0.2));

    vec2 r = vec2(0.);
    r.x = fbm(p * 0.8 + 1.0 * q + vec2(1.7, 9.2) + t * 0.15);
    r.y = fbm(p * 0.8 + 1.0 * q + vec2(8.3, 2.8) + t * 0.126);
    
    // Smooth, organic fluid mechanics around cursor
    // The visual ripple scales with movement (activity), returning to 0 when static
    float mouseInfluence = smoothstep(1.5, 0.0, mouseDist) * activity;
    
    // Create a fluid ripple effect anchored to the background (p) coordinates
    // Using FBM creates natural, randomized water-like wave ridges across the canvas
    // This ensures the pattern stays tied to the background fluid instead of translating with the mouse
    float wave = sin(fbm(p * 3.0 + t * 0.1) * 30.0 - t * 12.0) * 0.5 + 0.5;
    
    // Normalize the diff to get pure direction
    vec2 pushDir = normalize(mouseDiff + vec2(0.0001));
    
    // Orthogonal vector to create swirling/vortex effect
    vec2 swirlDir = vec2(-pushDir.y, pushDir.x);
    
    // The displacement is masked by the cursor's footprint but the ripple pattern occurs locally on the background
    vec2 fluidDisplacement = (pushDir * 0.3 + swirlDir * 0.3) * wave * mouseInfluence;
    
    // Deformation applied gracefully
    r += fluidDisplacement * 1.2; 
    p -= fluidDisplacement * 0.3; // Slightly bend spatial coordinates to warp the grid

    float f = fbm(p + r * 2.0);

    // Fade pattern noise near the center of the mouse to make it less static (only when moving)
    f = mix(f, f * 0.6 + 0.1, smoothstep(0.8, 0.0, mouseDist) * activity * 0.6);

    // Color mixing utilizing theme colors
    vec3 colBase = mix(vec3(0.0), u_baseColor, clamp(f * 2.0 + 0.1, 0.0, 1.0));
    vec3 colMid = mix(colBase, u_midColor, clamp(length(q) * 1.0, 0.0, 1.0));
    vec3 colTop = mix(colMid, u_topColor, clamp(length(r.x) * 1.2, 0.0, 1.0));

    // Boost brightness of the pattern explicitly at the top of the page, and dim it down when scrolled
    // scrollFade is 1.0 at origin, dropping down to e.g. 0.6 (less dimming than before)
    colTop *= mix(0.6, 1.3, scrollFade);

    // Dynamic mouse glow fades out when mouse is static
    vec3 mouseGlow = u_glowColor * pow(mouseInfluence, 1.5) * 0.4 * scrollFade;
    
    // Add alpha blending based on intensity - reversed for light vs dark 
    float alphaDark = clamp(f * 1.2 + mouseInfluence * 0.4, 0.0, 1.0);
    float alphaLight = clamp((1.0 - f * 0.8) + mouseInfluence * 0.4, 0.0, 1.0);
    float alpha = mix(alphaLight, alphaDark, u_isDark);
    
    // Slightly fade the overall opacity as you scroll down for an even cleaner background feel
    // Keep opacity a bit higher when scrolled so the background remains visible
    fragColor = vec4(colTop + mouseGlow, alpha * mix(0.7, 0.95, scrollFade)); 
}
`;function $(n){const e=n.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1});if(!e)return console.error("WebGL 2 not supported"),()=>{};function l(t,o,i){const a=t.createShader(o);return a?(t.shaderSource(a,i),t.compileShader(a),t.getShaderParameter(a,t.COMPILE_STATUS)?a:(console.error(t.getShaderInfoLog(a)),t.deleteShader(a),null)):null}const m=l(e,e.VERTEX_SHADER,V),S=l(e,e.FRAGMENT_SHADER,j),r=e.createProgram();if(!r||!m||!S)return()=>{};if(e.attachShader(r,m),e.attachShader(r,S),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))return console.error(e.getProgramInfoLog(r)),()=>{};e.useProgram(r);const A=e.getAttribLocation(r,"a_position"),Y=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,Y),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0);const P=e.getUniformLocation(r,"u_resolution"),q=e.getUniformLocation(r,"u_time"),z=e.getUniformLocation(r,"u_mouse"),X=e.getUniformLocation(r,"u_isDark"),G=e.getUniformLocation(r,"u_seed"),N=e.getUniformLocation(r,"u_baseColor"),O=e.getUniformLocation(r,"u_midColor"),W=e.getUniformLocation(r,"u_topColor"),H=e.getUniformLocation(r,"u_glowColor"),_=[Math.random(),Math.random(),Math.random()];e.uniform3f(G,_[0],_[1],_[2]);let s={base:[.02,.05,.1],mid:[.1,.3,.5],top:[.3,.7,.9],glow:[.2,.6,1]};const C=t=>{const o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return o?[parseInt(o[1],16)/255,parseInt(o[2],16)/255,parseInt(o[3],16)/255]:[.5,.5,.5]},p=(t,o)=>t?t.startsWith("#")?C(t):t.length===3||t.length===6?C("#"+t):o:o,T=()=>{const o=(document.documentElement.getAttribute("data-theme")||U.light)===U.dark;try{const i=o?B.dark:B.light;i&&(s.base=p(i.base,o?[0,0,0]:[1,1,1]),s.mid=p(i.secondary,o?[.1,.3,.5]:[.6,.7,.9]),s.top=p(i.primary,o?[.3,.7,.9]:[.3,.5,.8]),s.glow=p(i.primary,o?[.3,.7,.9]:[.3,.5,.8]),e.uniform3fv(N,s.base),e.uniform3fv(O,s.mid),e.uniform3fv(W,s.top),e.uniform3fv(H,s.glow),e.uniform1f(X,o?1:0))}catch(i){console.error("Failed to parse themes",i)}};T();const M=new MutationObserver(t=>{t.forEach(o=>{o.attributeName==="data-theme"&&T()})});M.observe(document.documentElement,{attributes:!0});let g=0,v=0,w=0,b=0,y=0,x=0,d=0,E=!0,F=window.scrollY;const k=()=>{n.width=window.innerWidth,n.height=window.innerHeight,e.viewport(0,0,n.width,n.height),e.uniform2f(P,n.width,n.height)},I=new ResizeObserver(()=>{k()});I.observe(document.body),k();const c=t=>{let o,i;"touches"in t?(o=t.touches[0].clientX,i=t.touches[0].clientY):(o=t.clientX,i=t.clientY);const a=o/window.innerWidth,f=1-i/window.innerHeight;let u=a*2-1,h=f*2-1;u*=n.width/n.height,E&&(g=u,v=h,y=u,x=h,E=!1),w=u,b=h};window.addEventListener("mousemove",c),window.addEventListener("touchstart",c),window.addEventListener("touchmove",c);let K=performance.now(),D;const R=t=>{let o=w-y,i=b-x,a=Math.sqrt(o*o+i*i),f=window.scrollY,u=Math.abs(f-F);F=f,d+=a*3+u*.005,d*=.96,d=Math.min(Math.max(d,0),1);let h=Math.max(0,1-f/500);y=w,x=b,g+=(w-g)*.08,v+=(b-v)*.08,e.uniform1f(q,(t-K)/1e3),e.uniform4f(z,g,v,d,h),e.drawArrays(e.TRIANGLES,0,6),D=requestAnimationFrame(R)};return D=requestAnimationFrame(R),()=>{window.removeEventListener("mousemove",c),window.removeEventListener("touchstart",c),window.removeEventListener("touchmove",c),I.disconnect(),M.disconnect(),cancelAnimationFrame(D)}}let L;const J=()=>{L&&L();const n=document.getElementById("global-canvas");n&&(L=$(n));const e=new IntersectionObserver(l=>{l.forEach(m=>{m.isIntersecting&&m.target.classList.add("show-animate")})},{threshold:.1});document.querySelectorAll('.animate-on-scroll:not([data-skip-global-animation="true"])').forEach(l=>e.observe(l))};document.addEventListener("astro:page-load",J);
