const { mySqlQury } = require("../middleware/db");
const calculateChargeValue = require("./calculateChargeValue");

const calculateAdditionalCharges = async (
  clientId,
  total_weight,
  total_boxes,
  paymentType,
  clientBaseRate,
  clientBaseValue,
  invoice,
  cod
) => {
  const additionalChargesQuery = `SELECT * FROM  tbl_exp_lp_additional_charges WHERE lp_id = ? AND charge_name != 'oda_charge'`;
  const additionalChargesResult = await mySqlQury(additionalChargesQuery, [clientId]);
  console.log("additionalChargesResult in the calculateAdditionalCharges in express ", additionalChargesResult);
  console.log("clientBaseRate in the calculateAdditionalCharges in express ", clientBaseRate);
  console.log("clientBaseValuecod ", cod);
  console.log("paymentType ", paymentType);
  // console.log("dhsdjkshds",djsgdsdg)
  let additionalCharge = 0;
  let chargesBreakdown = [];

  if (additionalChargesResult.length > 0) {
    for (const charge of additionalChargesResult) {
      const {
        charge_name,
        calculation_based_on_min,
        calculation_based_on_max,
        condition_based,
        min_value,
        max_value,
        chargable_value_type
      } = charge;
      if (paymentType.toLowerCase() === 'prepaid' && charge_name.toLowerCase().includes('cod')) {
        continue;
      }

      let chargeValue = 0;
      if (condition_based === 'or') {
        console.log("in the or", calculation_based_on_min, min_value, total_weight, total_boxes, clientBaseValue, invoice, cod);
        const minValue = calculateChargeValue(
          calculation_based_on_min,
          min_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        const maxValue = calculateChargeValue(
          calculation_based_on_max,
          max_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        chargeValue = chargable_value_type === 'higher'
          ? Math.max(minValue, maxValue)
          : Math.min(minValue, maxValue);

      } else if (condition_based === 'and') {
        console.log("in the and", calculation_based_on_min, min_value, total_weight, total_boxes, clientBaseValue, invoice, cod);
        const minValue = calculateChargeValue(
          calculation_based_on_min,
          min_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        const maxValue = calculateChargeValue(
          calculation_based_on_max,
          max_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        chargeValue = minValue + maxValue;
      } else {
        // No condition specified - calculate based on min_value only
        console.log("No condition specified - calculating based on min_value only", calculation_based_on_min, min_value, total_weight, total_boxes, clientBaseValue, invoice, cod);
        
        if (calculation_based_on_min && min_value) {
          chargeValue = calculateChargeValue(
            calculation_based_on_min,
            min_value,
            total_weight,
            total_boxes,
            clientBaseRate,
            invoice,
            cod,
            paymentType
          );
        }
      }

      if (chargeValue > 0) {
        additionalCharge += chargeValue;
        chargesBreakdown.push({
          charge_name,
          value: Number(chargeValue.toFixed(2))
        });
      }
    }
  }

  return {
    totalCharge: Number(additionalCharge.toFixed(2)),
    ...(chargesBreakdown.length > 0 && { chargesBreakdown })
  };
};
const calculateAdditionalChargesEcom = async (
  clientId,
  total_weight,
  total_boxes,
  paymentType,
  clientBaseRate,
  clientBaseValue,
  invoice,
  cod
) => {
  console.log("in the calculateAdditionalChargesEcom",clientId,total_weight,total_boxes,paymentType,clientBaseRate,clientBaseValue,invoice,cod)
  const additionalChargesQuery = `SELECT * FROM tbl_ecom_lp_additional_charges WHERE lp_id = ? AND charge_name != 'oda_charge'`;
  const additionalChargesResult = await mySqlQury(additionalChargesQuery, [clientId]);
  console.log("in the aggri gator ecom")
  console.log("additionalChargesResult in the calculateAdditionalCharges in ecom ", additionalChargesResult);

  let additionalCharge = 0;
  let chargesBreakdown = [];

  if (additionalChargesResult.length > 0) {
    for (const charge of additionalChargesResult) {
      const {
        charge_name,
        calculation_based_on_min,
        calculation_based_on_max,
        condition_based,
        min_value,
        max_value,
        chargable_value_type
      } = charge;
      if (charge_name.toLowerCase() === 'cod' && 
          ['prepaid', 'pre-paid'].includes(paymentType?.toLowerCase())) {
        console.log(`Skipping COD charge for ${paymentType} payment type`);
        continue;
      }

      let chargeValue = 0;
      if (condition_based === 'or') {
        console.log("in the or", calculation_based_on_min, min_value, total_weight, total_boxes, clientBaseValue, invoice, cod);
        const minValue = calculateChargeValue(
          calculation_based_on_min,
          min_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        const maxValue = calculateChargeValue(
          calculation_based_on_max,
          max_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        chargeValue = chargable_value_type === 'higher'
          ? Math.max(minValue, maxValue)
          : Math.min(minValue, maxValue);

      } else if (condition_based === 'and') {
        console.log("in the and", calculation_based_on_min, min_value, total_weight, total_boxes, clientBaseValue, invoice, cod);
        const minValue = calculateChargeValue(
          calculation_based_on_min,
          min_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        const maxValue = calculateChargeValue(
          calculation_based_on_max,
          max_value,
          total_weight,
          total_boxes,
          clientBaseRate,
          invoice,
          cod,
          paymentType
        );

        chargeValue = minValue + maxValue;
      } else {
        // No condition specified - calculate based on min_value only
        console.log("No condition specified - calculating based on min_value only", calculation_based_on_min, min_value, total_weight, total_boxes, clientBaseValue, invoice, cod);
        
        if (calculation_based_on_min && min_value) {
          chargeValue = calculateChargeValue(
            calculation_based_on_min,
            min_value,
            total_weight,
            total_boxes,
            clientBaseRate,
            invoice,
            cod,
            paymentType
          );
        }
      }

      if (chargeValue > 0) {
        additionalCharge += chargeValue;
        chargesBreakdown.push({
          charge_name,
          value: Number(chargeValue.toFixed(2))
        });
      }
    }
  }

  return {
    totalCharge: Number(additionalCharge.toFixed(2)),
    ...(chargesBreakdown.length > 0 && { chargesBreakdown })
  };
};
module.exports = {calculateAdditionalCharges,calculateAdditionalChargesEcom}