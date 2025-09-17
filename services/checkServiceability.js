const axios = require("axios");
const fetchExpressBeesToken = require("./fetchExpressBeesToken");
const { mySqlQury } = require("../middleware/db");

async function checkServiceability(taggedApi, pickupPincode, destinationPincode, weight, paymentType, orderAmount, weight_unit) {
  try {
    let serviceable = false;
    console.log("in the check serviceability",taggedApi,pickupPincode,destinationPincode,weight,paymentType,orderAmount,weight_unit)

    // Convert weight to grams if it's in kg
    const weightInGrams = weight_unit === 'kg' ? Number(weight) * 1000 : Number(weight);
    console.log("weight in grams:", weight_unit)
    console.log("weight in grams:", weightInGrams);
    const cleanTaggedApi = taggedApi.toLowerCase();
    
    // Example for ExpressBee
    if (cleanTaggedApi === 'xpressbees') {
      // First try to get a valid token (cached or fresh)
      let expressBeesToken = await fetchExpressBeesToken();

      // Set request body based on payment type
      const requestBody = {
        origin: pickupPincode,
        destination: destinationPincode,
        payment_type: paymentType.toLowerCase() === 'cod' ? 'cod' : 'prepaid',
        order_amount: orderAmount,
        weight: weightInGrams
      };
      console.log("request body",requestBody)

      try {
        // First attempt with current token
        const response = await axios.post('https://shipment.xpressbees.com/api/courier/serviceability', requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${expressBeesToken}`
          }
        });
        
        console.log("result in the expressbees",response.data)
        if (response.data.status === false) {
          console.log("ExpressBees status false:", response.data.data);
          return false; // Not serviceable
        }
        
        // Check if response has data and it's an array
        if (response.data.status === true && Array.isArray(response.data.data)) {
          // If the API returns any data with status true, consider it serviceable
          // The presence of any ID in the response means the route is serviceable
          serviceable = response.data.data.length > 0;
          console.log("ExpressBees API returned data:", response.data.data);
        } else {
          serviceable = false;
        }
        console.log("ExpressBees serviceability result:", serviceable);
        
      } catch (error) {
        // If first attempt fails with 401 (token invalid), try with fresh token
        if (error.response?.status === 401) {
          console.log("🔐 First attempt failed with 401, getting fresh token and retrying...");
          console.log("❌ ExpressBees Error Details:", {
            status: error.response.status,
            message: error.response.data?.message || 'No message',
            data: error.response.data
          });
          
          // Get fresh token and update cache
          expressBeesToken = await fetchExpressBeesToken();
          
          if (expressBeesToken) {
            try {
              // Second attempt with fresh token
              const retryResponse = await axios.post('https://shipment.xpressbees.com/api/courier/serviceability', requestBody, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${expressBeesToken}`
                }
              });
              
              console.log("retry result in the expressbees", retryResponse.data)
              if (retryResponse.data.status === false) {
                console.log("ExpressBees retry status false:", retryResponse.data.data);
                return false; // Not serviceable
              }
              
              // Check if response has data and it's an array
              if (retryResponse.data.status === true && Array.isArray(retryResponse.data.data)) {
                serviceable = retryResponse.data.data.length > 0;
                console.log("ExpressBees retry API returned data:", retryResponse.data.data);
              } else {
                serviceable = false;
              }
              console.log("ExpressBees retry serviceability result:", serviceable);
              
            } catch (retryError) {
              console.error("❌ Retry attempt also failed:", retryError.message);
              if (retryError.response) {
                console.log("❌ Retry Error Details:", {
                  status: retryError.response.status,
                  message: retryError.response.data?.message || 'No message',
                  data: retryError.response.data
                });
              }
              serviceable = false;
            }
          } else {
            console.log("❌ Failed to get fresh token for retry");
            serviceable = false;
          }
        } else {
          // For other errors, just log and return false
          console.error("❌ ExpressBees serviceability check failed:", error.message);
          if (error.response) {
            console.log("❌ Error Details:", {
              status: error.response.status,
              message: error.response.data?.message || 'No message',
              data: error.response.data
            });
          }
          serviceable = false;
        }
      }
    }
    // Example for Delhivery
    else if (cleanTaggedApi === 'delhivery') {
      const token = process.env.DELHIVERY_STD;
      // console.log("delivery in delivery",djsdjhsdj)
      // Check serviceability for pickup pincode
      const pickupResponse = await axios.get('https://track.delhivery.com/c/api/pin-codes/json/', {
        params: {
          token: token,
          filter_codes: pickupPincode
        }
      });
      console.log("in delhivery servisibility", pickupResponse.data.delivery_codes)
      const isPickupServiceable = pickupResponse.data.delivery_codes.length > 0;

      // Check serviceability for destination pincode
      const destinationResponse = await axios.get('https://track.delhivery.com/c/api/pin-codes/json/', {
        params: {
          token: token,
          filter_codes: destinationPincode
        }
      });
      console.log("in delhivery servisibility", destinationResponse.data.delivery_codes)
      const isDestinationServiceable = destinationResponse.data.delivery_codes.length > 0;

      // Both pincodes must be serviceable
      serviceable = isPickupServiceable && isDestinationServiceable;
    }
    console.log("in the servisibility pincode servise",serviceable)
    return serviceable;
  } catch (error) {
    console.error(`Error checking serviceability for ${taggedApi}:`, error);
    return false; // Treat as non-serviceable on error
  }
}

module.exports = checkServiceability;