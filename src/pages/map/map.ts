import { Component , ViewChild, ElementRef} from '@angular/core';
import { IonicPage, Platform ,LoadingController, ToastController, NavController, MenuController, NavParams, AlertController, ModalController, Loading} from 'ionic-angular';
import { HomePage } from '../home/home';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { InviterPage } from '../inviter/inviter';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import firebase from 'firebase';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Storage} from "@ionic/storage";
import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';
declare var google;
@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  public map: any;
  public downUrl: any;
  public captureDataUrl : string;
  public inviteUser: any;
  loading: Loading;    
  public userData: any;
  public isToggled : boolean;
  public power : string = "OFF";
  private tick: any = '00:00:00';
  public Timeout : number;
  public interval : number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public locationTrackerProvider : LocationTrackerProvider,
    public firebaseProvider: FirebaseProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private file: File,
    private fileOpener: FileOpener,
    public loadingCtrl: LoadingController,
    public toaster: ToastController,
    public menu: MenuController,
    private _PLATFORM : Platform,    
    public geolocation : Geolocation,
    private localNotifications: LocalNotifications,
    private storage : Storage, 
    private backgroundFetch: BackgroundFetch
  )
    {
        this.isToggled = false;
        this.startTracking();       
        this.userData = navParams.get("userdata");
        
        if(this.userData != null){        
            this.firebaseProvider.addUser(this.userData);        
        }  
        else if(this.userData == null)
        {            
            this.storage.get('user_auth').then(
                data =>{                           
                    if(data != null) {
                
                        this.firebaseProvider.addUser(data);   
                    }           
            });          
        }
    }  

    ionViewDidLoad() {
        console.log('ionViewDidLoad MapPage');
        this.menu.enable(true, 'safe_menu');
        this.mylocation();
    }

    startTracking(){

        const config: BackgroundFetchConfig = {
            stopOnTerminate: false, // Set true to cease background-fetch from operating after user "closes" the app. Defaults to true.
        };
        this.backgroundFetch.configure(config)
        .then(() => {
            console.log('Background Fetch initialized');             
            this.locationTrackerProvider.startTracking();         
        })
        .catch(e => console.log('Error initializing background fetch', e));       
    }
    
    public updateItem() {
        this.backgroundFetch.start();
        console.log("Toggled: "+ this.isToggled); 
        if(this.isToggled == true)
        {
            this.power = "ON";
            this.firebaseProvider.shareLocation();
            this.locationTrackerProvider.startTracking();
            this.Timeout = this.firebaseProvider.timeout;
            this.timerTick();
            this.presentToast('Location share is started.'); 
        }
        else{
            this.power = "OFF";
            clearInterval(this.firebaseProvider.myInterval);
            clearTimeout(this.interval);
            this.tick = '00:00:00';
            this.presentToast('Location share is stopped.'); 
        }
    }

    timerTick() 
    {       
        this.interval = setTimeout(() => {
            if (!this.Timeout ) { return; }
            this.Timeout--;
            this.tick = this.getSecondsAsDigitalClock(this.Timeout );
            
            if (this.Timeout  > 0) {               
                this.timerTick();
            }else{
                clearInterval(this.firebaseProvider.myInterval);
                this.presentToast('Location share is stopped.'); 
                clearTimeout(this.interval);
                return;
            }
        }, 1000);
    }
    
    getSecondsAsDigitalClock(inputSeconds: number) {
        
        var sec_num = parseInt(inputSeconds.toString(), 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var hoursString = '';
        var minutesString = '';
        var secondsString = '';
        hoursString = (hours < 10) ? "0" + hours : hours.toString();
        minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
        secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();
        return hoursString + ':' + minutesString + ':' + secondsString;
    }

    shareTracking(){
        
        if(this.firebaseProvider.myInterval == null || this.firebaseProvider.myInterval.state != "scheduled"){
            let confirm = this.alertCtrl.create({
                title: 'Locatin Share?',
                buttons: [
                    {
                        text: 'No',
                        handler: () => {
                            console.log('Disagree clicked');                            
                        }
                    },
                    {
                        text: 'Yes',
                        handler: () => {
                            this.presentToast('Location share is started.');   
                            this.firebaseProvider.shareLocation();
                            this.locationTrackerProvider.startTracking();
                        }
                    }
                ]
            });
            confirm.present();  
        }   
        else{
            this.showAlert('Location is already is tracking.');
        }
    }

    stopTracking(){
        let confirm = this.alertCtrl.create({
            title: 'Log out?',
            buttons: [
                {
                    text: 'No',
                    handler: function () {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: function () {
                        clearInterval(this.firebaseProvider.myInterval);
                    }
                }
            ]
        });
    }

    mylocation(){
    
        this.geolocation.getCurrentPosition().then((position) => {

            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            let latLng = new google.maps.LatLng(lat, lng);            
            let mapOptions = {
                center: latLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }  
        
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            this.addMarker(lat, lng);
        }).catch((error) => {
            console.log('Error getting location', error);
        });   
    }

    loadMap(){
    
        let latLng = new google.maps.LatLng(this.locationTrackerProvider.lat, this.locationTrackerProvider.lng);        
        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }  

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.addMarker(this.locationTrackerProvider.lat, this.locationTrackerProvider.lng);
    }

    addMarker(lat, lng)
    {  
        var marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: {lat: lat, lng: lng}
        });
        
        if(this.firebaseProvider.location_track != null)
        {
            let content = this.firebaseProvider.location_track.position;            
            this.addInfoWindow(marker, content);      
        }
    }

    addInfoWindow(marker, content)
    {
        let infoWindow = new google.maps.InfoWindow({
            content: content
        });
        
        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
        });      
    }

    myPosition()
    {
        let image = {
            url:  this.firebaseProvider.userData.picture,
            size: new google.maps.Size(96, 96),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 110),
            scaledSize: new google.maps.Size(60, 60),
        };
        var marker = new google.maps.Marker({
            map: this.map,
            icon: image,
            animation: google.maps.Animation.DROP,
            position: {lat: this.locationTrackerProvider.lat, lng: this.locationTrackerProvider.lng}
        });

        if(this.firebaseProvider.location_track != null){
            let content = this.firebaseProvider.location_track.position;   
            let infoWindow = new google.maps.InfoWindow({
                content: content
            });
            infoWindow.open(this.map, marker);
        }    
    }

    positionMarkers(){

        let profileModal = this.modalCtrl.create(InviterPage, { title: "Invite" });
        profileModal.present();
        var that = this;
        profileModal.onDidDismiss(data => {
            if (data) {
                
                var query = firebase.database().ref("location_tracks/"+ data.username ).orderByKey();
                query.once("value").then(function(snapshot) {
                    
                    if(snapshot.val() != null){
                        snapshot.forEach(function(childSnapshot) 
                        {                            
                            let latLng = new google.maps.LatLng(childSnapshot.val().latitude, childSnapshot.val().longitude);                                    
                            let mapOptions = {
                                center: latLng,
                                zoom: 15,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            }                      
                            that.map = new google.maps.Map(that.mapElement.nativeElement, mapOptions);
                            return;
                        });
                    
                        snapshot.forEach(function(childSnapshot) 
                        {
                            var locate = {
                                lat : childSnapshot.val().latitude,
                                lng : childSnapshot.val().longitude,                           
                            }   
                            that.markers(locate);
                        });
                    }
                    else{
                        that.showAlert('Tracking Info nothing.');
                    }
                });
            }
        });             
    }

    markers(locate){
        console.log(locate);
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: locate
        });     
    }

    inviteList(){

        let profileModal = this.modalCtrl.create(InviterPage, { title: "Invite" });
        profileModal.present();

        profileModal.onDidDismiss(data => {
            if (data) {
                this.inviteUser = data.username;
                console.log(data.username);
                this.createFile();
            }
        });       
    }
        
    public createFile(){
        var that = this;
        var trackings ='';
        var txtUrl = this.inviteUser +' Tracking Information.txt';

        this.file.createFile(this.file.dataDirectory , txtUrl, true).then((res) =>
        {              
            var query = firebase.database().ref("location_tracks/"+ this.inviteUser ).orderByKey();
            query.once("value").then(function(snapshot) 
            {
                console.log(snapshot);
                if(snapshot.val() != null)
                {
                    that.loading = that.loadingCtrl.create({
                        content: 'Downloading...',
                    });
                    that.loading.present();

                    snapshot.forEach(function(childSnapshot) {
                        var str = JSON.stringify(childSnapshot.val()); 
                        trackings = trackings.concat( str);      
                    });

                    that.file.writeExistingFile(that.file.dataDirectory, txtUrl, trackings).then(() =>
                    {
                        that.loading.dismissAll();

                        let confirm = that.alertCtrl.create({
                            title: 'Open location history file?',
                            buttons: [
                            {
                                text: 'No',
                                handler: () => {
                                console.log('Disagree clicked');
                                }
                            },
                            {
                                text: 'Yes',
                                handler: () => {

                                    that.fileOpener.open(that.file.dataDirectory + that.inviteUser +' Tracking Information.txt', 'text/plain')
                                    .then(() =>{
                                    console.log('Opened');
                                    })
                                    .catch(e => console.log('Error opening file', e));
                                }
                            }
                            ]
                        });
                        confirm.present();                    
                    })
                    .catch(e => console.log('Error opening file', e));        
                }
                else{                    
                    that.showAlert('Tracking Info nothing.');
                }                          
            });         
        },
        (error) =>{
            console.log(error);
        });        
    }

    private presentToast(text) {
        
        let toast = this.toaster.create({
            message: text,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    showAlert(text) {

    let alert = this.alertCtrl.create({
    title: 'Warning!',
    subTitle: text,
        buttons: [{
            text: "OK",
        }]
        });
        alert.present();
    }
}
