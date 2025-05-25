import { markerStyle, popupConfig } from '../config/mapConfig.js';
import { InfoPanelManager } from '../panel/infoPanelManager.js';

export class MarkerManager {
    constructor(map) {
        this.map = map;
        this.markers = [];
        this.infoPanelManager = new InfoPanelManager();
        this.minDistance = 0.5;
    }

    _isPositionTooClose(newLat, newLng) {
        return this.markers.some(marker => {
            const pos = marker.getLatLng();
            const distance = Math.sqrt(
                Math.pow(pos.lat - newLat, 2) + 
                Math.pow(pos.lng - newLng, 2)
            );
            return distance < this.minDistance;
        });
    }
    _findSuitablePosition(originalLat, originalLng) {
        let lat = parseFloat(originalLat);
        let lng = parseFloat(originalLng);
        
        if (!this._isPositionTooClose(lat, lng)) {
            return [lat, lng];
        }

        const spiralSteps = 12;
        const maxAttempts = 8;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const offset = this.minDistance * (attempt / 2);
            
            for (let step = 0; step < spiralSteps; step++) {
                const angle = (step / spiralSteps) * 2 * Math.PI;
                const newLat = lat + offset * Math.cos(angle);
                const newLng = lng + offset * Math.sin(angle);
                
                if (!this._isPositionTooClose(newLat, newLng)) {
                    return [newLat, newLng];
                }
            }
        }
        return [lat, lng];
    }

    createMarkerWithHoverPopup(event) {
        const { lat, lng, time, summary, country } = event;
        const [adjustedLat, adjustedLng] = this._findSuitablePosition(parseFloat(lat), parseFloat(lng));
        const position = [adjustedLat, adjustedLng];
        const marker = L.marker(position, markerStyle).addTo(this.map);
        marker.bindPopup(`<strong>${time}</strong><br>${summary}`, {
            className: 'hermap-popup-yellow'
        });

        const popup = L.popup(popupConfig)
            .setLatLng(position)
            .setContent(`<strong>${time}</strong><br>${summary}`);

        this._setupHoverEvents(marker, popup);
        this._setupClickEvent(marker, { summary, time, country });
        this.markers.push(marker);
        return marker;
    }

    _setupHoverEvents(marker, popup) {
        marker.on('mouseover', () => {
            const infoPanel = document.getElementById('info-panel');
            if (!infoPanel || infoPanel.style.display !== 'block') {
                marker.openPopup();
            }
        });

        marker.on('mouseout', () => {
            const infoPanel = document.getElementById('info-panel');
            if (!infoPanel || infoPanel.style.display !== 'block') {
                marker.closePopup();
            }
        });
    }

    _setupClickEvent(marker, eventData) {
        marker.on('click', () => {
            console.log('Marker clicked');
            const markerPos = marker.getLatLng();
            const mapBounds = this.map.getBounds();
            const mapCenter = this.map.getCenter();

            const isMarkerOnRight = markerPos.lng > mapCenter.lng;
            const mapWidth = mapBounds.getEast() - mapBounds.getWest();
            const quarterWidth = mapWidth / 4;
            
            let newCenter;
            if (isMarkerOnRight) {
                newCenter = L.latLng(
                    markerPos.lat,
                    markerPos.lng - quarterWidth
                );
                this.infoPanelManager.setPosition('right');
                console.log('Positioning panel on right');
            } else {
                newCenter = L.latLng(
                    markerPos.lat,
                    markerPos.lng + quarterWidth
                );
                this.infoPanelManager.setPosition('left');
                console.log('Positioning panel on left');
            }

            // 先移动地图
            this.map.once('moveend', () => {
                console.log('Map move completed');
                this.infoPanelManager.showPanel(isMarkerOnRight ? 'right' : 'left');
                this.infoPanelManager.loadAIResponse(eventData);
            });

            this.map.panTo(newCenter, { 
                animate: true,
                duration: 0.5
            });
        });
    }

    updateMarkers(events) {
        this.clearMarkers();
        events.forEach(event => {
            if (event.lat && event.lng) {
                this.createMarkerWithHoverPopup(event);
            }
        });
    }

    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }
} 