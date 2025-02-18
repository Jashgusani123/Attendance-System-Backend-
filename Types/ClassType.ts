export interface NewClass {
    subjectName: string;
    collegeName: string;
    departmentName: string;
    location:String;
    semester: number;
    starting: string;
    ending: string;
    createdBy:string,
    allStudent?: string[]; 
    absentStudent?: string[];
    presentStudent?: string[];
}