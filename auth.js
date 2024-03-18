import { firebaseConfig } from '../backend/public/data.js';

// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

function showMessage(ElementId, message) {
    const messageElement = document.getElementById(ElementId);
    messageElement.textContent = message;
    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

function validateEmail(email) {
    return email.includes('@gmail.com');
}


// Create Account Page - COMPLETED
const signUpBtn = document.getElementById('sign-up_CREATE');
const usernameInput_CREATE = document.getElementById('username_CREATE');
const emailInput_CREATE = document.getElementById('email_CREATE');
const passwordInput_CREATE = document.getElementById('password_CREATE');
const passwordAgainInput_CREATE = document.getElementById('password-again_CREATE');

signUpBtn.onclick = (event) => {
    event.preventDefault();
    let username = usernameInput_CREATE.value;
    let email = emailInput_CREATE.value;
    let password = passwordInput_CREATE.value;
    let passwordAgain = passwordAgainInput_CREATE.value;

    // Error Checks
    if (username == '') {
        showMessage('ERROR', "Please Enter a Valid Username"); 
        return;
    } else if (email == '') {
        showMessage('ERROR', "Please Enter a Valid Email");
        return;
    } else if (password == '') {
        showMessage('ERROR', "Please Enter a Valid Password");
        return;
    } else if (password.length < 6) {
        showMessage('ERROR', " Password should be at least 6 characters");    
        return;
    } else if (passwordAgain == '') {
        showMessage('ERROR', "Please Re-Enter Your Password");
        return;
    } else if (password != passwordAgain) {
        showMessage('ERROR', "Passwords do not match");
        return;
    }

    // Create Account
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User created successfully
            const user = userCredential.user;
            console.log("User created:", user);
            showMessage('SUCCESS', "Successfully Created Your Account!");

            // Store the username in Firestore
            firestore.collection("users").doc(user.uid).set({
                UUID: {
                    email: email,
                    username: username
                }
            })
            .then(() => {
                // now redirect
                window.setTimeout( () => {window.location.href = "index.html";}, 1500);
            })
            .catch((error) => {
                console.error("Error storing username:", error);
                showMessage('ERROR', errorMessage);
            });

        })
        .catch((error) => {
            // Handle error
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error creating user:", errorCode, errorMessage);
            // display the error message to the user
            showMessage('ERROR', errorMessage);
        });
};


// Login
const loginBtn = document.getElementById('login-btn_LOGIN');
const emailInput_LOGIN = document.getElementById('email_LOGIN');
const passwordInput_LOGIN = document.getElementById('password_LOGIN');

loginBtn.onclick = (event) => {
    event.preventDefault();
    let email = emailInput_LOGIN.value;
    let password = passwordInput_LOGIN.value;

    // Error Checks
    if (email == '') {
        showMessage('ERROR', "Please Enter a Valid Username"); 
        return;
    } else if (password == '') {
        showMessage('ERROR', "Please Enter a Valid Password");
        return;
    } else if (password.length < 6) {
        showMessage('ERROR', " Passwords are at least 6 characters");    
        return;
    }

    // Firebase login
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User logged in successfully
            const user = userCredential.user;
            showMessage('SUCCESS', 'Logged in successfully');

            // Retrieve the username from Firestore
            const username = getUsernameFromFirestore(user.uid);

            if (username) {
                console.log("Username:", username);
                // Display or use the username as needed
            } else {
                console.log("Username not found");
            }
            window.setTimeout( () => {window.location.href = "../Home/home.html";}, 1500);
        })
        .catch((error) => {
            // Handle error
            const errorMessage = error.message;
            showMessage('ERROR', errorMessage);
        });
    
};

window.onload = () => {
    shouldRedirectAfterLogin = false;
}
let shouldRedirectAfterLogin = false;
// Check for if the user is logged in or out:
auth.onAuthStateChanged(user =>{
    if (user && shouldRedirectAfterLogin) {
        console.log('user logged in: ', user);
    } else {
        console.log('user logged out');
    }
});


function getUsernameFromFirestore(uid) {
    return firestore.collection("users").doc(uid).get()
        .then(doc => {
            if (doc.exists) {
                return doc.data().UUID.username;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error("Error getting username from Firestore:", error);
            return null;
        });
}
