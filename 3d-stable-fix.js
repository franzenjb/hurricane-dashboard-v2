// Ultra-stable 3D functions to replace the problematic ones

function safeToggle3DView() {
    console.log('Safe Toggle 3D view called');
    
    try {
        // Comprehensive checks
        if (!animationState.stormPoints || animationState.stormPoints.length < 2) {
            alert('Please wait for storm data to load');
            return false;
        }
        
        // Toggle state
        animationState.is3D = !animationState.is3D;
        
        const mapDiv = document.getElementById('stormMap');
        const cesiumDiv = document.getElementById('cesiumContainer');
        const toggle3DBtn = document.getElementById('toggle3D');
        const controls3D = document.getElementById('enhanced3DControls');
        
        if (!mapDiv || !cesiumDiv || !toggle3DBtn) {
            console.error('Required DOM elements not found');
            animationState.is3D = false;
            return false;
        }
        
        if (animationState.is3D) {
            // Switch to 3D
            mapDiv.style.display = 'none';
            cesiumDiv.style.display = 'block';
            toggle3DBtn.textContent = '2D View';
            toggle3DBtn.className = 'ml-3 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors';
            
            if (controls3D) {
                controls3D.style.display = 'block';
            }
            
            // Initialize Cesium if needed
            if (!cesiumViewer) {
                if (!safeInitCesium3D()) {
                    // Failed to init, revert to 2D
                    animationState.is3D = false;
                    mapDiv.style.display = 'block';
                    cesiumDiv.style.display = 'none';
                    return false;
                }
            }
            
            // Draw track with multiple retries
            let retries = 3;
            const tryDraw = () => {
                setTimeout(() => {
                    if (cesiumViewer && cesiumViewer.scene && cesiumViewer.entities) {
                        try {
                            safeDraw3DStormTrack();
                        } catch (e) {
                            console.error('Draw failed, retries left:', retries - 1, e);
                            if (--retries > 0) {
                                tryDraw();
                            }
                        }
                    } else if (--retries > 0) {
                        console.log('Cesium not ready, retrying...');
                        tryDraw();
                    }
                }, 500);
            };
            tryDraw();
            
        } else {
            // Switch to 2D
            cesiumDiv.style.display = 'none';
            mapDiv.style.display = 'block';
            toggle3DBtn.textContent = '3D View';
            toggle3DBtn.className = 'ml-3 px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors';
            
            if (controls3D) {
                controls3D.style.display = 'none';
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('Fatal error in toggle3D:', error);
        // Emergency reset
        animationState.is3D = false;
        const mapDiv = document.getElementById('stormMap');
        const cesiumDiv = document.getElementById('cesiumContainer');
        if (mapDiv) mapDiv.style.display = 'block';
        if (cesiumDiv) cesiumDiv.style.display = 'none';
        return false;
    }
}

function safeInitCesium3D() {
    console.log('Safe init Cesium3D');
    
    try {
        // Clean up any existing viewer
        if (cesiumViewer) {
            try {
                cesiumViewer.destroy();
            } catch (e) {
                console.warn('Could not destroy old viewer:', e);
            }
            cesiumViewer = null;
        }
        
        // Check if Cesium is loaded
        if (typeof Cesium === 'undefined') {
            console.error('Cesium library not loaded');
            alert('3D library not loaded. Please refresh the page.');
            return false;
        }
        
        // Disable Ion token
        Cesium.Ion.defaultAccessToken = undefined;
        
        // Create viewer with minimal options for stability
        cesiumViewer = new Cesium.Viewer('cesiumContainer', {
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            vrButton: false,
            scene3DOnly: true,  // Force 3D only for stability
            requestRenderMode: true,  // Better performance
            maximumRenderTimeChange: Infinity,
            imageryProvider: new Cesium.OpenStreetMapImageryProvider({
                url: 'https://a.tile.openstreetmap.org/'
            })
        });
        
        // Basic settings
        cesiumViewer.scene.globe.enableLighting = false;  // Simpler rendering
        cesiumViewer.scene.fog.enabled = false;  // Less complex
        cesiumViewer.scene.globe.depthTestAgainstTerrain = false;
        
        // Set view
        cesiumViewer.scene.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(-70, 25, 2000000)
        });
        
        console.log('Cesium initialized successfully');
        return true;
        
    } catch (error) {
        console.error('Failed to initialize Cesium:', error);
        cesiumViewer = null;
        return false;
    }
}

function safeDraw3DStormTrack() {
    console.log('Safe draw 3D storm track');
    
    if (!cesiumViewer || !cesiumViewer.entities || !animationState.stormPoints) {
        console.error('Prerequisites not met for 3D drawing');
        return false;
    }
    
    try {
        // Clear entities safely
        try {
            cesiumViewer.entities.removeAll();
        } catch (e) {
            console.warn('Could not clear entities:', e);
        }
        
        // Reset tracking arrays
        animationState.cesiumEntities = [];
        animationState.wallEntities = [];
        animationState.labelEntities = [];
        
        const points = animationState.stormPoints;
        if (points.length < 2) {
            console.error('Not enough points');
            return false;
        }
        
        // Build positions and colors arrays
        const positions = [];
        const colors = [];
        
        // Simple color map
        const categoryColors = {
            5: '#8B008B',  // Dark Magenta
            4: '#DC143C',  // Crimson
            3: '#FF8C00',  // Dark Orange
            2: '#FFD700',  // Gold
            1: '#32CD32',  // Lime Green
            0: '#4682B4',  // Steel Blue
            '-1': '#808080' // Gray
        };
        
        // Process points
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (!point || !point.geometry || !point.geometry.coordinates) {
                console.warn('Invalid point at index', i);
                continue;
            }
            
            const [lon, lat] = point.geometry.coordinates;
            if (isNaN(lon) || isNaN(lat)) {
                console.warn('Invalid coordinates at index', i);
                continue;
            }
            
            positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, 10000));
            
            // Determine color
            const windSpeed = point.properties?.max_wind || 0;
            let category = -1;
            if (windSpeed >= 137) category = 5;
            else if (windSpeed >= 113) category = 4;
            else if (windSpeed >= 96) category = 3;
            else if (windSpeed >= 83) category = 2;
            else if (windSpeed >= 64) category = 1;
            else if (windSpeed >= 34) category = 0;
            
            const color = Cesium.Color.fromCssColorString(categoryColors[category] || categoryColors['-1']);
            colors.push(color);
        }
        
        // Draw as single polyline for stability
        if (positions.length >= 2) {
            try {
                const pathEntity = cesiumViewer.entities.add({
                    polyline: {
                        positions: positions,
                        width: 10,
                        material: new Cesium.PolylineColorsMaterialProperty({
                            colors: colors
                        }),
                        clampToGround: false
                    }
                });
                
                animationState.cesiumEntities.push(pathEntity);
                
                // Add start/end markers
                const startMarker = cesiumViewer.entities.add({
                    position: positions[0],
                    point: {
                        pixelSize: 10,
                        color: Cesium.Color.GREEN,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2
                    }
                });
                
                const endMarker = cesiumViewer.entities.add({
                    position: positions[positions.length - 1],
                    point: {
                        pixelSize: 10,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2
                    }
                });
                
                animationState.cesiumEntities.push(startMarker, endMarker);
                
                // Zoom to entities
                setTimeout(() => {
                    try {
                        cesiumViewer.zoomTo(cesiumViewer.entities);
                    } catch (e) {
                        console.warn('Could not zoom:', e);
                    }
                }, 100);
                
                console.log('3D track drawn successfully');
                return true;
                
            } catch (e) {
                console.error('Error adding polyline:', e);
                return false;
            }
        }
        
    } catch (error) {
        console.error('Fatal error in draw 3D:', error);
        return false;
    }
}

// Export functions
window.safeToggle3DView = safeToggle3DView;
window.safeInitCesium3D = safeInitCesium3D;
window.safeDraw3DStormTrack = safeDraw3DStormTrack;