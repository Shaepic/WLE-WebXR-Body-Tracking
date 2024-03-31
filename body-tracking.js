//body-tracking component by Tristan based on original Wonderland hand-tracking component. 
import {Component, MeshComponent, Property, TextComponent} from '@wonderlandengine/api';
import { vec3, quat, quat2 } from 'gl-matrix';
import { setXRRigidTransformLocal } from '@wonderlandengine/components/dist/utils/webxr.js';
const ORDERED_JOINTS = [
	//"root", root bone rendering is optional and less appropriate for use with a ull body avatar/model.
  "hips",
  "spine-lower",
  "spine-middle",
  "spine-upper",
  "chest",
  "neck",
  "head",
  "left-shoulder",
  "left-scapula",
  "left-arm-upper",
  "left-arm-lower",
  "left-hand-wrist-twist",
  "right-shoulder",
  "right-scapula",
  "right-arm-upper",
  "right-arm-lower",
  "right-hand-wrist-twist",
  "left-hand-palm",
  "left-hand-wrist",
  "left-hand-thumb-metacarpal",
  "left-hand-thumb-phalanx-proximal",
  "left-hand-thumb-phalanx-distal",
  "left-hand-thumb-tip",
  "left-hand-index-metacarpal",
  "left-hand-index-phalanx-proximal",
  "left-hand-index-phalanx-intermediate",
  "left-hand-index-phalanx-distal",
  "left-hand-index-tip",
  "left-hand-middle-phalanx-metacarpal", //this matches a miss-labeled tracker in the API and may be changed in the near future.
  "left-hand-middle-phalanx-proximal",
  "left-hand-middle-phalanx-intermediate",
  "left-hand-middle-phalanx-distal",
  "left-hand-middle-tip",
  "left-hand-ring-metacarpal",
  "left-hand-ring-phalanx-proximal",
  "left-hand-ring-phalanx-intermediate",
  "left-hand-ring-phalanx-distal",
  "left-hand-ring-tip",
  "left-hand-little-metacarpal",
  "left-hand-little-phalanx-proximal",
  "left-hand-little-phalanx-intermediate",
  "left-hand-little-phalanx-distal",
  "left-hand-little-tip",
  "right-hand-palm",
  "right-hand-wrist",
  "right-hand-thumb-metacarpal",
  "right-hand-thumb-phalanx-proximal",
  "right-hand-thumb-phalanx-distal",
  "right-hand-thumb-tip",
  "right-hand-index-metacarpal",
  "right-hand-index-phalanx-proximal",
  "right-hand-index-phalanx-intermediate",
  "right-hand-index-phalanx-distal",
  "right-hand-index-tip",
  "right-hand-middle-metacarpal",
  "right-hand-middle-phalanx-proximal",
  "right-hand-middle-phalanx-intermediate",
  "right-hand-middle-phalanx-distal",
  "right-hand-middle-tip",
  "right-hand-ring-metacarpal",
  "right-hand-ring-phalanx-proximal",
  "right-hand-ring-phalanx-intermediate",
  "right-hand-ring-phalanx-distal",
  "right-hand-ring-tip",
  "right-hand-little-metacarpal",
  "right-hand-little-phalanx-proximal",
  "right-hand-little-phalanx-intermediate",
  "right-hand-little-phalanx-distal",
  "right-hand-little-tip",
  "left-upper-leg",
  "left-lower-leg",
  "left-foot-ankle-twist",
  "left-foot-ankle",
  "left-foot-subtalar",
  "left-foot-transverse",
  "left-foot-ball",
  "right-upper-leg",
  "right-lower-leg",
  "right-foot-ankle-twist",
  "right-foot-ankle",
  "right-foot-subtalar",
  "right-foot-transverse",
  "right-foot-ball",
];
const invTranslation = new Float32Array(3);
const invRotation = new Float32Array(4);
/**
 * body-tracking
 */
export class BodyTracking extends Component {
    static TypeName = 'body-tracking';
    /* Properties that are configurable in the editor */
    static Properties = {
        bodySkin: Property.skin(),
        jointMesh: Property.mesh(),
        jointMaterial: Property.material(),
        textObject: Property.object(),
    };
	joints = [];
    start() {         
    	if (!('XRBody' in window)) {
            console.warn('WebXR Body Tracking not supported by this browser.');
            this.active = false;
            return;
        }
        if (this.bodySkin) {
            let skin = this.bodySkin;
            let jointIds = skin.jointIds;
            // Map the body 
            // Index in ORDERED_JOINTS that we are mapping to our joints 
            for (let j = 0; j < jointIds.length; ++j) {
            	const sjoint = this.engine.wrapObject(jointIds[j]);
               // body-joint hierarchy remapping
               for (let n = 0; n < ORDERED_JOINTS.length; n+=1) {
               		if (ORDERED_JOINTS[n] == sjoint.name) {
               			this.joints[ORDERED_JOINTS[n]] = sjoint;
               		}
               }
               
               
            }
            //For body-joint debugging.
            // Lists all successfully mapped model joints to a text object. A successful map should list 83 joints as of 26/3/24. 
            // This allowed me to find the miss-labeled "left-hand-middle-phalanx-metacarpal" joint within the API itself (26/3/24).
         if (this.textObject) {
            	for (let n = 0; n < ORDERED_JOINTS.length; ++n) {
            		let text = this.textObject.getComponent('text');
            		text.text += "\n" + this.joints[ORDERED_JOINTS[n]].name;
            	} 
            }
            return;
        }
        else {
        /* Spawn joint markers */
        const jointObjects = this.engine.scene.addObjects(ORDERED_JOINTS.length, this.object.parent, ORDERED_JOINTS.length);
        for (let j = 0; j < ORDERED_JOINTS.length; ++j) {
            let joint = jointObjects[j];
            joint.addComponent(MeshComponent, {
                mesh: this.jointMesh,
                material: this.jointMaterial,
            });
            this.joints[ORDERED_JOINTS[j]] = joint;
        }
        
        }
    }

    update(dt) {
    	const body = this.engine.xr?.frame?.body;
    	if (body) {       
        		this.object.getRotationLocal(invRotation);
                quat.conjugate(invRotation, invRotation);
                this.object.getTranslationLocal(invTranslation);
                
                for (let j = 0; j < ORDERED_JOINTS.length; ++j) {
                    const jointName = ORDERED_JOINTS[j];
                    const joint = this.joints[jointName];
                    if (joint === null)
                        continue;
                    let jointPose = null;
                    const jointSpace = body.get(jointName);
                    if (jointSpace !== null) {
                        jointPose = this.engine.xr.frame.getPose(jointSpace, this.engine.xr.currentReferenceSpace);    
                    }
                    if (jointPose !== null) {
                        if (this.bodySkin) {
                            joint.resetTranslationRotation();
                            joint.translate([
                                jointPose.transform.position.x - invTranslation[0],
                                jointPose.transform.position.y - invTranslation[1],
                                jointPose.transform.position.z - invTranslation[2],
                            ]);
                            joint.rotate(invRotation);
                            joint.rotateObject([
                                jointPose.transform.orientation.x,
                                jointPose.transform.orientation.y,
                                jointPose.transform.orientation.z,
                                jointPose.transform.orientation.w,
                            ]);
                        }
                        else {
                            setXRRigidTransformLocal(joint, jointPose.transform);
                            // Last joint radius of each finger is null 
                            const r = jointPose.radius || 0.007;
                            joint.setScalingLocal([r, r, r]);
                        }
                    }
    			}  
    	}
    } 
        
}
