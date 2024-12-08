'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1); // Set background color to white
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth movement
    controls.dampingFactor = 0.05;

    // Add floor (horizontal plane)
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to lie flat
    scene.add(floor);

    // Add wall (vertical plane)
    const wallGeometry = new THREE.PlaneGeometry(10, 10);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xd3d3d3,
      side: THREE.DoubleSide,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.z = -5; // Place behind the box
    scene.add(wall);

    // Box geometry with shiny material and edges
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      roughness: 0.5,
      metalness: 0.5,
    });
    const box = new THREE.Mesh(geometry, material);

    // Add wireframe for black edges
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );

    scene.add(box); // Add solid box
    scene.add(wireframe); // Add black edges

    // Add lights for 3D effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1); // Bright point light
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Position camera
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Dragging functionality
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let intersectedObject = null;

    const onMouseDown = (event) => {
      // Convert mouse position to normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Check for intersections
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(box);

      if (intersects.length > 0) {
        isDragging = true;
        intersectedObject = intersects[0].object; // Get the intersected box
        controls.enabled = false; // Disable OrbitControls during drag
      }
    };

    const onMouseMove = (event) => {
      if (isDragging && intersectedObject) {
        // Update mouse position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster and calculate new position
        raycaster.setFromCamera(mouse, camera);
        const planeIntersect = raycaster.ray.intersectPlane(
          new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), // Horizontal movement plane
          new THREE.Vector3()
        );

        if (planeIntersect) {
          intersectedObject.position.set(
            planeIntersect.x,
            intersectedObject.position.y,
            planeIntersect.z
          );
          wireframe.position.set(
            planeIntersect.x,
            intersectedObject.position.y,
            planeIntersect.z
          ); // Move edges with the box
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      intersectedObject = null;
      controls.enabled = true; // Re-enable OrbitControls
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the box for 3D effect when not dragging
      if (!isDragging) {
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;
        wireframe.rotation.x += 0.01;
        wireframe.rotation.y += 0.01;
      }

      // Update controls
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default App;
