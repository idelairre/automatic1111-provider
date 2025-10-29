#!/usr/bin/env node

/**
 * Simple test app for ComfyUI Provider
 * Generates an image of Sgt. Motoko from Ghost in the Shell: SAC
 */

import { comfyUIProvider } from '../dist/index.js';
import { experimental_generateImage as generateImage } from 'ai';
import { writeFileSync } from 'fs';

async function testComfyUIProvider() {
   console.log('🚀 Testing ComfyUI Provider...');
   console.log('📝 Prompt: Highly detailed image of Sgt. Motoko from Ghost in the Shell: SAC');
   console.log('🎨 Model: illustriousXL');
   console.log('⚙️  Provider: ComfyUI (port 8188)');
   console.log('');

   try {
      const result = await generateImage({
         model: comfyUIProvider.image('illustriousXL'),
         prompt: `Highly detailed, photorealistic portrait of Major Motoko Kusanagi (Sgt. Motoko) from Ghost in the Shell: Standalone Complex, cyberpunk cyborg woman with long black hair, green eyes, pale skin, wearing a tight black cybernetic bodysuit, detailed mechanical cybernetic enhancements visible on neck and arms, urban cyberpunk background with neon lights and holographic displays, intricate details on clothing and skin textures, professional digital art, high resolution, cinematic lighting, sharp focus, masterpiece quality`,
         n: 1,
         size: '1024x1024',
         providerOptions: {
            comfyui: {
               negativePrompt: 'blurry, low quality, deformed, ugly, extra limbs, bad anatomy, watermark, text, signature',
               steps: 40,
               cfgScale: 8.5,
               sampler: 'euler_ancestral',
               checkModelExists: true,
            },
         },
      });

      console.log('✅ Image generation successful!');
      console.log(`📊 Generated ${result.images.length} image(s)`);
      console.log(`📏 Image dimensions: ${result.images[0].uint8Array.length} bytes`);
      console.log(`🎭 Warnings: ${result.warnings.length > 0 ? result.warnings.map(w => w.details).join(', ') : 'None'}`);

      // Save the image to a file
      const filename = `motoko-${Date.now()}.png`;
      writeFileSync(filename, result.images[0].uint8Array);
      console.log(`💾 Image saved as: ${filename}`);

      console.log('');
      console.log('🎉 Test completed successfully!');
      console.log('📸 Your Sgt. Motoko image has been generated and saved.');

   } catch (error) {
      console.error('❌ Error during image generation:');
      console.error(error.message);

      if (error.message.includes('model')) {
         console.log('');
         console.log('💡 Troubleshooting tips:');
         console.log('1. Make sure ComfyUI is running on port 8188');
         console.log('2. Ensure the "illustriousXL" model is installed in ComfyUI');
         console.log('3. Check that the model file exists in your ComfyUI models/checkpoints/ directory');
         console.log('4. Verify ComfyUI API is accessible at http://127.0.0.1:8188');
      }

      process.exit(1);
   }
}

// Run the test
testComfyUIProvider();
