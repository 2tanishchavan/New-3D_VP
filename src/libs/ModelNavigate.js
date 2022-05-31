import { Player } from "./Player";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'


const assetsPath = '/model/';

class ModelNavigate {
    constructor(params) {

        this.controls = params.controls
        this.controls.enabled = false;

        this.scene = params.scene
        this.camera = params.camera;
        this.clock = params.clock
        this.renderer = params.renderer
        this.pathfinder = params.pathfinder
        this.ZONE = params.ZONE

        const self = this;
        const mouse = { x: 0, y: 0 };
        this.debug = { showShadowHelper: false, showPath: true, offset: 1.2 };
        this.moveValid = true

        const second = this.scene.getObjectByName("secondFloor")
        second.visible = true

        this.roomDestination = {
            x: 0,
            y: 0,
            z: 0,
        };
        this.rooms = {
            V201: {
                x: 0.5917979935891569,
                y: -0.006638143104230387,
                z: -10.146003535474863,
            },
            V202: {
                x: -5.7224310702215675,
                y: -0.0066341790621962105,
                z: -30.07634378666178,
            },
            V203: {
                x: -6.746381806644152,
                y: -0.024903026580630705,
                z: -49.675460097709134,
            },
            FacultyRoom: {
                x: 0.05676286818935994,
                y: 0.08390651489656742,
                z: -10.441042393728935,
            },
            BoysWR: {
                x: 0.05676286818935994,
                y: 0.08390651489656742,
                z: -10.441042393728935,
            },
            GirlsWR: {
                x: 0.05676286818935994,
                y: 0.08390651489656742,
                z: -10.441042393728935,
            },
            V207: {
                x: 3.243655821076471,
                y: -0.006628434812418149,
                z: -59.18505494782773,
            },
            V208: {
                x: 3.1968889723014557,
                y: -0.006632253929140575,
                z: -39.98973647773787,
            },
            V209: {
                x: 3.1011253987598284,
                y: -0.0066360787782340225,
                z: -20.72270472647906,
            },
        };



        this.dropDown = document.getElementById("classroomId");
        this.sourceDropDown = document.getElementById("sourceId");

        this.dropDown.addEventListener("change", classChanged);
        this.sourceDropDown.addEventListener("change", setPosition);

        document.addEventListener("keyup", (e) => {
            if (e.keyCode === 67) {
                this.switchCamera()
            }
            if (e.keyCode === 68) {
                this.camera.position.set(3, 4, -10)
            }
        });

        function classChanged() {
            let value = self.dropDown.value;
            self.roomDestination = self.rooms[value];
            self.walker.newPath(self.roomDestination, true);
        }


        function setPosition() {

            const walker = self.walker.object;
            walker.position.copy(self.rooms[self.sourceDropDown.value]);
            self.walker.navMeshGroup = self.pathfinder.getGroup(self.ZONE, self.rooms[self.sourceDropDown.value]);
            const closestNode = self.pathfinder.getClosestNode(walker.position, self.ZONE, self.walker.navMeshGroup);
            if (self.pathLines) self.scene.remove(self.pathLines);
            if (self.calculatedPath) self.calculatedPath.length = 0;
            self.walker.action = 'idle';
            return;

        }

        this.walker = this.loadRunner()

        self.render();

    }

    loadRunner() {
        const loader = new GLTFLoader();
        const self = this;

        const anims = [
            { start: 0, end: 100, name: "walk", loop: true }
        ];

        // Load a GLTF resource
        loader.load(
            // resource URL
            `${assetsPath}asd.glb`,
            // called when the resource is loaded
            function (gltf) {
                const object = gltf.scene.children[0];

                // object.traverse(function (child) {
                //     if (child.isMesh) {
                //         child.castShadow = true;
                //     }
                // });

                const options = {
                    object: object,
                    speed: 5,
                    assetsPath: assetsPath,
                    loader: loader,
                    anims: anims,
                    clip: gltf.animations[0],
                    app: self,
                    name: 'un',
                    npc: false,
                };

                self.walker = new Player(options);
                self.loading = false;
                self.walker.action = 'idle';
                const scale = 0.05;
                self.walker.object.scale.set(scale, scale, scale);
                self.walker.object.position.set(-1, 0, 2);

                const wideRight = new THREE.Object3D();
                wideRight.position.set(-300, 650, -500);
                wideRight.target = self.walker.object.position;
                self.walker.object.add(wideRight);

                const wideLeft = new THREE.Object3D()
                wideLeft.position.set(300, 650, -500);
                wideLeft.target = self.walker.object.position;
                self.walker.object.add(wideLeft);

                const rear = new THREE.Object3D()
                rear.position.set(0, 500, -500);
                rear.target = self.walker.object.position;
                self.walker.object.add(rear);


                // const front = new THREE.Object3D()
                // front.position.set(-200, 500, 500);
                // front.target = self.walker.object.position;
                // self.walker.object.add(front);

                self.cameras = { wideRight, wideLeft, rear };
                self.activeCamera = wideRight;
            }
        );
        return self.walker
    }

    set showPath(value) {
        if (this.walker.pathLines) this.walker.pathLines.visible = value;
        this.debug.showPath = value;
    }

    get showPath() {
        return this.debug.showPath;
    }

    set showShadowHelper(value) {
        if (this.helper) this.helper.visible = value;
        this.debug.showShadowHelper = value;
    }

    get showShadowHelper() {
        return this.debug.showShadowHelper;
    }

    get randomWaypoint() {
        const index = Math.floor(Math.random() * this.waypoints.length);
        return this.waypoints[index];
    }

    switchCamera() {
        if (this.activeCamera == this.cameras.wideRight) {
            this.activeCamera = this.cameras.wideLeft;
        } else if (this.activeCamera == this.cameras.wideLeft) {
            this.activeCamera = this.cameras.rear;
        } else if (this.activeCamera == this.cameras.rear) {
            this.activeCamera = this.cameras.front;
        } else if (this.activeCamera == this.cameras.front) {
            this.activeCamera = this.cameras.wideRight;
        }
    }


    destroy() {
        window.cancelAnimationFrame(requestId);
    }

    render() {
        const dt = this.clock.getDelta();
        requestId = requestAnimationFrame(() => { this.render(); });

        // if (this.activeCamera && this.controls === undefined) {
        if (this.activeCamera) {
            this.camera.position.lerp(this.activeCamera.getWorldPosition(new THREE.Vector3()), 0.1);
            const pos = this.activeCamera.target.clone();
            pos.y += 1.8;
            this.camera.lookAt(pos);
        }
        // if (moveValid) {
        this.walker.update(dt);
        // }
        console.log('hu')

        this.renderer.render(this.scene, this.camera);
    }
}

export { ModelNavigate }