async function initMap () {
    const $searchResultsContainer = document.querySelector('#search-results');
    
    const db = await fetch('/api/stores')
        .then(res => res.json())
        .then(data => data)
        .catch(err => console.log(err));
    
    console.log(db)
    
    const map = new google.maps.Map(document.getElementById("map"), {
        // center: {
        //     lat: 52.4749156,
        //     lng: -1.7869235,
        // },
        // zoom: 10,
    });
    
    const $input = document.querySelector('#search-input');
    const searchBox = new google.maps.places.SearchBox($input);
    
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds())
    });
    
    const bounds = new google.maps.LatLngBounds();
    
    const markers = db.stores.map((x, i) => {
        const marker = new google.maps.Marker({
            map: map,
            title: x.name,
            position: new google.maps.LatLng(x.latitude, x.longitude),
            icon: './circle-cropped.png',
        });
    
        bounds.extend(marker.position);
        
        const infoWindow = new google.maps.InfoWindow({
            content: `<h1>${x.name}</h1>`,
        });
        
        marker.addListener('click', function () {
            infoWindow.open(map, marker)
        });
        
        return marker;
    });
    
    map.fitBounds(bounds);
    
    const autocompleteOptions = {
        bounds: bounds,
        strictBounds: true,
        componentRestrictions: {
            country: 'gb'
        }
    };
    const autocomplete = new google.maps.places.Autocomplete($input, autocompleteOptions);
    autocomplete.bindTo('bounds', map);
    
    const getStoreCardMarkup = (storeMarker) => {
        const store = db.stores[storeMarker.storeIndex];
        return `
            <div class="search-result-card">
                <h3 class="search-result-card__title">${store.name}</h3>
                <p><strong>Nyitvatartás:</strong></p>
                ${store.openingHours.map(day => {
                    return `<p>${day.name}: ${day.opens} - ${day.closes}</p>`
                }).join('')}
            </div>
        `;
    };
    
    const updateMap = () => {
        const places = searchBox.getPlaces();
        console.log(places);
        if (places.length === 0) {
            return;
        }
    
        const bounds = new google.maps.LatLngBounds();
    
        places.forEach(p => {
            if (!p.geometry) {
                return;
            }
        
            if (p.geometry.viewport) {
                bounds.union(p.geometry.viewport)
            } else {
                bounds.extend(p.geometry.location)
            }
        });
        
        map.fitBounds(bounds);
        
        const newBounds = map.getBounds();
        
        $searchResultsContainer.innerHTML = "";
        const filteredMarkers = markers.reduce((acc, curr, i) => {
            if (newBounds.contains(curr.getPosition())) {
                curr.storeIndex = i;
                acc.push(curr)
            }
            return acc
        }, []);
        
        filteredMarkers.forEach(storeMarker => {
            $searchResultsContainer.innerHTML += getStoreCardMarkup(storeMarker);
        });
        
    };
    
    // document.querySelector('#search-button').addEventListener('click', () => {
    //     google.maps.event.trigger(autocomplete, 'place_changed');
    // });
    searchBox.addListener('places_changed', updateMap);
}
