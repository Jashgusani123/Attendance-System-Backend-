export interface NewTeacher {
    fullName:string,
    email:string,
    password:string,
    collegeName:string,
    departmentName:string,
}
export interface TeacherLogin {
    fullName:string,
    email:string,
    password:string,
}

export interface GetTeacher {
    Id:string
}