import React, { useState, useEffect } from 'react';
import moment from 'moment';

//  UI
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
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
  error: {
    position: 'fixed',
    top: 0,
  },
  loadingSection: {
    minHeight: 150,
  }
});

const App: React.FC = () => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [startLoading, setStartLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState('');
  const [percents, setPercents] = useState(0);
  const [videoInfo, setVideoInfo] = useState({
    title: '',
    duration: '',
    tumbnail: '',
  });

  const progressStatPercents = (ms: number, infoSeconds: number) => {
    const takeMs = moment.duration(ms).asMilliseconds();
    return Math.round((takeMs / (infoSeconds * 1000) * 100))
  };

  useEffect(() => {
    ipcRenderer.on('video:info', (e: Electron.IpcRendererEvent, data: any) => {
      console.log(data);
      setVideoInfo(data.videoInfo);
      setStartLoading(false);
      setErrorLoading('');

      setPercents(progressStatPercents(data.progress.timemark, data.videoInfo.duration))
    });

    ipcRenderer.on('video:download-error', (e: Electron.IpcRendererEvent, error: string) => {
      setErrorLoading(error);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setStartLoading(true);
    ipcRenderer.send('send-ytb-url', inputValue);
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
        {/*  ERROR*/}
        {errorLoading.length !== 0 && <Alert className={classes.error} severity="error">{errorLoading}</Alert>}
        {/* FORM */}
        <form className={classes.form} noValidate autoComplete='off'>
          <TextField
            id='standard-basic'
            value={inputValue}
            onChange={handleInputChange}
            label='url'
          />
          <span>{percents} %</span>
          <Button variant='contained' type='submit' onClick={handleSubmit}>
            Загрузить
          </Button>
        </form>
        {/* LOADER */}
        <div className={classes.loadingSection}>
          {startLoading && <CircularProgress  color="secondary" />}
          <LinearProgress variant="determinate" value={10} />
        </div>
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
