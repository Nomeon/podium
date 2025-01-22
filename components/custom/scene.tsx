'use client'

import * as THREE from "three"
import { useEffect, useRef } from "react"
import { MTLLoader } from "three/examples/jsm/Addons.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

const Scene = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const scene = new THREE.Scene()
    const width = container.clientWidth
    const height = container.clientHeight
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)
    container.append(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 100, 0);
    scene.add(directionalLight);

    // Add camera controls
    const controls = new OrbitControls(camera, renderer.domElement)

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

    camera.position.set(0,5,5)
    controls.target = new THREE.Vector3(0, 5, 0)

    function animateScene() {
      requestAnimationFrame(animateScene)
      controls.update()
      console.log('POS: ', camera.position, 'DIR: ', camera.getWorldDirection(new THREE.Vector3()))

      renderer.render(scene, camera)
    }
    animateScene()
  })

  return (
    <div ref={containerRef} className="fixed top-0 left-0 z-20 w-dvw h-dvh" />
  )
}

export { Scene }