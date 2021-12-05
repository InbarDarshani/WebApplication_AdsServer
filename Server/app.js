//Server setup
const express = require("express");                                                 //Node server using express
var app = express();
const port = 8080;
//Paths setup
const path = require("path");
const staticSourcesFolder = path.join(process.cwd(), "Server", "static");           //absolute path for static folder
const dataFolder = path.join(process.cwd(), "Server", "data");                      //absolute path for data folder

var db =  [
    {
        "messageName": "message1",
		"screens": [1,2,3],
        "template": "./templates/templateA.html",
        "title": "Red Notice",
        "textFields": [
            "An FBI profiler pursuing the world's most wanted art thief becomes his reluctant partner in crime to catch an elusive crook who's always one step ahead.",
            "Starring:Dwayne Johnson, Ryan Reynolds, Gal Gadot",
            "Dwayne Johnson, Ryan Reynolds and Gal Gadot chase each other around the globe in this fun and funny action adventure."
        ],
        "images": [
            "./images/RedNotice.png"
        ],
        "visableFor": 7,
        "visableInTimeFrames": [
            {
                "weekDays": [
                    "Monday",
                    "Wednesday"
                ],
                "dateRange": {
                    "from": "January 1, 2021",
                    "to": "December 31, 2021"
                },
                "dayTimeRange": {
                    "from": "06:00",
                    "to": "12:00"
                }
            }
        ]
    },
    {
        "messageName": "message2",
		"screens": [3],
        "template": "./templates/templateA.html",
        "title": "Twilight",
        "textFields": [
            "When Bella Swan moves in with her father, she starts school and meets Edward, a mysterious classmate who reveals himself to be a 108-year-old vampire.",
            "Starring:Kristen Stewart, Robert Pattinson, Billy Burke"
        ],
        "images": [
            "./images/Twilight.png"
        ],
        "visableFor": 18,
        "visableInTimeFrames": [
            {
                "weekDays": [
                    "Tuesday",
                    "Wednesday"
                ],
                "dateRange": {
                    "from": "March 1, 2021",
                    "to": "April 30, 2021"
                },
                "dayTimeRange": {
                    "from": "10:00",
                    "to": "16:00"
                }
            }
        ]
    },
    {
        "messageName": "message3",
		"screens": [1,2],
        "template": "./templates/templateB.html",
        "title": "The Mask",
        "textFields": [
            "A hapless bank teller discovers an ancient mask that turns him into a zany prankster who acts on his deepest desires.",
            "Starring:Jim Carrey, Cameron Diaz, Peter Riegert",
            "Jim Carrey's wild antics made this slapstick comedy one of the 10 highest-grossing movies of 1994."
        ],
        "images": [
			"./images/TheMask.png"
		],
        "visableFor": 15,
        "visableInTimeFrames": [
            {
                "weekDays": [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ],
                "dateRange": {
                    "from": "May 1, 2021",
                    "to": "June 15, 2021"
                },
                "dayTimeRange": {
                    "from": "08:00",
                    "to": "22:00"
                }
            }
        ]
    },
    {
        "messageName": "message4",
		"screens": [1],
        "template": "./templates/templateC.html",
        "title": "Space Jam",
        "textFields": [
            "Bugs Bunny and his pals coax Michael Jordan out of retirement to play in a basketball game against a team of monstrous aliens to win their freedom.",
            "Starring:Michael Jordan, Bugs Bunny, Wayne Knight",
            "Michael Jordan proves his star power off the court with this one -- the film opened at No. 1 at the box office."
        ],
        "images": ["./images/SpaceJam.png"],
        "visableFor": 12,
        "visableInTimeFrames": [
            {
                "weekDays": [
                    "Tuesday",
                    "Wednesday"
                ],
                "dateRange": {
                    "from": "March 29, 2021",
                    "to": "April 15, 2021"
                },
                "dayTimeRange": {
                    "from": "15:00",
                    "to": "19:00"
                }
            }
        ]
    },
    {
        "messageName": "message5",
		"screens": [2],
        "template": "./templates/templateC.html",
        "title": "The Karate Kid",
        "textFields": [
            "In China, Dre learns to defend himself against a bully under the guidance of an unassuming kung fu master in this remake of the 1984 classic.",
            "Starring:Jaden Smith, Jackie Chan, Taraji P. Henson",
            "Jackie Chan teaches a young Jaden Smith the art of kung fu in this installment of the martial arts film series."
        ],
        "images": ["./images/TheKarateKid.png"],
        "visableFor": 10,
        "visableInTimeFrames": [
            {
                "weekDays": [
                    "Monday",
                    "Tuesday",
                    "Wednesday"
                ],
                "dateRange": {
                    "from": "April 1, 2021",
                    "to": "April 30, 2021"
                },
                "dayTimeRange": {
                    "from": "01:00",
                    "to": "23:00"
                }
            }
        ]
    }
]

//___________________________________________________________________________________________

//Functions to handle the screen's main page
//Set static files - js and css
app.use("/:screen",express.static(staticSourcesFolder));
//Send main page
app.get("/:screen", (request, response) => {
    response.sendFile(path.join(staticSourcesFolder, "index.html"));
});

//Function to handle screen's messages fetch request - json
app.get("/:screen/data.json", async (request, response) => {
    var data = db.filter(o => o.screens.includes(parseInt(request.params.screen)));
    response.send(data);
});

//Function to handle data files requests - templates and images 
app.get("/:screen/:folder/:srcFile", (request, response) => {
    response.sendFile(path.join(dataFolder,request.params.folder, request.params.srcFile));
});
   
//Main
app.listen(port);


