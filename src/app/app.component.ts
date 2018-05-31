import { Component, ViewChild} from '@angular/core';
import { Platform,ModalController,  MenuController, AlertController, ToastController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { File } from '@ionic-native/file';
import { LocationTrackerProvider } from '../providers/location-tracker/location-tracker';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { ImagePage } from '../pages/image/image';
import { InviterPage } from '../pages/inviter/inviter';
import { MapPage } from '../pages/map/map';
import { AboutPage } from '../pages/about/about';
import { UsersPage} from '../pages/users/users';
import { FriendsPage} from '../pages/friends/friends';
import { Facebook,FacebookLoginResponse} from '@ionic-native/facebook';
import { Storage} from "@ionic/storage";
import { Badge } from '@ionic-native/badge';
import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any  = MapPage;
  pages: Array<{title: string}>;
  public userProfile: any;
  public myfriend: any;
  public friendRequest : any;
  constructor(
    
    platform: Platform,
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    public menu: MenuController,
    public locationTrackerProvider : LocationTrackerProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public firebaseProvider: FirebaseProvider,
    public facebook: Facebook,
    public toaster: ToastController,
    private file: File,  
    private storage : Storage, 
    private badge: Badge,
    private backgroundMode: BackgroundMode
  ) 
  {
    document.addEventListener('resume', () => {            
        this.badge.clear();                          
    });   
    
    platform.ready().then(() => {

        splashScreen.hide();
        statusBar.styleBlackTranslucent();
        this.storage.get('user_auth').then(
            data =>{                           
                if(data != null)         
                    this.rootPage = MapPage;   
                if(data == null)   
                    this.rootPage = LoginPage;       
            }
        );  

        this.backgroundMode.setDefaults({ 
            title: 'Safekeeping', 
            text: 'Active in background...'}
        );
        this.backgroundMode.enable();
    });      
  }

    profile(){        
        this.userProfile = this.firebaseProvider.userData;
    }

    openPage(page) {

        // close the menu when clicking a link from the menu
        this.menu.close();
        if(page == 'Image Share')
        {        
            this.nav.push(ImagePage);
        }
        else if(page == 'Location Track')
        {
            this.nav.push(MapPage);
        }
        else if(page == 'Settings'){
            this.nav.push(HomePage);
        }
        else if(page == 'Add_Friend'){
            this.addFriend();
        }
        else if(page == 'App Invite')
        {
            this.facebookInvite();
        }     
        else if(page == 'About SafeKeeping')
        {
            let linkModal = this.modalCtrl.create( AboutPage, { title: "About us" });
            linkModal.present();
        }  
        else if(page == 'clear'){
            this.deleteTracking();
        }
        else if (page == 'users') {
            this.nav.push(UsersPage);
        }
        else if(page == 'logout'){
            let confirm = this.alertCtrl.create({
                title: 'Log out?',
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
                            clearInterval(this.firebaseProvider.myInterval);
                            this.locationTrackerProvider.stopTracking();

                            this.facebook.logout()
                            .then((res: FacebookLoginResponse) => {                                
                                // this.firebaseProvider.removeUser(this.firebaseProvider.userData.id);
                                this.nav.push(LoginPage);
                            })
                            .catch(e => {
                                console.log(e);
                            }); 
                        }
                    }]
                });
            confirm.present();   
        }
    }

    addFriend()
    {
        var friends = new Array();
        var that = this;

        let profileModal = this.modalCtrl.create(FriendsPage, { title: "Invite" });
        profileModal.present();
        
        profileModal.onDidDismiss(data => {
            if (data) {
                console.log(data);
                this.facebook.api( data +'/apprequests?fields=created_time,from,to', []).then(response => {  
                   
                    friends =  response['data'];
                    friends.forEach(function (friend) {
                        if (friend['from']['id'] == that.firebaseProvider.userData.id){
                            that.friendRequest = friend;
                            that.myfriend = friend['to'];
                        }                          
                    });

                    this.firebaseProvider.addFriendRuqest(this.friendRequest, this.myfriend); 
                });   
            }
        });                      
    }
    
    deleteTracking()
    {
        let confirm = this.alertCtrl.create({
            title: 'Are you sure you want to clear with local files?',
            buttons: [
                {
                    text: 'Yes',
                    handler: () => {
                        this.firebaseProvider.deleteAllData();
                    }
                },
                {
                    text: 'No',
                    handler: () => {
                        this.removeFireDatas();
                    }
                },
                {
                    text: 'Cancel',
                    handler: () => {
                    console.log('Disagree clicked');
                    }
                },
            ]
        });
        confirm.present();
    }

    removeFireDatas(){
        this.firebaseProvider.removeInvite(this.firebaseProvider.userData.username);
        this.firebaseProvider.removePictures();
        this.firebaseProvider.removeTracking(this.firebaseProvider.userData.username);
    }

  public facebookInvite(){
     
    var that = this;
    this.facebook.appInvite({
        url: "https://fb.me/873615869467507",            
        picture: "https://safekeeping.io/SKapp_invite_pic.png"
    })
    .then(
        function(obj){ 
            console.log('REQUEST');console.log(obj);                
            if(obj) {
                if(obj.completionGesture == "cancel") {
                    console.log(" user canceled, bad guy");
                } 
                else{   
                    that.presentToast("Invite successful!");                                                           
                }
            } else {                
                console.log("user just pressed done, bad guy");
            }
        }
    ).catch((error) => 
        function(obj){
            console.log(obj);
        }
    );
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

