import React, { useState, useEffect } from 'react';
import moment from 'moment';

//  UI
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import Avatar from '@material-ui/core/Avatar';

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
  alert: {
    position: 'fixed',
    top: 0,
  },
  loadingSection: {
    minHeight: 150,
  },
  progressSection: {
    width: '80%',
    height: '40px',
  },
  progressSectionInfo: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  videoInfo: {
    width: '80%',
    display: 'flex',
    justifyContent: 'space-around',
  },
});

const App: React.FC = () => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStartLoading, setIsStartLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState('');
  const [isDownloadDone, setIsDownloadDone] = useState(false);
  const [percents, setPercents] = useState(0);
  const [videoInfo, setVideoInfo] = useState({
    title: '',
    duration: '',
    avatar: '',
  });

  const progressStatPercents = (ms: number, infoSeconds: number) => {
    const takeMs = moment.duration(ms).asMilliseconds();
    return Math.round((takeMs / (infoSeconds * 1000) * 100));
  };

  useEffect(() => {
    ipcRenderer.on('video:info', (e: Electron.IpcRendererEvent, data: any) => {
      console.log(data);
      setVideoInfo(data.videoInfo);
      setLoading(false);
      setErrorLoading('');

      setPercents(progressStatPercents(data.progress.timemark, data.videoInfo.duration));
    });

    ipcRenderer.on('video:end', () => {
      setIsStartLoading(false);
      setIsDownloadDone(true);
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
    if (inputValue.length > 0) {
      setIsDownloadDone(false);
      setLoading(true);
      setIsStartLoading(true);
      ipcRenderer.send('send-ytb-url', inputValue);
    }
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
        {errorLoading.length !== 0 && <Alert className={classes.alert} severity="error">{errorLoading}</Alert>}
        {/* DOWNLOAD SUCCESS */}
        {isDownloadDone &&
        <Alert className={classes.alert} severity="success">Загрузка завершена</Alert>}
        {/* FORM */}
        <form className={classes.form} noValidate autoComplete='off'>
          <TextField
            id='standard-basic'
            value={inputValue}
            onChange={handleInputChange}
            label='url'
          />
          <Button variant='contained' type='submit' onClick={handleSubmit} disabled={isStartLoading}>
            Загрузить
          </Button>
        </form>
        {/* LOADING STATUS */}
        <div className={classes.progressSection}>
          {loading && <LinearProgress />}
          {isStartLoading && !loading &&
          <div>
            <div className={classes.progressSectionInfo}>
              <span>{percents} %</span>
            </div>
            <LinearProgress variant="determinate" value={percents} />
          </div>
          }
        </div>
        {/* INFO VIDEO URL*/}
        {isStartLoading && !loading && <div className={classes.videoInfo}>
          <Avatar alt={videoInfo.title} src={videoInfo.avatar} />
          <p>{videoInfo.title}</p>
        </div>}
      </Grid>
    </div>
  );
};

export default App;
