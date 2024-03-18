import { firebaseConfig } from '../backend/public/data.js';
import { displayProfilePictureForNav } from '../pfpDisplay.js';
import { options } from '../backend/public/data.js';

// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
let user_ID;

// Check for if the user is logged in or out:
auth.onAuthStateChanged(user =>{
    if (user == null) {
        window.location.href = "../index.html";
    } else {
        console.log('user logged in');
        user_ID = user.uid;
        copyFavoriteExercisesToCache(user_ID);
        // console.log(userFavoriteExercisesCache);

        // Get the user's profile picture URL from Firestore
        const userDocRef = usersCollection.doc(user_ID);
        userDocRef.get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const profilePictureUrl = userData.profilePicture;
                displayProfilePictureForNav(profilePictureUrl);
            } else {
                // User doesn't have a profile picture yet
                displayProfilePictureForNav(null);
            }
        }).catch(error => {
            console.error('Error getting user data:', error);
        });

    }
});

const usersCollection = firestore.collection('users');

// Initialize an empty local cache for the user's favorite exercises
let userFavoriteExercisesCache = {};

// Function to copy the user's favorite exercises into the cache
function copyFavoriteExercisesToCache(userId) {
    usersCollection.doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            userFavoriteExercisesCache[userId] = userData.favoriteExercises || {};
        }
    }).catch((error) => {
        console.error("Error copying favorite exercises to cache:", error);
    });
}


let data;

fetch('https://exercisedb.p.rapidapi.com/exercises', options)
    .then(response => response.json())
    .then(function(response) {
        data = response;
        // console.log(response);
    });



const workoutsContainer = document.getElementById('workouts-container');
function displayExercises(muscle) {
    workoutsContainer.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        if (muscle == data[i].target) {
    
            // Setup
            let colDiv = document.createElement("div");
            colDiv.className = "col-md-6 col-lg-3";
            let card = document.createElement("div");
            card.className = "card";
            let cardImageContainer = document.createElement("div");
            cardImageContainer.className = "card-image";
            cardImageContainer.style.position = "relative";

            // Favorite Icon
            const exerciseId = data[i].id;
            let favoriteLink = document.createElement("a");
            favoriteLink.className = "btn-floating pink pulse";
            favoriteLink.style.position = "absolute";
            favoriteLink.style.top = "10px";
            favoriteLink.style.right = "10px";
            let favoriteIcon = document.createElement("i");
            // Check if the exercise ID is favorited by the user
            if (userFavoriteExercisesCache[user_ID][exerciseId] != undefined) favoriteIcon.className = "material-icons cyan-text";
            else favoriteIcon.className = "material-icons";

            favoriteIcon.textContent = "favorite";
            favoriteLink.appendChild(favoriteIcon);

            favoriteIcon.addEventListener('click', () => {
                
                // Reference to the user's document in Firestore
                const userDocRef = usersCollection.doc(user_ID);
            
                // Check if the heart icon has the "red-heart" class
                const isHearted = favoriteIcon.classList.contains('cyan-text');
            
                // Update the user's favoriteExercises dictionary with the exercise ID
                userDocRef.update({
                    [`favoriteExercises.${exerciseId}`]: isHearted ? firebase.firestore.FieldValue.delete() : exerciseId
                })
                .then(() => {
                    console.log(`${exerciseId} added to favorites.`);
                    
                    // Toggle the "red-heart" class to change the color
                    if (isHearted) {
                        favoriteIcon.classList.remove('cyan-text');
                    } else {
                        favoriteIcon.classList.add('cyan-text');
                    }
                })
                .catch((error) => {
                    console.error('Error adding/removing exercise from favorites:', error);
                });
            });

            // Trend Icon
            let trendingLink = document.createElement("a");
            trendingLink.style.position = "absolute";
            trendingLink.style.top = "10px";
            trendingLink.style.right = "60px";
            let trendingIcon = document.createElement("i");
            trendingIcon.className = "material-icons";
            if (Math.random() < 0.2) {
                trendingLink.className = "btn-floating blue pulse";
                trendingIcon.textContent = "trending_up";
            } else if (Math.random() < 0.8) {
                trendingLink.className = "btn-floating yellow darken-2 pulse";
                trendingIcon.textContent = "trending_flat";
            } else {
                trendingLink.className = "btn-floating red darken-2 pulse";
                trendingIcon.textContent = "trending_down";
            }
            
            trendingLink.appendChild(trendingIcon);

            //  Image
            let exerciseImage = document.createElement("img");
            exerciseImage.className = 'border-bottom border-black';
            exerciseImage.src = data[i].gifUrl;

            // Add to Container
            cardImageContainer.appendChild(favoriteLink);
            cardImageContainer.appendChild(trendingLink);
            cardImageContainer.appendChild(exerciseImage);

            // Content
            let cardContent = document.createElement("div");
            cardContent.className = "card-content";

            // Name
            let exerciseName = document.createElement("span");
            exerciseName.className = "card-title";
            exerciseName.innerHTML = `<strong>${data[i].name.toUpperCase()}</strong>`;

            // Muscle
            let muscleWorked = document.createElement("li");
            muscleWorked.textContent = "Muscle Worked: " + data[i].target;

            // Equipment
            let equipmentUsed = document.createElement("li");
            equipmentUsed.textContent = "Equipment Needed/Used: " + data[i].equipment;

            // Body part
            let bodyPart = document.createElement("li");
            bodyPart.textContent = "BodyPart: " + data[i].bodyPart;

            // Add to container
            cardContent.appendChild(exerciseName);
            cardContent.appendChild(muscleWorked);
            cardContent.appendChild(equipmentUsed);
            cardContent.appendChild(bodyPart);

            // Insctructions
            let cardAction = document.createElement("div");
            cardAction.className = "card-action";
            let instruction = document.createElement("a");
            instruction.textContent = "Follow The Motion In The Image Below To Perform This Exercise With Proper Form";
            cardAction.appendChild(instruction);


            card.appendChild(cardImageContainer);
            card.appendChild(cardContent);
            card.appendChild(cardAction);

            colDiv.appendChild(card);
            workoutsContainer.appendChild(colDiv);
        }
    }
}

// Filter Buttons
const chestBtn = document.getElementById('chest');
const bisBtn = document.getElementById('bis');
const trisBtn = document.getElementById('tris');
const deltsBtn = document.getElementById('delts');
const latsBtn = document.getElementById('lats');
const absBtn = document.getElementById('abs');
const quadsBtn = document.getElementById('quads');
const hamsBtn = document.getElementById('hams');
const glutesBtn = document.getElementById('glutes');
const calvesBtn = document.getElementById('calves');
const upperBackBtn = document.getElementById('upper-back');
const forearmsBtn = document.getElementById('forearms');

const btns = [
    [chestBtn, 'pectorals'],
    [bisBtn, 'biceps'],
    [trisBtn, 'triceps'],
    [deltsBtn, 'delts'],
    [latsBtn, 'lats'],
    [absBtn, 'abs'],
    [quadsBtn, 'quads'],
    [hamsBtn, 'hamstrings'],
    [glutesBtn, 'glutes'],
    [calvesBtn, 'calves'],
    [upperBackBtn, 'upper back'],
    [forearmsBtn, 'forearms']
];

// Add displaying functionality to each button
for (let i = 0; i < btns.length; i++) {
    btns[i][0].addEventListener('click', () => {
        displayExercises(btns[i][1]);
    });
}

function displayExercisesByInput(inputValue) {
    workoutsContainer.innerHTML = "";

    if (inputValue == '') return

    for (let i = 0; i < data.length; i++) {
        if (data[i].name.includes(inputValue)) {
            // Setup
            let colDiv = document.createElement("div");
            colDiv.className = "col-md-6 col-lg-3";
            let card = document.createElement("div");
            card.className = "card";
            let cardImageContainer = document.createElement("div");
            cardImageContainer.className = "card-image";
            cardImageContainer.style.position = "relative";

            // Favorite Icon
            const exerciseId = data[i].id;
            let favoriteLink = document.createElement("a");
            favoriteLink.className = "btn-floating pink pulse";
            favoriteLink.style.position = "absolute";
            favoriteLink.style.top = "10px";
            favoriteLink.style.right = "10px";
            let favoriteIcon = document.createElement("i");
            // Check if the exercise ID is favorited by the user
            if (userFavoriteExercisesCache[user_ID][exerciseId] != undefined) favoriteIcon.className = "material-icons cyan-text";
            else favoriteIcon.className = "material-icons";

            favoriteIcon.textContent = "favorite";
            favoriteLink.appendChild(favoriteIcon);

            favoriteIcon.addEventListener('click', () => {
                
                // Reference to the user's document in Firestore
                const userDocRef = usersCollection.doc(user_ID);
            
                // Check if the heart icon has the "red-heart" class
                const isHearted = favoriteIcon.classList.contains('cyan-text');
            
                // Update the user's favoriteExercises dictionary with the exercise ID
                userDocRef.update({
                    [`favoriteExercises.${exerciseId}`]: isHearted ? firebase.firestore.FieldValue.delete() : exerciseId
                })
                .then(() => {
                    console.log(`${exerciseId} added to favorites.`);
                    
                    // Toggle the "red-heart" class to change the color
                    if (isHearted) {
                        favoriteIcon.classList.remove('cyan-text');
                    } else {
                        favoriteIcon.classList.add('cyan-text');
                    }
                })
                .catch((error) => {
                    console.error('Error adding/removing exercise from favorites:', error);
                });
            });

            // Trend Icon
            let trendingLink = document.createElement("a");
            trendingLink.style.position = "absolute";
            trendingLink.style.top = "10px";
            trendingLink.style.right = "60px";
            let trendingIcon = document.createElement("i");
            trendingIcon.className = "material-icons";
            if (Math.random() < 0.2) {
                trendingLink.className = "btn-floating blue pulse";
                trendingIcon.textContent = "trending_up";
            } else if (Math.random() < 0.8) {
                trendingLink.className = "btn-floating yellow darken-2 pulse";
                trendingIcon.textContent = "trending_flat";
            } else {
                trendingLink.className = "btn-floating red darken-2 pulse";
                trendingIcon.textContent = "trending_down";
            }
            trendingLink.appendChild(trendingIcon);

            //  Image
            let exerciseImage = document.createElement("img");
            exerciseImage.className = 'border-bottom border-black';
            exerciseImage.src = data[i].gifUrl;

            // Add to Container
            cardImageContainer.appendChild(favoriteLink);
            cardImageContainer.appendChild(trendingLink);
            cardImageContainer.appendChild(exerciseImage);

            // Content
            let cardContent = document.createElement("div");
            cardContent.className = "card-content";

            // Name
            let exerciseName = document.createElement("span");
            exerciseName.className = "card-title";
            exerciseName.innerHTML = `<strong>${data[i].name}</strong>`;

            // Muscle
            let muscleWorked = document.createElement("li");
            muscleWorked.textContent = "Muscle Worked: " + data[i].target;

            // Equipment
            let equipmentUsed = document.createElement("li");
            equipmentUsed.textContent = "Equipment Needed/Used: " + data[i].equipment;

            // Body part
            let bodyPart = document.createElement("li");
            bodyPart.textContent = "BodyPart: " + data[i].bodyPart;

            // Add to container
            cardContent.appendChild(exerciseName);
            cardContent.appendChild(muscleWorked);
            cardContent.appendChild(equipmentUsed);
            cardContent.appendChild(bodyPart);

            // Insctructions
            let cardAction = document.createElement("div");
            cardAction.className = "card-action";
            let instruction = document.createElement("a");
            instruction.textContent = "Follow The Motion In The Image Below To Perform This Exercise With Proper Form";
            cardAction.appendChild(instruction);


            card.appendChild(cardImageContainer);
            card.appendChild(cardContent);
            card.appendChild(cardAction);

            colDiv.appendChild(card);
            workoutsContainer.appendChild(colDiv);
        }
    }
}

const inputField = document.getElementById('inputField');
inputField.addEventListener('input', (event) => {
    event.preventDefault();
    const inputValue = event.target.value;
    displayExercisesByInput(inputValue);
});