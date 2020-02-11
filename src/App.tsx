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
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Snackbar from '@material-ui/core/Snackbar';

import { Progress } from './shared/interface/progress';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles({
  root: {
    paddingTop: '50px',
    height: '100vh',
  },
  wrappSelect: {
    height: '100px',
  },
  form: {
    display: 'flex',
    height: 200,
    minWidth: '70%',
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
  formInput: {
    minWidth: '80%',
  },
  folderPath: {
    height: '10px',
  },
  currenProgressInfo: {
    minWidth: '150px',
  },
});

const App: React.FC = () => {
  const classes = useStyles();
  // state
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStartLoading, setIsStartLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [isDownloadDone, setIsDownloadDone] = useState(false);
  const [isAlldDone, setIsAllDone] = useState(false);
  const [percents, setPercents] = useState(0);
  const [open, setOpen] = React.useState(false);
  const [progressState, setProgressState] = React.useState<Progress>();
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
    // INFO FROM PROGRESS VIDOE DOWNLOAD
    ipcRenderer.on('video:info', (e: Electron.IpcRendererEvent, data: any) => {
      setVideoInfo(data.videoInfo);
      setLoading(false);
      setErrorLoading('');

      setProgressState(data.progress);
      setPercents(progressStatPercents(data.progress.timemark, data.videoInfo.duration));
    });
    // END DOWNLOAD
    ipcRenderer.on('video:end', () => {
      setIsStartLoading(false);
      setIsDownloadDone(true);
    });
    // .. ALL DONE
    ipcRenderer.on('post:process-done', () => {
      setIsAllDone(true);
      setIsDownloadDone(false);
      setInputValue('');
    });
    // END MOVE VIDEO TO USER STORAGE.
    ipcRenderer.on('video:download-error', (e: Electron.IpcRendererEvent, error: string) => {
      setErrorLoading(error);
    });
    // GET PATH SAVE FOLDER
    ipcRenderer.on('folder-path', (e: Electron.IpcRendererEvent, folderPath: string) => {
      setFolderPath(folderPath);
    });

  }, []);

  useEffect(() => {

    if (errorLoading.length !== 0) {
      setIsStartLoading(false);
    }
  }, [errorLoading]);

  //
  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  //

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const pickFolder = () => {
    ipcRenderer.send('open-folder-dialog');
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsAllDone(false);
    if (folderPath === '') {
      setOpen(true);
      return false;
    } else {
      setOpen(false);
    }
    if (inputValue.length > 0) {
      setIsDownloadDone(false);
      setLoading(true);
      setIsStartLoading(true);
      ipcRenderer.send('send-ytb-url', inputValue);
    }
  };


  const openSaveFolder = () => {
    ipcRenderer.send('open-saver-folder', folderPath);
  };

  return (
    <div>
      <CssBaseline />
      <Grid
        className={classes.root}
        container
        direction='column'
        justify='flex-start'
        alignItems='center'>
        {/*  ERROR*/}
        {errorLoading.length !== 0 && <Alert className={classes.alert} severity="error">{errorLoading}</Alert>}
        {/* DOWNLOAD SUCCESS */}
        {isDownloadDone &&
        <Alert className={classes.alert} severity="info">Завершение загрузки ....</Alert>}
        {/* ALL DONE */}
        {isAlldDone &&
        <Alert className={classes.alert} severity="success">Загрузка завершена</Alert>}
        {/*  WARRRN EMPY PATH DIRECTORY */}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="warning">
            Выберете папку для сохраненния!
          </Alert>
        </Snackbar>
        <form className={classes.form} noValidate autoComplete='off'>
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
          >
            <TextField
              className={classes.formInput}
              id='standard-basic'
              value={inputValue}
              onChange={handleInputChange}
              label='url'
            />
            <IconButton
              color="primary"
              aria-label="folder"
              onClick={pickFolder}
              component="span">
              <FolderIcon style={{ color: 'brown' }} />
            </IconButton>
          </Grid>
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
            className={classes.folderPath}>
            <span>{folderPath}</span>
            {isAlldDone && <IconButton
              onClick={openSaveFolder}
              color="primary"
              aria-label="folder"
              component="span">
              <FolderOpenIcon />
            </IconButton>}
          </Grid>
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
              <span className={classes.currenProgressInfo}>{percents} %</span>
              <span className={classes.currenProgressInfo}>скорость: {progressState?.currentKbps}/kbps</span>
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
