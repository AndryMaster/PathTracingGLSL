#version 460            // #version 130
out vec4 FragColor;

#define SamplesCount int(10)
#define MAX_DIST 99999.
#define MAX_REFLCT int(12)
#define PI 3.14159265359
#define gLIGHT normalize(vec3(.25, .75, .95))

uniform float uTime;
uniform vec3 uCamPos;
uniform vec2 uMousePos;
uniform vec2 uResolution;
uniform sampler2D uSample;
uniform float uSamplePart;
uniform vec2 uSeed_1;
uniform vec2 uSeed_2;

uvec4 R_STATE;
const vec3 skyColor = vec3(0.3, 0.6, 1.0) * max(0, dot(gLIGHT, vec3(0, 1, 0)));

struct Material {
	vec4 color;            // цвет (rgb=отражающая способность по каналам, a=источник света)
	float roughness;       // рассеивание (отражение -> дифузность,матовость) [0, 1]
    float opacity;         // пропускная способность (прозрачность) [0, +oo] (преломление n=1+opacity) alpha=0!
};

struct Sphere {
	Material material;
	float R;
	vec3 pos;
};

struct Box {
	Material material;
	vec3 xyzSize;
	mat3 rotation;
	vec3 pos;
};

struct Plane {
	Material material;
	vec3 normal;
	vec3 pos;
};

mat2 rotate2x2(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat2(c, -s, s, c);
}

uint TausStep(uint z, int S1, int S2, int S3, uint M) {
	uint b = (((z << S1) ^ z) >> S2);
	return (((z & M) << S3) ^ b);
}

uint LCGStep(uint w, uint A, uint B) {
	return (A * w + B);
}

vec2 hash22(vec2 p2) {
	p2 += uSeed_1.x;
	vec3 p3 = fract(p2.xyx * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.xx + p3.yz) * p3.zy);
}

float random() {
	R_STATE.x = TausStep(R_STATE.x, 13, 19, 12, uint(4294967294));
	R_STATE.y = TausStep(R_STATE.y, 2,  25, 4,  uint(4294967288));
	R_STATE.z = TausStep(R_STATE.z, 3,  11, 17, uint(4294967280));
	R_STATE.w = LCGStep(R_STATE.w, uint(1664525), uint(1013904223));
	return 2.3283064365387e-10 * float((R_STATE.x ^ R_STATE.y ^ R_STATE.z ^ R_STATE.w));
}

float random_1(vec2 uv) {
	return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float random_2(vec2 uv) {
	return fract(sin(dot((uv.xy * fract(uTime * 12.343)), vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 randomOnSphere() {
	vec3 rand = vec3(random(), random(), random());
	float theta = 2 * PI * rand.x;
	float phi = acos(2.0 * rand.y - 1.0);
	float r = pow(rand.z, 1 / 3);
	float x = r * sin(phi) * cos(theta),
		  y = r * sin(phi) * sin(theta),
		  z = r * cos(phi); 
	return vec3(x, y, z);
}

// Scene: define важно!
#define numSpheres 6
#define numBoxes 4
#define numPlanes 6
Sphere SceneSpheres[numSpheres];
Box SceneBoxes[numBoxes];
Plane ScenePlanes[numPlanes];
void InitializeScene() {
    // Sphere_0 big 
	{SceneSpheres[0].R = 1.7;
	SceneSpheres[0].pos = vec3(-2.45, 1.7, -8.2);
	SceneSpheres[0].material.color = vec4(vec3(0.85), 0);
	SceneSpheres[0].material.roughness = 0.0015;
	SceneSpheres[0].material.opacity = 0.0;}
	// Sphere_1 roughness
	{SceneSpheres[1].R = 0.9;
	SceneSpheres[1].pos = vec3(-2.6, 0.9, -4.1);
	SceneSpheres[1].material.color = vec4(vec3(0.95), 0);
	SceneSpheres[1].material.roughness = 0.55;
	SceneSpheres[1].material.opacity = 0.0;}
	// Sphere_2 green
	{SceneSpheres[2].R = 0.65;
	SceneSpheres[2].pos = vec3(2.7, 2.85, -8.8);
	SceneSpheres[2].material.color = vec4(0.2, 1.0, 0.1, 0);
	SceneSpheres[2].material.roughness = 0.03;
	SceneSpheres[2].material.opacity = 0.0;}
	// Sphere_3 purple
	{SceneSpheres[3].R = 0.6;
	SceneSpheres[3].pos = vec3(0.05, 0.6, -2.7);
	SceneSpheres[3].material.color = vec4(0.95, 0.5, 0.95, 0);
	SceneSpheres[3].material.roughness = 0.6;
	SceneSpheres[3].material.opacity = 0.0;}
	// Sphere_4 opacity focus
	{SceneSpheres[4].R = 0.5;
	SceneSpheres[4].pos = vec3(3.9, 0.9, -4.6);
	SceneSpheres[4].material.color = vec4(vec3(1), 0);
	SceneSpheres[4].material.roughness = 0.0;
	SceneSpheres[4].material.opacity = 0.33;}
	// Sphere_5 opacity
	{SceneSpheres[5].R = 0.78;
	SceneSpheres[5].pos = vec3(2., 2.05, -4.75);
	SceneSpheres[5].material.color = vec4(vec3(0.1, 1, 0.75), 0);
	SceneSpheres[5].material.roughness = 0.0;
	SceneSpheres[5].material.opacity = 0.12;}
	// Box_0 light
	{SceneBoxes[0].material.color = vec4(vec3(1), 1);
	SceneBoxes[0].material.roughness = 0.0;
	SceneBoxes[0].material.opacity = 0.0;
	SceneBoxes[0].xyzSize = vec3(0.015, 1.15, 1.4);
	SceneBoxes[0].pos = vec3(-5, 2.9, -5.6);
	SceneBoxes[0].rotation = mat3(1, 0, 0,  0, 1, 0,  0, 0, 1);}
	// Box_1
	{SceneBoxes[1].material.color = vec4(0.5, 0.9, 0.75, 0);
	SceneBoxes[1].material.roughness = 0.75;
	SceneBoxes[1].material.opacity = 0.0;
	SceneBoxes[1].xyzSize = vec3(1.1);
	SceneBoxes[1].pos = vec3(2.9, 1.1, -8.8);
	SceneBoxes[1].rotation = mat3(.9659, 0, .2588,   0, 1, 0,   -.2588, 0, .9659);}
	// Box_2 opacity
	{SceneBoxes[2].material.color = vec4(0.4, 0.75, 1.0, 0);
	SceneBoxes[2].material.roughness = 0.0;
	SceneBoxes[2].material.opacity = 0.25;
	SceneBoxes[2].xyzSize = vec3(0.5);
	SceneBoxes[2].pos = vec3(-0.9, 0.5001, -1.6);
	SceneBoxes[2].rotation = mat3(.707, 0, .707,   0, 1, 0,   -.707, 0, .707);}
	// Plane_0 down
	{ScenePlanes[0].material.color = vec4(vec3(0.7), 0);
	ScenePlanes[0].material.roughness = 0.95;
	ScenePlanes[0].material.opacity = 0.0;
	ScenePlanes[0].normal = vec3(0, 1, 0);
	ScenePlanes[0].pos = vec3(0, 0, 0);}
	// Plane_1 up
	{ScenePlanes[1].material.color = vec4(vec3(0.7), 0);
	ScenePlanes[1].material.roughness = 0.95;
	ScenePlanes[1].material.opacity = 0.0;
	ScenePlanes[1].normal = vec3(0, -1, 0);
	ScenePlanes[1].pos = vec3(0, 5.8, 0);}
	// Plane_2 front
	{ScenePlanes[2].material.color = vec4(vec3(0.7), 0);
	ScenePlanes[2].material.roughness = 0.95;
	ScenePlanes[2].material.opacity = 0.0;
	ScenePlanes[2].normal = vec3(0, 0, 1);
	ScenePlanes[2].pos = vec3(0, 0, -10);}
	// Plane_3 back
	{ScenePlanes[3].material.color = vec4(vec3(0.7), 0);
	ScenePlanes[3].material.roughness = 0.95;
	ScenePlanes[3].material.opacity = 0.0;
	ScenePlanes[3].normal = vec3(0, 0, -1);
	ScenePlanes[3].pos = vec3(0, 0, 5);}
	// Plane_4 left
	{ScenePlanes[4].material.color = vec4(1, 0.7, 0, 0);
	ScenePlanes[4].material.roughness = 0.95;
	ScenePlanes[4].material.opacity = 0.0;
	ScenePlanes[4].normal = vec3(1, 0, 0);
	ScenePlanes[4].pos = vec3(-5, 0, 0);}
	// Plane_5 right
	{ScenePlanes[5].material.color = vec4(0, 0.75, 1, 0);
	ScenePlanes[5].material.roughness = 0.95;
	ScenePlanes[5].material.opacity = 0.0;
	ScenePlanes[5].normal = vec3(-1, 0, 0);
	ScenePlanes[5].pos = vec3(5, 0, 0);}
}

vec3 getSky(vec3 rd) {
	// skyColor: vec3 col = vec3(0.3, 0.6, 1.0) * max(0, dot(gLIGHT, vec3(0, 1, 0)));
	vec3 sun = vec3(.95, 0.9, 1.0) * max(0, pow(dot(rd, gLIGHT), 256.));
	return clamp(skyColor + sun, 0, 1);
}

vec2 boxIntersect(vec3 ro, vec3 rd, in vec3 xyzSize, in vec3 boxPos, in mat3 rotation, out vec3 normal) { 
	rd = rotation * rd;
	ro = rotation * (ro - boxPos);
	vec3 m = 1.0/rd;
	vec3 n = m * ro,
		 k = abs(m) * xyzSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;

	float tN = max(max(t1.x, t1.y), t1.z);
	float tF = min(min(t2.x, t2.y), t2.z);
	if (tN > tF || tF < 0.0) return vec2(-1.0);

	normal = transpose(rotation) * vec3(-sign(rd) * step(tN, t1));
	
	return vec2(tN, tF);
}

vec2 sphIntersect(in vec3 Centr2Orig, in vec3 rd, float R, out vec3 normal) {
	float k2 = dot(rd, Centr2Orig),   // k1=1; len(rd)=1 -> rd*rd=1*1=1
		  k3 = dot(Centr2Orig, Centr2Orig) - R * R;
	float D = k2*k2 - k3;
	if (D > 0.0) {
		D = sqrt(D);
		normal = normalize(Centr2Orig + rd * (-k2 - D));
		return vec2(-k2 - D, -k2 + D);
	}
	return vec2(-1.0);
}

vec2 plnIntersect(in vec3 roWithPos, in vec3 rd, in vec3 normal) {
	return vec2(-dot(roWithPos.xyz, normal.xyz)/dot(rd, normal.xyz));
}

vec3 reflect_and_diffuse_1(vec3 rd, vec3 normal, float roughness) {
	vec3 reflected = reflect(rd, normal);
	vec3 rand = randomOnSphere();
	vec3 diffuse = normalize(rand * dot(rand, normal));
	return mix(reflected, diffuse, roughness);
}

vec3 reflect_and_diffuse_2(vec3 rd, vec3 normal, float roughness) {
	if (roughness < random()) return reflect(rd, normal);
	vec3 rand = randomOnSphere();
	return normalize(rand * dot(rand, normal));  // vec3 diffuse =
}

vec4 castRay(inout vec3 ro, inout vec3 rd) { 
	vec2 t, min_t = vec2(MAX_DIST);
	vec3 n_, normal; // vec4 color;
	Material mater;

	Sphere sph;
	for (int i = 0; i < numSpheres; i++) {
		sph = SceneSpheres[i];
		t = sphIntersect(ro - sph.pos, rd, sph.R, n_);
		if (t.x > 0.0 && t.x < min_t.x) {
			min_t = t;
			normal = n_;
			mater = sph.material;}
	}

	Box box;
	for (int i = 0; i < numBoxes; i++) {
		box = SceneBoxes[i];
		t = boxIntersect(ro, rd, box.xyzSize, box.pos, box.rotation, n_);
		if (t.x > 0.0 && t.x < min_t.x) {
			min_t = t;
			normal = n_;             // color = vec4(abs(normal), 0)
			mater = box.material;}
	}

	Plane pln;
	for (int i = 0; i < numPlanes; i++) {
		pln = ScenePlanes[i];
		t = plnIntersect(ro - pln.pos, rd, pln.normal);
		if (t.x > 0.0 && t.x < min_t.x) {
			min_t = t;
			normal = pln.normal;  // обратная сторона: * -sign(dot(pln.normal, rd))
			mater = pln.material;}
	}

	if (min_t == MAX_DIST) return vec4(getSky(rd), 1);  // Sky vec4(0,0,0,1);
	if (mater.color.a > 0) return mater.color;  // источник света
	if (mater.opacity > 0) {                    // прозрачное преломление
		float fresnel = 1.0 - abs(dot(-rd, normal));
		if (random() < fresnel * fresnel) { 
			rd = reflect(rd, normal); 
			return mater.color;
		}
		ro += rd * (min_t.y + 0.00001);
		rd = refract(rd, normal, 1.0 / (1.0 + mater.opacity));
		return mater.color;
	}
	
	ro += (rd * min_t.x) + (normal * 0.0001);
	rd = reflect_and_diffuse_1(rd, normal, mater.roughness);
	return mater.color;
}

vec3 traceRay(vec3 ro, vec3 rd) {
	vec3 color = vec3(1);
	for (int i = 0; i < MAX_REFLCT; i++) {
		vec4 refColor = castRay(ro, rd);
		color *= refColor.rgb;
		if (refColor.a > 0) return color * refColor.a;  // Достигнут источник света -> возвращаемся.
	}
	return vec3(0.0);
}

vec3 getAntiAlisingRD(vec2 uv, float focus_dist) { return vec3(0); }

void main() 
{
	InitializeScene();

	vec2 Coord = gl_FragCoord.xy / uResolution;
	vec2 uv = (Coord - 0.5) * uResolution / uResolution.y;
	
	vec2 uvForRand = hash22(uv + 1.0) * uResolution + uResolution;
	R_STATE.x = uint(uSeed_1.x + uvForRand.x);
	R_STATE.y = uint(uSeed_1.y + uvForRand.x);
	R_STATE.z = uint(uSeed_2.x + uvForRand.y);
	R_STATE.w = uint(uSeed_2.y + uvForRand.y);

	vec3 rayOrigin = uCamPos;
	vec3 rayDirection = normalize(vec3(uv, -1));  // -1 = FOV=60 (No focuse anti-aliasing)
	rayDirection.yz *= rotate2x2(-uMousePos.y);     
	rayDirection.xz *= rotate2x2(uMousePos.x);

	vec3 color = vec3(0.0);
	for (int i = 0; i < SamplesCount; i++) {
		color += traceRay(rayOrigin, rayDirection);
	}
	color /= SamplesCount;

	// Post processing (Tone Mapping)
	// legacy: color = pow(color, vec3(0.45));
	float white = 8.6;    // 4    // яркость
	float exposure = 39;  // 16   // яркость * контастность
	color *= white * exposure;
	color = (color * (1.0 + color / white / white)) / (1.0 + color);

	vec3 sampleColor = texture(uSample, Coord).rgb;
	color = mix(sampleColor, color, uSamplePart);
	FragColor = vec4(color, 1.0);
}
