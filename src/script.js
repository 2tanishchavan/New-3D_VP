import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Pathfinding } from "three-pathfinding";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

import { CreateParticles } from './libs/CreateParticles'
import { ModelFreeRoam } from './libs/ModelFreeRoam'
import { ModelNavigate } from './libs/ModelNavigate'

const preload = () => {

    navigate = document.getElementById("navigateHolder");
    freeRoam = document.getElementById("freeRoamHolder");
    menu = document.getElementById("circles");
    main_body = document.getElementById("main_body");
    menuHolder = document.getElementById("menuHolder");
    header = document.getElementById("header");

    let manager = new THREE.LoadingManager();
    manager.onLoad = function () {
        const environment = new Environment(typo, particle);
    }

    var typo = null;
    const loader = new THREE.FontLoader(manager);
    const font = loader.load('https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json', function (font) { typo = font; });
    const particle = new THREE.TextureLoader(manager).load('https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png');

}


const Color = {
    GROUND: new THREE.Color(0x606060).convertSRGBToLinear().getHex(),
    NAVMESH: new THREE.Color(0xffffff).convertSRGBToLinear().getHex(),
};

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
    preload();
else
    document.addEventListener("DOMContentLoaded", preload);

class Environment {

    constructor(font, particle) {

        this.allHtmlDisable();      //pending
        this.font = font;
        this.particle = particle;
        this.container = document.querySelector('#magic');
        this.scene = new THREE.Scene();
        this.createCamera();
        this.createLigths();
        this.createRenderer();
        this.setupLoading();
        this.fpControl();
        this.customVariable();
        this.bindEvents();
    }

    customVariable() {
        this.ZONE = "level";
        this.OFFSET = 0.2
        this.level = null;
        this.navmesh = null;
        this.clock = new THREE.Clock();
        this.playerPosition = new THREE.Vector3();
        this.pathfinder = new Pathfinding();

    }

    fpControl() {
        this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
        this.controls.movementSpeed = 3;
        this.controls.lookSpeed = 0.1;
        this.controls.verticalMin = Math.PI * 10
        this.controls.enabled = false;
    }

    bindEvents() {

        const freeparams = {
            removeObjWithChildren:this.removeObjWithChildren,
            scene: this.scene,
            camera: this.camera,
            controls: this.controls,
            clock: this.clock,
            renderer: this.renderer
        }

        const navparams = {
            scene: this.scene,
            camera: this.camera,
            controls: this.controls,
            clock: this.clock,
            renderer: this.renderer,
            pathfinder: this.pathfinder,
            ZONE: this.ZONE 
        }
        

        window.addEventListener('resize', this.onWindowResize.bind(this));

        navigate.addEventListener("click", this.displayNavigation.bind(null, navparams));
        freeRoam.addEventListener("click", this.displayFreeRoam.bind(null, freeparams));
        menu.addEventListener("click", this.displayMenu);

        this.setupMain()
    }

    setupLoading() {
        this.createParticles = new CreateParticles(this.scene, this.font, this.particle, this.camera, this.renderer);
        this.createParticles.render()
    }

    setupMain() {


        console.log('hi')
        const self = this
        let loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = function () {
            // window.setTimeout(() => {
                // self.renderer.setClearColor(0x000000, 0);
                self.createParticles.destroy();
                self.displayMenu();
                self.camera.position.set(0, 3, 0)

            // }, 5000);
        }
        const gltfLoader = new GLTFLoader(loadingManager)
        gltfLoader.load(
            "/meshes/secondFloor.glb",
            function (gltf) {
                // this.level = true;
                // window.level = this.level;
                window.level = true;
                gltf.scene.name = "secondFloor"
                gltf.scene.visible = false
                self.scene.add(gltf.scene);
                console.log(gltf.scene)
            },
            null
        );

        gltfLoader.load(
            "/meshes/secondFloor.nav.glb",
            function (gltf) {
                const _navmesh = gltf.scene.getObjectByName("Navmesh");
                const zone = Pathfinding.createZone(_navmesh.geometry);
                // setting the zone data
                // zone is the group of navigation mesh
                // for better understanding go to github repo
                self.pathfinder.setZoneData(self.ZONE, zone);

                const navWireframe = new THREE.Mesh(
                    _navmesh.geometry,
                    new THREE.MeshBasicMaterial({
                        color: 0x808080,
                        transparent: true,
                        opacity: 0,
                        // wireframe: true
                    })
                );
                navWireframe.position.y = self.OFFSET / 2;
                self.scene.add(navWireframe);

                self.navmesh = new THREE.Mesh(
                    _navmesh.geometry,
                    new THREE.MeshBasicMaterial({
                        color: Color.NAVMESH,
                        transparent: true,
                        opacity: 0,
                    })
                );

                self.scene.add(self.navmesh);

                // Set the player's navigation mesh group
                // groupID = pathfinder.getGroup(self.ZONE, self.playerPosition);

                self.pathfinder.getGroup(self.ZONE, self.playerPosition);
            },
            null
        );


    }

    render() {

        // this.renderer.render(this.scene, this.camera)
    }

    createCamera() {

        this.camera = new THREE.PerspectiveCamera(65, this.container.clientWidth / this.container.clientHeight, 1, 10000);
        this.camera.position.set(0, 0, 100);

    }

    createLigths() {
        const ambient = new THREE.AmbientLight(0x101030);
        this.scene.add(ambient);

        const directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 0.5, 0.5);
        this.scene.add(directionalLight);
    }

    
    grp(){
		const navgroup = new THREE.Group();
        this.scene.add(navgroup);
    }

    createRenderer() {

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        // this.renderer.setAnimationLoop(() => { this.render() })

    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.controls.handleResize();

    }

    allHtmlDisable() {
        main_body.style.opacity = 0;
        menuHolder.style.visibility = "hidden";
        main_body.style.visibility = "hidden";
        header.style.visibility = "hidden";
        moveId.style.visibility = "hidden";
    }
    displayMenu() {
        main_body.style.opacity = 0.6;
        menuHolder.style.visibility = "visible";
        main_body.style.visibility = "visible";
        header.style.visibility = "hidden";
        moveId.style.visibility = "hidden";
    }

    removeObjWithChildren(){
        const obj = this.scene.getObjectByName("navgroup")
        // if(obj.children.length > 0){
        //     for (var i = obj.children.length - 1; i >= 0; i--) {
        //         this.removeObjWithChildren(obj.children[i]);
        //     }
        // }
        if(obj.isMesh){
            obj.geometry.dispose();
            obj.material.dispose();
        }
        if(obj.parent){
            obj.parent.remove(obj);
        }
        // obj.visible = false
    }


    displayNavigation(params) {
        // params.controls.enabled = false;
        // console.log("navigation displayed");
        main_body.style.opacity = 0;
        menuHolder.style.visibility = "hidden";
        main_body.style.visibility = "hidden";
        header.style.visibility = "visible";
        moveId.style.visibility = "visible";
        // if (navigateModleExec == 1) {
        window.cancelAnimationFrame(requestId);
        requestId = undefined;
        // Navwalker = null
        // Freewalker = null;
        // delete window.Freewalker;
        // delete window.Navwalker;
        Navwalker = new ModelNavigate(params);
        // navigateModleExec = 0;
        // }

    }

    displayFreeRoam(params) {
        console.log(params)
        menuHolder.style.visibility = "hidden";
        main_body.style.visibility = "hidden";
        header.style.visibility = "hidden";
        moveId.style.visibility = "hidden";
        menu.style.visibility = "visible";
        // if (freeRoamModleExec == 1) {
        window.cancelAnimationFrame(requestId);
        requestId = undefined;
        // Navwalker = null
        // Freewalker = null;
        // delete window.Freewalker;
        // delete window.Navwalker;
        // Freewalker = new ModelFreeRoam(this.scene, this.camera, this.controls, this.clock);
        params.removeObjWithChildren();
        new ModelFreeRoam(params);
        // freeRoamModleExec = 0;
        // }
    }



}



