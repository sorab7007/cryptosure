import styled from 'styled-components';
import { FormState } from '../Form';
import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import axios from 'axios';

const FormRightWrapper = () => {
  const Handler = useContext(FormState);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const uploadFiles = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    try {
      // Upload Story to Pinata
      const storyRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: {
            story: Handler.form.story,
          },
        },
        {
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          },
        }
      );
      const storyUrl = `https://gateway.pinata.cloud/ipfs/${storyRes.data.IpfsHash}`;
      Handler.setStoryUrl(storyUrl);

      // Upload Image to Pinata
      if (Handler.image) {
        const formData = new FormData();
        formData.append('file', Handler.image);

        const metadata = JSON.stringify({
          name: Handler.image.name,
        });
        formData.append('pinataMetadata', metadata);

        const imageRes = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            maxBodyLength: 'Infinity',
            headers: {
              'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
              pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
              pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
            },
          }
        );
        const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageRes.data.IpfsHash}`;
        Handler.setImageUrl(imageUrl);
      }

      setUploaded(true);
      Handler.setUploaded(true);
      toast.success("Files Uploaded Successfully");
    } catch (err) {
      console.error('Error uploading files to Pinata:', err);
      toast.error("Upload Failed");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <FormRight>
      <FormInput>
        <FormRow>
          <RowFirstInput>
            <label>Required Amount</label>
            <Input onChange={Handler.FormHandler} value={Handler.form.requiredAmount} name="requiredAmount" type={'number'} placeholder='Required Amount'></Input>
          </RowFirstInput>
          <RowSecondInput>
            <label>Choose Category</label>
            <Select onChange={Handler.FormHandler} value={Handler.form.category} name="category">
              <option>Education</option>
              <option>Health</option>
              <option>Animal</option>
            </Select>
          </RowSecondInput>
        </FormRow>
      </FormInput>
      <FormInput>
        <label>Select Image</label>
        <Image onChange={Handler.ImageHandler} type={'file'} accept='image/*' />
      </FormInput>
      {uploadLoading ? <Button><TailSpin color='#fff' height={20} /></Button> :
        uploaded ?
          <Button style={{ cursor: "no-drop" }}>Files Uploaded Successfully</Button>
          : <Button onClick={uploadFiles}>Upload Files to IPFS</Button>
      }
      <Button onClick={Handler.startCampaign}>
        Start Campaign
      </Button>
    </FormRight>
  );
};

const FormRight = styled.div`
  width:45%;
`

const FormInput = styled.div`
  display:flex;
  flex-direction:column;
  font-family:'poppins';
  margin-top:10px;
`

const FormRow = styled.div`
  display: flex;
  justify-content:space-between;
  width:100%;
`

const Input = styled.input`
  padding:15px;
  background-color:${(props) => props.theme.bgDiv};
  color:${(props) => props.theme.color};
  margin-top:4px;
  border:none;
  border-radius:8px;
  outline:none;
  font-size:large;
  width:100%;
`

const RowFirstInput = styled.div`
  display:flex;
  flex-direction:column;
  width:45%;
`

const RowSecondInput = styled.div`
  display:flex;
  flex-direction:column;
  width:45%;
`

const Select = styled.select`
  padding:15px;
  background-color:${(props) => props.theme.bgDiv};
  color:${(props) => props.theme.color};
  margin-top:4px;
  border:none;
  border-radius:8px;
  outline:none;
  font-size:large;
  width:100%;
`

const Image = styled.input`
  background-color:${(props) => props.theme.bgDiv};
  color:${(props) => props.theme.color};
  margin-top:4px;
  border:none;
  border-radius:8px;
  outline:none;
  font-size:large;
  width:100%;

  &::-webkit-file-upload-button {
    padding: 15px;
    background-color: ${(props) => props.theme.bgSubDiv};
    color: ${(props) => props.theme.color};
    outline:none;
    border:none;
    font-weight:bold;
  }
`

const Button = styled.button`
  display: flex;
  justify-content:center;
  width:100%;
  padding:15px;
  color:white;
  background-color:#00b712;
  background-image:
      linear-gradient(180deg, #00b712 0%, #5aff15 80%);
  border:none;
  margin-top:30px;
  cursor: pointer;
  font-weight:bold;
  font-size:large;
`

export default FormRightWrapper;
