export class TimelineManager {
    constructor(markerManager) {
        this.markerManager = markerManager;
        this.slider = document.getElementById("year-slider");
        this.resetButton = document.getElementById("reset-to-all");
        this.allEvents = null;

        this.bindEventListeners();
    }

    bindEventListeners() {
        this.slider.addEventListener('input', () => {
            this.updateMapByYear();
        });

        this.resetButton.addEventListener('click', () => {
            this.showAllEvents();
        });
    }

    loadEvents() {
        fetch("events.json")
            .then(res => res.json())
            .then(data => {
                this.allEvents = data;
                this.showAllEvents();
            })
            .catch(err => console.error("JSON load error:", err));
    }

    showAllEvents() {
        if (this.allEvents) {
            this.markerManager.updateMarkers(this.allEvents);
        }
    }

    updateMapByYear() {
        if (!this.allEvents) return;

        const sliderYear = parseInt(this.slider.value);
        const filteredEvents = this.allEvents.filter(event => {
            const eventYear = parseInt(event.time);
            return eventYear <= sliderYear && eventYear >= sliderYear - 10;
        });

        this.markerManager.updateMarkers(filteredEvents);
    }
} 