import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeBackground = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const animationIdRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const originalPositionsRef = useRef(null);
  const velocityRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 300;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Create particle sphere
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const radius = 150;

    // Distribute particles evenly on a sphere using Fibonacci sphere algorithm
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = radius * Math.sin(inclination) * Math.cos(azimuth);
      const y = radius * Math.sin(inclination) * Math.sin(azimuth);
      const z = radius * Math.cos(inclination);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Initialize colors (white)
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = 1.0; // G
      colors[i * 3 + 2] = 1.0; // B

      // Initialize sizes
      sizes[i] = 2.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Store original positions for mouse interaction
    originalPositionsRef.current = new Float32Array(positions);
    velocityRef.current = new Float32Array(particleCount * 3);

    // Material with glowing effect and vertex colors
    const material = new THREE.PointsMaterial({
      size: 2.5,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
      map: createCircleTexture(),
    });

    function createCircleTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Mouse interaction
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Smooth rotation
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      // Enhanced mouse interaction with colors, sizes, and physics
      const positions = particles.geometry.attributes.position.array;
      const colors = particles.geometry.attributes.color.array;
      const sizes = particles.geometry.attributes.size.array;
      const originalPositions = originalPositionsRef.current;
      const velocities = velocityRef.current;

      if (originalPositions && velocities) {
        const mouse3D = new THREE.Vector3(
          mouseRef.current.x * 250,
          mouseRef.current.y * 250,
          0,
        );

        for (let i = 0; i < positions.length; i += 3) {
          const particleIndex = i / 3;
          const originalX = originalPositions[i];
          const originalY = originalPositions[i + 1];
          const originalZ = originalPositions[i + 2];

          // Get particle position in world space
          const particleVector = new THREE.Vector3(
            originalX,
            originalY,
            originalZ,
          );
          particleVector.applyQuaternion(particles.quaternion);

          // Calculate distance from mouse
          const distance = particleVector.distanceTo(mouse3D);
          const interactionRadius = 150;

          if (distance < interactionRadius) {
            // Strong repulsion with physics-based motion
            const forceMagnitude =
              Math.pow(1 - distance / interactionRadius, 2) * 50;
            const direction = new THREE.Vector3()
              .subVectors(particleVector, mouse3D)
              .normalize();

            // Apply velocity for smoother motion
            velocities[i] += direction.x * forceMagnitude * 0.1;
            velocities[i + 1] += direction.y * forceMagnitude * 0.1;
            velocities[i + 2] += direction.z * forceMagnitude * 0.1;

            // Dynamic colors based on distance (white → cyan → purple)
            const normalized = distance / interactionRadius;
            if (normalized < 0.3) {
              // Close: Purple/Magenta
              colors[i] = 0.8 + normalized;
              colors[i + 1] = 0.2;
              colors[i + 2] = 1.0;
            } else if (normalized < 0.6) {
              // Medium: Cyan
              colors[i] = 0.2;
              colors[i + 1] = 0.8 + normalized * 0.2;
              colors[i + 2] = 1.0;
            } else {
              // Far: Light blue
              colors[i] = 0.5 + normalized * 0.5;
              colors[i + 1] = 0.7 + normalized * 0.3;
              colors[i + 2] = 1.0;
            }

            // Increase size near cursor
            sizes[particleIndex] = 2.5 + (1 - normalized) * 3;
          } else {
            // Fade back to white
            colors[i] += (1.0 - colors[i]) * 0.05;
            colors[i + 1] += (1.0 - colors[i + 1]) * 0.05;
            colors[i + 2] += (1.0 - colors[i + 2]) * 0.05;

            // Reset size
            sizes[particleIndex] += (2.5 - sizes[particleIndex]) * 0.05;
          }

          // Apply velocity with damping
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];

          velocities[i] *= 0.92; // Damping
          velocities[i + 1] *= 0.92;
          velocities[i + 2] *= 0.92;

          // Spring force to return to original position
          const springForce = 0.03;
          velocities[i] += (originalX - positions[i]) * springForce;
          velocities[i + 1] += (originalY - positions[i + 1]) * springForce;
          velocities[i + 2] += (originalZ - positions[i + 2]) * springForce;
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
        particles.geometry.attributes.size.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        particlesRef.current.material.dispose();
      }

      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none bg-black"
    />
  );
};

export default ThreeBackground;
