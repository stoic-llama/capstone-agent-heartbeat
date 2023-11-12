const { exec } = require('child_process');

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<Array>}
 */

function execShellCommand(cmd) {
    // const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }

            resolve(stdout? parseDockerCommand(stdout) : stderr);
        });
    });
}


/*
parseDockerCommand() returns this array of objects, structure listed below.
    Docker Instance ID __ Docker Instance Name __ Docker Status
    arr[0].ID            arr[0].Name            arr[0].Status
    arr[1].ID            arr[1].Name            arr[1].Status
    ...
*/
function parseDockerCommand(stdout) {
    let str = ''
    let strParsed = []
    let strParsedObj = []
    const rowDivider = 3

    /*
      Translation: 
          1) Take the docker command output (i.e., stdout) and split into array by ___
          2) Then remove the last node since it's empty string
    */
    str = stdout.split('___').filter(o => o.length > 0)
  

    /* 
      Translation: 
          1) Take each node in str, and remove the newline in the beginning of node if present 
          2) Then split into array by __ 
          3) Then remove the last node since it's empty string
    */
    str.forEach( s => {
      var arr = s.trimLeft(s, '\n').split('__').filter(o => o.length > 0)
      arr.forEach(n => strParsed.push(n))
    })

  
    for(i=0; i < strParsed.length; i = i+rowDivider) {
        strParsedObj.push({
            'ID': strParsed[i],
            'Name': strParsed[i+1],
            'Status': strParsed[i+2]
        })
    }

    // console.table(strParsedObj)

    return strParsedObj
}

module.exports = { execShellCommand }