'use strict';

function getTopTracks() {
    // Use Spotify API to get top tracks from selected artist for listening in web player
    // RESEARCH WEB PLAYER IMPLEMENTATION
    console.log('The getTopTracks function ran.');

}

function watchArtists() {
    // Listen for user to click an artist option then run getTopTracks
    console.log('The watchArtists function ran.');

}

function getMoreEvents() {
    // Listen for the user to click the "see more events" button then run getEvents/renderEventList again for more items
    // NOT A PRIORITY
    console.log('The getMoreEvents function ran.');

}

function renderEventList() {
    // Use the data from the getEvents function to render the Event list in the browser
    console.log('The renderEventList function ran.');

}

function getEvents() {
    // Use the location ID from user location selection to fetch event data for their indicated dates
    console.log('The getEvents function ran.');

}

function getItemIdFromElement(item) {
    return $(item)
        .closest('button')
        .data('item-id');
}

function watchLocations() {
    // Listen for user to click a location option (event delegation) and get the location ID from user selection
    console.log('The wachLocations function ran.');
    $('#locations').on('click', `.location-result`, event => {
        event.preventDefault();
        const id = getItemIdFromElement(event.currentTarget);
        console.log(`A location option with id ${id} was selected.`)
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

    for (let i = 0; i < responseJson.resultsPage.results.location.length; i++){
        $('#locations').append(
            `<button class="location-result" data-item-id="${responseJson.resultsPage.results.location[i].metroArea.id}">
            ${responseJson.resultsPage.results.location[i].city.displayName}, 
            ${responseJson.resultsPage.results.location[i].city.state.displayName}, 
            ${responseJson.resultsPage.results.location[i].city.country.displayName}
            </button>`)};
    watchLocations();
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
        getLocations(location, dates);
    });
};

watchForm();