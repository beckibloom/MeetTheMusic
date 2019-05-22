'use strict';

function playNapster(responseJson, apikeyN) {
    // Napster JS

    const topTracksLink = responseJson.search.data.artists[0].links.topTracks.href

    const tracksTemplateSource = document.getElementById('tracks-template').innerHTML;
    const tracksTemplate = Handlebars.compile(tracksTemplateSource);

    const $tracks = $('#tracks-container');

    const getTopTracks = $.get(`${topTracksLink}?apikey=${apikeyN}`);

    getTopTracks
    .then((response) => {
        $tracks.html(tracksTemplate(response));
    });
}

function getArtistObject(artist) {
    console.log('The getTopTracks function ran.');
    // 1 - Do a search query with Napster for the artist
    const apikeyN = 'MTE5OWJjOWQtOWQ5My00MmRjLWIyNmQtODkzMWY0ZjQxOTVl';
    const params = {
        apikey: apikeyN,
        query: artist,
        type: 'artist',
    }
    const queryString = formatQueryParams(params);
    const searchURL = 'https://api.napster.com/v2.2/search?' + queryString;
    console.log(`fetching data from URL ${searchURL}`);

    fetch(searchURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => playNapster(responseJson, apikeyN))
        .catch(err => {$('.js-napster-error').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`)})
}

function watchArtists() {
    // Listen for user to click an artist option then run getTopTracks
    console.log('The watchArtists function ran.');
    $('#events').on('click', `.listen`, event => {
        event.preventDefault();
        const artist = event.currentTarget.innerText;
        $('.play-artist').text(artist);
        getArtistObject(artist);
        })
}

function getMoreEvents() {
    // Listen for the user to click the "see more events" button then run getEvents/renderEventList again for more items
    // NOT A PRIORITY
    console.log('The getMoreEvents function ran.');

}

function renderEventList(responseJson, locationDisplayName) {
    //Update the location displayed at the top of this section
    $('.location-submitted').text(`${locationDisplayName}`);

    //Use the data from the getEvents function to render the Event list in the browser
    console.log('The renderEventList function ran with response');
    console.log(responseJson);
    for (let i = 0; i < responseJson.resultsPage.results.event.length; i++){
        let concertName = `${responseJson.resultsPage.results.event[i].displayName}`;
        let venue = `${responseJson.resultsPage.results.event[i].venue.displayName}`;
        let date = `${responseJson.resultsPage.results.event[i].start.date}`;
        let eventLink = `${responseJson.resultsPage.results.event[i].uri}`;
         $('#events').append(
             `<li class="artist-result">
                <p class="artist-name">${concertName}</p>
                <p class="event-detail">${date} at ${venue}</p>
                <p class="event-link"><a href="${eventLink}" target="_blank">More info & buy tickets</a></p>`)
        for (let j = 0; j < responseJson.resultsPage.results.event[i].performance.length; j++){
            let artist = `${responseJson.resultsPage.results.event[i].performance[j].artist.displayName}`;
            $('#events').append(
                `<li class="artist-result">Listen to:
                
                <button class="listen>${artist}</button>
                
                </li>`
            );
    }
    };
    $('#events').append(
        `<li class="artist-result request-more">
            <button class="see-more">See more events</button>
        </li>`
    )
    $('.artist-response').toggleClass('hidden');
    watchArtists();
}

function getEvents(id, locationDisplayName, dates) {
    // Use the location ID from user location selection to fetch event data for their indicated dates
    console.log(`The getEvents function ran with location ID ${id}.`);
    const date_min = dates[0];
    const date_max = dates[1];
    let params = {
        apikey: `c7qHSQfxsiGbcNRd`,
        location: `sk:${id}`,
        min_date: `${date_min}`,
        max_date: `${date_max}`,
        type: 'Concert',
        per_page: 10
    };
    const queryString = formatQueryParams(params);
    const url = `https://api.songkick.com/api/3.0/events.json?` + queryString;
    console.log(`The getEvents function is fetching data from URL ${url}`);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => renderEventList(responseJson, locationDisplayName))
        .catch(err => {$('.js-event-error').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`);
    });
}

function getItemIdFromElement(item) {
    return $(item)
        .closest('button')
        .data('item-id');
}

function watchLocations(dates) {
    // Listen for user to click a location option (event delegation) and get the location ID from user selection
    console.log('The wachLocations function ran.');
    $('#locations').on('click', `.location-result`, event => {
        event.preventDefault();
        const id = getItemIdFromElement(event.currentTarget);
        console.log(`A location option with id ${id} was selected.`)
        let locationDisplayName = event.currentTarget.innerText;
        console.log(`locationDisplayName is ${locationDisplayName}`);
        $('.location-select').toggleClass('hidden');
        getEvents(id, locationDisplayName, dates);
    })
}

function renderDates(dates) {
    // Render the dates the user has submitted in the browser heading
    console.log(`The renderDates function ran with dates = ${dates}.`);
    const min_date = dates[0];
    const max_date = dates[1];
    $('.date-submitted').text(`${min_date} to ${max_date}`);
}

function renderLocations(responseJson, location, dates) {
    renderDates(dates);

    // Use data from Songkick to render a list of location options for user to select
    console.log(`The renderLocations function ran with location ${location}, dates ${dates}, and responseJson was:`);
    console.log(responseJson)

    for (let i = 0; i < responseJson.resultsPage.results.location.length; i++) {
        const state = responseJson.resultsPage.results.location[i].city.state ? responseJson.resultsPage.results.location[i].city.state.displayName + ',' : ''
        $('#locations').append(
            `<button class="location-result" data-item-id="${responseJson.resultsPage.results.location[i].metroArea.id}">
            ${responseJson.resultsPage.results.location[i].city.displayName}, 
            ${state} 
            ${responseJson.resultsPage.results.location[i].city.country.displayName}
            </button>`)};
    watchLocations(dates);
    $('.location-select').toggleClass('hidden');

}

function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getLocations(location, dates) {
    // Use Songkick API to fetch location options
    console.log(`The getLocations function ran with location = ${location} and dates = ${dates}`);

    const apikeySK = 'c7qHSQfxsiGbcNRd';
    const params = {
        apikey: apikeySK,
        query: location,
        page:1,
        per_page:5,
    }
    const queryString = formatQueryParams(params);
    const url = 'https://api.songkick.com/api/3.0/search/locations.json?' + queryString;
    console.log(`fetching data from URL ${url}`);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => renderLocations(responseJson, location, dates))
        .catch(err => {
            $('.js-error-message').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`);
        });
}

function watchForm() {
    // Listen for user to input location and dates and click submit
    console.log('The watchForm function ran.');
    $('.location-submit').click(function() {
        event.preventDefault();
        let location = $('.location-input').val();
        // Creating the variable 'dates' as an array with two items for min_date and max_date
        // Songkick date format must be YYYY-MM-DD
        let date1 = `${$('.year1').val()}-${$('#month1').val()}-${$('.day1').val()}`;
        let date2 = `${$('.year2').val()}-${$('#month2').val()}-${$('.day2').val()}`;
        let dates = [date1,date2];
        //Run the getLocations function to get locations from Songkick with the form information
        $('.landing-view').toggleClass('hidden');
        getLocations(location, dates);
    });
};

watchForm();