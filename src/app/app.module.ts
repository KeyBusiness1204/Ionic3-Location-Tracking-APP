import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder} from '@ionic-native/native-geocoder';
import { BackgroundGeolocation} from '@ionic-native/background-geolocation';
import { Facebook } from '@ionic-native/facebook';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { Camera } from '@ionic-native/camera';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Badge } from '@ionic-native/badge';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { ImagePage } from '../pages/image/image';
import { MapPage } from '../pages/map/map';
import { InviterPage } from '../pages/inviter/inviter';
import { AboutPage } from '../pages/about/about';
import { DetailImgPage } from '../pages/detail-img/detail-img';
import { IntervalPage } from '../pages/setting/interval/interval';
import { TimeoutPage } from '../pages/setting/timeout/timeout';
import { GpsPage } from '../pages/setting/gps/gps';
import { UsersPage} from '../pages/users/users';
import { FriendsPage} from '../pages/friends/friends';

import { LocationTrackerProvider } from '../providers/location-tracker/location-tracker';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { SettingProvider } from '../providers/setting/setting';
import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';

var firebaseConfig = {
  apiKey: "AIzaSyAGUMsfAwQCryeU-qX4ssc-ZSmCD6eaXE0",
  authDomain: "safekeeping-f0a78.firebaseapp.com",
  databaseURL: "https://safekeeping-f0a78.firebaseio.com",
  projectId: "safekeeping-f0a78",
  storageBucket: "gs://safekeeping-f0a78.appspot.com/",
  messagingSenderId: "236378060528"
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    InviterPage,
    MapPage,
    ImagePage,
    AboutPage,
    HomePage,
    IntervalPage,
    GpsPage,
    DetailImgPage,
    TimeoutPage,
    UsersPage,
    FriendsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    InviterPage,
    ImagePage,
    MapPage,
    AboutPage,
    HomePage,
    IntervalPage,
    GpsPage,
    TimeoutPage,
    DetailImgPage,
    UsersPage ,
    FriendsPage   
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeGeocoder,
    BackgroundGeolocation,
    Facebook,
    LocationTrackerProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider, 
    FilePath,
    File,
    FileTransfer,
    FileOpener,
    Camera,
    InAppBrowser,
    SettingProvider,
    LocalNotifications,
    BackgroundMode,
    BackgroundFetch,
    Badge
  ]
})
export class AppModule {}