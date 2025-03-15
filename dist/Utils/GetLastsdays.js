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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDays = void 0;
const GetDays = (numberOfDay) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const day = today.getDate();
    let lastDays;
    if (today.getDate() < numberOfDay) {
        lastDays = numberOfDay - day;
    }
    else {
        lastDays = day - numberOfDay;
    }
    const newDate = new Date(today.getFullYear(), today.getMonth(), lastDays + 1);
    return newDate;
});
exports.GetDays = GetDays;
const d = (0, exports.GetDays)(10);
d.then((res) => console.log(res.toISOString())).catch((err) => console.log(err));
