// Global Variables
var map, clientID, clientSecret;

function AppViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // Foursquare API Client
            clientID = "2G4BOAVMDDTBVKZOU0WI0IBXSQOCMDTIOWZCKXS4XO1RAC0R";
            clientSecret =
                "3UZMRJ1XEB1WDHZROFUCCIGDJCFMWPVRG5J4FFDWVDNHEV4K";
            // URL for Foursquare API
            var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';
            // Foursquare API
            $.getJSON(apiUrl).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.zip = response.location.formattedAddress[3];
                self.country = response.location.formattedAddress[4];
                self.category = response.categories[0].shortName;

                self.htmlContentFoursquare =
                    '<h5 class="iw_subtitle">(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6 class="iw_address_title"> Address: </h6>' +
                    '<p class="iw_address">' + self.street + '</p>' +
                    '<p class="iw_address">' + self.city + '</p>' +
                    '<p class="iw_address">' + self.zip + '</p>' +
                    '<p class="iw_address">' + self.country +
                    '</p>' + '</div>' + '</div>';

                infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function() {
                // Send alert
                alert(
                    "There was an issue loading the Foursquare API. Please refresh your page to try again."
                );
            });
            
            // FLICKR API 
              // FLICKR API DETAILS
              var flickr_key = "c75932e4ac188cfc31b25d0b58f6d208";
              var flickr_secret = "583716d8abe4555d";
              var lat = marker.lat; 
              var lon = marker.lng;
              var text = marker.title;  
              console.log(lat+" "+lon);
              var flickr_URL = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickr_key}&format=json&nojsoncallback=1&lat=${lat}&lon=${lon}&text=${text}&extras=url_s`;
              
              console.log(flickr_URL);
              
            $.getJSON( flickr_URL, function( data ) {
              var all_photo = data.photos.photo;
              var images = `<div class="iw_photos">`;
              for(var i=0; i<all_photo.length; i++){
                var photo = all_photo[i].url_s; 
                images += `<img class="grid-item" style="width:100px;margin:3px;border:1px solid #ccc;" src="${photo}">`;
              }
              images += `</div>`;
              infowindow.setContent(self.htmlContent + self.htmlContentFoursquare + images);
              
              // var items = [];
              // $.each( data, function( key, val ) {
              //   items.push( "<li id='" + key + "'>" + val + "</li>" );
              // });
            });

            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function() {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(51.4980479, -0.0105351),
            zoom: 15,
            styles: styles
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].title;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work
    this.myLocationsFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'Oops. Google Maps did not load. Please refresh the page and try again!'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}