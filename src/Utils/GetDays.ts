export const GetLastDays = (num : number)=>{
    const today = new Date();
    let endDay ;
    if(today.getDate() < num){
        endDay = num - today.getDate();
    }else{
        endDay = today.getDate() - num;
    }

    const endDate = new Date(today.getFullYear() , today.getMonth() , endDay + 1);
    
    return endDate;

}


