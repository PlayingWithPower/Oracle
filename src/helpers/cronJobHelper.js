const bootstrap = require('../bootstrap')


module.exports = {
    //error :
    // Error: Field (48) value is out of range
    startJob(dateHalf, timeHalf){
        dateHalf = dateHalf.split("/");
        let month = dateHalf[0];
        let day = dateHalf[1];
        let year = dateHalf[2];

        let hour = timeHalf[0];
        let minute = timeHalf[1];
        let second = timeHalf[2];
        let amPM = timeHalf[3];

        let cronJobTime;
        let cronJobDate = day + " " + month;

        if (amPM === "AM"){
            cronJobTime = second + " " + minute + " " + hour + " "
        }
        else if (amPM == "PM"){
            hour = parseInt(hour, 10);
            hour += 12;
            cronJobTime = second + " " + minute + " " + hour.toString() + " "
        }
        
        
        console.log(cronJobTime + cronJobDate);
        let startSeason = new cron.CronJob(cronJobTime + cronJobDate, this.jobToExectute); 
        startSeason.start()
    },
    pauseJob(){

    },
    jobToExectute(){
        console.log("WOOT")
    },
    async cleanJobFormat(dateToClean){
        return new Promise((resolve, reject)=>{
            let splitInHalf = dateToClean.split(",");
            
            //date clean
            let dateHalf = splitInHalf[0].toString();
            
            //time clean
            let timeHalf = splitInHalf[1].toString().slice(1);
            timeHalf = timeHalf.split(":");
            let seconds = timeHalf[2];
            timeHalf.pop();
            let secondsSplit = seconds.split(" ");
            timeHalf.push(secondsSplit[0], secondsSplit[1]);

            this.startJob(dateHalf, timeHalf);
            
            resolve("Cleaned")
        })
    }
}