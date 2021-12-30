//Initial data module

exports.filesData = [
    { fileName: "templateA.html", folder: "templates" },
    { fileName: "templateB.html", folder: "templates" },
    { fileName: "templateC.html", folder: "templates" },
    { fileName: "RedNotice.png", folder: "images" },
    { fileName: "SpaceJam.png", folder: "images" },
    { fileName: "TheKarateKid.png", folder: "images" },
    { fileName: "TheMask.png", folder: "images" },
    { fileName: "Twilight.png", folder: "images" }
];

exports.screensData = [
    { screenNumber: 1 },
    { screenNumber: 2 },
    { screenNumber: 3 }
];

exports.messagesData = [{
    messageName: "message1",
    screens: [1, 2, 3],
    template: "templateA.html",
    title: "Red Notice",
    textFields: [
        "An FBI profiler pursuing the world's most wanted art thief becomes his reluctant partner in crime to catch an elusive crook who's always one step ahead.",
        "Starring:Dwayne Johnson, Ryan Reynolds, Gal Gadot",
        "Dwayne Johnson, Ryan Reynolds and Gal Gadot chase each other around the globe in this fun and funny action adventure."
    ],
    images: ["RedNotice.png"],
    visableFor: 5,
    visableInTimeFrames: [
        {
            weekDays: ["Monday", "Wednesday"],
            dateRange: { from: "2021/01/01", to: "2021/12/31" },
            dayTimeRange: { from: "06:00", to: "12:00" }
        }
    ]
},
{
    messageName: "message2",
    screens: [3],
    template: "templateA.html",
    title: "Twilight",
    textFields: [
        "When Bella Swan moves in with her father, she starts school and meets Edward, a mysterious classmate who reveals himself to be a 108-year-old vampire.",
        "Starring:Kristen Stewart, Robert Pattinson, Billy Burke"
    ],
    images: ["Twilight.png"],
    visableFor: 5,
    visableInTimeFrames: [
        {
            weekDays: ["Tuesday", "Wednesday"],
            dateRange: {
                from: "March 1, 2021", to: "April 30, 2021"
            },
            dayTimeRange: { from: "10:00", to: "16:00" }
        }
    ]
},
{
    messageName: "message3",
    screens: [1, 2],
    template: "templateB.html",
    title: "The Mask",
    textFields: [
        "A hapless bank teller discovers an ancient mask that turns him into a zany prankster who acts on his deepest desires.",
        "Starring:Jim Carrey, Cameron Diaz, Peter Riegert",
        "Jim Carrey's wild antics made this slapstick comedy one of the 10 highest-grossing movies of 1994."
    ],
    images: ["TheMask.png"],
    visableFor: 5,
    visableInTimeFrames: [
        {
            weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            dateRange: { from: "May 1, 2021", to: "June 15, 2021" },
            dayTimeRange: { from: "08:00", to: "22:00" }
        }
    ]
},
{
    messageName: "message4",
    screens: [1],
    template: "templateC.html",
    title: "Space Jam",
    textFields: [
        "Bugs Bunny and his pals coax Michael Jordan out of retirement to play in a basketball game against a team of monstrous aliens to win their freedom.",
        "Starring:Michael Jordan, Bugs Bunny, Wayne Knight",
        "Michael Jordan proves his star power off the court with this one -- the film opened at No. 1 at the box office."
    ],
    images: ["SpaceJam.png"],
    visableFor: 5,
    visableInTimeFrames: [
        {
            weekDays: ["Tuesday", "Wednesday"],
            dateRange: { from: "March 29, 2021", to: "April 15, 2021" },
            dayTimeRange: { from: "15:00", to: "19:00" }
        }
    ]
},
{
    messageName: "message5",
    screens: [2],
    template: "templateC.html",
    title: "The Karate Kid",
    textFields: [
        "In China, Dre learns to defend himself against a bully under the guidance of an unassuming kung fu master in this remake of the 1984 classic.",
        "Starring:Jaden Smith, Jackie Chan, Taraji P. Henson",
        "Jackie Chan teaches a young Jaden Smith the art of kung fu in this installment of the martial arts film series."
    ],
    images: ["TheKarateKid.png"],
    visableFor: 5,
    visableInTimeFrames: [
        {
            weekDays: ["Monday", "Tuesday", "Wednesday"],
            dateRange: { from: "April 1, 2021", to: "April 30, 2021" },
            dayTimeRange: { from: "01:00", to: "23:00" }
        }
    ]
}
];


