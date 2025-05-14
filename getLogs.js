const { ethers } = require("ethers");

async function getLogsPaginated(provider, contractAddress, topic, maxBlocks = 100000) {
    const latestBlock = await provider.getBlockNumber();
    const chunkSize = 500; // Maximum block range per request
    let fromBlock = 0;
    let toBlock = Math.min(fromBlock + chunkSize - 1, latestBlock);
    
    let allLogs = [];

    while (fromBlock <= latestBlock && fromBlock <= maxBlocks) { // Limit to maxBlocks
        try {
            console.log(`Fetching logs from block ${fromBlock} to ${toBlock}`);

            // Fetch logs for the current block range
            const logs = await provider.getLogs({
                fromBlock: fromBlock,  // Use direct integers here
                toBlock: toBlock,      // Use direct integers here
                address: contractAddress,
                topics: [topic],
            });

            allLogs.push(...logs);

            // Move to the next chunk of blocks
            fromBlock = toBlock + 1;
            toBlock = Math.min(fromBlock + chunkSize - 1, latestBlock);
        } catch (error) {
            console.error("Error fetching logs:", error);
            break;
        }
    }

    return allLogs;
}

(async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/M9KEhdNu6cxl2wgMAJEk6B-oyRWwWiAF");
    const contractAddress = "0xde49acfbc2092e86d6c520b9aa9ff545e7e697e6";
    const topic = "0xf932d905365211c7f19fda44bcb55b1adbe63365f7cdae1c35ddcb3e38ed1d46"; // Event topic
    
    const logs = await getLogsPaginated(provider, contractAddress, topic, 50000); // Fetch logs up to block 50000
    console.log(logs);
})();
