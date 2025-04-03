import * as React from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Card, CardMedia } from '@mui/material';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import FileUploader from '@/components/file-uploader';

export interface SimpleDialogProps {
  open: boolean;
  selectedId: number;
  onClose: (id: number) => void;
}

interface ImageUploadProps{
  student: number;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedId, open } = props;
  const handleClose = () => {
    onClose(selectedId);
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth={true}>
      <DialogTitle>Profile Photo</DialogTitle>
      <DialogContent>
        <FileUploader id={selectedId}/>
      </DialogContent>
      <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </Dialog>
  );
}

const ImageUpload: React.FC<ImageUploadProps> = ({ student }) => {
  const apiUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number>(student);

  const handleClickOpen = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleClose = (id: number) => {
    setOpen(false);
    setSelectedId(id);
  };

  return (
    <div>
      <Avatar
        src={`${apiUrl}/images/student-${student}.png`}
        sx={{ cursor: 'pointer' }}
        onClick={() => handleClickOpen(student)}
      />
      <SimpleDialog
        selectedId={selectedId}
        open={open}
        onClose={handleClose}
      />
    </div>
  );
};

export default ImageUpload;
