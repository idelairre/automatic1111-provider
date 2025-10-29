#!/usr/bin/env node

/**
 * Simple test app for ComfyUI Provider - Basic functionality test
 * Tests that the provider can connect to ComfyUI and generate any image
 */

import { createComfyUIProvider } from '../dist/index.js';
import { experimental_generateImage as generateImage } from 'ai';
import { writeFileSync } from 'fs';

/**
 * Fetch available models from ComfyUI
 */
async function fetchAvailableModels(baseURL = 'http://127.0.0.1:8188') {
   try {
      console.log('📋 Fetching available models from ComfyUI...');
      const response = await fetch(`${baseURL}/models/checkpoints`);

      if (!response.ok) {
         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const models = await response.json();
      console.log(`✅ Found ${models.length} available models:`);
      models.slice(0, 10).forEach((model, index) => {
         console.log(`   ${index + 1}. ${model}`);
      });

      if (models.length > 10) {
         console.log(`   ... and ${models.length - 10} more models`);
      }

      return models;
   } catch (error) {
      console.error('❌ Failed to fetch models:', error.message);
      console.log('💡 Make sure ComfyUI is running and accessible');
      return [];
   }
}

async function testComfyUIProvider() {
   console.log('🚀 Testing ComfyUI Provider - Basic Connection Test...');
   console.log('⚙️  Provider: ComfyUI (port 8188)');
   console.log('');

   // First, fetch available models to show what's installed
   const availableModels = await fetchAvailableModels();
   console.log('');

   try {
      // Test with a custom provider instance (different port to test configuration)
      const customProvider = createComfyUIProvider({
         baseURL: 'http://127.0.0.1:8188',
         clientId: 'test-app',
      });

      const result = await generateImage({
         model: customProvider.image('v1-5-pruned-emaonly'), // More common model
         prompt: `A simple test image: a beautiful landscape with mountains and a lake`,
         n: 1,
         size: '512x512',
         providerOptions: {
            comfyui: {
               negativePrompt: 'blurry, ugly, deformed',
               steps: 20,
               cfgScale: 7,
               checkModelExists: false, // Skip model check for basic test
            },
         },
      });

      console.log('✅ Image generation successful!');
      console.log(`📊 Generated ${result.images.length} image(s)`);
      console.log(`📏 Image size: ${result.images[0].uint8Array.length} bytes`);
      console.log(`🎭 Warnings: ${result.warnings.length > 0 ? result.warnings.map(w => w.details).join(', ') : 'None'}`);

      // Save the image to a file
      const filename = `test-image-${Date.now()}.png`;
      writeFileSync(filename, result.images[0].uint8Array);
      console.log(`💾 Image saved as: ${filename}`);

      console.log('');
      console.log('🎉 ComfyUI Provider is working correctly!');
      console.log('📸 Test image generated and saved successfully.');

   } catch (error) {
      console.error('❌ Error during image generation:');
      console.error(error.message);

      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
         console.log('');
         console.log('💡 ComfyUI Connection Issues:');
         console.log('1. Make sure ComfyUI is running');
         console.log('2. Verify ComfyUI is accessible at http://127.0.0.1:8188');
         console.log('3. Check that ComfyUI API server is enabled');
         console.log('4. Try starting ComfyUI with: python main.py');
      } else if (error.message.includes('model')) {
         console.log('');
         console.log('💡 Model Issues:');
         console.log('1. Install a Stable Diffusion model in ComfyUI');
         console.log('2. Place model files in: ComfyUI/models/checkpoints/');
         console.log('3. Try a different model name that exists in your ComfyUI');
      }

      process.exit(1);
   }
}

// Run the test
testComfyUIProvider();
