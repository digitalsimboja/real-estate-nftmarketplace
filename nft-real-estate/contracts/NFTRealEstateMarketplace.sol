// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract NFTRealEstateMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _tokenTotalListings;  // Starts from 0
    Counters.Counter private _estateListingSold; // Starts from 0

    address payable private owner;
    address payable private _regulatorAccount;

    uint64 public regulatorCommission = 2;
    uint64 public realEstateCommission = 1;

    
    // Define a mapping of id to the NFT Market 
    mapping(uint256 => Listing) private listings;

    //structs
    struct Listing {
        uint256 listingId;
        uint256 price;
        address payable seller;
        address owner;
        address assetContract;
        uint256 tokenId;
        bool sold;
    }

    /* === EVENTS === */
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed assetContract,
        uint256 price,
        address seller,
        address owner,
        bool sold
    );

    event ListingPurchased(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed assetContract,
        uint256 price,
        address seller,
        address buyer,
        bool sold
    );

    event ListingPriceUpdated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed assetContract,
        uint256 price,
        address seller
    );

    event ListingCancelled(
        uint256 listingId,
        uint256 tokenId,
        address seller
    );

    /* === CONSTRUCTOR === */
    constructor(address regulatorAccount) {
        // Initialize the owner to be the account that deployed the contract
        // Initialize the regulators or government account
        owner = payable(msg.sender);
        _regulatorAccount = payable(regulatorAccount);
    }

    // create new listing
    function createListing(
        address assetContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        _tokenTotalListings.increment();
        uint256 newTokenListingId = _tokenTotalListings.current();

        listings[newTokenListingId]  = Listing(
            newTokenListingId,
            price,
            payable(msg.sender),
            payable(address(0)),
            assetContract,
            tokenId,
            false           
        );

        // transfer the asset to this contract
        ERC721(assetContract).transferFrom(msg.sender, address(this), tokenId);

        emit ListingCreated(
            newTokenListingId,
            tokenId,
            assetContract,
            price,
            msg.sender,
            address(0),
            false

        );

    }

    // Buy or Sell Estate
    function buyEstate(uint256 listingId) external payable nonReentrant {
        require(msg.sender != address(0), "Address should not be 0");

        // Fetch the Listing from storage using the listingId
        Listing storage listing = listings[listingId];
        require(listing.listingId == listingId, "Property does not exist");
        require(listing.sold == false, "Property is not available for sale");

        // calculate and add the commissions accordingly
        uint256 realEstateCommisionCalculated = listing.price.mul(realEstateCommission).div(100);
        uint256 regulatorCommissionCalculated = listing.price.mul(regulatorCommission).div(100);

        uint256 requiredAmount = listing.price.add(realEstateCommisionCalculated).add(realEstateCommisionCalculated);

        require(msg.value >= requiredAmount, "Insuffient amount sent");

        // transfer ownership
        listing.owner = msg.sender;

        // Commisions are paid to regulators
        _regulatorAccount.transfer(regulatorCommissionCalculated.mul(2));

        // Buyer pays the estate commision
        owner.transfer(realEstateCommisionCalculated);

        // Send the price less the commissions to the seller
        listing.seller.transfer(listing.price.sub(regulatorCommissionCalculated));

        // Transfer asset
        IERC721(listing.assetContract).transferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );

        _estateListingSold.increment();

        emit ListingPurchased(
            listingId,
            listing.tokenId,
            listing.assetContract,
            listing.price,
            listing.seller,
            msg.sender,
            true

        );


    }

    // Get all estate listings
    function getAllEstateListings() external view returns (Listing[] memory) {
        uint256 totalListingCount = _tokenTotalListings.current();
        uint256 unsoldListingCount = _tokenTotalListings.current() - _estateListingSold.current();

        Listing[] memory activeListings = new Listing[](unsoldListingCount);

        uint256 index = 0;

        for (uint256 i = 0; i < totalListingCount; i++) {
            if (listings[i + 1].owner == address(0)) {
                activeListings[index] = listings[listings[i + 1].listingId];
                index += 1;
            }
        }

        return activeListings;
    }

    // Return a user's listing
    function getUserListings() public view returns (Listing[] memory) {
        uint256 totalListingCount = _tokenTotalListings.current();
        uint256 itemCount = 0;
        uint256 index = 0;

        // Find listings belonging to this user
        for (uint256 i = 0; i < totalListingCount; i++) {
            if (listings[i + 1].owner == msg.sender) {
                itemCount +=1;
            }
        }
        // create a list of user's counts of items and return each item from the list
        Listing[] memory items = new Listing[](itemCount);
        for (uint256 i = 0; i < totalListingCount; i++) {
            uint256 currentId = i + 1;
            items[index] =  listings[currentId];
            index += 1;

        }
        return items;

    }

    // Return Listings created by a particular user
    function getAllUserListingsCreated() public view returns (Listing[] memory) {
        uint256 totalListingCount = _tokenTotalListings.current();
        uint256 itemCount = 0;
        uint256 index = 0;

        // Count the users Listings
        for (uint256 i = 0; i < totalListingCount; i++) {
            if (listings[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }
        Listing[] memory items = new Listing[](itemCount);
        for (uint256 i = 0; i < totalListingCount; i++) {
            if (listings[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                items[index] = listings[currentId];
                index += 1;
            }
        }
        return items;
    }

    function getSpecificListing(uint256 listingId) public view returns (Listing memory) {
        return listings[listingId];
    }

    function updateListing(uint256 listingId, uint256 tokenId, address assetContract, uint256 newPrice) external payable  nonReentrant{
        require(listings[listingId].seller == msg.sender, "Only the creator is authorized");
        require(listings[listingId].assetContract == assetContract, "Wrong contract address");
        require(listings[listingId].tokenId == tokenId, "Wrong listing");

       // Fetch the Listing from storage using the listingId
        Listing storage listing = listings[listingId];
        listing.price = newPrice;

        emit ListingPriceUpdated(
            listingId,
            tokenId,
            assetContract,
            newPrice,
            msg.sender
        );

    }

    function removeListing(uint256 listingId, uint256 tokenId, address assetContract) external payable nonReentrant {
        require(listings[listingId].seller == msg.sender, "Only the creator is authorized");
        require(listings[listingId].assetContract == assetContract, "Wrong contract address");
        require(listings[listingId].tokenId == tokenId, "Wrong listing");

        delete listings[listingId];

        emit ListingCancelled(
            listingId,
            tokenId,
            msg.sender
        );

    }

    function getAllListingCounts() public view returns (uint256) {
        uint256 totalListingCount = _tokenTotalListings.current();
        return totalListingCount;
    }

    function getListingsSold() public view returns (uint256) {
        uint256 totalListingsSold = _estateListingSold.current();

        return totalListingsSold;
    }

    // To Do
    // function getUserWithMaximumListing() public view returns (uint256) {
        
    // }



}
