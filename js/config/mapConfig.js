export const mapConfig = {
    center: [30, -90],
    zoom: 3,

    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    minZoom: 2,
    maxZoom: 18,

    maxBoundsViscosity: 1.0,  
    bounceAtZoomLimits: true,
    worldCopyJump: false
};

export const markerStyle = {
    icon: L.divIcon({
        className: 'custom-marker',
        html: '<div></div>',
        iconSize: [12, 12]
    })
};

export const popupConfig = {
    maxWidth: 300,
    className: 'custom-popup',
    autoClose: false,
    closeButton: false,
    offset: [0, -10]
}; 