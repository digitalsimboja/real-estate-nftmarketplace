import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import type { NFTRealEstateMarketplace, EstateNFT } from "../typechain-types/contracts";

let marketplace: NFTRealEstateMarketplace;
let estateNFT: EstateNFT;
let owner: SignerWithAddress;
let seller: SignerWithAddress;
let buyer: SignerWithAddress;


describe("NFTRealEstate", function() {
    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();
        const NFTRealEstateMarketplace = await ethers.getContractFactory("NFTRealEstateMarketplace");
        marketplace = (await NFTRealEstateMarketplace.connect(owner).deploy(
            "0x19e8037e5E8390128DC3da1b2AF4F3fD6a7962Ba"
        )) as NFTRealEstateMarketplace;
        await marketplace.deployed();

        const EstateNFT = await ethers.getContractFactory("EstateNFT");
        estateNFT = (await EstateNFT.connect(owner).deploy(marketplace.address)) as EstateNFT;
        await estateNFT.deployed();
    });

    it("Shoud create a new estate listing and return", async function () {
        let tx = await estateNFT.mint("exampletokenuri");
        await tx.wait();

        tx = await marketplace.createListing(
            estateNFT.address,
            1,
            ethers.utils.parseUnits("1", "ether")
        );

        await tx.wait();

        const allListings = await marketplace.getAllEstateListings();
        expect(allListings.length).to.be.equal(1);
    });

    it("Should transfer EstateNFT to buyer and return NFTs for owner and buyer", async () => {
        let tx = await estateNFT.connect(seller).mint("token1");
        await tx.wait();
        
        tx = await estateNFT.connect(seller).mint("token2");
        await tx.wait();

        tx = await marketplace.connect(seller).createListing(estateNFT.address, 1, ethers.utils.parseUnits("1", "ether"));
        await tx.wait();

        const estateNFTCreated = await marketplace.connect(seller).getAllUserListingsCreated();
        expect(estateNFTCreated.length).to.be.equal(1);

     
        tx = await marketplace.connect(buyer).buyEstate(1, { value: ethers.utils.parseUnits("1.03", "ether") });
        await tx.wait()

        tx = await marketplace.connect(seller).createListing(estateNFT.address, 2, ethers.utils.parseUnits("1", "ether"));
        await tx.wait();

        const userEstateNFTs = await marketplace.connect(buyer).getAllEstateListings();

        console.log("User Estates:", userEstateNFTs);
    })
    
})