import { experimental_generateImage as generateImage } from 'ai';
import { createAutomatic1111 } from './index.js';

async function main() {
  console.log('🚀 Starting Automatic1111 image generation test...');
  
  try {
    // Test the provider setup
    console.log('📋 Provider details:');
    console.log('- Base URL: http://127.0.0.1:7860 (default)');
    console.log('- Model ID: v1-5-pruned-emaonly');
    
    console.log('\n🎨 Generating image with prompt: "A cute baby sea otter", and some other test properties');

    const automatic1111 = createAutomatic1111({
      baseURL: 'http://127.0.0.1:7860',
    });
    
    const { images } = await generateImage({
      model: automatic1111.image('v1-5-pruned-emaonly'), // Default Automatic1111 model
      prompt: 'A cute baby sea otter',
      n: 2,
      providerOptions: {
        automatic1111: {
          steps: 20,
          cfg_scale: 7,
          negative_prompt: 'blurry, low quality',
          sampler_name: "Euler a",
          denoising_strength: 0.5,
        }
      }
    });
        
    console.log('\n✅ Image generated successfully!');
    
  } catch (error) {
    console.error('\n❌ Error generating image:');
    console.error(error);
    
    if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch'))) {
      console.log('\n💡 Tip: Make sure Automatic1111 is running on http://127.0.0.1:7860');
      console.log('   Start it with: --api argument');
    }
  }
}

main().catch(console.error);