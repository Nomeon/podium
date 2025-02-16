'use client'

import * as THREE from "three"
import { useEffect, useRef } from "react"
import { MTLLoader } from "three/examples/jsm/Addons.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { CustomEase } from "gsap/all"

const Scene = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null)
  const pathname = usePathname()
  gsap.registerPlugin(CustomEase)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const scene = new THREE.Scene()
    const width = container.clientWidth
    const height = container.clientHeight
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    container.append(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    const hemiLight = new THREE.HemisphereLight('white', 'white', 5);
    hemiLightRef.current = hemiLight
    scene.add(hemiLight);

    const planeGeometry = new THREE.PlaneGeometry(9, 4)
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.set(0.03, 3.32, -7.85)
    // scene.add(plane)

    const spotLight1 = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 4, 0.5, 0.5)
    spotLight1.position.set(-5, 5.5, -7)
    spotLight1.target = plane
    scene.add(spotLight1)
    scene.add(spotLight1.target)

    const spotLight2 = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 4, 0.5, 0.5)
    spotLight2.position.set(5, 5.5, -7)
    spotLight2.target = plane
    scene.add(spotLight2)
    scene.add(spotLight2.target)

    const spotLight3 = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 4, 0.5, 0.5)
    spotLight3.position.set(-5, 5.5, -3)
    spotLight3.target = plane
    scene.add(spotLight3)
    scene.add(spotLight3.target)

    const spotLight4 = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 4, 0.5, 0.5)
    spotLight4.position.set(5, 5.5, -3)
    spotLight4.target = plane
    scene.add(spotLight4)
    scene.add(spotLight4.target)

    // Load cinema.obj
    const objLoader = new OBJLoader()
    const mtlLoader = new MTLLoader()

    mtlLoader.load(
      '/cinema.mtl',
      (materials) => {
        materials.preload()
        objLoader.setMaterials(materials)
        objLoader.load(
          '/cinema.obj',
          (object) => {
            scene.add(object)
          }
        )
      }
    )

    camera.position.set(10,10,10)
    controls.target = new THREE.Vector3(0, 0, 0)

    function animateScene() {
      requestAnimationFrame(animateScene)
      controls.update()
      renderer.render(scene, camera)
    }
    animateScene()

    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);
  }, [])

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !hemiLightRef.current) return
    const camera = cameraRef.current
    const controls = controlsRef.current
    const hemiLight = hemiLightRef.current

    const customEase = CustomEase.create("custom", "M0,0 C0,0 0.300,0 0.5,0.5 0.700,1 1,1 1,1 ")

    // Use GSAP to animate the camera and controls
    if (pathname === "/") {
      gsap.to(camera.position, { 
        x: 10, 
        y: 10, 
        z: 10, 
        duration: 1.5,
        ease: customEase
      })
      gsap.to(controls.target, { 
        x: 0, 
        y: 0, 
        z: 0,
        duration: 1.5,
        ease: customEase
      })
      gsap.to(hemiLight, {
        intensity: 5,
        duration: 1.5,
        ease: customEase
      })
    } else if (pathname === '/login') {
      // 1.37, 3.685, 5.98
      gsap.to(camera.position, {
        x: 1.37, 
        y: 3.685, 
        z: 4,
        duration: 1.5,
        ease: customEase
      })
      gsap.to(controls.target, {
        x: 1.37, 
        y: 3.685,
        z: 10,
        duration: 1.5,
        ease: customEase
      })
      gsap.to(hemiLight, {
        intensity: 5,
        duration: 1.5,
        ease: customEase
      })
    } else if (pathname === '/register') {
      // -1.3, 3.685, 5.98
      gsap.to(camera.position, {
        x: -1.3,
        y: 3.685,
        z: 4,
        duration: 1.5,
        ease: customEase
      })
      gsap.to(controls.target, {
        x: -1.3,
        y: 3.685,
        z: 10,
        duration: 1.5,
        ease: customEase
      })
      gsap.to(hemiLight, {
        intensity: 5,
        duration: 1.5,
        ease: customEase
      })
    }
    else {
      gsap.to(camera.position, { 
        x: 0, 
        y: 3, 
        z: -3, 
        duration: 1.5,
        ease: customEase
      })
      gsap.to(controls.target, { 
        x: 0, 
        y: 3, 
        z: -10, 
        duration: 1.5,
        ease: customEase
      })
      gsap.to(hemiLight, {
        intensity: 0,
        duration: 1.5,
        delay: 1.5,
        ease: customEase
      })
    }
  }, [pathname])

  return (
    <div ref={containerRef} className="fixed top-0 left-0 z-10 w-dvw h-dvh" />
  )
}

export { Scene }