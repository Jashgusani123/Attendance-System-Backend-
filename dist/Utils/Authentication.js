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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const GetUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const token1 = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a["Admin"]; // Admin token
        const token2 = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b["Teacher"]; // Teacher token
        const token3 = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c["Student"]; // Student token
        if (!token1 && !token2 && !token3) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return; // Stops execution if no tokens are provided
        }
        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables.");
            res.status(500).json({ message: "Internal Server Error: Missing JWT_SECRET" });
            return; // Stops execution if JWT_SECRET is missing
        }
        let decoded = null;
        let userType = null;
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
            return; // Stops execution if decoding fails
        }
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return; // Stops execution on error
    }
});
exports.GetUser = GetUser;
