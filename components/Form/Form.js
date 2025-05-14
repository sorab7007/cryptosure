import styled from 'styled-components';
import FormLeftWrapper from './Components/FormLeftWrapper';
import FormRightWrapper from './Components/FormRightWrapper';
import { createContext, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import CampaignFactory from '../../artifacts/contracts/Campaign.sol/CampaignFactory.json';

const FormState = createContext();

const Form = () => {
  const [form, setForm] = useState({
    campaignTitle: '',
    story: '',
    requiredAmount: '',
    category: 'education'
  });

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [storyUrl, setStoryUrl] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [image, setImage] = useState(null);

  const FormHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const ImageHandler = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const startCampaign = async (e) => {
    e.preventDefault();

    if (!form.campaignTitle.trim()) return toast.warn('Title Field is empty');
    if (!form.story.trim()) return toast.warn('Story Field is empty');
    if (!form.requiredAmount || isNaN(form.requiredAmount)) return toast.warn('Required Amount is invalid');
    if (!uploaded) return toast.warn('Files must be uploaded first');

    try {
      setLoading(true);

      if (!imageUrl || !storyUrl) {
        toast.error('IPFS upload failed — URLs are missing');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = provider.getSigner();

      const factoryAddress = process.env.NEXT_PUBLIC_ADDRESS;

      if (!factoryAddress) {
        toast.error('Contract address not found in environment variables');
        return;
      }

      const contract = new ethers.Contract(
        factoryAddress,
        CampaignFactory.abi,
        signer
      );

      const CampaignAmount = ethers.utils.parseEther(form.requiredAmount);

      const tx = await contract.createCampaign(
        form.campaignTitle,
        CampaignAmount,
        imageUrl,
        form.category,
        storyUrl
      );

      const receipt = await tx.wait();

      const campaignAddress = receipt.events?.[0]?.args?.campaignAddress;
      setAddress(campaignAddress || 'Campaign created successfully');
      toast.success('Campaign started!');
    } catch (error) {
      console.error('Campaign error:', error);
      toast.error(error?.reason || 'Failed to start campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormState.Provider value={{
      form,
      setForm,
      image,
      setImage,
      ImageHandler,
      FormHandler,
      setImageUrl,
      setStoryUrl,
      startCampaign,
      setUploaded
    }}>
      <FormWrapper>
        <FormMain>
          {loading ? (
            address === '' ? (
              <Spinner>
                <TailSpin height={60} />
              </Spinner>
            ) : (
              <Address>
                <h1>Campaign Started Successfully!</h1>
                <h2>{address}</h2>
                <Button onClick={() => window.location.href = '/campaigns'}>
                  Go To Campaigns
                </Button>
              </Address>
            )
          ) : (
            <FormInputsWrapper>
              <FormLeftWrapper />
              <FormRightWrapper />
            </FormInputsWrapper>
          )}
        </FormMain>
      </FormWrapper>
    </FormState.Provider>
  );
};

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FormMain = styled.div`
  width: 80%;
`;

const FormInputsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 45px;
`;

const Spinner = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Address = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.bgSubDiv};
  border-radius: 8px;
  padding: 2rem;
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  width: 30%;
  padding: 15px;
  color: white;
  background-color: #00b712;
  background-image: linear-gradient(180deg, #00b712 0%, #5aff15 80%);
  border: none;
  margin-top: 30px;
  cursor: pointer;
  font-weight: bold;
  font-size: large;
`;

export default Form;
export { FormState };
