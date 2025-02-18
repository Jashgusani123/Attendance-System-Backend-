"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
// export const IsLoggedin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const token = req.cookies?.["Access"]; // Ensure `req.cookies` exists
//     if (!token) {
//       res.status(401).json({ message: "Unauthorized: No token provided" });
//       return; // Ensures function stops execution
//     }
//     // Ensure JWT_SECRET is defined
//     if (!process.env.JWT_SECRET) {
//       console.error("JWT_SECRET is missing from environment variables.");
//       res.status(500).json({ message: "Internal Server Error: Missing JWT_SECRET" });
//       return; // Ensures function stops execution
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET) as { _id: string };
//     req.Id = decoded._id; // Assign user ID from token
//     req.isLoggedIn = true;
//     next(); // Ensure function proceeds to next middleware
//   } catch (error) {
//     console.error("JWT Verification Error:", error);
//     res.status(401).json({ message: "Unauthorized: Invalid token" });
//     return; // Ensures function stops execution
//   }
// };
var GetUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token1, token2, token3, decoded, userType;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        try {
            token1 = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a["Admin"];
            token2 = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b["Teacher"];
            token3 = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c["Student"];
            if (!token1 && !token2 && !token3) {
                res.status(401).json({ message: "Unauthorized: No token provided" });
                return [2 /*return*/]; // Stops execution if no tokens are provided
            }
            // Ensure JWT_SECRET is defined
            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is missing from environment variables.");
                res.status(500).json({ message: "Internal Server Error: Missing JWT_SECRET" });
                return [2 /*return*/]; // Stops execution if JWT_SECRET is missing
            }
            decoded = null;
            userType = null;
            // Decode the token based on which one is available
            if (token1) {
                decoded = jsonwebtoken_1.default.verify(token1, process.env.JWT_SECRET);
                userType = "Admin";
            }
            else if (token2) {
                decoded = jsonwebtoken_1.default.verify(token2, process.env.JWT_SECRET);
                userType = "Teacher";
            }
            else if (token3) {
                decoded = jsonwebtoken_1.default.verify(token3, process.env.JWT_SECRET);
                userType = "Student";
            }
            // If a decoded user exists, assign the values to the request and proceed
            if (decoded && userType) {
                req.Id = decoded._id; // Assign the user ID
                req.isLoggedIn = true; // Mark the user as logged in
                req.type = userType; // Assign the user type (Admin/Teacher/Student)
                next(); // Proceed to the next middleware
            }
            else {
                res.status(401).json({ message: "Unauthorized: Invalid token" });
                return [2 /*return*/]; // Stops execution if decoding fails
            }
        }
        catch (error) {
            console.error("JWT Verification Error:", error);
            res.status(401).json({ message: "Unauthorized: Invalid token" });
            return [2 /*return*/]; // Stops execution on error
        }
        return [2 /*return*/];
    });
}); };
exports.GetUser = GetUser;
