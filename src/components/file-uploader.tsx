import { Button, Grid, Input, TextField, Avatar, Alert, Stack } from "@mui/material";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import { Card, CardMedia } from '@mui/material';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploaderProps{
    id:number;
}

const FileUploader:React.FC<FileUploaderProps> = ({id}) => {
    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedId, setSelectedId] = useState(id);
    const [fileContent, setFileContent] = useState('');
    function handleFileChange(e: ChangeEvent<HTMLInputElement>){
        if(e.target.files){
            setFile(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                if(e.target && typeof e.target.result === 'string'){
                    setFileContent(e.target.result);
                    const imgElement = document.createElement('img');
                    imgElement.src = e.target.result;
                    imgElement.alt = 'Uploaded Image';
                    imgElement.style.maxWidth = '200px'; // Optional: set a max width for the image
                    imgElement.style.maxHeight = '200px'; // Optional: set a max height for the image
                    imgElement.style.borderRadius = '10px'
                    document.body.appendChild(imgElement); // Append the image to the body
                }
            };
            reader.readAsDataURL(e.target.files[0]); // Or readAsDataURL for images/other types
        }
        
    }
    async function handleFileUpload(){
        if(!file) return;
        setStatus('uploading');
        setUploadProgress(0);
        const formData = new FormData();
        // renaming file name according to id
        const newImageName = `student-${id}.png`
        const renamedFile = new File([file], newImageName, {type: file.type});
        formData.append('file', renamedFile)
        try{
            await axios.post(`${apiUrl}/upload`, formData, {
                headers:{
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(progress);
                }
            });
            setStatus('success');
            setUploadProgress(100);
            setSelectedId(id);
        }catch{
            setStatus('error');
            setUploadProgress(0);
        };
    }
    return (
        <div>
            
            <Stack direction="row" spacing={2}>
                {!file && status === 'idle' && (
                    <Card sx={{ maxWidth: 200 }}>
                        <CardMedia component="img" alt="Example Image"
                            height="200" image={`${apiUrl}/images/student-${selectedId}.png`} />
                    </Card>
                )}

                {fileContent && <img src={fileContent} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius:'18px' }} />}
                
                {status === 'success' && (
                    <Alert severity="success">
                        Profile Photo changed successfully!
                    </Alert>
                )}
                {status === 'error' && (
                    <Alert severity="error">Upload failed, try again!</Alert>
                )}
                <Grid>
                    {
                        !file && (
                            <input type="file" onChange={handleFileChange}/>
                        )
                    }
                    {
                        file && status === 'idle' && (
                            <div className="mb-4 text-sm">
                                <p>File name: {file.name}</p>
                                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                                <p>Type: {file.type}</p>
                            </div>
                        )
                    }
                    {status === 'uploading' && (
                        <div className="spacy-y-2">
                            <div className="h-2.5 w-full rounded-full bg-gray-200">
                                <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                                    style={{width: `${uploadProgress}`}}>
                                </div> 
                            </div>
                            <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
                        </div>
                    )}

                    {file && status != 'success' && <Button variant="contained" onClick={handleFileUpload}>Upload</Button>}
                    
                </Grid>
            </Stack>
        </div>
     );
}

export default FileUploader;