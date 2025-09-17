// const logisticsPartners = await mySqlQury(
//     `SELECT 
//         lp.id AS Aggrigator_id, 
//         lp.name, 
//         lp.tagged_api, 
//         lp.volumetric_factor
//      FROM tbl_client_lp clp
//      JOIN tbl_logistics_partner lp ON clp.logictics_partner_id = lp.id
//      JOIN tbl_courier_details cd ON lp.courier_id = cd.id
//      WHERE 
//        clp.client_id = ? 
//        AND clp.status = 1 
//        AND clp.disable_by_superadmin = 0
//        AND LOWER(cd.courier_type) = 'express'
//        ${paymentType?.toLowerCase() === 'cod' ? "AND UPPER(cd.Tagged_api) != 'DTDC'" : ''}`,
//     [clientId]
//   );

//   const forwarderDetails = await mySqlQury(
//     `SELECT
//         lp.courier_id AS Forwarder_id,
//         lp.tagged_api,
//         cd.service_type,
//         cd.service_type AS forwarder_service_type,
//         cd.delhivery_api_variant,
//         cd.volumetric_factor,
//         expws.min_weight,
//         expws.max_weight
//      FROM tbl_logistics_partner lp
//      LEFT JOIN tbl_courier_details cd ON lp.courier_id = cd.id
//      LEFT JOIN tbl_exp_weightslabs expws ON lp.courier_id =expws.courier_id
//      WHERE lp.id = ?`,
//     [partner.Aggrigator_id]
//   );

//   determineForwarderOriginZone
//   calculateVolumetricWeight
//   onst standardTATResult = await mySqlQury(
//     `SELECT days
//      FROM tbl_exp_tat
//      WHERE zone = ? AND courier_id = ?`,
//     [originZone, forwarderId]
//   );

//   calculateAdditionalChargesForwarder

//   calculateVolumetricWeight
//   findRateAggrigator
  calculateAdditionalCharges