import axios from 'axios';
import { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { User } from '../types/user';

interface EditUserProps {
  user: User,
  updateUser: Function,
}
function EditUser({ user, updateUser }:EditUserProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageList, setImageList] = useState<FileList | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [editted, setEditted] = useState<boolean>(false);
  useEffect(() => {
    setCurrentImage(user.profilePic);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
  }, [user])
  const uploadImage = async () => {
    setLoading(true);
    const body = new FormData();
    const timestamp = new Date().getTime().toString();

    body.append('timestamp', timestamp);

    const signatureResp = await axios({
      url: "/api/user/signature",
      method: "POST",
      data: {
        timestamp: timestamp,
        file: imageList && imageList[0],
      },
    });
    const secondBody = new FormData();
    secondBody.append('timestamp', timestamp);
    secondBody.append("api_key", '415436178517493');
    secondBody.append("file", imageList && imageList[0] as any);
    secondBody.append("signature", signatureResp.data.signature);
    const payload = await axios({
      url: "http://api.cloudinary.com/v1_1/dss7yz6h0/image/upload",
      method: 'POST',
      data: secondBody,
      headers: { "Content-Type": "multipart/form-data" },
     });
    console.log(payload.data.url);
    const user = await axios({
      method: 'POST',
      url: '/api/user/photo',
      data: {
        url: payload.data.url,
      }
    })
    console.log(user);
    setLoading(false);
    updateUser(user.data.user);
  }

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>) => {
    setImageList(e.target.files)
  }
  const handleSave = async () => {
    setLoading(true);
    const response = await axios.patch('/api/user', {
      firstName,
      lastName,
      email,
    })
    console.log(response.data.user);
    updateUser(response.data.user);
    setLoading(false);
  }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    changeFunction: Function
  ) => {
    setEditted(true);
    changeFunction(e.target.value);
  };
  return (
    <div>
      <h2>Edit Your Details</h2>
      {currentImage && <Avatar src={currentImage} />}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <input type="file" onChange={(e) => handleFile(e)} />
          <button type="button" onClick={uploadImage}>
            Save
          </button>
          <div>
            <TextField
              value={firstName}
              name="FirstName"
              label="First name"
              onChange={(e) => {
                handleChange(e, setFirstName);
              }}
            />
            <TextField
              value={lastName}
              name="LastName"
              label="Last name"
              onChange={(e) => {
                handleChange(e, setLastName);
              }}
            />
            <TextField
              value={email}
              name="Email"
              label="Email"
              onChange={(e) => {
                handleChange(e, setEmail);
              }}
            />
            {editted && <Button type="button" onClick={handleSave}>Save changes!</Button>}
          </div>
        </>
      )}
    </div>
  );
}

export default EditUser;