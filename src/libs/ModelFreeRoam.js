import * as THREE from 'three'


const infoTags = [
    {
        position: new THREE.Vector3(-3, 2.5, -15,),
        V201: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.5, 0.8, - 1.6),
        V202: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(1.6, - 1.3, - 0.7),
        V203: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(2.0, - 1.3, - 0.7),
        V207: document.querySelector('.point-3')
    }
]

const rooms = {
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

class ModelFreeRoam {
    constructor(params) {
        // this._Initialize();
        this.scene = params.scene
        this.camera = params.camera;
        this.controls = params.controls
        this.clock = params.clock
        this.renderer = params.renderer
        this.controls.enabled = true;
        const second = this.scene.getObjectByName("secondFloor")
        second.visible = true
        this.render();

        this.infoTags = [
            {
                position: new THREE.Vector3(-3, 2.5, -15,),
                V201: document.querySelector('.point-0')
            },
            {
                position: new THREE.Vector3(0.5, 0.8, - 1.6),
                V202: document.querySelector('.point-1')
            },
            {
                position: new THREE.Vector3(1.6, - 1.3, - 0.7),
                V203: document.querySelector('.point-2')
            },
            {
                position: new THREE.Vector3(2.0, - 1.3, - 0.7),
                V207: document.querySelector('.point-3')
            }
        ]



    }


    // _Initialize() {

    //     // this._camera = camera
    //     // this._scene = scene
    //     // this._controls = null
    //     // this._mixers = [];
    //     // this._previousRAF = null;
    //     // const geometry = new THREE.SphereGeometry(5, 32, 16);
    //     // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    //     // this.sphere = new THREE.Mesh(geometry, material);
    //     // scene.add(this.sphere);

    // }
    render() {

        // tick(clock.getDelta());

        // controls.movementSpeed = 5;
        this.controls.update(this.clock.getDelta());

        // if (this._previousRAF === null) {
        //     this._previousRAF = t;

        // }


        const screenPosition = infoTags[0]["position"].clone()
        screenPosition.project(this.camera)


        if (this.camera.position.distanceTo(rooms["V201"]) < 4) {
            infoTags[0]["V201"].classList.add('visible')
        }

        else {
            infoTags[0]["V201"].classList.remove('visible')
        }


        const translateX = screenPosition.x * window.innerWidth * 0.5
        const translateY = - screenPosition.y * window.innerHeight * 0.5
        infoTags[0]["V201"].style.transform = `translateX(${translateX}px) translateY(${translateY}px)`

        requestId = requestAnimationFrame(() => { this.render() });
        this.renderer.render(this.scene, this.camera)
        // this._Step(t - this._previousRAF);
        // this._previousRAF = t;

        // html tags of corresponding classes3





        // console.log(infoTags[0]);




        // if(camera.position.distanceTo(rooms["V202"]) < 8){
        //  V202.classList.add('visible')
        // }

        // else{
        //  V202.classList.remove('visible')
        // }




        // console.log(camera.position.distanceTo(rooms["V202"]));

        // console.log(camera.position);
    }
}

export { ModelFreeRoam };