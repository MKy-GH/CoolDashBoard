/**
 * Header composition and display
 */
function initHeader() {
    dispHeader();
    const headInterval = 0.3 /*min*/ * 60000; // Header refersh interval in ms
    var headerIntervalID = setInterval(dispHeader, headInterval);
}
function dispHeader() {
    // handle the Header part of the page

    // var dateFormat = "de-CH";  // for tests use navigator.language for production
    var dateFormat = navigator.language;
    var now = new Date();
    var day = now.toLocaleDateString(dateFormat, { weekday: "long" });

    document.getElementById("day").innerHTML = day;
    document.getElementById("date").innerHTML = defdate(now);
    document.getElementById("time").innerHTML = defTime(now);
    document.getElementById("moment").innerHTML = defMoment(now);

    function defdate(date) {
        var options = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString(dateFormat, options);
    }
    function defTime(date) {
        // format display of time
        var hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
        var temp = "" + ((hour > 12) ? hour - 12 : hour); // force display in 12h (and not 24h)

        if (hour == 0) { temp = "12"; }
        temp += ((minute < 10) ? ":0" : ":") + minute;
        return temp;
    }
    function defMoment(date) {
        // day moment definition

        const momentDic = {
            //      0-6             6-12         12-13          13-18           18-24
            "fr": ["du matin", "avant-midi", "midi", "après-midi", "du soir"],
            "de": ["nachts", "vormittags", "mittags", "nachmittags", "abends"],
            "en": ["AM", "AM", "PM", "PM", "PM"]
        };
        const navLang = navigator.language.slice(0, 2);
        var lang = (navLang in momentDic) ? navLang : "en"; // en as default language

        var hour = date.getHours();
        if (hour < 6) { return momentDic[lang][0]; }
        else if (hour < 12) { return momentDic[lang][1]; }
        else if (hour < 13) { return momentDic[lang][2]; }
        else if (hour < 18) { return momentDic[lang][3]; }
        else { return momentDic[lang][4]; }
    }
}
/* ************************************************************************** */

/**
 * Messages composition and display
 */
function initMessage() {
    dispMessages();
    const messagesInterval = 2 /*min*/ * 60000; // Messages refersh interval in ms
    var messagesIntervalID = setInterval(dispMessages, messagesInterval);
}
function dispMessages() {

    // variable required to get the active events
    var tMin = new Date(); // now
    var tMax = new Date(); // now
    tMax.setMinutes(tMax.getMinutes() + 1); // timeMax has to be > timeMin for the GAPI

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'maxResults': 10,
        'orderBy': 'startTime',
        'showDeleted': false,
        'singleEvents': true,
        'timeMin': tMin.toISOString(), // Date has to be an object with new
        'timeMax': tMax.toISOString(),
    }).then(function (response) {
        /* if request is successful */
        // console.log(response);

        var noImage = 1;
        var events = response.result.items;  // The array of Event-objects
        events.reverse();  // because orderBy endtime doesn't exist.

        // initialisation of messages and aside
        document.getElementById("messages").innerHTML = "";
        if ((asd = document.getElementById("myAside"))) {  //not good practice the "=", but compact
            asd.parentNode.removeChild(asd);
        }
        // screening and handling events
        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                if (!events[i].attachments) {
                    var para = document.createElement("P");
                    para.innerHTML = events[i].summary;
                    document.getElementById("messages").appendChild(para);
                }
                else if (noImage) {
                    var attachType = events[i].attachments[0].mimeType;
                    if (attachType.indexOf("image") !== -1) {
                        // console.log(events[i]);
                        var myMain = document.getElementsByTagName("main");
                        var asd = document.createElement("aside");
                        var fig = document.createElement("figure");
                        var photo = document.createElement("img");
                        var capt = document.createElement("figcaption");
                        var fileId = events[i].attachments[0].fileId;
                        var imgSrc = "https://drive.google.com/uc?id=" + fileId;  // otherwise try with uc?export=download&id=

                        asd.id = "myAside";
                        photo.setAttribute("src", imgSrc);
                        capt.innerHTML = events[i].summary;
                        fig.appendChild(photo);
                        fig.appendChild(capt);
                        asd.appendChild(fig);
                        myMain[0].appendChild(asd);
                        noImage = 0;
                    }

                }
            }
        }
    }, function (reason){
        /* if request failed for whatever error, start a signin process that refreshes automaticall the API token */
        // console.log("Sylvain:");
        // console.error(reason);
        GoogleAuth.signIn();
    });
}

/* ************************************************************************** */

/**
 * Global init, to start the auto refresh elements
 */
function initBoard(){
    initHeader();
    initMessage();
}

/* ************************************************************************** */

/**
 * Google Authentification
 */
const apiKey = 'AIzaSyBDcPRIKUneAEh1OzqO8i0TfU_fzOOMbzM';
const clientId = '852314254764-osbdrq5dg727tm16vh9n1ahcsr4h9ieo.apps.googleusercontent.com';
const scope = "https://www.googleapis.com/auth/calendar.events.readonly";
const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

var GoogleAuth; // defined as global, to be able to initiate a signIn when errors are received in dispMessages function 

/* Function called once Google Auth module is loaded */
function initGoogle() {

    // Initialize the API client library
    gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: discoveryDocs,
        scope: scope,
        uxMode: 'redirect', 
        // redirectUri: "https://cool.el-khoury.ch" // commenté car empêche de servir le site sur localhost
    }).then(function (response) {
        /* if API client init succeeded */
        // console.log(response);

        // Get Authenticator object from Google
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Continue to Dashboard initialization
        if (GoogleAuth.isSignedIn.get()) {
            // Dashboard was just opened, but a previously authorized Google Account is already connected in this browser session.
            initBoard();
        } else {
            // Dashboard was just opened, but no Google Account was previously connected (or authorized) in this browser session.
            GoogleAuth.signIn().then(function(){
                initBoard();
            });
        }

    /* not needed anymore. The error handling added at the end of "dipsMessage" take care of the signout() problem too
        // Monitor user login status to prevent accidental sign out while Dashboard is open (parallel process).
        GoogleAuth.isSignedIn.listen(function () {
            if (!GoogleAuth.isSignedIn.get()) {
                // Force reconnect in case of accidental sign out.
                GoogleAuth.signIn();
            }
        });
        */
    },
    function (reason) {
        /* if Google Auth failed */
        console.error(reason);
    });
}

/* Function called automatically once Google API JavaScript file is downloaded */
function handleClientLoad() {
    // Loads auth2 modules then calls the initClient function
    gapi.load('client:auth2', initGoogle);
}

// STATUS :
// the branch Photo is ready with the possible display of picture/caption and ajusted font sizing.

// NEXT :
// - complement the user guide
// - explore a new push branch for the images
