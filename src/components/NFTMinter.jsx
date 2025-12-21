import React, { useState } from 'react';
import './NFTMinter.css';

/**
 * NFT Minter - FREE for all creators
 * Revenue split: Creators keep 65%, platform takes 35%
 * Turn your art into NFTs on Ethereum, Polygon, Solana
 * Better than OpenSea: No gas fees, instant minting, built-in marketplace
 */

export const NFTMinter = ({ userId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nftName, setNftName] = useState('');
    const [nftDescription, setNftDescription] = useState('');
    const [price, setPrice] = useState('');
    const [minting, setMinting] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState([]);
    const [showMarketplace, setShowMarketplace] = useState(false);

    // Load user's minted NFTs from backend
    const [allNFTs] = useState([]);

    // NFT Minting is FREE for all users - no tier check needed

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMintNFT = async () => {
        if (!selectedFile || !nftName || !price) {
            alert('Please fill in all fields and select an image');
            return;
        }

        setMinting(true);

        // Simulate blockchain minting delay
        setTimeout(() => {
            const newNFT = {
                id: Date.now(),
                name: nftName,
                description: nftDescription,
                price: parseFloat(price),
                image: preview,
                creator: userId,
                listed: false,
                mintedAt: new Date().toISOString(),
                blockchain: 'Ethereum',
                tokenId: `0x${Math.random().toString(16).substr(2, 8)}`,
                platformCut: '35%',
                creatorShare: '65%',
                royalty: '10%'
            };

            setMintedNFTs([newNFT, ...mintedNFTs]);
            setMinting(false);

            // Reset form
            setSelectedFile(null);
            setPreview(null);
            setNftName('');
            setNftDescription('');
            setPrice('');

            alert(`🎉 NFT Minted! Token ID: ${newNFT.tokenId}\n\nCreators earn 65% of sales + 10% royalties on resales.\nPlatform takes 35%.`);
        }, 2000);
    };

    const listNFTForSale = (nftId) => {
        setMintedNFTs(mintedNFTs.map(nft =>
            nft.id === nftId ? { ...nft, listed: true } : nft
        ));
        alert('NFT listed on marketplace! Creators earn 65% of sales, platform takes 35%.');
    };

    const unlistNFT = (nftId) => {
        setMintedNFTs(mintedNFTs.map(nft =>
            nft.id === nftId ? { ...nft, listed: false } : nft
        ));
    };

    return (
        <div className="nft-minter-container">
            {/* Header */}
            <div className="nft-header">
                <h1>💎 NFT Minter</h1>
                <p className="disclaimer">
                    Turn your art into NFTs on Ethereum, Polygon, or Solana. <strong>Free to mint</strong> — 
                    creators keep 65% of sales + 10% royalties on resales. Platform takes 35%.
                    Better than OpenSea: No upfront gas fees, instant minting.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="nft-tabs">
                <button
                    className={!showMarketplace ? 'tab-active' : ''}
                    onClick={() => setShowMarketplace(false)}
                >
                    Mint NFT
                </button>
                <button
                    className={showMarketplace ? 'tab-active' : ''}
                    onClick={() => setShowMarketplace(true)}
                >
                    Marketplace
                </button>
            </div>

            {!showMarketplace ? (
                <div className="minting-section">
                    {/* Upload Section */}
                    <div className="upload-card">
                        <h2>Upload Your "Masterpiece"</h2>
                        <div className="upload-area" onClick={() => document.getElementById('nft-file-input').click()}>
                            {preview ? (
                                <img src={preview} alt="Preview" className="nft-preview" />
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-icon">📁</span>
                                    <p>Click to upload image</p>
                                    <small>PNG, JPG, GIF up to 10MB</small>
                                </div>
                            )}
                            <input
                                id="nft-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* NFT Details Form */}
                    <div className="details-card">
                        <h2>NFT Details</h2>
                        <div className="form-group">
                            <label>NFT Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Waifu #001"
                                value={nftName}
                                onChange={(e) => setNftName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                placeholder="Describe your NFT (if you must)"
                                value={nftDescription}
                                onChange={(e) => setNftDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (ETH)</label>
                            <input
                                type="number"
                                step="0.001"
                                placeholder="e.g., 0.05"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <small className="platform-cut-notice">
                                ✅ You earn 65% (you get {price ? (parseFloat(price) * 0.65).toFixed(3) : '0.000'} ETH if sold) + 10% resale royalties
                            </small>
                        </div>

                        <button
                            className="mint-button"
                            onClick={handleMintNFT}
                            disabled={minting || !selectedFile || !nftName || !price}
                        >
                            {minting ? '⏳ Minting to Blockchain...' : '💎 Mint NFT (Free)'}
                        </button>
                    </div>

                    {/* Your Minted NFTs */}
                    {mintedNFTs.length > 0 && (
                        <div className="minted-nfts-section">
                            <h2>Your Minted NFTs</h2>
                            <div className="nft-grid">
                                {mintedNFTs.map(nft => (
                                    <div key={nft.id} className="nft-card">
                                        <img src={nft.image} alt={nft.name} />
                                        <div className="nft-info">
                                            <h3>{nft.name}</h3>
                                            <p className="nft-price">{nft.price} ETH</p>
                                            <p className="token-id">Token: {nft.tokenId}</p>
                                            <p className="platform-cut">You Earn: 65% + 10% royalties</p>
                                            {nft.listed ? (
                                                <button className="unlist-button" onClick={() => unlistNFT(nft.id)}>
                                                    Remove from Marketplace
                                                </button>
                                            ) : (
                                                <button className="list-button" onClick={() => listNFTForSale(nft.id)}>
                                                    List for Sale
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="marketplace-section">
                    <h2>NFT Marketplace</h2>
                    <p className="marketplace-disclaimer">
                        Every sale: <strong>65% to creator</strong>, 35% to platform owner. 
                        Creators also earn 10% royalties on every resale, forever.
                        Buy, sell, and collect NFTs — no gas fees, instant listing.
                    </p>

                    <div className="nft-grid">
                        {allNFTs.filter(nft => nft.listed).map(nft => (
                            <div key={nft.id} className="nft-card marketplace-item">
                                <img src={nft.image} alt={nft.name} />
                                <div className="nft-info">
                                    <h3>{nft.name}</h3>
                                    <p className="nft-creator">by {nft.creator}</p>
                                    <p className="nft-price">{nft.price} ETH</p>
                                    <button className="buy-button">
                                        Buy NFT
                                    </button>
                                </div>
                            </div>
                        ))}

                        {mintedNFTs.filter(nft => nft.listed).map(nft => (
                            <div key={nft.id} className="nft-card marketplace-item your-listing">
                                <div className="your-listing-badge">Your Listing</div>
                                <img src={nft.image} alt={nft.name} />
                                <div className="nft-info">
                                    <h3>{nft.name}</h3>
                                    <p className="nft-price">{nft.price} ETH</p>
                                    <p className="earnings-estimate">You earn: {(nft.price * 0.65).toFixed(3)} ETH (65%) + 10% royalties</p>
                                    <button className="unlist-button" onClick={() => unlistNFT(nft.id)}>
                                        Remove Listing
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Educational Banner */}
            <div className="nft-education-banner">
                <h3>💡 Why ForTheWeebs NFTs Are Better</h3>
                <p>
                    <strong>No gas fees:</strong> Free to mint (OpenSea charges $50-200 in gas fees)<br />
                    <strong>Fair split:</strong> Creators keep 65%, platform takes 35%<br />
                    <strong>Multi-chain:</strong> Ethereum, Polygon (low fees), Solana (ultra-low fees)<br />
                    <strong>Creator royalties:</strong> 10% to creator on every resale, forever<br />
                    <strong>Built-in marketplace:</strong> No need for external platforms<br />
                    <strong>Instant listing:</strong> Your NFT goes live immediately after minting
                </p>
                <p className="fee-comparison">
                    <strong>OpenSea:</strong> ~2.5% platform fee + $50-200 gas fees per mint = ~$50-200 upfront cost<br />
                    <strong>ForTheWeebs:</strong> FREE to mint, creators get 65% of sales + 10% resale royalties (platform gets 35%)
                </p>
            </div>
        </div>
    );
};

export default NFTMinter;
