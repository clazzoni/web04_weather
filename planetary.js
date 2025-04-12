/**
 * Planetary position calculator
 * Provides more accurate heliocentric longitude calculations for solar system diagram
 */

// Orbital elements for planets (simplified)
const planetaryElements = {
    mercury: {
        semiMajorAxis: 0.387098, // AU
        eccentricity: 0.205630,
        inclination: 7.0047, // degrees
        longitudeOfAscendingNode: 48.3313, // degrees
        longitudeOfPerihelion: 77.4561, // degrees
        meanLongitude: 252.2517, // degrees (J2000)
        period: 87.969 // days
    },
    venus: {
        semiMajorAxis: 0.723332, // AU
        eccentricity: 0.006772,
        inclination: 3.3946, // degrees
        longitudeOfAscendingNode: 76.6799, // degrees
        longitudeOfPerihelion: 131.5718, // degrees
        meanLongitude: 181.9798, // degrees (J2000)
        period: 224.701 // days
    },
    earth: {
        semiMajorAxis: 1.000000, // AU
        eccentricity: 0.016710,
        inclination: 0.0000, // degrees
        longitudeOfAscendingNode: 174.9058, // degrees
        longitudeOfPerihelion: 102.9454, // degrees
        meanLongitude: 100.4664, // degrees (J2000)
        period: 365.256 // days
    },
    mars: {
        semiMajorAxis: 1.523688, // AU
        eccentricity: 0.093405,
        inclination: 1.8497, // degrees
        longitudeOfAscendingNode: 49.5582, // degrees
        longitudeOfPerihelion: 336.0602, // degrees
        meanLongitude: 355.4327, // degrees (J2000)
        period: 686.980 // days
    },
    jupiter: {
        semiMajorAxis: 5.204363, // AU
        eccentricity: 0.048498,
        inclination: 1.3053, // degrees
        longitudeOfAscendingNode: 100.4565, // degrees
        longitudeOfPerihelion: 14.3312, // degrees
        meanLongitude: 34.3515, // degrees (J2000)
        period: 4332.589 // days
    },
    saturn: {
        semiMajorAxis: 9.582651, // AU
        eccentricity: 0.055508,
        inclination: 2.4889, // degrees
        longitudeOfAscendingNode: 113.6655, // degrees
        longitudeOfPerihelion: 93.0568, // degrees
        meanLongitude: 50.0774, // degrees (J2000)
        period: 10759.22 // days
    },
    uranus: {
        semiMajorAxis: 19.18909, // AU
        eccentricity: 0.047318,
        inclination: 0.7733, // degrees
        longitudeOfAscendingNode: 74.0060, // degrees
        longitudeOfPerihelion: 173.0052, // degrees
        meanLongitude: 314.0550, // degrees (J2000)
        period: 30685.4 // days
    },
    neptune: {
        semiMajorAxis: 30.06992, // AU
        eccentricity: 0.008606,
        inclination: 1.7700, // degrees
        longitudeOfAscendingNode: 131.7842, // degrees
        longitudeOfPerihelion: 48.1233, // degrees
        meanLongitude: 304.3487, // degrees (J2000)
        period: 60189.0 // days
    }
};

// Calculate heliocentric longitude for a planet at a given date
function calculateHeliocentricLongitude(planet, date) {
    // J2000.0 epoch (January 1, 2000, 12:00 UTC)
    const epoch = new Date(2000, 0, 1, 12, 0, 0, 0);
    
    // Days since J2000.0
    const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
    
    // Mean anomaly (in degrees)
    const meanAnomaly = (planet.meanLongitude + 360 * daysSinceEpoch / planet.period) % 360;
    
    // Convert to radians for calculations
    const meanAnomalyRad = meanAnomaly * Math.PI / 180;
    const eccentricity = planet.eccentricity;
    
    // Solve Kepler's equation for eccentric anomaly (using simple approximation)
    let eccentricAnomaly = meanAnomalyRad;
    for (let i = 0; i < 5; i++) { // 5 iterations is usually sufficient
        eccentricAnomaly = meanAnomalyRad + eccentricity * Math.sin(eccentricAnomaly);
    }
    
    // Calculate true anomaly
    const x = Math.cos(eccentricAnomaly) - eccentricity;
    const y = Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(eccentricAnomaly);
    let trueAnomaly = Math.atan2(y, x);
    
    // Convert back to degrees
    trueAnomaly = trueAnomaly * 180 / Math.PI;
    
    // Heliocentric longitude
    let heliocentricLongitude = (trueAnomaly + planet.longitudeOfPerihelion) % 360;
    
    // Convert back to radians for our diagram
    return heliocentricLongitude * Math.PI / 180;
}

// Calculate all planet positions
function calculateAccuratePlanetPositions(date) {
    return [
        calculateHeliocentricLongitude(planetaryElements.mercury, date),
        calculateHeliocentricLongitude(planetaryElements.venus, date),
        calculateHeliocentricLongitude(planetaryElements.earth, date),
        calculateHeliocentricLongitude(planetaryElements.mars, date),
        calculateHeliocentricLongitude(planetaryElements.jupiter, date),
        calculateHeliocentricLongitude(planetaryElements.saturn, date),
        calculateHeliocentricLongitude(planetaryElements.uranus, date),
        calculateHeliocentricLongitude(planetaryElements.neptune, date)
    ];
}
