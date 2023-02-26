#include <random>
#include <format>
#include <SFML/Graphics.hpp>

// 1920*1080, 2560*1440, 3840*2160, 7680*4320, 12288x6480
#define w 1200
#define h 800

int main()
{
    int mouseX = w / 2;
    int mouseY = h / 2;
    bool mouseHidden = true;
    float mouseSensitivity = 3.0f;
    float speed = 8.f;
    bool fixedMouse = true;
    bool wasdUD[6] = {false, false, false, false, false, false};
    sf::Vector3f camera_pos(0.f, 2.0f, 3.9f);
    sf::Clock clock;
    float delta_time, last_time = 0.f;
    int framesStill = 0;

    sf::RenderWindow window(sf::VideoMode(w, h), "Path Traicing", sf::Style::Titlebar | sf::Style::Close);
    //window.setFramerateLimit(60);  // 144
    window.setMouseCursorVisible(false);

    sf::Shader shader;
    shader.loadFromFile("path_tracing.frag", sf::Shader::Fragment);
    shader.setUniform("uResolution", sf::Vector2f(w, h));

    sf::RenderTexture outputTexture;
    outputTexture.create(w, h);
    sf::Sprite outputTextureSprite(outputTexture.getTexture());
    sf::Sprite outputTextureSpriteFlipped = sf::Sprite(outputTexture.getTexture());
    outputTextureSpriteFlipped.setScale(1, -1);
    outputTextureSpriteFlipped.setPosition(0, h);

    std::random_device rand_device;
    std::mt19937 e2_gen(rand_device());
    std::uniform_real_distribution<> distr_rand(0.0f, 1.0f);


    while (window.isOpen())
    {
        delta_time = clock.getElapsedTime().asSeconds() - last_time;
        last_time = clock.getElapsedTime().asSeconds();

        sf::Event event;
        while (window.pollEvent(event))
        {
            if (event.type == sf::Event::Closed) window.close();
            else if (event.type == sf::Event::MouseMoved && fixedMouse) {
                int mx_ = event.mouseMove.x - w / 2;
                int my_ = event.mouseMove.y - h / 2;
                mouseX += mx_;
                mouseY += my_;
                sf::Mouse::setPosition(sf::Vector2(w / 2, h / 2), window);
                if (mx_ != 0 || my_ != 0) framesStill = 1;
            }
            else if (event.type == sf::Event::MouseButtonPressed) {
                if (!fixedMouse) framesStill = 1;
                fixedMouse = false;
                window.setMouseCursorVisible(true);
            }
            else if (event.type == sf::Event::KeyPressed) {
                if (event.key.code == sf::Keyboard::Escape) {
                    window.setMouseCursorVisible(true);
                    mouseHidden = false;
                }
                else if (event.key.code == sf::Keyboard::W) wasdUD[0] = true;
                else if (event.key.code == sf::Keyboard::A) wasdUD[1] = true;
                else if (event.key.code == sf::Keyboard::S) wasdUD[2] = true;
                else if (event.key.code == sf::Keyboard::D) wasdUD[3] = true;
                else if (event.key.code == sf::Keyboard::Space) wasdUD[4] = true;
                else if (event.key.code == sf::Keyboard::LShift) wasdUD[5] = true;
                else if (event.key.code == sf::Keyboard::Q) { 
                    fixedMouse = false;
                    window.setMouseCursorVisible(true);
                }
                else if (event.key.code == sf::Keyboard::P) {
                    sf::Image image = outputTextureSprite.getTexture()->copyToImage();
                    image.saveToFile("screenshots/img_name.bmp");
                }
            }
            else if (event.type == sf::Event::KeyReleased) {
                if (event.key.code == sf::Keyboard::W) wasdUD[0] = false;
                else if (event.key.code == sf::Keyboard::A) wasdUD[1] = false;
                else if (event.key.code == sf::Keyboard::S) wasdUD[2] = false;
                else if (event.key.code == sf::Keyboard::D) wasdUD[3] = false;
                else if (event.key.code == sf::Keyboard::Space) wasdUD[4] = false;
                else if (event.key.code == sf::Keyboard::LShift) wasdUD[5] = false;
            }
        }
        if (fixedMouse) {
            float mx = ((float)mouseX / w - 0.5f) * mouseSensitivity;
            float my = ((float)mouseY / h - 0.5f) * mouseSensitivity;
            sf::Vector3f dir = sf::Vector3f(0.0f, 0.0f, 0.0f);
            sf::Vector3f dirTemp;
            if (wasdUD[0]) dir = sf::Vector3f(0.0f, 0.0f, -1.0f);
            else if (wasdUD[2]) dir = sf::Vector3f(0.0f, 0.0f, 1.0f);
            if (wasdUD[1]) dir += sf::Vector3f(-1.0f, 0.0f, 0.0f);
            else if (wasdUD[3]) dir += sf::Vector3f(1.0f, 0.0f, 0.0f);
            dirTemp.y = dir.y * cos(-my) - dir.z * sin(-my);
            dirTemp.z = dir.y * sin(-my) + dir.z * cos(-my);
            dirTemp.x = dir.x;
            dir.x = dirTemp.x * cos(mx) - dirTemp.z * sin(mx);
            dir.z = dirTemp.x * sin(mx) + dirTemp.z * cos(mx);
            dir.y = dirTemp.y;
            camera_pos += dir * speed * delta_time;
            if (wasdUD[4]) camera_pos.y += speed * delta_time;
            else if (wasdUD[5]) camera_pos.y -= speed * delta_time;
            for (short i = 0; i < 6; i++) if (wasdUD[i]) { framesStill = 1; break; }

            shader.setUniform("uCamPos", camera_pos);
            shader.setUniform("uMousePos", sf::Vector2f(mx, my));
        }

        shader.setUniform("uSamplePart", 1.0f / framesStill);
        shader.setUniform("uTime", clock.getElapsedTime().asSeconds());
        shader.setUniform("uSeed_1", sf::Vector2f((float)distr_rand(e2_gen), (float)distr_rand(e2_gen)) * 999.f);
        shader.setUniform("uSeed_2", sf::Vector2f((float)distr_rand(e2_gen), (float)distr_rand(e2_gen)) * 999.f);

        shader.setUniform("uSample", outputTexture.getTexture());
        outputTexture.draw(outputTextureSpriteFlipped, &shader);
        window.draw(outputTextureSpriteFlipped);
        
        window.setTitle(std::format("Path Traicing   Accum: {}   FPS: {:.0f}", framesStill, 1.f / delta_time));
        window.display();
        framesStill++;
    }

    return 0;
}

//#include "MxEngine/src/MxEngine.h"
//#include "MxEngine-master/samples/SandboxApplication/Sandbox.cpp"
//namespace MainApplication {
//	using namespace MxEngine;
//
//	class PathTracingApplication : public Application {
    //MainApplication::PathTracingApplication app;
    //app.Run();
//	};
//}