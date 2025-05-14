// SPDX-License-Identifier: Unlicensed
pragma solidity >0.7.0 <=0.9.0;

contract CampaignFactory {
    address[] public deployedCampaigns;

    event campaignCreated(
        string title,
        uint requiredAmount,
        address indexed owner,
        address campaignAddress,
        string imgURI,
        uint indexed timestamp,
        string indexed category
    );

    function createCampaign(
        string memory campaignTitle,
        uint requiredCampaignAmount,
        string memory imgURI,
        string memory category,
        string memory storyURI
    ) public {
        require(requiredCampaignAmount > 0, "Amount must be greater than 0");

        Campaign newCampaign = new Campaign(
            campaignTitle,
            requiredCampaignAmount,
            imgURI,
            storyURI,
            msg.sender,
            category
        );

        deployedCampaigns.push(address(newCampaign));

        emit campaignCreated(
            campaignTitle,
            requiredCampaignAmount,
            msg.sender,
            address(newCampaign),
            imgURI,
            block.timestamp,
            category
        );
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    string public title;
    uint public requiredAmount;
    string public image;
    string public story;
    string public category;
    address payable public owner;
    uint public receivedAmount;

    event Donated(address indexed donor, uint indexed amount, uint indexed timestamp);

    constructor(
        string memory campaignTitle,
        uint requiredCampaignAmount,
        string memory imgURI,
        string memory storyURI,
        address campaignOwner,
        string memory campaignCategory
    ) {
        title = campaignTitle;
        requiredAmount = requiredCampaignAmount;
        image = imgURI;
        story = storyURI;
        category = campaignCategory;
        owner = payable(campaignOwner);
    }

    function donate() public payable {
        require(receivedAmount < requiredAmount, "Campaign fully funded");
        require(msg.value > 0, "Donation must be greater than zero");

        uint amountToAccept = msg.value;
        uint overAmount = 0;

        if (receivedAmount + msg.value > requiredAmount) {
            amountToAccept = requiredAmount - receivedAmount;
            overAmount = msg.value - amountToAccept;
        }

        owner.transfer(amountToAccept);
        receivedAmount += amountToAccept;

        emit Donated(msg.sender, amountToAccept, block.timestamp);

        if (overAmount > 0) {
            payable(msg.sender).transfer(overAmount);
        }
    }
}
