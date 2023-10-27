const barColors = ['red', 'orange', 'green', 'blue', 'purple', 'pink'];
export function createBarChart(chartId, labels, data, yLabel) {
    const ctx = document.getElementById(chartId).getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
            {
                label: yLabel,
                backgroundColor: data.map((_, index) => barColors[index % barColors.length]),
                data: data,
            },
            ],
        },
        options: {
            scales: {
            y: {
                title: {
                    display: true,
                    text: yLabel,
                },
                min: 0,
                max: 24,
                ticks: {
                    stepSize: 2,
                },
            },
            },
        },
    });
}

// Function to save sleep data to Firestore
export function saveSleepData(userId, sleepData, usersCollection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are 0-based
    const day = today.getDate();

    // Reference the user's sleep data for the current day
    const sleepRef = usersCollection.doc(userId).collection('sleep')
        .doc(`${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`);

    // Set Data
    sleepRef.set(sleepData)
        .then(() => {
            console.log('Sleep data saved successfully!');
        })
        .catch(error => {
            console.error(`Error saving sleep data:`, error);
        })
}

const meditations = [
    'https://www.tarabrach.com/?powerpress_pinw=49210-podcast'
]