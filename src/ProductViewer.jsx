import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose())
    } else {
      child.material?.dispose()
    }
  })
}

function createDoorModel(config) {
  const root = new THREE.Group()
  const width = config.width / 100
  const height = config.height / 100
  const framePost = 0.085
  const frameDepth = 0.2
  const explodedDistance = config.exploded ? 0.18 : 0
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#16191d',
    roughness: 0.58,
    metalness: 0.22,
  })

  const addFramePart = (size, position) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), frameMaterial)
    mesh.position.set(...position)
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  }

  addFramePart(
    [framePost, height + framePost, frameDepth],
    [-width / 2 - framePost / 2 - explodedDistance, height / 2, 0],
  )
  addFramePart(
    [framePost, height + framePost, frameDepth],
    [width / 2 + framePost / 2 + explodedDistance, height / 2, 0],
  )
  addFramePart(
    [width + framePost * 2, framePost, frameDepth],
    [0, height + framePost / 2 + explodedDistance, 0],
  )
  addFramePart([width + framePost * 2, 0.045, frameDepth], [0, 0.02, 0])

  const hingeOnLeft = config.opening === 'left'
  const hingeX = hingeOnLeft ? -width / 2 : width / 2
  const leafCenterX = hingeOnLeft ? width / 2 : -width / 2
  const openingDirection = hingeOnLeft ? -1 : 1
  const pivot = new THREE.Group()
  pivot.position.set(hingeX, 0, config.exploded ? 0.32 : 0.015)
  pivot.rotation.y = THREE.MathUtils.degToRad(
    config.angle * openingDirection,
  )
  root.add(pivot)

  const surfaceColor = new THREE.Color(config.finishColor)
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: surfaceColor,
    roughness: config.finish === 'charcoal' ? 0.72 : 0.55,
    metalness: config.finish === 'charcoal' ? 0.12 : 0.02,
  })
  const leaf = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.1),
    leafMaterial,
  )
  leaf.position.set(leafCenterX, height / 2, 0)
  leaf.castShadow = true
  leaf.receiveShadow = true
  pivot.add(leaf)

  const panelColor = surfaceColor.clone().multiplyScalar(0.72)
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: panelColor,
    roughness: 0.62,
  })
  const panelWidth = width * 0.68
  const panelHeight = height * 0.3
  const panelDepth = config.exploded ? 0.15 : 0.058

  for (const panelY of [height * 0.31, height * 0.69]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(panelWidth, panelHeight, 0.022),
      panelMaterial,
    )
    panel.position.set(leafCenterX, panelY, panelDepth)
    panel.castShadow = true
    pivot.add(panel)
  }

  const hardwareMaterial = new THREE.MeshStandardMaterial({
    color: config.handleColor,
    roughness: 0.24,
    metalness: 0.88,
  })
  const handleX = leafCenterX + (hingeOnLeft ? width * 0.36 : -width * 0.36)
  const hardwareZ = config.exploded ? 0.32 : 0.075
  const rose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, 0.026, 24),
    hardwareMaterial,
  )
  rose.rotation.x = Math.PI / 2
  rose.position.set(handleX, height * 0.5, hardwareZ)
  rose.castShadow = true
  pivot.add(rose)

  const lever = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.016, 0.14, 4, 12),
    hardwareMaterial,
  )
  lever.rotation.z = Math.PI / 2
  lever.position.set(
    handleX + (hingeOnLeft ? -0.065 : 0.065),
    height * 0.5,
    hardwareZ + 0.03,
  )
  lever.castShadow = true
  pivot.add(lever)

  const hingeMaterial = new THREE.MeshStandardMaterial({
    color: '#8b9096',
    roughness: 0.35,
    metalness: 0.78,
  })
  for (const hingeY of [height * 0.18, height * 0.5, height * 0.82]) {
    const hinge = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.11, 0.035),
      hingeMaterial,
    )
    hinge.position.set(0, hingeY, config.exploded ? -0.12 : -0.06)
    hinge.castShadow = true
    pivot.add(hinge)
  }

  return root
}

export default function ProductViewer({ config, label, unavailableLabel }) {
  const mountRef = useRef(null)
  const runtimeRef = useRef(null)
  const [isUnavailable, setIsUnavailable] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(3.8, 2.6, 4.8)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      const fallbackFrame = window.requestAnimationFrame(() => {
        setIsUnavailable(true)
      })
      return () => window.cancelAnimationFrame(fallbackFrame)
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.055
    controls.target.set(0, 1.08, 0)
    controls.minDistance = 3.2
    controls.maxDistance = 7.5
    controls.maxPolarAngle = Math.PI * 0.52

    const hemisphere = new THREE.HemisphereLight('#dce8ff', '#21180f', 2.2)
    scene.add(hemisphere)

    const keyLight = new THREE.DirectionalLight('#fff4df', 4.8)
    keyLight.position.set(3.5, 5.5, 4)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight('#7da7ff', 2.1)
    rimLight.position.set(-4, 3, -3)
    scene.add(rimLight)

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#101318',
      roughness: 0.8,
      metalness: 0.12,
    })
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 64),
      floorMaterial,
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    floor.receiveShadow = true
    scene.add(floor)

    const modelRoot = new THREE.Group()
    scene.add(modelRoot)
    runtimeRef.current = { modelRoot }

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const renderFrame = () => {
      controls.update()
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(renderFrame)

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      renderer.setAnimationLoop(entry.isIntersecting ? renderFrame : null)
    })
    visibilityObserver.observe(mount)

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      controls.dispose()
      disposeObject(scene)
      scene.clear()
      renderer.dispose()
      renderer.domElement.remove()
      runtimeRef.current = null
    }
  }, [])

  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime) return

    for (const child of [...runtime.modelRoot.children]) {
      runtime.modelRoot.remove(child)
      disposeObject(child)
    }
    runtime.modelRoot.add(createDoorModel(config))
  }, [config])

  if (isUnavailable) {
    return (
      <div className="viewer-canvas viewer-fallback" role="status">
        <span aria-hidden="true">3D</span>
        <p>{unavailableLabel}</p>
      </div>
    )
  }

  return (
    <div
      ref={mountRef}
      className="viewer-canvas"
      role="img"
      aria-label={label}
    />
  )
}
