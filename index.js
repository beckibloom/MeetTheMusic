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

function watchLocations() {
    // Listen for user to click a location option (event delegation) and get the location ID from user selection
    console.log('The wachLocations function ran.');

}

function renderDates() {
    // Render the dates the user has submitted in the browser heading
    console.log('The renderDates function ran.');

}

function renderLocations() {
    // Use data from Songkick to render a list of location options for user to select
    console.log('The renderLocations function ran.');

}

function getLocations(query, dates) {
    // Use Songkick API to fetch location options
    console.log(`The getLocations function ran with query = ${query} and dates = ${dates}`);

}

function watchForm() {
    // Listen for user to input location and dates and click submit
    console.log('The watchForm function ran.');
    $('.location-submit').click(function() {
        event.preventDefault();
        let query = $('.location-input').val();
        // Creating the variable 'dates' as an array with two items for min_date and max_date
        // Songkick date format must be YYYY-MM-DD
        let date1 = `${$('.year1').val()}-${$('#month1').val()}-${$('.day1').val()}`;
        let date2 = `${$('.year2').val()}-${$('#month2').val()}-${$('.day2').val()}`;
        let dates = [date1,date2];
        //Run the getLocations function to get locations from Songkick with the form information
        getLocations(query, dates);
    });
};

watchForm();