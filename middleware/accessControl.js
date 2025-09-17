const jwt = require('jsonwebtoken')
const {mappingRoles} = require('../config/mapRoles.js')
const myMap = new Map(Object.entries(mappingRoles));  
const { mySqlQury } = require('./db.js');
const { pathToRegexp, match } = require("path-to-regexp");

const compiledMappings = Object.entries(mappingRoles).map(([key, value]) => {
  const [method, rawPath] = key.split(" ");
  const matcher = match(rawPath, { decode: decodeURIComponent });

  return {
    method,
    matcher: (reqPath) => !!matcher(reqPath), // returns true if matched
    role: value.role,
    level: value.level,
  };
});
 
 
// function accessControlMiddleware(req, res, next) {
//   try {
//     // const token = req.cookies.jwt;

//     // if (!token) {
//     //   console.warn("Access denied: No token found.");
//     //   return res.status(401).render('auth/error-access-control', {
//     //     statusCode: 401,
//     //     title: 'Unauthorized',
//     //     message: 'No token provided. Please login to continue.',
//     //     allowedType: null,
//     //     requestUrl: req.originalUrl
//     //   });
//     // }

//     if (req.user.id === 1) {
//       return next(); // Super admin bypass
//     }

//     const requestMethod = req.method;
//     const requestPath = req.path;

//     const matched = compiledMappings.find(
//       (entry) => entry.method === requestMethod && entry.matcher(requestPath)
//     );

//     if (!matched) {
//       console.warn(`Access denied: No mapping for ${requestMethod} ${requestPath}`);
//       return res.status(404).render('auth/error-access-control', {
//         statusCode: 404,
//         title: 'Not Found',
//         message: `No access mapping for ${requestMethod} ${requestPath}`,
//         allowedType: null,
//         requestUrl: req.originalUrl
//       });
//     }

//     const userRoles = decoded.rolesArray;
//     if (!Array.isArray(userRoles) || userRoles.length === 0) {
//       console.warn("Access denied: User has no roles.");
//       return res.status(403).render('auth/error-access-control', {
//         statusCode: 403,
//         title: 'Access Denied',
//         message: 'You do not have any roles assigned.',
//         allowedType: null,
//         requestUrl: req.originalUrl
//       });
//     }

//     const roleSet = new Set(userRoles);
//     if (!roleSet.has(matched.role)) {
//       console.warn(`Access denied: Missing role '${matched.role}'`);
//       return res.status(403).render('auth/error-access-control', {
//         statusCode: 403,
//         title: 'Access Denied',
//         message: 'You do not have permission to access this resource.',
//         allowedType: matched.role, // show what was expected
//         requestUrl: req.originalUrl
//       });
//     }

//     // Attach matched permission info to req for later use
//     req.permissionInfo = {
//       role: matched.role,
//       level: matched.level,
//     };

//     return next();
//   } catch (error) {
//     console.error("Access Control Middleware Error:", error);
//     return res.status(500).render('auth/error-access-control', {
//       statusCode: 500,
//       title: 'Internal Server Error',
//       message: 'Something went wrong while checking access.',
//       allowedType: null,
//       requestUrl: req.originalUrl
//     });
//   }
// } 

function accessControlMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      console.warn("Access denied: No user found in request.");
      return res.status(401).render('auth/error-access-control', {
        statusCode: 401,
        title: 'Unauthorized',
        message: 'No user context available. Please login to continue.',
        allowedType: null,
        requestUrl: req.originalUrl
      });
    }

    // Super Admin bypass (id = 1)
    if (user.id === 1) {
      return next();
    }

    const requestMethod = req.method;
    const requestPath = req.path;

    const matched = compiledMappings.find(
      (entry) => entry.method === requestMethod && entry.matcher(requestPath)
    );

    if (!matched) {
      console.warn(`Access denied: No mapping for ${requestMethod} ${requestPath}`);
      return res.status(404).render('auth/error-access-control', {
        statusCode: 404,
        title: 'Not Found',
        message: `No access mapping for ${requestMethod} ${requestPath}`,
        allowedType: null,
        requestUrl: req.originalUrl
      });
    }

    const userRoles = user.rolesArray;
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      console.warn("Access denied: User has no roles.");
      return res.status(403).render('auth/error-access-control', {
        statusCode: 403,
        title: 'Access Denied',
        message: 'You do not have any roles assigned.',
        allowedType: null,
        requestUrl: req.originalUrl
      });
    }

    const roleSet = new Set(userRoles);
    if (!roleSet.has(matched.role)) {
      console.warn(`Access denied: Missing role '${matched.role}'`);
      return res.status(403).render('auth/error-access-control', {
        statusCode: 403,
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        allowedType: matched.role,
        requestUrl: req.originalUrl
      });
    }

    // Attach matched permission info to req for later use
    req.permissionInfo = {
      role: matched.role,
      level: matched.level,
    };

    return next();
  } catch (error) {
    console.error("Access Control Middleware Error:", error);
    return res.status(500).render('auth/error-access-control', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Something went wrong while checking access.',
      allowedType: null,
      requestUrl: req.originalUrl
    });
  }
}
module.exports = accessControlMiddleware