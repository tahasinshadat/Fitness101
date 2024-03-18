// Function to display the user's profile picture
export function displayProfilePicture(url) {
    const userPFP = document.getElementById('user-PFP');
    if (url) {
        userPFP.src = url;
        userPFP.className = 'account-image-pfp';
        userPFP.alt = "Profile Picture";
        userPFP.style.display = 'block';
        document.getElementById('hide-if-pfp-exists').style.display = 'none';
    } else {
        // If no image is available, hide the image element
        userPFP.style.display = 'none';
    }
}

// Function to display the user's profile picture
export function displayProfilePictureForNav(url) {
    const userPFP = document.getElementById('user-PFP-nav');
    const userPFPMobile = document.getElementById('user-PFP-nav-mobile');
    if (url) {

        userPFP.src = url;
        userPFPMobile.src = url;

        userPFP.className = 'account-image-pfp-nav';
        userPFPMobile.className = 'account-image-pfp-nav-mobile'

        userPFP.alt = "Profile Picture";
        userPFPMobile.alt = "Profile Picture";

        userPFP.style.display = 'block';
        userPFPMobile.style.display = 'block';

        document.getElementById('hide-if-pfp-exists-nav').style.display = 'none';
        document.getElementById('account-pfp-link').className = '';

        document.getElementById('hide-if-pfp-exists-nav-mobile').style.display = 'none';
        document.getElementById('account-pfp-link-mobile').className = '';
    } else {
        // If no image is available, hide the image element
        userPFP.style.display = 'none';
        userPFPMobile.style.display = 'none';
    }
}