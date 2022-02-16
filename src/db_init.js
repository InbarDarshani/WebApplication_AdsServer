//--- Initial data module ---

exports.screensData = [
    { screenNumber: 1, lastConnection: new Date() },
    { screenNumber: 2, lastConnection: new Date() },
    { screenNumber: 3, lastConnection: new Date() }
];

exports.usersData = [{
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    password: "Aa123456*"
}];


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
            weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            dateRange: { from: "2022-01-01", to: "2022-12-31" },
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
            dateRange: { from: "2022-01-01", to: "2022-04-30" },
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
            dateRange: { from: "2022-05-01", to: "2022-06-30" },
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
            dateRange: { from: "2022-04-01", to: "2022-04-30" },
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
            dateRange: { from: "2022-02-01", to: "2022-06-30" },
        }
    ]
}
];


