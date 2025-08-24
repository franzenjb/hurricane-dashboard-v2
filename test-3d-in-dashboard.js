// Test script to verify 3D functionality in the actual dashboard
// Run this in the browser console after opening a storm modal

console.log('=== 3D Test Script ===');

// Check if we're in the Database tab
const iframe = document.querySelector('iframe[src*="enhanced-database.html"]');
if (!iframe) {
    console.error('❌ Database tab iframe not found');
} else {
    console.log('✅ Database iframe found');
    
    // Access the iframe's window
    const iframeWin = iframe.contentWindow;
    
    // Check for Cesium
    if (typeof iframeWin.Cesium === 'undefined') {
        console.error('❌ Cesium not loaded in iframe');
    } else {
        console.log('✅ Cesium loaded, version:', iframeWin.Cesium.VERSION);
    }
    
    // Check animation state
    if (iframeWin.animationState) {
        console.log('Animation State:', {
            is3D: iframeWin.animationState.is3D,
            stormPoints: iframeWin.animationState.stormPoints?.length || 0,
            cesiumViewer: !!iframeWin.cesiumViewer,
            atmosphereEnabled: iframeWin.animationState.atmosphereEnabled
        });
    }
    
    // Check if 3D viewer exists
    if (iframeWin.cesiumViewer) {
        console.log('✅ Cesium viewer exists');
        
        // Check atmosphere settings
        const scene = iframeWin.cesiumViewer.scene;
        console.log('Atmosphere settings:', {
            skyAtmosphere: scene.skyAtmosphere ? scene.skyAtmosphere.show : 'not present',
            groundAtmosphere: scene.globe.showGroundAtmosphere,
            lighting: scene.globe.enableLighting,
            fog: scene.fog.enabled
        });
    } else {
        console.log('⚠️ Cesium viewer not initialized yet');
    }
}

console.log('=== End Test ===');
console.log('To test: 1) Open Database tab, 2) Click View on any storm, 3) Click 3D View button');