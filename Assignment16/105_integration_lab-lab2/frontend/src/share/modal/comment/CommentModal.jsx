import { Box, Button, Card, Modal, TextField } from '@mui/material';
import React, { useState, useEffect, useContext } from 'react';
import { useKeyDown } from '../../../hooks/useKeyDown';
import CommentCard from './components/CommentCard';
import Axios from '../../AxiosInstance';
import GlobalContext from '../../Context/GlobalContext';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';

const CommentModal = ({ open = false, handleClose = () => {} }) => {
  const { setStatus } = useContext(GlobalContext);
  const [textField, setTextField] = useState('');
  const [textFieldError, setTextFieldError] = useState('');
  const [comments, setComments] = useState([]);

  useKeyDown(() => {
    handleAddComment();
  }, ['Enter']);

  useEffect(() => {
    const userToken = Cookies.get('UserToken');
    if (userToken !== undefined && userToken !== 'undefined') {
      Axios.get('/comment', { headers: { Authorization: `Bearer ${userToken}` } })
        .then((res) => {
          setComments(res.data.data.map((el) => ({ id: el.id, msg: el.text })));
        })
        .catch((error) => {
          setStatus({
            msg: error.message || 'Failed to fetch comments',
            severity: 'error',
          });
        });
    }
  }, [setStatus]);

  const handleAddComment = async () => {
    if (!validateForm()) return;
    try {
      const userToken = Cookies.get('UserToken');
      const response = await Axios.post(
        '/comment',
        { text: textField },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (response.data.success) {
        setStatus({ severity: 'success', msg: 'Comment created successfully' });
        setComments((prevComments) => [...prevComments, { id: response.data.data.id, msg: textField }]);
        setTextField('');
      }
    } catch (error) {
      setTextField('');
      if (error instanceof AxiosError && error.response) {
        setStatus({
          msg: error.response.data.error || 'Failed to create comment',
          severity: 'error',
        });
      } else {
        setStatus({
          msg: error.message || 'Failed to create comment',
          severity: 'error',
        });
      }
    }
  };

  const validateForm = () => {
    if (!textField) {
      setTextFieldError('Comment is required');
      return false;
    }
    setTextFieldError('');
    return true;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          width: { xs: '60vw', lg: '40vw' },
          maxWidth: '600px',
          maxHeight: '400px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          backgroundColor: '#ffffffCC',
          p: '2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <TextField
            value={textField}
            onChange={(e) => setTextField(e.target.value)}
            fullWidth
            error={textFieldError !== ''}
            helperText={textFieldError}
            placeholder="Type your comment"
            variant="standard"
          />
          <Button onClick={handleAddComment}>Submit</Button>
        </Box>
        <Box
          sx={{
            overflowY: 'scroll',
            maxHeight: 'calc(400px - 2rem)',
            '&::-webkit-scrollbar': {
              width: '.5rem', // chromium and safari
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#999999',
              borderRadius: '10px',
            },
          }}
        >
          {comments.map((comment) => (
            <CommentCard comment={comment} key={comment.id} setComments={setComments} />
          ))}
        </Box>
      </Card>
    </Modal>
  );
};

export default CommentModal;
