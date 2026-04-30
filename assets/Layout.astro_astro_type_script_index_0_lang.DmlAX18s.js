import{t as U}from"./config.ZNrnzrlj.js";import{g as K}from"./_commonjsHelpers.CqkleIqs.js";const V=`#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`,J=`#version 300 es
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
`;var F,q;function Q(){return q||(q=1,F={aqua:{"color-scheme":"dark",primary:"#09ecf3","primary-content":"#005355",secondary:"#966fb3",accent:"#ffe999",neutral:"#3b8ac4","base-100":"#345da7",info:"#2563eb",success:"#16a34a",warning:"#d97706",error:"oklch(73.95% 0.19 27.33)"},black:{"color-scheme":"dark",primary:"#373737",secondary:"#373737",accent:"#373737","base-100":"#000000","base-200":"#141414","base-300":"#262626","base-content":"#d6d6d6",neutral:"#373737",info:"#0000ff",success:"#008000",warning:"#ffff00",error:"#ff0000","--rounded-box":"0","--rounded-btn":"0","--rounded-badge":"0","--animation-btn":"0","--animation-input":"0","--btn-focus-scale":"1","--tab-radius":"0"},bumblebee:{"color-scheme":"light",primary:"oklch(89.51% 0.2132 96.61)","primary-content":"oklch(38.92% 0.046 96.61)",secondary:"oklch(80.39% 0.194 70.76)","secondary-content":"oklch(39.38% 0.068 70.76)",accent:"oklch(81.27% 0.157 56.52)",neutral:"oklch(12.75% 0.075 281.99)","base-100":"oklch(100% 0 0)"},cmyk:{"color-scheme":"light",primary:"#45AEEE",secondary:"#E8488A",accent:"#FFF232",neutral:"#1a1a1a","base-100":"oklch(100% 0 0)",info:"#4AA8C0",success:"#823290",warning:"#EE8133",error:"#E93F33"},corporate:{"color-scheme":"light",primary:"oklch(60.39% 0.228 269.1)",secondary:"#7b92b2",accent:"#67cba0",neutral:"#181a2a","neutral-content":"#edf2f7","base-100":"oklch(100% 0 0)","base-content":"#181a2a","--rounded-box":"0.25rem","--rounded-btn":".125rem","--rounded-badge":".125rem","--tab-radius":"0.25rem","--animation-btn":"0","--animation-input":"0","--btn-focus-scale":"1"},cupcake:{"color-scheme":"light",primary:"#65c3c8",secondary:"#ef9fbc",accent:"#eeaf3a",neutral:"#291334","base-100":"#faf7f5","base-200":"#efeae6","base-300":"#e7e2df","base-content":"#291334","--rounded-btn":"1.9rem","--tab-border":"2px","--tab-radius":"0.7rem"},cyberpunk:{"color-scheme":"light",fontFamily:"ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",primary:"oklch(74.22% 0.209 6.35)",secondary:"oklch(83.33% 0.184 204.72)",accent:"oklch(71.86% 0.2176 310.43)",neutral:"oklch(23.04% 0.065 269.31)","neutral-content":"oklch(94.51% 0.179 104.32)","base-100":"oklch(94.51% 0.179 104.32)","--rounded-box":"0","--rounded-btn":"0","--rounded-badge":"0","--tab-radius":"0"},dark:{"color-scheme":"dark",primary:"oklch(65.69% 0.196 275.75)",secondary:"oklch(74.8% 0.26 342.55)",accent:"oklch(74.51% 0.167 183.61)",neutral:"#2a323c","neutral-content":"#A6ADBB","base-100":"#1d232a","base-200":"#191e24","base-300":"#15191e","base-content":"#A6ADBB"},dracula:{"color-scheme":"dark",primary:"#ff79c6",secondary:"#bd93f9",accent:"#ffb86c",neutral:"#414558","base-100":"#282a36","base-content":"#f8f8f2",info:"#8be9fd",success:"#50fa7b",warning:"#f1fa8c",error:"#ff5555"},emerald:{"color-scheme":"light",primary:"#66cc8a","primary-content":"#223D30",secondary:"#377cfb","secondary-content":"#fff",accent:"#f68067","accent-content":"#000",neutral:"#333c4d","neutral-content":"#f9fafb","base-100":"oklch(100% 0 0)","base-content":"#333c4d","--animation-btn":"0","--animation-input":"0","--btn-focus-scale":"1"},fantasy:{"color-scheme":"light",primary:"oklch(37.45% 0.189 325.02)",secondary:"oklch(53.92% 0.162 241.36)",accent:"oklch(75.98% 0.204 56.72)",neutral:"#1f2937","base-100":"oklch(100% 0 0)","base-content":"#1f2937"},forest:{"color-scheme":"dark",primary:"#1eb854","primary-content":"#000000",secondary:"#1DB88E",accent:"#1DB8AB",neutral:"#19362D","base-100":"#171212","--rounded-btn":"1.9rem"},garden:{"color-scheme":"light",primary:"oklch(62.45% 0.278 3.8363600743192197)","primary-content":"#fff",secondary:"#8E4162",accent:"#5c7f67",neutral:"#291E00","neutral-content":"#e9e7e7","base-100":"#e9e7e7","base-content":"#100f0f"},halloween:{"color-scheme":"dark",primary:"oklch(77.48% 0.204 60.62)","primary-content":"#131616",secondary:"oklch(45.98% 0.248 305.03)",accent:"oklch(64.8% 0.223 136.07347934356451)","accent-content":"#000000",neutral:"#2F1B05","base-100":"#212121",info:"#2563eb",success:"#16a34a",warning:"#d97706",error:"oklch(65.72% 0.199 27.33)"},light:{"color-scheme":"light",primary:"oklch(49.12% 0.3096 275.75)",secondary:"oklch(69.71% 0.329 342.55)","secondary-content":"oklch(98.71% 0.0106 342.55)",accent:"oklch(76.76% 0.184 183.61)",neutral:"#2B3440","neutral-content":"#D7DDE4","base-100":"oklch(100% 0 0)","base-200":"#F2F2F2","base-300":"#E5E6E6","base-content":"#1f2937"},lofi:{"color-scheme":"light",primary:"#0D0D0D","primary-content":"oklch(100% 0 0)",secondary:"#1A1919","secondary-content":"oklch(100% 0 0)",accent:"#262626","accent-content":"oklch(100% 0 0)",neutral:"#000000","neutral-content":"oklch(100% 0 0)","base-100":"oklch(100% 0 0)","base-200":"#F2F2F2","base-300":"#E6E5E5","base-content":"#000000",info:"oklch(79.54% 0.103 205.9)",success:"oklch(90.13% 0.153 164.14)",warning:"oklch(88.37% 0.135 79.94)",error:"oklch(78.66% 0.15 28.47)","--rounded-box":"0.25rem","--rounded-btn":"0.125rem","--rounded-badge":"0.125rem","--tab-radius":"0.125rem","--animation-btn":"0","--animation-input":"0","--btn-focus-scale":"1"},luxury:{"color-scheme":"dark",primary:"oklch(100% 0 0)",secondary:"#152747",accent:"#513448",neutral:"#331800","neutral-content":"#FFE7A3","base-100":"#09090b","base-200":"#171618","base-300":"#2e2d2f","base-content":"#dca54c",info:"#66c6ff",success:"#87d039",warning:"#e2d562",error:"#ff6f6f"},pastel:{"color-scheme":"light",primary:"#d1c1d7",secondary:"#f6cbd1",accent:"#b4e9d6",neutral:"#70acc7","base-100":"oklch(100% 0 0)","base-200":"#f9fafb","base-300":"#d1d5db","--rounded-btn":"1.9rem","--tab-radius":"0.7rem"},retro:{"color-scheme":"light",primary:"#ef9995","primary-content":"#282425",secondary:"#a4cbb4","secondary-content":"#282425",accent:"#DC8850","accent-content":"#282425",neutral:"#2E282A","neutral-content":"#EDE6D4","base-100":"#ece3ca","base-200":"#e4d8b4","base-300":"#DBCA9A","base-content":"#282425",info:"#2563eb",success:"#16a34a",warning:"#d97706",error:"oklch(65.72% 0.199 27.33)","--rounded-box":"0.4rem","--rounded-btn":"0.4rem","--rounded-badge":"0.4rem","--tab-radius":"0.4rem"},synthwave:{"color-scheme":"dark",primary:"#e779c1",secondary:"#58c7f3",accent:"oklch(88.04% 0.206 93.72)",neutral:"#221551","neutral-content":"#f9f7fd","base-100":"#1a103d","base-content":"#f9f7fd",info:"#53c0f3","info-content":"#201047",success:"#71ead2","success-content":"#201047",warning:"#eace6c","warning-content":"#201047",error:"#ec8c78","error-content":"#201047"},valentine:{"color-scheme":"light",primary:"#e96d7b",secondary:"#a991f7",accent:"#66b1b3",neutral:"#af4670","neutral-content":"#f0d6e8","base-100":"#fae7f4","base-content":"#632c3b",info:"#2563eb",success:"#16a34a",warning:"#d97706",error:"oklch(73.07% 0.207 27.33)","--rounded-btn":"1.9rem","--tab-radius":"0.7rem"},wireframe:{"color-scheme":"light",fontFamily:"Chalkboard,comic sans ms,'sans-serif'",primary:"#b8b8b8",secondary:"#b8b8b8",accent:"#b8b8b8",neutral:"#ebebeb","base-100":"oklch(100% 0 0)","base-200":"#eeeeee","base-300":"#dddddd",info:"#0000ff",success:"#008000",warning:"#a6a659",error:"#ff0000","--rounded-box":"0.2rem","--rounded-btn":"0.2rem","--rounded-badge":"0.2rem","--tab-radius":"0.2rem"},autumn:{"color-scheme":"light",primary:"#8C0327",secondary:"#D85251",accent:"#D59B6A",neutral:"#826A5C","base-100":"#f1f1f1",info:"#42ADBB",success:"#499380",warning:"#E97F14",error:"oklch(53.07% 0.241 24.16)"},business:{"color-scheme":"dark",primary:"#1C4E80",secondary:"#7C909A",accent:"#EA6947",neutral:"#23282E","base-100":"#202020",info:"#0091D5",success:"#6BB187",warning:"#DBAE59",error:"#AC3E31","--rounded-box":"0.25rem","--rounded-btn":".125rem","--rounded-badge":".125rem"},acid:{"color-scheme":"light",primary:"oklch(71.9% 0.357 330.7595734057481)",secondary:"oklch(73.37% 0.224 48.25087840015526)",accent:"oklch(92.78% 0.264 122.96295065960891)",neutral:"oklch(21.31% 0.128 278.68)","base-100":"#fafafa",info:"oklch(60.72% 0.227 252.05)",success:"oklch(85.72% 0.266 158.53)",warning:"oklch(91.01% 0.212 100.5)",error:"oklch(64.84% 0.293 29.34918758658804)","--rounded-box":"1.25rem","--rounded-btn":"1rem","--rounded-badge":"1rem","--tab-radius":"0.7rem"},lemonade:{"color-scheme":"light",primary:"oklch(58.92% 0.199 134.6)",secondary:"oklch(77.75% 0.196 111.09)",accent:"oklch(85.39% 0.201 100.73)",neutral:"oklch(30.98% 0.075 108.6)","base-100":"oklch(98.71% 0.02 123.72)",info:"oklch(86.19% 0.047 224.14)",success:"oklch(86.19% 0.047 157.85)",warning:"oklch(86.19% 0.047 102.15)",error:"oklch(86.19% 0.047 25.85)"},night:{"color-scheme":"dark",primary:"#38bdf8",secondary:"#818CF8",accent:"#F471B5",neutral:"#1E293B","base-100":"#0F172A",info:"#0CA5E9","info-content":"#000000",success:"#2DD4BF",warning:"#F4BF50",error:"#FB7085"},coffee:{"color-scheme":"dark",primary:"#DB924B",secondary:"#263E3F",accent:"#10576D",neutral:"#120C12","base-100":"#20161F","base-content":"#c59f60",info:"#8DCAC1",success:"#9DB787",warning:"#FFD25F",error:"#FC9581"},winter:{"color-scheme":"light",primary:"oklch(56.86% 0.255 257.57)",secondary:"#463AA2",accent:"#C148AC",neutral:"#021431","base-100":"oklch(100% 0 0)","base-200":"#F2F7FF","base-300":"#E3E9F4","base-content":"#394E6A",info:"#93E7FB",success:"#81CFD1",warning:"#EFD7BB",error:"#E58B8B"},dim:{"color-scheme":"dark",primary:"#9FE88D",secondary:"#FF7D5C",accent:"#C792E9",neutral:"#1c212b","neutral-content":"#B2CCD6","base-100":"#2A303C","base-200":"#242933","base-300":"#20252E","base-content":"#B2CCD6",info:"#28ebff",success:"#62efbd",warning:"#efd057",error:"#ffae9b"},nord:{"color-scheme":"light",primary:"#5E81AC",secondary:"#81A1C1",accent:"#88C0D0",neutral:"#4C566A","neutral-content":"#D8DEE9","base-100":"#ECEFF4","base-200":"#E5E9F0","base-300":"#D8DEE9","base-content":"#2E3440",info:"#B48EAD",success:"#A3BE8C",warning:"#EBCB8B",error:"#BF616A","--rounded-box":"0.4rem","--rounded-btn":"0.2rem","--rounded-badge":"0.4rem","--tab-radius":"0.2rem"},sunset:{"color-scheme":"dark",primary:"#FF865B",secondary:"#FD6F9C",accent:"#B387FA",neutral:"oklch(26% 0.019 237.69)","neutral-content":"oklch(70% 0.019 237.69)","base-100":"oklch(22% 0.019 237.69)","base-200":"oklch(20% 0.019 237.69)","base-300":"oklch(18% 0.019 237.69)","base-content":"#9fb9d0",info:"#89e0eb",success:"#addfad",warning:"#f1c891",error:"#ffbbbd","--rounded-box":"1.2rem","--rounded-btn":"0.8rem","--rounded-badge":"0.4rem","--tab-radius":"0.7rem"}}),F}var Z=Q();const ee=K(Z);function oe(c){const e=c.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1});if(!e)return console.error("WebGL 2 not supported"),()=>{};function u(o,t,r){const n=o.createShader(t);return n?(o.shaderSource(n,r),o.compileShader(n),o.getShaderParameter(n,o.COMPILE_STATUS)?n:(console.error(o.getShaderInfoLog(n)),o.deleteShader(n),null)):null}const f=u(e,e.VERTEX_SHADER,V),C=u(e,e.FRAGMENT_SHADER,J),a=e.createProgram();if(!a||!f||!C)return()=>{};if(e.attachShader(a,f),e.attachShader(a,C),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))return console.error(e.getProgramInfoLog(a)),()=>{};e.useProgram(a);const B=e.getAttribLocation(a,"a_position"),Y=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,Y),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(B),e.vertexAttribPointer(B,2,e.FLOAT,!1,0,0);const P=e.getUniformLocation(a,"u_resolution"),z=e.getUniformLocation(a,"u_time"),N=e.getUniformLocation(a,"u_mouse"),X=e.getUniformLocation(a,"u_isDark"),G=e.getUniformLocation(a,"u_seed"),O=e.getUniformLocation(a,"u_baseColor"),W=e.getUniformLocation(a,"u_midColor"),H=e.getUniformLocation(a,"u_topColor"),$=e.getUniformLocation(a,"u_glowColor"),k=[Math.random(),Math.random(),Math.random()];e.uniform3f(G,k[0],k[1],k[2]);let l={base:[.02,.05,.1],mid:[.1,.3,.5],top:[.3,.7,.9],glow:[.2,.6,1]};const x=o=>{const t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;o=o.replace(t,(n,s,i,d)=>s+s+i+i+d+d);const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(o);return r?[parseInt(r[1],16)/255,parseInt(r[2],16)/255,parseInt(r[3],16)/255]:[.5,.5,.5]},v=(o,t)=>o?o.startsWith("#")?x(o):o.length===3||o.length===6?x("#"+o):t:t,_=()=>{const o=document.documentElement.getAttribute("data-theme")||U.light,t=o===U.dark;try{const r=ee[o];if(r){const n=v(r["base-100"],[0,0,0]),s=v(r.primary,t?[.3,.7,.9]:[.2,.4,.7]),i=v(r.secondary,t?[.1,.3,.5]:[.5,.6,.8]);l.base=[n[0]*.8,n[1]*.8,n[2]*.8],l.mid=i,l.top=s,l.glow=s,e.uniform3fv(O,l.base),e.uniform3fv(W,l.mid),e.uniform3fv(H,l.top),e.uniform3fv($,l.glow),e.uniform1f(X,t?1:0)}}catch(r){console.error("Failed to parse themes",r)}};_();const L=new MutationObserver(o=>{o.forEach(t=>{t.attributeName==="data-theme"&&_()})});L.observe(document.documentElement,{attributes:!0});let b=0,p=0,g=0,y=0,w=0,E=0,h=0,T=!0,M=window.scrollY;const S=()=>{c.width=window.innerWidth,c.height=window.innerHeight,e.viewport(0,0,c.width,c.height),e.uniform2f(P,c.width,c.height)},I=new ResizeObserver(()=>{S()});I.observe(document.body),S();const m=o=>{let t,r;"touches"in o?(t=o.touches[0].clientX,r=o.touches[0].clientY):(t=o.clientX,r=o.clientY);const n=t/window.innerWidth,s=1-r/window.innerHeight;let i=n*2-1,d=s*2-1;i*=c.width/c.height,T&&(b=i,p=d,w=i,E=d,T=!1),g=i,y=d};window.addEventListener("mousemove",m),window.addEventListener("touchstart",m),window.addEventListener("touchmove",m);let j=performance.now(),D;const R=o=>{let t=g-w,r=y-E,n=Math.sqrt(t*t+r*r),s=window.scrollY,i=Math.abs(s-M);M=s,h+=n*3+i*.005,h*=.96,h=Math.min(Math.max(h,0),1);let d=Math.max(0,1-s/500);w=g,E=y,b+=(g-b)*.08,p+=(y-p)*.08,e.uniform1f(z,(o-j)/1e3),e.uniform4f(N,b,p,h,d),e.drawArrays(e.TRIANGLES,0,6),D=requestAnimationFrame(R)};return D=requestAnimationFrame(R),()=>{window.removeEventListener("mousemove",m),window.removeEventListener("touchstart",m),window.removeEventListener("touchmove",m),I.disconnect(),L.disconnect(),cancelAnimationFrame(D)}}let A;const re=()=>{A&&A();const c=document.getElementById("global-canvas");c&&(A=oe(c));const e=new IntersectionObserver(u=>{u.forEach(f=>{f.isIntersecting&&f.target.classList.add("show-animate")})},{threshold:.1});document.querySelectorAll(".animate-on-scroll").forEach(u=>e.observe(u))};document.addEventListener("astro:page-load",re);
