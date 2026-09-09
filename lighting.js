import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createLightingPipeline(renderer,scene,camera,glassGroup,sky){
  class ArchitecturalAO extends SSAOPass {
    overrideVisibility(){
      super.overrideVisibility();
      // Clear glazing must not become an opaque occluder in the depth pass.
      glassGroup.visible=false;sky.visible=false;
      scene.traverse(object=>{if(object.userData.excludeAO)object.visible=false;});
    }
    setSize(width,height){super.setSize(Math.max(1,Math.round(width*.65)),Math.max(1,Math.round(height*.65)));}
  }
  const composer=new EffectComposer(renderer);
  // The offscreen beauty buffer also receives MSAA on WebGL 2 devices.
  const samples=Math.min(4,renderer.capabilities.maxSamples);
  composer.renderTarget1.samples=samples;composer.renderTarget2.samples=samples;
  const ao=new ArchitecturalAO(scene,camera,1,1,24);
  ao.kernelRadius=.85;ao.minDistance=.00005;ao.maxDistance=.008;
  ao.ssaoMaterial.fragmentShader=ao.ssaoMaterial.fragmentShader.replace('1.0 - occlusion','1.0 - occlusion * 0.72');
  composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());
  return composer;
}
