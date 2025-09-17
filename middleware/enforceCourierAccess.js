const { mySqlQury } = require("./db");


// Middleware factory: enforce access by requested type
// const enforceCourierAccess = async (req, res, next) => {
//   try {
//     const clientId = req.user.id;
//     if (clientId ==1 ) return next(); // allow everything

    
//     if (!clientId) {
//       return res.status(400).send('selectedClientId is required');
//     }

//     const rows = await mySqlQury(
//       `SELECT LOWER(k.segment_type) AS segment_type
//        FROM tbl_admin a
//        JOIN kyc_submissions k ON k.user_id = a.id
//        WHERE a.id = ?
//        LIMIT 1`,
//       [clientId]
//     );

//     const allowed = rows?.[0]?.segment_type;

//     if (!allowed) {
//        return res.status(403).render('auth/error-403-alt', {
//           title: 'Access denied',
//           message: `You are not allowed to access the dashboard.`,
         
//           allowedType: allowed
//         });      
//     }

//     // Check against URL path (express/ecom)
//     const requestedType = req.path.includes('express') ? 'express' : 'ecom';

//     if (allowed !== requestedType) {
//      return res.status(403).render('auth/error-403-alt', {
//           title: 'Access denied',
//           message: `You are not allowed to access the "${requestedType}" dashboard.`,
//           requestedType,
//           allowedType: allowed
//         });    
//     }

//     next(); // ✅ allowed
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// };

const enforceCourierAccess = async (req, res, next) => {
  try {
    const userId   = Number(req.user?.id ?? 0);
    const role     = Number(req.user?.role ?? 0);    // 1 = Super Admin
    const level    = Number(req.user?.level ?? 0);   // 4 = client user
    const parentId = Number(req.user?.parent_id ?? 0);

    // Super Admin bypass
    if (userId === 1) return next();

    // ✅ Special case: level=4 & parent_id=1 → super client users → allow both dashboards
    if (level === 4 && parentId === 1) {
      return next();
    }

    // Choose which account to check KYC for (client if level=4, else user)
    const kycOwnerId = (level === 4 && parentId) ? parentId : userId;

    if (!kycOwnerId) {
      return res.status(400).render('auth/error-403-alt', {
        title: 'Access denied',
        message: 'Client linkage is missing. Please contact support.'
      });
    }

    // Fetch latest segment_type
    const rows = await mySqlQury(
      `SELECT LOWER(k.segment_type) AS segment_type
         FROM kyc_submissions k
        WHERE k.user_id = ?
        ORDER BY k.id DESC
        LIMIT 1`,
      [kycOwnerId]
    );

    let allowed = rows?.[0]?.segment_type || null;
    if (allowed === 'ecommerce' || allowed === 'e-com') allowed = 'ecom';
    if (allowed === 'express' || allowed === 'exp') allowed = 'express';

    if (!allowed) {
      return res.status(403).render('auth/error-403-alt', {
        title: 'Access denied',
        message: 'Access not configured for your account. Segment type missing.'
      });
    }

    // Detect which dashboard is requested
    const url = (req.originalUrl || req.url || req.path || '').toLowerCase();
    let requestedType = null;
    if (url.includes('/express')) requestedType = 'express';
    else if (url.includes('/ecom')) requestedType = 'ecom';

    if (!requestedType) {
      return res.status(403).render('auth/error-403-alt', {
        title: 'Access denied',
        message: 'Unable to determine dashboard type from URL.',
        allowedType: allowed
      });
    }

    // Block if mismatch
    if (allowed !== requestedType) {
      return res.status(403).render('auth/error-403-alt', {
        title: 'Access denied',
        message: `You are not allowed to access the "${requestedType}" dashboard.`,
        requestedType,
        allowedType: allowed
      });
    }

    // ✅ Allowed
    return next();
  } catch (err) {
    console.error('[enforceCourierAccess] error:', err);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = enforceCourierAccess;