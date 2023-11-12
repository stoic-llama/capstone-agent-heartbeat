require('dotenv').config()

const { execShellCommand } = require('./parsers/getNodeStatus')
const { findDeadNodes } = require('./parsers/getDeadNodes')
const { formattedDateNow } = require('./parsers/getTimestamp')
const axios = require('axios')


// get all nodes, dead or alive
const cmdAll = 'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Status}}___"'
// get only live nodes
const cmdLive = 'docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}___"'

// jenkins URLs
let jenkinsURLs = [] 
let jNames = []
let jUrls = []
const jobs = process.env.CAPSTONE_JENKINS.split(' ___ ');

for(let i=0; i<jobs.length; i++) {
    if(i % 2 === 0) {
        jNames.push(jobs[i])
    } else {
        jUrls.push(jobs[i])
    }
} 

for(let i=0; i<jNames.length; i++) {
    jenkinsURLs.push({
        name: jNames[i],
        url: jUrls[i],        
    })
}

// app level healthcheck URLs
let healthcheckURLs = [] 
let names = []
let urls = []
const apps = process.env.CAPSTONE_APPS.split(' ___ ');

for(let i=0; i<apps.length; i++) {
    if(i % 2 === 0) {
        names.push(apps[i])
    } else {
        urls.push(apps[i])
    }
} 

for(let i=0; i<names.length; i++) {
    healthcheckURLs.push({
        name: names[i],
        url: urls[i],        
    })
}

let allNodes = []
let liveNodes = []
let appResponses = []
let message = {
    agentID: 0,
    contact: '',
    contact_email: '',
    restart: "",
    jenkins: "",
    createdOn: "",
    allNodes: [],
    liveNodes: [],
    deadNodes: [],
    appStatus: [],
}

async function sendStatus() {
    await execShellCommand(cmdAll).then(nodes => { allNodes = nodes })    
    await execShellCommand(cmdLive).then(nodes => { liveNodes = nodes })

    for(i = 0; i<healthcheckURLs.length; i++) {
        await axios.get(healthcheckURLs[i].url).then( res => {
            appResponses.push(res.data)
        }).catch(err => {
            appResponses.push({
                name: healthcheckURLs[i].name,
                message: err.code, //AxiosError Codes
                uptime: '0 seconds',
                timestamp: formattedDateNow()
            })
        })
    }
    
    message.agentID = process.env.CAPSTONE_AGENT_ID
    message.contact = process.env.CAPSTONE_CONTACT_NAME
    message.contact_email = process.env.CAPSTONE_CONTACT_EMAIL
    message.restart = process.env.CAPSTONE_RESTART_URL
    message.jenkins = jenkinsURLs
    message.createdOn = formattedDateNow()
    message.allNodes = allNodes
    message.liveNodes = liveNodes 
    message.deadNodes = findDeadNodes(liveNodes, allNodes) 
    message.appStatus = appResponses 

    let customConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log(message)
    // axios.post(process.env.CAPSTONE_MONITORING_SERVICE, message, customConfig)
    // .catch( (error) => {
    //     console.warn(error)
    // });
}

sendStatus()

// setInterval( () => {
//     console.log("In settimeout loop")
//     sendStatus()
// }, process.env.CAPSTONE_FREQUENCY) // 300000 milliseconds = 5 minutes


