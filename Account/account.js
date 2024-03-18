import { displayProfilePicture, displayProfilePictureForNav } from '../pfpDisplay.js';
import { firebaseConfig } from '../secure.js';

// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const usersCollection = firestore.collection('users');
const storage = firebase.storage();

// Signing Out
const signOutBtn = document.getElementById('sign-out_ACCOUNT');
signOutBtn.onclick = (event) => {
    event.preventDefault();
    auth.signOut().then(() => {
        console.log('Youve been signed out');
    });
}

// Check for if the user is logged in or out:
auth.onAuthStateChanged(user =>{
    if (user == null) {
        window.setTimeout( () => {window.location.href = "../index.html";}, 1500);
    } else {
        displayInfo(user);
        console.log(user);
        console.log('user logged in');

        // Get the user's profile picture URL from Firestore
        const userDocRef = usersCollection.doc(user.uid);
        userDocRef.get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const profilePictureUrl = userData.profilePicture;
                displayProfilePicture(profilePictureUrl);
                displayProfilePictureForNav(profilePictureUrl);
            } else {
                // User doesn't have a profile picture yet
                displayProfilePicture(null);
                displayProfilePictureForNav(null);
            }
        }).catch(error => {
            console.error('Error getting user data:', error);
        });
    }
});

// Info
const email = document.getElementById('email-edit');
const username = document.getElementById('username-edit');
const totalWorkouts = document.getElementById('workouts-analytics');
const totalLoggedInDays = document.getElementById('daysIn-analytics');
const totalPosts = document.getElementById('posts-analytics');

async function displayInfo(user) {
    email.innerText = user.email;
    await usersCollection.doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            username.innerText = userData.UUID.username;
            if (userData.analytics) {
                totalWorkouts.innerText = userData.analytics.totalWorkouts;
                totalLoggedInDays.innerText = userData.analytics.totalDaysLoggedIn;
                totalPosts.innerText = userData.analytics.totalPosts;
            }
        }
    }).catch((error) => {
        console.error("Error getting username:", error);
    });
    
}

// Function to handle file upload
document.getElementById('update-profile-picture_ACCOUNT').addEventListener('click', function () {
    document.getElementById('profile-picture-input').click(); // Trigger the file input click event
});
  
// Add an event listener to the file input for displaying the selected file
document.getElementById('profile-picture-input').addEventListener('change', function (event) {
    const file = event.target.files[0]; // access the first file the user uploaded
    if (file) {
        // Get the currently logged-in user
        const user = auth.currentUser;
    
        // Reference to the user's document in Firestore
        const userDocRef = usersCollection.doc(user.uid);
    
        // Reference to the user's profile picture in Firebase Storage
        const storageRef = storage.ref('profile_pictures/' + user.uid + '/' + file.name);
    
        // Upload the image to Firebase Storage
        const task = storageRef.put(file);
    
        task.then(snapshot => {
            console.log('Uploaded a file!');
            // Get the download URL of the uploaded image
            storageRef.getDownloadURL().then(url => {
                // Update the user's profile picture URL in Firestore
                userDocRef.update({
                    profilePicture: url
                }).then(() => {
                    console.log('Profile picture URL updated in Firestore.');
                    // Display the new profile picture.
                    displayProfilePicture(url);
                    displayProfilePictureForNav(url);
                    
                }).catch(error => {
                    console.error('Error updating profile picture URL in Firestore:', error);
                });
            }).catch(error => {
                console.error('Error getting download URL:', error);
            });
        }).catch(error => {
            console.error('Error uploading file:', error);
        });

    }
});