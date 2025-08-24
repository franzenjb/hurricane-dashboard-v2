// Mapbox 3D functions for hurricane visualization
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnJhbnplbmplZmYiLCJhIjoiY21kN2Y0amZpMGs2NDJscHZycDRndDZ0eiJ9.4jmoLB2KQDRVN_wYKUg1Yw';

// Initialize Mapbox 3D
function initMapbox3D() {
    try {
        console.log('Initializing Mapbox 3D viewer');
        
        // Set token
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // Create map
        mapbox3DViewer = new mapboxgl.Map({
            container: 'mapbox3D',
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [-85, 27],
            zoom: 5,
            pitch: 45,
            bearing: -17
        });
        
        mapbox3DViewer.on('load', () => {
            console.log('Mapbox 3D loaded successfully');
            // Draw storm track after map loads
            if (animationState.stormPoints && animationState.stormPoints.length > 0) {
                drawMapbox3DStormTrack();
            }
        });
        
        return true;
    } catch (error) {
        console.error('Failed to initialize Mapbox:', error);
        return false;
    }
}

// Get color based on wind speed
function getMapboxCategoryColor(windKnots) {
    const windMph = windKnots * 1.15078; // Convert knots to mph
    if (windMph >= 157) return '#8B008B'; // Cat 5
    if (windMph >= 130) return '#DC143C'; // Cat 4
    if (windMph >= 111) return '#FF8C00'; // Cat 3
    if (windMph >= 96)  return '#FFD700'; // Cat 2
    if (windMph >= 74)  return '#32CD32'; // Cat 1
    if (windMph >= 39)  return '#4682B4'; // TS
    return '#808080'; // TD
}

// Draw storm track in Mapbox
function drawMapbox3DStormTrack() {
    if (!mapbox3DViewer || !animationState.stormPoints || animationState.stormPoints.length < 2) {
        console.error('Mapbox not ready or no storm data');
        return;
    }
    
    console.log('Drawing storm track in Mapbox 3D');
    
    // Create segments with colors
    const segments = [];
    const bounds = new mapboxgl.LngLatBounds();
    
    for (let i = 0; i < animationState.stormPoints.length - 1; i++) {
        const point1 = animationState.stormPoints[i];
        const point2 = animationState.stormPoints[i + 1];
        
        const [lon1, lat1] = point1.geometry.coordinates;
        const [lon2, lat2] = point2.geometry.coordinates;
        
        bounds.extend([lon1, lat1]);
        
        const color = getMapboxCategoryColor(point1.properties?.max_wind || 0);
        
        segments.push({
            type: 'Feature',
            properties: {
                color: color,
                index: i
            },
            geometry: {
                type: 'LineString',
                coordinates: [[lon1, lat1], [lon2, lat2]]
            }
        });
    }
    
    // Add last point to bounds
    const lastPoint = animationState.stormPoints[animationState.stormPoints.length - 1];
    bounds.extend(lastPoint.geometry.coordinates);
    
    // Wait for map to be ready
    if (mapbox3DViewer.loaded()) {
        addTrackToMap(segments, bounds);
    } else {
        mapbox3DViewer.on('load', () => {
            addTrackToMap(segments, bounds);
        });
    }
}

function addTrackToMap(segments, bounds) {
    // Remove existing sources/layers if they exist
    if (mapbox3DViewer.getSource('hurricane-segments')) {
        mapbox3DViewer.removeLayer('hurricane-complete');
        mapbox3DViewer.removeLayer('animated-path');
        mapbox3DViewer.removeSource('hurricane-segments');
    }
    if (mapbox3DViewer.getSource('animated-segments')) {
        mapbox3DViewer.removeSource('animated-segments');
    }
    if (mapbox3DViewer.getSource('current-position')) {
        mapbox3DViewer.removeLayer('current-position');
        mapbox3DViewer.removeSource('current-position');
    }
    
    // Add complete path (semi-transparent)
    mapbox3DViewer.addSource('hurricane-segments', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: segments
        }
    });
    
    mapbox3DViewer.addLayer({
        id: 'hurricane-complete',
        type: 'line',
        source: 'hurricane-segments',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 6,
            'line-opacity': 0.3
        }
    });
    
    // Add animated segments source
    mapbox3DViewer.addSource('animated-segments', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });
    
    mapbox3DViewer.addLayer({
        id: 'animated-path',
        type: 'line',
        source: 'animated-segments',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 10,
            'line-opacity': 1
        }
    });
    
    // Add current position marker
    mapbox3DViewer.addSource('current-position', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: animationState.stormPoints[0].geometry.coordinates
            }
        }
    });
    
    mapbox3DViewer.addLayer({
        id: 'current-position',
        type: 'circle',
        source: 'current-position',
        paint: {
            'circle-radius': 12,
            'circle-color': '#FFFF00',
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 2
        }
    });
    
    // Fit map to storm bounds
    mapbox3DViewer.fitBounds(bounds, {
        padding: 100,
        pitch: 45,
        bearing: -17
    });
}

// Update animation frame in Mapbox
function updateMapbox3DFrame(frameIndex) {
    if (!mapbox3DViewer || !animationState.stormPoints) return;
    
    // Create segments up to current frame
    const segments = [];
    for (let i = 0; i <= frameIndex && i < animationState.stormPoints.length - 1; i++) {
        const point1 = animationState.stormPoints[i];
        const point2 = animationState.stormPoints[i + 1];
        
        const [lon1, lat1] = point1.geometry.coordinates;
        const [lon2, lat2] = point2.geometry.coordinates;
        
        const color = getMapboxCategoryColor(point1.properties?.max_wind || 0);
        
        segments.push({
            type: 'Feature',
            properties: {
                color: color,
                index: i
            },
            geometry: {
                type: 'LineString',
                coordinates: [[lon1, lat1], [lon2, lat2]]
            }
        });
    }
    
    // Update animated segments
    if (mapbox3DViewer.getSource('animated-segments')) {
        mapbox3DViewer.getSource('animated-segments').setData({
            type: 'FeatureCollection',
            features: segments
        });
    }
    
    // Update current position
    if (frameIndex < animationState.stormPoints.length && mapbox3DViewer.getSource('current-position')) {
        mapbox3DViewer.getSource('current-position').setData({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: animationState.stormPoints[frameIndex].geometry.coordinates
            }
        });
    }
}

// Simple toggle function
function simpleToggle3D() {
    console.log('Simple toggle 3D called');
    
    if (!animationState.stormPoints || animationState.stormPoints.length < 2) {
        alert('Please wait for storm data to load');
        return;
    }
    
    animationState.is3D = !animationState.is3D;
    const mapDiv = document.getElementById('stormMap');
    const mapbox3DDiv = document.getElementById('mapbox3D');
    const toggle3DBtn = document.getElementById('toggle3D');
    
    if (animationState.is3D) {
        // Switch to 3D
        mapDiv.style.display = 'none';
        mapbox3DDiv.style.display = 'block';
        toggle3DBtn.textContent = '2D View';
        toggle3DBtn.classList.remove('bg-purple-500', 'hover:bg-purple-600');
        toggle3DBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        
        if (!mapbox3DViewer) {
            if (!initMapbox3D()) {
                // Failed - revert to 2D
                animationState.is3D = false;
                mapDiv.style.display = 'block';
                mapbox3DDiv.style.display = 'none';
                toggle3DBtn.textContent = '3D View';
                return;
            }
        } else {
            // Map already exists, just draw the track
            drawMapbox3DStormTrack();
        }
        
        // Ensure animation controls stay visible
        const animControls = document.getElementById('animationControls');
        if (animControls) {
            animControls.style.display = 'block';
            animControls.style.zIndex = '9999999';
            animControls.style.position = 'fixed';
            animControls.style.bottom = '20px';
        }
        
    } else {
        // Switch to 2D
        mapbox3DDiv.style.display = 'none';
        mapDiv.style.display = 'block';
        toggle3DBtn.textContent = '3D View';
        toggle3DBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        toggle3DBtn.classList.add('bg-purple-500', 'hover:bg-purple-600');
    }
}