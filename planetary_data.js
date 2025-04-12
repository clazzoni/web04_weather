/**
 * More accurate planetary orbital elements
 * Based on J2000.0 epoch
 */

const planetaryData = {
    // Names of planets
    names: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    
    // Colors for visual representation
    colors: ['gray', 'orange', 'blue', 'red', 'brown', 'goldenrod', 'lightblue', 'darkblue'],
    
    // Semi-major axes in astronomical units (AU)
    semiMajorAxes: [0.39, 0.72, 1.00, 1.52, 5.20, 9.58, 19.18, 30.07],
    
    // Orbital periods in days
    orbitalPeriods: [88, 225, 365.25, 687, 4333, 10759, 30687, 60190],
    
    // Eccentricities
    eccentricities: [0.206, 0.007, 0.017, 0.093, 0.048, 0.056, 0.046, 0.010],
    
    // Initial mean anomalies at J2000.0 epoch (in radians)
    initialPositions: [
        1.5,  // Mercury
        4.9,  // Venus
        1.8,  // Earth
        0.3,  // Mars
        0.6,  // Jupiter
        5.9,  // Saturn
        3.1,  // Uranus
        4.2   // Neptune
    ]
};
