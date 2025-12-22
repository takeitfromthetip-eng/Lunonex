import React, { useState } from 'react';

const NFTMinter = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [price, setPrice] = useState('');
  const [royalty, setRoyalty] = useState(10);
  const [blockchain, setBlockchain] = useState('ethereum');
  const [minting, setMinting] = useState(false);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(uploadedFile);
    }
  };

  const mintNFT = async () => {
    if (!file || !nftName) {
      alert('Please upload a file and enter a name!');
      return;
    }
    setMinting(true);
    setTimeout(() => {
      alert('NFT Minted Successfully!');
      setMinting(false);
    }, 2000);
  };

  return <div style={{padding:'2rem',color:'white',background:'#0a0a0f',minHeight:'100vh'}}>
    <h1>NFT Minter</h1>
    <input type="file" onChange={handleFileUpload} />
    {preview && <img src={preview} style={{maxWidth:'400px'}} />}
    <input placeholder="NFT Name" value={nftName} onChange={e=>setNftName(e.target.value)} />
    <textarea placeholder="Description" value={nftDescription} onChange={e=>setNftDescription(e.target.value)} />
    <button onClick={mintNFT} disabled={minting}>{minting ? 'Minting...' : 'Mint NFT'}</button>
  </div>;
};

export default NFTMinter;
