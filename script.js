

var GoogleAuth; // shortcut for API

/**
 * Header composition and display
 */
loopHeader();

function loopHeader() {
    const headInterval = 1 * 60000; // Header refersh interval in minutes
    dispHeader();
    headerIntervalID = setInterval(dispHeader, headInterval);
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
        var temp = "" + ((hour > 12) ? hour - 12 : hour);

        if (hour == 0) { temp = "12"; }
        if (second > 30) { minute += 1; }
        temp += ((minute < 10) ? ":0" : ":") + minute;
        // temp += ((hour >= 12) ? " pm" : " am");
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


/**
 * Messages composition and display
 */


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// provisoire button
const btn = document.querySelector('button');
btn.onclick = function () {
    var myMain = document.getElementsByTagName("main");
    if (btn.textContent == "A") {
        var asd = document.createElement("aside");
        var photo = document.createElement("img");
        var capt = document.createElement("figcaption");
        var fileId = "1gVy1y_SydXf0qYh4hPDwcdEc4PzS23ke";
        // var imgSrc = "https://drive.google.com/uc?export=download&id=" + fileId;
        var imgSrc = "https://drive.google.com/uc?id=" + fileId;  // otherwise try with uc?export=download&id=
        photo.setAttribute("src", imgSrc);
        // id=16aVBpQN3NgH3-Cyo6WGt0zxcGF5WHd1o c'est l'id de la photo avec véro mais volumineuse

        photo.setAttribute("width", "100%");
        capt.innerHTML = "Mario et Véronique";
        asd.id = "myAside";
        asd.appendChild(photo);
        asd.appendChild(capt);

        myMain[0].appendChild(asd);
        btn.textContent = "B";
    } else {
        if ((asd = document.getElementById("myAside"))) {
            asd.parentNode.removeChild(asd);
            btn.textContent = "A";
        }
    }
}
// end provisoire button
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function handleClientLoad() {
    // Loads the API's client and auth2 modules
    // then calls the initClient function
    gapi.load('client:auth2', initClient);
}
function initClient() {
    //Initializes the API client library (crendentials from CoolDashBord developper Console)
    //then sets up sign-in state listeners
    gapi.client.init({
        apiKey: 'AIzaSyBDcPRIKUneAEh1OzqO8i0TfU_fzOOMbzM',
        clientId: '852314254764-osbdrq5dg727tm16vh9n1ahcsr4h9ieo.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.events.readonly",
        // uxMode: 'redirect',
        // redirectUri: "https://cool.el-khoury.ch"
        // redirectUri: "https://mky-gh.github.io/CoolDashBoard"
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        dispAfterSignIn(GoogleAuth.isSignedIn.get()); // check signin and start display

    }, function (error) {
        alert(JSON.stringify(error, null, 2));
    });
}
function dispAfterSignIn(isSignedIn) {
    //     // insure the first signin, then only display the list of messages
    if (!isSignedIn) {
        GoogleAuth.signIn().then(loopMessages);
    } else {
        loopMessages();
    }
}
function loopMessages() {
    const fetchInterval = 5 * 60000; // Messages refersh interval, convert min into ms
    dispMessages();
    const createClock = setInterval(dispMessages, fetchInterval);
}
function dispMessages() {

    // variable required to get the active events
    var tMin = new Date();
    var tMax = new Date();
    tMax.setMinutes(tMax.getMinutes() + 1); // timeMax has to be > timeMin for the GAPI

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'maxResults': 10,
        'orderBy': 'startTime',
        'showDeleted': false,
        'singleEvents': true,
        'timeMin': tMin.toISOString(), // mky: Date has to be an object with new
        'timeMax': tMax.toISOString(),
    }).then(function (response) {
        var events = response.result.items;  // MKy: The array of Event-objects
        document.getElementById("messages").innerHTML = "";

        events.reverse();  // because orderBy endtime doesn't exist.

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var para = document.createElement("P");
                para.innerHTML = events[i].summary;
                console.log(events[i]);  // provisional for test purposes
                document.getElementById("messages").appendChild(para);
            }
        }
    });
}

// STATUS : 
// OK changing the page layout ot display drive image, but using the button (see highlighted button section above)

// NEXT :
// replace button pressing with checking for the presence of attachment AND of mimeType "image..."

// Attention à mettre à jour les token
// push pour les images (sinon elles seront downloadés bcp)

// voir comment programmer ouverture en full screen
// désactiver screen saver (mais penser à protéger l'écran)
