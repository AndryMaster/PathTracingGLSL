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


// Scene 1
#define numSpheres 4
#define numBoxes 3
#define numPlanes 1
Sphere SceneSpheres[numSpheres];
Box SceneBoxes[numBoxes];
Plane ScenePlanes[numPlanes];
void InitializeScene() {
    // Sphere 1
	{SceneSpheres[0].R = .7;
	SceneSpheres[0].pos = vec3(0, 1, -5);
	SceneSpheres[0].material.color = vec4(0.7, 0.0, 0.5, 0);
	SceneSpheres[0].material.roughness = 0.001;
	SceneSpheres[0].material.opacity = 0.0;}
	// Sphere 2
	{SceneSpheres[1].R = 2.0;
	SceneSpheres[1].pos = vec3(1.0, 1.0, -8.);
	SceneSpheres[1].material.color = vec4(0.3, 1.0, 0.0, 0);
	SceneSpheres[1].material.roughness = 0.5;
	SceneSpheres[1].material.opacity = 0.0;}
	// Sphere 3 opacity
	{SceneSpheres[2].R = 0.6;
	SceneSpheres[2].pos = vec3(4.0, 0.601, 1.);
	SceneSpheres[2].material.color = vec4(1, 1, 1, 0);
	SceneSpheres[2].material.roughness = 0.0;
	SceneSpheres[2].material.opacity = 0.22;}
	// Sphere 4 light
	{SceneSpheres[3].R = 0.45;
	SceneSpheres[3].pos = vec3(2.3, 0.8, -4.2);
	SceneSpheres[3].material.color = vec4(1);
	SceneSpheres[3].material.roughness = 0.5;
	SceneSpheres[3].material.opacity = 0.0;}
	// Box 1
	{SceneBoxes[0].material.color = vec4(0.3, 0.2, 0.9, 0);
	SceneBoxes[0].material.roughness = 0.5;
	SceneBoxes[0].material.opacity = 0.0; // 0.12
	SceneBoxes[0].xyzSize = vec3(.5);
	SceneBoxes[0].pos = vec3(-1., .5, -3.7);// mat3(.707, 0, .707,   0, 1, 0,   -.707, 0, .707);
	SceneBoxes[0].rotation = mat3(.9659, 0, .2588,   0, 1, 0,   -.2588, 0, .9659);}
	// Box 2
	{SceneBoxes[1].material.color = vec4(0.4, 0.5, 0.9, 0);
	SceneBoxes[1].material.roughness = 0.005;
	SceneBoxes[1].material.opacity = 0.0;
	SceneBoxes[1].xyzSize = vec3(.6);
	SceneBoxes[1].pos = vec3(-1.2, .6, 3);
	SceneBoxes[1].rotation = mat3(1, 0, 0,  0, 1, 0,  0, 0, 1);}
	// Box 3
	{SceneBoxes[2].material.color = vec4(0.4, 0.5, 0.9, 0);
	SceneBoxes[2].material.roughness = 0.005;
	SceneBoxes[2].material.opacity = 0.0;
	SceneBoxes[2].xyzSize = vec3(.6);
	SceneBoxes[2].pos = vec3(1.2, .6, 3);
	SceneBoxes[2].rotation = mat3(1, 0, 0,  0, 1, 0,  0, 0, 1);}
	// Plane 1 "floor"
	{ScenePlanes[0].material.color = vec4(0.4, 0.35, 0.2, 0);
	ScenePlanes[0].material.roughness = 0.55;
	ScenePlanes[0].material.opacity = 0.0;
	ScenePlanes[0].normal = vec3(0, 1, 0);
	ScenePlanes[0].pos = vec3(0, 0, 0);}
}

// Scene 2 (комната(оранжевый, голубой), свет сбоку)
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

