"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLastDays = void 0;
const GetLastDays = (num) => {
    const today = new Date();
    let endDay;
    if (today.getDate() < num) {
        endDay = num - today.getDate();
    }
    else {
        endDay = today.getDate() - num;
    }
    const endDate = new Date(today.getFullYear(), today.getMonth(), endDay + 1);
    return endDate;
};
exports.GetLastDays = GetLastDays;
