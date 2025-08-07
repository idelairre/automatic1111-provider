import { experimental_generateImage as generateImage } from 'ai';
import { automatic1111 } from './index.js';
import fs from 'fs';

async function main() {
  console.log('🚀 Starting Automatic1111 image generation test...');
  
  try {
    // Test the provider setup
    console.log('📋 Provider details:');
    console.log('- Base URL: http://127.0.0.1:7860 (default)');
    console.log('- Model ID: sd-v1-5 (example)');
    
    console.log('\n🎨 Generating image with prompt: "A cute baby sea otter"');
    
    const { image } = await generateImage({
      model: automatic1111.image('sd-v1-5'), // Common Stable Diffusion model name
      prompt: 'A cute baby sea otter',
      providerOptions: {
        automatic1111: {
          steps: 20,
          cfg_scale: 7,
          negative_prompt: 'blurry, low quality',
        }
      }
    });
    
    console.log('\n✅ Image generated successfully!');
    console.log('📊 Image details:');
    console.log(`- Type: ${image.constructor.name}`);
    console.log('- Format: Base64 encoded image data');
    
    // Optionally save to file for testing
    console.log('\n💾 To save the image, you could write it to a file like:');
    console.log('  fs.writeFileSync("output.png", image);');
    fs.writeFileSync("output.png", image.uint8Array);
    
  } catch (error) {
    console.error('\n❌ Error generating image:');
    console.error(error);
    
    if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch'))) {
      console.log('\n💡 Tip: Make sure Automatic1111 is running on http://127.0.0.1:7860');
      console.log('   Start it with: python launch.py --api');
    }
  }
}

main().catch(console.error);