export function createLineChart(xValues, yValues, chartId, bgColor, borderColor, xLabel, yLabel) {
    new Chart(chartId, {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                fill: false,
                lineTension: 0,
                backgroundColor: bgColor,
                borderColor: borderColor,
                data: yValues
            }]
        },
        options: {
            legend: { display: false },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xLabel
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabel
                    },
                    ticks: { min: Math.min(...yValues), max: Math.max(...yValues) }
                }],
            }
        }
    });
}

export function createMultiLineChart(xValues, datasets, chartId, xLabel, yLabel) {
    new Chart(chartId, {
        type: "line",
        data: {
            labels: xValues,
            datasets: datasets
        },
        options: {
            legend: { display: false },
            scales: {
            xAxes: [{
                scaleLabel: {
                display: true,
                labelString: xLabel
                }
            }],
            yAxes: [{
                scaleLabel: {
                display: true,
                labelString: yLabel
                }
            }]
            }
        }
    });
}

export function saveWeightData(userId, weightData, usersCollection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are 0-based
    const day = today.getDate();

    // Reference the user's meal data for the current day
    const weightRef = usersCollection.doc(userId).collection('weight')
        .doc(`${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`);

    // Get the existing meals array or create an empty array if it doesn't exist
    weightRef.set(weightData)
        .then(() => {
            console.log('Weight data saved successfully!');
        })
        .catch(error => {
            console.error(`Error saving weight data:`, error);
        })
        
}

export async function getWeightDataLast30Days(userId, usersCollection) {
    // today
    const endDate = new Date();
    
    // start date as 30 days ago from today
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Reference the user's weight data within the last 30 days
    let weightDataArray = [];
    let dayDataArray = [];
    let mostRecentWeight = null;

    // Loop through each day within the last 30 days
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        // Converts date to YYYY-MM-DD
        const dateStr = currentDate.toISOString().split('T')[0];
        // Date in MM-DD format
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const graphDate = `${month}-${day}`;

        // Reference the weight data for the current date
        const weightRef = usersCollection.doc(userId).collection('weight').doc(dateStr);

        try {

            const doc = await weightRef.get();
            if (doc.exists) {
                const weightData = doc.data().weight;
                weightDataArray.push(weightData);
                dayDataArray.push(graphDate);
                mostRecentWeight = weightData;
            } else if (mostRecentWeight !== null) {
                // If no data for the current date, try the previous dates weight (maybe they forgot to log their weight or something, but this is so the graph is still complete)
                weightDataArray.push(mostRecentWeight);
                dayDataArray.push(graphDate);
            } else {
                // If no data for the current date or recent dates, push null
                weightDataArray.push(null);
                dayDataArray.push(graphDate);
            }

        } catch (error) {
            console.error('Error fetching weight data:', error);
            throw error;
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return [weightDataArray, dayDataArray];
}

// export async function getWeightDataByMonth(userId, usersCollection, year, month) {
//     // Ensure month and year are valid (e.g., month is between 1 and 12)
//     if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
//         throw new Error('Invalid month or year.');
//     }

//     // Calculate the start and end dates of the specified month
//     const startDate = new Date(year, month - 1, 1); // Month is 0-based
//     const endDate = new Date(year, month, 0); // The 0th day of the next month is the last day of the current month

//     // Reference the user's weight data within the specified month
//     const weightDataArray = [];

//     // Loop through each day of the month
//     let currentDate = new Date(startDate);
//     while (currentDate <= endDate) {
//         const dateStr = currentDate.toISOString().split('T')[0];

//         // Reference the weight data for the current date
//         const weightRef = usersCollection.doc(userId).collection('weight').doc(dateStr);

//         try {
//             const doc = await weightRef.get();
//             if (doc.exists) {
//                 const weightData = doc.data().weight;
//                 weightDataArray.push({ date: dateStr, weight: weightData });
//             } else {
//                 // If no data for the current date, push null
//                 weightDataArray.push({ date: dateStr, weight: null });
//             }
//         } catch (error) {
//             console.error('Error fetching weight data:', error);
//             throw error;
//         }

//         // Move to the next day
//         currentDate.setDate(currentDate.getDate() + 1);
//     }

//     return weightDataArray;
// }

export async function getSleepDataLast30Days(userId, usersCollection) {
    // today
    const endDate = new Date();
    
    // start date as 30 days ago from today
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Reference the user's sleep data within the last 30 days
    let sleepDataArray = [];
    let dayDataArray = [];
    let mostRecentSleep = null;

    // Loop through each day within the last 30 days
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        // Converts date to YYYY-MM-DD
        const dateStr = currentDate.toISOString().split('T')[0];
        // Date in MM-DD format
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const graphDate = `${month}-${day}`;

        // Reference the sleep data for the current date
        const sleepRef = usersCollection.doc(userId).collection('sleep').doc(dateStr);

        try {

            const doc = await sleepRef.get();
            if (doc.exists) {
                const sleepData = doc.data().sleep;
                sleepDataArray.push(sleepData);
                dayDataArray.push(graphDate);
                mostRecentSleep = sleepData;
            } else if (mostRecentSleep !== null) {
                // If no data for the current date, try the previous dates sleep (maybe they forgot to log their sleep)
                sleepDataArray.push(mostRecentSleep);
                dayDataArray.push(graphDate);
            } else {
                // If no data for the current date or recent dates, push null
                sleepDataArray.push(null);
                dayDataArray.push(graphDate);
            }

        } catch (error) {
            console.error('Error fetching sleep data:', error);
            throw error;
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return [sleepDataArray, dayDataArray];
}

export function map(originalRangeMin, originalRangeMax, newRangeMin, newRangeMax, originalRangeValue) {
    // Check if originalRangeMax is not equal to originalRangeMin to avoid division by zero
    if (originalRangeMin === originalRangeMax) {
      throw new Error("originalRangeMin and originalRangeMax should not be equal");
    }
  
    // Calculate the ratio to map the value from the original range to the new range
    const ratio = (newRangeMax - newRangeMin) / (originalRangeMax - originalRangeMin);
  
    // Map the value to the new range
    const mappedValue = (originalRangeValue - originalRangeMin) * ratio + newRangeMin;
  
    return mappedValue;
}
  