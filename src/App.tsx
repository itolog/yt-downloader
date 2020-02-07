import React, { useState, useEffect } from 'react';

//  UI
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// style
import './App.css';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles({
  // style rule
  root: {
    height: '100vh',
  },
  form: {
    display: 'flex',
    height: 200,
    minWidth: 300,
    maxWidth: 600,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
});

const App: React.FC = () => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [videoInfo, setVideoInfo] = useState({
    title: '',
    duration: '',
    tumbnail: '',
  });

  useEffect(() => {
    ipcRenderer.on('video-info', (e: Electron.IpcRendererEvent, video: any) => {
      console.log(video);
      setVideoInfo(video);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    ipcRenderer.send('send-ytb-url', inputValue);
    // setInputValue('');
  };

  return (
    <div>
      <CssBaseline />
      <Grid
        className={classes.root}
        container
        direction='column'
        justify='center'
        alignItems='center'>
        <form className={classes.form} noValidate autoComplete='off'>
          <TextField
            id='standard-basic'
            value={inputValue}
            onChange={handleInputChange}
            label='url'
          />
          <Button variant='contained' type='submit' onClick={handleSubmit}>
            Загрузить
          </Button>
        </form>
        <List>
          <ListItem>

            <ListItemText primary={videoInfo.title} secondary={videoInfo.duration} />
          </ListItem>

        </List>
      </Grid>
    </div>
  );
};

export default App;
