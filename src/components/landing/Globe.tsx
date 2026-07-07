"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      return;
    }

    if (!containerRef.current) return;

    // Dynamically import three-globe only on client
    const loadGlobe = async () => {
      try {
        const ThreeGlobeModule = await import("three-globe");
        const ThreeGlobe = ThreeGlobeModule.default;

        const width = containerRef.current!.clientWidth;
        const height = containerRef.current!.clientHeight;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current!.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Setup scene
        const scene = new THREE.Scene();
        scene.background = null; // Transparent background to match UI

        // Setup camera - closer for bigger globe
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 250;

        // Track mouse and touch positions for interactivity
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        
        // Touch interaction tracking state
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isTouching = false;

        const handleMouseMove = (event: MouseEvent) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          mouseX = (event.clientX - rect.left) / width;
          mouseY = (event.clientY - rect.top) / height;
          
          // Calculate target rotations based on mouse position
          targetRotationY = (mouseX - 0.5) * Math.PI * 0.5;
          targetRotationX = (mouseY - 0.5) * Math.PI * 0.3;
        };

        const handleTouchStart = (event: TouchEvent) => {
          const touch = event.touches[0];
          if (touch) {
            isTouching = true;
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
          }
        };

        const handleTouchMove = (event: TouchEvent) => {
          const touch = event.touches[0];
          if (touch && isTouching) {
            // Prevent standard mobile scrolling when swiping the globe
            event.preventDefault();

            const deltaX = touch.clientX - lastTouchX;
            const deltaY = touch.clientY - lastTouchY;

            // Sensitivity modifiers
            targetRotationY += deltaX * 0.007;
            targetRotationX += deltaY * 0.005;

            // Clamping up/down rotation to prevent flipping upside down
            targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));

            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
          }
        };

        const handleTouchEnd = () => {
          isTouching = false;
        };

        const handleMouseClick = () => {
          // Add a spin animation on click
          let spinSpeed = 0.05;
          const spinInterval = setInterval(() => {
            spinSpeed *= 0.95;
            (globe as any).rotation.y += spinSpeed;
            if (spinSpeed < 0.001) clearInterval(spinInterval);
          }, 30);
        };

        containerRef.current!.addEventListener("mousemove", handleMouseMove);
        containerRef.current!.addEventListener("click", handleMouseClick);
        
        // Setup Mobile Touch Events
        containerRef.current!.addEventListener("touchstart", handleTouchStart);
        containerRef.current!.addEventListener("touchmove", handleTouchMove, { passive: false });
        containerRef.current!.addEventListener("touchend", handleTouchEnd);

        // Create globe instance
        const globe = new ThreeGlobe()
          .globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg")
          .showAtmosphere(true)
          .atmosphereColor("#3b82f6")
          .atmosphereAltitude(0.2);

        // Define arc connections
        const arcsData = [
            // Major intercontinental routes
            { startLat: 40, startLng: -74, endLat: 51, endLng: 0 }, // NYC to London
            { startLat: 51, startLng: 0, endLat: 35, endLng: 139 }, // London to Tokyo
            { startLat: 35, startLng: 139, endLat: -33, endLng: 151 }, // Tokyo to Sydney
            { startLat: -33, startLng: 151, endLat: -25, endLng: 133 }, // Sydney to Australia center
            { startLat: 28, startLng: 77, endLat: 51, endLng: 0 }, // Delhi to London
            { startLat: 40, startLng: -74, endLat: 35, endLng: -5 }, // NYC to Casablanca
            { startLat: 35, startLng: -5, endLat: 35, endLng: 139 }, // Casablanca to Tokyo
            { startLat: 51, startLng: 0, endLat: 28, endLng: 77 }, // London to Delhi
            { startLat: 30, startLng: -97, endLat: 40, endLng: -74 }, // Austin to NYC
            { startLat: 35, startLng: -5, endLat: 28, endLng: 77 }, // Casablanca to Delhi
            // Additional routes for more visual density
            { startLat: -23.5, startLng: 19.8, endLat: 40, endLng: -74 }, // Johannesburg to NYC
            { startLat: -23.5, startLng: 19.8, endLat: 35, endLng: 139 }, // Johannesburg to Tokyo
            { startLat: 13.7, startLng: 100.5, endLat: 35, endLng: 139 }, // Bangkok to Tokyo
            { startLat: 13.7, startLng: 100.5, endLat: 28, endLng: 77 }, // Bangkok to Delhi
            { startLat: 35, startLng: 139, endLat: -33, endLng: 18.4 }, // Tokyo to Cape Town
            { startLat: 40, startLng: -74, endLat: 13.7, endLng: 100.5 }, // NYC to Bangkok
            { startLat: 51, startLng: 0, endLat: -23.5, endLng: 19.8 }, // London to Johannesburg
            { startLat: 28, startLng: 77, endLat: 35, endLng: 139 }, // Delhi to Tokyo
            { startLat: 48.8, startLng: 2.3, endLat: 40, endLng: -74 }, // Paris to NYC
            { startLat: 48.8, startLng: 2.3, endLat: 51, endLng: 0 }, // Paris to London
            { startLat: 1.3, startLng: 103.8, endLat: -33, endLng: 151 }, // Singapore to Sydney
            { startLat: 1.3, startLng: 103.8, endLat: 35, endLng: 139 }, // Singapore to Tokyo
            { startLat: 55.7, startLng: 37.6, endLat: 35, endLng: 139 }, // Moscow to Tokyo
            { startLat: 55.7, startLng: 37.6, endLat: 40, endLng: -74 }, // Moscow to NYC
            // More routes for ultra-dense network
            { startLat: 37.7, startLng: -122.4, endLat: 35, endLng: 139 }, // San Francisco to Tokyo
            { startLat: 37.7, startLng: -122.4, endLat: 40, endLng: -74 }, // San Francisco to NYC
            { startLat: 37.7, startLng: -122.4, endLat: 51, endLng: 0 }, // San Francisco to London
            { startLat: -33, startLng: 151, endLat: 1.3, endLng: 103.8 }, // Sydney to Singapore
            { startLat: -33, startLng: 151, endLat: 13.7, endLng: 100.5 }, // Sydney to Bangkok
            { startLat: -33, startLng: 151, endLat: -23.5, endLng: 19.8 }, // Sydney to Johannesburg
            { startLat: 35, startLng: 139, endLat: 1.3, endLng: 103.8 }, // Tokyo to Singapore
            { startLat: 28, startLng: 77, endLat: 13.7, endLng: 100.5 }, // Delhi to Bangkok
            { startLat: 28, startLng: 77, endLat: 1.3, endLng: 103.8 }, // Delhi to Singapore
            { startLat: 28, startLng: 77, endLat: -23.5, endLng: 19.8 }, // Delhi to Johannesburg
            { startLat: 51, startLng: 0, endLat: 48.8, endLng: 2.3 }, // London to Paris
            { startLat: 51, startLng: 0, endLat: 55.7, endLng: 37.6 }, // London to Moscow
            { startLat: 40, startLng: -74, endLat: 37.7, endLng: -122.4 }, // NYC to San Francisco
            { startLat: 48.8, startLng: 2.3, endLat: 35, endLng: 139 }, // Paris to Tokyo
            { startLat: 55.7, startLng: 37.6, endLat: 28, endLng: 77 }, // Moscow to Delhi
            { startLat: 55.7, startLng: 37.6, endLat: 13.7, endLng: 100.5 }, // Moscow to Bangkok
            { startLat: 37.7, startLng: -122.4, endLat: 48.8, endLng: 2.3 }, // San Francisco to Paris
            { startLat: 37.7, startLng: -122.4, endLat: 55.7, endLng: 37.6 }, // San Francisco to Moscow
            { startLat: 1.3, startLng: 103.8, endLat: 40, endLng: -74 }, // Singapore to NYC
            { startLat: 1.3, startLng: 103.8, endLat: 51, endLng: 0 }, // Singapore to London
            { startLat: 1.3, startLng: 103.8, endLat: 48.8, endLng: 2.3 }, // Singapore to Paris
            { startLat: 13.7, startLng: 100.5, endLat: 40, endLng: -74 }, // Bangkok to NYC
            { startLat: 13.7, startLng: 100.5, endLat: 51, endLng: 0 }, // Bangkok to London
            { startLat: 13.7, startLng: 100.5, endLat: -33, endLng: 151 }, // Bangkok to Sydney
            { startLat: -23.5, startLng: 19.8, endLat: 51, endLng: 0 }, // Johannesburg to London
            { startLat: -23.5, startLng: 19.8, endLat: 48.8, endLng: 2.3 }, // Johannesburg to Paris
            { startLat: -23.5, startLng: 19.8, endLat: 1.3, endLng: 103.8 }, // Johannesburg to Singapore
            // Nigeria ↔ Canada
            { startLat: 9.08, startLng: 8.68, endLat: 43.65, endLng: -79.38 }, // Nigeria to Toronto, Canada
            { startLat: 43.65, startLng: -79.38, endLat: 9.08, endLng: 8.68 }, // Toronto, Canada to Nigeria

            // Nigeria ↔ United States
            { startLat: 9.08, startLng: 8.68, endLat: 40.71, endLng: -74.01 }, // Nigeria to New York, USA
            { startLat: 40.71, startLng: -74.01, endLat: 9.08, endLng: 8.68 }, // New York, USA to Nigeria

            // Nigeria ↔ Democratic Republic of the Congo
            { startLat: 9.08, startLng: 8.68, endLat: -4.32, endLng: 15.31 }, // Nigeria to Kinshasa, DRC
            { startLat: -4.32, startLng: 15.31, endLat: 9.08, endLng: 8.68 }, // Kinshasa, DRC to Nigeria

            // Nigeria ↔ South Africa
            { startLat: 9.08, startLng: 8.68, endLat: -26.20, endLng: 28.04 }, // Nigeria to Johannesburg
            { startLat: -26.20, startLng: 28.04, endLat: 9.08, endLng: 8.68 }, // Johannesburg to Nigeria

            // Nigeria ↔ Kenya
            { startLat: 9.08, startLng: 8.68, endLat: -1.29, endLng: 36.82 }, // Nigeria to Nairobi
            { startLat: -1.29, startLng: 36.82, endLat: 9.08, endLng: 8.68 }, // Nairobi to Nigeria

            // Nigeria ↔ Ghana
            { startLat: 9.08, startLng: 8.68, endLat: 5.60, endLng: -0.19 }, // Nigeria to Accra
            { startLat: 5.60, startLng: -0.19, endLat: 9.08, endLng: 8.68 }, // Accra to Nigeria

            // Nigeria ↔ Egypt
            { startLat: 9.08, startLng: 8.68, endLat: 30.04, endLng: 31.24 }, // Nigeria to Cairo
            { startLat: 30.04, startLng: 31.24, endLat: 9.08, endLng: 8.68 }, // Cairo to Nigeria

            // Nigeria ↔ Rwanda
            { startLat: 9.08, startLng: 8.68, endLat: -1.94, endLng: 30.06 }, // Nigeria to Kigali
            { startLat: -1.94, startLng: 30.06, endLat: 9.08, endLng: 8.68 }, // Kigali to Nigeria
            // Polar routes for global coverage
            { startLat: 85, startLng: 0, endLat: 40, endLng: -74 }, // North Pole to NYC
            { startLat: 85, startLng: 0, endLat: 51, endLng: 0 }, // North Pole to London
            { startLat: 85, startLng: 120, endLat: 35, endLng: 139 }, // North Pole to Tokyo
            { startLat: 55.7, startLng: 37.6, endLat: 85, endLng: 60 }, // Moscow to North Pole area
            { startLat: -85, startLng: 0, endLat: -33, endLng: 151 }, // South Pole to Sydney
            { startLat: -85, startLng: 0, endLat: -23.5, endLng: 19.8 }, // South Pole to Johannesburg
            { startLat: -33, startLng: 151, endLat: -85, endLng: 180 }, // Sydney to South Pole area
        ];

        globe
          .arcsData(arcsData)
          .arcColor(() => "#60a5fa")
          .arcAltitude(0.3)
          .arcStroke(1)
          .arcDashLength(0.4)
          .arcDashGap(3)
          .arcDashInitialGap(() => Math.random() * 5)
          .arcDashAnimateTime(1000);

        // Add connection points (node markers)
        const pointsData = arcsData.flatMap((arc) => [
          { lat: arc.startLat, lng: arc.startLng },
          { lat: arc.endLat, lng: arc.endLng },
        ]);

        globe
          .pointsData(pointsData)
          .pointColor(() => "#60a5fa")
          .pointAltitude(0)
          .pointRadius(0.5);

        scene.add(globe);

        // Lighting
        scene.add(new THREE.AmbientLight(0xcccccc, Math.PI * 0.5));
        const directionalLight = new THREE.DirectionalLight(0xffffff, Math.PI * 0.6);
        directionalLight.position.set(300, 200, 300);
        scene.add(directionalLight);

        const blueLight = new THREE.DirectionalLight(0x3b82f6, Math.PI * 0.3);
        blueLight.position.set(-300, -200, -300);
        scene.add(blueLight);

        // Animation loop
        let time = 0;
        const autoRotationSpeed = 0.0015; // Continuous auto-rotation speed
        const animate = () => {
          time += 1;
          animationIdRef.current = requestAnimationFrame(animate);

          // Continuous auto-rotation only loops if the user isn't holding down a finger
          if (!isTouching) {
            targetRotationY += autoRotationSpeed;
          }

          // Rotate globe with smooth interpolation based on targets
          (globe as any).rotation.y += (targetRotationY - (globe as any).rotation.y) * 0.05;
          (globe as any).rotation.x += (targetRotationX - (globe as any).rotation.x) * 0.05;

          // Add floating effect (subtle up and down motion)
          const floatHeight = Math.sin(time * 0.005) * 15;
          (globe as any).position.y = floatHeight;

          renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          containerRef.current?.removeEventListener("mousemove", handleMouseMove);
          containerRef.current?.removeEventListener("click", handleMouseClick);
          
          // Remove touch listeners
          containerRef.current?.removeEventListener("touchstart", handleTouchStart);
          containerRef.current?.removeEventListener("touchmove", handleTouchMove);
          containerRef.current?.removeEventListener("touchend", handleTouchEnd);
          
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          renderer.dispose();
          if (containerRef.current?.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
        };
      } catch (error) {
        console.error("Failed to load globe:", error);
      }
    };

    const cleanup = loadGlobe();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, [isLoaded]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ background: "transparent" }}
      />

      {/* Info Labels */}
      <div className="absolute top-12 right-12 text-xs text-paper-300 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium">Real Nigerian</span>
        </div>
        <div className="text-paper-400 text-2xs ml-4">Account Numbers</div>
      </div>

      <div className="absolute left-6 md:left-10 lg:left-8 top-1/4 text-xs text-paper-300 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium">Built on</span>
        </div>
        <div className="text-paper-400 text-2xs ml-4">Nomba Rails</div>
      </div>

      <div className="absolute left-12 bottom-12 text-xs text-paper-300 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium">Secure by Design</span>
        </div>
        <div className="text-paper-400 text-2xs ml-4">Security Is Our First Priority</div>
      </div>

      <div className="absolute bottom-12 right-12 text-xs text-paper-300 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium">99.9%</span>
        </div>
        <div className="text-paper-400 text-2xs ml-4">Uptime</div>
      </div>
    </div>
  );
}
