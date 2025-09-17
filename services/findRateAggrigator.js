const { mySqlQury } = require("../middleware/db");

// async function findRateAggrigator(aggid, originZone, weight, maxWeight, chosenCharge) {
//   console.log("Finding Rate for Aggregator", { aggid, originZone, weight, maxWeight, chosenCharge });
  
//   // Validate inputs and ensure they are numbers
//   if (!aggid || !originZone || !weight || weight <= 0) {
//     console.error("Invalid inputs provided to findRateAggrigator:", { aggid, originZone, weight });
//     return { rate: null, maxWeight: null };
//   }
  
//   // Ensure weight is a number
//   const validWeight = Number(weight);
//   if (isNaN(validWeight) || validWeight <= 0) {
//     console.error("Invalid weight value:", weight);
//     return { rate: null, maxWeight: null };
//   }
  
//   // Ensure maxWeight is a valid number
//   const validMaxWeight = Number(maxWeight);
//   if (isNaN(validMaxWeight) || validMaxWeight <= 0) {
//     console.warn("Invalid maxWeight, using default value 1:", maxWeight);
//     maxWeight = 1;
//   }
  
//   // Ensure chosenCharge is a valid number
//   const validChosenCharge = Number(chosenCharge);
//   if (isNaN(validChosenCharge) || validChosenCharge <= 0) {
//     console.warn("Invalid chosenCharge, using default value 1:", chosenCharge);
//     chosenCharge = 1;
//   }

//   try {
//     // Step 1: Get linked courier_id (forwarder)
//     const courierMap = await mySqlQury(
//       `SELECT courier_id FROM tbl_logistics_partner WHERE id = ?`,
//       [aggid]
//     );
//     if (!courierMap.length) {
//       console.error("No forwarder mapped for aggregator:", aggid);
//       return { rate: null, maxWeight: null };
//     }
//     const courierId = courierMap[0].courier_id;

//     // Step 2: Use forwarder's logic to find the maxWeight
 

//     // Step 3: Get aggregator-specific base rate for zone
//     const aggZoneRate = await mySqlQury(
//       `SELECT zone_value FROM tbl_exp_lp_zones_rates 
//        WHERE lp_id = ? AND zone_name = ?`,
//       [aggid, originZone]
//     );
//     if (!aggZoneRate.length) {
//       console.error("No aggregator zone base rate found.");
//       return { rate: null, maxWeight: null };
//     }
//     const baseRate = Number(aggZoneRate[0].zone_value);
//     console.log("Aggregator base rate:", baseRate);

//     // Step 4: Calculate extra weight
//     const weightInKg = validWeight / 1000;

//     const extraWeightInKg = weightInKg - validMaxWeight;
//     if (extraWeightInKg <= 0) {
//       console.log("Within base slab. Final rate = baseRate:", baseRate);
//       return { rate: baseRate, maxWeight };
//     }

//     // Step 5: Fetch aggregator slab-additional charges
//     const addChargeResult = await mySqlQury(
//       `SELECT amount FROM tbl_exp_lp_slab_add_charges 
//        WHERE lp_id = ? AND zone_name = ?`,
//       [aggid, originZone]
//     );
//     console.log("addChargeResult", addChargeResult);

//     let extraCharge = 0;
//     if (addChargeResult.length) {
//       const extraChargePerUnit = Number(addChargeResult[0].amount);
      
//       // Ensure chosenCharge is valid and not zero
//       const validChosenCharge = Number(chosenCharge) || 1;
//       if (validChosenCharge <= 0) {
//         console.warn("Invalid chosenCharge, using default value 1");
//         chosenCharge = 1;
//       }
      
//       const parts = Math.ceil(extraWeightInKg / validChosenCharge); // increment based on slab size here chosen charge is upto charge
//       extraCharge = parts * extraChargePerUnit;

//       console.log("Aggregator-specific extra charge:", { parts, extraChargePerUnit, extraCharge, validChosenCharge });
//     } else {
//       // fallback if no aggregator-specific charge defined
//       // Ensure maxWeight is valid and not zero
//       const validMaxWeight = Number(maxWeight) || 1;
//       if (validMaxWeight <= 0) {
//         console.warn("Invalid maxWeight, using default value 1");
//         maxWeight = 1;
//       }
      
//       const parts = Math.ceil(weightInKg / validMaxWeight);
//       extraCharge = parts * baseRate;
//       console.warn("No extra charge mapping found. Fallback to baseRate:", extraCharge);
//     }

//     const finalRate = baseRate + extraCharge;
//     console.log("Final rate for aggregator:", finalRate);

//     return { rate: finalRate, maxWeight };
//   } catch (err) {
//     console.error("Aggregator rate calculation error:", err);
//     return { rate: null, maxWeight: null };
//   }
// }
async function findRateAggrigator(aggid, originZone, weight, maxWeight) {
  console.log("Finding Rate for Aggregator in Ecom", { aggid, originZone, weight, maxWeight });
  
  // Validate inputs and ensure they are numbers
  if (!aggid || !originZone || !weight || weight <= 0) {
    console.error("Invalid inputs provided to findRateAggrigatorEcom:", { aggid, originZone, weight });
    return { rate: null, maxWeight: null };
  }
  
  // Ensure weight is a number
  const validWeight = Number(weight);
  if (isNaN(validWeight) || validWeight <= 0) {
    console.error("Invalid weight value:", weight);
    return { rate: null, maxWeight: null };
  }
  
  // Ensure maxWeight is a valid number
  const validMaxWeight = Number(maxWeight);
  if (isNaN(validMaxWeight) || validMaxWeight <= 0) {
    console.warn("Invalid maxWeight, using default value 1:", maxWeight);
    maxWeight = 1;
  }

  try {
    // Step 1: Get linked courier_id (forwarder)
    const courierMap = await mySqlQury(
      `SELECT courier_id FROM tbl_logistics_partner WHERE id = ?`,
      [aggid]
    );
    if (!courierMap.length) {
      console.error("No forwarder mapped for aggregator:", aggid);
      return { rate: null, maxWeight: null };
    }
    const courierId = courierMap[0].courier_id;

    // Step 2: Use forwarder's logic to find the maxWeight
 

    // Step 3: Get aggregator-specific base rate for zone
    const aggZoneRate = await mySqlQury(
      `SELECT zone_value FROM tbl_exp_lp_zones_rates 
       WHERE lp_id = ? AND zone_name = ?`,
      [aggid, originZone]
    );
    if (!aggZoneRate.length) {
      console.error("No aggregator zone base rate found.");
      return { rate: null, maxWeight: null };
    }
    const baseRate = Number(aggZoneRate[0].zone_value);
    console.log("Aggregator base rate:", baseRate);

    // Step 4: Calculate extra weight
    const weightInKg = validWeight / 1000;
    const extraWeightInKg = weightInKg - validMaxWeight;
    if (extraWeightInKg <= 0) {
      console.log("Within base slab. Final rate = baseRate:", baseRate);
      return { rate: baseRate, maxWeight };
    }

    // Step 5: Fetch aggregator slab-additional charges
    const addChargeResult = await mySqlQury(
      `SELECT amount FROM tbl_exp_lp_slab_add_charges 
       WHERE lp_id = ? AND zone_name = ?`,
      [aggid, originZone]
    );

    let extraCharge = 0;
    if (addChargeResult.length) {
      const extraChargePerUnit = Number(addChargeResult[0].amount);
      
      // Ensure maxWeight is valid and not zero
      const validMaxWeight = Number(maxWeight) || 1;
      if (validMaxWeight <= 0) {
        console.warn("Invalid maxWeight, using default value 1");
        maxWeight = 1;
      }
      
      const parts = Math.ceil(extraWeightInKg / validMaxWeight); // increment based on slab size
      extraCharge = parts * extraChargePerUnit;
      console.log("Aggregator-specific extra charge:", { parts, extraChargePerUnit, extraCharge, validMaxWeight });
    } else {
      // fallback if no aggregator-specific charge defined
      // Ensure maxWeight is valid and not zero
      const validMaxWeight = Number(maxWeight) || 1;
      if (validMaxWeight <= 0) {
        console.warn("Invalid maxWeight, using default value 1");
        maxWeight = 1;
      }
      
      const parts = Math.ceil(extraWeightInKg / validMaxWeight);
      extraCharge = parts * baseRate;
      console.warn("No extra charge mapping found. Fallback to baseRate:", extraCharge);
    }

    const finalRate = baseRate + extraCharge;
    console.log("Final rate for aggregator:", finalRate);

    return { rate: finalRate, maxWeight };
  } catch (err) {
    console.error("Aggregator rate calculation error:", err);
    return { rate: null, maxWeight: null };
  }
}
async function findRateAggrigatorEcom(aggid, originZone, weight, maxWeight) {
  console.log("Finding Rate for Aggregator in Ecom", { aggid, originZone, weight, maxWeight });
  
  // Validate inputs and ensure they are numbers
  if (!aggid || !originZone || !weight || weight <= 0) {
    console.error("Invalid inputs provided to findRateAggrigatorEcom:", { aggid, originZone, weight });
    return { rate: null, maxWeight: null };
  }
  
  // Ensure weight is a number
  const validWeight = Number(weight);
  if (isNaN(validWeight) || validWeight <= 0) {
    console.error("Invalid weight value:", weight);
    return { rate: null, maxWeight: null };
  }
  
  // Ensure maxWeight is a valid number
  const validMaxWeight = Number(maxWeight);
  if (isNaN(validMaxWeight) || validMaxWeight <= 0) {
    console.warn("Invalid maxWeight, using default value 1:", maxWeight);
    maxWeight = 1;
  }

  try {
    // Step 1: Get linked courier_id (forwarder)
    const courierMap = await mySqlQury(
      `SELECT courier_id FROM tbl_logistics_partner WHERE id = ?`,
      [aggid]
    );
    if (!courierMap.length) {
      console.error("No forwarder mapped for aggregator:", aggid);
      return { rate: null, maxWeight: null };
    }
    const courierId = courierMap[0].courier_id;

    // Step 2: Use forwarder's logic to find the maxWeight
 

    // Step 3: Get aggregator-specific base rate for zone
    const aggZoneRate = await mySqlQury(
      `SELECT zone_value FROM tbl_ecom_lp_zones_rates 
       WHERE lp_id = ? AND zone_name = ?`,
      [aggid, originZone]
    );
    if (!aggZoneRate.length) {
      console.error("No aggregator zone base rate found.");
      return { rate: null, maxWeight: null };
    }
    const baseRate = Number(aggZoneRate[0].zone_value);
    console.log("Aggregator base rate:", baseRate);

    // Step 4: Calculate extra weight
    const weightInKg = validWeight / 1000;
    const extraWeightInKg = weightInKg - validMaxWeight;
    if (extraWeightInKg <= 0) {
      console.log("Within base slab. Final rate = baseRate:", baseRate);
      return { rate: baseRate, maxWeight };
    }

    // Step 5: Fetch aggregator slab-additional charges
    const addChargeResult = await mySqlQury(
      `SELECT amount FROM tbl_ecom_lp_slab_add_charges 
       WHERE lp_id = ? AND zone_name = ?`,
      [aggid, originZone]
    );
    // let extraCharge = 0;
    // let passhere =  Number(addChargeResult[0].amount);
    // if (addChargeResult.length && passhere > 0) {
    let extraCharge = 0;
    if (addChargeResult.length) {
      const extraChargePerUnit = Number(addChargeResult[0].amount);
      
      // Ensure maxWeight is valid and not zero
      const validMaxWeight = Number(maxWeight) || 1;
      if (validMaxWeight <= 0) {
        console.warn("Invalid maxWeight, using default value 1");
        maxWeight = 1;
      }
      
      const parts = Math.ceil(extraWeightInKg / validMaxWeight); // increment based on slab size
      extraCharge = parts * extraChargePerUnit;
      console.log("Aggregator-specific extra charge:", { parts, extraChargePerUnit, extraCharge, validMaxWeight });
    } else {
      // fallback if no aggregator-specific charge defined
      // Ensure maxWeight is valid and not zero
      const validMaxWeight = Number(maxWeight) || 1;
      if (validMaxWeight <= 0) {
        console.warn("Invalid maxWeight, using default value 1");
        maxWeight = 1;
      }
      
      const parts = Math.ceil(extraWeightInKg / validMaxWeight);
      extraCharge = parts * baseRate;
      console.warn("No extra charge mapping found. Fallback to baseRate:", extraCharge);
    }

    const finalRate = baseRate + extraCharge;
    console.log("Final rate for aggregator:", finalRate);

    return { rate: finalRate, maxWeight };
  } catch (err) {
    console.error("Aggregator rate calculation error:", err);
    return { rate: null, maxWeight: null };
  }
}

module.exports = {findRateAggrigator, findRateAggrigatorEcom}