function findDeadNodes(liveNodes, allNodes) {
    let deadNodes = []

    if (liveNodes.length > 0) {
        for(i = 0; i < allNodes.length; i++) {
            if( !inNodesArr(liveNodes, allNodes[i]) ) {
                deadNodes.push(allNodes[i])
            }  
        }
    }

    if( liveNodes.length === 0) {
        allNodes.forEach( node => {
            deadNodes.push(node)
        })
    } 

    return deadNodes
}

function inNodesArr(liveNodes, node) {
    let found = false    
    liveNodes.forEach( ln => {
        if( ln.ID === node.ID) {
            // console.log(node.Name + " found")
            found = true
        }
    })

    return found
}


module.exports = { findDeadNodes }