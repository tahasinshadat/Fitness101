// Function to display exercises with the heart icon
export function displayLikedExercises(usersCollection, userId, userFavoriteExercisesCache, likedExercisesDisplayContainer) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f2374c1df8msh0628c9f48ee3710p12bd74jsn2e2411896308',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
    };

    fetch('https://exercisedb.p.rapidapi.com/exercises', options)
        .then(response => response.json())
        .then(function(response) {
            // Check if the user's favorite exercises are already in the local cache
            if (userId in userFavoriteExercisesCache) {
                const userFavorites = userFavoriteExercisesCache[userId];
                if (Object.keys(userFavorites).length === 0) likedExercisesDisplayContainer.innerHTML = '<p>No Liked Workouts</p>';
                else renderExercisesWithFavorites(userFavorites, response, likedExercisesDisplayContainer, usersCollection, userId);
            
            } else {
                // Fetch the user's document from Firestore
                usersCollection.doc(userId).get().then((doc) => {
                    if (doc.exists) {
                        const user = doc.data();
                        const userFavorites = user.favoriteExercises || {};
                        // Update the local cache
                        userFavoriteExercisesCache[userId] = userFavorites;
                        if (Object.keys(userFavorites).length === 0) likedExercisesDisplayContainer.innerHTML = '<p>No Liked Workouts</p>';
                        else renderExercisesWithFavorites(userFavorites, response, likedExercisesDisplayContainer, usersCollection, userId);

                    } else {
                        console.log("User document not found.");
                    }
                }).catch((error) => {
                    console.error("Error getting user document:", error);
                });
            }
        });
}

function renderExercisesWithFavorites(userFavorites, data, likedExercisesDisplayContainer, usersCollection, user_ID) {

    for (let i = 0; i < data.length; i++) {
        const exerciseID = data[i].id
        if (userFavorites[exerciseID] == exerciseID) {
            // Setup
            let colDiv = document.createElement("div");
            colDiv.className = "col-md-12 col-lg-6";
            let card = document.createElement("div");
            card.className = "card";
            let cardImageContainer = document.createElement("div");
            cardImageContainer.className = "card-image";
            cardImageContainer.style.position = "relative";

            // Favorite Icon
            let favoriteLink = document.createElement("a");
            favoriteLink.className = "btn-floating pink pulse";
            favoriteLink.style.position = "absolute";
            favoriteLink.style.top = "10px";
            favoriteLink.style.right = "10px";
            let favoriteIcon = document.createElement("i");
            favoriteIcon.className = "material-icons cyan-text";
            favoriteIcon.textContent = "favorite";
            favoriteLink.appendChild(favoriteIcon);

            favoriteIcon.addEventListener('click', () => {
                console.log('hello')
                // Reference to the user's document in Firestore
                const userDocRef = usersCollection.doc(user_ID);
                
            
                // Check if the heart icon has the "red-heart" class
                const isHearted = favoriteIcon.classList.contains('cyan-text');
            
                // Update the user's favoriteExercises dictionary with the exercise ID
                userDocRef.update({
                    [`favoriteExercises.${exerciseID}`]: isHearted ? firebase.firestore.FieldValue.delete() : exerciseID
                })
                .then(() => {                    
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
            likedExercisesDisplayContainer.appendChild(colDiv);
        }
    }
}