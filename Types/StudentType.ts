export interface NewStudent {
    fullName:string,
    email:string,
    password:string,
    collegeName:string,
    enrollmentNumber:string,
    departmentName:string,
    semester:number,
    collegeJoiningDate:string
}
export interface StudentLogin {
    fullName:string,
    email:string,
    password:string,
    enrollmentNumber:string
}

export interface GetStudent {
    Id:string
}