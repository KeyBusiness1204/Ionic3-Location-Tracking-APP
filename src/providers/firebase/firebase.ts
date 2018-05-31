import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import {  Platform, AlertController,ToastController} from 'ionic-angular';
import firebase from 'firebase';
import 'rxjs/add/operator/map';
import { LocationTrackerProvider } from '../location-tracker/location-tracker';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Storage} from "@ionic/storage";
import { File } from '@ionic-native/file';
import { Http, Headers } from '@angular/http';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Facebook ,FacebookLoginResponse} from '@ionic-native/facebook';
import { Badge } from '@ionic-native/badge';
import { BackgroundMode } from '@ionic-native/background-mode';

declare var cordova: any;

@Injectable()
export class FirebaseProvider {
  public users: any;
  public invites : any;
  public inviter : any;
  public myInterval : any;
  public interval: number;
  public timeout: number;  
  public location_track : any;
  public userName: any;
  public userData: any;
  public storageDirectory : string;
  public badges: number;
  public sendDatas = [];
  public contentHeader = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
  public userEmails: any;
  public friends : any;
  public friendIDs: any;
    constructor(
        public  platform: Platform,
        public afd: AngularFireDatabase,
        public toaster: ToastController,
        public locationTrackerProvider : LocationTrackerProvider,
        public nativeGeocoder: NativeGeocoder,
        private alertCtrl: AlertController,
        private storage : Storage,
        private file: File,
        private localNotifications: LocalNotifications,
        public http : Http,  
        public facebook: Facebook,
        private badge: Badge    ,
         private backgroundMode: BackgroundMode,
    ) 
    {
        this.platform.ready().then(() => {
           
            if(!this.platform.is('cordova')) {
                return false;
            }
            if (this.platform.is('ios')) {
                this.storageDirectory = cordova.file.dataDirectory;
            }
            else if(this.platform.is('android')) {
                this.storageDirectory = cordova.file.externalApplicationStorageDirectory;
            }
        });
         
        this.storage.get('interval').then(
            data =>{                           
                if(data != null)         
                    this.interval = data;                
                if(data == null)
                    this.interval = 60;
            }
        );
  
        this.storage.get('timeout').then(
            data =>{                     
                if(data != null)         
                    this.timeout = data;                
                if(data == null)
                    this.timeout = 43200;
            }
        );  
    }

    emailSend(){
        var that = this;
        var trackings = '';
        var query = firebase.database().ref("location_tracks/" + this.userData.username).orderByKey();
        query.once("value").then(function (snapshot) {
            if (snapshot.val() != null) {
                snapshot.forEach(function (childSnapshot) {
                    var str = JSON.stringify(childSnapshot.val());
                    trackings = trackings.concat(str);
                });
                that.userEmails = that.userEmails.join(",");
                var emailData = {
                    msg: trackings,
                    from: that.userData.email,
                    to: that.userEmails,
                    subject: 'Location Tracking Information'
                };

                that.http.post('https://safekeeping.io/api/email.php', JSON.stringify(emailData), {
                    headers: that.contentHeader,
                    body: "param=" + JSON.stringify(emailData)
                }).map(res => res.json())
                    .subscribe(
                        data=> {
                            console.log("SUCCESS");
                            that.localNotifications.schedule({
                                title: 'Email Send',
                                text: 'Location tracking email is sent.',
                                sound: 'res://platform_default',
                                badge: 1
                            });   
                            that.deleteAllData();
                    },err=>{
                        console.log("ERROR");
                    });
            }
            else {
                that.showAlert('Tracking nothing.');
            }
        });
    }
        
    addlocation(location) {
        
        this.afd.list('/location_tracks/'+this.userData.username).push(location);  //CHANGE!!!
    }

    addUser(user){
       
        this.userData = user;
        this.addFriends(user.username);   //friend add

        var starCountRef = firebase.database().ref('app_users/');
        this.users = new Array();
        this.userEmails = new Array();
        var that = this;

        var query = firebase.database().ref("app_users").orderByKey();
        query.once("value").then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                that.users.push(childSnapshot.val().username);  
                that.userEmails.push(childSnapshot.val().email);
            });
            
            if(that.users.indexOf(user.username) == -1)   {
                
                that.afd.list('/app_users/').push(user);
            }    
             // Notification
            // starCountRef.on("child_removed", function(snapshot) {
            //     var deletedPost = snapshot.val();
            //     console.log("DELETED");console.log(deletedPost);
            // });
            
            starCountRef.limitToLast(1).on('child_added', function (snapshot) {
                var addUser = snapshot.val();
                if (that.userData.username != addUser.username && that.friendIDs.indexOf(addUser.id) != -1 ) {
                    var text = addUser.username + ' have accepted your Friend request.';
                    that.localNotifications.schedule({
                        title: addUser.username,
                        text: text,
                        sound: 'res://platform_default',
                        badge: 1
                    });
                    that.badge.increase(1);
                }
            });            
        });
    }

    addFriends(username){

        this.friendIDs = new Array();
        var from_friends = new Array();
        var that = this;

        that.facebook.api('me/apprequests?fields=created_time,from', []).then(response => {  
            console.log('Myfrieds:');console.log(response['data']);
            from_friends = response['data'];
      
            from_friends.forEach(function(friend){
                //  that.afd.list('/friends/'+ username).push(friend['from']);  
                 that.friendIDs.push(friend['from']['id']);
            });                               
        });  
    }

    addFriendRuqest(friend_request, myfriend){
        this.friends = new Array();
        var that = this;
        
        var query = firebase.database().ref('/friends/'+ this.userData.username).orderByKey();
        query.once("value").then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                that.friends.push(childSnapshot.val().id); 
            });
            
            if(that.friends.indexOf(myfriend['id']) == -1){        

                that.afd.list('/friends/'+ that.userData.username).push(myfriend);
               
                that.afd.list('app_invites/').push(friend_request);   
                that.presentToast('Friend request sent to '+ myfriend['name']); 
            }else{
                that.presentToast('Already sent.');
            }                       
        });    

        var starCountRef = firebase.database().ref('app_invites/');
        starCountRef.limitToLast(1).on('child_added', function (snapshot) {
            var addUser = snapshot.val();
            if (that.userData.id == addUser['to']['id'] && (that.friends.indexOf(addUser['to']['id']) == -1)) {
                that.afd.list('/friends/'+ that.userData.username).push(addUser['from']);
                var text = addUser['from']['name'] + ' sent Friend request to you.';
                console.log(text);
                that.localNotifications.schedule({
                    title: addUser['from']['name'],
                    text: text,
                    sound: 'res://platform_default',
                    badge: 1
                });
                that.badge.increase(1);
            }
        }); 
    }

    shareLocation(){
    
        var shareTime = 0;
        this.myInterval = setInterval(() => {
            
            shareTime = shareTime + 1;
            if(shareTime <= this.timeout/this.interval){
                var sendTime = this.timeout/this.interval - 3600/this.interval;
                console.log("SendTime");console.log(sendTime);
                if(shareTime == sendTime)
                {
                    this.localNotifications.schedule({
                        title: 'Location Share Notification',
                        text: 'After 1 hour, tracking will be stoped.',
                        sound: 'res://platform_default',
                        badge: 1
                    });
                    this.badge.increase(1);
                    this.emailSend();
                }
                this.nativeGeocoder.reverseGeocode(this.locationTrackerProvider.lat ,this.locationTrackerProvider.lng)
                .then((result: NativeGeocoderReverseResult) => {
                    
                    var pos = JSON.stringify(result['thoroughfare']) +', ' + JSON.stringify(result['locality']) + ' in ' + result.countryName;
                    this.location_track = {
                        "latitude" :this.locationTrackerProvider.lat,
                        "longitude": this.locationTrackerProvider.lng,
                        "position" : pos
                    }                
    
                    this.addlocation(this.location_track);
                })
                .catch((error: any) => console.log(error));  
                console.log("TIME");console.log(shareTime);
            }            
            else{    
                clearInterval(this.myInterval);  
                this.deleteAllData();                          
            }                      
        }, this.interval * 1000);      
    }

    deleteAllData(){
        
        this.removeInvite(this.userData.username);
        this.removePictures();
        this.removeLocalPicFiles();
        this.removeTracking(this.userData.username);
        this.removeLocalTrackingFile();
    }

    removeInvite(user){
        var query = firebase.database().ref("app_invites").orderByKey();
        query.once("value").then(function(snapshot) {
            snapshot.forEach(function(childSnapshot)
            {    
                if(user == childSnapshot.val().from)
                    childSnapshot.ref.remove();        
            });
        });
    }

    imageUrls(imgUrl){

        imgUrl['user'] = this.userData.username;    
        this.afd.list('/image_urls/'+this.userData.username).push(imgUrl);
    }

    removeUser(user_id) {
        var that = this;
        var query = firebase.database().ref('/friends/'+ this.userData.username).orderByKey();
        query.once("value").then(function(snapshot) {
            
            snapshot.forEach(function(childSnapshot) {
                if(childSnapshot.val().id == user_id){
                    childSnapshot.ref.remove();                
                }
            });
        });

        var querylist = firebase.database().ref('/friends/'+ this.userData.username).orderByKey();
        querylist.on('child_removed', function(oldChildSnapshot) {

            that.presentToast(oldChildSnapshot.val().name + " is unfriend.");
           
            // if(oldChildSnapshot.val().id == that.userData.id){
            //    console.log("NOTIFY");console.log(oldChildSnapshot.val().name);
            //     that.localNotifications.schedule({
            //         title: 'Friend Notification',
            //         text: 'You are unfriend.',
            //         sound: 'res://platform_default',
            //         badge: 1
            //     });

            //     var queryRef = firebase.database().ref('/friends/'+ that.userData.username).orderByKey();
            //     queryRef.once("value").then(function(snapshot) {
            //           console.log("NOTIFY ME");
            //         snapshot.forEach(function(childSnapshot) {
            //             if(childSnapshot.val().id == oldChildSnapshot.val().id ){
            //                 childSnapshot.ref.remove();                
            //             }
            //         });
            //     });                
            // }
        });
    }

    removePictures(){

        var that = this;
        var query = firebase.database().ref("image_urls/"+this.userData.username).orderByKey();
        query.once("value").then(function(snapshot) {
            
            snapshot.forEach(function(childSnapshot) {

                childSnapshot.ref.remove();  
                firebase.storage().ref().child(`images/${childSnapshot.val().filename}.jpg`).delete().then(function() {
                    // that.presentToast("Image deleted successfully");
                }).catch(function(error) {
                    that.showAlert("Image delete Error!");
                });         
            });
        });
    }

    removeLocalPicFiles(){

        var that = this;
        var query = firebase.database().ref("image_urls/"+this.userData.username).orderByKey();
        query.once("value").then(function(snapshot) {
            
            snapshot.forEach(function(childSnapshot) { 

                var txtUrl = childSnapshot.val().filename+'.jpg';                
                that.file.removeFile(that.storageDirectory, txtUrl).then((res) =>{ 
                   that.presentToast("Deleted successfully.")
                    // this.downloadImage(imgsource.user);
                });           
            });
        });
    }

    removeLocalTrackingFile(){

        var txtUrl = this.userData.username+' Tracking Information.txt';
        this.file.removeFile(this.storageDirectory, txtUrl).then((res) =>{ 
            this.presentToast('Local Tracking Info deleted.');
        });
    }

    removeTracking(user_nm){
        
        this.afd.list('/location_tracks/'+ user_nm).remove();
        this.showAlert('Shared Tracking Info deleted.')
    }

    showAlert(text) {
        
        let alert = this.alertCtrl.create({
            title: 'Notification!',
            subTitle: text,
            buttons: [{
            text: "OK",
            }]
        });
        alert.present();
    }

    private presentToast(text) {
        
        let toast = this.toaster.create({
            message: text,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }
}
