const express = require('express');
const jwt = require('jsonwebtoken');
const flash = require('connect-flash');
const {getNestedUserIds ,getNestedUsersByClientIds, getNestedChildClients  } = require('../utility/getNestedUserIds');

// const auth = async (req, res, next) => {
//   try {
//     // Retrieve the token from cookies
//     const token = req.cookies.jwt;
//     console.log("Token from cookies:", token);

//     if (!token) {
//       req.flash("errors", "You Are Not Authorized, Please Login First ...");
//       return res.redirect("/");
//     }

//     // Verify token
//     const decode = await jwt.verify(token, process.env.TOKEN_KEY);

//     // Log expiration
//     if (decode.exp) {
//       const expirationTime = new Date(decode.exp * 1000);
//       console.log("Token Expiration Time:", expirationTime.toLocaleString());
//     }

//     // Attach user data
//     req.user = decode;

//     // Handle selection cookie
//     const rawSelection = req.cookies.selection;
//     req.user.selectedClientId = null;
//     req.user.selectedUserId = null;

//     if (rawSelection) {
//       try {
//         const parsed = JSON.parse(rawSelection);
//         req.user.selectedClientId = parsed.selectedClientId || null;
//         req.user.selectedUserId = parsed.selectedUserId || null;
//       } catch (err) {
//         console.error("Invalid selection cookie:", rawSelection);
//       }
//     }

//     // Check token expiration
//     const currentTime = Math.floor(Date.now() / 1000);
//     if (decode.exp < currentTime) {
//       req.flash("errors", "Session expired, please login again ...");
//       return res.redirect("/");
//     }

//     // -------------------------------
//     // 🚨 Add KYC verification check
 
//     if (!decode.is_kyc_verified) {
//       console.log("User not KYC verified, redirecting to /kyc");
//       return res.redirect("/kyc");
//     }
//     // -------------------------------

//     console.log("req.user in middleware", req.user);
//     next(); // Proceed further
//   } catch (error) {
//     console.error("Auth error:", error);
//     req.flash("errors", "You Are Not Authorized, Please Login First ...");
//     return res.redirect("/");
//   }
// };

const auth = async (req, res, next) => {
  try {
    let token = null;
    let selectedClientId = null;
    let selectedUserId = null;
    let tokenFrom = "cookie"; // default

    // -------------------------------
    // 1️⃣ Check cookies (Web / EJS)
    // -------------------------------
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
      tokenFrom = "cookie";

      const rawSelection = req.cookies.selection;
      if (rawSelection) {
        try {
          const parsed = JSON.parse(rawSelection);
          selectedClientId = parsed.selectedClientId || null;
          selectedUserId = parsed.selectedUserId || null;
        } catch (err) {
          console.error("Invalid selection cookie:", rawSelection);
        }
      }
    }

    // -------------------------------
    // 2️⃣ If no cookies → check headers (App / API)
    // -------------------------------
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      tokenFrom = "header";

      selectedClientId = req.headers["x-selected-client-id"] || null;
      selectedUserId = req.headers["x-selected-user-id"] || null;
    }

    // -------------------------------
    // 3️⃣ If still no token → unauthorized
    // -------------------------------
    if (!token) {
      if (req.headers.authorization) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      } else {
        req.flash?.("errors", "You Are Not Authorized, Please Login First ...");
        return res.redirect("/");
      }
    }

    // -------------------------------
    // 4️⃣ Verify token
    // -------------------------------
    const decode = jwt.verify(token, process.env.TOKEN_KEY);

    // Token expiration check
    const currentTime = Math.floor(Date.now() / 1000);
    if (decode.exp && decode.exp < currentTime) {
      if (tokenFrom === "header") {
        return res.status(401).json({ success: false, message: "Session expired, please login again ..." });
      } else {
        req.flash?.("errors", "Session expired, please login again ...");
        return res.redirect("/");
      }
    }

    // Attach user
    req.user = decode;
    req.user.selectedClientId = selectedClientId;
    req.user.selectedUserId = selectedUserId;

    // -------------------------------
    // 5️⃣ KYC check (skip for superadmin id=1)
    // -------------------------------
    if ((!decode.is_kyc_submitted || !decode.is_kyc_verified) && decode.id != 1) {
      if (tokenFrom === "header") {
        return res.status(403).json({ success: false, message: "KYC verification required" });
      } else {
        console.log("User not KYC verified, redirecting to /kyc");
        return res.redirect("/kyc");
      }
    }

    console.log("Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (req.headers.authorization) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    } else {
      req.flash?.("errors", "You Are Not Authorized, Please Login First ...");
      return res.redirect("/");
    }
  }
};

const kycAuth = async (req, res, next) => {
  try {
    let token = null;
    let tokenFrom = "cookie"; // default assumption

    // -------------------------------
    // 1️⃣ Try cookies (Web / EJS)
    // -------------------------------
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
      tokenFrom = "cookie";
    }

    // -------------------------------
    // 2️⃣ If no cookies → check headers (App / API)
    // -------------------------------
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      tokenFrom = "header";
    }

    // -------------------------------
    // 3️⃣ If still no token → unauthorized
    // -------------------------------
    if (!token) {
      if (tokenFrom === "header") {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      } else {
        req.flash?.("errors", "You Are Not Authorized, Please Login First ...");
        return res.redirect("/");
      }
    }

    // -------------------------------
    // 4️⃣ Verify token
    // -------------------------------
    const decode = jwt.verify(token, process.env.TOKEN_KEY);

    // Log expiration
    if (decode.exp) {
      const expirationTime = new Date(decode.exp * 1000);
      console.log("Token Expiration Time:", expirationTime.toLocaleString());
    }

    // Expiration check
    const currentTime = Math.floor(Date.now() / 1000);
    if (decode.exp && decode.exp < currentTime) {
      if (tokenFrom === "header") {
        return res.status(401).json({ success: false, message: "Session expired, please login again ..." });
      } else {
        req.flash?.("errors", "Session expired, please login again ...");
        return res.redirect("/");
      }
    }

    // -------------------------------
    // 5️⃣ Attach user data
    // -------------------------------
    req.user = decode;
    console.log("KYC Authenticated user:", req.user);

    next();
  } catch (error) {
    console.error("KYC Auth error:", error);
    if (req.headers.authorization) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    } else {
      req.flash?.("errors", "You Are Not Authorized, Please Login First ...");
      return res.redirect("/");
    }
  }
};

const ensureKYCApproved = (req, res, next) => {
    const user = req.user;

    if (!user) {
        req.flash("errors", "Authentication required.");
        return res.redirect('/');
    }

    // ✅ Check only for 'user' role
    if (user.role === 'user' && user.kyc_status !== 'approved') {
        req.flash("errors", "Your KYC is still pending. Please complete it to proceed.");
        return res.redirect('/kyc');  // 🔁 redirect to KYC page
    }

    next(); // 🟢 Allow access
};


module.exports ={ auth,
    ensureKYCApproved,
    kycAuth
}
