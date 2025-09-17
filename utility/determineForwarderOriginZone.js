const { mySqlQury } = require("../middleware/db");

async function determineForwarderOriginZone(forwarderId, pickupCity, destinationCity, pickupState, destinationState, pickupZone, destinationZone) {
  console.log("Determining origin zone for forwarder", {
    forwarderId, pickupCity, destinationCity, pickupZone, destinationZone,pickupState,destinationState
  });
  console.log("pickup city",pickupCity)
  console.log("destination city",destinationCity)
  console.log("pickup state",pickupState)
  console.log("destination state",destinationState)
  console.log("pickup zone",pickupZone)
  console.log("destination zone",destinationZone)
  // console.log("dskhdkshd",djshdusgd)
  const cleanPickupCity = pickupCity.replace(/\s+/g, '').toUpperCase();
const cleanDestinationCity = destinationCity.replace(/\s+/g, '').toUpperCase();
const cleanPickupState = pickupState.replace(/\s+/g, '').toUpperCase();
const cleanDestinationState = destinationState.replace(/\s+/g, '').toUpperCase();

  let originZone = null;
  let zoneResult;

  // Step 1: WITHIN NCR rule check
  zoneResult = await mySqlQury(
    `SELECT zone FROM tbl_exp_zone_mapping 
     WHERE courier_id = ? 
       AND rule = 'WITHIN NCR' 
       AND FIND_IN_SET(?, REPLACE(city, ' ', '')) > 0 
       AND FIND_IN_SET(?, REPLACE(city, ' ', '')) > 0`,
    [forwarderId, cleanPickupCity, cleanDestinationCity,cleanPickupState,cleanDestinationState]
  );
  if (zoneResult.length > 0) {
    originZone = zoneResult[0].zone ?? 'A'; // or assign a default zone
    console.log("Origin zone from WITHIN NCR: ", originZone);
  }

  // Step 2: WITHIN CITY rule
  if (!originZone && cleanPickupCity === cleanDestinationCity) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_exp_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN CITY'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN CITY: ", originZone);
  }

  // Step 3: WITHIN STATE rule
  if (!originZone && cleanPickupState === cleanDestinationState) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_exp_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-STATE'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN ZONE: ", originZone);
  }

    // Step 4: WITHIN ZONE rule
  if (!originZone && pickupZone === destinationZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_exp_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-ZONE'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN ZONE: ", originZone);
  }

  // Step 5: WITHIN METRO
  if (!originZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_exp_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-METRO' 
         AND FIND_IN_SET(?, city) > 0`,
      [forwarderId, cleanDestinationCity]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN METRO: ", originZone);
  }

  // Step 6: WITHIN SPECIAL ZONE using state
  if (!originZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_exp_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-SPECIAL ZONE' 
         AND (FIND_IN_SET(?, state) > 0 OR FIND_IN_SET(?, state) > 0)`,
      [forwarderId, cleanPickupState, cleanDestinationState]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN SPECIAL ZONE: ", originZone);
  }

  // Step 7: WITHIN ROI fallback
  if (!originZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_exp_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'ROI'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN ROI: ", originZone);
  }

  return originZone;
}
async function determineForwarderOriginEcomZone(forwarderId, pickupCity, destinationCity, pickupState, destinationState, pickupZone, destinationZone) {
  console.log("Determining origin zone for forwarder", {
    forwarderId, pickupCity, destinationCity, pickupZone, destinationZone,pickupState,destinationState
  });
  const cleanPickupCity = pickupCity.replace(/\s+/g, '').toUpperCase();
const cleanDestinationCity = destinationCity.replace(/\s+/g, '').toUpperCase();
const cleanPickupState = pickupState.replace(/\s+/g, '').toUpperCase();
const cleanDestinationState = destinationState.replace(/\s+/g, '').toUpperCase();

  let originZone = null;
  let zoneResult;

  // Step 1: WITHIN NCR rule check
  zoneResult = await mySqlQury(
    `SELECT zone FROM tbl_ecom_zone_mapping 
     WHERE courier_id = ? 
       AND rule = 'WITHIN NCR' 
       AND FIND_IN_SET(?, REPLACE(city, ' ', '')) > 0 
       AND FIND_IN_SET(?, REPLACE(city, ' ', '')) > 0`,
    [forwarderId, cleanPickupCity, cleanDestinationCity,cleanPickupState,cleanDestinationState]
  );
  if (zoneResult.length > 0) {
    originZone = zoneResult[0].zone ?? 'A'; // or assign a default zone
    console.log("Origin zone from WITHIN NCR: ", originZone);
  }

  // Step 2: WITHIN CITY rule
  if (!originZone && cleanPickupCity === cleanDestinationCity) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_ecom_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN CITY'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN CITY: ", originZone);
  }
  // Step 3: WITHIN STATE rule
  if (!originZone && cleanPickupState === cleanDestinationState) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_ecom_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-STATE'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN STATE: ", originZone);
  }
  // Step 4: WITHIN ZONE rule
  if (!originZone && pickupZone === destinationZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_ecom_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-ZONE'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN ZONE: ", originZone);
  }

  // Step 5: WITHIN METRO
  if (!originZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_ecom_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-METRO' 
         AND FIND_IN_SET(?, city) > 0`,
      [forwarderId, cleanDestinationCity]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN METRO: ", originZone);
  }

  // Step 6: WITHIN SPECIAL ZONE using state
  if (!originZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_ecom_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'WITHIN-SPECIAL ZONE' 
         AND (FIND_IN_SET(?, state) > 0 OR FIND_IN_SET(?, state) > 0)`,
      [forwarderId, cleanPickupState, cleanDestinationState]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN SPECIAL ZONE: ", originZone);
  }

  // Step 7: WITHIN ROI fallback
  if (!originZone) {
    zoneResult = await mySqlQury(
      `SELECT zone FROM tbl_ecom_zone_mapping 
       WHERE courier_id = ? 
         AND rule = 'ROI'`,
      [forwarderId]
    );
    originZone = zoneResult.length > 0 ? (zoneResult[0].zone ?? 'A') : null;
    console.log("Origin zone from WITHIN ROI: ", originZone);
  }

  return originZone;
}
module.exports = { determineForwarderOriginZone ,determineForwarderOriginEcomZone}