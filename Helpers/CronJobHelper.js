const Discord = require('discord.js')
const client = new Discord.Client()
const cron = require('cron');
const { time } = require('console');


module.exports = {
    //error :
    // Error: Field (48) value is out of range
    startJob(dateHalf, timeHalf){
        dateHalf = dateHalf.split("/")
        month = dateHalf[0]
        day = dateHalf[1]
        year = dateHalf[2]

        hour = timeHalf[0]
        minute = timeHalf[1]
        second = timeHalf[2]
        amPM = timeHalf[3]

        var cronJobTime
        var cronJobDate = day + " " + month

        if (amPM == "AM"){
            cronJobTime = second + " " + minute + " " + hour + " "
        }
        else if (amPM = "PM"){
            hour = parseInt(hour, 10)
            hour += 12
            cronJobTime = second + " " + minute + " " + hour.toString() + " "
        }
        
        
        console.log(cronJobTime + cronJobDate)
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
            splitInHalf = dateToClean.split(",")
            
            //date clean
            dateHalf = splitInHalf[0].toString()
            
            //time clean
            timeHalf = splitInHalf[1].toString().slice(1)
            timeHalf = timeHalf.split(":")
            seconds = timeHalf[2]
            timeHalf.pop()
            secondsSplit = seconds.split(" ")
            timeHalf.push(secondsSplit[0], secondsSplit[1])

            this.startJob(dateHalf, timeHalf)
            
            resolve("Cleaned")
        })
    }
}