// Import code from other files
import { firebaseConfig } from '../backend/public/data.js';
import { displayProfilePictureForNav } from '../pfpDisplay.js';
import { displayLikedExercises } from '../Dashboard/exercise.js';

import { 
    displayLikedFoods, 
    createDoughnutChart, 
    saveMealData, 
    getMealsForCurrentDate, 
    updateDescriptions, 
    displayPreviousMeal, 
    saveWeightData
        } from '../Dashboard/diet.js';

import { 
    createLineChart, 
    createMultiLineChart, 
    getWeightDataLast30Days, 
    getSleepDataLast30Days,
    map
        } from '../Dashboard/overview.js';

import { createBarChart, saveSleepData } from '../Dashboard/sleep.js';
import { displayLoadingScreen, removeLoadingScreen } from '../Dashboard/load.js';

// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const usersCollection = firestore.collection('users');
let user_ID;

/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

// Check for if the user is logged in or out + RUN EVERYTHING:
auth.onAuthStateChanged(async user =>{
    if (user == null) {
        window.location.href = "../index.html";
    } else {
        console.log('user logged in');
        user_ID = user.uid;

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

        updateFoodGraphs();
        updateAllCharts();
        
        copyFavoriteExercisesToCache(user_ID);
        copyFavoriteFoodToCache(user_ID);
        // console.log(userFavoriteExercisesCache);
        // console.log(userFavoriteFoodCache);
        setTimeout( () => {
            displayLikedExercises(usersCollection, user_ID, userFavoriteExercisesCache, likedExercisesDisplayContainer);
            displayLikedFoods(usersCollection, user_ID, userFavoriteFoodCache, likedFoodDisplayContainer);
        }, 1000);
    }
});
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */



/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/*                                                       FITNESS                                                     */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */ 

// Initialize an empty local cache for the user's favorite exercises
let userFavoriteExercisesCache = {};
const likedExercisesDisplayContainer = document.getElementById('favorite-exercises');

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



/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/*                                                        DIET                                                       */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */ 



// Initialize an empty local cache for the user's favorite foods
let userFavoriteFoodCache = {};
const likedFoodDisplayContainer = document.getElementById('favorite-foods');

// Function to copy the user's favorite foods into the cache
function copyFavoriteFoodToCache(userId) {
    usersCollection.doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            userFavoriteFoodCache[userId] = userData.favoriteFoods || { IDS: {}, NAMES: [] };
        }
    }).catch((error) => {
        console.error("Error copying favorite foods to cache:", error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the modal
    const mealModal = document.getElementById('mealModal');
    M.Modal.init(mealModal);

    // Get references to everything
    const foodNameInput = document.getElementById('foodName');
    const caloriesInput = document.getElementById('calories');
    const proteinInput = document.getElementById('protein');
    const fatInput = document.getElementById('fat');
    const carbsInput = document.getElementById('carbs');
    const logMealBtn = document.getElementById('logMealBtn');

    const logMealCard = document.getElementById('log-meal-card');

    // Add a click event listener to the card
    logMealCard.addEventListener('click', function () {
        // Open the modal
        const instance = M.Modal.getInstance(mealModal);
        instance.open();
    });


    logMealBtn.addEventListener('click', function () {
        // Retrieve the entered values
        const foodName = foodNameInput.value.trim();
        const calories = parseFloat(caloriesInput.value);
        const protein = parseFloat(proteinInput.value);
        const fat = parseFloat(fatInput.value);
        const carbs = parseFloat(carbsInput.value);

        // Check if values are valid
        if (foodName === '' || isNaN(calories) || isNaN(protein) || isNaN(fat) || isNaN(carbs)) {
            alert('Please enter valid values for all fields.');
            return;
        }
        // console.log(foodName, calories, protein, fat, carbs);


        // Create a meal data object
        const mealData = {
            foodName,
            calories,
            protein,
            fat,
            carbs
            // timestamp: firebase.firestore.FieldValue.serverTimestamp() -> NOT SUPPORTED IN AN ARRAY IN FIRESTORE (IDK WHY)
        };

        // Save the meal data to Firestore
        saveMealData(user_ID, mealData, usersCollection);

        // Update Charts:
        setTimeout( () => {
            updateFoodGraphs();
        }, 1000);

        // Close the modal
        const instance = M.Modal.getInstance(mealModal);
        instance.close();

        // Clear the input fields
        foodNameInput.value = '';
        caloriesInput.value = '';
        proteinInput.value = '';
        fatInput.value = '';
        carbsInput.value = '';
    });
});

async function updateFoodGraphs() {
    try {
        // ensure that the meal data is fetched and processed before creating the doughnut charts. 
        const [foodNames, calVals, proteinVals, fatVals, carbVals] = await getMealsForCurrentDate(user_ID, usersCollection);
        // console.log([foodNames, calVals, proteinVals, fatVals, carbVals]);
        if (foodNames.length == 0) document.getElementById('No-Foods').innerHTML = 'No Foods Logged/Eaten Today';
        else document.getElementById('No-Foods').innerHTML = '';
        
        createDoughnutChart("calories-graph", foodNames, calVals);
        createDoughnutChart("protein-graph", foodNames, proteinVals);
        createDoughnutChart("fat-graph", foodNames, fatVals);
        createDoughnutChart("carbs-graph", foodNames, carbVals);
        updateDescriptions([calVals, proteinVals, fatVals, carbVals], ['calories-amt', 'protein-amt', 'fat-amt', 'carb-amt']);
        displayPreviousMeal('diet-previous-meals', [foodNames, calVals, proteinVals, fatVals, carbVals])
    } catch (error) {
        console.error('Error updating food graphs:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const weightModal = document.getElementById('weightModal');
    const weightInput = document.getElementById('weightInput');
    const weightSlider = document.getElementById('weightSlider');
    const weightValue = document.getElementById('weightValue');
    const logWeightBtn = document.getElementById('logWeightBtn');

    // Initialize the modal
    let modalInstance = M.Modal.init(weightModal, { dismissible: false });

    // Open the modal
    document.getElementById('log-weight-card').addEventListener('click', function() {
        weightInput.value = ''; 
        weightValue.innerText = '0';
        modalInstance.open();
    });

    // Update the displayed weight as the user types
    weightInput.addEventListener('input', function() {
        let weight = parseFloat(weightInput.value) || 0;
        weightValue.innerText = weight.toFixed(1);
        weightSlider.value = weight.toFixed(1);
    });

    // Update the displayed weight based on the slider value
    weightSlider.addEventListener('input', function() {
        let weight = parseFloat(weightSlider.value) || 0;
        weightValue.innerText = weight.toFixed(1);
        weightInput.value = weight.toFixed(1);
    });

    // Saves Data to DB
    logWeightBtn.addEventListener('click', function() {
        let weight = parseFloat(weightInput.value) || 0;
        let weigthData = {
            weight: weight
        }
        saveWeightData(user_ID, weigthData, usersCollection)
        // console.log('Logged weight: ' + weight + ' lbs');
        modalInstance.close();
    });
});



/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/*                                                    OVERVIEW                                                       */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */ 



let datasets = [
    { // sleep
        data: [],
        borderColor: "pink",
        fill: false
    },
    { // weight
        data: [],
        borderColor: "green",
        fill: false
    },
    { // strength
        data: [],
        borderColor: "blue",
        fill: false
    }
];

let dates;

async function updateWeightChart() {
    try {
        const [weight, weight_days] = await getWeightDataLast30Days(user_ID, usersCollection);
        createLineChart(weight_days, weight, "weight-chart", 'white', 'green', 'Days', 'Weight');

        // For General Chart
        let mappedWeightAmt = [];
        weight.forEach(element => {
            if (element != null) mappedWeightAmt.push(map(0, 300, 0, 100, element));
            else mappedWeightAmt.push(element);
        })
        datasets[1].data = mappedWeightAmt;


        if (dates == null) { // If it wasnt already defined
            dates = weight_days;
        }
    } catch (error) {
        console.error('Error updating weight graph:', error);
    }
}

async function updateSleepChart() {
    try {
        const [sleep, sleep_days] = await getSleepDataLast30Days(user_ID, usersCollection);
        createLineChart(sleep_days, sleep, "sleep-chart", 'white', 'purple', 'Days', 'Hours');
        // Find average
        let total = 0;
        let sleepTotal = 0;
        for (let i = 0; i < sleep.length; i++) {
            if (sleep[i] != null) {
                sleepTotal += parseFloat(sleep[i]);
                total++;
            }
        }
        createBarChart('sleep-bar-chart', ['Recommended Average (All)', 'Your Sleep Average'], [9, (sleepTotal / total)], 'Hours');

        // For General Chart
        let mappedSleepAmt = [];
        sleep.forEach(element => {
            if (element != null) mappedSleepAmt.push(map(0, 24, 0, 100, element));
            else mappedSleepAmt.push(element);
        })
        datasets[0].data = mappedSleepAmt;

        if (dates == null) { // If it wasnt already defined
            dates = sleep_days;
        }
    } catch (error) {
        console.error('Error updating sleep graph:', error);
    }
}

async function updateAllCharts() {
    displayLoadingScreen();
    // updateStrengthChart();
    updateSleepChart();
    await updateWeightChart();
    removeLoadingScreen();

    // Will Map all the values of the weight from a 0-300 scale to a 0-100 scale for the general graph, same with the others
    // Sleep: 0-24 scale to a 0-100 scale
    // Weight Pushed: 0-1000 scale to a 0-100 scale
    createMultiLineChart(dates, datasets, 'general-chart', 'days', 'General Trends Respectively (In % Ratio)')
}



/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/*                                                      SLEEP                                                        */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */



const circleProgress = document.querySelector(".circle-progress");
const numberOfBreaths = document.getElementById("breath-input"); 
const start = document.querySelector(".start");
const instructions = document.querySelector(".instructions");
const breathsText = document.getElementById("breath-text");
const breathSound = document.getElementById("breathSound");
let breathsLeft = 5;

// Update Breath Counter based on selection
numberOfBreaths.addEventListener('change', () => {
    breathsLeft = numberOfBreaths.value;
    breathsText.innerText = breathsLeft;
})

function growCircle() {
    circleProgress.classList.add('circle-grow');
    setTimeout(() => {
        circleProgress.classList.remove('circle-grow');
    }, 8000);
    breatheTextUpdate();
}

// Update Instructions
function breatheTextUpdate() {
    breathsLeft--;
    breathsText.innerText = breathsLeft;
    instructions.innerText = 'Breath in';
    setTimeout(() => {
        instructions.innerText = 'Hold breath';
        setTimeout(() => {
            instructions.innerText = 'Exhale breath slowly';
        }, 4000);
    }, 4000);

}

function meditate() {
    const breathingAnimation = setInterval(() => {
        if (breathsLeft === 0) {
            clearInterval(breathingAnimation);
            instructions.innerText = 'Breathing Session Completed! Click "Begin" to start another session.';
            start.classList.remove('disabled');
            breathsLeft = numberOfBreaths.value;
            breathsText.innerText = breathsLeft;
            breathSound.pause();
            return;
        }
        growCircle();
    }, 12500);
}

// Start Breathing
start.addEventListener('click', () => {
    start.classList.add('disabled');
    instructions.innerText = 'Get relaxed, and ready to begin breathing';
    setTimeout(() => {
        instructions.innerText = 'Breathing is about to begin...';
        setTimeout(() => {

            if (!breathSound.paused) {
                breathSound.pause();
                breathSound.currentTime = 0;
            }

            breathSound.play();

            growCircle();
            meditate();
            // If the sound duration is shorter than the breathing session duration, restart the sound
            setTimeout(() => {
                if (breathSound.currentTime >= breathSound.duration) {
                    breathSound.currentTime = 0;
                    breathSound.play();
                }
            }, breathSound.duration * 1000);
        }, 2000)
    }, 3000);
})


createBarChart(
    'sleep-goals-bar-chart', 
    ['All-Nighter', 'After All-Nighter', 'Minimum (Adult)', 'Minimum (Teen)', 'Average (Athlete)'], 
    [0, 11.5, 7, 8, 10], 
    'Hours'
);

document.addEventListener('DOMContentLoaded', function () {
    const sleepModal = document.getElementById('sleepModal');
    M.Modal.init(sleepModal);

    // Get references
    const sleepInput = document.getElementById('sleepInput');
    const saveSleepBtn = document.getElementById('saveSleepBtn');
    const sleepValue = document.getElementById('sleepValue');
    const logSleepCard = document.getElementById('log-sleep-card');

    // open the modal
    logSleepCard.addEventListener('click', function () {
        const sleepInstance = M.Modal.getInstance(sleepModal);
        sleepInstance.open();
    });

    // update the sleep value
    sleepInput.addEventListener('input', function () {
        const hours = parseFloat(sleepInput.value).toFixed(2);
        sleepValue.textContent = hours + ' Hours';
    });

    // Saves Data to DB
    saveSleepBtn.addEventListener('click', function () {
        const hours = parseFloat(sleepInput.value).toFixed(2);
        const sleepData = {
            sleep: hours
        }
        saveSleepData(user_ID, sleepData, usersCollection)
        const sleepInstance = M.Modal.getInstance(sleepModal);
        sleepInstance.close();
    });
});
